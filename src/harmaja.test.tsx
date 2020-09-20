import { h, mount, mountEvent, onMount, onUnmount, unmount, unmountEvent } from "./index"
import * as H from "./index"
import { htmlOf, testRender } from "./test-utils"
import { HarmajaOutput } from "./harmaja"
import { ListView } from "./listview"
import * as B from "baconjs"

function body() {
    let body = <body/>
    let document = <html>{body}</html>
    return body as Element
}

describe("Harmaja", () => {
    it("Creating elements without JSX", () => {
        const el = H.createElement("h1", {}, "yes")
        expect(htmlOf(el)).toEqual("<h1>yes</h1>")
    })

    it("Lifecycle hooks", () => {
        let unmountCalled = 0    
        let mountCalled = 0
        const Component = () => {
            onUnmount(() => unmountCalled++)
            onMount(() => mountCalled++)
            unmountEvent().forEach(() => unmountCalled++)
            mountEvent().forEach(() => mountCalled++)
            return <div>Teh component</div>
        }
        const el = <Component/>
        expect(unmountCalled).toEqual(0)
        expect(mountCalled).toEqual(0)
        mount(el, body())
        expect(unmountCalled).toEqual(0)
        expect(mountCalled).toEqual(2) // 2 because both callback and eventstream
        unmount(el)
        expect(unmountCalled).toEqual(2)
        expect(mountCalled).toEqual(2)

        expect(() => mount(el, body())).toThrow("Component re-mount not supported")
    })

    it("Supports refs", () => {
        let reffed: HTMLSpanElement | null = null;
        let span = <span id="x" ref={input => { reffed = input }}>Hello</span>
        let el = <div>{span}</div>
        expect(reffed).toEqual(null)
        mount(el, body())
        expect(reffed).toEqual(span)
        expect(() => <span id="x" ref="not-a-function"/>).toThrow("Expecting ref prop to be a function, got not-a-function")
    })

    it("Creating elements with JSX", () => {
        const el = <h1>yes</h1>
        expect(htmlOf(el)).toEqual("<h1>yes</h1>")
    })

    it("Rendering observable string as child", () => testRender("yes", (value, set) => {
        const el = <h1>{value}</h1>
        expect(htmlOf(el)).toEqual("<h1>yes</h1>")
        set("no")
        expect(htmlOf(el)).toEqual("<h1>no</h1>")
        set("definitely")
        expect(htmlOf(el)).toEqual("<h1>definitely</h1>")
        return el
    }))

    it("renders observable HTMLElement as child", () => testRender(<input type="text"/> as HarmajaOutput | null, (value, set) => {
        const el = <h1>{value}</h1>
        //console.log((el as any).outerHTML)
        expect(htmlOf(el)).toEqual(`<h1><input type="text"></h1>`)
        set(null)
        expect(htmlOf(el)).toEqual(`<h1></h1>`)
        set(<input type="checkbox"/>)
        expect(htmlOf(el)).toEqual(`<h1><input type="checkbox"></h1>`)
        return el
    }))

    it("renders observable as prop", () => testRender("big", (value, set) => {
        const el = <h1 className={value}></h1>
        expect(htmlOf(el)).toEqual(`<h1 class="big"></h1>`)
        set("small")
        expect(htmlOf(el)).toEqual(`<h1 class="small"></h1>`)
        set("yuuuge")
        expect(htmlOf(el)).toEqual(`<h1 class="yuuuge"></h1>`)
        return el
    }))

    it("Accepted and rejected child types", () => {
        expect(htmlOf(<h1>{"asdf"}</h1>)).toEqual(`<h1>asdf</h1>`)
        expect(htmlOf(<h1>{42}</h1>)).toEqual(`<h1>42</h1>`)
        expect(htmlOf(<h1>{null}</h1>)).toEqual(`<h1></h1>`)
        expect(htmlOf(<h1>{["hell", "yeah"]}</h1>)).toEqual(`<h1>hellyeah</h1>`)
        expect(htmlOf(<h1>{["hell", <br/>]}</h1>)).toEqual(`<h1>hell<br></h1>`)
        expect(() => (<h1>{undefined}</h1>)).toThrow("undefined is not a valid element")
        expect(() => (<h1>{true}</h1>)).toThrow("true is not a valid element")
        expect(() => (<h1>{new Date()}</h1>)).toThrow()
        expect(() => (<h1>{({})}</h1>)).toThrow()
    })

    it("Deals with multiple elements from component function", () => {
        const Component = ({ things }: { things: string[] }) => things.map(t => <ul>{t}</ul>)
        expect(htmlOf(<Component things={["a", "b", "c"]}/>)).toEqual("<ul>a</ul><ul>b</ul><ul>c</ul>")
    })

    it("Replaces multiple elements correctly", () => {
        const Component = ({ things }: { things: H.Atom<string[]> }) => <ul>{things.map(ts => ts.map(t => <li>{t}</li>))}</ul>
        const things = H.atom(["a"])
        expect(htmlOf(<Component things={things}/>)).toEqual("<ul><li>a</li></ul>")
        things.set([])
        expect(htmlOf(<Component things={things}/>)).toEqual("<ul></ul>")
        things.set(["b", "d"])
        expect(htmlOf(<Component things={things}/>)).toEqual("<ul><li>b</li><li>d</li></ul>")
        things.set(["x"])
        expect(htmlOf(<Component things={things}/>)).toEqual("<ul><li>x</li></ul>")
    })

    it("Renders component children", () => {
        const C1 = ({children}:{children?:any}) => <div>{children}</div>
        expect(htmlOf(<C1/>)).toEqual("<div></div>")
        expect(htmlOf(<C1>hello</C1>)).toEqual("<div>hello</div>")
        expect(htmlOf(<C1><a>wat</a>BOOM</C1>)).toEqual("<div><a>wat</a>BOOM</div>")
    })

    describe("Forbidden combos", () => {
        it("Observable-in-observable", () => {
            const inner = H.atom(["a","b"])
            const outer = H.atom([1, inner])
            const c = <div>{outer}</div>
            expect(() => {
                htmlOf(c)
                /*
                // Here's what should happen in case we added nested controller support!
                expect(htmlOf(c)).toEqual("<div>1ab</div>")
                inner.set(["c", "d"])
                expect(htmlOf(c)).toEqual("<div>1cd</div>")
                outer.set([1, 2])
                // Here it fails, as outer fails to replace c and d of which doesn't know about
                expect(htmlOf(c)).toEqual("<div>12</div>")    
                */
            }).toThrow()    
        })

        it ("Observable-in-ListView", () => {
            // Prevented on the compliler level: the following doesn't compile
            /*
            const outer = <ListView 
                observable = { B.constant([1, 2, 3]) }
                renderItem = { item => B.constant(item) }
            />
            */
        })

        it ("ListView-in-Observable", () => {
            const inner = <ListView observable={B.constant([1,2,3])} renderItem={i => <span>i</span>}/>
            const outer = H.atom([0, inner])
            const c = <div>{outer}</div>
            expect(() => {
                htmlOf(c)
                /*
                // Here's what should happen in case we added nested controller support!
                expect(htmlOf(c)).toEqual("<div>0123</div>")
                */
            }).toThrow() 
        })
    })

    // TODO: test for scoping observables to lifecycle
})