import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

import { brand } from '@/theme';

export default function About() {
    return (
        <Box component="section" id="sobre" sx={{ py: 6, scrollMarginTop: 80 }}>
            <Container maxWidth="lg">
                <Paper
                    elevation={3}
                    sx={{
                        bgcolor: brand.teal,
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        alignItems: 'center',
                        gap: 4,
                        p: { xs: 3, md: 5 },
                    }}
                >
                    <Box component="img" src="/assets/logos/Solucoes.svg" alt="" sx={{ width: { xs: '70%', md: '30%' }, maxHeight: 375 }} />
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h4" component="h2" sx={{ textTransform: 'uppercase', textAlign: 'center', mb: 3 }}>
                            Unindo Arte em Hardware e Tecnologia
                        </Typography>
                        <Typography variant="h6" component="p" sx={{ color: brand.ink, fontWeight: 400, mb: 2 }}>
                            Estamos a um ano no mercado de trabalho buscando inovações e implementando melhores soluções
                            para sua empresa.
                        </Typography>
                        <Typography sx={{ fontFamily: '"Source Code Pro", monospace', textAlign: 'justify', mb: 3 }}>
                            A Fetech Informatica surgiu com a necessidade de fornecer serviços de TI e consultorias técnicas
                            para atender a toda a demanda do mercado da tecnologia.
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 2 }}>
                            <Box component="img" src="/assets/logos/LogoHeader.svg" alt="" sx={{ width: 64 }} />
                            <Button variant="contained" href="#contato">
                                Entre em contato
                            </Button>
                        </Box>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
}
