/*
 * Copyright (c) 2025 UsefulWorks Ltd. All Rights Reserved.
 */

/*
 * usefulworks.js
 *
 * v0.0.1
 *
 */
const u_w = (function(c) {

    const _iar = "i am robert";
    const _context = c;

    contentLoaded = function() {
        console.log("u_w: document,DOMContentLoaded");
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

    const $ = (function(css_selector) {
        console.log("iar", _iar);
        console.log("ctx", _context);

        const selected = document.querySelectorAll(css_selector);

        sayHello = function() {
            console.log("Hello from UsefulWorks!");
        }

        ready = function() { // rename to 'go' please
            console.log("ready!");
        }

        return $;
    }());

    document.addEventListener("DOMContentLoaded", contentLoaded);
    window.addEventListener("load", windowLoaded);

    return $;

// end of iife
}(iife = 0));

u_w.sayHello();
