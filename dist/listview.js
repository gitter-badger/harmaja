import { LowLevelApi as H } from "./harmaja";
export function ListView(props) {
    var observable = ("atom" in props) ? props.atom : props.observable;
    var _a = props.key, key = _a === void 0 ? (function (x) { return x; }) : _a;
    // TODO: would work better if could return multiple elements!
    var rootElement = document.createElement("span");
    var currentValues = null;
    H.attachOnMount(rootElement, function () {
        var unsub = observable.forEach(function (nextValues) {
            if (!currentValues) {
                for (var i = 0; i < nextValues.length; i++) { // <- weird that I need a cast. TS compiler bug?
                    H.appendElement(rootElement, renderItem(key(nextValues[i]), nextValues, i));
                }
            }
            else {
                // TODO: different strategy based on count change:
                // newCount==oldCount => replacement strategy (as implemented not)
                // newCount<oldCOunt => assume removal on non-equality (needs smarter item observable mapping that current index-based one though)
                // newCount>oldCount => assume insertion on non-equality
                for (var i = 0; i < nextValues.length; i++) {
                    var nextItemKey = key(nextValues[i]);
                    if (i >= rootElement.childNodes.length) {
                        //console.log("Append new element for", nextValues[i])
                        H.appendElement(rootElement, renderItem(nextItemKey, nextValues, i));
                    }
                    else if (nextItemKey !== key(currentValues[i])) {
                        //console.log("Replace element for", nextValues[i])
                        H.replaceElement(rootElement.childNodes[i], renderItem(nextItemKey, nextValues, i));
                    }
                    else {
                        //console.log("Keep element for", nextValues[i])
                        // Same item, keep existing element
                    }
                }
                for (var i = currentValues.length - 1; i >= nextValues.length; i--) {
                    //console.log("Remove element for", currentValues[i])
                    H.removeElement(rootElement.childNodes[i]);
                }
            }
            currentValues = nextValues;
        });
        H.attachOnUnmount(rootElement, unsub);
    });
    return rootElement;
    function renderItem(key, values, index) {
        if ("renderAtom" in props) {
            var nullableAtom_1 = props.atom.view(index);
            var nonNullableAtom = nullableAtom_1.freezeUnless(function (a) { return a !== undefined; });
            var removeItem = function () { return nullableAtom_1.set(undefined); };
            return props.renderAtom(key, nonNullableAtom, removeItem);
        }
        if ("renderObservable" in props) {
            return props.renderObservable(key, observable.map(function (items) { return items[index]; }).filter(function (item) { return item !== undefined; }).skipDuplicates());
        }
        return props.renderItem(values[index]);
    }
}
