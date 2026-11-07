import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation, useNavigationType } from 'react-router';

import { prefersReducedMotion } from '@/reveal/revealObserver';

// Seções da home, na ordem da página. "inicio" é o topo.
export const sections = ['inicio', 'servicos', 'sobre'] as const;
export type SectionId = (typeof sections)[number];

/** Seção de um link do menu ("/" -> inicio, "/#servicos" -> servicos); null para outras rotas. */
export function sectionOf(to: string): SectionId | null {
    const id = to === '/' ? 'inicio' : to.startsWith('/#') ? to.slice(2) : null;
    return (sections as readonly string[]).includes(id ?? '') ? (id as SectionId) : null;
}

/** Rola suavemente até a seção ou elemento. O html tem scroll-padding-top com a altura do menu fixo. */
export function scrollToSection(id: string) {
    const behavior: ScrollBehavior = prefersReducedMotion() ? 'auto' : 'smooth';
    if (id === 'inicio') {
        window.scrollTo({ top: 0, behavior });
        return;
    }
    // Seções alinham pelo topo; outros alvos (como os cards de serviço) ficam no centro da tela, o
    // que também absorve o deslocamento da animação de entrada que o card ainda pode ter
    const block: ScrollLogicalPosition = (sections as readonly string[]).includes(id) ? 'start' : 'center';
    document.getElementById(id)?.scrollIntoView({ behavior, block });
}

const SCROLL_STORAGE = 'fetech:scroll';

function readScrollPositions(): Record<string, number> {
    try {
        return JSON.parse(sessionStorage.getItem(SCROLL_STORAGE) ?? '{}');
    } catch {
        return {};
    }
}

/**
 * Rolagem entre páginas, já que a SPA não recarrega o documento:
 * - link para outra página: abre no topo (antes, abria na rolagem da página anterior);
 * - link com âncora ("/#sobre"): não mexe, a home rola até a seção;
 * - voltar/avançar e recarregar: volta para onde a pessoa estava naquela entrada do histórico.
 *
 * A restauração é manual porque a do navegador acontece no popstate, antes de o React trocar a
 * página, e parava no meio do caminho. As posições ficam por entrada do histórico (location.key) e
 * vão para o sessionStorage ao sair, para valerem também depois de recarregar.
 */
export function useScrollRestoration() {
    const { key, pathname, hash } = useLocation();
    const navigationType = useNavigationType();
    const positions = useRef<Record<string, number> | null>(null);
    const currentKey = useRef(key);
    const previousPath = useRef<string | null>(null);

    useEffect(() => {
        history.scrollRestoration = 'manual';
        const onScroll = () => {
            (positions.current ??= readScrollPositions())[currentKey.current] = Math.round(window.scrollY);
        };
        const save = () => {
            try {
                sessionStorage.setItem(SCROLL_STORAGE, JSON.stringify(positions.current ?? {}));
            } catch {
                // Sem sessionStorage a posição só não sobrevive a um recarregamento
            }
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('pagehide', save);
        return () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('pagehide', save);
        };
    }, []);

    // Antes da pintura, com a página nova já no DOM: ela não aparece por um instante na rolagem
    // antiga. "instant" ignora o scroll-behavior: smooth do html.
    useLayoutEffect(() => {
        const saved = (positions.current ??= readScrollPositions());
        // A primeira entrada da aba sempre se chama "default". Num documento aberto do zero (endereço
        // digitado, link de fora) ela é outra visita, e a posição guardada de uma visita anterior não
        // vale; ao recarregar ou voltar de outro site, vale.
        const load = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
        if (previousPath.current === null && load?.type === 'navigate') delete saved.default;
        // Daqui em diante a rolagem pertence à nova entrada do histórico
        currentKey.current = key;
        const pageChanged = previousPath.current !== pathname;
        previousPath.current = pathname;

        if (navigationType === 'POP') {
            if (saved[key] !== undefined) {
                window.scrollTo({ top: saved[key], left: 0, behavior: 'instant' });
            }
        } else if (pageChanged && !hash) {
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        }
    }, [key]);
}

// Marca no menu a seção que está sendo lida. Lê a posição direto no scroll (em vez de
// IntersectionObserver), porque comparar áreas de interseção elegia a seção mais alta, e não a que
// está na tela. A linha de leitura muda conforme a direção: descendo, a próxima seção assume mais
// cedo; subindo, devolve mais cedo. Essa histerese evita o menu piscar entre dois itens na fronteira.
const READ_LINE_DOWN = 0.45;
const READ_LINE_UP = 0.55;

export function useActiveSection(enabled: boolean) {
    const [active, setActive] = useState<SectionId>(sections[0]);

    useEffect(() => {
        if (!enabled) {
            return;
        }
        let previousY = window.scrollY;
        let frame = 0;
        const measure = () => {
            frame = 0;
            const y = window.scrollY;
            const goingDown = y >= previousY;
            previousY = y;
            // No fim da página a última seção pode nunca alcançar a linha de leitura
            if (Math.ceil(y + window.innerHeight) >= document.documentElement.scrollHeight) {
                setActive(sections[sections.length - 1]);
                return;
            }
            const line = window.innerHeight * (goingDown ? READ_LINE_DOWN : READ_LINE_UP);
            let current: SectionId = sections[0];
            sections.forEach((id) => {
                const node = document.getElementById(id);
                if (node && node.getBoundingClientRect().top <= line) current = id;
            });
            setActive(current);
        };
        const onScroll = () => {
            if (!frame) frame = requestAnimationFrame(measure);
        };
        measure();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
        return () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
            if (frame) cancelAnimationFrame(frame);
        };
    }, [enabled]);

    return enabled ? active : null;
}
