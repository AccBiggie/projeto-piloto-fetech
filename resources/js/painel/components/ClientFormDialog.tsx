import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { type FormEvent, useEffect, useState } from 'react';

import { ApiError, type Client, type ClientInput, panelApi } from '@/painel/api';
import { theme } from '@/theme';

const empty: ClientInput = { name: '', contact_name: '', email: '', phone: '', plan: '', notes: '', domains: [''] };

/** Cadastro e edição do cliente, com os domínios do site (os mesmos hosts que aparecem no log do Caddy). */
export default function ClientFormDialog({ open, client, onClose, onSaved }: { open: boolean; client?: Client | null; onClose: () => void; onSaved: (client: Client) => void }) {
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const [form, setForm] = useState<ClientInput>(empty);
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [message, setMessage] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        if (!open) return;
        setErrors({});
        setMessage(null);
        setForm(
            client
                ? {
                      name: client.name,
                      contact_name: client.contact_name ?? '',
                      email: client.email ?? '',
                      phone: client.phone ?? '',
                      plan: client.plan ?? '',
                      notes: client.notes ?? '',
                      domains: client.domains.length ? client.domains : [''],
                  }
                : empty,
        );
    }, [open, client]);

    const set = (field: keyof ClientInput) => (event: { target: { value: string } }) => setForm({ ...form, [field]: event.target.value });
    const fieldError = (field: string) => errors[field]?.[0];

    async function submit(event: FormEvent) {
        event.preventDefault();
        setBusy(true);
        setErrors({});
        setMessage(null);
        const input = { ...form, domains: form.domains.filter((domain) => domain.trim() !== '') };
        try {
            onSaved(client ? await panelApi.update(client.id, input) : await panelApi.create(input));
        } catch (e) {
            if (e instanceof ApiError && e.status === 422) {
                setErrors(e.data.errors ?? {});
            } else {
                setMessage(e instanceof Error ? e.message : 'Não foi possível salvar.');
            }
        } finally {
            setBusy(false);
        }
    }

    return (
        <Dialog open={open} onClose={onClose} fullScreen={fullScreen} fullWidth maxWidth="sm" slotProps={{ paper: { component: 'form', onSubmit: submit, noValidate: true } as object }}>
            <DialogTitle sx={{ pr: 6 }}>
                {client ? 'Editar cliente' : 'Novo cliente'}
                <IconButton aria-label="Fechar" onClick={onClose} sx={{ position: 'absolute', right: 12, top: 12 }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                {message && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {message}
                    </Alert>
                )}
                <Grid container spacing={2}>
                    <Grid size={12}>
                        <TextField label="Nome do cliente" value={form.name} onChange={set('name')} required fullWidth autoFocus error={!!fieldError('name')} helperText={fieldError('name')} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField label="Contato" value={form.contact_name ?? ''} onChange={set('contact_name')} fullWidth error={!!fieldError('contact_name')} helperText={fieldError('contact_name')} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField label="Telefone" value={form.phone ?? ''} onChange={set('phone')} fullWidth error={!!fieldError('phone')} helperText={fieldError('phone')} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField label="E-mail" type="email" value={form.email ?? ''} onChange={set('email')} fullWidth error={!!fieldError('email')} helperText={fieldError('email')} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField label="Plano" value={form.plan ?? ''} onChange={set('plan')} fullWidth placeholder="Ex.: Loja virtual" error={!!fieldError('plan')} helperText={fieldError('plan')} />
                    </Grid>
                    <Grid size={12}>
                        <Typography sx={{ fontWeight: 600, mb: 0.5 }}>Domínios do site</Typography>
                        <Typography sx={{ fontSize: 13, color: 'text.secondary', mb: 1.5 }}>
                            Cadastre cada endereço que o site atende (com e sem www): as estatísticas vêm do log do Caddy por domínio.
                        </Typography>
                        <Stack spacing={1.5}>
                            {form.domains.map((domain, index) => (
                                <Stack key={index} direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
                                    <TextField
                                        label={`Domínio ${index + 1}`}
                                        value={domain}
                                        placeholder="cliente.com.br"
                                        onChange={(event) => setForm({ ...form, domains: form.domains.map((item, i) => (i === index ? event.target.value : item)) })}
                                        fullWidth
                                        size="small"
                                        error={!!fieldError(`domains.${index}`)}
                                        helperText={fieldError(`domains.${index}`)}
                                        slotProps={{ htmlInput: { spellCheck: false, autoCapitalize: 'none' } }}
                                    />
                                    <IconButton
                                        aria-label={`Remover domínio ${index + 1}`}
                                        onClick={() => setForm({ ...form, domains: form.domains.length > 1 ? form.domains.filter((_, i) => i !== index) : [''] })}
                                    >
                                        <CloseIcon fontSize="small" />
                                    </IconButton>
                                </Stack>
                            ))}
                            <Button startIcon={<AddIcon />} onClick={() => setForm({ ...form, domains: [...form.domains, ''] })} sx={{ alignSelf: 'flex-start' }}>
                                Adicionar domínio
                            </Button>
                        </Stack>
                    </Grid>
                    <Grid size={12}>
                        <TextField label="Observações" value={form.notes ?? ''} onChange={set('notes')} fullWidth multiline minRows={3} error={!!fieldError('notes')} helperText={fieldError('notes')} />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose}>Cancelar</Button>
                <Button type="submit" variant="contained" disabled={busy || form.name.trim() === ''}>
                    {client ? 'Salvar' : 'Cadastrar'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
