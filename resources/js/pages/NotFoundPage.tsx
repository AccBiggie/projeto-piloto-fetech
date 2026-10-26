import SearchOffIcon from '@mui/icons-material/SearchOff';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router';

export default function NotFoundPage() {
    return (
        <Container maxWidth="md" sx={{ py: 10 }}>
            <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center' }}>
                <SearchOffIcon color="primary" sx={{ fontSize: 64 }} />
                <Typography variant="h4" component="h1">
                    Página não encontrada
                </Typography>
                <Button variant="contained" component={RouterLink} to="/">
                    Voltar para a página inicial
                </Button>
            </Stack>
        </Container>
    );
}
