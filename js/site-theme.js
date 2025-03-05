/*
 * Copyright (c) 2025 UsefulWorks Ltd. All Rights Reserved.
 */

/*
 * Enum-like class representing allowed theme values
 */
class Theme {
    static Dark = new Theme("dark");
    static Light = new Theme("light");
    static Undefined = new Theme(null);

    #name;

    constructor(value) {
        this.#name = value;
    }

    get name() { return this.#name; }
    get selfOrDefault() {
        return this == Theme.Undefined ? Theme.Light : this;
    }
    get inverse() {
        switch(this) {
            case Theme.Dark: return Theme.Light;
            case Theme.Light: return Theme.Dark;
            return this;
        }
    }
    get [Symbol.toStringTag]() { return "Theme"}

    toString() {
        return `${this.#name}`;
    }

    static fromString(value) {
        switch(value) {
            case "dark": return Theme.Dark;
            case "light": return Theme.Light;
            default: return Theme.Undefined;
        };
    }
}

const Themes = {
    /**
    * Sets up the document theme and related event
    */
    init() {
        // encapsulates the theme attribute on the document root
        const themeAttribute = {
            _html : document.documentElement,
            _attrName : "data-theme",
            get init() { return (this._html != null); },
            get theme() { return Theme.fromString(this._html.getAttribute(this._attrName)); },
            set theme(value) { this._html.setAttribute(this._attrName, value instanceof Theme ? value.name : value); }
        };
        // encapsulates the theme toggler switch
        const themeSwitch = {
            _element : document.getElementById("theme-switch"),
            _checkedTheme : Theme.Dark,
            get init() { return (this._element != null); },
            get _checked() { return this._element.checked; },
            set _checked(value) { this._element.checked = value; },
            get theme() { return this.checked ? this._checkedTheme : this._checkedTheme.inverse },
            set theme(value) { this.checked = (value == this._checkedTheme); },
            addChangeListener(func) { this._element.addEventListener("change", func); }
        };
        // encapsulates the OS theme
        const systemTheme = {
            _media : window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null,
            get init() { return (this._media != null); },
            get value() {
                if (this.init) {
                    return this._media.matches ? Theme.Dark : Theme.Light;
                }
                return Theme.Undefined;
            },
            addChangeListener(func) { this._media.addEventListener("change", func); }
        };

        // query string overrides system
        const queryTheme = Themes.getThemeFromQueryParam();
        const theme = queryTheme == Theme.Undefined ? systemTheme.value : queryTheme;

        console.log("themes: [url]=" + queryTheme + " [system]=" + systemTheme.value + " [using]=" + theme);

        // set theme attribute
        if (!themeAttribute.init) {
            console.log("can't set theme attribute; quitting")
            return;
        }
        themeAttribute.theme = theme;

        // set switcher event handler
        if (themeSwitch.init) {
            themeSwitch.theme = themeAttribute.theme;
            themeSwitch.addChangeListener(function() {
                themeAttribute.theme = themeSwitch.theme;
            });
        }

        // set system theme handler
        if (systemTheme.init) {
            systemTheme.addChangeListener(function() {
                themeAttribute.theme = systemTheme.value;
                themeSwitch.theme = systemTheme.value;
            });
        }
    },

    getThemeFromQueryParam() {
        return Theme.fromString(getUrlQueryParam("theme"));
    }
};

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

// onload => init
document.readyState =="loading" ? window.addEventListener("load", Themes.init) : Themes.init();
