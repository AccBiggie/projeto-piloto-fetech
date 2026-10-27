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
import { useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router';

import FetechLogo from '@/components/FetechLogo';
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
                    <Box component={RouterLink} to="/" sx={{ display: 'flex', color: '#fff', mr: 'auto' }} aria-label="Fetech: página inicial">
                        <FetechLogo sx={{ width: { xs: 145, md: 160 }, height: 'auto', aspectRatio: '200 / 55' }} />
                    </Box>

                    <Box component="nav" sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1.25 }}>
                        {navItems.map((item) => (
                            <Button
                                key={item.to}
                                component={RouterLink}
                                to={item.to}
                                color="inherit"
                                sx={{ fontSize: 16, fontWeight: 400, '&:hover': { bgcolor: 'rgba(0,0,0,.15)' } }}
                            >
                                {item.label}
                            </Button>
                        ))}
                        <Button
                            component={RouterLink}
                            to={cta.to}
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
                            onClick={() => setOpen(false)}
                            sx={{ textAlign: 'center', '&:hover': { bgcolor: brand.redDark } }}
                        >
                            <ListItemText primary={item.label} />
                        </ListItemButton>
                    ))}
                </List>
            </Drawer>
        </AppBar>
    );
}
