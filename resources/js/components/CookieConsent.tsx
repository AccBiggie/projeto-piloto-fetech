import CookieOutlinedIcon from '@mui/icons-material/CookieOutlined';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Slide from '@mui/material/Slide';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';

type Consent = 'essential' | 'all';

const storageKey = 'fetech.cookie-consent';

function readConsent(): Consent | null {
    try {
        return localStorage.getItem(storageKey) as Consent | null;
    } catch {
        return null;
    }
}

export default function CookieConsent() {
    const [consent, setConsent] = useState(readConsent);

    function choose(value: Consent) {
        try {
            localStorage.setItem(storageKey, value);
        } catch {
            // Sem storage (aba anônima): só fecha o aviso nesta visita
        }
        setConsent(value);
    }

    return (
        <Slide direction="up" in={consent === null} mountOnEnter unmountOnExit>
            <Paper
                elevation={8}
                role="dialog"
                aria-label="Aviso de cookies"
                sx={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 'snackbar', py: 2, borderRadius: 0 }}
            >
                <Container maxWidth="lg">
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ alignItems: { md: 'center' } }}>
                        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flex: 1 }}>
                            <CookieOutlinedIcon color="primary" />
                            <Typography variant="body2">
                                <strong>Você gosta de cookies?</strong> Usamos cookies para garantir que você tenha a melhor
                                experiência em nosso site.
                            </Typography>
                        </Stack>
                        <Stack direction="row" spacing={1}>
                            <Button variant="outlined" onClick={() => choose('essential')}>
                                Apenas essenciais
                            </Button>
                            <Button variant="contained" onClick={() => choose('all')}>
                                Permitir todos
                            </Button>
                        </Stack>
                    </Stack>
                </Container>
            </Paper>
        </Slide>
    );
}
