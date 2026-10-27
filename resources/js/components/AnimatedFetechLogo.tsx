import Box from '@mui/material/Box';
import { useEffect, useRef } from 'react';

import './logo-fetech.js';

// Logo FETECH animado (layout 10 do componente LogoFetech do design system Botânica Aquarela).
// O logo-fetech.js é copiado sem alterações e expõe window.LogoFetech. Uma instância por montagem:
// toca só com a barra final na tela e a aba visível; ao desmontar, para e remove o SVG.

interface LogoFetechInstance {
    svg: SVGSVGElement;
    tocar(): void;
    parar(): void;
    tocando(): boolean;
}

declare global {
    interface Window {
        LogoFetech?: { criar(element: Element, options?: { loop?: boolean; pausa?: number }): LogoFetechInstance };
    }
}

export default function AnimatedFetechLogo() {
    const host = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const element = host.current;
        if (!element || !window.LogoFetech) {
            return;
        }
        const logo = window.LogoFetech.criar(element, { loop: true });
        const target = element.closest('[data-barra-final]') ?? element;
        let visible = false;

        const sync = () => {
            if (visible && !document.hidden) {
                if (!logo.tocando()) {
                    logo.tocar();
                }
            } else {
                logo.parar();
            }
        };
        const observer = new IntersectionObserver(
            ([entry]) => {
                visible = entry.isIntersecting;
                sync();
            },
            { threshold: 0.4 },
        );
        observer.observe(target);
        document.addEventListener('visibilitychange', sync);

        return () => {
            observer.disconnect();
            document.removeEventListener('visibilitychange', sync);
            logo.parar();
            logo.svg.remove();
        };
    }, []);

    // A sobra no topo do viewBox é para a cabeça da moça: quem usa alinha pela base
    return <Box component="span" ref={host} sx={{ display: 'block', '& svg': { display: 'block', width: { xs: 104, sm: 120 }, height: 'auto' } }} />;
}
