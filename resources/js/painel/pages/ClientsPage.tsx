import AddIcon from '@mui/icons-material/Add';
import CancelIcon from '@mui/icons-material/CancelOutlined';
import EditIcon from '@mui/icons-material/EditOutlined';
import ReceiptIcon from '@mui/icons-material/ReceiptLongOutlined';
import SearchIcon from '@mui/icons-material/Search';
import SettingsIcon from '@mui/icons-material/SettingsOutlined';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import LinearProgress from '@mui/material/LinearProgress';
import Link from '@mui/material/Link';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import { useCallback, useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router';

import { type Client, type ClientStatus, clientStatuses, type Page, panelApi, type PerPage, perPageOptions } from '@/painel/api';
import CancelClientDialog from '@/painel/components/CancelClientDialog';
import ClientFormDialog from '@/painel/components/ClientFormDialog';
import PageHeader from '@/painel/components/PageHeader';
import StatusChip from '@/painel/components/StatusChip';
import { useDebouncedValue } from '@/painel/hooks';
import { brand } from '@/theme';

// Busca, situação, página e tamanho da página ficam na URL (?busca=&situacao=&pagina=&por_pagina=):
// recarregar, voltar de um cliente ou compartilhar o link mantém a listagem como estava.

const isStatus = (value: string | null): value is ClientStatus => value !== null && value in clientStatuses;
const toPerPage = (value: string | null): PerPage => perPageOptions.find((option) => String(option) === value) ?? perPageOptions[0];
const toPage = (value: string | null) => Math.max(1, Number.parseInt(value ?? '', 10) || 1);

const columns = ['Nome fantasia', 'Razão social', 'Sistema', 'Telefone', 'Situação'] as const;

const headCellSx = { fontWeight: 600, color: brand.dark, bgcolor: brand.sectionAlt, whiteSpace: 'nowrap' } as const;

export default function ClientsPage() {
    const navigate = useNavigate();
    const [params, setParams] = useSearchParams();
    const statusParam = params.get('situacao');
    const status = isStatus(statusParam) ? statusParam : null;
    const page = toPage(params.get('pagina'));
    const perPage = toPerPage(params.get('por_pagina'));
    const search = params.get('busca') ?? '';

    const [term, setTerm] = useState(search);
    const debouncedTerm = useDebouncedValue(term);
    // A URL mudou por fora (menu lateral, voltar do navegador): o campo acompanha, para o debounce não repor a busca antiga
    const [syncedSearch, setSyncedSearch] = useState(search);
    if (search !== syncedSearch) {
        setSyncedSearch(search);
        if (search !== term.trim()) setTerm(search);
    }
    const [result, setResult] = useState<Page<Client> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [reloadKey, setReloadKey] = useState(0);

    const [menu, setMenu] = useState<{ anchor: HTMLElement; client: Client } | null>(null);
    const [creating, setCreating] = useState(false);
    const [editing, setEditing] = useState<Client | null>(null);
    const [cancelling, setCancelling] = useState<Client | null>(null);

    /** Troca filtros na URL; qualquer mudança que não seja de página volta para a página 1. */
    const updateParams = useCallback(
        (changes: Record<string, string | null>) => {
            setParams(
                (current) => {
                    const next = new URLSearchParams(current);
                    for (const [key, value] of Object.entries(changes)) {
                        if (value === null || value === '') next.delete(key);
                        else next.set(key, value);
                    }
                    if (!('pagina' in changes)) next.delete('pagina');
                    return next;
                },
                { replace: true },
            );
        },
        [setParams],
    );

    // A busca digitada vai para a URL depois de uma pausa na digitação (só quando o debounce alcançou o campo)
    useEffect(() => {
        if (debouncedTerm !== term) return;
        if (debouncedTerm.trim() !== search) updateParams({ busca: debouncedTerm.trim() || null });
    }, [debouncedTerm, term, search, updateParams]);

    useEffect(() => {
        let current = true;
        setLoading(true);
        setError(null);
        panelApi
            .clients({ search, status, page, perPage })
            .then((data) => {
                if (!current) return;
                // Página que deixou de existir (filtro mudou, último cliente da página cancelado): vai para a última
                if (data.data.length === 0 && data.meta.page > data.meta.last_page) {
                    updateParams({ pagina: data.meta.last_page > 1 ? String(data.meta.last_page) : null });
                    return;
                }
                setResult(data);
            })
            .catch((e: Error) => current && setError(e.message))
            .finally(() => current && setLoading(false));
        return () => {
            current = false;
        };
    }, [search, status, page, perPage, reloadKey, updateParams]);

    const reload = () => setReloadKey((key) => key + 1);
    const closeMenu = () => setMenu(null);

    return (
        <Stack spacing={3}>
            <PageHeader
                command="clientes --listar"
                title="Clientes"
                actions={
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreating(true)}>
                        Novo cliente
                    </Button>
                }
            />

            <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ p: 2 }}>
                    <TextField
                        size="small"
                        type="search"
                        placeholder="Buscar por nome, razão social, telefone ou domínio"
                        value={term}
                        onChange={(event) => setTerm(event.target.value)}
                        sx={{ flex: 1, maxWidth: { md: 480 } }}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon fontSize="small" />
                                    </InputAdornment>
                                ),
                            },
                            htmlInput: { 'aria-label': 'Buscar clientes', maxLength: 100 },
                        }}
                    />
                    <TextField
                        select
                        size="small"
                        label="Situação"
                        value={status ?? ''}
                        onChange={(event) => updateParams({ situacao: event.target.value || null })}
                        sx={{ minWidth: { md: 200 } }}
                        slotProps={{ select: { displayEmpty: true }, inputLabel: { shrink: true } }}
                    >
                        <MenuItem value="">Todas</MenuItem>
                        {(Object.keys(clientStatuses) as ClientStatus[]).map((key) => (
                            <MenuItem key={key} value={key}>
                                {clientStatuses[key]}
                            </MenuItem>
                        ))}
                    </TextField>
                </Stack>

                {error && (
                    <Alert severity="error" sx={{ mx: 2, mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Box sx={{ position: 'relative' }}>
                    {loading && result && <LinearProgress aria-label="Atualizando a lista" sx={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1 }} />}
                    <TableContainer>
                        <Table size="medium" aria-label="Clientes" sx={{ minWidth: 860 }}>
                            <TableHead>
                                <TableRow>
                                    {columns.map((column) => (
                                        <TableCell key={column} sx={headCellSx}>
                                            {column}
                                        </TableCell>
                                    ))}
                                    <TableCell align="center" sx={headCellSx}>
                                        Ações
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody sx={{ opacity: loading && result ? 0.6 : 1, transition: 'opacity .2s' }}>
                                {!result ? (
                                    Array.from({ length: 5 }, (_, i) => (
                                        <TableRow key={i}>
                                            <TableCell colSpan={columns.length + 1}>
                                                <Skeleton height={28} />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : result.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={columns.length + 1} align="center" sx={{ py: 6, color: brand.ink }}>
                                            {search || status ? 'Nenhum cliente encontrado com esses filtros.' : 'Nenhum cliente cadastrado ainda.'}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    result.data.map((client) => (
                                        <TableRow key={client.id} hover>
                                            <TableCell sx={{ maxWidth: 260 }}>
                                                <Link component={RouterLink} to={`/clientes/${client.id}`} underline="hover" sx={{ color: brand.dark, fontWeight: 600 }}>
                                                    {client.name}
                                                </Link>
                                            </TableCell>
                                            <TableCell sx={{ maxWidth: 280, color: brand.ink }}>{client.legal_name || '—'}</TableCell>
                                            <TableCell sx={{ color: brand.ink }}>{client.plan || '—'}</TableCell>
                                            <TableCell sx={{ color: brand.ink, whiteSpace: 'nowrap' }}>{client.phone || '—'}</TableCell>
                                            <TableCell>
                                                <StatusChip status={client.status} />
                                            </TableCell>
                                            <TableCell align="center">
                                                <IconButton
                                                    aria-label={`Ações de ${client.name}`}
                                                    aria-haspopup="menu"
                                                    aria-expanded={menu?.client.id === client.id}
                                                    onClick={(event) => setMenu({ anchor: event.currentTarget, client })}
                                                    sx={{ color: brand.redText, borderRadius: 1.5, '&:hover': { bgcolor: 'rgba(224,20,59,.08)' } }}
                                                >
                                                    <SettingsIcon fontSize="small" />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>

                {result && result.meta.total > 0 && (
                    <TablePagination
                        component="div"
                        count={result.meta.total}
                        page={result.meta.page - 1}
                        rowsPerPage={result.meta.per_page}
                        rowsPerPageOptions={[...perPageOptions]}
                        onPageChange={(_, next) => updateParams({ pagina: next > 0 ? String(next + 1) : null })}
                        onRowsPerPageChange={(event) => updateParams({ por_pagina: event.target.value === String(perPageOptions[0]) ? null : event.target.value })}
                        labelRowsPerPage="Por página:"
                        labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
                        getItemAriaLabel={(type) => ({ first: 'Primeira página', last: 'Última página', next: 'Próxima página', previous: 'Página anterior' })[type]}
                        sx={{ borderTop: `1px solid ${brand.section}` }}
                    />
                )}
            </Paper>

            <Menu
                anchorEl={menu?.anchor}
                open={menu !== null}
                onClose={closeMenu}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <MenuItem
                    onClick={() => {
                        setEditing(menu!.client);
                        closeMenu();
                    }}
                >
                    <ListItemIcon>
                        <EditIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Editar</ListItemText>
                </MenuItem>
                {/* Faturas ainda não existem: a ação aparece, mas fica desativada */}
                <MenuItem disabled>
                    <ListItemIcon>
                        <ReceiptIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Gerar fatura" secondary="Em breve" />
                </MenuItem>
                <MenuItem
                    disabled={menu?.client.status === 'cancelled'}
                    onClick={() => {
                        setCancelling(menu!.client);
                        closeMenu();
                    }}
                    sx={{ color: brand.redText }}
                >
                    <ListItemIcon sx={{ color: 'inherit' }}>
                        <CancelIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Cancelar</ListItemText>
                </MenuItem>
            </Menu>

            <ClientFormDialog
                open={creating || editing !== null}
                client={editing}
                onClose={() => {
                    setCreating(false);
                    setEditing(null);
                }}
                onSaved={(client) => {
                    if (editing) {
                        setEditing(null);
                        reload();
                    } else {
                        setCreating(false);
                        navigate(`/clientes/${client.id}`);
                    }
                }}
            />

            <CancelClientDialog
                client={cancelling}
                onClose={() => setCancelling(null)}
                onCancelled={() => {
                    setCancelling(null);
                    reload();
                }}
            />
        </Stack>
    );
}
