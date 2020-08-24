import { h } from "./index"
import * as H from "./index"
import * as B from "baconjs"
import { DOMElement, removeElement } from "./harmaja"

export function testRender<T>(init: T, test: (property: B.Property<T>, set: (v: T) => any) => DOMElement) {
    const bus = new B.Bus<T>()
    const property = bus.toProperty(init)
    const element = test(property, bus.push)
    removeElement(element)
    // Verify that all subscribers are removed on unmount
    expect((property as any).dispatcher.subscriptions.length).toEqual(0)
}

export function htmlOf(element: H.DOMElement) {
    if (element instanceof HTMLElement) {
        return element.outerHTML;
    } else {
        return element.textContent
    }
}