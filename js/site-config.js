---
layout: blank
---
/*
 * Copyright (c) 2025 UsefulWorks Ltd. All Rights Reserved.
 *
 * site-config.js
 *
 */


/*
 * Splat  site configuration into the global JS scope
 */
const $features = (function() { return {{ site.uw.features | jsonify }}; }());

/*
 * Global debug logger
 */
const $debug = (function() {

{% if jekyll.environment == "production" %}
    return {
        log: (message) => {}
    };
{% else %}
    console.log("Config: debug logger initialized");
    return {
        log: (message) => { console.log(message); }
    };
{% endif %}

})();
