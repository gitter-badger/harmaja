import { EventStream, StreamEventType, Observer, StreamEvents, Unsub, EventStreamSeed } from "./abstractions";
import { Dispatcher } from "./dispatcher";
import { globalScope, Scope } from "./scope";

// Note that we could use a Dispatcher as Bus, except for prototype inheritance of EventStream on the way
export class BaseEventStream<V> extends EventStream<V> {
    protected dispatcher = new Dispatcher<StreamEvents<V>>();
    private _scope: Scope;
    constructor(desc: string, scope: Scope) { 
        super(desc) 
        this._scope = scope
    }

    on(event: "value", observer: Observer<V>) {
        return this.dispatcher.on(event, observer)
    }
    scope() {
        return this._scope
    }
}

export function never<A>(): EventStream<A> {
    return new BaseEventStream("never", globalScope)
}

export function interval<V>(delay: number, value: V): EventStreamSeed<V> {
    return new EventStreamSeed(`interval(${delay}, ${value})`, (observer) => {
        const interval = setInterval(() => observer(value), delay)
        return () => clearInterval(interval)
    })
}