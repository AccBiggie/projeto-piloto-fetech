import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

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
        <Box component="section" id="servicos" sx={{ py: 6, scrollMarginTop: 80 }}>
            <Container maxWidth="lg">
                <Typography variant="h4" component="h2" sx={{ textAlign: 'center', mb: 1 }}>
                    Nossos Serviços
                </Typography>
                <Typography variant="subtitle1" sx={{ textAlign: 'center', color: 'text.secondary', mb: 4 }}>
                    Além da venda de componentes de computadores, realizamos os seguintes tipos de serviços
                </Typography>
                <Grid container spacing={3}>
                    {services.map((service) => (
                        <Grid key={service.title} size={{ xs: 12, sm: 6, lg: 3 }}>
                            <Card
                                elevation={4}
                                sx={{
                                    height: '100%',
                                    bgcolor: brand.mist,
                                    borderBottom: `3px solid ${brand.redHover}`,
                                    transition: 'transform .2s, background-color .2s',
                                    '&:hover': { transform: 'scale(1.03)', bgcolor: 'background.paper' },
                                }}
                            >
                                <CardActionArea href="#contato" sx={{ height: '100%', p: 2 }}>
                                    <Box sx={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Box component="img" src={service.image} alt="" sx={{ maxHeight: 160, maxWidth: '100%' }} />
                                    </Box>
                                    <CardContent sx={{ textAlign: 'center' }}>
                                        <Typography variant="h6" component="h3" sx={{ textTransform: 'uppercase', mb: 1 }}>
                                            {service.title}
                                        </Typography>
                                        <Typography variant="body2">{service.text}</Typography>
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
}
