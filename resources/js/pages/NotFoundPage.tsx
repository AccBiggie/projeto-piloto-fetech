import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Link as RouterLink, useLocation } from 'react-router';

import { ease, entrance, graphiteGlow, usePageTitle } from '@/components/ServiceSections';
import { services } from '@/components/Services';
import { brand, monoFont, titleFont } from '@/theme';

// Endereço que não existe: topo grafite como o das páginas de serviço, com o caminho pedido num
// "terminal" e atalhos para as páginas principais.

const shortcuts = [
    ...services.flatMap(({ page, title, Icon }) => (page ? [{ to: page, label: title, Icon }] : [])),
    { to: '/blog', label: 'Blog', Icon: ArticleOutlinedIcon },
];

// "%C3%A7" vira "ç"; um endereço com escape inválido é mostrado como veio, sem quebrar a página
function readablePath(pathname: string) {
    try {
        return decodeURI(pathname);
    } catch {
        return pathname;
    }
}

export default function NotFoundPage() {
    usePageTitle('Página não encontrada – Fetech');
    const { pathname } = useLocation();

    return (
        <Box
            component="section"
            sx={{ flex: 1, display: 'flex', alignItems: 'center', color: '#fff', background: graphiteGlow('0% 100%'), py: { xs: 8, md: 12 } }}
        >
            <Container maxWidth="lg">
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.1fr 1fr' }, gap: { xs: 5, md: 8 }, alignItems: 'center' }}>
                    <Box>
                        <Box
                            sx={{
                                fontFamily: monoFont,
                                fontSize: { xs: 13, md: 15 },
                                color: 'rgba(255,255,255,.75)',
                                mb: 3,
                                overflowWrap: 'anywhere',
                                ...entrance(0),
                            }}
                        >
                            <Box component="span" aria-hidden="true" sx={{ color: brand.red }}>
                                {'> '}
                            </Box>
                            cd {readablePath(pathname)}
                            <Box component="span" sx={{ display: 'block', color: 'rgba(255,255,255,.5)' }}>
                                erro 404: caminho não encontrado
                            </Box>
                        </Box>
                        <Typography variant="h2" component="h1" sx={{ fontSize: { xs: 34, md: 52 }, lineHeight: 1.15, mb: 2, ...entrance(150) }}>
                            Essa página <Box component="span" sx={{ color: brand.red }}>não existe</Box>.
                        </Typography>
                        <Typography sx={{ fontSize: { xs: 16, md: 18 }, color: 'rgba(255,255,255,.75)', maxWidth: 520, mb: 4, ...entrance(250) }}>
                            O endereço pode ter sido digitado errado ou a página mudou de lugar. Use um dos atalhos para continuar navegando.
                        </Typography>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ ...entrance(350) }}>
                            <Button variant="contained" size="large" component={RouterLink} to="/" startIcon={<HomeOutlinedIcon />}>
                                Página inicial
                            </Button>
                            <Button
                                variant="outlined"
                                color="inherit"
                                size="large"
                                component={RouterLink}
                                to="/orcamento-site"
                                endIcon={<ArrowForwardIcon />}
                                sx={{ borderColor: 'rgba(255,255,255,.6)', '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,.08)' } }}
                            >
                                Pedir orçamento
                            </Button>
                        </Stack>
                    </Box>

                    <Box sx={{ ...entrance(450) }}>
                        <Typography
                            aria-hidden="true"
                            sx={{
                                fontFamily: titleFont,
                                fontSize: { xs: 96, md: 160 },
                                lineHeight: 1,
                                mb: 3,
                                color: 'transparent',
                                WebkitTextStroke: `2px ${brand.red}`,
                                textShadow: '0 0 40px rgba(224,20,59,.35)',
                                display: { xs: 'none', md: 'block' },
                            }}
                        >
                            404
                        </Typography>
                        <Typography component="h2" sx={{ fontFamily: monoFont, fontSize: 13, color: 'rgba(255,255,255,.55)', mb: 1.5 }}>
                            {'// talvez você procure'}
                        </Typography>
                        <Stack component="ul" spacing={1} sx={{ listStyle: 'none', p: 0, m: 0 }}>
                            {shortcuts.map(({ to, label, Icon }) => (
                                <li key={to}>
                                    <Box
                                        component={RouterLink}
                                        to={to}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1.5,
                                            px: 2,
                                            py: 1.25,
                                            borderRadius: 1.5,
                                            color: '#fff',
                                            textDecoration: 'none',
                                            bgcolor: 'rgba(255,255,255,.04)',
                                            border: '1px solid rgba(255,255,255,.08)',
                                            transition: `border-color .3s ${ease}, background-color .3s ${ease}`,
                                            '&:hover, &:focus-visible': { borderColor: brand.red, bgcolor: 'rgba(224,20,59,.1)' },
                                            '&:focus-visible': { outline: `2px solid ${brand.red}`, outlineOffset: 2 },
                                            '&:hover .arrow': { transform: 'translateX(4px)' },
                                        }}
                                    >
                                        <Icon fontSize="small" sx={{ color: brand.red }} />
                                        <Box component="span" sx={{ flex: 1 }}>
                                            {label}
                                        </Box>
                                        <ArrowForwardIcon className="arrow" fontSize="small" sx={{ opacity: 0.5, transition: `transform .3s ${ease}` }} />
                                    </Box>
                                </li>
                            ))}
                        </Stack>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
}
