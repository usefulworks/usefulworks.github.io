/*
 * Copyright (c) 2025 UsefulWorks Ltd. All Rights Reserved.
 */

/*
 *
 *
 *
 */

const Features = {

    init() {
        // style we will inject
        const css_content = Features.blog.isEnabled
            ?`
            .feature-blog {
            }`
            :`
            .feature-blog {
                display: none !important;
                height: 0 !important;
                width: 0 !important;
            `;

        // inject a style element
        var head = document.head || document.getElementsByTagName("head")[0];
        console.log(head);
        const style = document.createElement("style");
        with(style) {
            type = "text/css";
        }
        if (style.styleSheet) {
            style.styleSheet.cssText = css_content;
        } else {
            style.appendChild(document.createTextNode(css_content));
        }
        head.appendChild(style);
    },

    blog : {
        get isEnabled() { return false; },
        set isEnabled(value) { throw new Error("Cannot set value for read-only property 'enabled'"); }
    }
};

// onload => init
document.readyState =="loading"
    ? window.addEventListener("load", Features.init)
    : Features.init();
