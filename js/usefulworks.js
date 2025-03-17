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

// iife wrapper to prevent global scope pollution
(function (context, factory) {
    // checks on context for window/document/etc...

    // build
    factory(context);
})(window, function (window) {

    // an array-like length property
    let _length = 0;
    function setLength(l) {
        console.log(`setLength(${l})`);
        _length = l;
    }

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

    // initialize the base UsefulWorks object, which calls
    // the contructor function 'UsefulWorks.fn.init'
    const UsefulWorks = function (selector, context) {
        return new UsefulWorks.fn.init(selector, context);
    };

    // initialise UsefulWorks.prototype and assign the shortcut
    // 'UsefulWorks.fn' to it
    UsefulWorks.fn = UsefulWorks.prototype = {
        // redefine constructor so the contructor name is the same as the object name
        constructor: UsefulWorks,

        // version
        get version() {
            return "0.0.1";
        },
        get length() {
            return _length;
        },
        get text() {
            return this._elements ? this._elements[0].textContent : "";
        },
        each: function (target, callback) {
            console.log("UsefulWorks.each()");

            // if only one argument is passed, assume that it is the callback
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
            console.log("on" + eventName);
            this.each((i, e) => e.addEventListener(eventName, handler, false));
            return this;
        },
        off(eventName, handler) {
            console.log("off" + eventName);
            // doesn't work with anonymous functions; consider the fn-map solution
            this.each((i, e) => e.removeEventListener(eventName, handler, false));
            return this;
        },
        ready(handler) {
            console.log(`UsefulWorks.ready() isReady=${_isReady}`);

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

    // init (context ignored, for now)
    const init = (UsefulWorks.fn.init = function (selector, context) {
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
    });

    // assign UsefulWorks.fn.init prototype to UsefulWorks
    // prototype that contains the API methods
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
    }

    // setup window/document ready listeners
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
