import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

import FetechLogo from '@/components/FetechLogo';
import { brand, monoFont } from '@/theme';

/** Fundo das telas de acesso: o grafite com o brilho vermelho do topo do site e o cartão no centro. */
export default function AuthShell({ command, title, subtitle, children, width = 420 }: { command: string; title: string; subtitle?: ReactNode; children: ReactNode; width?: number }) {
    return (
        <Box
            component="main"
            sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                px: 2,
                py: 6,
                color: '#fff',
                background: `radial-gradient(70% 55% at 0% 100%, rgba(224,20,59,.5), transparent 70%), radial-gradient(50% 40% at 100% 0%, rgba(224,20,59,.18), transparent 70%), linear-gradient(160deg, ${brand.graphiteLight}, ${brand.graphite} 60%)`,
                position: 'relative',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: 'radial-gradient(rgba(255,255,255,.07) 1px, transparent 1.6px)',
                    backgroundSize: '22px 22px',
                    pointerEvents: 'none',
                },
            }}
        >
            <Box sx={{ position: 'relative', width: '100%', maxWidth: width }}>
                <FetechLogo titleAccess="FETECH" sx={{ width: 150, height: 'auto', aspectRatio: '200 / 55', display: 'block', mx: 'auto', mb: 3 }} />
                <Paper elevation={0} sx={{ p: { xs: 3, sm: 4 }, borderRadius: 3, boxShadow: '0 1.5rem 3rem rgba(0,0,0,.35)' }}>
                    <Typography sx={{ fontFamily: monoFont, fontSize: 13, color: brand.redText, mb: 1 }}>
                        {'>'} {command}
                    </Typography>
                    <Typography component="h1" sx={{ fontSize: 24, fontWeight: 700, mb: subtitle ? 1 : 3 }}>
                        {title}
                    </Typography>
                    {subtitle && <Typography sx={{ color: brand.ink, fontSize: 15, mb: 3 }}>{subtitle}</Typography>}
                    {children}
                </Paper>
                <Typography sx={{ mt: 3, textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,.55)', fontFamily: monoFont }}>
                    acesso restrito · conexão protegida
                </Typography>
            </Box>
        </Box>
    );
}
