import { EventStream, Observer, Property, PropertyEvents, PropertyEventType, PropertySeed, Unsub } from "./abstractions";
import { Dispatcher } from "./dispatcher";
import { never } from "./eventstream";
import { beforeScope, checkScope, globalScope, OutOfScope, Scope } from "./scope";
import { duplicateSkippingObserver } from "./util";

export abstract class StatefulPropertyBase<V> extends Property<V> {
    protected dispatcher = new Dispatcher<PropertyEvents<V>>();
    abstract get(): V

    constructor(desc: string) {
        super(desc)
    }

    on(event: PropertyEventType, observer: Observer<V>) {
        const unsub = this.dispatcher.on(event, observer)
        if (event === "value") {
            observer(this.get())
        }
        return unsub
    }
}

export class DerivedProperty<V> extends Property<V> {
    private sources: Property<any>[];
    private combinator: (...inputs: any[]) => V;
    
    constructor(desc: string, sources: Property<any>[], combinator: (...inputs: any[]) => V) {
        super(desc)
        this.sources = sources;
        this.combinator = combinator;
    }

    get(): V {
        return this.combinator(...this.getCurrentArray())
    }

    private getCurrentArray(): any[] {
        return this.sources.map(s => s.get())
    }

    on(event: PropertyEventType, observer: Observer<V>) {
        const unsubs = this.sources.map((src, i) => {
            return src.on("change", newValue => {
                currentArray[i] = newValue
                statefulObserver(this.combinator(...currentArray))
            })
        })        
        let currentArray = this.getCurrentArray()
        let initial = this.combinator(...currentArray)
        const statefulObserver = duplicateSkippingObserver(initial, observer)

        if (event === "value") {
            observer(initial)
        }
        return () => {
            unsubs.forEach(f => f())
        }
    }
    scope() {
        if (this.sources.length === 0) return globalScope
        return this.sources[0].scope()
    }
}

export class StatefulProperty<V> extends StatefulPropertyBase<V> {
    private _scope: Scope
    private value: V | OutOfScope  = beforeScope
    constructor(seed: PropertySeed<V>, scope: Scope) {
        super(seed.desc)
        this._scope = scope
        
        const meAsObserver = (newValue: V) => {
            if (newValue !== this.value) {
                this.value = newValue
                this.dispatcher.dispatch("change", newValue)
                this.dispatcher.dispatch("value", newValue)
            }
        }
        scope(
            () => {
                const [newValue, unsub] = seed.forEach(meAsObserver)
                this.value = newValue
                return unsub
            },
            this.dispatcher
        );
    }
    get(): V {
        return checkScope(this, this.value)
    }

    scope() {
        return this._scope
    }
}

export function toProperty<A>(scope: Scope, stream: EventStream<A>, initial: A) {
    const forEach = (propertyAsChangeObserver: Observer<A>) => {        
        return [initial, stream.on("value", propertyAsChangeObserver)] as any
    }    
    const seed = new PropertySeed(stream + `.toProperty(${initial})`, forEach)
    return new StatefulProperty<A>(seed, scope);
}

export function constant<A>(value: A): Property<A> {
    return toProperty(globalScope, never(), value)
}