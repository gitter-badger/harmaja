import * as A from "./atom"

describe("Atom", () => {
    describe("Array index lenses", () => {
        it("Views into existing and non-existing indices", () => {
            const a = A.atom([1,2,3])
            expect(a.view(1).get()).toEqual(2)
    
            expect(a.view(3).get()).toEqual(undefined)    
        })
        it("Passes sanity checks", () => {
            const a = A.atom([1,2,3])
            const view = a.view(1)
    
            expect(view.set(2)).toEqual(view)
        })    
        it("Supports removal by setting to undefined", () => {
            const a = A.atom([1,2,3])
            const view = a.view(1)
    
            view.set(undefined)
            expect(a.get()).toEqual([1, 3])            
        })    
    })
    describe("Object key lenses", () => {
        it("Passes sanity checks", () => {
            const a = A.atom({foo: "bar"})
            const view = a.view("foo")
            expect(view.set("qwer")).toEqual(view)
        })    
        it("Manipulates object properties", () => {
            const a = A.atom({foo: "bar"})
            const view = a.view("foo")
            expect(view.get()).toEqual("bar")
        })    
    })

    it("Can be frozen on unwanted values", () => {
        const a = A.atom<string | null>("hello").freezeUnless(a => a !== null)
        a.set("world")
        expect(a.get()).toEqual("world")
        a.set(null)
        expect(a.get()).toEqual("world")
        
        expect(a.set("hello")).toEqual(a)
    })
})