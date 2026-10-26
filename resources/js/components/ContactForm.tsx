import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import SendIcon from '@mui/icons-material/Send';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { type FormEvent, useState } from 'react';

import { type ContactPayload, type ContactResult, sendContact } from '@/api/contact';
import { brand } from '@/theme';

const emptyForm: ContactPayload = { name: '', email: '', subject: '', message: '', website: '' };

const fields: { name: Exclude<keyof ContactPayload, 'website'>; label: string; type?: string; max: number; multiline?: boolean }[] = [
    { name: 'name', label: 'Nome', max: 100 },
    { name: 'email', label: 'E-mail', type: 'email', max: 150 },
    { name: 'subject', label: 'Assunto', max: 150 },
    { name: 'message', label: 'Mensagem', max: 2000, multiline: true },
];

// Campos claros sobre o fundo verde-água da seção
const inputSx = {
    '& .MuiInputBase-root': { color: '#fff' },
    '& .MuiInputLabel-root, & .MuiInputLabel-root.Mui-focused': { color: '#fff' },
    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,.7)' },
    '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#fff' },
    '& .MuiFormHelperText-root': { color: '#fff' },
};

export default function ContactForm() {
    const [form, setForm] = useState(emptyForm);
    const [sending, setSending] = useState(false);
    const [result, setResult] = useState<ContactResult | null>(null);

    const errors = result && !result.ok ? result.errors : undefined;

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSending(true);
        const response = await sendContact(form);
        setResult(response);
        setSending(false);
        if (response.ok) {
            setForm(emptyForm);
        }
    }

    return (
        <Box component="section" id="contato" sx={{ py: 6, scrollMarginTop: 80 }}>
            <Container maxWidth="lg">
                <Paper elevation={3} sx={{ bgcolor: brand.teal, color: '#fff', p: { xs: 3, md: 8 }, position: 'relative' }}>
                    <EmailOutlinedIcon sx={{ position: 'absolute', top: 24, left: 24, fontSize: 48, display: { xs: 'none', sm: 'block' } }} />
                    <Typography variant="h4" component="h2" sx={{ textAlign: 'center', mb: 1 }}>
                        Entre em contato conosco!
                    </Typography>
                    <Typography variant="h6" component="p" sx={{ textAlign: 'center', fontWeight: 400, mb: 4 }}>
                        Para solicitar nossos serviços ou orçamentos.
                    </Typography>

                    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ maxWidth: 640, mx: 'auto' }}>
                        <Stack spacing={2}>
                            {fields.map((field) => (
                                <TextField
                                    key={field.name}
                                    name={field.name}
                                    label={field.label}
                                    type={field.type}
                                    required
                                    fullWidth
                                    multiline={field.multiline}
                                    minRows={field.multiline ? 4 : undefined}
                                    value={form[field.name]}
                                    onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
                                    error={Boolean(errors?.[field.name])}
                                    helperText={errors?.[field.name]?.[0]}
                                    slotProps={{ htmlInput: { maxLength: field.max } }}
                                    sx={inputSx}
                                />
                            ))}

                            {/* Honeypot: escondido de pessoas, preenchido por bots */}
                            <Box sx={{ position: 'absolute', left: '-10000px' }} aria-hidden="true">
                                <input
                                    type="text"
                                    name="website"
                                    tabIndex={-1}
                                    autoComplete="off"
                                    value={form.website}
                                    onChange={(e) => setForm({ ...form, website: e.target.value })}
                                />
                            </Box>

                            {result && (
                                <Alert severity={result.ok ? 'success' : 'error'} variant="filled">
                                    {result.message}
                                </Alert>
                            )}

                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                disabled={sending}
                                endIcon={sending ? <CircularProgress size={18} color="inherit" /> : <SendIcon />}
                                sx={{ alignSelf: 'flex-end' }}
                            >
                                Enviar
                            </Button>
                        </Stack>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
}
