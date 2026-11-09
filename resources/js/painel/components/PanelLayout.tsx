import LogoutIcon from '@mui/icons-material/LogoutOutlined';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';
import { Link as RouterLink } from 'react-router';

import FetechLogo from '@/components/FetechLogo';
import type { Session } from '@/painel/api';
import { brand, monoFont } from '@/theme';

export default function PanelLayout({ session, onLogout, children }: { session: Session; onLogout: () => void; children: ReactNode }) {
    return (
        <Box sx={{ minHeight: '100vh', bgcolor: brand.section }}>
            <AppBar
                position="sticky"
                elevation={0}
                sx={{ background: `radial-gradient(60% 140% at 0% 100%, rgba(224,20,59,.35), transparent 70%), linear-gradient(160deg, ${brand.graphiteLight}, ${brand.graphite} 60%)` }}
            >
                <Toolbar sx={{ gap: 2 }}>
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
            <Container component="main" maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
                {children}
            </Container>
        </Box>
    );
}
