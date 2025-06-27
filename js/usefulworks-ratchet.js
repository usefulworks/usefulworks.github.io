/*
 * Copyright (c) 2025 UsefulWorks Ltd. All Rights Reserved.
 *
 * These files are published under the MIT License.
 *
 * usefulworks-ratchet.js
 *
 * Turnstile client for validating tokens with server side
 * cloudflare 'turnstile-validator' worker
 */

(function(ctx) {

    // ello
    $UW.log("usefulworks-ratchet.js");

    // me
    const me = "Ratchet";

    // validation worker url
    const WORKER_URL_CF  = "https://turnstile-validator.jim-apperly-cloudflare.workers.dev"; // cloudflare
    // url for TS_WORKER when running locally
    const CF_DEV_TS_WORKER_URL   = "http://localhost:8787";


    // debug
    const ECHO_SERVER = "http://echo.free.beeceptor.com/"

    // event names
    const WIDGET_ERROR   = "turnstile-error";      // general turnstile error
    const WIDGET_EXPIRED = "turnstle-expired";     // token expired
    const VALIDATED      = "turnstile-validated";  // validation completed (success or fail)
    const VALIDATING     = "turnstile-validating"; // start server validation flow

    // second arg is an options object with a "detail" property that can hold custom data
    const dispatchEventInternal = (target,eventName, data) => target.dispatchEvent(new CustomEvent(eventName, { detail: data }));

    // event wiring
    const dispatchEvent = {
        // this == Ratchet instance
        widget_expired(data) {
            dispatchEventInternal(this._events, WIDGET_EXPIRED, data)
        },
        widget_error(data) {
            dispatchEventInternal(this._events, WIDGET_ERROR, data)
        },
        validated(success, data) {
            dispatchEventInternal(this._events, VALIDATED, { "success": success, "data": data })
        },
        validating(token) {
            dispatchEventInternal(this._events, VALIDATING, token)
        }
    };

    // entry point
    const Ratchet = function(context, siteKey) {
        if (arguments.length === 0) {
            context = null; siteKey = Ratchet.TSKEYS.test_pass;
        } else if (arguments.length === 1) {
            siteKey = tskeys.test_pass;
        }
        return new Ratchet.prototype.init(context, siteKey);
    }

    // prototype
    Ratchet.prototype = (function() {
        return {
            constructor: Ratchet,
            get form() { return this._form; },
            get element() { return this._element; },
            get siteKey() { return this._siteKey; },
            get [Symbol.toStringTag]() { return `${me} v${this.version} id:${this.element.id} key:${this.siteKey}`; },
            get turnstileResponseFieldName() { return Ratchet.TURNSTILE_RESPONSE_FIELD_NAME; },
            get version() { return "0.1.1" },
            get workerUrl() { return this._workerUrl; },
            set workerUrl(value) {
                if (value === null) {
                    $UW.debug.warn(`${me}.set_workerUrl: value is null`);
                } else {
                    $UW.log(`${me}.set_workerUrl: ${value}`);
                    this._workerUrl = value;
                }
            },
            get isExpired() {
                const expired = window.turnstile?.isExpired(this._widgetId);
                $UW.log(`isExpired: ${expired}`);
                return expired;
            },
            // returns the latest response from the widget; if the token
            // isExpired, a token will still returned but the token will
            // not be valid
            getResponse() {
                const response = window.turnstile?.getResponse(this._widgetId);
                $UW.log(`getResponse: ${response}`);
                return response;
            },
            addValidatedEventListener(fn) {
                this._events.addEventListener(VALIDATED, fn);
            },
            addValidatingEventListener(fn) {
                this._events.addEventListener(VALIDATING, fn);
            },
            addWidgetErrorEventListener(fn) {
                this._events.addEventListener(WIDGET_ERROR, fn);
            },
            addWidgetExpiredEventListener(fn) {
                this._events.addEventListener(WIDGET_EXPIRED, fn);
            },
            removeValidatedListener(fn) {
                this._events.removeEventListener(VALIDATED, fn);
            },
            removeValidatingEventListener(fn) {
                this._events.removeEventListener(VALIDATING, fn);
            },
            removeWidgetErrorEventListener(fn) {
                this._events.removeEventListener(WIDGET_ERROR, fn);
            },
            removeWidgetExpiredEventListener(fn) {
                this._events.removeEventListener(WIDGET_EXPIRED, fn);
            },
            // validate the Turnstile token with our worker
            validateToken: async function (token) {
                $UW.log(`validateToken: ${token}`);

                try {
                    // annouce validating
                    dispatchEvent.validating.call(this, token);

                    // send the token to our worker for validation
                    const { response, json } = await UsefulWorksForms.post(this.workerUrl, { token });

                    $UW.log(`validateToken: response ${(response.ok) ? "ok" : "not ok"}`);

                    if (!response.ok) {
                        // something went wrong with the post request
                        throw new Error(response.statusText, { cause: { response, json }});
                    }

                    if (json.success === true) {
                        // successful validation
                        $UW.log("validateToken: validation successful");

                        // signal listeners that token is valid
                        dispatchEvent.validated.call(this, true, json);

                    } else {
                        // token failed validation
                        $UW.debug.warn(`validation failed ${json}`);
                        dispatchEvent.validated.call(this, false, json);
                    }

                } catch (error) {
                    const json = (error.cause && error.cause?.json)
                    const detail = (json === undefined) ? "" : `; ${json.detail} because ${json.cause}`;
                    $UW.debug.error(`${me}: error validating Turnstile token: ${error.message}${detail}`);
                    dispatchEvent.validated.call(this, false, json);

                } finally {
                    // reset the widget to allow another attempt
                    // this.resetWidget();
                }
            },//validateToken
            removeWidget() {
                window.turnstile?.remove(this._widgetId);
            },
            resetWidget(widgetId) {
                // reset the widget to allow another attempt // will trigger token callback
                window.turnstile?.reset(this._widgetId);
            }
        }
    }());

    // constructor
    Ratchet.prototype.init = (function() {
        const createId = (ctx) => (typeof ctx === "string") ? ctx.replace(/^#+/, "") : `ratchet-${$UW.now()}`;
        const selectorizor = () => { // parked for later
            let selector = 0;
            let count = 0;
            return () => {
                let value = selector;
                selector += 10**count; // === Math.pow
                count++;
                return value;
            };

        };
        const className = "captcha-container";
        // build new object
        return function(context, siteKey) {
            this._context = context;
            this._siteKey = siteKey;
            this._events = new EventTarget();
            this._workerUrl = WORKER_URL_CF;
            this._form = null;
            this._element = null;
            this._selector = 0;
            this._widgetId = null;
            this._callbacks = {
                token: function(token) {
                    $UW.log(`${me}: tsToken: ${this._widgetId}`);
                    this.validateToken(token); // <= this could be deferred to form.submit
                },
                beforeInteractive: function() {
                    $UW.log(`${me}: tsBeforeInteractive: ${this._widgetId}`);
                },
                afterInteractive: function() {
                    $UW.log(`${me}: tsAfterInteractive: ${this._widgetId}`);
                },
                error: function(errorCode) {
                    $UW.log(`${me}: tsError: ${errorCode}= => ${mapErrorCode(errorCode)}`);
                    // if return is a non-falsy result, Turnstile will assume that the error was
                    // handled accordingly. otherwise, if we return with a "no" or a falsy result,
                    // Turnstile will log a warning to the JavaScript console with the error code.
                    dispatchEvent.widget_error.call(this, { errorCode, message: mapErrorCode(errorCode) });
                    return false;
                },
                expired: function() {
                    $UW.log(`${me}: tsExpired: ${this._widgetId}`);
                    dispatchEvent.widget_expired.call(this, { message: `token expired on ${this._widgetId}`});
                    //window.turnstile.reset(fx.tsId);
                },
                timeout: function() {
                    $UW.log(`${me}: tsTimeout: ${this._widgetId}`);
                    //window.turnstile.reset(fx.tsId);
                },
                unsupported: function() {
                    $UW.log(`${me}: tsUnsupported: ${this._widgetId}`);
                },
            };

            // find the element
            if (context === null || context === undefined) {
                $UW.log("Ratchet: no context");

            } else if (context instanceof HTMLFormElement) {
                $UW.log("Ratchet: context is form element");
                this._form = context;
                this._selector += 1;

            } else if (typeof context === "string") {
                $UW.log("Ratchet: context is string");

                let element = null;

                try {
                    element = document.querySelector(context);
                    if (element === null) {
                        element = document.getElementById(context);
                        if (element !== null) {
                            $UW.log("Ratchet: context is string and element found by id");
                            this._selector += 10;
                        }
                    } else {
                        $UW.log("Ratchet: context is string and element found by selector");
                        this._selector += 100;
                    }
                } catch (e) {
                    $UW.log("Ratchet: context is string and invalid selector");
                }

                if (element === null) {
                    $UW.log("Ratchet: context is string but no element found");
                    this._selector += 1000;

                } else {
                    $UW.log("Ratchet: context is string and element found");
                    this._element = element;
                    let form = element.closest("form");
                    if (form === null) {
                        $UW.log("Ratchet: context is string but no form found");
                        this._selector += 10000;
                    } else {
                        $UW.log("Ratchet: context is string and form found");
                        this._form = form;
                        this._selector += 100000;
                    }
                }
            }

            // fill in the blanks
            if (this._form === null && document.forms.length > 0) {
                $UW.log("Ratchet: no form context, using first form");
                this._form = document.forms[0];
                this._selector += 1000000;
            }

            if (this._element === null) {
                $UW.log("Ratchet: creating element");
                let element = document.createElement("div");
                element.id = createId(context);
                element.className = className;
                this._element = element;
                (this._form === null ? document.body : this._form).appendChild(element);
                this._selector += 10000000;

            } else {
                if (this._element.id === "") {
                    $UW.log("Ratchet: element has no id, creating");
                    this._element.id = createId(context);
                    this._selector += 100000000;
                }
                if (this._element.className === "") {
                    $UW.log("Ratchet: element has no class, creating");
                    element.className = className;
                    this._selector += 1000000000;
                }
            }

            // render callback
            const cb = this._callbacks;
            const renderWidget = function() {
                $UW.log(`renderWidget[start]`);

                // returns the id of the widget element or undefined
                // nb. the element is in the iframe shadow dom so not
                //     addressable directly from here but can be used
                //     in window.turnstile.fn(__) calls
                const widgetId = turnstile.render(this._element, {
                    sitekey: this._siteKey,
                    action : "ulla",
                    size   : "flexible", // normal, flexible, compact
                    theme  : "auto",
                    callback: cb.token.bind(this),
                    "error-callback"      : cb.error.bind(this),
                    "expired-callback"    : cb.expired.bind(this),
                    "response-field"      : true,
                    "response-field-name" : Ratchet.TURNSTILE_RESPONSE_FIELD_NAME,
                    "timeout-callback"    : cb.timeout.bind(this),
                    "unsupported-callback": cb.unsupported.bind(this),
                    "before-interactive-callback": cb.beforeInteractive.bind(this),
                    "after-interactive-callback" : cb.afterInteractive.bind(this)
                });

                // widgetId is the id of the widget element
                $UW.log(`renderWidget[end]: widget = ${widgetId}`);
                this._widgetId = widgetId;
                return widgetId;

            }.bind(this); // bind render to this instance

            // set the render callback
            $UW.ready(() => window.turnstile.ready(renderWidget));

            // return this new instance
            return this;

        }//return
    }());

    // top-level properties
    Ratchet.prototype.init.prototype = Ratchet.prototype;
    // cloudflare test site-keys
    Ratchet.TSKEYS = {
        test_pass: "1x00000000000000000000AA",
        test_fail: "2x00000000000000000000AB",
        test_challenge: "3x00000000000000000000FF"
    }
    // id of turnsile widget response element
    // default = "cf-turnstile-response"
    // redefinable in turnstile.ready(renderWidget, opts)
    Ratchet.TURNSTILE_RESPONSE_FIELD_NAME = "uw-token";
    Ratchet.TURNSTILE_RESPONSE_FIELD_NAME_DEFAULT = "cf-turnstile-response";

    // add to global namespace
    window.Ratchet = Ratchet;

    // https://developers.cloudflare.com/turnstile/troubleshooting/client-side-errors/
    // https://developers.cloudflare.com/turnstile/troubleshooting/client-side-errors/error-codes/
    // https://developers.cloudflare.com/turnstile/troubleshooting/client-side-errors/#error-handling
    function mapErrorCode(errorCode) {
        // 2025-04-24 turnstile has some intersting interactions with the debugger
        // and the devtools console. Under some circumstances, with the debugger open,
        // the widget barfs with 60010. Closing the debugger seems to fix this. A
        // workaround seems to be to _un_check "Ignore List > Anonymous scripts from
        // eval or console".

        switch(errorCode) {
            case "110200": return "Unknown domain: Domain not allowed.";
            case "600010": return "The generic_challenge_failure";
            default: return "<<Unmapped Error Code>>";
        }
    }

}(window));
