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
// https://github.com/jquery/jquery/issues/3444

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
                    handler.call(this);
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
        each(callback) {
            return UsefulWorks.each(this, callback);
        },
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
            return UsefulWorks.ready(handler);
        },
        // the splice function lets UsefulWorks be logged as an array in the console (???)
        splice: Array.prototype.splice,
        toArray() {
            return Array.prototype.slice.call(this);
        },
    };

    // init
    const init = UsefulWorks.fn.init = function (selector, context) {
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
                this.ready(selector);
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
    const coalesce = UsefulWorks.coalesce = UsefulWorks.fn.coalesce = (function(deepCopy, target, sources) {
        return function() {
            const args = arguments, args_n = arguments.length;
            let deep = false, index = 0, dstObj = null;

            // check for [deepCopy] argument
            if (args_n > 0 && typeof args[0] === "boolean") {
                deep = args[0];
                index++;
            }

            // nothing to do (no args or only [deep] arg)
            if (args_n == index) return;

            // if no target supplied => target this)
            if ((args_n - index) == 1) {
                console.log("coalesce: setting default target");
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
                        dstObj[propName] = clone ? coalesce(deep, clone, srcValue) : srcValue;

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
    }()); //coalesce

    // extend UsefulWorks with more functions
    coalesce({
        each(target, callback) {
            console.log("UsefulWorks.each()");

            // if only one argument is passed assume that it is the callback
            // and the target is the UsefulWorks object
            if (arguments.length == 1) {
                callback = target;
                target = this;
            }

            // define the callback
            function doCallback(index) {
                return callback.call(target[index], index, target[index]);
            }

            // iterate over the target; returning false will stop iteration
            if (isArrayish(target)) {
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
        ready(handler) {
            console.log(`UsefulWorks.ready() isReady=${_isReady} handler=${handler}`);
            callWhenReady(handler);
            if (_isReady) { doReady(); }
            return this;
        },
        whatIsThis(thisthis = this) {
            console.log(`whatIsThis = ${thisthis} => ${typeof thisthis}`);
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

    // inner iife: setup window/document ready listeners
    (function() {
        function completed() {
            console.log(`UsefulWorks.completed() by ${this === window ? "window" : "document"}`);
            document.removeEventListener("DOMContentLoaded", completed);
            window.removeEventListener("load", completed);
            _isReady = true;
            doReady();
        }

        // catch cases where $(document).ready() is called after the events have already occurred
        if (document.readyState === "complete") {
            window.setTimeout(UsefulWorks.fn.ready);

        } else {
            document.addEventListener("DOMContentLoaded", completed);
            window.addEventListener("load", completed);
        }
        console.log("UsefulWorks(): ready-listeners listening");
    }());

    // expose ourself
    console.log("iife end");
});
