import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { type FormEvent, useEffect, useRef, useState } from 'react';

import { ApiError, authApi } from '@/painel/api';
import AuthShell from '@/painel/components/AuthShell';
import { brand, monoFont } from '@/theme';

type Step = 'loading' | 'password' | 'scan' | 'codes';

/**
 * Configuração obrigatória do app autenticador no primeiro acesso: confirma a senha, mostra o QR code,
 * valida um código e entrega os códigos de recuperação.
 */
export default function TwoFactorSetupPage({ onDone, onLogout }: { onDone: () => void; onLogout: () => void }) {
    const [step, setStep] = useState<Step>('loading');
    const [password, setPassword] = useState('');
    const [qr, setQr] = useState<{ svg: string; secret: string } | null>(null);
    const [code, setCode] = useState('');
    const [codes, setCodes] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    async function startEnrollment() {
        await authApi.enableTwoFactor();
        const [{ svg }, { secretKey }] = await Promise.all([authApi.qrCode(), authApi.secretKey()]);
        setQr({ svg, secret: secretKey });
        setStep('scan');
    }

    // Uma vez só (o StrictMode roda o efeito duas vezes): cada ativação gera uma chave nova
    const started = useRef(false);
    useEffect(() => {
        if (started.current) return;
        started.current = true;
        authApi
            .passwordConfirmed()
            .then(({ confirmed }) => (confirmed ? startEnrollment() : setStep('password')))
            .catch(() => setStep('password'));
    }, []);

    async function submitPassword(event: FormEvent) {
        event.preventDefault();
        setBusy(true);
        setError(null);
        try {
            await authApi.confirmPassword(password);
            setPassword('');
            await startEnrollment();
        } catch (e) {
            setError(e instanceof ApiError ? (e.field('password') ?? e.message) : 'Não foi possível confirmar a senha.');
        } finally {
            setBusy(false);
        }
    }

    async function submitCode(event: FormEvent) {
        event.preventDefault();
        setBusy(true);
        setError(null);
        try {
            await authApi.confirmTwoFactor(code.replace(/\s/g, ''));
            setCodes(await authApi.recoveryCodes());
            setStep('codes');
        } catch (e) {
            setError(e instanceof ApiError ? (e.field('code') ?? e.message) : 'Código inválido.');
        } finally {
            setBusy(false);
        }
    }

    const logout = (
        <Button onClick={onLogout} sx={{ alignSelf: 'center' }}>
            Sair
        </Button>
    );

    if (step === 'loading') {
        return (
            <AuthShell command="painel --2fa" title="Proteja sua conta">
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress aria-label="Carregando" />
                </Box>
            </AuthShell>
        );
    }

    if (step === 'password') {
        return (
            <AuthShell command="painel --2fa" title="Proteja sua conta" subtitle="O painel exige verificação em duas etapas. Confirme sua senha para configurar o app autenticador.">
                <Stack component="form" spacing={2.5} onSubmit={submitPassword} noValidate>
                    {error && <Alert severity="error">{error}</Alert>}
                    <TextField label="Senha" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" autoFocus required />
                    <Button type="submit" variant="contained" size="large" disabled={busy || !password}>
                        Continuar
                    </Button>
                    {logout}
                </Stack>
            </AuthShell>
        );
    }

    if (step === 'scan' && qr) {
        return (
            <AuthShell
                command="painel --2fa"
                title="Escaneie o QR code"
                subtitle="Abra o Google Authenticator, Microsoft Authenticator, Authy ou outro app de códigos e adicione esta conta."
                width={460}
            >
                <Stack component="form" spacing={2.5} onSubmit={submitCode} noValidate>
                    <Box
                        aria-label="QR code para o app autenticador"
                        role="img"
                        sx={{ alignSelf: 'center', p: 1.5, bgcolor: '#fff', border: `1px solid ${brand.section}`, borderRadius: 2, lineHeight: 0, '& svg': { width: 192, height: 192 } }}
                        // SVG gerado pelo próprio servidor (Fortify / bacon-qr-code)
                        dangerouslySetInnerHTML={{ __html: qr.svg }}
                    />
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography sx={{ fontSize: 13, color: brand.ink }}>Sem câmera? Digite a chave:</Typography>
                        <Typography sx={{ fontFamily: monoFont, fontSize: 15, letterSpacing: 1, wordBreak: 'break-all' }}>{qr.secret}</Typography>
                    </Box>
                    {error && <Alert severity="error">{error}</Alert>}
                    <TextField
                        label="Código de 6 dígitos"
                        value={code}
                        onChange={(event) => setCode(event.target.value)}
                        required
                        autoComplete="one-time-code"
                        slotProps={{ htmlInput: { inputMode: 'numeric', pattern: '[0-9]*', maxLength: 6 } }}
                    />
                    <Button type="submit" variant="contained" size="large" disabled={busy || code.trim().length < 6}>
                        Ativar verificação
                    </Button>
                    {logout}
                </Stack>
            </AuthShell>
        );
    }

    return (
        <AuthShell
            command="painel --2fa"
            title="Guarde os códigos de recuperação"
            subtitle="Cada código entra uma única vez, se você perder o celular. Guarde-os num gerenciador de senhas: eles não serão mostrados de novo."
            width={460}
        >
            <Stack spacing={2.5}>
                <Box
                    component="ul"
                    sx={{ listStyle: 'none', m: 0, p: 2, borderRadius: 2, bgcolor: brand.graphite, color: '#fff', fontFamily: monoFont, fontSize: 14, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1 }}
                >
                    {codes.map((item) => (
                        <li key={item}>{item}</li>
                    ))}
                </Box>
                <Button variant="outlined" onClick={() => navigator.clipboard?.writeText(codes.join('\n'))}>
                    Copiar códigos
                </Button>
                <Button variant="contained" size="large" onClick={onDone}>
                    Já guardei, abrir o painel
                </Button>
            </Stack>
        </AuthShell>
    );
}
