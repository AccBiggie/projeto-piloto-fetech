import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import SectionTitle from '@/components/SectionTitle';
import { brand } from '@/theme';

const services = [
    {
        image: '/assets/logos/destaque1.svg',
        title: 'Soluções em TI',
        text: 'A Fetech Informática atende você por diversas formas, assistência técnica, suprimentos de TI e consultorias.',
    },
    {
        image: '/assets/logos/destaque2.svg',
        title: 'Notebooks, desktop e televisores',
        text: 'Temos uma equipe especializada em análises técnicas para reparar seu equipamento em tempo ágil.',
    },
    {
        image: '/assets/logos/destaque3.svg',
        title: 'Solicite seu orçamento',
        text: 'Os produtos enviados para a Fetech irão passar por uma análise do defeito para solucionar o seu problema.',
    },
    {
        image: '/assets/logos/destaque4.svg',
        title: 'Os melhores preços!',
        text: 'Montamos o seu computador de acordo com a sua necessidade, entre em contato e solicite o seu orçamento.',
    },
];

export default function Services() {
    return (
        <Box component="section" id="servicos" sx={{ bgcolor: brand.section, py: { xs: 8, md: 12.5 }, scrollMarginTop: 64 }}>
            <Container maxWidth="lg">
                <SectionTitle>Serviços</SectionTitle>
                <Grid container spacing={2}>
                    {services.map((service) => (
                        <Grid key={service.title} size={{ xs: 12, sm: 6, lg: 3 }}>
                            <Box
                                component="a"
                                href="#contato"
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    height: '100%',
                                    px: 2,
                                    pt: 6,
                                    pb: 7,
                                    position: 'relative',
                                    textAlign: 'center',
                                    textDecoration: 'none',
                                    color: brand.dark,
                                    bgcolor: '#fff',
                                    border: `1px solid ${brand.section}`,
                                    borderRadius: 2.5,
                                    transition: 'box-shadow .7s',
                                    '&:hover': { boxShadow: '0 .5rem 1rem rgba(0,0,0,.15)' },
                                    '&:hover .saiba-mais, &:focus-visible .saiba-mais': { opacity: 1 },
                                }}
                            >
                                <Box component="img" src={service.image} alt="" sx={{ width: 96, height: 96, objectFit: 'contain', mb: 2 }} />
                                <Typography variant="h6" component="h3" sx={{ fontSize: 20, mb: 1.5 }}>
                                    {service.title}
                                </Typography>
                                <Typography sx={{ opacity: 0.5 }}>{service.text}</Typography>
                                <Box
                                    component="span"
                                    className="saiba-mais"
                                    sx={{
                                        position: 'absolute',
                                        left: 0,
                                        right: 0,
                                        bottom: 20,
                                        display: 'inline-flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        opacity: 0,
                                        transition: 'opacity .5s',
                                    }}
                                >
                                    Saiba mais <ChevronRightIcon fontSize="small" />
                                </Box>
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
}
