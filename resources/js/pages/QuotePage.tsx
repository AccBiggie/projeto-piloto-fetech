import { keyframes } from '@emotion/react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckIcon from '@mui/icons-material/Check';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import SendIcon from '@mui/icons-material/Send';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import FormHelperText from '@mui/material/FormHelperText';
import InputAdornment from '@mui/material/InputAdornment';
import LinearProgress from '@mui/material/LinearProgress';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { type FormEvent, useEffect, useRef, useState } from 'react';
import { Link as RouterLink } from 'react-router';

import { type QuotePayload, type QuoteResult, sendQuote } from '@/api/quote';
import { whatsappUrl } from '@/components/FloatingActions';
import { services } from '@/components/Services';
import { brand, monoFont } from '@/theme';

// Orçamento em etapas. Os ids de serviços e do perfil são os mesmos validados no backend
// (app/Http/Requests/QuoteRequest.php).
const needs = [
    { id: 'pouco-investimento', label: 'Tenho pouco orçamento para investir.' },
    { id: 'fortalecer-marca', label: 'Quero fortalecer minha marca na internet.' },
    { id: 'blog', label: 'Gostaria de ter um blog.' },
    { id: 'divulgar', label: 'Pretendo divulgar produtos ou serviços.' },
    { id: 'vender-online', label: 'Quero vender pela internet.' },
    { id: 'automatizar', label: 'Preciso automatizar processos da empresa.' },
    { id: 'sem-dominio', label: 'Não tenho domínio registrado.' },
    { id: 'emails', label: 'Preciso de e-mails personalizados.' },
];

const steps = ['Contato', 'Serviços', 'Perfil', 'Referências'];

const email = 'fetech.ferreira@gmail.com';

const emptyQuote: QuotePayload = { name: '', email: '', phone: '', services: [], needs: [], references: '', details: '', website: '' };

// (44) 99883-3731 ou (44) 3333-4444, conforme os dígitos digitados
function formatPhone(value: string) {
    const d = value.replace(/\D/g, '').slice(0, 11);
    if (d.length <= 2) return d && `(${d}`;
    if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

const checks = {
    name: (q: QuotePayload) => q.name.trim().length >= 2,
    email: (q: QuotePayload) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(q.email.trim()),
    phone: (q: QuotePayload) => q.phone === '' || [10, 11].includes(q.phone.replace(/\D/g, '').length),
};

const stepIsValid = (step: number, q: QuotePayload) =>
    step === 0 ? checks.name(q) && checks.email(q) && checks.phone(q) : step === 1 ? q.services.length > 0 : true;

const stepIn = keyframes`
    from { opacity: 0; transform: translate3d(16px, 0, 0); }
    to { opacity: 1; transform: none; }
`;

const titleSx = { fontSize: { xs: 26, md: 34 }, fontWeight: 600, color: brand.dark, mb: 1, '&:focus': { outline: 'none' } } as const;

// Painel da esquerda: grafite com o brilho vermelho do topo da home
function Aside({ step, done }: { step: number; done: boolean }) {
    return (
        <Box
            component="aside"
            sx={{
                position: 'relative',
                overflow: 'hidden',
                color: '#fff',
                background: `radial-gradient(90% 60% at 0% 100%, rgba(224,20,59,.55), transparent 70%), linear-gradient(160deg, ${brand.graphiteLight}, ${brand.graphite} 60%)`,
                px: { xs: 3, md: 6 },
                py: { xs: 5, md: 8 },
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
            }}
        >
            <Box sx={{ maxWidth: 420, mx: 'auto', width: '100%' }}>
                <Typography sx={{ fontFamily: monoFont, fontSize: 14, color: 'rgba(255,255,255,.7)', mb: 2 }}>
                    <Box component="span" sx={{ color: brand.red }}>
                        {'>'}
                    </Box>{' '}
                    orçamento de site
                </Typography>
                <Typography component="h1" sx={{ fontSize: { xs: 26, md: 34 }, fontWeight: 700, lineHeight: 1.25 }}>
                    Faremos um orçamento com base nas suas respostas.
                </Typography>
                <Box sx={{ width: 64, height: 3, bgcolor: brand.red, borderRadius: 1, my: 3 }} />

                {/* Etapas: concluídas com check, atual em destaque */}
                <Stack component="ol" spacing={1.5} sx={{ display: { xs: 'none', md: 'flex' }, listStyle: 'none', p: 0, m: 0, mb: 5 }}>
                    {steps.map((label, index) => {
                        const finished = done || index < step;
                        const current = !done && index === step;
                        return (
                            <Box
                                component="li"
                                key={label}
                                aria-current={current ? 'step' : undefined}
                                sx={{ display: 'flex', alignItems: 'center', gap: 1.5, opacity: finished || current ? 1 : 0.5, transition: 'opacity .3s' }}
                            >
                                <Box
                                    sx={{
                                        width: 30,
                                        height: 30,
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontFamily: monoFont,
                                        fontSize: 14,
                                        border: `2px solid ${finished || current ? brand.red : 'rgba(255,255,255,.4)'}`,
                                        bgcolor: finished ? brand.red : 'transparent',
                                        transition: 'background-color .3s, border-color .3s',
                                    }}
                                >
                                    {finished ? <CheckIcon sx={{ fontSize: 18 }} /> : index + 1}
                                </Box>
                                <Typography sx={{ fontWeight: current ? 700 : 400 }}>{label}</Typography>
                            </Box>
                        );
                    })}
                </Stack>

                <Stack spacing={1} sx={{ alignItems: 'flex-start' }}>
                    <Link href={`mailto:${email}`} color="inherit" underline="hover" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                        <EmailOutlinedIcon fontSize="small" /> {email}
                    </Link>
                    <Link
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        color="inherit"
                        underline="hover"
                        sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}
                    >
                        <WhatsAppIcon fontSize="small" /> Prefere conversar? Chame no WhatsApp
                    </Link>
                </Stack>
            </Box>
        </Box>
    );
}

export default function QuotePage() {
    const [quote, setQuote] = useState(emptyQuote);
    const [step, setStep] = useState(0);
    const [touched, setTouched] = useState<Partial<Record<'name' | 'email' | 'phone' | 'services', boolean>>>({});
    const [sending, setSending] = useState(false);
    const [result, setResult] = useState<QuoteResult | null>(null);

    const done = Boolean(result?.ok);
    const errors = result && !result.ok ? result.errors : undefined;
    const last = step === steps.length - 1;

    // A página abre no topo, mesmo vindo do rodapé da home
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // A cada etapa o foco vai para o título, para leitores de tela anunciarem a pergunta nova
    const titleRef = useRef<HTMLHeadingElement>(null);
    const firstRender = useRef(true);
    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }
        titleRef.current?.focus();
    }, [step, done]);

    const update = <K extends keyof QuotePayload>(key: K, value: QuotePayload[K]) => setQuote((q) => ({ ...q, [key]: value }));
    const toggle = (key: 'services' | 'needs', id: string) =>
        setQuote((q) => ({ ...q, [key]: q[key].includes(id) ? q[key].filter((item) => item !== id) : [...q[key], id] }));

    // Erro do campo: validação local depois de tocado, ou a mensagem do servidor
    function fieldError(field: 'name' | 'email' | 'phone') {
        const server = errors?.[field]?.[0];
        if (server) return server;
        if (!touched[field] || checks[field](quote)) return undefined;
        return { name: 'Informe seu nome.', email: 'Informe um e-mail válido.', phone: 'Informe o DDD e o número.' }[field];
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!stepIsValid(step, quote)) {
            setTouched(step === 0 ? { name: true, email: true, phone: true } : { services: true });
            return;
        }
        if (!last) {
            setStep(step + 1);
            return;
        }
        setSending(true);
        const response = await sendQuote(quote);
        setResult(response);
        setSending(false);
        // Erro de validação do servidor: volta para a etapa do primeiro campo com problema
        if (!response.ok && response.errors) {
            const keys = Object.keys(response.errors);
            if (keys.some((key) => ['name', 'email', 'phone'].includes(key))) setStep(0);
            else if (keys.some((key) => key.startsWith('services'))) setStep(1);
            else if (keys.some((key) => key.startsWith('needs'))) setStep(2);
        }
    }

    // Check verde no fim do campo quando o valor é válido
    const validAdornment = (ok: boolean) =>
        ok
            ? {
                  input: {
                      endAdornment: (
                          <InputAdornment position="end">
                              <CheckIcon color="success" aria-hidden="true" />
                          </InputAdornment>
                      ),
                  },
              }
            : {};

    return (
        <Box sx={{ display: 'grid', gridTemplateColumns: { md: '5fr 7fr' }, minHeight: { md: 'calc(100svh - 72px)' }, bgcolor: '#fff' }}>
            <Aside step={step} done={done} />

            <Box sx={{ px: { xs: 3, md: 8 }, py: { xs: 5, md: 8 }, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Box sx={{ maxWidth: 640, width: '100%', mx: 'auto' }}>
                    {done ? (
                        <Stack spacing={2} sx={{ alignItems: 'flex-start', animation: `${stepIn} .4s ease both` }}>
                            <TaskAltIcon sx={{ fontSize: 64, color: brand.red }} />
                            <Typography component="h2" ref={titleRef} tabIndex={-1} sx={titleSx}>
                                Pedido enviado!
                            </Typography>
                            <Typography sx={{ color: brand.ink, fontSize: 18 }}>{result?.message}</Typography>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ pt: 2 }}>
                                <Button component={RouterLink} to="/" variant="contained" size="large">
                                    Voltar para a home
                                </Button>
                                <Button href={whatsappUrl} target="_blank" rel="noopener noreferrer" variant="outlined" size="large" startIcon={<WhatsAppIcon />}>
                                    Falar no WhatsApp
                                </Button>
                            </Stack>
                        </Stack>
                    ) : (
                        <Box component="form" onSubmit={handleSubmit} noValidate>
                            <Typography sx={{ fontFamily: monoFont, fontSize: 13, color: brand.ink, mb: 1 }}>
                                Etapa {step + 1} de {steps.length} · {steps[step]}
                            </Typography>
                            <LinearProgress
                                variant="determinate"
                                value={((step + 1) / steps.length) * 100}
                                aria-label="Progresso do orçamento"
                                sx={{ height: 4, borderRadius: 2, mb: 5, bgcolor: brand.section }}
                            />

                            <Box key={step} sx={{ animation: `${stepIn} .4s ease both`, '@media (prefers-reduced-motion: reduce)': { animation: 'none' } }}>
                                {step === 0 && (
                                    <>
                                        <Typography component="h2" ref={titleRef} tabIndex={-1} sx={{ ...titleSx, mb: 4 }}>
                                            Informações para contato
                                        </Typography>
                                        <Stack spacing={2.5}>
                                            <TextField
                                                label="Seu nome"
                                                name="name"
                                                autoComplete="name"
                                                required
                                                fullWidth
                                                value={quote.name}
                                                onChange={(e) => update('name', e.target.value)}
                                                onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                                                error={Boolean(fieldError('name'))}
                                                helperText={fieldError('name')}
                                                color={checks.name(quote) ? 'success' : 'primary'}
                                                slotProps={{ htmlInput: { maxLength: 100 }, ...validAdornment(checks.name(quote)) }}
                                            />
                                            <TextField
                                                label="Seu e-mail"
                                                name="email"
                                                type="email"
                                                autoComplete="email"
                                                required
                                                fullWidth
                                                value={quote.email}
                                                onChange={(e) => update('email', e.target.value)}
                                                onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                                                error={Boolean(fieldError('email'))}
                                                helperText={fieldError('email')}
                                                color={checks.email(quote) ? 'success' : 'primary'}
                                                slotProps={{ htmlInput: { maxLength: 150 }, ...validAdornment(checks.email(quote)) }}
                                            />
                                            <TextField
                                                label="Telefone (opcional)"
                                                name="phone"
                                                type="tel"
                                                autoComplete="tel-national"
                                                fullWidth
                                                value={quote.phone}
                                                onChange={(e) => update('phone', formatPhone(e.target.value))}
                                                onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
                                                error={Boolean(fieldError('phone'))}
                                                helperText={fieldError('phone')}
                                                color={quote.phone && checks.phone(quote) ? 'success' : 'primary'}
                                                slotProps={{ htmlInput: { inputMode: 'tel' }, ...validAdornment(quote.phone !== '' && checks.phone(quote)) }}
                                            />
                                        </Stack>
                                    </>
                                )}

                                {step === 1 && (
                                    <>
                                        <Typography component="h2" ref={titleRef} tabIndex={-1} sx={titleSx}>
                                            O que você precisa?
                                        </Typography>
                                        <Typography sx={{ color: brand.ink, mb: 4 }}>Escolha um ou mais serviços.</Typography>
                                        <Box
                                            role="group"
                                            aria-label="Serviços"
                                            sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}
                                        >
                                            {services.map(({ id, title, Icon }) => {
                                                const selected = quote.services.includes(id);
                                                return (
                                                    <Box
                                                        component="label"
                                                        key={id}
                                                        sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 1.5,
                                                            p: 2,
                                                            cursor: 'pointer',
                                                            borderRadius: 2,
                                                            border: `1px solid ${selected ? brand.red : brand.section}`,
                                                            bgcolor: selected ? 'rgba(224,20,59,.06)' : '#fff',
                                                            transition: 'border-color .25s, background-color .25s, box-shadow .25s',
                                                            '&:hover': { borderColor: brand.red, boxShadow: '0 .5rem 1rem rgba(224,20,59,.12)' },
                                                            '&:has(input:focus-visible)': { outline: `2px solid ${brand.red}`, outlineOffset: 2 },
                                                        }}
                                                    >
                                                        <Box
                                                            sx={{
                                                                width: 44,
                                                                height: 44,
                                                                flexShrink: 0,
                                                                borderRadius: '50%',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                color: selected ? '#fff' : brand.red,
                                                                bgcolor: selected ? brand.red : 'rgba(224,20,59,.08)',
                                                                transition: 'background-color .25s, color .25s',
                                                            }}
                                                        >
                                                            <Icon aria-hidden="true" />
                                                        </Box>
                                                        <Typography sx={{ fontWeight: 600, flex: 1 }}>{title}</Typography>
                                                        <Checkbox checked={selected} onChange={() => toggle('services', id)} sx={{ p: 0.5 }} />
                                                    </Box>
                                                );
                                            })}
                                        </Box>
                                        {touched.services && quote.services.length === 0 && (
                                            <FormHelperText error sx={{ mt: 1.5 }}>
                                                Escolha pelo menos um serviço.
                                            </FormHelperText>
                                        )}
                                    </>
                                )}

                                {step === 2 && (
                                    <>
                                        <Typography component="h2" ref={titleRef} tabIndex={-1} sx={titleSx}>
                                            Com quais dessas opções você se identifica?
                                        </Typography>
                                        <Typography sx={{ color: brand.ink, mb: 3 }}>Marque quantas quiser, ou nenhuma.</Typography>
                                        <FormGroup aria-label="Com quais opções você se identifica">
                                            {needs.map(({ id, label }) => (
                                                <FormControlLabel
                                                    key={id}
                                                    control={<Checkbox checked={quote.needs.includes(id)} onChange={() => toggle('needs', id)} />}
                                                    label={label}
                                                    sx={{ py: 0.25 }}
                                                />
                                            ))}
                                        </FormGroup>
                                    </>
                                )}

                                {step === 3 && (
                                    <>
                                        <Typography component="h2" ref={titleRef} tabIndex={-1} sx={titleSx}>
                                            Sites de referência
                                        </Typography>
                                        <Typography sx={{ color: brand.ink, mb: 4 }}>Conhece algum site parecido com o que você deseja?</Typography>
                                        <Stack spacing={2.5}>
                                            <TextField
                                                label="Links dos sites"
                                                placeholder="Cole aqui os links dos sites..."
                                                name="references"
                                                multiline
                                                minRows={4}
                                                fullWidth
                                                value={quote.references}
                                                onChange={(e) => update('references', e.target.value)}
                                                error={Boolean(errors?.references)}
                                                helperText={errors?.references?.[0]}
                                                slotProps={{ htmlInput: { maxLength: 2000 } }}
                                            />
                                            <TextField
                                                label="Quer contar mais sobre o projeto? (opcional)"
                                                name="details"
                                                multiline
                                                minRows={3}
                                                fullWidth
                                                value={quote.details}
                                                onChange={(e) => update('details', e.target.value)}
                                                error={Boolean(errors?.details)}
                                                helperText={errors?.details?.[0]}
                                                slotProps={{ htmlInput: { maxLength: 2000 } }}
                                            />
                                        </Stack>
                                    </>
                                )}
                            </Box>

                            {/* Honeypot: escondido de pessoas, preenchido por bots */}
                            <Box sx={{ position: 'absolute', left: '-10000px' }} aria-hidden="true">
                                <input
                                    type="text"
                                    name="website"
                                    tabIndex={-1}
                                    autoComplete="off"
                                    value={quote.website}
                                    onChange={(e) => update('website', e.target.value)}
                                />
                            </Box>

                            {result && !result.ok && (
                                <Alert severity="error" variant="filled" sx={{ mt: 4 }}>
                                    {result.message}
                                </Alert>
                            )}

                            <Stack direction="row" sx={{ mt: 5, justifyContent: 'space-between', alignItems: 'center' }}>
                                {step > 0 ? (
                                    <Button onClick={() => setStep(step - 1)} startIcon={<ArrowBackIcon />} color="inherit" sx={{ color: brand.ink }}>
                                        Voltar
                                    </Button>
                                ) : (
                                    <span />
                                )}
                                <Button
                                    type="submit"
                                    variant={last ? 'contained' : 'outlined'}
                                    size="large"
                                    disabled={sending}
                                    endIcon={sending ? <CircularProgress size={18} color="inherit" /> : last ? <SendIcon /> : <ArrowForwardIcon />}
                                >
                                    {last ? 'Enviar pedido' : 'Avançar'}
                                </Button>
                            </Stack>
                        </Box>
                    )}
                </Box>
            </Box>
        </Box>
    );
}
