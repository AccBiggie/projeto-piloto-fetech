import { keyframes } from '@emotion/react';
import AlternateEmailOutlinedIcon from '@mui/icons-material/AlternateEmailOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import BrushOutlinedIcon from '@mui/icons-material/BrushOutlined';
import DashboardCustomizeOutlinedIcon from '@mui/icons-material/DashboardCustomizeOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LaptopMacOutlinedIcon from '@mui/icons-material/LaptopMacOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PhoneIphoneOutlinedIcon from '@mui/icons-material/PhoneIphoneOutlined';
import TabletMacOutlinedIcon from '@mui/icons-material/TabletMacOutlined';
import TravelExploreOutlinedIcon from '@mui/icons-material/TravelExploreOutlined';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router';

import { whatsappUrl } from '@/components/FloatingActions';
import SectionTitle from '@/components/SectionTitle';
import { useReveal } from '@/reveal/useReveal';
import { brand, monoFont } from '@/theme';

// Página do serviço de criação de sites: o que vem incluso, o site em cada tela, as etapas do
// projeto e as dúvidas mais comuns, sempre levando ao orçamento.

const ease = 'cubic-bezier(.22,.61,.36,1)';
const noMotion = { '@media (prefers-reduced-motion: reduce)': { animation: 'none' } };

const heroIn = keyframes`
    from { opacity: 0; transform: translate3d(0, 8px, 0); }
    to { opacity: 1; transform: none; }
`;
const entrance = (delay: number) => ({ animation: `${heroIn} .7s ${ease} ${delay}ms both`, ...noMotion });

const caret = keyframes`
    50% { opacity: 0; }
`;

// Os blocos do site em construção vão sendo "montados" no mockup do topo
const build = keyframes`
    0%, 8% { transform: scaleX(0); }
    30%, 100% { transform: scaleX(1); }
`;

const included = [
    {
        Icon: BrushOutlinedIcon,
        title: 'Design autoral',
        text: 'Nada de tema pronto: o layout nasce da sua marca, das suas cores e do jeito que o seu cliente procura por você.',
    },
    {
        Icon: PhoneIphoneOutlinedIcon,
        title: 'Pensado para o celular',
        text: 'Cada tela é desenhada primeiro para o celular e depois expandida para tablet e computador.',
    },
    {
        Icon: TravelExploreOutlinedIcon,
        title: 'Pronto para o Google',
        text: 'Estrutura semântica, páginas leves, títulos e descrições revisados para o seu site ser encontrado.',
    },
    {
        Icon: DashboardCustomizeOutlinedIcon,
        title: 'Painel para editar',
        text: 'Troque textos, fotos e novidades sozinho, sem depender de programador para cada ajuste.',
    },
    {
        Icon: LockOutlinedIcon,
        title: 'Hospedagem com HTTPS',
        text: 'Servidor configurado e monitorado pela Fetech, com certificado de segurança incluso.',
    },
    {
        Icon: AlternateEmailOutlinedIcon,
        title: 'E-mail com seu domínio',
        text: 'Endereços como contato@suaempresa.com.br para passar mais confiança em cada mensagem.',
    },
];

const devices = [
    { id: 'desktop', label: 'Computador', Icon: LaptopMacOutlinedIcon, width: 640, columns: 3 },
    { id: 'tablet', label: 'Tablet', Icon: TabletMacOutlinedIcon, width: 440, columns: 2 },
    { id: 'mobile', label: 'Celular', Icon: PhoneIphoneOutlinedIcon, width: 250, columns: 1 },
] as const;
type DeviceId = (typeof devices)[number]['id'];

const steps = [
    { title: 'Conversa', text: 'Entendemos o seu negócio, o público e o que o site precisa resolver.' },
    { title: 'Protótipo', text: 'Você vê as telas principais antes de qualquer linha de código e pede ajustes.' },
    { title: 'Desenvolvimento', text: 'Programamos o site, conectamos o painel e cuidamos da velocidade e do SEO.' },
    { title: 'No ar', text: 'Publicamos no seu domínio, configuramos os e-mails e seguimos dando suporte.' },
];

const faq = [
    {
        q: 'Quanto tempo leva para o site ficar pronto?',
        a: 'Um site institucional costuma levar de 2 a 4 semanas, contando a aprovação do protótipo. Projetos com mais páginas ou integrações têm o prazo definido no orçamento.',
    },
    {
        q: 'Preciso já ter domínio e hospedagem?',
        a: 'Não. Se você ainda não tem, registramos o domínio no seu nome e deixamos a hospedagem configurada. Se já tem, aproveitamos o que existe.',
    },
    {
        q: 'Consigo atualizar o site depois de pronto?',
        a: 'Sim. O site vem com um painel simples para editar textos, imagens e publicações. E, se preferir, a Fetech faz as alterações para você.',
    },
    {
        q: 'O site aparece no Google?',
        a: 'Entregamos o site com as boas práticas de SEO técnico e enviamos o endereço para indexação. A posição nas buscas depende também do conteúdo e da concorrência, e podemos orientar você nisso.',
    },
    {
        q: 'E se eu já tiver um site antigo?',
        a: 'Fazemos a migração do conteúdo e redirecionamos os endereços antigos para os novos, sem perder quem já chegava pelo Google.',
    },
];

// Mockup de navegador com os blocos do site se montando
function BrowserMock() {
    const block = (delay: number, sx: object) => (
        <Box
            sx={{
                borderRadius: 1,
                transformOrigin: 'left',
                animation: `${build} 6s ${ease} ${delay}s infinite alternate both`,
                ...noMotion,
                ...sx,
            }}
        />
    );
    return (
        <Box
            aria-hidden="true"
            sx={{
                width: '100%',
                maxWidth: 460,
                ml: 'auto',
                borderRadius: 2.5,
                overflow: 'hidden',
                bgcolor: '#fff',
                boxShadow: '0 2rem 4rem rgba(0,0,0,.45), 0 0 0 1px rgba(255,255,255,.08)',
                transform: { md: 'perspective(1200px) rotateY(-8deg) rotateX(3deg)' },
            }}
        >
            <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', px: 1.5, py: 1, bgcolor: brand.section }}>
                {['#ff5f57', '#febc2e', '#28c840'].map((color) => (
                    <Box key={color} sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: color }} />
                ))}
                <Box sx={{ flex: 1, ml: 1.5, px: 1.5, py: 0.25, borderRadius: 5, bgcolor: '#fff', fontFamily: monoFont, fontSize: 11, color: brand.ink }}>
                    <LockOutlinedIcon sx={{ fontSize: 11, verticalAlign: '-1px', mr: 0.5, color: brand.teal }} />
                    suaempresa.com.br
                </Box>
            </Stack>
            <Box sx={{ p: 2.5, display: 'grid', gap: 1.5 }}>
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    {block(0, { width: 70, height: 14, bgcolor: brand.red })}
                    <Stack direction="row" spacing={1}>
                        {[0, 1, 2].map((i) => (
                            <Box key={i}>{block(0.15 + i * 0.1, { width: 34, height: 8, bgcolor: brand.mist })}</Box>
                        ))}
                    </Stack>
                </Stack>
                {block(0.5, { height: 92, background: `linear-gradient(120deg, ${brand.graphiteLight}, ${brand.graphite})` })}
                {block(0.8, { width: '70%', height: 12, bgcolor: brand.dark })}
                {block(0.95, { width: '45%', height: 10, bgcolor: brand.mist })}
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.25 }}>
                    {[0, 1, 2].map((i) => (
                        <Box key={i}>{block(1.2 + i * 0.15, { height: 54, bgcolor: brand.sectionAlt, border: `1px solid ${brand.section}` })}</Box>
                    ))}
                </Box>
                {block(1.7, { width: 110, height: 26, bgcolor: brand.red, borderRadius: 0.5 })}
            </Box>
        </Box>
    );
}

function WebsiteHero() {
    return (
        <Box
            component="section"
            sx={{
                position: 'relative',
                overflow: 'hidden',
                color: '#fff',
                background: `radial-gradient(70% 70% at 100% 0%, rgba(224,20,59,.45), transparent 70%), linear-gradient(160deg, ${brand.graphiteLight}, ${brand.graphite} 60%)`,
                pt: { xs: 8, md: 12 },
                pb: { xs: 8, md: 12 },
            }}
        >
            <Container maxWidth="lg">
                <Grid container spacing={6} sx={{ alignItems: 'center' }}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Typography sx={{ fontFamily: monoFont, fontSize: { xs: 13, md: 15 }, color: 'rgba(255,255,255,.75)', mb: 2, ...entrance(0) }}>
                            <Box component="span" aria-hidden="true" sx={{ color: brand.red }}>
                                {'>'}
                            </Box>{' '}
                            servicos/criacao-de-sites
                            <Box
                                component="span"
                                aria-hidden="true"
                                sx={{ display: 'inline-block', width: '.6ch', height: '1.1em', ml: '.3ch', verticalAlign: 'text-bottom', bgcolor: brand.red, animation: `${caret} 1s step-end infinite`, ...noMotion }}
                            />
                        </Typography>
                        <Typography variant="h2" component="h1" sx={{ fontSize: { xs: 32, md: 50 }, lineHeight: 1.15, mb: 2.5, ...entrance(150) }}>
                            Um site com a cara da sua empresa, do rascunho ao <Box component="span" sx={{ color: brand.red }}>ar</Box>.
                        </Typography>
                        <Typography sx={{ fontSize: { xs: 16, md: 18 }, color: 'rgba(255,255,255,.75)', maxWidth: 520, mb: 4, ...entrance(250) }}>
                            Criamos sites institucionais e landing pages sob medida, rápidos em qualquer tela e preparados para
                            aparecer no Google. Você acompanha cada etapa e recebe tudo pronto para usar.
                        </Typography>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={entrance(350)}>
                            <Button variant="contained" size="large" component={RouterLink} to="/orcamento-site" endIcon={<ArrowForwardIcon />}>
                                Pedir orçamento
                            </Button>
                            <Button
                                variant="outlined"
                                color="inherit"
                                size="large"
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                startIcon={<WhatsAppIcon />}
                                sx={{ borderColor: 'rgba(255,255,255,.6)', '&:hover': { bgcolor: '#fff', color: brand.dark, borderColor: '#fff' } }}
                            >
                                Conversar no WhatsApp
                            </Button>
                        </Stack>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }} sx={{ display: { xs: 'none', sm: 'block' }, ...entrance(300) }}>
                        <BrowserMock />
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}

// Cards numerados em lista, com o ícone à esquerda: diferente dos cards centralizados da home
function Included() {
    const cards = useReveal({ stagger: true, delay: 80 });
    return (
        <Box component="section" sx={{ bgcolor: brand.section, py: { xs: 8, md: 12.5 } }}>
            <Container maxWidth="lg">
                <SectionTitle>O que vem no seu site</SectionTitle>
                <Grid container spacing={2} {...cards}>
                    {included.map((item, index) => (
                        <Grid key={item.title} size={{ xs: 12, sm: 6, lg: 4 }}>
                            <Box
                                sx={{
                                    position: 'relative',
                                    height: '100%',
                                    display: 'flex',
                                    gap: 2,
                                    p: 3,
                                    bgcolor: '#fff',
                                    borderRadius: 2.5,
                                    borderLeft: `4px solid ${brand.section}`,
                                    boxShadow: '0 .5rem 1rem rgba(0,0,0,.06)',
                                    transition: `border-color .35s ${ease}, box-shadow .35s ${ease}`,
                                    '&:hover': {
                                        borderLeftColor: brand.red,
                                        boxShadow: '0 1rem 2rem rgba(224,20,59,.14)',
                                        '& .icone': { bgcolor: brand.red, color: '#fff' },
                                    },
                                }}
                            >
                                <Box
                                    className="icone"
                                    sx={{
                                        flexShrink: 0,
                                        width: 52,
                                        height: 52,
                                        borderRadius: 2,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: brand.red,
                                        bgcolor: 'rgba(224,20,59,.08)',
                                        transition: `background-color .35s ${ease}, color .35s ${ease}`,
                                    }}
                                >
                                    <item.Icon aria-hidden="true" />
                                </Box>
                                <Box>
                                    <Typography variant="h6" component="h3" sx={{ fontSize: 18, mb: 0.75 }}>
                                        {item.title}
                                    </Typography>
                                    <Typography sx={{ color: brand.ink, fontSize: 15 }}>{item.text}</Typography>
                                </Box>
                                <Typography
                                    aria-hidden="true"
                                    sx={{ position: 'absolute', top: 12, right: 16, fontFamily: monoFont, fontSize: 12, color: brand.mist }}
                                >
                                    {String(index + 1).padStart(2, '0')}
                                </Typography>
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
}

// O mesmo site redimensionado para cada aparelho: a grade de cards muda de colunas como num site real
function Responsive() {
    const [device, setDevice] = useState<DeviceId>('desktop');
    const current = devices.find((d) => d.id === device) ?? devices[0];
    const text = useReveal({ preset: 'fade' });
    const preview = useReveal({ delay: 120 });

    return (
        <Box component="section" sx={{ bgcolor: '#fff', py: { xs: 8, md: 12.5 } }}>
            <Container maxWidth="lg">
                <Grid container spacing={{ xs: 5, md: 8 }} sx={{ alignItems: 'center' }}>
                    <Grid size={{ xs: 12, md: 5 }} {...text}>
                        <SectionTitle sx={{ mb: 3 }}>Em qualquer tela</SectionTitle>
                        <Typography sx={{ fontSize: 17, color: brand.ink, mb: 2 }}>
                            Mais da metade das visitas chega pelo celular. Por isso o layout se reorganiza sozinho em cada
                            aparelho: menus, imagens e textos mudam de lugar para continuar fáceis de ler e de tocar.
                        </Typography>
                        <Typography sx={{ fontSize: 17, color: brand.ink, mb: 4 }}>
                            Um site leve e bem estruturado também pesa a seu favor no Google, que prioriza páginas rápidas e
                            adaptadas ao celular nos resultados de busca.
                        </Typography>
                        <ToggleButtonGroup
                            exclusive
                            value={device}
                            onChange={(_, value: DeviceId | null) => value && setDevice(value)}
                            aria-label="Ver o site em"
                            sx={{
                                flexWrap: 'wrap',
                                '& .MuiToggleButton-root': { gap: 1, px: 2, textTransform: 'none' },
                                '& .Mui-selected, & .Mui-selected:hover': { bgcolor: `${brand.red} !important`, color: '#fff !important' },
                            }}
                        >
                            {devices.map((d) => (
                                <ToggleButton key={d.id} value={d.id}>
                                    <d.Icon fontSize="small" aria-hidden="true" /> {d.label}
                                </ToggleButton>
                            ))}
                        </ToggleButtonGroup>
                    </Grid>
                    <Grid size={{ xs: 12, md: 7 }} {...preview}>
                        <Box
                            sx={{
                                minHeight: { xs: 380, md: 460 },
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                p: { xs: 2, md: 4 },
                                borderRadius: 3,
                                background: `linear-gradient(160deg, ${brand.graphiteLight}, ${brand.graphite} 70%)`,
                            }}
                        >
                            <Box
                                role="img"
                                aria-label={`Prévia do site na tela de ${current.label.toLowerCase()}`}
                                sx={{
                                    width: '100%',
                                    maxWidth: current.width,
                                    p: device === 'desktop' ? 1 : 1.25,
                                    pb: device === 'desktop' ? 1 : 2.5,
                                    borderRadius: device === 'mobile' ? 5 : device === 'tablet' ? 3.5 : 2,
                                    bgcolor: '#0e0e10',
                                    boxShadow: '0 1.5rem 3rem rgba(0,0,0,.5)',
                                    transition: `max-width .5s ${ease}, border-radius .5s ${ease}`,
                                    '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
                                }}
                            >
                                <Box sx={{ borderRadius: device === 'mobile' ? 3.5 : 1.5, overflow: 'hidden', bgcolor: '#fff' }}>
                                    <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', px: 1.5, py: 1, bgcolor: brand.red }}>
                                        <Box sx={{ width: 54, height: 10, borderRadius: 1, bgcolor: '#fff' }} />
                                        {device === 'mobile' ? (
                                            <Stack spacing={0.4}>
                                                {[0, 1, 2].map((i) => (
                                                    <Box key={i} sx={{ width: 16, height: 2, bgcolor: '#fff' }} />
                                                ))}
                                            </Stack>
                                        ) : (
                                            <Stack direction="row" spacing={1}>
                                                {[0, 1, 2, 3].map((i) => (
                                                    <Box key={i} sx={{ width: 28, height: 6, borderRadius: 1, bgcolor: 'rgba(255,255,255,.7)' }} />
                                                ))}
                                            </Stack>
                                        )}
                                    </Stack>
                                    <Box sx={{ p: 1.5, display: 'grid', gap: 1.25 }}>
                                        <Box sx={{ height: device === 'mobile' ? 110 : 90, borderRadius: 1, background: `linear-gradient(120deg, ${brand.graphiteLight}, ${brand.graphite})` }} />
                                        <Box sx={{ width: '60%', height: 9, borderRadius: 1, bgcolor: brand.dark }} />
                                        <Box sx={{ width: '85%', height: 7, borderRadius: 1, bgcolor: brand.mist }} />
                                        <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${current.columns}, 1fr)`, gap: 1 }}>
                                            {[0, 1, 2].map((i) => (
                                                <Box key={i} sx={{ height: 52, borderRadius: 1, bgcolor: brand.sectionAlt, border: `1px solid ${brand.section}` }} />
                                            ))}
                                        </Box>
                                        <Box sx={{ width: device === 'mobile' ? '100%' : 96, height: 22, borderRadius: 0.5, bgcolor: brand.red }} />
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}

// Linha do tempo das etapas, numerada em fonte mono como um terminal
function Process() {
    const list = useReveal({ stagger: true, delay: 100 });
    return (
        <Box component="section" sx={{ bgcolor: brand.sectionAlt, py: { xs: 8, md: 12.5 } }}>
            <Container maxWidth="lg">
                <SectionTitle>Como trabalhamos</SectionTitle>
                <Grid component="ol" container spacing={{ xs: 3, md: 2 }} {...list} sx={{ listStyle: 'none', p: 0, m: 0 }}>
                    {steps.map((step, index) => (
                        <Grid component="li" key={step.title} size={{ xs: 12, sm: 6, md: 3 }} sx={{ position: 'relative' }}>
                            <Stack direction="row" sx={{ alignItems: 'center', mb: 2 }}>
                                <Box
                                    sx={{
                                        flexShrink: 0,
                                        width: 48,
                                        height: 48,
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontFamily: monoFont,
                                        fontWeight: 600,
                                        color: '#fff',
                                        bgcolor: index === steps.length - 1 ? brand.red : brand.dark,
                                    }}
                                >
                                    {String(index + 1).padStart(2, '0')}
                                </Box>
                                {/* Trilha até a próxima etapa, só com as etapas lado a lado */}
                                {index < steps.length - 1 && (
                                    <Box aria-hidden="true" sx={{ display: { xs: 'none', md: 'block' }, flex: 1, height: 2, mx: 1.5, background: `repeating-linear-gradient(90deg, ${brand.mist} 0 8px, transparent 8px 14px)` }} />
                                )}
                            </Stack>
                            <Typography variant="h6" component="h3" sx={{ fontSize: 19, mb: 1 }}>
                                {step.title}
                            </Typography>
                            <Typography sx={{ color: brand.ink, pr: { md: 2 } }}>{step.text}</Typography>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
}

function Faq() {
    const items = useReveal({ stagger: true, preset: 'fade', delay: 60 });
    const [open, setOpen] = useState<number | false>(0);
    return (
        <Box component="section" sx={{ bgcolor: brand.section, py: { xs: 8, md: 12.5 } }}>
            <Container maxWidth="md">
                <SectionTitle>Dúvidas frequentes</SectionTitle>
                <Box {...items}>
                    {faq.map((item, index) => (
                        <Accordion
                            key={item.q}
                            disableGutters
                            elevation={0}
                            expanded={open === index}
                            onChange={(_, expanded) => setOpen(expanded ? index : false)}
                            sx={{
                                mb: 1.5,
                                borderRadius: '10px !important',
                                border: `1px solid ${open === index ? brand.red : 'transparent'}`,
                                transition: `border-color .3s ${ease}`,
                                '&::before': { display: 'none' },
                            }}
                        >
                            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: brand.red }} />} sx={{ px: 3, py: 0.5 }}>
                                <Typography component="h3" sx={{ fontWeight: 600, fontSize: 17 }}>
                                    {item.q}
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails sx={{ px: 3, pb: 3, pt: 0 }}>
                                <Typography sx={{ color: brand.ink }}>{item.a}</Typography>
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </Box>
            </Container>
        </Box>
    );
}

function FinalCta() {
    const content = useReveal({ stagger: true, preset: 'fade', delay: 80 });
    return (
        <Box component="section" sx={{ bgcolor: brand.red, color: '#fff', py: { xs: 8, md: 10 } }}>
            <Container maxWidth="md">
                <Box {...content} sx={{ textAlign: 'center' }}>
                    <Typography sx={{ fontFamily: monoFont, opacity: 0.8, mb: 1.5 }}>{'> pronto para começar?'}</Typography>
                    <Typography variant="h4" component="h2" sx={{ fontSize: { xs: 26, md: 36 }, mb: 2 }}>
                        Responda algumas perguntas e receba um orçamento sob medida.
                    </Typography>
                    <Typography sx={{ fontSize: 18, opacity: 0.85, mb: 4 }}>Leva menos de 3 minutos e não tem compromisso.</Typography>
                    <Button
                        variant="outlined"
                        color="inherit"
                        size="large"
                        component={RouterLink}
                        to="/orcamento-site"
                        endIcon={<ArrowForwardIcon />}
                        sx={{ borderColor: '#fff', '&:hover': { bgcolor: '#fff', color: brand.red } }}
                    >
                        Quero meu orçamento
                    </Button>
                </Box>
            </Container>
        </Box>
    );
}

export default function WebsitePage() {
    useEffect(() => {
        const previous = document.title;
        document.title = 'Criação de Sites – Fetech';
        return () => {
            document.title = previous;
        };
    }, []);

    return (
        <>
            <WebsiteHero />
            <Included />
            <Responsive />
            <Process />
            <Faq />
            <FinalCta />
        </>
    );
}
