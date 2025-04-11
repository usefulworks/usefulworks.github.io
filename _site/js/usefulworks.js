/*
 * Copyright (c) 2025 UsefulWorks Ltd. All Rights Reserved.
 *
 * These files are published under the MIT License.
 */

/*
 * usefulworks.js (version 0.0.2)
 */

// iife wrapper
(function(window, rootContext) {

    // check on context for window/document/node/etc...
    const _con = (window.$environment !== undefined && window.$environment === "production")
        ? noopConsole()
        : window.console;

    // => build (for now, the only context is DOM)

    // ready state (shared)
    let _isReady = false,
        _waitingForReady = [],
        callWhenReady = function(handler) { _waitingForReady.push(handler); },
        doReady = function() {
            while (_waitingForReady.length > 0) {
                handler = _waitingForReady.shift();
                if (typeof handler === "function") {
                    handler.call(this);
                }
            }
        };

    // the base UsefulWorks object is a function; we return a new instance by
    // calling new on its prototype, the function 'UsefulWorks.prototype.init'
    const UsefulWorks = function(selector, context) {
        const ctx = context || rootContext || {};

        // construct
        return new UsefulWorks.p.init(selector, ctx);
    };

    // define UsefulWorks.prototype and assign the alias 'UsefulWorks.p'
    const p = UsefulWorks.p = UsefulWorks.prototype = (function() {
        //
        // 'internal' properties
        //

        // fns to get text out of DOM nodes, indexed by Node.nodeType (5,6 are intentionally skipped)
        const nodeTypeToText = {
            1: n => n.textContent, // Node.ELEMENT_NODE
            2: n => n.value,       // Node.ATTRIBUTE_NODE
            3: n => n.nodeValue,   // Node.TEXT_NODE
            4: n => n.nodeValue,   // Node.CDATA_SECTION_NODE
            7: n => "",            // Node.PROCESSING_INSTRUCTION_NODE
            8: n => "",            // Node.COMMENT_NODE
            9: n => documentElement.textContent, // Node.DOCUMENT_NODE
            10: n => "",           // Node.DOCUMENT_TYPE_NODE
            11: n => n.textContent // Node.DOCUMENT_FRAGMENT_NODE
        }

        const assertThis = function(obj) { // throw an error if obj is not an instance of Usefulworks
            if (!(obj instanceof UsefulWorks)) {
                throw new Error(`function call with wrong this '${obj}'`);
            }
        }

        const filter = function(predicate) { // return filtered array based on predicate(int:index, object:element)
            assertThis(this);
            let ret = [], e = null;
            for(let i = 0; i < this.length; i++) {
                if(predicate(i, this[i])) ret.push(this[i]);
            }
            return ret;
        };

        const elementsOnly = function() { // return array of DOM ELEMENT_NODE only
            assertThis(this);
            return filter.call(this, (i, e) => isElementNode(e));
        };

        // define the prototype object
        const obj = {
            // redefine constructor to have the same name as the object
            constructor: UsefulWorks,
            // custom toString implementation
            get [Symbol.toStringTag]() { return `UsefulWorks v${this.version} len:${this.length} sel:${this.selectorType}`; },
            // version
            get version() { return "0.0.2"; },
            // array-like; number of items
            get length() { return this._length; },
            // string representing how this instance was created
            get selectorType() { return this._selectorType; },
            // adds a css class name to elements in the current selection
            addClass(className) {
                elementsOnly.call(this).forEach(e => e.classList.add(className));
                return this;
            },
            // removes a css class name from elements in the current selection
            removeClass(className) {
                elementsOnly.call(this).forEach(e => e.classList.remove(className));
                return this;
            },
            // replaces a css class name with another on elements in the current selection
            replaceClass(oldClassName, newClassName) {
                elementsOnly.call(this).forEach(e => e.classList.replace(oldClassName, newClassName));
                return this;
            },
            // adds or removes a css class name from elements in the current selection
            toggleClass(className) {
                elementsOnly.call(this).forEach(e => e.classList.toggle(className));
                return this;
            },
            get debug() {
                return UsefulWorks.debug;
            },
            log(args) {
                UsefulWorks.log(args);
            },
            each(delegate) {
                return UsefulWorks.each(this, delegate);
            },
            first() {
                return this._length > 0 ? new UsefulWorks(this[0]) : [];
            },
            last() {
                return this._length > 0 ? new UsefulWorks(this[this._length - 1]) : [];
            },
            even() {
                return this.whereWithIndex((i, e) => (i+1) % 2 == 0);
            },
            odd() {
                return this.whereWithIndex((i, e) => i % 2 == 0);
            },
            on(eventName, handler) {
                this.log("UsefulWorks.on" + eventName);
                this.each((i, e) => e.addEventListener(eventName, handler, false));
                return this;
            },
            off(eventName, handler) {
                this.log("UsefulWorks.off" + eventName);
                // doesn't work with anonymous/arrow functions
                this.each((i, e) => e.removeEventListener(eventName, handler, false));
                return this;
            },
            ready(handler) {
                return UsefulWorks.ready(handler);
            },
            elements() { // is this the best name?
                return this.where(e => isElementNode(e));
            },
            where(predicate, withIndex = false) {
                const p = withIndex ? (index, element) => predicate(index, element)
                                    : (index, element) => predicate(element);
                let results = filter.call(this, p);
                return new UsefulWorks(results);
            },
            whereWithIndex(predicate) {
                return this.where(predicate, true);
            },
            // returns a text (string) representation of this object by concatenating
            // text or text-like nodes with an optional delimiter
            toText(delim = "") {
                if (this._length == 0) return "";
                let texts = [];
                this.each((i, e) => {
                    let n = e.nodeType;
                    if (n && [1,3,4,9,11].includes(n)) {
                        texts.push(nodeTypeToText[n](e));
                    } else {
                        if (isArrayish(e)) {
                            for (let i = 0; i < e.length; i++) texts.push(e[1]);
                        }
                    }
                });
                return texts.join(delim);
            },
            // returns a shallow copy of this object as an array
            toArray() {
            return Array.prototype.slice.call(this);
            },
            // returns a new JS object with the items in this object as properties
            // - the default key for the items is their index in this object
            // - the optional keyDelegate arg enables you to override the default
            //   key generation by supplying a (k,v) => k function that will be applied
            //   to each item, e.g. [default] (0, div) => 0; [custom] (0, div) => div.id
            toObject(keyDelegate) {
                this.log(`UsefulWorks.toObject(${typeof keyDelegate})`);
                let obj = {}, fn = typeof keyDelegate === "function" ? keyDelegate : (k, v) => k;
                this.each((k, v) => obj[fn(k, v)] = v);
                return obj;
            }

        };
        return obj;
    }());

    // init
    const init = UsefulWorks.p.init = (function() {
        // UsefulWorks constructor: build the new UsefulWorks object
        return function (selector, context) {
            this.log(`UsefulWorks.init(): ${typeof selector === "string" ? "[" + selector + "]" : Object.prototype.toString.call(selector)}`);

            this._context = context;
            this._context.selector = selector;
            this._length = 0;
            this._selectorType = null;

            // return empty (consider creating a static empty; not critical path)
            if (selector === null || selector === undefined) {
                return this;
            }

            // figure out what kind of selector we're dealing with
            let selectorType = typeof selector;
            if (selectorType !== "string" && selectorType !== "function") {
                selectorType = (selector.nodeType ? "domelement" : (isArrayish(selector) ? "arrayish" :  selectorType));
            }

            // process the selector
            switch (selectorType) {
                case "string":
                    // CSS selector
                    if (elements = document.querySelectorAll(selector)) {
                        populateWithArrayish.call(this, elements);
                    }
                    break;

                case "function":
                    // shortcut for UsefulWorks(handler) or UsefulWorks.ready(handler)
                    this.ready(selector);
                    break;

                case "domelement": // DOMElement (including window.document)
                case "object": // any other object (including window)
                    populateWithObject.call(this, selector);
                    break;

                case "arrayish":
                    // array-like object
                    populateWithArrayish.call(this, selector);
                    break;

                default:
                    throw new Error(`cannot handle selector type '${selectorType}'`);
                    break;
            }

            this._selectorType = selectorType;
            // return the new instance
            return this;
        }

        // single object
        function populateWithObject(value) {
            this[0] = value;
            this._length = 1;
        }

        // populate this from an array-like value
        function populateWithArrayish(value) {
            let len = value.length;
            for (let i = 0; i < len; i++) {
                this[i] = value[i];
                this._length++;
            }
        }

    }()); //init

    // merge objects in a coalescey way
    // - literal args list is indicative and fluid
    // - intended inputs are:
    //   [deepCopy] (bool)
    //   [target] (obj or UsefulWorks -> dstObj)
    //   [sources...] (objs -> srcObj...)
    const decorate = UsefulWorks.decorate = UsefulWorks.p.decorate = (function(deepCopy, target, sources) {
        return function() {
            const args = arguments, args_n = arguments.length;
            let deep = false, index = 0, dstObj = null;

            // check for [deepCopy] argument
            if (args_n > 0 && typeof args[0] === "boolean") {
                deep = args[0];
                index++;
            }

            // nothing to do (no args or only [deepCopy] arg)
            if (args_n == index) return;

            // if no target supplied => target this)
            if ((args_n - index) == 1) {
                dstObj = UsefulWorks;

            } else {
                dstObj = args[index];
                index++;
            }

            // iterate over the sources
            for (let i = index, srcObj = args[i]; i < args_n; i++) {

                // skip non-null/undefined values
                if (srcObj === null || srcObj === undefined) continue;

                // iterate source object properties
                let dstValue, srcValue, clone;
                for (propName in srcObj) {
                    dstValue = dstObj[propName];
                    srcValue = srcObj[propName];

                    // prevent never-ending loop
                    if (dstObj === srcValue) continue;

                    // deep copy
                    if (deep && srcValue) {
                        clone = null;

                        // ensure cloned value is the same type as the source
                        if (Array.isArray(srcValue)) {
                            clone = dstValue && Array.isArray(dstValue) ? dstValue : [];

                        } else if (isNormalObject(srcValue)) {
                            clone = dstValue && isNormalObject(dstValue) ? dstValue : {};
                        }
                        // recurse
                        dstObj[propName] = clone ? decorate(deep, clone, srcValue) : srcValue;

                    } else if (srcValue !== undefined) {
                        // set the property on dest; skip undefined
                        dstObj[propName] = srcValue;
                    }
                }
            }
            return dstObj;
        };
        // returns true if obj was created using either {} or new Object
        function isNormalObject(obj) {
            if (Object.prototype.toString.call(obj) == "[object Object]") {
                let proto = Object.getPrototypeOf(obj);
                return !proto || !proto.hasOwnProperty || proto.hasOwnProperty( "hasOwnProperty" );
            }
            return false;
        }
    }()); //decorate

    // decorate UsefulWorks top-level with some more functions
    decorate({
        // set a new global alias for the UsefulWorks object on window
        alias(name) {
            if (typeof name === "string") {
                window[name] = UsefulWorks;
            }
        },
        get debug() {
            return _con;
        },
        log(args) {
            _con.log(args);
        },
        // iterates over the current sequence and calls delegate(int:index,obj:item) for array-likes or
        // delegate(object:propertyName,obj:item) on each item
        each(target, delegate) {
            // if only one argument is passed assume that it is the callback
            // and the target is the UsefulWorks object
            if (arguments.length == 1) {
                delegate = target;
                target = this;
            }

            // wrap the callback; use call() to set this=
            function callDelegate(n) {
                return delegate.call(target[n], n, target[n]);
            }

            // iterate over the target; returning false will stop iteration
            if (isArrayish(target)) {
                // as array
                let len = target.length;
                for (let i = 0; i < len; i++) {
                    if (callDelegate(i) === false) break;
                }
            } else {
                // as object
                for (let prop in target) {
                    if (callDelegate(prop) === false) break;
                }
            }
            return target;
        },
        noop() {},
        now() { return window.performance.now() },
        ready(handler) {
            this.log(`UsefulWorks.ready() isReady=${_isReady} handler=${typeof handler}`);
            callWhenReady(handler);
            if (_isReady) { doReady(); }
            return this;
        },
        whatIsThis(thisthis = this) {
            this.log(`whatIsThis: '${typeof thisthis}' => ${thisthis}`);
        }
    });

    // give init function the UsefulWorks prototype for later instantiation
    init.prototype = UsefulWorks.prototype;

    // expose to the global object
    window.UsefulWorks = window.$UW = UsefulWorks;

    // root context
    const _root = UsefulWorks(document);

    //
    // utility functions
    //

    // isArrayish
    function isArrayish(value) {
        function hasLength(len) {
            return typeof len === "number" && len > -1 && len % 1 === 0 && len < 4294967296;
        }
        if (!value || typeof value === "function" || value === window) {
            return false;
        }
        if (Array.isArray(value) || Object.prototype.toString.call(value) === "[object Array]") {
            return true;
        }
        return hasLength(value.length);
    }

    // isDOMElement
    function isElementNode(value) {
        return value && value.nodeType === 1;
    }

    function noopConsole() {
        return {
            assert: () => {},
            clear:  () => {},
            clear:  () => {},
            count:  () => {},
            error:  () => {},
            group:  () => {},
            groupCollapsed: () => {},
            groupEnd:       () => {},
            info:    () => {},
            log:     () => {},
            table:   () => {},
            time:    () => {},
            timeEnd: () => {},
            trace:   () => {},
            warn:    () => {}
        }
    }

    // inner iife: setup window/document ready listeners
    (function() {
        function completed() {
            UsefulWorks.debug.log(`UsefulWorks.completed() by ${this === window ? "window" : "document"}`);
            document.removeEventListener("DOMContentLoaded", completed);
            window.removeEventListener("load", completed);
            _isReady = true;
            doReady();
        }

        // catch cases where $(document).ready() is called after the events have already occurred
        if (document.readyState === "complete") {
            window.setTimeout(UsefulWorks.p.ready);

        } else {
            document.addEventListener("DOMContentLoaded", completed);
            window.addEventListener("load", completed);
        }
    }()); // inner iife


}(window, {})); // outer iife: (window, rootContext);
