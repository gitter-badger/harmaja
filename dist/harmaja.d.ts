import * as Bacon from "baconjs";
export declare type HarmajaComponent = (props: HarmajaProps) => DOMElement;
export declare type JSXElementType = string | HarmajaComponent;
export declare type HarmajaProps = Record<string, any>;
export declare type HarmajaChild = HarmajaObservableChild | DOMElement | string | number | null;
export declare type HarmajaObservableChild = Bacon.Property<HarmajaChild>;
export declare type DOMElement = HTMLElement | Text;
export declare function mount(ve: DOMElement, root: HTMLElement): void;
declare type UnmountCallback = Bacon.Unsub;
export declare function createElement(type: JSXElementType, props: HarmajaProps, ...children: (HarmajaChild | HarmajaChild[])[]): DOMElement;
export declare function onUnmount(callback: UnmountCallback): void;
export declare function unmountEvent(): Bacon.EventStream<void>;
export declare function attachUnsub(element: HTMLElement | Text, unsub: Bacon.Unsub): void;
export declare function replaceElement(oldElement: ChildNode, newElement: HTMLElement | Text): void;
export declare function removeElement(oldElement: ChildNode): void;
export {};
