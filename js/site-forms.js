/*
 * Copyright (c) 2025 UsefulWorks Ltd. All Rights Reserved.
 */

const Forms = {

    init : function() {
        console.log("Forms.init");
        //Forms.renderRecaptcha();
    },

    renderRecaptcha : function() {
        // the external recaptcha/api.js must be loaded *after* this def
        // window.onload waits for the script to load (document on load does not)

        grecaptcha.render("g-recaptcha", { "sitekey": "{{ sitekey }}" });
    }
};
window.addEventListener("load", Forms.init);
