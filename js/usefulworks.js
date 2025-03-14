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
        version: "0.0.1",

        get length() {
            return  this._elements ? this._elements.length : 0;
        },
        get text() {
            return this._elements ? this._elements[0].textContent : "";
        },
        noop() {}
        ,
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

console.log($._elements); // <- o.o.
.
console.dir(u_w);
console.dir($);
