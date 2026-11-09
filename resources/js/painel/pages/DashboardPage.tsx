import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router';

import { type ClientRow, panelApi } from '@/painel/api';
import { RequestsChart, Sparkline } from '@/painel/components/charts';
import ClientFormDialog from '@/painel/components/ClientFormDialog';
import StatCard from '@/painel/components/StatCard';
import StatusChip from '@/painel/components/StatusChip';
import { formatNumber, trend } from '@/painel/format';
import { brand, monoFont } from '@/theme';

type Data = Awaited<ReturnType<typeof panelApi.clients>>;
type Filter = 'all' | 'active' | 'suspended';

export default function DashboardPage() {
    const navigate = useNavigate();
    const [data, setData] = useState<Data | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<Filter>('all');
    const [creating, setCreating] = useState(false);

    const load = useCallback(() => {
        panelApi
            .clients()
            .then(setData)
            .catch((e: Error) => setError(e.message));
    }, []);
    useEffect(load, [load]);

    const rows = useMemo(() => {
        const term = search.trim().toLowerCase();
        return (data?.clients ?? []).filter(
            (client) =>
                (filter === 'all' || client.status === filter) &&
                (!term || client.name.toLowerCase().includes(term) || client.domains.some((domain) => domain.includes(term))),
        );
    }, [data, search, filter]);

    if (error) return <Alert severity="error">{error}</Alert>;

    const overview = data?.overview;

    return (
        <Stack spacing={3}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'space-between', alignItems: { sm: 'flex-end' } }}>
                <Box>
                    <Typography sx={{ fontFamily: monoFont, fontSize: 13, color: brand.redText }}>{'>'} clientes --listar</Typography>
                    <Typography component="h1" sx={{ fontSize: { xs: 26, md: 32 }, fontWeight: 700 }}>
                        Clientes
                    </Typography>
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreating(true)}>
                    Novo cliente
                </Button>
            </Stack>

            <Grid container spacing={2}>
                {data && overview ? (
                    <>
                        <Grid size={{ xs: 6, md: 3 }}>
                            <StatCard label="clientes ativos" value={formatNumber(data.summary.active)} hint={`${data.summary.clients} no total`} />
                        </Grid>
                        <Grid size={{ xs: 6, md: 3 }}>
                            <StatCard label="suspensos" value={formatNumber(data.summary.suspended)} />
                        </Grid>
                        <Grid size={{ xs: 6, md: 3 }}>
                            <StatCard label="requisições · 30 dias" value={formatNumber(overview.totals.requests)} change={trend(overview.totals.requests, overview.previous_requests)} />
                        </Grid>
                        <Grid size={{ xs: 6, md: 3 }}>
                            <StatCard label="erros 5xx · 30 dias" value={`${overview.totals.error_rate.toLocaleString('pt-BR')}%`} hint={`${formatNumber(overview.totals.status_5xx)} respostas`} />
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
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ p: 2, alignItems: { md: 'center' } }}>
                    <TextField
                        size="small"
                        placeholder="Buscar por nome ou domínio"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        sx={{ flex: 1, maxWidth: { md: 360 } }}
                        slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }, htmlInput: { 'aria-label': 'Buscar clientes' } }}
                    />
                    <ToggleButtonGroup size="small" exclusive value={filter} onChange={(_, value: Filter | null) => value && setFilter(value)} aria-label="Filtrar por situação">
                        <ToggleButton value="all">Todos</ToggleButton>
                        <ToggleButton value="active">Ativos</ToggleButton>
                        <ToggleButton value="suspended">Suspensos</ToggleButton>
                    </ToggleButtonGroup>
                </Stack>

                {!data ? (
                    <Stack spacing={1} sx={{ p: 2 }}>
                        {[0, 1, 2].map((i) => (
                            <Skeleton key={i} variant="rounded" height={64} />
                        ))}
                    </Stack>
                ) : rows.length === 0 ? (
                    <Box sx={{ p: 5, textAlign: 'center', color: brand.ink }}>
                        {data.clients.length === 0 ? 'Nenhum cliente cadastrado ainda.' : 'Nenhum cliente encontrado.'}
                    </Box>
                ) : (
                    <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0 }}>
                        {rows.map((client) => (
                            <ClientItem key={client.id} client={client} />
                        ))}
                    </Box>
                )}
            </Paper>

            <ClientFormDialog
                open={creating}
                onClose={() => setCreating(false)}
                onSaved={(client) => {
                    setCreating(false);
                    navigate(`/clientes/${client.id}`);
                }}
            />
        </Stack>
    );
}

function ClientItem({ client }: { client: ClientRow }) {
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
