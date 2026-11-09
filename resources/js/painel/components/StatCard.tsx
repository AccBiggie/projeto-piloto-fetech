import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

import { brand, monoFont } from '@/theme';

/** Indicador do topo: rótulo, valor e, se houver, a variação em relação ao período anterior. */
export default function StatCard({ label, value, change, hint }: { label: string; value: string; change?: number | null; hint?: string }) {
    return (
        <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2.5, height: '100%' }}>
            <Typography sx={{ fontFamily: monoFont, fontSize: 12, color: brand.ink, mb: 1 }}>{label}</Typography>
            <Typography sx={{ fontSize: { xs: 24, md: 28 }, fontWeight: 700, lineHeight: 1.1 }}>{value}</Typography>
            {change !== undefined && change !== null && (
                <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', columnGap: 0.5, mt: 1, fontSize: 13 }}>
                    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, fontWeight: 600, color: change >= 0 ? '#1b6e4a' : brand.redText }}>
                        {change >= 0 ? <TrendingUpIcon sx={{ fontSize: 18 }} aria-hidden="true" /> : <TrendingDownIcon sx={{ fontSize: 18 }} aria-hidden="true" />}
                        {change >= 0 ? '+' : '−'}
                        {Math.abs(change)}%
                    </Box>
                    <Box component="span" sx={{ color: brand.ink }}>
                        vs. período anterior
                    </Box>
                </Box>
            )}
            {hint && <Typography sx={{ mt: 1, fontSize: 13, color: brand.ink }}>{hint}</Typography>}
        </Paper>
    );
}
