/*
 * Copyright (c) 2025 UsefulWorks Ltd. All Rights Reserved.
 */

/*
 * site-features.js
 *
 * Currently implemented only for the blog but easily extensible to other features.
 */
const Features = (function() {
    const _feats = {
        blog: !!$features.blog.output // extract value from static config
    };

    let _style = null;

    // style based on current feature state
    getCssText = function() {
        return _feats.blog
            ?`
            .feature-blog {
            }`
            :`
            .feature-blog {
                display: none !important;
                height: 0 !important;
                width: 0 !important;
            }`;
    };

    return {
        init() { //fn
            console.log("Features.init()");
            // inject a new style element
            const style = document.createElement("style");
            style.textContent = getCssText();
            document.head.appendChild(style);
            _style = style;

            //tmp
            let quickclicks = 0, time = $UW.now();
            const tbloggle = $UW("#tbloggle").on("click", e => {
                (e.timeStamp - time < 999) ? quickclicks++ : quickclicks = 0;
                if (quickclicks === 2) {
                    Features.blog.toggleEnabled();
                    quickclicks = 0;
                }
                time = e.timeStamp;
            });
        },
        blog : { //obj
            get isEnabled() { return _feats.blog; },
            set isEnabled(value) {
                let b = !!value;
                if (b !== _feats.blog) {
                    _feats.blog = b;
                    _style.textContent = getCssText();
                }
            },
            toggleEnabled() { this.isEnabled = !_feats.blog; }
        }
    };

// end of IIFE
}(window));

// ready => init
UsefulWorks(Features.init);
