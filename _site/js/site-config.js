
/*
 * Copyright (c) 2025 UsefulWorks Ltd. All Rights Reserved.
 *
 * site-config.js
 *
 */


/*
 * Splat  site configuration into the global JS scope
 */
const $features = (function() { return {"blog":{"output":false},"new feature":{"output":false}}; }());

/*
 * Global debug logger
 */
const $debug = (function() {


    console.log("Config: debug logger initialized");
    return {
        log: (message) => { console.log(message); }
    };


})();

