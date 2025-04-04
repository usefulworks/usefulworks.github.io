/*
 * Copyright (c) 2025 UsefulWorks Ltd. All Rights Reserved.
 */

/*
 * Simple wrapper around WebStorage API
 */
class AppStorage {

    #ns;
    #store;
    #session;

    /*
     * @param {string} namespace - string to prepend to storage keys (optional, default='uw')
     * @param {boolean} session - use session storage if true, otherwise local storage (optional, default=true)
     */
    constructor(namespace = "uw", session = true) {
        this.#ns = namespace;
        this.#session = session;
        this.#store = session ? window.sessionStorage : window.localStorage;
        $debug.log(`new AppStorage(${namespace}, ${session ? 'session' : 'local'})`);
    }

    get namespace() { return this.#ns; }
    get isSession() { return this.#session; }
    get isLocal() { return !this.#session; }

    get(key) {
        return this.#store.getItem(this.#prependNS(key));
    }
    set(key, value) {
        this.#store.setItem(this.#prependNS(key), value);
    }
    delete(key) {
        this.#store.removeItem(this.#prependNS(key));
    }

    #prependNS(key) {
        return `${this.#ns}.${key}`
    }
}

