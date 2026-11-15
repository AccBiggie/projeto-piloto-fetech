import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

import { brand, monoFont } from '@/theme';

/** Topo das páginas do painel: o "comando" em fonte mono, o título e as ações à direita. */
export default function PageHeader({ command, title, actions }: { command: string; title: string; actions?: ReactNode }) {
    return (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'space-between', alignItems: { sm: 'flex-end' } }}>
            <Box>
                <Typography sx={{ fontFamily: monoFont, fontSize: 13, color: brand.redText }}>
                    {'>'} {command}
                </Typography>
                <Typography component="h1" sx={{ fontSize: { xs: 26, md: 32 }, fontWeight: 700 }}>
                    {title}
                </Typography>
            </Box>
            {actions}
        </Stack>
    );
}
