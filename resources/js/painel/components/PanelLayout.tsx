import CloseIcon from '@mui/icons-material/Close';
import LogoutIcon from '@mui/icons-material/LogoutOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import ReceiptIcon from '@mui/icons-material/ReceiptLongOutlined';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { type ReactNode, useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router';

import FetechLogo from '@/components/FetechLogo';
import type { Session } from '@/painel/api';
import { brand, monoFont, theme } from '@/theme';

const sidebarWidth = 240;

export default function PanelLayout({ session, onLogout, children }: { session: Session; onLogout: () => void; children: ReactNode }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const desktop = useMediaQuery(theme.breakpoints.up('md'));
    const { pathname } = useLocation();
    const invoicesActive = pathname === '/' || pathname.startsWith('/clientes/');

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: brand.section }}>
            <AppBar
                position="sticky"
                elevation={0}
                sx={{ background: `radial-gradient(60% 140% at 0% 100%, rgba(224,20,59,.35), transparent 70%), linear-gradient(160deg, ${brand.graphiteLight}, ${brand.graphite} 60%)` }}
            >
                <Toolbar sx={{ gap: 2 }}>
                    <IconButton
                        edge="start"
                        color="inherit"
                        aria-label="Abrir menu"
                        aria-controls={menuOpen ? 'panel-navigation' : undefined}
                        aria-expanded={menuOpen}
                        onClick={() => setMenuOpen(true)}
                        sx={{ display: { md: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Box component={RouterLink} to="/" aria-label="Clientes" sx={{ color: '#fff', display: 'flex', alignItems: 'center', gap: 1.5, textDecoration: 'none' }}>
                        <FetechLogo sx={{ width: 120, height: 'auto', aspectRatio: '200 / 55' }} />
                        <Typography component="span" sx={{ fontFamily: monoFont, fontSize: 13, color: 'rgba(255,255,255,.7)', display: { xs: 'none', sm: 'inline' } }}>
                            / painel
                        </Typography>
                    </Box>
                    <Box sx={{ flex: 1 }} />
                    <Typography sx={{ fontSize: 14, color: 'rgba(255,255,255,.8)', display: { xs: 'none', md: 'block' } }}>{session.name}</Typography>
                    <Button color="inherit" startIcon={<LogoutIcon />} onClick={onLogout} sx={{ paddingInline: 1.5 }}>
                        Sair
                    </Button>
                </Toolbar>
            </AppBar>
            <Box sx={{ display: 'flex' }}>
                <Drawer
                    variant={desktop ? 'permanent' : 'temporary'}
                    open={desktop || menuOpen}
                    onClose={() => setMenuOpen(false)}
                    sx={{ width: { md: sidebarWidth }, flexShrink: 0 }}
                    slotProps={{
                        paper: {
                            sx: {
                                width: sidebarWidth,
                                boxSizing: 'border-box',
                                top: { md: 64 },
                                height: { md: 'calc(100% - 64px)' },
                                bgcolor: brand.graphite,
                                color: '#fff',
                                borderRight: 0,
                            },
                        },
                    }}
                >
                    <Toolbar sx={{ justifyContent: 'space-between' }}>
                        <Typography sx={{ fontFamily: monoFont, fontSize: 13, color: 'rgba(255,255,255,.7)' }}>Menu</Typography>
                        {!desktop && (
                            <IconButton edge="end" color="inherit" aria-label="Fechar menu" onClick={() => setMenuOpen(false)}>
                                <CloseIcon />
                            </IconButton>
                        )}
                    </Toolbar>
                    <List component="nav" id="panel-navigation" aria-label="Navegação do painel" sx={{ px: 2 }}>
                        <ListItemButton
                            component={RouterLink}
                            to="/"
                            selected={invoicesActive}
                            aria-current={invoicesActive ? 'page' : undefined}
                            onClick={() => setMenuOpen(false)}
                            sx={{
                                borderRadius: 1,
                                '&:hover, &.Mui-selected, &.Mui-selected:hover': { bgcolor: brand.redDark },
                                '&.Mui-selected .MuiListItemText-primary': { fontWeight: 700 },
                                '&.Mui-focusVisible': { outline: '2px solid #fff', outlineOffset: 2 },
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
                                <ReceiptIcon />
                            </ListItemIcon>
                            <ListItemText primary="Faturas" />
                        </ListItemButton>
                    </List>
                </Drawer>
                <Container component="main" maxWidth="lg" sx={{ minWidth: 0, py: { xs: 3, md: 5 } }}>
                    {children}
                </Container>
            </Box>
        </Box>
    );
}
