/*
 * Copyright (c) 2025 UsefulWorks Ltd. All Rights Reserved.
 */

/*
 * usefulworks.js
 *
 * v0.0.1
 *
 */

// https://stackoverflow.com/questions/60919267/understanding-how-jquery-works-internally
// https://github.com/AmraniCh/how-jQuery-works/blob/main/jQuery.js

// iife wrapper
(function (context, factory) {
    // checks on context for window/document/etc...

    // build (only context is DOM)
    factory(context);

})(window, function (window) {

    // an array-like length property
    let _length = 0;
    function setLength(len) {
        console.log(`setLength(${len})`);
        _length = len;
    }

    // ready state
    let _isReady = false,
        _waitingForReady = [],
        callWhenReady = function(handler) { _waitingForReady.push(handler); },
        doReady = function() {
            while (_waitingForReady.length > 0) {
                handler = _waitingForReady.shift();
                if (typeof handler === "function") {
                    handler();
                }
            }
        };

    // initialise the base UsefulWorks object, which calls
    // the contructor function 'UsefulWorks.fn.init'
    const UsefulWorks = function (selector, context) {
        return new UsefulWorks.fn.init(selector, context);
    };

    // initialise UsefulWorks.prototype and assign the shortcut
    // 'UsefulWorks.fn' to it
    UsefulWorks.fn = UsefulWorks.prototype = {

        // redefine constructor so the contructor name is the
        // same as the object name
        constructor: UsefulWorks,

        // version
        get version() {
            return "0.0.1";
        },
        // array-like; number of items
        get length() {
            return _length;
        },
        get text() {
            return (this._length > 0 ? this[0].textContent : "");
        },
        each(target, callback) {
            console.log("UsefulWorks.each()");

            // if only one argument is passed assume that it is the callback
            // and the target is the UsefulWorks object
            if (arguments.length === 1) {
                callback = target;
                target = this;
            }

            // define the callback
            function doCallback(index) {
                return callback.call(target[index], index, target[index]);
            }

            // iterate over the target; returning false will stop iteration
            if (isArrayLike(target)) {
                // as array
                let len = target.length;
                for (let i = 0; i < len; i++) {
                    if (doCallback(i) === false) break;
                }
            } else {
                // as object
                for (let prop in target) {
                    if (doCallback(prop) === false) break;
                }
            }
            return target;
        },
        noop() {},
        on(eventName, handler) {
            console.log("UsefulWorks.on" + eventName);
            this.each((i, e) => e.addEventListener(eventName, handler, false));
            return this;
        },
        off(eventName, handler) {
            console.log("UsefulWorks.off" + eventName);
            // doesn't work with anonymous/arrow functions
            this.each((i, e) => e.removeEventListener(eventName, handler, false));
            return this;
        },
        ready(handler) {
            console.log(`UsefulWorks.ready() isReady=${_isReady} handler=${handler}`);

            callWhenReady(handler);
            if (this._isReady) {
                this.doReady();
            }
            return this;
        },

        // the splice function lets UsefulWorks be logged as an array in the console (???)
        splice: Array.prototype.splice,
        toArray() {
            return Array.prototype.slice.call(this);
        },
    };

    // init
    const init = UsefulWorks.fn.init = function (selector) {
        console.log(`UsefulWorks.init(): ${selector}`);

        if (!selector) {
            return this;
        }

        switch (typeof selector) {
            case "string":
                // CSS selector
                let i = 0,
                    len = 0,
                    elements = document.querySelectorAll(selector);
                console.log(elements);
                if (elements) {
                    setLength(len);
                    for (j = elements.length; i < j; i++) {
                        this[i] = elements[i];
                        setLength(++len);
                    }
                }
                break;

            case "function":
                // shortcut for doc.ready handler; if already ready call immediately otherwise queue
                // for call when ready
                // e.g this.ready ? selector(this) : this.ready(selector);
                break;

            default:
                // DOMElement
                if (selector.nodeType) {
                    this[0] = selector;
                    setLength(1);
                    break;
                }
        }
        return this;
    };

    // merge objects in a mergey way
    UsefulWorks.coalesce = UsefulWorks.fn.coalesce = function(target, sources) { // [ deep copy ?!? ]
        console.log("UsefulWorks.coalesce()");

        const args   = arguments,
              args_n = arguments.length;

        // nothing to do
        if (args_n == 0) return;

        // re-jig target and sources based on args; default (no target => this)
        if (args_n == 1) {
            sources = target;
            target = ( typeof target === "object" || typeof target === "function" ? target : {} );
        }

        // borrowed from jQuery.extend()
        for (let i, source = args[i]; i < args_n; i++ ) {

            // skip non-null/undefined values
            if (source == null ) continue

            // iterate source object properties
            for (prop in source ) {
                let copy = source[prop];

                // jQ: prevent Object.prototype pollution
                // jQ: prevent never-ending loop
                if ( prop === "__proto__" || target === copy ) {
                    continue;
                }

                //---

                // [ deep here ] eecurse if we're merging plain objects or arrays
                if (copy && ( jQuery.isPlainObject( copy ) ||
                    ( copyIsArray = Array.isArray( copy ) ) ) ) {
                    src = target[ name ];

                    // Ensure proper type for the source value
                    if ( copyIsArray && !Array.isArray( src ) ) {
                        clone = [];
                    } else if ( !copyIsArray && !jQuery.isPlainObject( src ) ) {
                        clone = {};
                    } else {
                        clone = src;
                    }
                    copyIsArray = false;

                    // Never move original objects, clone them
                    target[prop] = jQuery.extend( deep, clone, copy );

                // Don't bring in undefined values
                } else if ( copy !== undefined ) {
                    target[prop] = copy;
                }
            }
        }
        return this;
    };

    // give init function the UsefulWorks prototype for later instantiation
    init.prototype = UsefulWorks.prototype;

    // expose to the global object
    window.UsefulWorks = window.u_w = UsefulWorks;

    // root context
    const _root = UsefulWorks(document);

    //
    // utility functions
    //

    // isArrayLike
    function isArrayLike(value) {
        function hasLength(len) {
            return typeof len === "number" && len > -1 && len % 1 === 0 && len < 4294967296;
        }
        if (!value || typeof value === "function" || value === window) {
            return false;
        }
        if (Object.prototype.toString.call(value) === "[object Array]") {
            return true;
        }
        return hasLength(value.length);
    }

    // merge
    function merge(arr1, arr2) {
        return this;
    }

    // inner iife: setup window/document ready listeners
    (function() {
        function completed() {
            console.log(`UsefulWorks.completed() ${this === window ? "window" : "document"}`);
            document.removeEventListener("DOMContentLoaded", completed);
            window.removeEventListener("load", completed);
            _isReady = true;
            UsefulWorks.fn.ready();
        }

        // catch cases where $(document).ready() is called after the events have already occurred
        if (document.readyState === "complete") {
            window.setTimeout(UsefulWorks.fn.ready);

        } else {
            document.addEventListener("DOMContentLoaded", completed);
            window.addEventListener("load", completed);
        }
        console.log("UsefulWorks(): ready listeners listening");
    }());

    // expose ourself
    console.log("iife end");
});
