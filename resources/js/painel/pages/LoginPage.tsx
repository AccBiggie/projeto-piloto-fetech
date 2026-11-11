import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { type FormEvent, useState } from 'react';

import { ApiError, authApi } from '@/painel/api';
import AuthShell from '@/painel/components/AuthShell';
import Recaptcha from '@/painel/components/Recaptcha';

type Step = 'credentials' | 'code';

/** Etapa 1: e-mail e senha. Etapa 2: código do app autenticador (ou um código de recuperação). */
export default function LoginPage({ onAuthenticated }: { onAuthenticated: () => void }) {
    const [step, setStep] = useState<Step>('credentials');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);
    const [code, setCode] = useState('');
    const [useRecovery, setUseRecovery] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const [captchaToken, setCaptchaToken] = useState('');
    const [captchaReset, setCaptchaReset] = useState(0);

    async function submitCredentials(event: FormEvent) {
        event.preventDefault();
        if (busy || !captchaToken) return;
        setBusy(true);
        setError(null);
        try {
            const result = await authApi.login(email, password, remember, captchaToken);
            if (result?.two_factor) {
                setStep('code');
                setPassword('');
            } else {
                onAuthenticated();
            }
        } catch (e) {
            setError(e instanceof ApiError ? (e.field('g-recaptcha-response') ?? e.field('email') ?? e.message) : 'Não foi possível entrar. Tente de novo.');
        } finally {
            setCaptchaToken('');
            setCaptchaReset((value) => value + 1);
            setBusy(false);
        }
    }

    async function submitCode(event: FormEvent) {
        event.preventDefault();
        setBusy(true);
        setError(null);
        try {
            await authApi.challenge(useRecovery ? { recovery_code: code.trim() } : { code: code.replace(/\s/g, '') });
            onAuthenticated();
        } catch (e) {
            if (e instanceof ApiError && e.status === 419) {
                setStep('credentials');
            }
            setError(e instanceof ApiError ? (e.field(useRecovery ? 'recovery_code' : 'code') ?? e.message) : 'Código inválido.');
        } finally {
            setBusy(false);
        }
    }

    if (step === 'code') {
        return (
            <AuthShell
                command="painel --verificar"
                title="Verificação em duas etapas"
                subtitle={useRecovery ? 'Digite um dos códigos de recuperação que você guardou.' : 'Digite o código de 6 dígitos do seu app autenticador.'}
            >
                <Stack component="form" spacing={2.5} onSubmit={submitCode} noValidate>
                    {error && <Alert severity="error">{error}</Alert>}
                    <TextField
                        label={useRecovery ? 'Código de recuperação' : 'Código'}
                        value={code}
                        onChange={(event) => setCode(event.target.value)}
                        autoFocus
                        required
                        autoComplete="one-time-code"
                        slotProps={{ htmlInput: useRecovery ? { spellCheck: false } : { inputMode: 'numeric', pattern: '[0-9]*', maxLength: 6 } }}
                    />
                    <Button type="submit" variant="contained" size="large" disabled={busy || code.trim() === ''}>
                        Confirmar
                    </Button>
                    <Link
                        component="button"
                        type="button"
                        onClick={() => {
                            setUseRecovery(!useRecovery);
                            setCode('');
                            setError(null);
                        }}
                        sx={{ alignSelf: 'center', fontSize: 14 }}
                    >
                        {useRecovery ? 'Usar o app autenticador' : 'Perdi o acesso ao app autenticador'}
                    </Link>
                </Stack>
            </AuthShell>
        );
    }

    return (
        <AuthShell command="painel --login" title="Entrar no painel">
            <Stack component="form" spacing={2.5} onSubmit={submitCredentials} noValidate>
                {error && <Alert severity="error">{error}</Alert>}
                <TextField label="E-mail" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="username" autoFocus required />
                <TextField label="Senha" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required />
                <FormControlLabel control={<Checkbox checked={remember} onChange={(event) => setRemember(event.target.checked)} />} label="Manter conectado neste dispositivo" />
                <Recaptcha onChange={setCaptchaToken} resetKey={captchaReset} />
                <Button type="submit" variant="contained" size="large" disabled={busy || !email || !password || !captchaToken}>
                    Entrar
                </Button>
            </Stack>
        </AuthShell>
    );
}
