import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import { Link as RouterLink } from 'react-router';

import FetechLogo from '@/components/FetechLogo';
import { brand } from '@/theme';

// Cabeçalho das páginas de contato e orçamento: só a marca e o caminho de volta para o site
export default function BackHeader() {
    return (
        <AppBar position="sticky" elevation={6} sx={{ bgcolor: brand.red, color: '#fff' }}>
            <Container maxWidth="lg">
                <Toolbar disableGutters sx={{ minHeight: { xs: 64, md: 72 } }}>
                    <Box component={RouterLink} to="/" sx={{ display: 'flex', color: '#fff', mr: 'auto' }} aria-label="Fetech: página inicial">
                        <FetechLogo sx={{ width: { xs: 145, md: 160 }, height: 'auto', aspectRatio: '200 / 55' }} />
                    </Box>
                    <Button
                        component={RouterLink}
                        to="/"
                        startIcon={<ArrowBackIcon />}
                        sx={{
                            fontSize: 16,
                            fontWeight: 400,
                            color: '#fff',
                            border: '1px solid #fff',
                            transition: 'background-color .5s, color .5s',
                            '&:hover': { bgcolor: '#fff', color: brand.red },
                        }}
                    >
                        Voltar para o site
                    </Button>
                </Toolbar>
            </Container>
        </AppBar>
    );
}
