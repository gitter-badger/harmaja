var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
import * as Bacon from "baconjs";
var transientStateStack = [];
/**
 *  Element constructor used by JSX.
 */
export function createElement(type, props) {
    var e_1, _a, e_2, _b;
    var children = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        children[_i - 2] = arguments[_i];
    }
    var flattenedChildren = children.flatMap(flattenChildren);
    if (props && props.children) {
        delete props.children; // TODO: ugly hack, occurred in todoapp example
    }
    if (typeof type == "function") {
        var constructor = type;
        transientStateStack.push({});
        var elements = constructor(__assign(__assign({}, props), { children: flattenedChildren }));
        var element = elements instanceof Array ? elements[0] : elements;
        if (!isDOMElement(element)) {
            if (elements instanceof Array && elements.length == 0) {
                throw new Error("Empty array is not a valid output");
            }
            // Components must return a DOM element. Otherwise we cannot attach mount/unmounts callbacks.
            throw new Error("Expecting an HTML Element or Text node, got " + element);
        }
        var transientState = transientStateStack.pop();
        try {
            for (var _c = __values(transientState.unmountCallbacks || []), _d = _c.next(); !_d.done; _d = _c.next()) {
                var callback = _d.value;
                attachOnUnmount(element, callback);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_1) throw e_1.error; }
        }
        try {
            for (var _e = __values(transientState.mountCallbacks || []), _f = _e.next(); !_f.done; _f = _e.next()) {
                var callback = _f.value;
                attachOnMount(element, callback);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return elements;
    }
    else if (typeof type == "string") {
        return renderElement(type, props, flattenedChildren);
    }
    else {
        console.error("Unexpected createElement call with arguments", arguments);
        throw Error("Unknown type " + type);
    }
}
function flattenChildren(child) {
    if (child instanceof Array)
        return child.flatMap(flattenChildren);
    return [child];
}
function renderElement(type, props, children) {
    var e_3, _a;
    var el = document.createElement(type);
    var _loop_1 = function (key, value) {
        if (value instanceof Bacon.Property) {
            var observable_1 = value;
            attachOnMount(el, function () {
                var unsub = observable_1.skipDuplicates().forEach(function (nextValue) {
                    setProp(el, key, nextValue);
                });
                attachOnUnmount(el, unsub);
            });
        }
        else {
            setProp(el, key, value);
        }
    };
    try {
        for (var _b = __values(Object.entries(props || {})), _c = _b.next(); !_c.done; _c = _b.next()) {
            var _d = __read(_c.value, 2), key = _d[0], value = _d[1];
            _loop_1(key, value);
        }
    }
    catch (e_3_1) { e_3 = { error: e_3_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_3) throw e_3.error; }
    }
    (children || []).map(renderChild).flatMap(toDOMElements).forEach(function (childElement) { return el.appendChild(childElement); });
    return el;
}
function createPlaceholder() {
    return document.createTextNode("");
}
var counter = 1;
function renderChild(child) {
    if (typeof child === "string" || typeof child === "number") {
        return document.createTextNode(child.toString());
    }
    if (child === null) {
        return createPlaceholder();
    }
    if (child instanceof Bacon.Property) {
        var myId = counter++;
        var controller_1 = {
            currentElements: [createPlaceholder()]
        };
        var observable_2 = child;
        //console.log(myId + " assuming control over " + debug(controller.currentElements))
        attachController(controller_1, function () { return observable_2.skipDuplicates().forEach(function (nextChildren) {
            var oldElements = controller_1.currentElements;
            controller_1.currentElements = flattenChildren(nextChildren).flatMap(renderChild).flatMap(toDOMElements);
            if (controller_1.currentElements.length === 0) {
                controller_1.currentElements = [createPlaceholder()];
            }
            //console.log("New values", debug(controller.currentElements))
            detachController(oldElements, controller_1);
            replaceMany(oldElements, controller_1.currentElements);
            //console.log(myId + " assuming control over " + debug(controller.currentElements))
            attachController(controller_1);
        }); });
        return controller_1.currentElements;
    }
    if (isDOMElement(child)) {
        return child;
    }
    throw Error(child + " is not a valid element");
}
function isDOMElement(child) {
    return child instanceof Element || child instanceof Text;
}
function setProp(el, key, value) {
    if (key === "ref") {
        if (typeof value !== "function") {
            throw Error("Expecting ref prop to be a function, got " + value);
        }
        var refFn_1 = value;
        attachOnMount(el, function () { return refFn_1(el); });
        return;
    }
    if (key.startsWith("on")) {
        key = key.toLowerCase();
    }
    if (key === "style") {
        var styles = Object.entries(value)
            .filter(function (_a) {
            var _b = __read(_a, 2), key = _b[0], value = _b[1];
            return key !== "";
        })
            .map(function (_a) {
            var _b = __read(_a, 2), key = _b[0], value = _b[1];
            return toKebabCase(key) + ": " + value + ";";
        })
            .join("\n");
        el.setAttribute("style", styles);
    }
    else {
        el[key] = value;
    }
}
function toKebabCase(inputString) {
    return inputString.split('').map(function (character) {
        if (character == character.toUpperCase()) {
            return '-' + character.toLowerCase();
        }
        else {
            return character;
        }
    })
        .join('');
}
function getTransientState(forMethod) {
    if (transientStateStack.length == 0) {
        throw Error("Illegal " + forMethod + " call outside component constructor call");
    }
    return transientStateStack[transientStateStack.length - 1];
}
function maybeGetNodeState(node) {
    var nodeAny = node;
    return nodeAny.__h;
}
function getNodeState(node) {
    var nodeAny = node;
    if (!nodeAny.__h) {
        var state = {};
        nodeAny.__h = state;
    }
    return nodeAny.__h;
}
/**
 *  Mounts the given element to the document, replacing the given root element.
 *
 *  - Causes the component to be activated, i.e. to start listening to observables
 *  - `onMount` callbacks will be called
 *  - `onMountEvent` will be triggered
 */
export function mount(harmajaElement, root) {
    replaceMany([root], harmajaElement);
}
/**
 *  Unmounts the given element, removing it from the DOM.
 *
 *  - Causes the component to be deactivated, i.e. to stop listening to observables
 *  - `onUnmount` callbacks will be called
 *  - `onUnmountEvent` will be triggered
 */
export function unmount(harmajaElement) {
    removeElement(harmajaElement);
}
/**
 *  Add onMount callback. Called once after the component has been mounted on the document.
 *  NOTE: Call only in component constructors. Otherwise will not do anything useful.
 */
export function onMount(callback) {
    var transientState = getTransientState("onMount");
    if (!transientState.mountCallbacks)
        transientState.mountCallbacks = [];
    transientState.mountCallbacks.push(callback);
}
/**
 *  Add onUnmount callback. Called once after the component has been unmounted from the document.
 *  NOTE: Call only in component constructors. Otherwise will not do anything useful.
 */
export function onUnmount(callback) {
    var transientState = getTransientState("onUnmount");
    if (!transientState.unmountCallbacks)
        transientState.unmountCallbacks = [];
    transientState.unmountCallbacks.push(callback);
}
/**
 *  The onMount event as EventStream, emitting a value after the component has been mounted to the document.
 *  NOTE: Call only in component constructors. Otherwise will not do anything useful.
 */
export function mountEvent() {
    var transientState = getTransientState("mountEvent");
    if (!transientState.mountE) {
        var event_1 = new Bacon.Bus();
        onMount(function () {
            event_1.push();
            event_1.end();
        });
        transientState.mountE = event_1;
    }
    return transientState.mountE;
}
/**
 *  The onUnmount event as EventStream, emitting a value after the component has been unmounted from the document.
 *  NOTE: Call only in component constructors. Otherwise will not do anything useful.
 */
export function unmountEvent() {
    var transientState = getTransientState("unmountEvent");
    if (!transientState.unmountE) {
        var event_2 = new Bacon.Bus();
        onUnmount(function () {
            event_2.push();
            event_2.end();
        });
        transientState.unmountE = event_2;
    }
    return transientState.unmountE;
}
export function callOnMounts(element) {
    var e_4, _a, e_5, _b;
    //console.log("onMounts in " + debug(element) + " mounted=" + getNodeState(element).mounted)
    var state = getNodeState(element);
    if (state.mounted) {
        return;
    }
    if (state.unmounted) {
        throw new Error("Component re-mount not supported");
    }
    state.mounted = true;
    if (state.onMounts) {
        try {
            for (var _c = __values(state.onMounts), _d = _c.next(); !_d.done; _d = _c.next()) {
                var sub = _d.value;
                sub();
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_4) throw e_4.error; }
        }
    }
    try {
        for (var _e = __values(element.childNodes), _f = _e.next(); !_f.done; _f = _e.next()) {
            var child = _f.value;
            callOnMounts(child);
        }
    }
    catch (e_5_1) { e_5 = { error: e_5_1 }; }
    finally {
        try {
            if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
        }
        finally { if (e_5) throw e_5.error; }
    }
}
function callOnUnmounts(element) {
    var e_6, _a, e_7, _b;
    var state = getNodeState(element);
    if (!state.mounted) {
        return;
    }
    if (state.onUnmounts) {
        try {
            for (var _c = __values(state.onUnmounts), _d = _c.next(); !_d.done; _d = _c.next()) {
                var unsub = _d.value;
                //console.log("Calling unsub in " + debug(element))
                unsub();
            }
        }
        catch (e_6_1) { e_6 = { error: e_6_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_6) throw e_6.error; }
        }
    }
    try {
        for (var _e = __values(element.childNodes), _f = _e.next(); !_f.done; _f = _e.next()) {
            var child = _f.value;
            //console.log("Going to child " + debug(child) + " mounted=" + getNodeState(child).mounted)
            callOnUnmounts(child);
        }
    }
    catch (e_7_1) { e_7 = { error: e_7_1 }; }
    finally {
        try {
            if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
        }
        finally { if (e_7) throw e_7.error; }
    }
    state.mounted = false;
    state.unmounted = true;
}
function attachOnMount(element, onMount) {
    if (typeof onMount !== "function") {
        throw Error("not a function: " + onMount);
    }
    var state = getNodeState(element);
    if (!state.onMounts) {
        state.onMounts = [];
    }
    state.onMounts.push(onMount);
}
function attachOnUnmount(element, onUnmount) {
    if (typeof onUnmount !== "function") {
        throw Error("not a function: " + onUnmount);
    }
    var state = getNodeState(element);
    if (!state.onUnmounts) {
        state.onUnmounts = [];
    }
    if (state.onUnmounts.includes(onUnmount)) {
        //console.log("Duplicate")
        return;
    }
    state.onUnmounts.push(onUnmount);
}
function detachOnUnmount(element, onUnmount) {
    var state = maybeGetNodeState(element);
    if (state === undefined || !state.onUnmounts) {
        return;
    }
    for (var i = 0; i < state.onUnmounts.length; i++) {
        if (state.onUnmounts[i] === onUnmount) {
            state.onUnmounts.splice(i, 1);
            return;
        }
    }
}
function detachOnUnmounts(element) {
    var state = maybeGetNodeState(element);
    if (state === undefined || !state.onUnmounts) {
        return [];
    }
    var unmounts = state.onUnmounts;
    //console.log("Detaching " + state.onUnmounts.length + " unmounts")
    delete state.onUnmounts;
    return unmounts;
}
function detachController(oldElements, controller) {
    var e_8, _a;
    var _b;
    try {
        for (var oldElements_1 = __values(oldElements), oldElements_1_1 = oldElements_1.next(); !oldElements_1_1.done; oldElements_1_1 = oldElements_1.next()) {
            var el = oldElements_1_1.value;
            var state = getNodeState(el);
            //console.log("Detach controller from " + debug(el))
            var index = (_b = state.controllers) === null || _b === void 0 ? void 0 : _b.indexOf(controller);
            if (index === undefined || index < 0) {
                throw Error("Controller not attached to " + el);
            }
            // Not removing controller from list. Even though the element is discarded, it's still not ok to
            // attach other controllers to it.        
        }
    }
    catch (e_8_1) { e_8 = { error: e_8_1 }; }
    finally {
        try {
            if (oldElements_1_1 && !oldElements_1_1.done && (_a = oldElements_1.return)) _a.call(oldElements_1);
        }
        finally { if (e_8) throw e_8.error; }
    }
    if (controller.unsub)
        detachOnUnmount(oldElements[0], controller.unsub);
}
function attachController(controller, bootstrap) {
    var _loop_2 = function (i) {
        var el = controller.currentElements[i];
        var state = getNodeState(el);
        // Checking for double controllers    
        if (!state.controllers) {
            state.controllers = [controller];
            //console.log("Attach first controller to " + debug(el) + " (now with " + state.controllers.length + ")")
        }
        else if (state.controllers.includes(controller)) {
            //console.log("Skip duplicate controller to " + debug(el) + " (now with " + state.controllers.length + ")")
        }
        else if (state.controllers.length > 0) {
            throw Error("Element " + debug(el) + " is already controlled. Please mind that the following combinations are not currently supported:\n  - Embedding an observable, which has a wrapped Observable as value\n  - Returning an observable from the renderObservable/renderAtom function in ListView\n  - Returning a ListView from an embedded Observable\n");
        }
        else {
            //console.log("Attach controller to " + debug(el) + " (now with " + state.controllers.length + ")")
            state.controllers.push(controller);
        }
        // Sub/unsub logic                
        if (i == 0) {
            if (bootstrap) {
                if (state.mounted) {
                    throw Error("Unexpected: Component already mounted");
                }
                else {
                    attachOnMount(el, function () {
                        var unsub = bootstrap();
                        controller.unsub = unsub;
                        el = controller.currentElements[0]; // may have changed in bootstrap!                        
                        attachOnUnmount(el, controller.unsub);
                    });
                }
            }
            if (controller.unsub) {
                attachOnUnmount(el, controller.unsub);
            }
        }
    };
    for (var i = 0; i < controller.currentElements.length; i++) {
        _loop_2(i);
    }
}
function replaceElement(oldElement, newElement) {
    var _a;
    var wasMounted = (_a = maybeGetNodeState(oldElement)) === null || _a === void 0 ? void 0 : _a.mounted;
    if (wasMounted) {
        callOnUnmounts(oldElement);
    }
    if (!oldElement.parentElement) {
        //console.warn("Parent element not found for", oldElement, " => fail to replace")
        return;
    }
    oldElement.parentElement.replaceChild(newElement, oldElement);
    //console.log("Replaced " + debug(oldElement) + " with " + debug(newElement) + " wasMounted=" + wasMounted)
    if (wasMounted) {
        callOnMounts(newElement);
    }
}
function replaceMany(oldContent, newContent) {
    var e_9, _a, e_10, _b;
    var oldNodes = toDOMElements(oldContent);
    var newNodes = toDOMElements(newContent);
    if (oldNodes.length === 0)
        throw new Error("Cannot replace zero nodes");
    if (newNodes.length === 0)
        throw new Error("Cannot replace with zero nodes");
    try {
        for (var oldNodes_1 = __values(oldNodes), oldNodes_1_1 = oldNodes_1.next(); !oldNodes_1_1.done; oldNodes_1_1 = oldNodes_1.next()) {
            var node = oldNodes_1_1.value;
            callOnUnmounts(node);
        }
    }
    catch (e_9_1) { e_9 = { error: e_9_1 }; }
    finally {
        try {
            if (oldNodes_1_1 && !oldNodes_1_1.done && (_a = oldNodes_1.return)) _a.call(oldNodes_1);
        }
        finally { if (e_9) throw e_9.error; }
    }
    oldNodes[0].parentElement.replaceChild(newNodes[0], oldNodes[0]);
    for (var i = 1; i < oldNodes.length; i++) {
        oldNodes[i].remove();
    }
    for (var i = 1; i < newNodes.length; i++) {
        newNodes[i - 1].after(newNodes[i]);
    }
    try {
        for (var newNodes_1 = __values(newNodes), newNodes_1_1 = newNodes_1.next(); !newNodes_1_1.done; newNodes_1_1 = newNodes_1.next()) {
            var node = newNodes_1_1.value;
            callOnMounts(node);
        }
    }
    catch (e_10_1) { e_10 = { error: e_10_1 }; }
    finally {
        try {
            if (newNodes_1_1 && !newNodes_1_1.done && (_b = newNodes_1.return)) _b.call(newNodes_1);
        }
        finally { if (e_10) throw e_10.error; }
    }
    //console.log("Replaced " + debug(oldContent) + " with " + debug(newContent))
}
function addAfterElement(current, next) {
    current.after(next);
    callOnMounts(next);
}
function toDOMElements(elements) {
    if (elements instanceof Array)
        return elements.flatMap(toDOMElements);
    return [elements];
}
function removeElement(oldElement) {
    if (oldElement instanceof Array) {
        oldElement.forEach(removeElement);
    }
    else {
        callOnUnmounts(oldElement);
        oldElement.remove();
        //console.log("Removed " + debug(oldElement))
    }
}
function appendElement(rootElement, child) {
    var _a;
    rootElement.appendChild(child);
    if ((_a = maybeGetNodeState(rootElement)) === null || _a === void 0 ? void 0 : _a.mounted) {
        callOnMounts(child);
    }
}
export function debug(element) {
    if (element instanceof Array) {
        return element.map(debug).join(",");
    }
    else if (element instanceof Element) {
        return element.outerHTML;
    }
    else {
        return element.textContent || "<empty text node>";
    }
}
export var LowLevelApi = {
    createPlaceholder: createPlaceholder,
    attachOnMount: attachOnMount,
    attachOnUnmount: attachOnUnmount,
    detachOnUnmount: detachOnUnmount,
    detachOnUnmounts: detachOnUnmounts,
    attachController: attachController,
    detachController: detachController,
    appendElement: appendElement,
    removeElement: removeElement,
    addAfterElement: addAfterElement,
    replaceElement: replaceElement,
    replaceMany: replaceMany,
    toDOMElements: toDOMElements
};
