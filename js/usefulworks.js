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
(function(context, factory) {

    // checks on context for window/document/etc...

    // build
    factory(context);

}(window, function(window) {
    function isArrayLike(value) {
        function isLength(length) {
            return typeof length === "number"
                && length > -1
                && length % 1 === 0
                && length < 4294967296;
        }
        if (!value || typeof value === "function" || value === window) {
            return false;
        }
        if (Object.prototype.toString.call(value) === '[object Array]') {
            return true;
        }
        return isLength(value.length);
    }

    // initialize the base UsefulWorks object, which calls
    // the contructor function 'UsefulWorks.fn.init'
    const UsefulWorks = function(selector, context) {
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
        get: function(index) {
            console.log(`UsefulWorks.get(${index})`);
            return (index ?
                (index < 0 ?
                    this._elements[index + this.length]
                    : this._elements[index])
                : this._elements);
        },
        get length() {
            return  this._elements ? this._elements.length : 0;
        },
        get text() {
            return this._elements ? this._elements[0].textContent : "";
        },
        each: function(target, callback) {
            console.log("UsefulWorks.each()");
            if (arguments.length === 1) {
                callback = target;
                target = this;
            }
            if (isArrayLike(target)) {
                let len = target.length;
                for (let i = 0; i < len; i++) {
                    if (callback.call(target[i], i, target[i]) === false) break;
                }
            } else {
                for (let prop in target) {
                    if (callback.call(target[prop], prop, target[prop]) === false) break;
                }
            }
            return target;
        },
        noop() {

        },
        on(eventName, handler) {
            console.log("on" + eventName);
            if(this._elements) {
                this._elements.forEach(ele => {
                    ele.addEventListener(eventName, handler);
                });
            }
            return this;
        },
        off(eventName, handler) {
            console.log("off" + eventName);
            if(this._elements) {
                this._elements.forEach(ele => {
                    ele.removeEventListener(eventName, handler);
                });
            }
            return this;
        },
        ready(callback) {
            console.log("UsefulWorks.ready()");
            if (!this._waitingForReady) this._waitingForReady = [];

            this._waitingForReady.push(callback);

            return this;
       },
        //when(condition) {
        //  console.log("UsefulWorks.when()");
        //    return this;
        //},

        // the splice function lets UsefulWorks be logged as an array in the console (???)
        splice: Array.prototype.splice
    };

    const init = UsefulWorks.fn.init = function(selector, context) {
        console.log("UsefulWorks.init()");

        if (!selector) {
            return this;
        }

        // trivial implemenation
        switch (typeof selector) {
            case "string":
                this._elements = document.querySelectorAll(selector); // is this public?
                return this;

            case "function":
                // default: if doc is ready call immediately otherwise queue for call on ready
                // e.g this.ready ? selector(this) : this.ready(selector);
                return this;

            default:
                return this;
            }
    };

    // test: prep ready function here
    const beforeReady = function() {

        document.addEventListener("DOMContentLoaded", afterReady);
        window.addEventListener("load", afterReady);

        function afterReady() {
            document.removeEventListener("DOMContentLoaded", afterReady);
            window.removeEventListener("load", afterReady);
            //
            // invoke ready()
            // ...
        }
    };

    // assign UsefulWorks.fn.init prototype to UsefulWorks
    // prototype that contains the API methods
    init.prototype = UsefulWorks.prototype;

    // expose to the global object
    window.UsefulWorks = window.u_w = UsefulWorks;

    console.log("iife end");
}));

var $ = u_w("div:first-child").on("click", function() {
    console.log("clicked");
});

u_w("div").each(function(index, ele) {
    console.log(index + " Hello, World!");
    console.dir(ele); // <- null because can't (yet) do [index] on UsefulWorks object
    //ele.textContent = "Hello, World!";
})

console.log($._elements); // <- o.o.
console.dir(u_w);
console.dir($);
