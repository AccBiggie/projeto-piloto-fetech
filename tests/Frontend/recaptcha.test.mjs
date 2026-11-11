import assert from 'node:assert/strict';
import test from 'node:test';

let moduleId = 0;

async function createHarness(t) {
    const previousWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
    const previousDocument = Object.getOwnPropertyDescriptor(globalThis, 'document');
    const scripts = [];
    const timers = new Map();
    let timerId = 0;

    const fakeWindow = {
        setTimeout(callback, milliseconds) {
            assert.equal(milliseconds, 15000);
            timers.set(++timerId, callback);
            return timerId;
        },
        clearTimeout(id) {
            timers.delete(id);
        },
    };
    const fakeDocument = {
        createElement(tag) {
            assert.equal(tag, 'script');
            return { removed: false, onerror: null, remove() { this.removed = true; } };
        },
        querySelector(selector) {
            assert.equal(selector, 'meta[name="csp-nonce"]');
            return { content: 'test-nonce' };
        },
        head: { appendChild(script) { scripts.push(script); } },
    };

    Object.defineProperty(globalThis, 'window', { configurable: true, value: fakeWindow });
    Object.defineProperty(globalThis, 'document', { configurable: true, value: fakeDocument });
    t.after(() => {
        if (previousWindow) Object.defineProperty(globalThis, 'window', previousWindow);
        else delete globalThis.window;
        if (previousDocument) Object.defineProperty(globalThis, 'document', previousDocument);
        else delete globalThis.document;
    });

    const source = new URL('../../resources/js/painel/recaptcha.ts', import.meta.url);
    source.searchParams.set('test', String(++moduleId));
    const { loadRecaptcha } = await import(source.href);
    const callbackName = (script) => new URL(script.src).searchParams.get('onload');

    return { loadRecaptcha, scripts, timers, window: fakeWindow, callbackName };
}

test('timeout followed by retry ignores late errors and callbacks from the first attempt', async (t) => {
    const h = await createHarness(t);
    const first = h.loadRecaptcha();
    assert.equal(h.loadRecaptcha(), first);
    assert.equal(h.scripts.length, 1);
    const firstScript = h.scripts[0];
    const firstName = h.callbackName(firstScript);
    const lateError = firstScript.onerror;
    const lateCallback = h.window[firstName];
    const firstFailure = assert.rejects(first, /Não foi possível carregar/);
    h.timers.values().next().value();
    await firstFailure;
    assert.equal(firstScript.removed, true);
    assert.equal(firstScript.onerror, null);
    assert.equal(h.window[firstName], undefined);

    const second = h.loadRecaptcha();
    const secondScript = h.scripts[1];
    const secondName = h.callbackName(secondScript);
    const secondCallback = h.window[secondName];
    assert.notEqual(secondName, firstName);
    lateError();
    lateCallback();
    assert.equal(h.window[secondName], secondCallback);
    assert.equal(h.loadRecaptcha(), second);
    assert.equal(h.scripts.length, 2);
    assert.equal(h.timers.size, 1);

    const api = { render() { return 1; }, reset() {} };
    h.window.grecaptcha = api;
    secondCallback();
    assert.equal(await second, api);
    assert.equal(h.loadRecaptcha(), second);
    assert.equal(h.scripts.length, 2);
    assert.equal(h.timers.size, 0);
    assert.equal(secondScript.onerror, null);
    assert.equal(h.window[secondName], undefined);
});

test('a script loading error allows a fresh attempt and preserves the CSP nonce', async (t) => {
    const h = await createHarness(t);
    const first = h.loadRecaptcha();
    const firstFailure = assert.rejects(first, /Não foi possível carregar/);
    h.scripts[0].onerror();
    await firstFailure;
    assert.equal(h.timers.size, 0);

    const retry = h.loadRecaptcha();
    const script = h.scripts[1];
    assert.equal(script.nonce, 'test-nonce');
    assert.equal(script.async, true);
    assert.equal(script.defer, true);
    assert.equal(new URL(script.src).searchParams.get('render'), 'explicit');
    const api = { render() { return 1; }, reset() {} };
    h.window.grecaptcha = api;
    h.window[h.callbackName(script)]();
    assert.equal(await retry, api);
    assert.equal(h.timers.size, 0);
    assert.equal(Object.keys(h.window).filter((key) => key.startsWith('fetechRecaptchaReady')).length, 0);
});

test('an API already loaded on the page is reused without another script', async (t) => {
    const h = await createHarness(t);
    const api = { render() { return 1; }, reset() {} };
    h.window.grecaptcha = api;
    assert.equal(await h.loadRecaptcha(), api);
    assert.equal(h.scripts.length, 0);
    assert.equal(h.timers.size, 0);
});
