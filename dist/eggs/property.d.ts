import { Observer, PropertyEventType, Property, EventStream, PropertyEvents, Unsub } from "./abstractions";
import { Dispatcher } from "./dispatcher";
import { Scope } from "./scope";
export declare abstract class StatefulPropertyBase<V> extends Property<V> {
    protected dispatcher: Dispatcher<PropertyEvents<V>>;
    abstract get(): V;
    constructor(desc: string);
    on(event: PropertyEventType, observer: Observer<V>): import("..").Callback;
}
export declare class DerivedProperty<V> extends Property<V> {
    private sources;
    private combinator;
    constructor(desc: string, sources: Property<any>[], combinator: (...inputs: any[]) => V);
    get(): V;
    private getCurrentArray;
    on(event: PropertyEventType, observer: Observer<V>): () => void;
}
/**
 *  Input source for a StatefulProperty. Returns initial value and supplies changes to observer.
 *  Must skip duplicates!
 **/
export declare type StatefulPropertySource<V> = (propertyAsChangeObserver: Observer<V>) => [V, Unsub];
export declare class StatefulProperty<V> extends StatefulPropertyBase<V> {
    private value;
    constructor(desc: string, scope: Scope, source: StatefulPropertySource<V>);
    get(): V;
}
export declare function map<A, B>(prop: Property<A>, fn: (value: A) => B): Property<B>;
export declare function filter<A>(scope: Scope, prop: Property<A>, predicate: (value: A) => boolean): Property<A>;
export declare function toProperty<A>(scope: Scope, stream: EventStream<A>, initial: A): StatefulProperty<A>;
export declare function scan<A, B>(scope: Scope, stream: EventStream<A>, initial: B, fn: (state: B, next: A) => B): StatefulProperty<B>;
export declare function constant<A>(value: A): Property<A>;
