/*
 * Copyright (c) 2025 UsefulWorks Ltd. All Rights Reserved.
 *
 * usefulworks-forms.js
 *
 */

// iife wrapper
(function(ctx) {

    // ello
    $UW.log("usefulworks-forms.js");

    // me
    const me = "UsefulWorksForms";

    // event constants
    const BEFORESUBMIT = "beforesubmit";

    // UsefulWorksFormsEvent is a custom event that wraps the original event
    // and adds a reference to the UsefulWorksForms instance and a method to
    // prevent the default action on the original event
    class UsefulWorksFormsEvent extends CustomEvent {
        #originalEvent = null;
        #UsefulWorksForms = null;
        constructor(type, originalEvent, detail) {
            super(type, detail);
            this.#originalEvent = originalEvent;
            this.#UsefulWorksForms = (detail instanceof UsefulWorksForms) ? detail : null;
        }
        preventDefaultOnOrigin() {
            if (this.#originalEvent) {
                this.#originalEvent.preventDefault();
            }
        }
        get UsefulWorksForms() { return this.#UsefulWorksForms; }
        get originalEvent() { return this.#originalEvent; }
        get originalTarget() { return this.#originalEvent.target; }
    }

    // entry point
    const UsefulWorksForms = function(form) {
        // this === window
        const f = (typeof form === "string" ? ctx.document.querySelector(form) : form);
        return new UsefulWorksForms.prot.ctor(f);
    }

    // prototype object
    const prot = UsefulWorksForms.prot = UsefulWorksForms.prototype = (function() {

        // constructor
        return {
            // redirect constuctor
            constructor: UsefulWorksForms,
            // properties
            get form() { return this._form; },
            get fields() { return this._form.elements; },
            get namedFields() { return this._namedFields; },
            get hasSubmit() { return this._submit !== null; },
            get isEmpty() { return this._length === 0; },
            get length() { return this._length; },
            // custom toString implementation
            get [Symbol.toStringTag]() { return `${me} len:${this.length} hasSubmit:${this.hasSubmit}`; },
            // events
            addBeforeSubmitEventListener(listener, options) {
                this._events.addEventListener(BEFORESUBMIT, listener, options);
            },
            removeBeforeSubmitEventListener(listener, options) {
                this._events.removeEventListener(BEFORESUBMIT, listener, options);
            },
            // form accessors
            get action() { return this._form.action; },
            set action(value) { this._form.action = value; },
            get formData() { return new FormData(this._form); },
            get method() { return this._form.method; },
            set method(value) { this._form.method = value; },
            get name() { return this._form.name; },
            // returns the first submit button on the form or null
            get submitButton() { return this._submit; },
            get submitButtonEnabled() {
                return this._submit && !this._submit.disabled;
            },
            set submitButtonEnabled(value) {
                if (this._submit) {
                    this._submit.disabled = !value;
                }
            },
            get [Symbol.toStringTag]() { return `UsefulWorksForms v${this.version} id:${this.name} action:${this.action}`; },
            get version() { return "0.1.1" },
            // returns true if the form contains a field with the given name
            containsField(name) {
                return Object.hasOwn(this._namedFields, name);
            },
            // returns true if the form contains a field with the given name
            getField(name) {
                return this._namedFields[name];
            },
            reset() { this._form.reset(); return this; },
            async submit() {
                const { response, json } = await  UsefulWorksForms.postForm(this);
                if (response.ok) {
                    $UW.log(`submit: response ok`);
                } else {
                    throw new Error(`submit: response not ok ${response.statusText}"`, { cause: result });
                }
                return json;
            },
        }
    }());

    // constructor function
    const ctor = UsefulWorksForms.prot.ctor = (function() {
        // reindex helper
        const reindex = function(uwf) {
            let originalLength = uwf._length;
            uwf._length = 0;
            uwf._namedFields = { length: 0 };
            uwf._submit =  uwf._form.querySelector("button[type=submit]");
            // rebuild indexed properties
            for(let i = 0;  i < uwf._form.length; i++, uwf._length++) {
                const e = uwf._form[i]  // form control by index
                const n = e?.name;      // form control (if it has a name=[])
                uwf[i] = e;             // assign prop by index
                if (n === undefined) {
                    $UW.debug.warn(`${me}: unnamed field property ${e}`);
                } else {
                    if (n === "length") {
                        // don't replace the length property
                        $UW.debug.warn(`${me}: not replacing length property length on namedFields`);
                    } else if (uwf._namedFields[n] === undefined) {
                        uwf._namedFields[n] = e;   // assign prop by name
                        uwf._namedFields.length++; // new name
                    } else if (uwf._namedFields[n].length) {
                        uwf._namedFields[n].push(e); // add to array assoaivated with name
                    } else {
                        const d = uwf._namedFields[n];
                        uwf._namedFields[n] = [ d, e ]; // convert to array
                    }
                }
            }
            // remove any excess properties
            while (originalLength > uwf._length) {
                originalLength--;
                delete uwf[originalLength];
            }
        };
        // constructor function
        return function(form) {
            this._namedFields = { length: 0 };
            this._length = 0;
            this._submit = null;
            this._events = new EventTarget();
            this._observer = null;
            this._selector = 0;

            if (form === undefined || form === null) {
                this._form = [];
                return this;
            }

            // figure out what we're dealing with
            if (form instanceof HTMLFormElement || form.tagName === 'FORM') {
                // just a form element
                this._form = form;
                this._selector = 1;
            } else if (form.form !== undefined && form.form !== null) {
                // possible form input element
                this._form = form.form;
                this._selector = 2;
            } else if (form instanceof UsefulWorksForms) {
                // shallow clone
                this._form = form._form;
                this._selector = 3;
            } else if (form === window || form.nodeType) {
                // any other element incl. window or window.document
                this._form = window.document.querySelector('form');
                this._selector = 4;
            } else {
                // give up
                throw new Error(`${me}: can't create new with supplied ${form}`);
            }

            // watch for changes to the form dom
            this._observer = new MutationObserver(mutations => {
                mutations.forEach(mutation => {
                    if (mutation.type === "childList") {
                        // target is the element whose descendants have changed
                        let added = mutation.addedNodes.length;
                        let removed = mutation.removedNodes.length;
                        $UW.log(`${me}: childList mutation on ${mutation.target} [ added ${added} / removed ${removed} ]`);
                        reindex(this);
                    }
            })});
            this._observer.observe(this._form, {
                childList: true,
                subtree: true
            });

            // add indexed property references to the form elements on this UWF
            if (this._form.length) {
                reindex(this);
            }

            // map form submit => custom beforesumbit event
            this._form.addEventListener("submit", e => {
                this._events.dispatchEvent(new UsefulWorksFormsEvent(BEFORESUBMIT, e, this));
                return this;
            });


            // return this new instance
            return this;
        }//return
    }());

    UsefulWorks.decorate(true, UsefulWorksForms, {
        // default headers for postData
        defaultPostHeaders() {
            return {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            };
        },
        // post a form to a target URL
        post(target, body) {
            return postData2(target, UsefulWorksForms.defaultPostHeaders(), JSON.stringify(body));
        },

        // post a form to a target URL
        // returns: object { response, json }
        postForm(formOrUsefulWorksForms) {
            const target = formOrUsefulWorksForms instanceof UsefulWorksForms
                        ? formOrUsefulWorksForms.form
                        : formOrUsefulWorksForms instanceof HTMLFormElement
                        ? formOrUsefulWorksForms : null;
            if (target === null) {
                throw new Error("postForm: formOrUsefulWorksForms must be a UsefulWorksForms or HTMLFormElement");
            }
            const body = JSON.stringify(Object.fromEntries(new FormData(target)));
            $UW.log(`${me}: postForm: ${target.action} body: ${body}`);
            return result = postData2(target.action, UsefulWorksForms.defaultPostHeaders(), body);
        }
    });

    // reimplementation of postData
    // returns: object { response, json }
    async function postData2(target, headers, body) {
        const opts = {
            method: 'POST',
            headers: headers,
            body: body
        };

        return fetch(target, opts)
            .catch(error => $UW.debug.error(`oops! problem whilst fetching: ${error}`))
            .then(async function(response) {
                let json = await response.json();
                return { response, json };
            })
            .catch(error => $UW.debug.error(`oops! problem retrieving json: ${error}`));
    }

    // magic happens here
    ctor.prototype = UsefulWorksForms.prototype;
    window.UsefulWorksForms = UsefulWorksForms;

}(window));

