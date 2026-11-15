import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router';

import { type Dashboard, panelApi, type TopClient } from '@/painel/api';
import { RequestsChart, Sparkline } from '@/painel/components/charts';
import PageHeader from '@/painel/components/PageHeader';
import StatCard from '@/painel/components/StatCard';
import StatusChip from '@/painel/components/StatusChip';
import { formatNumber, trend } from '@/painel/format';
import { brand, monoFont } from '@/theme';

/** Painel de controle: situação dos clientes, requisições de todos os sites e quem mais recebeu acessos. */
export default function DashboardPage() {
    const [data, setData] = useState<Dashboard | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        panelApi
            .dashboard()
            .then(setData)
            .catch((e: Error) => setError(e.message));
    }, []);

    if (error) return <Alert severity="error">{error}</Alert>;

    const overview = data?.overview;

    return (
        <Stack spacing={3}>
            <PageHeader command="painel --resumo" title="Painel de controle" />

            <Grid container spacing={2}>
                {data && overview ? (
                    <>
                        <Grid size={{ xs: 6, md: 3 }}>
                            <StatCard label="clientes ativos" value={formatNumber(data.summary.active)} hint={`${formatNumber(data.summary.clients)} no total`} />
                        </Grid>
                        <Grid size={{ xs: 6, md: 3 }}>
                            <StatCard label="bloqueados" value={formatNumber(data.summary.suspended)} />
                        </Grid>
                        <Grid size={{ xs: 6, md: 3 }}>
                            <StatCard label="cancelados" value={formatNumber(data.summary.cancelled)} />
                        </Grid>
                        <Grid size={{ xs: 6, md: 3 }}>
                            <StatCard
                                label="requisições · 30 dias"
                                value={formatNumber(overview.totals.requests)}
                                change={trend(overview.totals.requests, overview.previous_requests)}
                                hint={`${overview.totals.error_rate.toLocaleString('pt-BR')}% de erros 5xx`}
                            />
                        </Grid>
                    </>
                ) : (
                    [0, 1, 2, 3].map((i) => (
                        <Grid key={i} size={{ xs: 6, md: 3 }}>
                            <Skeleton variant="rounded" height={112} />
                        </Grid>
                    ))
                )}
            </Grid>

            <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, bgcolor: brand.graphite, color: '#fff' }}>
                <Typography component="h2" sx={{ fontWeight: 700, fontSize: 18 }}>
                    Requisições de todos os clientes
                </Typography>
                <Typography sx={{ fontSize: 13, color: 'rgba(255,255,255,.6)', mb: 1 }}>Últimos 30 dias completos, por dia</Typography>
                {overview ? <RequestsChart series={overview} height={240} dark /> : <Skeleton variant="rounded" height={240} sx={{ bgcolor: 'rgba(255,255,255,.08)' }} />}
            </Paper>

            <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <Stack direction="row" spacing={2} sx={{ p: 2, justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography component="h2" sx={{ fontWeight: 700, fontSize: 18 }}>
                            Clientes com mais acessos
                        </Typography>
                        <Typography sx={{ fontSize: 13, color: brand.ink }}>Últimos 30 dias completos</Typography>
                    </Box>
                    <Button component={RouterLink} to="/clientes" endIcon={<ArrowForwardIcon />}>
                        Ver todos
                    </Button>
                </Stack>

                {!data ? (
                    <Stack spacing={1} sx={{ p: 2, pt: 0 }}>
                        {[0, 1, 2].map((i) => (
                            <Skeleton key={i} variant="rounded" height={64} />
                        ))}
                    </Stack>
                ) : data.top.length === 0 ? (
                    <Box sx={{ p: 5, pt: 3, textAlign: 'center', color: brand.ink }}>
                        {data.summary.clients === 0 ? 'Nenhum cliente cadastrado ainda.' : 'Nenhum acesso registrado nos últimos 30 dias.'}
                    </Box>
                ) : (
                    <Box component="ol" sx={{ listStyle: 'none', m: 0, p: 0 }}>
                        {data.top.map((client) => (
                            <TopClientItem key={client.id} client={client} />
                        ))}
                    </Box>
                )}
            </Paper>
        </Stack>
    );
}

function TopClientItem({ client }: { client: TopClient }) {
    return (
        <Box component="li" sx={{ borderTop: `1px solid ${brand.section}` }}>
            <Box
                component={RouterLink}
                to={`/clientes/${client.id}`}
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr auto', md: 'minmax(0, 2fr) auto 140px 190px' },
                    alignItems: 'center',
                    columnGap: 3,
                    rowGap: 1,
                    px: 2,
                    py: 1.75,
                    color: 'inherit',
                    textDecoration: 'none',
                    transition: 'background-color .2s',
                    '&:hover': { bgcolor: brand.sectionAlt },
                    '&:focus-visible': { outline: `2px solid ${brand.red}`, outlineOffset: -2 },
                }}
            >
                <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 600 }} noWrap>
                        {client.name}
                    </Typography>
                    <Typography sx={{ fontFamily: monoFont, fontSize: 13, color: brand.ink }} noWrap>
                        {client.domains.join(' · ') || 'sem domínio'}
                    </Typography>
                </Box>
                <StatusChip status={client.status} />
                <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                    <Sparkline data={client.spark} label={`Requisições por dia de ${client.name} nos últimos 30 dias`} />
                </Box>
                <Box sx={{ textAlign: { md: 'right' }, gridColumn: { xs: '1 / -1', md: 'auto' } }}>
                    <Typography component="span" sx={{ fontWeight: 700 }}>
                        {formatNumber(client.requests_30d)}
                    </Typography>
                    <Typography component="span" sx={{ fontSize: 12, color: brand.ink, ml: 0.75 }}>
                        req. em 30 dias
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
}
