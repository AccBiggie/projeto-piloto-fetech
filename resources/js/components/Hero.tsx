import { keyframes } from '@emotion/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import { brand, brandGradient } from '@/theme';

const float = keyframes`
    from { transform: translateX(0) rotate(90deg); }
    to { transform: translateX(100px) rotate(90deg); }
`;

const blink = keyframes`
    0%, 100% { opacity: 0; }
    50% { opacity: 1; }
`;

const noMotion = { '@media (prefers-reduced-motion: reduce)': { animation: 'none' } };

// Entrada curta e discreta da chamada, que já está na tela ao carregar
const heroIn = keyframes`
    from { opacity: 0; transform: translate3d(0, 8px, 0); }
    to { opacity: 1; transform: none; }
`;
const entrance = (delay: number) => ({ animation: `${heroIn} .7s cubic-bezier(.22,.61,.36,1) ${delay}ms both`, ...noMotion });

// Triângulo de cantos arredondados: o traço grosso com junção redonda arredonda as pontas
function Triangle({ x, y, size, fill, flip = false }: { x: number; y: number; size: number; fill: string; flip?: boolean }) {
    const h = size * 0.866;
    const points = flip ? `0,0 ${size},0 ${size / 2},${h}` : `${size / 2},0 ${size},${h} 0,${h}`;
    return (
        <polygon
            points={points}
            transform={`translate(${x} ${y})`}
            fill={fill}
            stroke={fill}
            strokeWidth={size * 0.12}
            strokeLinejoin="round"
        />
    );
}

function Backdrop() {
    return (
        <Box
            component="svg"
            viewBox="0 0 1920 1080"
            preserveAspectRatio="xMinYMax slice"
            aria-hidden="true"
            sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        >
            <defs>
                <linearGradient id="hero-big" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor={brand.redDark} />
                    <stop offset="1" stopColor={brand.red} stopOpacity="0.9" />
                </linearGradient>
                <linearGradient id="hero-small" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor={brand.red} stopOpacity="0.95" />
                    <stop offset="1" stopColor={brand.redDark} />
                </linearGradient>
            </defs>
            <Triangle x={-60} y={460} size={900} fill="url(#hero-big)" />
            <Triangle x={1300} y={150} size={80} fill="url(#hero-small)" />
            <Triangle x={1390} y={185} size={95} fill="url(#hero-small)" flip />
            <Triangle x={1690} y={90} size={90} fill="url(#hero-small)" />
            <Triangle x={1650} y={150} size={120} fill="url(#hero-small)" flip />
            <Triangle x={1730} y={830} size={120} fill="url(#hero-small)" />
            <Triangle x={1600} y={935} size={85} fill="url(#hero-small)" />
            <Triangle x={1680} y={960} size={100} fill="url(#hero-small)" flip />
            <Triangle x={1790} y={965} size={120} fill="url(#hero-small)" flip />
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
                background: brandGradient,
                color: '#fff',
            }}
        >
            <Backdrop />

            <Container maxWidth="lg" sx={{ position: 'relative' }}>
                <Grid container spacing={4} sx={{ alignItems: 'center' }}>
                    <Grid size={{ xs: 12, md: 6 }} sx={{ display: { xs: 'none', md: 'block' } }}>
                        <Box
                            component="svg"
                            viewBox="0 0 120 104"
                            aria-hidden="true"
                            sx={{ width: 124, animation: `${float} 5s cubic-bezier(.18,.89,.32,1.28) 2s infinite alternate`, transform: 'rotate(90deg)', ...noMotion }}
                        >
                            <Triangle x={10} y={8} size={100} fill="url(#hero-small)" />
                        </Box>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }} sx={{ textAlign: 'right' }}>
                        <Typography variant="h2" component="h1" sx={{ fontSize: { xs: 30, md: 50 }, lineHeight: 1.2, mb: 3, ...entrance(0) }}>
                            Criamos, desenvolvemos e entregamos soluções em tecnologia para o seu negócio.
                        </Typography>
                        <Button
                            variant="outlined"
                            color="inherit"
                            size="large"
                            href="#contato"
                            sx={{ textTransform: 'uppercase', borderColor: '#fff', '&:hover': { bgcolor: '#fff', color: brand.red }, ...entrance(120) }}
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
