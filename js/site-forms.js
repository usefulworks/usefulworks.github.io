/*
 * Copyright (c) 2025 UsefulWorks Ltd. All Rights Reserved.
 */

const Forms = {

    init : function() {
        console.log("Forms.init");
        console.log("$UW.myName" + $UW.myName);
    },

    Recaptcha : {
        // the external recaptcha/api.js must be loaded *after* this def
        load : function() {
            console.log("Forms.Recaptcha.load");
            //grecaptcha.render("g-recaptcha", { "sitekey": "{{ sitekey }}" });
        }
    }
};
