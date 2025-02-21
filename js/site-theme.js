/*
 * Copyright (c) 2025 UsefulWorks Ltd. All Rights Reserved.
 */

document.readyState =="loading" ? window.addEventListener("load", setupTheme) : setupTheme();

/**
* Sets up the document theme based on a URL query parameter
*/
function setupTheme() {
    const attrName = "data-uw-theme";
    const q = getUrlQueryParam("cs") == "bw" ? "bw" : "default";

    // set theme attribute on root
    document.documentElement.setAttribute(attrName, q);

    // set switcher event handler
    const themeSwitch = document.getElementById("theme-switch");
    if (themeSwitch) {
        themeSwitch.checked = document.documentElement.getAttribute(attrName) == "bw";
        themeSwitch.addEventListener("change", function () {
            document.documentElement.setAttribute(attrName, themeSwitch.checked ? "bw" : "default");
        });
    }
}

/**
* Get URL query parameter
* @param {string} key - query parameter key
* @returns {string|boolean} query parameter value or false if not found
*/
function getUrlQueryParam(key) {
    return getUrlQueryParams()[key] ?? false;
}

/**
* Get URL query parameters
* @returns {Object} map of query parameters
*/
function getUrlQueryParams() {
    let map = {};
    let q = window.location.search.substring(1).split("&");
    if (q) {
        q.forEach(function (kv) {
            const [k, v] = kv.split("=");
            map[k] = v || true;
        });
    }
    return map;
}
