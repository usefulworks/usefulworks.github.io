---
layout: blank
---
/*
 * Copyright (c) 2025 UsefulWorks Ltd. All Rights Reserved.
 */

/*
 * site-config.js
 *
 * Splat some site configuration into the global JS scope.
 *
 */
const $features = (function() { return {{ site.uw.features | jsonify }}; }());
