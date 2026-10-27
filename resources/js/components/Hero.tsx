import { keyframes } from '@emotion/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router';

import { brand, monoFont } from '@/theme';

// Identidade do site original da Fetech: grafite com brilho vermelho difuso (wallpaper), tagline
// monoespaçada e a mistura de hardware com código, aqui num chip com trilhas de circuito.

const blink = keyframes`
    0%, 100% { opacity: 0; }
    50% { opacity: 1; }
`;

const caret = keyframes`
    50% { opacity: 0; }
`;

const drift = keyframes`
    from { transform: translate3d(0, 0, 0) scale(1); }
    to { transform: translate3d(6%, -8%, 0) scale(1.12); }
`;

const float = keyframes`
    from { transform: translateY(0); }
    to { transform: translateY(-12px); }
`;

const breathe = keyframes`
    from { opacity: .45; }
    to { opacity: 1; }
`;

// Pulso de dados correndo do chip para fora, ao longo da trilha (pathLength = 100)
const pulse = keyframes`
    from { stroke-dashoffset: 12; }
    to { stroke-dashoffset: -100; }
`;

const underline = keyframes`
    from { transform: scaleX(0); }
    to { transform: scaleX(1); }
`;

const noMotion = { '@media (prefers-reduced-motion: reduce)': { animation: 'none' } };

// Entrada curta e discreta da chamada, que já está na tela ao carregar
const heroIn = keyframes`
    from { opacity: 0; transform: translate3d(0, 8px, 0); }
    to { opacity: 1; transform: none; }
`;
const entrance = (delay: number) => ({ animation: `${heroIn} .7s cubic-bezier(.22,.61,.36,1) ${delay}ms both`, ...noMotion });

const tagline = 'Professional Hardware and Technology';

// A tagline se digita ao carregar e de novo a cada 1 min: digita em 1,6 s, fica parada e, no fim
// do ciclo, se apaga em 1,8 s para recomeçar. O steps() vale para cada trecho entre os quadros.
const typingCycle = 60;
const typedAt = (1.6 / typingCycle) * 100;
const erasingAt = 100 - (1.8 / typingCycle) * 100;
const typing = keyframes`
    0% { width: 0; }
    ${typedAt}%, ${erasingAt}% { width: ${tagline.length}ch; }
    100% { width: 0; }
`;

// Trilhas saindo dos 5 pinos de cada lado do chip (centro em 240,240; corpo de 170 a 310).
// Cada trilha sai reta, abre em 45° para longe do centro e termina num via.
const pinOffsets = [190, 215, 240, 265, 290];
const sides = [
    { out: [0, -1], tan: [1, 0], edge: (o: number) => [o, 170] },
    { out: [1, 0], tan: [0, 1], edge: (o: number) => [310, o] },
    { out: [0, 1], tan: [1, 0], edge: (o: number) => [o, 310] },
    { out: [-1, 0], tan: [0, 1], edge: (o: number) => [170, o] },
];

const traces = sides.flatMap((side, s) =>
    pinOffsets.map((offset, i) => {
        const spread = i - 2;
        const move = ([x, y]: number[], out: number, tan: number) => [x + side.out[0] * out + side.tan[0] * tan, y + side.out[1] * out + side.tan[1] * tan];
        const edge = side.edge(offset);
        const start = move(edge, 14, 0);
        const bend = move(start, 16, 0);
        const diagonal = Math.abs(spread) * 22;
        const turn = move(bend, diagonal, Math.sign(spread) * diagonal);
        const end = move(turn, 36 + ((s * 5 + i * 3) % 4) * 14, 0);
        const key = s * 5 + i;
        return {
            key,
            edge,
            start,
            end,
            d: `M${start} L${bend} L${turn} L${end}`,
            // Só parte das trilhas pulsa, em tempos diferentes, para não parecer mecânico
            pulse: key % 3 === 0 ? { delay: (key * 0.37) % 3, duration: 2.6 + (i % 3) * 0.5 } : null,
        };
    }),
);

function Chip() {
    const line = 'rgba(255,255,255,.28)';
    return (
        <Box
            component="svg"
            viewBox="0 0 480 480"
            aria-hidden="true"
            sx={{
                width: '100%',
                maxWidth: 440,
                display: 'block',
                overflow: 'visible',
                animation: `${float} 5s ease-in-out infinite alternate`,
                // Duração e atraso de cada pulso vêm no style de cada trilha
                '& .pulse': { animation: `${pulse} 3s linear infinite` },
                '& .core-glow': { animation: `${breathe} 2.8s ease-in-out infinite alternate` },
                '@media (prefers-reduced-motion: reduce)': {
                    animation: 'none',
                    '& .pulse': { display: 'none' },
                    '& .core-glow': { animation: 'none' },
                },
            }}
        >
            <defs>
                <radialGradient id="hero-fade">
                    <stop offset=".45" stopColor="#fff" />
                    <stop offset="1" stopColor="#000" />
                </radialGradient>
                <mask id="hero-fade-mask">
                    <rect width="480" height="480" fill="url(#hero-fade)" />
                </mask>
                <radialGradient id="hero-core">
                    <stop offset="0" stopColor={brand.red} />
                    <stop offset="1" stopColor={brand.redDark} />
                </radialGradient>
                <filter id="hero-blur" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="18" />
                </filter>
            </defs>

            <g mask="url(#hero-fade-mask)" fill="none" strokeLinecap="round" strokeLinejoin="round">
                {traces.map((trace) => (
                    <g key={trace.key}>
                        <path d={`M${trace.edge} L${trace.start}`} stroke="rgba(255,255,255,.55)" strokeWidth={5} strokeLinecap="butt" />
                        <path d={trace.d} stroke={line} strokeWidth={2} />
                        <circle cx={trace.end[0]} cy={trace.end[1]} r={4.5} fill={brand.graphite} stroke="rgba(255,255,255,.4)" strokeWidth={2} />
                        {trace.pulse && (
                            <path
                                className="pulse"
                                d={trace.d}
                                pathLength={100}
                                stroke={brand.red}
                                strokeWidth={3}
                                strokeDasharray="12 100"
                                strokeDashoffset={12}
                                style={{
                                    animationDuration: `${trace.pulse.duration}s`,
                                    animationDelay: `${trace.pulse.delay}s`,
                                    filter: `drop-shadow(0 0 4px ${brand.red})`,
                                }}
                            />
                        )}
                    </g>
                ))}
            </g>

            <rect className="core-glow" x="190" y="190" width="100" height="100" rx="20" fill={brand.red} filter="url(#hero-blur)" />
            <rect x="170" y="170" width="140" height="140" rx="18" fill={brand.graphiteLight} stroke="rgba(255,255,255,.5)" strokeWidth={2} />
            <rect x="182" y="182" width="116" height="116" rx="12" fill="none" stroke="rgba(255,255,255,.12)" />
            <rect x="200" y="200" width="80" height="80" rx="10" fill="url(#hero-core)" />
            <text x="240" y="241" textAnchor="middle" dominantBaseline="middle" fill="#fff" fontFamily={monoFont} fontWeight={500} fontSize={26}>
                {'</>'}
            </text>
        </Box>
    );
}

// Fundo grafite com dois brilhos vermelhos que derivam devagar e uma malha de pontos de placa
function Backdrop() {
    const glow = (color: string) => `radial-gradient(circle, ${color} 0%, transparent 65%)`;
    return (
        <Box aria-hidden="true" sx={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
            <Box
                sx={{
                    position: 'absolute',
                    width: '80vmax',
                    height: '80vmax',
                    left: '-30vmax',
                    bottom: '-45vmax',
                    background: glow('rgba(224,20,59,.55)'),
                    animation: `${drift} 18s ease-in-out infinite alternate`,
                    ...noMotion,
                }}
            />
            <Box
                sx={{
                    position: 'absolute',
                    width: '60vmax',
                    height: '60vmax',
                    right: '-25vmax',
                    top: '-35vmax',
                    background: glow('rgba(140,10,36,.6)'),
                    animation: `${drift} 22s ease-in-out -6s infinite alternate-reverse`,
                    ...noMotion,
                }}
            />
            <Box
                sx={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: 'radial-gradient(rgba(255,255,255,.09) 1px, transparent 1.6px)',
                    backgroundSize: '26px 26px',
                    maskImage: 'linear-gradient(180deg, transparent 0%, #000 25%, #000 70%, transparent 100%)',
                }}
            />
        </Box>
    );
}

export default function Hero() {
    return (
        <Box
            component="section"
            id="inicio"
            sx={{
                position: 'relative',
                overflow: 'hidden',
                height: '100svh',
                minHeight: 560,
                display: 'flex',
                alignItems: 'center',
                background: `linear-gradient(160deg, ${brand.graphiteLight} 0%, ${brand.graphite} 60%)`,
                color: '#fff',
            }}
        >
            <Backdrop />

            <Container maxWidth="lg" sx={{ position: 'relative' }}>
                <Grid container spacing={4} sx={{ alignItems: 'center' }}>
                    <Grid size={{ xs: 12, md: 6 }} sx={{ display: { xs: 'none', md: 'block' } }}>
                        <Chip />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }} sx={{ textAlign: 'right' }}>
                        <Typography
                            component="p"
                            sx={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                alignItems: 'center',
                                fontFamily: monoFont,
                                fontSize: { xs: 13, md: 16 },
                                color: 'rgba(255,255,255,.75)',
                                mb: 2,
                            }}
                        >
                            <Box component="span" aria-hidden="true" sx={{ color: brand.red, mr: '1ch' }}>
                                {'>'}
                            </Box>
                            {/* Digitada letra a letra; ch funciona porque a fonte é monoespaçada */}
                            <Box
                                component="span"
                                sx={{
                                    display: 'inline-block',
                                    overflow: 'hidden',
                                    whiteSpace: 'nowrap',
                                    width: `${tagline.length}ch`,
                                    animation: `${typing} ${typingCycle}s steps(${tagline.length}) .2s infinite both`,
                                    ...noMotion,
                                }}
                            >
                                {tagline}
                            </Box>
                            <Box
                                component="span"
                                aria-hidden="true"
                                sx={{ width: '.6ch', height: '1.15em', ml: '.3ch', bgcolor: brand.red, animation: `${caret} 1s step-end infinite`, ...noMotion }}
                            />
                        </Typography>
                        <Typography variant="h2" component="h1" sx={{ fontSize: { xs: 30, md: 50 }, lineHeight: 1.2, mb: 3, ...entrance(150) }}>
                            Criamos, desenvolvemos e entregamos soluções em{' '}
                            <Box
                                component="span"
                                sx={{
                                    position: 'relative',
                                    whiteSpace: 'nowrap',
                                    '&::after': {
                                        content: '""',
                                        position: 'absolute',
                                        left: 0,
                                        right: 0,
                                        bottom: '.02em',
                                        height: '.12em',
                                        borderRadius: 1,
                                        bgcolor: brand.red,
                                        transformOrigin: 'left',
                                        animation: `${underline} .6s cubic-bezier(.22,.61,.36,1) 1s both`,
                                        ...noMotion,
                                    },
                                }}
                            >
                                tecnologia
                            </Box>{' '}
                            para o seu negócio.
                        </Typography>
                        <Button
                            variant="outlined"
                            color="inherit"
                            size="large"
                            component={RouterLink}
                            to="/orcamento-site"
                            sx={{ textTransform: 'uppercase', borderColor: '#fff', '&:hover': { bgcolor: '#fff', color: brand.red }, ...entrance(300) }}
                        >
                            Quero um orçamento
                        </Button>
                    </Grid>
                </Grid>
            </Container>

            {/* Setas animadas indicando que há conteúdo abaixo */}
            <Box
                component="a"
                href="#servicos"
                aria-label="Ir para os serviços"
                sx={{ position: 'absolute', left: '50%', bottom: 50, width: 24, height: 72, ml: '-12px' }}
            >
                {[0, 1, 2].map((i) => (
                    <Box
                        key={i}
                        component="span"
                        sx={{
                            position: 'absolute',
                            left: 0,
                            bottom: i * 16,
                            width: 24,
                            height: 24,
                            borderLeft: '1px solid #fff',
                            borderBottom: '1px solid #fff',
                            transform: 'rotate(-45deg)',
                            opacity: 0,
                            animation: `${blink} 2s infinite`,
                            animationDelay: `${i * 0.15}s`,
                            '@media (prefers-reduced-motion: reduce)': { animation: 'none', opacity: 1 },
                        }}
                    />
                ))}
            </Box>
        </Box>
    );
}
