import * as Bacon from "baconjs";
export declare type HarmajaComponent = (props: HarmajaProps) => DOMElement;
export declare type JSXElementType = string | HarmajaComponent;
export declare type HarmajaProps = Record<string, any>;
export declare type HarmajaChild = HarmajaObservableChild | DOMElement | string | number | null;
export declare type HarmajaChildren = (HarmajaChild | HarmajaChildren)[];
export declare type HarmajaChildOrChildren = HarmajaChild | HarmajaChildren;
export declare type HarmajaObservableChild = Bacon.Property<HarmajaChildOrChildren>;
export declare type HarmajaOutput = DOMElement | HarmajaOutput[];
export declare type DOMElement = ChildNode;
/**
 *  Mounts the given element to the document, replacing the given root element.
 *
 *  - Causes the component to be activated, i.e. to start listening to observables
 *  - `onMount` callbacks will be called
 *  - `onMountEvent` will be triggered
 */
export declare function mount(harmajaElement: HarmajaOutput, root: Element): void;
/**
 *  Unmounts the given element, removing it from the DOM.
 *
 *  - Causes the component to be deactivated, i.e. to stop listening to observables
 *  - `onUnmount` callbacks will be called
 *  - `onUnmountEvent` will be triggered
 */
export declare function unmount(harmajaElement: HarmajaOutput): void;
declare type Callback = () => void;
/**
 *  Element constructor used by JSX.
 */
export declare function createElement(type: JSXElementType, props: HarmajaProps, ...children: HarmajaChildren): HarmajaOutput;
/**
 *  Add onMount callback. Called once after the component has been mounted on the document.
 *  NOTE: Call only in component constructors. Otherwise will not do anything useful.
 */
export declare function onMount(callback: Callback): void;
/**
 *  Add onUnmount callback. Called once after the component has been unmounted from the document.
 *  NOTE: Call only in component constructors. Otherwise will not do anything useful.
 */
export declare function onUnmount(callback: Callback): void;
/**
 *  The onMount event as EventStream, emitting a value after the component has been mounted to the document.
 *  NOTE: Call only in component constructors. Otherwise will not do anything useful.
 */
export declare function mountEvent(): Bacon.EventStream<void>;
/**
 *  The onUnmount event as EventStream, emitting a value after the component has been unmounted from the document.
 *  NOTE: Call only in component constructors. Otherwise will not do anything useful.
 */
export declare function unmountEvent(): Bacon.EventStream<void>;
export declare function callOnMounts(element: Node): void;
declare function attachOnMount(element: DOMElement, onMount: Callback): void;
declare function attachOnUnmount(element: DOMElement, onUnmount: Callback): void;
declare function replaceElement(oldElement: ChildNode, newElement: DOMElement): void;
declare function removeElement(oldElement: HarmajaOutput): void;
declare function appendElement(rootElement: DOMElement, child: DOMElement): void;
export declare function debug(element: DOMElement | ChildNode): string | null;
export declare const LowLevelApi: {
    attachOnMount: typeof attachOnMount;
    attachOnUnmount: typeof attachOnUnmount;
    appendElement: typeof appendElement;
    removeElement: typeof removeElement;
    replaceElement: typeof replaceElement;
};
export {};
