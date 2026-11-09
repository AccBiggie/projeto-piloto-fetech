import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditIcon from '@mui/icons-material/EditOutlined';
import BlockIcon from '@mui/icons-material/Block';
import UnlockIcon from '@mui/icons-material/LockOpenOutlined';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router';

import { type BlockReason, type Client, type Containers, type Period, type Series, blockReasons, panelApi } from '@/painel/api';
import { RequestsChart, StatusChart } from '@/painel/components/charts';
import ClientFormDialog from '@/painel/components/ClientFormDialog';
import StatCard from '@/painel/components/StatCard';
import StatusChip from '@/painel/components/StatusChip';
import { formatBytes, formatDateTime, formatNumber, trend } from '@/painel/format';
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
    const [reason, setReason] = useState<BlockReason>('manual');
    const [note, setNote] = useState('');

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
            setClient(client.status === 'active' ? await panelApi.block(client.id, reason, note) : await panelApi.unblock(client.id, note));
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

    function openStatus() {
        setReason('manual');
        setNote('');
        setConfirm('status');
    }

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
                        <Button variant="outlined" color={suspending ? 'error' : 'primary'} startIcon={suspending ? <BlockIcon /> : <UnlockIcon />} onClick={openStatus}>
                            {suspending ? 'Bloquear' : 'Desbloquear'}
                        </Button>
                        <Button color="inherit" startIcon={<DeleteIcon />} onClick={() => setConfirm('delete')}>
                            Excluir
                        </Button>
                    </Stack>
                )}
            </Stack>

            {client?.status === 'suspended' && (
                <Alert severity="error" variant="outlined">
                    <Typography sx={{ fontWeight: 700, fontSize: 15 }}>
                        Site bloqueado{client.block_reason ? ` · ${blockReasons[client.block_reason]}` : ''}
                        {client.suspended_at ? ` desde ${formatDateTime(client.suspended_at)}` : ''}
                    </Typography>
                    {client.block_note && <Typography sx={{ fontSize: 14 }}>{client.block_note}</Typography>}
                    <Typography sx={{ fontSize: 14, mt: 0.5 }}>Os visitantes veem a página de suspensão. {containersText(client.containers)}</Typography>
                </Alert>
            )}
            {client?.status === 'active' && client.containers?.state === 'starting' && (
                <Alert severity="info">Religando os containers do projeto. O site volta assim que eles subirem (até 2 minutos).</Alert>
            )}

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

            {client?.events && client.events.length > 0 && (
                <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
                    <Typography component="h3" sx={{ fontWeight: 700, fontSize: 18, mb: 1.5 }}>
                        Histórico de bloqueios
                    </Typography>
                    <Stack component="ol" spacing={1.25} sx={{ listStyle: 'none', m: 0, p: 0 }}>
                        {client.events.map((event, index) => (
                            <Box component="li" key={index} sx={{ fontSize: 14 }}>
                                <Typography component="span" sx={{ fontWeight: 600, fontSize: 14 }}>
                                    {event.action === 'blocked' ? `Bloqueado · ${event.reason ? blockReasons[event.reason] : ''}` : 'Desbloqueado'}
                                </Typography>
                                <Typography component="span" sx={{ fontSize: 13, color: brand.ink, ml: 1 }}>
                                    {[event.created_at && formatDateTime(event.created_at), event.user ?? 'sistema'].filter(Boolean).join(' · ')}
                                </Typography>
                                {event.note && <Typography sx={{ fontSize: 13, color: brand.ink }}>{event.note}</Typography>}
                            </Box>
                        ))}
                    </Stack>
                </Paper>
            )}

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
                <DialogTitle>{confirm === 'delete' ? 'Excluir cliente?' : suspending ? 'Bloquear o site do cliente?' : 'Desbloquear o site do cliente?'}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {confirm === 'delete'
                            ? 'O cadastro e os domínios serão apagados, e um bloqueio ativo é retirado. As estatísticas já coletadas continuam guardadas e voltam a aparecer se o domínio for cadastrado de novo.'
                            : suspending
                              ? `Os domínios passam a mostrar a página de suspensão na hora.${client?.project ? ` Se o bloqueio continuar, os containers do projeto ${client.project} são parados depois do prazo.` : ' Sem projeto cadastrado, só a página de suspensão é aplicada.'}`
                              : `A página de suspensão sai${client?.containers?.state === 'stopped' ? ' depois que os containers forem religados (até 2 minutos)' : ' na hora'}.`}
                    </DialogContentText>
                    {confirm === 'status' && (
                        <Stack spacing={2} sx={{ mt: 2 }}>
                            {suspending && (
                                <RadioGroup value={reason} onChange={(event) => setReason(event.target.value as BlockReason)} aria-label="Motivo do bloqueio">
                                    {(Object.keys(blockReasons) as BlockReason[]).map((key) => (
                                        <FormControlLabel key={key} value={key} control={<Radio />} label={blockReasons[key]} />
                                    ))}
                                </RadioGroup>
                            )}
                            <TextField label="Observação (opcional)" value={note} onChange={(event) => setNote(event.target.value)} fullWidth multiline minRows={2} slotProps={{ htmlInput: { maxLength: 500 } }} />
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirm(null)}>Cancelar</Button>
                    <Button variant="contained" color={confirm === 'delete' || suspending ? 'error' : 'primary'} disabled={busy} onClick={confirm === 'delete' ? remove : toggleStatus}>
                        {confirm === 'delete' ? 'Excluir' : suspending ? 'Bloquear' : 'Desbloquear'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Stack>
    );
}

function containersText(containers: Containers | null): string {
    if (!containers) return 'Sem projeto cadastrado: os containers não são parados.';
    switch (containers.state) {
        case 'scheduled':
            return `Os containers serão parados em ${formatDateTime(containers.stop_at!)}.`;
        case 'stopping':
            return 'Parando os containers do projeto.';
        case 'stopped':
            return 'Os containers do projeto estão parados.';
        default:
            return 'Os containers do projeto continuam rodando.';
    }
}
