import { keyframes } from '@emotion/react';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router';

import SectionTitle from '@/components/SectionTitle';
import { useReveal } from '@/reveal/useReveal';
import { brand, monoFont } from '@/theme';

// Peças comuns às páginas de serviço (criação de sites, loja virtual): animações do topo, prompt
// de terminal, dúvidas frequentes e a faixa final que leva ao orçamento.

export const ease = 'cubic-bezier(.22,.61,.36,1)';
export const noMotion = { '@media (prefers-reduced-motion: reduce)': { animation: 'none' } };

const heroIn = keyframes`
    from { opacity: 0; transform: translate3d(0, 8px, 0); }
    to { opacity: 1; transform: none; }
`;
export const entrance = (delay: number) => ({ animation: `${heroIn} .7s ${ease} ${delay}ms both`, ...noMotion });

const caret = keyframes`
    50% { opacity: 0; }
`;

/** Troca o título da aba enquanto a página estiver aberta. */
export function usePageTitle(title: string) {
    useEffect(() => {
        const previous = document.title;
        document.title = title;
        return () => {
            document.title = previous;
        };
    }, [title]);
}

/** Caminho em fonte mono com cursor piscando, acima do título do topo: "> servicos/loja-virtual" */
export function ServicePrompt({ path }: { path: string }) {
    return (
        <Typography sx={{ fontFamily: monoFont, fontSize: { xs: 13, md: 15 }, color: 'rgba(255,255,255,.75)', mb: 2, ...entrance(0) }}>
            <Box component="span" aria-hidden="true" sx={{ color: brand.red }}>
                {'>'}
            </Box>{' '}
            {path}
            <Box
                component="span"
                aria-hidden="true"
                sx={{ display: 'inline-block', width: '.6ch', height: '1.1em', ml: '.3ch', verticalAlign: 'text-bottom', bgcolor: brand.red, animation: `${caret} 1s step-end infinite`, ...noMotion }}
            />
        </Typography>
    );
}

/** Fundo grafite com o brilho vermelho dos topos da Fetech */
export const graphiteGlow = (at: string) =>
    `radial-gradient(70% 70% at ${at}, rgba(224,20,59,.45), transparent 70%), linear-gradient(160deg, ${brand.graphiteLight}, ${brand.graphite} 60%)`;

export interface FaqItem {
    q: string;
    a: string;
}

export function ServiceFaq({ items }: { items: FaqItem[] }) {
    const list = useReveal({ stagger: true, preset: 'fade', delay: 60 });
    const [open, setOpen] = useState<number | false>(0);
    return (
        <Box component="section" sx={{ bgcolor: brand.section, py: { xs: 8, md: 12.5 } }}>
            <Container maxWidth="md">
                <SectionTitle>Dúvidas frequentes</SectionTitle>
                <Box {...list}>
                    {items.map((item, index) => (
                        <Accordion
                            key={item.q}
                            disableGutters
                            elevation={0}
                            expanded={open === index}
                            onChange={(_, expanded) => setOpen(expanded ? index : false)}
                            sx={{
                                mb: 1.5,
                                borderRadius: '10px !important',
                                border: `1px solid ${open === index ? brand.red : 'transparent'}`,
                                transition: `border-color .3s ${ease}`,
                                '&::before': { display: 'none' },
                            }}
                        >
                            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: brand.red }} />} sx={{ px: 3, py: 0.5 }}>
                                <Typography component="h3" sx={{ fontWeight: 600, fontSize: 17 }}>
                                    {item.q}
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails sx={{ px: 3, pb: 3, pt: 0 }}>
                                <Typography sx={{ color: brand.ink }}>{item.a}</Typography>
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </Box>
            </Container>
        </Box>
    );
}

interface ServiceCtaProps {
    prompt: string;
    title: string;
    text: string;
    button: string;
}

export function ServiceCta({ prompt, title, text, button }: ServiceCtaProps) {
    const content = useReveal({ stagger: true, preset: 'fade', delay: 80 });
    return (
        <Box component="section" sx={{ bgcolor: brand.red, color: '#fff', py: { xs: 8, md: 10 } }}>
            <Container maxWidth="md">
                <Box {...content} sx={{ textAlign: 'center' }}>
                    <Typography sx={{ fontFamily: monoFont, opacity: 0.8, mb: 1.5 }}>{`> ${prompt}`}</Typography>
                    <Typography variant="h4" component="h2" sx={{ fontSize: { xs: 26, md: 36 }, mb: 2 }}>
                        {title}
                    </Typography>
                    <Typography sx={{ fontSize: 18, opacity: 0.85, mb: 4 }}>{text}</Typography>
                    <Button
                        variant="outlined"
                        color="inherit"
                        size="large"
                        component={RouterLink}
                        to="/orcamento-site"
                        endIcon={<ArrowForwardIcon />}
                        sx={{ borderColor: '#fff', '&:hover': { bgcolor: '#fff', color: brand.red } }}
                    >
                        {button}
                    </Button>
                </Box>
            </Container>
        </Box>
    );
}
