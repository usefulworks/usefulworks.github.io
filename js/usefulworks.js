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

    // checks on context...

    // build
    factory(context);

}(window, function(window) {

    // initialize the base UsefulWorks object, which just calls
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
        on(eventName, handler) {
            console.log("on" + eventName);
            if(this._elements) {
                this._elements.forEach(ele => {
                    ele.addEventListener(eventName, handler);
                });
            }
            return this;
        },
        ready() {
            console.log("UsefulWorks.ready()");
            return this;
        },
        // the splice function lets UsefulWorks be logged as an array in the console
        splice: Array.prototype.splice
    };

    const init = UsefulWorks.fn.init = function(selector, context) {
        console.log("UsefulWorks.init()");

        // trivial implemenation
        if (!selector) {
            return this;
        }
        if (typeof selector === "string") {
            this._elements = document.querySelectorAll(selector);
        }
        return this;
    };

    // assign UsefulWorks.fn.init prototype to UsefulWorks
    // prototype that contains the API methods
    init.prototype = UsefulWorks.prototype;

    // expose to the global object
    window.UsefulWorks = window.u_w = UsefulWorks;

    console.log("iife end");
}));

console.dir(u_w);

var $ = u_w("div:first-child").on("click", function() {
    console.log("clicked");
});

console.dir($);


const TMP = (function(c) {

    const _context = c;
    const _methods = {};

    constructor: UsefulWorks;

    init = function(selector, context) {
        console.log("UsefulWorks.init()");
    }
    ready = function () {
        console.log("UsefulWorks.ready()");
    }
    contentLoaded = function() {
        console.log("u_w: document.DOMContentLoaded");
        doWhenReady();
    }
    windowLoaded = function() {
        console.log("u_w: window.load");
        doWhenLoaded();
    }
    doWhenReady = function() {
        console.log("u_w: doWhenReady");
    }
    doWhenLoaded = function() {
        console.log("u_w: doWhenLoaded");
    }

    console.log("u_w: init");

    document.addEventListener("DOMContentLoaded", contentLoaded);
    window.addEventListener("load", windowLoaded);

    return _methods;

// end of iife
}(this));



