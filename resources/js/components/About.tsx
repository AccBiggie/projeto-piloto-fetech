import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import FetechLogo from '@/components/FetechLogo';
import SectionTitle from '@/components/SectionTitle';
import { useReveal } from '@/reveal/useReveal';
import { brand } from '@/theme';

export default function About() {
    const content = useReveal({ stagger: true, preset: 'fade', delay: 80 });
    return (
        <Box component="section" id="sobre" sx={{ bgcolor: brand.red, color: '#fff', py: { xs: 8, md: 12.5 } }}>
            <Container maxWidth="lg">
                <SectionTitle>Sobre</SectionTitle>
                <Box {...content} sx={{ maxWidth: 820, mx: 'auto', textAlign: 'center' }}>
                    <Typography variant="h4" component="p" sx={{ fontSize: { xs: 24, md: 32 }, mb: 3 }}>
                        Unindo arte em hardware e tecnologia
                    </Typography>
                    <Typography sx={{ fontSize: 18, opacity: 0.8, mb: 2 }}>
                        Estamos a um ano no mercado de trabalho buscando inovações e implementando melhores soluções para sua
                        empresa.
                    </Typography>
                    <Typography sx={{ fontSize: 18, opacity: 0.8, mb: 4 }}>
                        A Fetech Informatica surgiu com a necessidade de fornecer serviços de TI e consultorias técnicas para
                        atender a toda a demanda do mercado da tecnologia.
                    </Typography>
                    <FetechLogo sx={{ width: 160, height: 'auto', aspectRatio: '200 / 55', display: 'block', mx: 'auto', mb: 4 }} />
                    <Button
                        variant="outlined"
                        color="inherit"
                        size="large"
                        href="#contato"
                        sx={{ borderColor: '#fff', '&:hover': { bgcolor: '#fff', color: brand.red } }}
                    >
                        Entre em contato
                    </Button>
                </Box>
            </Container>
        </Box>
    );
}
