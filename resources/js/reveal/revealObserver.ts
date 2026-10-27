// Animações de entrada conforme o conteúdo chega na tela (mesmo padrão da landing do casamento).
// Um único IntersectionObserver para todos os elementos, sem listeners de scroll. O estado vive
// em atributos do próprio elemento (sem re-render do React):
//   data-revealed     -> estado final (o CSS faz a transição)
//   data-reveal-done  -> animação concluída: tira a transição para não atrasar hovers
export const revealConfig = {
    durationMs: 600,
    distancePx: 24,
    staggerMs: 80,
    /** Itens além deste índice aparecem junto com o último do stagger. */
    maxStaggerItems: 6,
    /** O elemento revela quando o topo passa ~12% acima da base da tela. */
    rootMargin: '0px 0px -12% 0px',
    mobile: { query: '(max-width: 700px)', durationMs: 480, distancePx: 16, staggerMs: 60, maxStaggerItems: 4 },
} as const;

/** fade: só opacidade | fade-up: sobe | fade-left/right: desliza dessa direção | scale-soft: 0.97 -> 1 */
export type RevealPreset = 'fade' | 'fade-up' | 'fade-left' | 'fade-right' | 'scale-soft';

export interface RevealOptions {
    delay: number;
    stagger: boolean;
    once: boolean;
}

const registered = new WeakMap<Element, RevealOptions>();
const timers = new WeakMap<Element, number>();
let observer: IntersectionObserver | null | undefined;
// Salvaguarda: elementos tão no fim da página que, mesmo com a rolagem no máximo, nunca
// cruzariam a linha de disparo (rootMargin) são revelados ao entrar na tela.
let edgeObserver: IntersectionObserver | null = null;

const triggerOffset = () => Math.abs(parseFloat(revealConfig.rootMargin.split(' ')[2])) / 100;
const matches = (query: string) => typeof window !== 'undefined' && Boolean(window.matchMedia?.(query).matches);
export const prefersReducedMotion = () => matches('(prefers-reduced-motion: reduce)');

function settle(element: Element) {
    element.setAttribute('data-revealed', '');
    element.setAttribute('data-reveal-done', '');
}

function show(element: HTMLElement, options: RevealOptions) {
    const mobile = matches(revealConfig.mobile.query);
    const step = mobile ? revealConfig.mobile.staggerMs : revealConfig.staggerMs;
    const maxItems = mobile ? revealConfig.mobile.maxStaggerItems : revealConfig.maxStaggerItems;
    let last = options.delay;
    if (options.stagger) {
        Array.from(element.children).forEach((child, index) => {
            const delay = options.delay + Math.min(index, maxItems - 1) * step;
            (child as HTMLElement).style.setProperty('--reveal-delay', `${delay}ms`);
            last = Math.max(last, delay);
        });
    }
    element.setAttribute('data-revealed', '');
    if (!options.once) {
        return;
    }
    observer?.unobserve(element);
    edgeObserver?.unobserve(element);
    const duration = mobile ? revealConfig.mobile.durationMs : revealConfig.durationMs;
    timers.set(element, window.setTimeout(() => element.setAttribute('data-reveal-done', ''), last + duration + 80));
}

function getObserver() {
    if (observer !== undefined) {
        return observer;
    }
    if (typeof IntersectionObserver === 'undefined') {
        return (observer = null);
    }
    observer = new IntersectionObserver(
        (entries) => {
            for (const entry of entries) {
                const options = registered.get(entry.target);
                if (!options) continue;
                if (entry.isIntersecting) show(entry.target as HTMLElement, options);
                else if (!options.once) entry.target.removeAttribute('data-revealed');
            }
        },
        { rootMargin: revealConfig.rootMargin, threshold: 0 },
    );
    edgeObserver = new IntersectionObserver(
        (entries) => {
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            const line = window.innerHeight * (1 - triggerOffset());
            for (const entry of entries) {
                const options = registered.get(entry.target);
                if (!options || !entry.isIntersecting || entry.target.hasAttribute('data-revealed')) continue;
                const topAtMaxScroll = entry.boundingClientRect.top + window.scrollY - maxScroll;
                if (topAtMaxScroll > line - 1) show(entry.target as HTMLElement, options);
            }
        },
        { threshold: 0 },
    );
    return observer;
}

/** Registra o elemento e devolve a limpeza. Sem suporte ou com movimento reduzido, mostra na hora. */
export function observeReveal(element: HTMLElement, options: RevealOptions) {
    const io = getObserver();
    if (!io || prefersReducedMotion()) {
        settle(element);
        return () => {};
    }
    registered.set(element, options);
    io.observe(element);
    edgeObserver?.observe(element);
    return () => {
        io.unobserve(element);
        edgeObserver?.unobserve(element);
        window.clearTimeout(timers.get(element));
        registered.delete(element);
    };
}

// CSS gerado a partir do revealConfig: duração e distância ficam num lugar só.
// Só opacity/transform, sem mudar o layout. Entra no CssBaseline do tema.
const hidden = (selector: string) => `[data-reveal${selector}]:not([data-revealed]), [data-reveal-group${selector}]:not([data-revealed]) > *`;
export const revealCss = `
    :root { --reveal-duration: ${revealConfig.durationMs}ms; --reveal-distance: ${revealConfig.distancePx}px; --reveal-ease: cubic-bezier(.22, .61, .36, 1); }
    @media ${revealConfig.mobile.query} { :root { --reveal-duration: ${revealConfig.mobile.durationMs}ms; --reveal-distance: ${revealConfig.mobile.distancePx}px; } }
    ${hidden('')} { opacity: 0; }
    ${hidden('="fade-up"')} { transform: translate3d(0, var(--reveal-distance), 0); }
    ${hidden('="fade-left"')} { transform: translate3d(var(--reveal-distance), 0, 0); }
    ${hidden('="fade-right"')} { transform: translate3d(calc(var(--reveal-distance) * -1), 0, 0); }
    ${hidden('="scale-soft"')} { transform: scale(.97); }
    [data-reveal]:not([data-reveal-done]), [data-reveal-group]:not([data-reveal-done]) > * {
        transition: opacity var(--reveal-duration) var(--reveal-ease) var(--reveal-delay, 0ms), transform var(--reveal-duration) var(--reveal-ease) var(--reveal-delay, 0ms);
    }
    @media (prefers-reduced-motion: reduce) {
        ${hidden('')} { opacity: 1 !important; transform: none !important; transition: none !important; }
    }
`;
