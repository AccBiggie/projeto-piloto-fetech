import { keyframes } from '@emotion/react';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import MenuIcon from '@mui/icons-material/Menu';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Collapse from '@mui/material/Collapse';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Grow from '@mui/material/Grow';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Toolbar from '@mui/material/Toolbar';
import useScrollTrigger from '@mui/material/useScrollTrigger';
import { type KeyboardEvent, type MouseEvent, type PointerEvent, useLayoutEffect, useRef, useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router';

import FetechLogo from '@/components/FetechLogo';
import { services } from '@/components/Services';
import { scrollToSection, sectionOf, useActiveSection } from '@/navigation';
import { brand } from '@/theme';

export const navItems = [
    { label: 'Home', to: '/' },
    { label: 'Serviços', to: '/#servicos' },
    { label: 'Sobre', to: '/#sobre' },
    { label: 'Blog', to: '/blog' },
];

const cta = { label: 'Orçamento', to: '/#contato' };

// "Serviços" abre um submenu com âncoras para cada card da seção
const servicesTo = '/#servicos';
const serviceLinks = services.map((service) => ({ label: service.title, to: `/#${service.id}`, Icon: service.Icon }));

const servicesItemSx = { py: 1.25, '&:hover, &.Mui-focusVisible': { bgcolor: 'rgba(224,20,59,.18)' } } as const;

const drawerItemSx = {
    textAlign: 'center',
    '&:hover, &.Mui-selected, &.Mui-selected:hover': { bgcolor: brand.redDark },
    '&.Mui-selected .MuiListItemText-primary': { fontWeight: 700 },
} as const;

// Ao rolar, o menu vira uma barra fixa que desce do topo
const slideDown = keyframes`
    from { transform: translateY(-100%); }
    to { transform: translateY(0); }
`;

export default function Header() {
    const [open, setOpen] = useState(false);
    const [servicesOpen, setServicesOpen] = useState(false);
    // Aberto pelo teclado: o foco vai para o primeiro item
    const [servicesKeyboard, setServicesKeyboard] = useState(false);
    const [servicesOpenMobile, setServicesOpenMobile] = useState(false);
    const { pathname } = useLocation();
    const scrolled = useScrollTrigger({ disableHysteresis: true, threshold: 90 });

    // Só a home tem o topo em tela cheia por trás do menu transparente
    const overHero = pathname === '/';
    const solid = scrolled || !overHero;

    // Na home o item ativo segue a seção na tela; nas outras páginas, a rota
    const section = useActiveSection(overHero);
    const isActive = (to: string) => (overHero ? sectionOf(to) === section : to === pathname);

    // Na home os itens rolam suave até a seção (ou o card de serviço); fora dela, o router navega e
    // a home rola ao abrir
    function go(event: MouseEvent, to: string) {
        setOpen(false);
        setServicesOpen(false);
        const id = sectionOf(to) ?? (to.startsWith('/#') ? to.slice(2) : null);
        if (overHero && id) {
            event.preventDefault();
            scrollToSection(id);
        }
    }

    // Submenu de Serviços: abre no hover do mouse (com uma folga para atravessar até a lista), no
    // toque/clique e pelo teclado (Enter ou seta para baixo)
    const servicesButtonRef = useRef<HTMLButtonElement>(null);
    const hovering = useRef(false);
    const closeTimer = useRef<number | undefined>(undefined);
    function hoverServices(event: PointerEvent, enter: boolean) {
        if (event.pointerType !== 'mouse') return;
        hovering.current = enter;
        window.clearTimeout(closeTimer.current);
        if (enter) {
            setServicesKeyboard(false);
            setServicesOpen(true);
        } else {
            closeTimer.current = window.setTimeout(() => setServicesOpen(false), 150);
        }
    }
    function clickServices(event: MouseEvent) {
        // detail = 0: clique gerado pelo teclado
        setServicesKeyboard(event.detail === 0);
        setServicesOpen((value) => hovering.current || !value);
    }
    function servicesButtonKey(event: KeyboardEvent) {
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            setServicesKeyboard(true);
            setServicesOpen(true);
        }
    }
    function servicesListKey(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            setServicesOpen(false);
            servicesButtonRef.current?.focus();
        } else if (event.key === 'Tab') {
            setServicesOpen(false);
        }
    }

    // Traço embaixo do item ativo: mede o item e desliza até ele
    const navRef = useRef<HTMLElement>(null);
    const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);
    useLayoutEffect(() => {
        const place = () => {
            const link = navRef.current?.querySelector<HTMLElement>('[aria-current="page"]:not([data-cta])');
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
                        {navItems.map((item) =>
                            item.to === servicesTo ? (
                                <Box
                                    key={item.to}
                                    onPointerEnter={(event) => hoverServices(event, true)}
                                    onPointerLeave={(event) => hoverServices(event, false)}
                                    sx={{ display: 'flex' }}
                                >
                                    <Button
                                        ref={servicesButtonRef}
                                        id="servicos-menu-button"
                                        aria-haspopup="menu"
                                        aria-controls={servicesOpen ? 'servicos-menu' : undefined}
                                        aria-expanded={servicesOpen ? 'true' : undefined}
                                        aria-current={isActive(item.to) ? 'page' : undefined}
                                        onClick={clickServices}
                                        onKeyDown={servicesButtonKey}
                                        color="inherit"
                                        endIcon={
                                            <KeyboardArrowDownIcon
                                                sx={{ transition: 'transform .25s', transform: servicesOpen ? 'rotate(180deg)' : 'none' }}
                                            />
                                        }
                                        sx={{ fontSize: 16, fontWeight: 400, '&:hover': { bgcolor: 'rgba(0,0,0,.15)' }, '& .MuiButton-endIcon': { ml: 0.25 } }}
                                    >
                                        {item.label}
                                    </Button>
                                    {/* Sem portal: a lista fica dentro do Box, então passar o mouse do botão para ela não fecha */}
                                    <Popper
                                        open={servicesOpen}
                                        anchorEl={servicesButtonRef.current}
                                        placement="bottom-start"
                                        transition
                                        disablePortal
                                        sx={{ zIndex: 1, pt: 1 }}
                                    >
                                        {({ TransitionProps }) => (
                                            <Grow {...TransitionProps} style={{ transformOrigin: 'left top' }}>
                                                <Paper elevation={8} sx={{ minWidth: 260, bgcolor: brand.graphite, color: '#fff', borderRadius: 1.5 }}>
                                                    <ClickAwayListener
                                                        onClickAway={(event) => {
                                                            // O clique no próprio botão é tratado no onClick dele
                                                            if (!servicesButtonRef.current?.contains(event.target as Node)) setServicesOpen(false);
                                                        }}
                                                    >
                                                        <MenuList
                                                            id="servicos-menu"
                                                            aria-labelledby="servicos-menu-button"
                                                            autoFocusItem={servicesKeyboard}
                                                            onKeyDown={servicesListKey}
                                                            dense
                                                        >
                                                            {serviceLinks.map(({ label, to, Icon }) => (
                                                                <MenuItem
                                                                    key={to}
                                                                    component={RouterLink}
                                                                    to={to}
                                                                    onClick={(event: MouseEvent) => go(event, to)}
                                                                    sx={servicesItemSx}
                                                                >
                                                                    <ListItemIcon sx={{ color: brand.red }}>
                                                                        <Icon fontSize="small" />
                                                                    </ListItemIcon>
                                                                    {label}
                                                                </MenuItem>
                                                            ))}
                                                            <Divider sx={{ borderColor: 'rgba(255,255,255,.12)' }} />
                                                            <MenuItem
                                                                component={RouterLink}
                                                                to={servicesTo}
                                                                onClick={(event: MouseEvent) => go(event, servicesTo)}
                                                                sx={{ ...servicesItemSx, color: 'rgba(255,255,255,.75)' }}
                                                            >
                                                                Todos os serviços
                                                            </MenuItem>
                                                        </MenuList>
                                                    </ClickAwayListener>
                                                </Paper>
                                            </Grow>
                                        )}
                                    </Popper>
                                </Box>
                            ) : (
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
                            ),
                        )}
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
                    {[...navItems, cta].map((item) =>
                        item.to === servicesTo ? (
                            <Box key={item.to}>
                                <ListItemButton
                                    onClick={() => setServicesOpenMobile((value) => !value)}
                                    aria-expanded={servicesOpenMobile}
                                    selected={isActive(item.to)}
                                    sx={drawerItemSx}
                                >
                                    <ListItemText primary={item.label} />
                                    {servicesOpenMobile ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                </ListItemButton>
                                <Collapse in={servicesOpenMobile} unmountOnExit>
                                    <List disablePadding dense sx={{ bgcolor: brand.redDark }}>
                                        {[...serviceLinks, { label: 'Todos os serviços', to: servicesTo }].map((link) => (
                                            <ListItemButton
                                                key={link.to}
                                                component={RouterLink}
                                                to={link.to}
                                                onClick={(event: MouseEvent) => go(event, link.to)}
                                                sx={{ textAlign: 'center', '&:hover': { bgcolor: 'rgba(0,0,0,.2)' } }}
                                            >
                                                <ListItemText primary={link.label} />
                                            </ListItemButton>
                                        ))}
                                    </List>
                                </Collapse>
                            </Box>
                        ) : (
                            <ListItemButton
                                key={item.to}
                                component={RouterLink}
                                to={item.to}
                                onClick={(event: MouseEvent) => go(event, item.to)}
                                selected={isActive(item.to)}
                                aria-current={isActive(item.to) ? 'page' : undefined}
                                sx={drawerItemSx}
                            >
                                <ListItemText primary={item.label} />
                            </ListItemButton>
                        ),
                    )}
                </List>
            </Drawer>
        </AppBar>
    );
}
