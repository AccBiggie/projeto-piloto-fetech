import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { useEffect, useState } from 'react';

import { type Client, panelApi } from '@/painel/api';

/** Confirma o cancelamento do contrato: o site sai do ar como no bloqueio, e o cliente pode ser reativado depois. */
export default function CancelClientDialog({ client, onClose, onCancelled }: { client: Client | null; onClose: () => void; onCancelled: (client: Client) => void }) {
    const [note, setNote] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (client) {
            setNote('');
            setError(null);
        }
    }, [client]);

    async function confirm() {
        if (!client) return;
        setBusy(true);
        setError(null);
        try {
            onCancelled(await panelApi.cancel(client.id, note));
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setBusy(false);
        }
    }

    return (
        <Dialog open={client !== null} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle>Cancelar o contrato de {client?.name}?</DialogTitle>
            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}
                <DialogContentText>
                    Os domínios passam a mostrar a página de suspensão na hora.
                    {client?.project ? ` Os containers do projeto ${client.project} são parados depois do prazo.` : ''} O cadastro continua no painel e pode ser
                    reativado.
                </DialogContentText>
                <TextField
                    label="Observação (opcional)"
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    fullWidth
                    multiline
                    minRows={2}
                    sx={{ mt: 2 }}
                    slotProps={{ htmlInput: { maxLength: 500 } }}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Voltar</Button>
                <Button variant="contained" color="error" disabled={busy} onClick={confirm}>
                    Cancelar contrato
                </Button>
            </DialogActions>
        </Dialog>
    );
}
