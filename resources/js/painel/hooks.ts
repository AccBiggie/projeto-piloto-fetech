import { useEffect, useState } from 'react';

/** Devolve o valor só depois de ele ficar `delay` ms sem mudar (busca enquanto a pessoa digita). */
export function useDebouncedValue<T>(value: T, delay = 350): T {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const timer = window.setTimeout(() => setDebounced(value), delay);
        return () => window.clearTimeout(timer);
    }, [value, delay]);

    return debounced;
}
