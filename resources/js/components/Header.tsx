import { keyframes } from '@emotion/react';
import MenuIcon from '@mui/icons-material/Menu';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import useScrollTrigger from '@mui/material/useScrollTrigger';
import { type MouseEvent, useLayoutEffect, useRef, useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router';

import FetechLogo from '@/components/FetechLogo';
import { scrollToSection, sectionOf, useActiveSection } from '@/navigation';
import { brand } from '@/theme';

export const navItems = [
    { label: 'Home', to: '/' },
    { label: 'Serviços', to: '/#servicos' },
    { label: 'Sobre', to: '/#sobre' },
    { label: 'Blog', to: '/blog' },
];

const cta = { label: 'Orçamento', to: '/#contato' };

// Ao rolar, o menu vira uma barra fixa que desce do topo
const slideDown = keyframes`
    from { transform: translateY(-100%); }
    to { transform: translateY(0); }
`;

export default function Header() {
    const [open, setOpen] = useState(false);
    const { pathname } = useLocation();
    const scrolled = useScrollTrigger({ disableHysteresis: true, threshold: 90 });

    // Só a home tem o topo em tela cheia por trás do menu transparente
    const overHero = pathname === '/';
    const solid = scrolled || !overHero;

    // Na home o item ativo segue a seção na tela; nas outras páginas, a rota
    const section = useActiveSection(overHero);
    const isActive = (to: string) => (overHero ? sectionOf(to) === section : to === pathname);

    // Na home os itens rolam suave até a seção; fora dela, o router navega e a home rola ao abrir
    function go(event: MouseEvent, to: string) {
        setOpen(false);
        const id = sectionOf(to);
        if (overHero && id) {
            event.preventDefault();
            scrollToSection(id);
        }
    }

    // Traço embaixo do item ativo: mede o item e desliza até ele
    const navRef = useRef<HTMLElement>(null);
    const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);
    useLayoutEffect(() => {
        const place = () => {
            const link = navRef.current?.querySelector<HTMLElement>('a[aria-current="page"]:not([data-cta])');
            setIndicator(link ? { left: link.offsetLeft + 12, width: link.offsetWidth - 24 } : null);
        };
        place();
        document.fonts?.ready.then(place);
        window.addEventListener('resize', place);
        return () => window.removeEventListener('resize', place);
    }, [section, pathname]);

    return (
        <AppBar
            position={overHero ? (scrolled ? 'fixed' : 'absolute') : 'sticky'}
            elevation={solid ? 6 : 0}
            sx={{
                bgcolor: solid ? brand.red : 'transparent',
                color: '#fff',
                mt: solid ? 0 : { md: 3.75 },
                animation: overHero && scrolled ? `${slideDown} .4s` : 'none',
                '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
            }}
        >
            <Container maxWidth="lg">
                <Toolbar disableGutters sx={{ minHeight: { xs: 64, md: 72 } }}>
                    <Box
                        component={RouterLink}
                        to="/"
                        onClick={(event: MouseEvent) => go(event, '/')}
                        sx={{ display: 'flex', color: '#fff', mr: 'auto' }}
                        aria-label="Fetech: página inicial"
                    >
                        <FetechLogo sx={{ width: { xs: 145, md: 160 }, height: 'auto', aspectRatio: '200 / 55' }} />
                    </Box>

                    <Box
                        component="nav"
                        ref={navRef}
                        aria-label="Principal"
                        sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1.25, position: 'relative' }}
                    >
                        {navItems.map((item) => (
                            <Button
                                key={item.to}
                                component={RouterLink}
                                to={item.to}
                                onClick={(event: MouseEvent) => go(event, item.to)}
                                aria-current={isActive(item.to) ? 'page' : undefined}
                                color="inherit"
                                sx={{ fontSize: 16, fontWeight: 400, '&:hover': { bgcolor: 'rgba(0,0,0,.15)' } }}
                            >
                                {item.label}
                            </Button>
                        ))}
                        {indicator && (
                            <Box
                                aria-hidden="true"
                                sx={{
                                    position: 'absolute',
                                    bottom: 2,
                                    left: 0,
                                    height: 2,
                                    borderRadius: 1,
                                    bgcolor: '#fff',
                                    width: indicator.width,
                                    transform: `translateX(${indicator.left}px)`,
                                    transition: 'transform .35s cubic-bezier(.22,.61,.36,1), width .35s cubic-bezier(.22,.61,.36,1)',
                                    '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
                                    pointerEvents: 'none',
                                }}
                            />
                        )}
                        <Button
                            component={RouterLink}
                            to={cta.to}
                            onClick={(event: MouseEvent) => go(event, cta.to)}
                            aria-current={isActive(cta.to) ? 'page' : undefined}
                            data-cta
                            sx={{
                                ml: 1,
                                fontSize: 16,
                                fontWeight: 400,
                                color: '#fff',
                                border: `1px solid ${solid ? '#fff' : brand.red}`,
                                bgcolor: solid ? 'transparent' : brand.red,
                                transition: 'background-color .5s, color .5s',
                                '&:hover': { bgcolor: solid ? '#fff' : 'transparent', color: solid ? brand.red : '#fff' },
                            }}
                        >
                            {cta.label}
                        </Button>
                    </Box>

                    <IconButton edge="end" color="inherit" aria-label="Abrir menu" onClick={() => setOpen(true)} sx={{ display: { md: 'none' } }}>
                        <MenuIcon />
                    </IconButton>
                </Toolbar>
            </Container>

            <Drawer
                anchor="left"
                open={open}
                onClose={() => setOpen(false)}
                slotProps={{ paper: { sx: { width: 260, bgcolor: brand.red, color: '#fff', pt: '30vh' } } }}
            >
                <List component="nav">
                    {[...navItems, cta].map((item) => (
                        <ListItemButton
                            key={item.to}
                            component={RouterLink}
                            to={item.to}
                            onClick={(event: MouseEvent) => go(event, item.to)}
                            selected={isActive(item.to)}
                            aria-current={isActive(item.to) ? 'page' : undefined}
                            sx={{
                                textAlign: 'center',
                                '&:hover, &.Mui-selected, &.Mui-selected:hover': { bgcolor: brand.redDark },
                                '&.Mui-selected .MuiListItemText-primary': { fontWeight: 700 },
                            }}
                        >
                            <ListItemText primary={item.label} />
                        </ListItemButton>
                    ))}
                </List>
            </Drawer>
        </AppBar>
    );
}
