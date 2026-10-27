import { useEffect, useState } from 'react';

import { prefersReducedMotion } from '@/reveal/revealObserver';

// Seções da home, na ordem da página. "inicio" é o topo.
export const sections = ['inicio', 'servicos', 'sobre', 'contato'] as const;
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
