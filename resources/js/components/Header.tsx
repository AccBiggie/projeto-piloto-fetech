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
import { Link as RouterLink } from 'react-router';

const navItems = [
    { label: 'Página Inicial', to: '/' },
    { label: 'Sobre', to: '/#sobre' },
    { label: 'Serviços', to: '/#servicos' },
    { label: 'Contato', to: '/#contato' },
    { label: 'Blog', to: '/blog' },
];

export default function Header() {
    const [open, setOpen] = useState(false);
    const scrolled = useScrollTrigger({ disableHysteresis: true, threshold: 140 });

    return (
        <AppBar
            position="sticky"
            color="inherit"
            elevation={scrolled ? 6 : 0}
            sx={{ transition: 'box-shadow .3s', borderBottom: 1, borderColor: 'divider' }}
        >
            <Container maxWidth="lg">
                <Toolbar disableGutters sx={{ minHeight: { xs: 64, md: 80 } }}>
                    <Box component={RouterLink} to="/" sx={{ display: 'flex', mr: 'auto' }} aria-label="Fetech: página inicial">
                        <Box component="img" src="/assets/logos/ProjetoLogoFetech2.svg" alt="Fetech" sx={{ height: { xs: 40, md: 52 } }} />
                    </Box>

                    <Box component="nav" sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
                        {navItems.map((item) => (
                            <Button
                                key={item.to}
                                component={RouterLink}
                                to={item.to}
                                color="inherit"
                                sx={{
                                    fontSize: 17,
                                    borderRadius: 0,
                                    borderBottom: '4px solid transparent',
                                    '&:hover': { borderBottomColor: 'primary.main', color: 'primary.main', bgcolor: 'transparent' },
                                }}
                            >
                                {item.label}
                            </Button>
                        ))}
                    </Box>

                    <IconButton
                        edge="end"
                        aria-label="Abrir menu"
                        onClick={() => setOpen(true)}
                        sx={{ display: { md: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                </Toolbar>
            </Container>

            <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
                <List sx={{ width: 240 }} component="nav">
                    {navItems.map((item) => (
                        <ListItemButton key={item.to} component={RouterLink} to={item.to} onClick={() => setOpen(false)}>
                            <ListItemText primary={item.label} />
                        </ListItemButton>
                    ))}
                </List>
            </Drawer>
        </AppBar>
    );
}
