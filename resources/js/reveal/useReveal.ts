import { type CSSProperties, useCallback } from 'react';

import { observeReveal, type RevealPreset } from '@/reveal/revealObserver';

interface UseRevealOptions {
    preset?: RevealPreset;
    /** Atraso em ms (no stagger, atraso do primeiro filho). */
    delay?: number;
    /** Anima os filhos diretos em sequência (cards, listas). */
    stagger?: boolean;
    /** Padrão true: revela uma vez e não repete ao rolar de volta. */
    once?: boolean;
}

// Devolve as props para espalhar em qualquer elemento ou componente do MUI que repasse ref e
// style ao DOM:  <Grid container {...useReveal({ stagger: true })}>
export function useReveal({ preset = 'fade-up', delay = 0, stagger = false, once = true }: UseRevealOptions = {}) {
    const ref = useCallback((node: HTMLElement | null) => (node ? observeReveal(node, { delay, stagger, once }) : undefined), [delay, stagger, once]);
    return {
        ref,
        'data-reveal': stagger ? undefined : preset,
        'data-reveal-group': stagger ? preset : undefined,
        style: { '--reveal-delay': `${delay}ms` } as CSSProperties,
    };
}
