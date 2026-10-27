import AlternateEmailOutlinedIcon from '@mui/icons-material/AlternateEmailOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CodeOutlinedIcon from '@mui/icons-material/CodeOutlined';
import DnsOutlinedIcon from '@mui/icons-material/DnsOutlined';
import ImportantDevicesOutlinedIcon from '@mui/icons-material/ImportantDevicesOutlined';
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import SectionTitle from '@/components/SectionTitle';
import { useReveal } from '@/reveal/useReveal';
import { brand } from '@/theme';

// Desenvolvimento em primeiro lugar; o suporte técnico continua como serviço complementar.
// O id é a âncora do card, usada também pelo submenu de Serviços do cabeçalho.
export const services = [
    {
        Icon: LanguageOutlinedIcon,
        id: 'criacao-de-sites',
        title: 'Criação de Sites',
        text: 'Sites institucionais e landing pages sob medida, rápidos, responsivos e prontos para o Google.',
    },
    {
        Icon: ShoppingCartOutlinedIcon,
        id: 'loja-virtual',
        title: 'Loja Virtual',
        text: 'Venda seus produtos e serviços pela internet com uma loja completa, segura e fácil de administrar.',
    },
    {
        Icon: CodeOutlinedIcon,
        id: 'sistema-web',
        title: 'Sistema Web',
        text: 'Sistemas personalizados que automatizam processos e atendem às necessidades únicas da sua empresa.',
    },
    {
        Icon: DnsOutlinedIcon,
        id: 'hospedagem-de-sites',
        title: 'Hospedagem de Sites',
        text: 'Hospedagem e servidores configurados e monitorados para manter seu site sempre no ar.',
    },
    {
        Icon: AlternateEmailOutlinedIcon,
        id: 'email-profissional',
        title: 'E-mail Profissional',
        text: 'Endereços de e-mail com o domínio da sua empresa, para se comunicar com mais credibilidade.',
    },
    {
        Icon: ImportantDevicesOutlinedIcon,
        id: 'suporte-ti',
        title: 'Suporte e Soluções em TI',
        text: 'Diagnóstico e reparo de notebooks, desktops e televisores, com análise técnica e atendimento ágil.',
    },
];

export default function Services() {
    const cards = useReveal({ stagger: true, delay: 80 });
    return (
        <Box component="section" id="servicos" sx={{ bgcolor: brand.section, py: { xs: 8, md: 12.5 } }}>
            <Container maxWidth="lg">
                <SectionTitle>Serviços</SectionTitle>
                <Grid container spacing={2} {...cards}>
                    {services.map((service) => (
                        <Grid key={service.title} size={{ xs: 12, sm: 6, lg: 4 }}>
                            <Box
                                component="a"
                                id={service.id}
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
                                <service.Icon aria-hidden="true" sx={{ fontSize: 64, color: brand.red, mb: 2 }} />
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
