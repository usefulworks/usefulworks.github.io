/*
 * Copyright (c) 2025 UsefulWorks Ltd. All Rights Reserved.
 */

const Forms = (function(){

    let _recaptcha = null;


    return {
        init : function() {
            $UW.log("Forms.init()");
            _recaptcha = document.getElementById($literals.recaptcha_container);
            if (!_recaptcha) {
                $UW.debug.warn("Recaptcha container not found");
            }
        },
        renderRecaptcha : function() {
            // the external recaptcha/api.js must be loaded *after* this def
            // window.onload waits for the script to load (document on load does not)
            // grecaptcha.render("g-recaptcha", { "sitekey": "{{ sitekey }}" });
        },
        recaptchaCallback : function(response) {
            $UW.log("Forms.recaptchaCallback()");
        },
    }

// end of IIFE
}(window));

// onload => init
UsefulWorks(Forms.init);
