/*
 * Copyright (c) 2025 UsefulWorks Ltd. All Rights Reserved.
 */

document.readyState =="loading" ? window.addEventListener("load", setupTheme) : setupTheme();

/**
* Sets up the document theme based on a URL query parameter
*/
function setupTheme() {
    const html = document.documentElement;
    const attrName = "data-theme";
    const query = getUrlQueryParam("theme");
    const q = query ? (query == "dark" ? "dark" : (query = "light" ? "light" : "auto")) : "auto";
    const s = getSystemTheme();

    // query string overrides system
    const theme = (q == "auto" ? (s == "auto" ? "light" : s) : q);
    console.log("url theme=" + q + " system theme=" + s + " using theme=" + theme);

    // set theme attribute on root
    document.documentElement.setAttribute(attrName, theme);

    // set switcher event handler
    const themeSwitch = document.getElementById("theme-switch");
    if (themeSwitch) {
        themeSwitch.checked = html.getAttribute(attrName) == "dark";
        themeSwitch.addEventListener("change", function () {
            html.setAttribute(attrName, themeSwitch.checked ? "dark" : "light");
        });
    }
}

function getSystemTheme() {
    if (window.matchMedia) {
        // listen for changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            const html = document.documentElement;
            const attrName = "data-theme";
            const themeSwitch = document.getElementById("theme-switch");

            const newColorScheme = e.matches ? "dark" : "light";
            console.log("system theme changed to " + newColorScheme);
            //nb. this will override query param, if specified
            html.setAttribute(attrName, newColorScheme);
            if (themeSwitch) themeSwitch.checked = newColorScheme == "dark";
        });
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            // dark mode
            return "dark";
        } else {
            // light mode
            return "light";
        }
    }
    return "auto";
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
