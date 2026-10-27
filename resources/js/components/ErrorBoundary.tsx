import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlineOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Component, type ReactNode } from 'react';

// Um erro de renderização desmonta o app inteiro e deixa a página em branco. Aqui ele vira uma
// mensagem com opção de recarregar; em desenvolvimento, mostra também o erro para diagnóstico.
export default class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
    state = { error: null as Error | null };

    static getDerivedStateFromError(error: Error) {
        return { error };
    }

    componentDidCatch(error: Error) {
        console.error(error);
    }

    render() {
        const { error } = this.state;
        if (!error) return this.props.children;
        return (
            <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center', px: 3, py: 10 }}>
                <ErrorOutlineIcon color="primary" sx={{ fontSize: 64 }} />
                <Typography variant="h5" component="h1">
                    Algo deu errado ao abrir esta página.
                </Typography>
                <Button variant="contained" onClick={() => window.location.reload()}>
                    Recarregar
                </Button>
                {import.meta.env.DEV && (
                    <Box component="pre" sx={{ maxWidth: '100%', overflow: 'auto', textAlign: 'left', fontSize: 13, p: 2, bgcolor: '#f4f4f4', borderRadius: 1 }}>
                        {String(error.stack ?? error)}
                    </Box>
                )}
            </Stack>
        );
    }
}
