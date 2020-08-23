import * as H from "./index"
import * as B from "baconjs"
import '@testing-library/jest-dom'

describe("Harmaja", () => {
    it("works", () => {
        const el = H.createElement("h1", {})
        expect(el.nodeName).toEqual("H1")
    })

    it("renders observable string as child", () => {
        const atom = H.atom("yes")
        const el = H.createElement("h1", {}, atom)
        expect(htmlOf(el)).toEqual("<h1>yes</h1>")
        atom.set("no")
        expect(htmlOf(el)).toEqual("<h1>no</h1>")
    })

    it("renders observable HTMLElement as child", () => {
        const atom = H.atom(H.createElement("input", { type: "text" }) as HTMLElement | null )
        const el = H.createElement("h1", {}, atom)
        //console.log((el as any).outerHTML)
        expect(htmlOf(el)).toEqual(`<h1><input type="text"></h1>`)
        atom.set(null)
        expect(htmlOf(el)).toEqual(`<h1></h1>`)
    })

    it("renders observable as prop", () => {
        const atom = H.atom("big")
        const el = H.createElement("h1", { className: atom })
        expect(htmlOf(el)).toEqual(`<h1 class="big"></h1>`)
        atom.set("small")
        expect(htmlOf(el)).toEqual(`<h1 class="small"></h1>`)
    })

    function htmlOf(element: H.DOMElement) {
        if (element instanceof HTMLElement) {
            return element.outerHTML;
        } else {
            return element.textContent
        }
    }
})