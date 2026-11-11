export interface RecaptchaApi {
    render: (element: HTMLElement, options: {
        sitekey: string;
        size: 'normal' | 'compact';
        callback: (token: string) => void;
        'expired-callback': () => void;
        'error-callback': () => void;
    }) => number;
    reset: (widget: number) => void;
}

type CallbackName = `fetechRecaptchaReady${number}`;

declare global {
    interface Window {
        grecaptcha?: RecaptchaApi;
        [name: CallbackName]: (() => void) | undefined;
    }
}

let loading: Promise<RecaptchaApi> | undefined;
let attempt = 0;

export function loadRecaptcha(): Promise<RecaptchaApi> {
    if (loading) return loading;
    if (window.grecaptcha?.render) return Promise.resolve(window.grecaptcha);

    loading = new Promise<RecaptchaApi>((resolve, reject) => {
        const script = document.createElement('script');
        const callbackName: CallbackName = `fetechRecaptchaReady${++attempt}`;
        let settled = false;
        const cleanup = () => {
            window.clearTimeout(timeout);
            script.onerror = null;
            delete window[callbackName];
        };
        const fail = () => {
            if (settled) return;
            settled = true;
            cleanup();
            script.remove();
            reject(new Error('Não foi possível carregar a verificação. Confira sua conexão e tente novamente.'));
        };
        const timeout = window.setTimeout(fail, 15000);

        window[callbackName] = () => {
            if (settled) return;
            if (!window.grecaptcha?.render) return fail();
            settled = true;
            cleanup();
            resolve(window.grecaptcha);
        };
        script.src = `https://www.google.com/recaptcha/api.js?onload=${callbackName}&render=explicit&hl=pt-BR`;
        script.async = true;
        script.defer = true;
        script.nonce = document.querySelector<HTMLMetaElement>('meta[name="csp-nonce"]')?.content ?? '';
        script.onerror = fail;
        document.head.appendChild(script);
    }).catch((error: unknown) => {
        loading = undefined;
        throw error;
    });

    return loading;
}
