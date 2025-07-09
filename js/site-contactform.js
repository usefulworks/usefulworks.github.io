/*
 * Copyright (c) 2025 UsefulWorks Ltd. All Rights Reserved.
 *
 * These files are published under the MIT License.
 *
 * site-contactform.js
 */

 const ContactForm = (function() {

    // me
    const me = "ContactForm";

    // turnstile contstants
    const TS_CONTAINER_SELECTOR  = "#ts-widget";
    const TS_SITE_KEY            = "0x4AAAAAABL7O3loEJOaxR5S";

    // ui things
    const CAL_BUTTON = "a#cal-btn";
    const PRE_VER_MSG = "p#pre-verify-message";
    const POST_VER_MSG = "p#post-verify-message";
    const INITIAL = "div#initial-state";
    const RESULTS = "div#results-state";
    const SHOWING = "showing";

    // mock response from web3forms service
    const MOCK_W3F_RESPONSE = `
    {
        "success": "true",
        "data": {
            "person_name": "harry",
            "email": "harry@hogwarts",
            "message": "expeliarmus!"
        },
        "message": "Email sent successfully!"
    }`;

    // format result message
    function displayResults(json) {
        const pretty = JSON.stringify(json, 2, null);
        const success = (json.success || json.parsedBody.success === "true");
        const tokens = {
            name: (json?.data?.person_name || json?.parsedBody?.person_name || "human")
        };
        const message = success ? templates.success(tokens) : templates.failure(tokens);

        $UW(RESULTS)[0].innerHTML = message;
        setView({ initialstate: false });
    }

    function setView(view) {
        if (view.initialstate) {
            $UW(INITIAL).addClass(SHOWING);
            $UW(RESULTS).removeClass(SHOWING);
        } else {
            $UW(INITIAL).removeClass(SHOWING);
            $UW(RESULTS).addClass(SHOWING);
        }
    }

    // enable debug hanlders
    function addDebugListeners(ratchet) {
        ratchet.addValidatedEventListener(e => {
            $UW.log(`** validated (${e.detail.success}) **`);
        });
        ratchet.addValidatingEventListener(e => {
            $UW.log("** validating **");
        });
        ratchet.addWidgetErrorEventListener(e => {
            $UW.log(`** widget-error ${JSON.stringify(e.detail)} **`);
        });
        ratchet.addWidgetExpiredEventListener(e => {
            $UW.log(`** widget-expired ${JSON.stringify(e.detail)} **`);
        });
    }

    const titleCase = function(s) {
        return s.replace(/\w\S*/g, text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase());
    }

    const TEXTAREA_PLACEHOLDER = "Tell us something about your business (e.g. how many staff members do you" +
                                 "have? what products/services do you offer? ...)\n\n" +
                                 "What current challenges are you seeking help with?\n\n" +
                                 "The more information the better!";

    const templates = {
        success: (tokens) => `<h2 class="salute">${titleCase(tokens.name)}, thank you for getting in touch!</h2>
                              <p>We appreciate you taking the time to reach out. Your message
                              has been sent successfully and our Customer Excellence team
                              will be in touch with you shortly.</p>
                              <p>Have a great day! 😊</p>
                              ${templates.signoff(tokens)}`,
        failure: (tokens) => `<h2>Urgh... Gremlins</h2>
                              <p>We are sorry but something went wrong with the submission.</p>
                              <p>Our tech team has been notified. Please accept our apologies
                              for the inconvenience and try again later.</p>
                              ${templates.signoff(tokens)}`,
        signoff: (tokens) => `<p class="signature">The UsefulWorks Team</p>
                              <a href="/" role="link">[ UsefulWorks Home ]</a>`,
        follow:  (tokens) => `<p>In the meantime, please take a look at the following resources.</p>`
    };

    // ContactForm singleton
    return {
        init() {
            const ratchet = Ratchet(TS_CONTAINER_SELECTOR, TS_SITE_KEY);
            const uwf = UsefulWorksForms(this);

            $UW.log(ratchet);
            $UW.log(uwf);

            const setVerifyMessage = function(unverified) {
                const h = "hidden";
                const elements = [$UW(PRE_VER_MSG)[0], $UW(POST_VER_MSG)[0]];
                const [hide, show] = unverified ? [0,1] : [1,0];
                elements[show].removeAttribute(h);
                elements[hide].setAttribute(h, h);
            };

            const setButtonsState = function(enabled) {
                const d = "disabled";
                const enabler = (e) => e.removeAttribute(d);
                const disabler = (e) => e.setAttribute(d, d);
                const abler = enabled ? enabler : disabler;
                abler($UW(CAL_BUTTON)[0]);         // calendar
                uwf.submitButtonEnabled = enabled; // form
            };

            const setUIState = function(goodToGo) {
                setButtonsState(goodToGo);
                setVerifyMessage(goodToGo);
            };

            // debug
            if ($environment && $environment !== "production") {
                addDebugListeners(ratchet);
                uwf.form.addEventListener("submit", e => {
                    $UW.log(`${me}: form submit: ${e}`);
                    //e.preventDefault();
                });
            }

            // reset the form
            uwf.reset();
            uwf.getField("message").placeholder = TEXTAREA_PLACEHOLDER;
            setView({ initialstate: true });

            // disable action buttons until Turnstile verification completes
            setUIState(false);

            // listen for form submit event
            uwf.addBeforeSubmitEventListener(function(e) {
                $UW.log(`${me}: beforesubmit[before]: ${e}`);
                e.preventDefaultOnOrigin();

                // prevent submission if the form doesn't have a valid Turnstile token
                $UW.log(`${me}: contains ${ratchet.turnstileResponseFieldName}: ${uwf.containsField(ratchet.turnstileResponseFieldName)}`);
                if (!uwf.containsField(ratchet.turnstileResponseFieldName)) {
                    // TODO: make this nicer
                    alert("Please complete the Turnstile captcha challenge");

                } else {
                    // disable the Turnstile response field so it doesn't get posted
                    [ Ratchet.TURNSTILE_RESPONSE_FIELD_NAME, Ratchet.TURNSTILE_RESPONSE_FIELD_NAME_DEFAULT ].forEach ( fieldName => {
                        $UW.log(`${me}.beforesubmit: checking ${fieldName}`);
                        let field = uwf.getField(fieldName);
                        if(field) {
                            field.disabled = "true"; // prevent field from posting
                            $UW.log(`${me}.beforesubmit: disabled ${fieldName}`);
                        } else {
                            $UW.log(`${me}.beforesubmit: ${fieldName} not found`);
                        }
                    });

                    // append person name to email subject field
                    const subject = uwf.namedFields["subject"];
                    const personName = uwf.namedFields["person_name"];
                    if(subject && personName && personName.value) {
                        subject.value += `: ${personName.value}`;
                    }

                    if (false) {
                        displayResults(JSON.parse(MOCK_W3F_RESPONSE));
                        uwf.reset();

                    } else {
                        uwf.submit()
                            .catch(error => $UW.debug.error(`${me}: post error: ${error}`))
                            .then(data => { displayResults(data); $UW.log(`${me}: email sent successfully!`); })
                            .catch(error => $UW.debug.error(`${me}: display error: ${error}`))
                            .finally(() => uwf.reset());
                    }
                }

                $UW.log(`${me}: beforesubmit[after]: ${e}`);
                return false;
            });

            // called after the token has valided
            ratchet.addValidatedEventListener(e => {
                // check data for success/failure
                if (e.detail.success) {
                    // enable the UI
                    setUIState(true);
                }
            });
            // called when the token expires
            ratchet.addWidgetExpiredEventListener(e => {
                // disable the UI
                setUIState(false);
            });
        }
    };
 }());

 // init
 UsefulWorks(ContactForm.init);
