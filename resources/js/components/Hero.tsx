import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import { brand } from '@/theme';

export default function Hero() {
    return (
        <Box
            component="section"
            id="inicio"
            sx={{
                backgroundImage: 'url(/assets/logos/fetechwal.png)',
                backgroundSize: 'cover',
                backgroundAttachment: { md: 'fixed' },
                borderBottom: `5px solid ${brand.redHover}`,
                py: { xs: 6, md: 8 },
            }}
        >
            <Container maxWidth="lg">
                <Grid container spacing={4} sx={{ alignItems: 'center' }}>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Typography variant="h3" component="h1" sx={{ color: brand.mist, textTransform: 'uppercase', mb: 3 }}>
                            Orçamento sem compromisso
                        </Typography>
                        <Typography variant="h6" component="p" sx={{ color: brand.mist, textTransform: 'uppercase', mb: 4 }}>
                            Solicite já o seu orçamento!
                        </Typography>
                        <Button variant="contained" size="large" href="#contato">
                            Entre em contato
                        </Button>
                    </Grid>
                    <Grid size={{ xs: 12, md: 8 }} sx={{ textAlign: 'center' }}>
                        <Box component="img" src="/assets/logos/devTeste.svg" alt="" sx={{ maxWidth: '70%', height: 'auto' }} />
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}
