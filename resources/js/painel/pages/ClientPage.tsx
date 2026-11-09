import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditIcon from '@mui/icons-material/EditOutlined';
import PauseIcon from '@mui/icons-material/PauseCircleOutlined';
import PlayIcon from '@mui/icons-material/PlayCircleOutlined';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router';

import { type Client, type Period, type Series, panelApi } from '@/painel/api';
import { RequestsChart, StatusChart } from '@/painel/components/charts';
import ClientFormDialog from '@/painel/components/ClientFormDialog';
import StatCard from '@/painel/components/StatCard';
import StatusChip from '@/painel/components/StatusChip';
import { formatBytes, formatNumber, trend } from '@/painel/format';
import { brand, monoFont } from '@/theme';

const periods: { value: Period; label: string; description: string }[] = [
    { value: '24h', label: '24 h', description: 'Últimas 24 horas completas, por hora' },
    { value: '7d', label: '7 dias', description: 'Últimos 7 dias completos, por dia' },
    { value: '30d', label: '30 dias', description: 'Últimos 30 dias completos, por dia' },
    { value: '90d', label: '90 dias', description: 'Últimos 90 dias completos, por dia' },
];

export default function ClientPage() {
    const id = Number(useParams().id);
    const navigate = useNavigate();
    const [client, setClient] = useState<Client | null>(null);
    const [period, setPeriod] = useState<Period>('7d');
    const [series, setSeries] = useState<Series | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [editing, setEditing] = useState(false);
    const [confirm, setConfirm] = useState<'status' | 'delete' | null>(null);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        panelApi
            .client(id)
            .then(setClient)
            .catch((e: Error) => setError(e.message));
    }, [id]);

    useEffect(() => {
        setSeries(null);
        panelApi
            .stats(id, period)
            .then(setSeries)
            .catch((e: Error) => setError(e.message));
    }, [id, period]);

    async function toggleStatus() {
        if (!client) return;
        setBusy(true);
        try {
            setClient(await panelApi.setStatus(client.id, client.status === 'active' ? 'suspended' : 'active'));
            setConfirm(null);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setBusy(false);
        }
    }

    async function remove() {
        if (!client) return;
        setBusy(true);
        try {
            await panelApi.remove(client.id);
            navigate('/');
        } catch (e) {
            setError((e as Error).message);
            setBusy(false);
        }
    }

    if (error) return <Alert severity="error">{error}</Alert>;

    const current = periods.find((item) => item.value === period)!;
    const suspending = client?.status === 'active';

    return (
        <Stack spacing={3}>
            <Button component={RouterLink} to="/" startIcon={<ArrowBackIcon />} sx={{ alignSelf: 'flex-start', paddingInline: 1 }}>
                Clientes
            </Button>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ justifyContent: 'space-between', alignItems: { md: 'flex-start' } }}>
                <Box sx={{ minWidth: 0 }}>
                    {client ? (
                        <>
                            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                                <Typography component="h1" sx={{ fontSize: { xs: 26, md: 32 }, fontWeight: 700 }}>
                                    {client.name}
                                </Typography>
                                <StatusChip status={client.status} />
                            </Stack>
                            <Typography sx={{ fontFamily: monoFont, fontSize: 14, color: brand.ink, wordBreak: 'break-all' }}>{client.domains.join(' · ') || 'sem domínio cadastrado'}</Typography>
                            <Typography sx={{ fontSize: 14, color: brand.ink, mt: 0.5 }}>
                                {[client.plan, client.contact_name, client.email, client.phone].filter(Boolean).join(' · ')}
                            </Typography>
                        </>
                    ) : (
                        <Skeleton width={280} height={48} />
                    )}
                </Box>
                {client && (
                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
                        <Button variant="outlined" startIcon={<EditIcon />} onClick={() => setEditing(true)}>
                            Editar
                        </Button>
                        <Button variant="outlined" startIcon={suspending ? <PauseIcon /> : <PlayIcon />} onClick={() => setConfirm('status')}>
                            {suspending ? 'Suspender' : 'Reativar'}
                        </Button>
                        <Button color="inherit" startIcon={<DeleteIcon />} onClick={() => setConfirm('delete')}>
                            Excluir
                        </Button>
                    </Stack>
                )}
            </Stack>

            {client?.notes && (
                <Paper elevation={0} sx={{ p: 2, borderRadius: 2, whiteSpace: 'pre-line', fontSize: 14 }}>
                    {client.notes}
                </Paper>
            )}

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' } }}>
                <Typography component="h2" sx={{ fontWeight: 700, fontSize: 20 }}>
                    Uso do site
                </Typography>
                <ToggleButtonGroup size="small" exclusive value={period} onChange={(_, value: Period | null) => value && setPeriod(value)} aria-label="Período">
                    {periods.map((item) => (
                        <ToggleButton key={item.value} value={item.value} sx={{ px: 1.75 }}>
                            {item.label}
                        </ToggleButton>
                    ))}
                </ToggleButtonGroup>
            </Stack>

            {client && client.domains.length === 0 && <Alert severity="info">Cadastre os domínios do cliente para as estatísticas aparecerem.</Alert>}

            <Grid container spacing={2}>
                {series ? (
                    <>
                        <Grid size={{ xs: 6, md: 3 }}>
                            <StatCard label="requisições" value={formatNumber(series.totals.requests)} change={trend(series.totals.requests, series.previous_requests)} />
                        </Grid>
                        <Grid size={{ xs: 6, md: 3 }}>
                            <StatCard label="dados enviados" value={formatBytes(series.totals.bytes)} />
                        </Grid>
                        <Grid size={{ xs: 6, md: 3 }}>
                            <StatCard label="tempo médio" value={`${series.totals.avg_ms.toLocaleString('pt-BR')} ms`} />
                        </Grid>
                        <Grid size={{ xs: 6, md: 3 }}>
                            <StatCard label="erros 5xx" value={`${series.totals.error_rate.toLocaleString('pt-BR')}%`} hint={`${formatNumber(series.totals.status_4xx)} respostas 4xx`} />
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
                <Typography component="h3" sx={{ fontWeight: 700, fontSize: 18 }}>
                    Requisições
                </Typography>
                <Typography sx={{ fontSize: 13, color: 'rgba(255,255,255,.6)', mb: 1 }}>{current.description}</Typography>
                {series ? <RequestsChart series={series} dark /> : <Skeleton variant="rounded" height={300} sx={{ bgcolor: 'rgba(255,255,255,.08)' }} />}
            </Paper>

            <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
                <Typography component="h3" sx={{ fontWeight: 700, fontSize: 18 }}>
                    Respostas por status
                </Typography>
                <Typography sx={{ fontSize: 13, color: brand.ink, mb: 1 }}>{current.description}</Typography>
                {series ? <StatusChart series={series} /> : <Skeleton variant="rounded" height={260} />}
            </Paper>

            <ClientFormDialog
                open={editing}
                client={client}
                onClose={() => setEditing(false)}
                onSaved={(saved) => {
                    setClient(saved);
                    setEditing(false);
                    panelApi.stats(saved.id, period).then(setSeries);
                }}
            />

            <Dialog open={confirm !== null} onClose={() => setConfirm(null)}>
                <DialogTitle>{confirm === 'delete' ? 'Excluir cliente?' : suspending ? 'Suspender cliente?' : 'Reativar cliente?'}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {confirm === 'delete'
                            ? 'O cadastro e os domínios serão apagados. As estatísticas já coletadas continuam guardadas e voltam a aparecer se o domínio for cadastrado de novo.'
                            : suspending
                              ? 'O cliente fica marcado como suspenso no painel. O bloqueio do site no servidor é feito à parte.'
                              : 'O cliente volta a ficar ativo no painel.'}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirm(null)}>Cancelar</Button>
                    <Button variant="contained" disabled={busy} onClick={confirm === 'delete' ? remove : toggleStatus}>
                        {confirm === 'delete' ? 'Excluir' : suspending ? 'Suspender' : 'Reativar'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Stack>
    );
}
