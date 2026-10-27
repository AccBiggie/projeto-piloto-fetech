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
import SectionTitle from '@/components/SectionTitle';
import { useReveal } from '@/reveal/useReveal';
import { brand } from '@/theme';

const emptyForm: ContactPayload = { name: '', email: '', subject: '', message: '', website: '' };

const fields: { name: Exclude<keyof ContactPayload, 'website'>; label: string; type?: string; max: number; multiline?: boolean }[] = [
    { name: 'name', label: 'Nome', max: 100 },
    { name: 'email', label: 'E-mail', type: 'email', max: 150 },
    { name: 'subject', label: 'Assunto', max: 150 },
    { name: 'message', label: 'Mensagem', max: 2000, multiline: true },
];

export default function ContactForm() {
    const [form, setForm] = useState(emptyForm);
    const [sending, setSending] = useState(false);
    const [result, setResult] = useState<ContactResult | null>(null);

    const errors = result && !result.ok ? result.errors : undefined;
    const card = useReveal({ delay: 80 });

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
        <Box component="section" id="contato" sx={{ bgcolor: brand.sectionAlt, py: { xs: 8, md: 12.5 } }}>
            <Container maxWidth="lg">
                <SectionTitle>Contato</SectionTitle>
                <Paper {...card} elevation={0} sx={{ border: `1px solid ${brand.section}`, borderRadius: 2.5, p: { xs: 3, md: 6 } }}>
                    <Typography variant="h5" component="p" sx={{ textAlign: 'center', mb: 1 }}>
                        Vamos tirar sua ideia do papel?
                    </Typography>
                    <Typography sx={{ textAlign: 'center', opacity: 0.6, mb: 4 }}>
                        Conte o que você precisa, seja um novo projeto ou um equipamento com defeito, e retornamos com um
                        orçamento.
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
