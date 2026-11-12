import CookieOutlinedIcon from '@mui/icons-material/CookieOutlined';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Slide from '@mui/material/Slide';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router';

// Aviso de privacidade. O site público não grava cookies nem carrega rastreadores, então não há consentimento
// a pedir (guia de cookies da ANPD): o aviso só informa e leva à política. Se um dia entrar um cookie
// opcional (Analytics, pixel), ele volta a ser um pedido de consentimento, com "Aceitar" e "Recusar" de mesmo
// peso, e o script só carrega depois do aceite.

const storageKey = 'fetech.cookie-notice';
// Escolha do banner antigo ("Apenas essenciais"/"Permitir todos"), que não controlava nada
const legacyKey = 'fetech.cookie-consent';

function readDismissed(): boolean {
    try {
        localStorage.removeItem(legacyKey);
        return localStorage.getItem(storageKey) === 'dismissed';
    } catch {
        return false;
    }
}

export default function PrivacyNotice() {
    const [dismissed, setDismissed] = useState(readDismissed);

    function dismiss() {
        try {
            localStorage.setItem(storageKey, 'dismissed');
        } catch {
            // Sem storage (aba anônima): só fecha o aviso nesta visita
        }
        setDismissed(true);
    }

    return (
        <Slide direction="up" in={!dismissed} mountOnEnter unmountOnExit>
            <Paper
                elevation={8}
                role="region"
                aria-label="Aviso de privacidade"
                sx={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 'snackbar', py: 2, borderRadius: 0 }}
            >
                <Container maxWidth="lg">
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ alignItems: { md: 'center' } }}>
                        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flex: 1 }}>
                            <CookieOutlinedIcon color="primary" />
                            <Typography variant="body2">
                                Este site não usa cookies de rastreamento ou publicidade. Saiba como tratamos os seus dados na{' '}
                                <Link component={RouterLink} to="/privacidade" onClick={dismiss}>
                                    Política de Privacidade
                                </Link>
                                .
                            </Typography>
                        </Stack>
                        <Button variant="contained" onClick={dismiss} sx={{ alignSelf: { xs: 'flex-end', md: 'center' } }}>
                            Entendi
                        </Button>
                    </Stack>
                </Container>
            </Paper>
        </Slide>
    );
}
