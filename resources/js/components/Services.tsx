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

const ease = 'cubic-bezier(.22,.61,.36,1)';

// O que antes só aparecia no hover (sombra e "Saiba mais") agora é o layout fixo do card. O hover
// e o foco do teclado destacam: o card sobe, ganha borda e sombra vermelhas, abre a barra do topo
// e o ícone se inverte.
const cardSx = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: '100%',
    px: 3,
    pt: 6,
    pb: 4,
    position: 'relative',
    overflow: 'hidden',
    textAlign: 'center',
    textDecoration: 'none',
    color: brand.dark,
    bgcolor: '#fff',
    border: `1px solid ${brand.section}`,
    borderRadius: 2.5,
    boxShadow: '0 .5rem 1rem rgba(0,0,0,.08)',
    transition: `transform .35s ${ease}, box-shadow .35s ${ease}, border-color .35s ${ease}`,
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 4,
        bgcolor: brand.red,
        transform: 'scaleX(0)',
        transition: `transform .35s ${ease}`,
    },
    '&:hover, &:focus-visible': {
        transform: 'translateY(-6px)',
        borderColor: brand.red,
        boxShadow: '0 1.25rem 2.5rem rgba(224,20,59,.18)',
        '&::before': { transform: 'scaleX(1)' },
        '& .icone': { bgcolor: brand.red, color: '#fff', transform: 'scale(1.06)' },
        '& .saiba-mais svg': { transform: 'translateX(4px)' },
    },
    '&:focus-visible': { outline: `2px solid ${brand.red}`, outlineOffset: 3 },
    '@media (prefers-reduced-motion: reduce)': {
        '&, &::before, & .icone, & .saiba-mais svg': { transition: 'none' },
        '&:hover, &:focus-visible': { transform: 'none', '& .icone': { transform: 'none' }, '& .saiba-mais svg': { transform: 'none' } },
    },
} as const;

const iconSx = {
    width: 88,
    height: 88,
    mb: 2.5,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    color: brand.red,
    bgcolor: 'rgba(224,20,59,.08)',
    transition: `background-color .35s ${ease}, color .35s ${ease}, transform .35s ${ease}`,
} as const;

// No fim do card (mt: auto), alinhado entre cards de textos com alturas diferentes
const moreSx = {
    mt: 'auto',
    display: 'inline-flex',
    alignItems: 'center',
    color: brand.red,
    fontWeight: 600,
    '& svg': { transition: `transform .35s ${ease}` },
} as const;

export default function Services() {
    const cards = useReveal({ stagger: true, delay: 80 });
    return (
        <Box component="section" id="servicos" sx={{ bgcolor: brand.section, py: { xs: 8, md: 12.5 } }}>
            <Container maxWidth="lg">
                <SectionTitle>Serviços</SectionTitle>
                <Grid container spacing={2} {...cards}>
                    {services.map((service) => (
                        <Grid key={service.title} size={{ xs: 12, sm: 6, lg: 4 }}>
                            <Box component="a" id={service.id} href="#contato" sx={cardSx}>
                                <Box className="icone" sx={iconSx}>
                                    <service.Icon aria-hidden="true" sx={{ fontSize: 48 }} />
                                </Box>
                                <Typography variant="h6" component="h3" sx={{ fontSize: 20, mb: 1.5 }}>
                                    {service.title}
                                </Typography>
                                <Typography sx={{ opacity: 0.6, mb: 3 }}>{service.text}</Typography>
                                <Box component="span" className="saiba-mais" sx={moreSx}>
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
