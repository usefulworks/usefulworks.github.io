/*
 * Copyright (c) 2025 UsefulWorks Ltd. All Rights Reserved.
 */

const Forms = (function(){

    let _recaptcha = null;


    return {
        init : function() {
            console.log("Forms.init()");
            _recaptcha = document.getElementById($UW.recaptcha_container);
            if (!_recaptcha) {
                console.warn("Recaptcha container not found");
            }
        },
        renderRecaptcha : function() {
            // the external recaptcha/api.js must be loaded *after* this def
            // window.onload waits for the script to load (document on load does not)
            // grecaptcha.render("g-recaptcha", { "sitekey": "{{ sitekey }}" });
        },
        recaptchaCallback : function(response) {
            console.log("Forms.recaptchaCallback()");
            //console.log(response);
        },
    }

// end of IIFE
}(window));

// onload => init
UsefulWorks(Forms.init);
