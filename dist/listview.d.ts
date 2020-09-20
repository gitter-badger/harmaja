import * as Bacon from "baconjs";
import { HarmajaOutput } from "./harmaja";
import { Atom } from "./atom";
export declare type ListViewProps<A, K = A> = {
    observable: Bacon.Property<A[]>;
    renderObservable: (key: K, x: Bacon.Property<A>) => HarmajaOutput;
    getKey: (x: A) => K;
} | {
    observable: Bacon.Property<A[]>;
    renderItem: (x: A) => HarmajaOutput;
    getKey?: (x: A) => K;
} | {
    atom: Atom<A[]>;
    renderAtom: (key: K, x: Atom<A>, remove: () => void) => HarmajaOutput;
    getKey: (x: A) => K;
};
export declare function ListView<A, K>(props: ListViewProps<A, K>): ChildNode[];