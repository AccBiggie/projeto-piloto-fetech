import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useEffect, useRef, useState } from 'react';

import { loadRecaptcha, type RecaptchaApi } from '@/painel/recaptcha';

export default function Recaptcha({ onChange, resetKey }: { onChange: (token: string) => void; resetKey: number }) {
    const host = useRef<HTMLDivElement>(null);
    const widget = useRef<{ api: RecaptchaApi; id: number } | null>(null);
    const [attempt, setAttempt] = useState(0);
    const [ready, setReady] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const compact = useMediaQuery('(max-width: 383px)');
    const [siteKey] = useState(() => document.querySelector<HTMLMetaElement>('meta[name="recaptcha-site-key"]')?.content.trim() ?? '');

    useEffect(() => {
        const container = host.current;
        if (!container || !siteKey) return;
        let active = true;
        const element = document.createElement('div');
        container.appendChild(element);
        setReady(false);
        setError(null);
        onChange('');

        loadRecaptcha().then((api) => {
            if (!active) return;
            const id = api.render(element, {
                sitekey: siteKey,
                size: compact ? 'compact' : 'normal',
                callback: (token) => {
                    if (!active) return;
                    setError(null);
                    onChange(token);
                },
                'expired-callback': () => {
                    if (active) onChange('');
                },
                'error-callback': () => {
                    if (!active) return;
                    onChange('');
                    setError('A verificação falhou. Confira sua conexão e tente novamente.');
                },
            });
            widget.current = { api, id };
            setReady(true);
        }).catch(() => {
            if (active) setError('Não foi possível carregar a verificação. Confira sua conexão e tente novamente.');
        });

        return () => {
            active = false;
            if (widget.current) {
                widget.current.api.reset(widget.current.id);
                widget.current = null;
            }
            element.remove();
        };
    }, [attempt, compact, onChange, siteKey]);

    useEffect(() => {
        if (widget.current) widget.current.api.reset(widget.current.id);
    }, [resetKey]);

    if (!siteKey) return <Alert severity="error">A verificação de segurança está indisponível. Entre em contato com o administrador.</Alert>;

    return (
        <Box>
            <Box ref={host} sx={{ display: 'flex', justifyContent: 'center', minHeight: 78 }} />
            {!ready && !error && <Typography role="status" sx={{ fontSize: 13, textAlign: 'center' }}>Carregando verificação…</Typography>}
            {error && (
                <Alert severity="error" sx={{ mt: 1 }} action={<Button color="inherit" size="small" onClick={() => setAttempt((value) => value + 1)}>Tentar novamente</Button>}>
                    {error}
                </Alert>
            )}
        </Box>
    );
}
