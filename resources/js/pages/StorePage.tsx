import { keyframes } from '@emotion/react';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import CheckIcon from '@mui/icons-material/Check';
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined';
import MonitorHeartOutlinedIcon from '@mui/icons-material/MonitorHeartOutlined';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import TravelExploreOutlinedIcon from '@mui/icons-material/TravelExploreOutlined';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router';

import { whatsappUrl } from '@/components/FloatingActions';
import SectionTitle from '@/components/SectionTitle';
import { ease, entrance, type FaqItem, graphiteGlow, ServiceCta, ServiceFaq, ServicePrompt, usePageTitle } from '@/components/ServiceSections';
import { prefersReducedMotion } from '@/reveal/revealObserver';
import { useReveal } from '@/reveal/useReveal';
import { brand, monoFont } from '@/theme';

// Página do serviço de loja virtual: planos pelo tamanho do catálogo, recursos agrupados, o
// caminho de um pedido dentro da loja e as dúvidas mais comuns.

// Os avisos de pedido entram por cima do mockup da loja, um de cada vez
const toastIn = keyframes`
    0%, 4% { opacity: 0; transform: translate3d(0, 12px, 0) scale(.96); }
    10%, 30% { opacity: 1; transform: none; }
    36%, 100% { opacity: 0; transform: translate3d(0, -8px, 0); }
`;

const orders = [
    { id: 1042, total: 'R$ 189,90', method: 'Pix' },
    { id: 1043, total: 'R$ 74,50', method: 'cartão' },
    { id: 1044, total: 'R$ 312,00', method: 'boleto' },
];

const brl = (value: number) => value.toLocaleString('pt-BR');

// Planos pelo tamanho do catálogo. O que muda entre eles é o limite de produtos e o quanto da
// operação a loja integra; preço sai no orçamento.
const plans = [
    {
        id: 'vitrine',
        name: 'Vitrine',
        limit: 200,
        description: 'Para quem está começando a vender online com um catálogo enxuto.',
        items: ['Até 200 produtos', 'Visitas ilimitadas', '1 meio de pagamento', '1 forma de envio'],
    },
    {
        id: 'expansao',
        name: 'Expansão',
        limit: 1000,
        description: 'Para lojas que já vendem e querem mais formas de pagar e de entregar.',
        items: ['Até 1.000 produtos', 'Visitas ilimitadas', '2 meios de pagamento', '2 formas de envio', 'Cupons e promoções'],
    },
    {
        id: 'catalogo-completo',
        name: 'Catálogo completo',
        limit: Infinity,
        description: 'Para catálogos grandes, com variações e integrações sob medida.',
        items: ['Produtos sem limite', 'Visitas ilimitadas', 'Pagamentos e envios combinados no projeto', 'Cupons e promoções', 'Integrações com ERP ou marketplace'],
    },
];

// Paradas do controle de tamanho do catálogo
const catalogStops = [50, 100, 200, 500, 1000, 2000, 5000];

const planWhatsapp = (name: string) => `${whatsappUrl}?text=${encodeURIComponent(`Olá! Tenho interesse no plano ${name} da loja virtual da Fetech.`)}`;

const featureGroups = [
    {
        title: 'Para vender',
        items: [
            { Icon: CreditCardOutlinedIcon, label: 'Pix, cartão e boleto' },
            { Icon: LocalShippingOutlinedIcon, label: 'Frete calculado no carrinho' },
            { Icon: LocalOfferOutlinedIcon, label: 'Cupons de desconto', help: 'Crie códigos com valor ou porcentagem, validade e limite de uso.' },
            { Icon: CampaignOutlinedIcon, label: 'Promoções programadas', help: 'Defina o preço promocional e as datas de início e fim; a loja troca sozinha.' },
            { Icon: ShareOutlinedIcon, label: 'Produtos prontos para compartilhar', help: 'Cada produto aparece com foto, nome e preço quando o link é enviado no WhatsApp ou nas redes.' },
        ],
    },
    {
        title: 'Para gerenciar',
        items: [
            { Icon: DashboardOutlinedIcon, label: 'Painel de pedidos e estoque' },
            { Icon: MarkEmailReadOutlinedIcon, label: 'Aviso de pedido por e-mail' },
            { Icon: Inventory2OutlinedIcon, label: 'Cadastro de produtos com variações' },
            { Icon: TravelExploreOutlinedIcon, label: 'SEO para cada produto', help: 'Endereço, título e descrição próprios em cada página de produto, para aparecer nas buscas.' },
        ],
    },
    {
        title: 'Para ficar no ar',
        items: [
            { Icon: LockOutlinedIcon, label: 'Certificado SSL', help: 'O cadeado no navegador: os dados do cliente trafegam criptografados.' },
            { Icon: HomeOutlinedIcon, label: 'Hospedagem inclusa' },
            { Icon: MonitorHeartOutlinedIcon, label: 'Monitoramento 24 horas' },
        ],
    },
];

const journey = [
    { Icon: StorefrontOutlinedIcon, title: 'O cliente encontra', text: 'Chega pelo Google ou por um link compartilhado e navega pelo catálogo.' },
    { Icon: AddShoppingCartIcon, title: 'Coloca no carrinho', text: 'Escolhe tamanho ou cor, vê o frete pelo CEP e aplica o cupom.' },
    { Icon: PaymentsOutlinedIcon, title: 'Paga', text: 'Finaliza com Pix, cartão ou boleto, em ambiente seguro.' },
    { Icon: NotificationsActiveOutlinedIcon, title: 'Você é avisado', text: 'O pedido chega por e-mail e no painel, com o estoque já atualizado.' },
    { Icon: LocalShippingOutlinedIcon, title: 'Pedido enviado', text: 'Você informa o rastreio e o cliente acompanha a entrega.' },
];

const faq: FaqItem[] = [
    {
        q: 'Em quanto tempo a loja fica pronta?',
        a: 'O prazo depende do tamanho do catálogo e das integrações, e é definido no orçamento. A contagem começa quando recebemos a lista de produtos com fotos e preços.',
    },
    {
        q: 'Eu mesmo cadastro os produtos?',
        a: 'Pode cadastrar pelo painel quando quiser. Na entrega, a Fetech já sobe o catálogo inicial a partir da planilha que você enviar.',
    },
    {
        q: 'Quais meios de pagamento e envio posso usar?',
        a: 'Trabalhamos com os principais intermediadores de pagamento (Pix, cartão e boleto) e com Correios e transportadoras. A quantidade incluída varia conforme o plano.',
    },
    {
        q: 'Posso trocar de plano depois?',
        a: 'Sim. Quando o catálogo crescer, a loja passa para o plano seguinte sem precisar ser refeita.',
    },
    {
        q: 'A loja tem a cara da minha marca?',
        a: 'Tem. Cores, logo, fontes e a vitrine da página inicial são ajustadas à sua identidade. Layouts totalmente personalizados entram como customização no orçamento.',
    },
];

// Mockup da loja com um produto em destaque e avisos de novos pedidos chegando
function StoreMock() {
    return (
        <Box aria-hidden="true" sx={{ position: 'relative', width: '100%', maxWidth: 440, ml: 'auto', pb: 4 }}>
            <Box sx={{ borderRadius: 2.5, overflow: 'hidden', bgcolor: '#fff', color: brand.dark, boxShadow: '0 2rem 4rem rgba(0,0,0,.45)' }}>
                <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.25, borderBottom: `1px solid ${brand.section}` }}>
                    <Box sx={{ width: 64, height: 12, borderRadius: 1, bgcolor: brand.red }} />
                    <Box sx={{ position: 'relative', display: 'flex' }}>
                        <AddShoppingCartIcon sx={{ fontSize: 20, color: brand.ink }} />
                        <Box sx={{ position: 'absolute', top: -6, right: -8, minWidth: 16, height: 16, borderRadius: 8, bgcolor: brand.red, color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            3
                        </Box>
                    </Box>
                </Stack>
                <Grid container spacing={2} sx={{ p: 2 }}>
                    <Grid size={6}>
                        <Box sx={{ aspectRatio: '1', borderRadius: 2, background: `linear-gradient(150deg, ${brand.mist}, ${brand.teal})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Inventory2OutlinedIcon sx={{ fontSize: 56, color: 'rgba(255,255,255,.85)' }} />
                        </Box>
                    </Grid>
                    <Grid size={6} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box sx={{ width: '90%', height: 10, borderRadius: 1, bgcolor: brand.dark }} />
                        <Box sx={{ width: '60%', height: 8, borderRadius: 1, bgcolor: brand.mist }} />
                        <Typography sx={{ fontWeight: 700, fontSize: 18, color: brand.red, mt: 0.5 }}>R$ 149,90</Typography>
                        <Typography sx={{ fontSize: 11, color: brand.ink }}>ou 3x sem juros</Typography>
                        <Stack direction="row" spacing={0.75}>
                            {[brand.dark, brand.teal, brand.red].map((color) => (
                                <Box key={color} sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: color, border: '2px solid #fff', outline: `1px solid ${brand.section}` }} />
                            ))}
                        </Stack>
                        <Box sx={{ mt: 'auto', py: 0.75, borderRadius: 0.5, bgcolor: brand.red, color: '#fff', fontSize: 12, fontWeight: 600, textAlign: 'center' }}>Comprar</Box>
                    </Grid>
                </Grid>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, px: 2, pb: 2 }}>
                    {[0, 1, 2, 3].map((i) => (
                        <Box key={i} sx={{ aspectRatio: '1', borderRadius: 1.5, bgcolor: brand.sectionAlt, border: `1px solid ${brand.section}` }} />
                    ))}
                </Box>
            </Box>

            {/* Um aviso a cada 3 s, em ciclo de 9 s */}
            {orders.map((order, index) => (
                <Box
                    key={order.id}
                    sx={{
                        position: 'absolute',
                        left: { xs: 12, md: -36 },
                        bottom: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        px: 2,
                        py: 1.25,
                        borderRadius: 2,
                        bgcolor: brand.graphite,
                        color: '#fff',
                        border: '1px solid rgba(255,255,255,.12)',
                        boxShadow: '0 1rem 2rem rgba(0,0,0,.4)',
                        opacity: 0,
                        animation: `${toastIn} 9s ${ease} ${index * 3}s infinite`,
                        '@media (prefers-reduced-motion: reduce)': { animation: 'none', opacity: index === 0 ? 1 : 0 },
                    }}
                >
                    <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: brand.red, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CheckIcon sx={{ fontSize: 18 }} />
                    </Box>
                    <Box>
                        <Typography sx={{ fontFamily: monoFont, fontSize: 12, opacity: 0.7 }}>pedido #{order.id}</Typography>
                        <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                            {order.total} no {order.method}
                        </Typography>
                    </Box>
                </Box>
            ))}
        </Box>
    );
}

function StoreHero() {
    return (
        <Box component="section" sx={{ position: 'relative', overflow: 'hidden', color: '#fff', background: graphiteGlow('0% 100%'), pt: { xs: 8, md: 12 }, pb: { xs: 8, md: 12 } }}>
            <Container maxWidth="lg">
                <Grid container spacing={6} sx={{ alignItems: 'center' }}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <ServicePrompt path="servicos/loja-virtual" />
                        <Typography variant="h2" component="h1" sx={{ fontSize: { xs: 32, md: 50 }, lineHeight: 1.15, mb: 2.5, ...entrance(150) }}>
                            Sua loja aberta <Box component="span" sx={{ color: brand.red }}>24 horas</Box>, vendendo até quando você está fora.
                        </Typography>
                        <Typography sx={{ fontSize: { xs: 16, md: 18 }, color: 'rgba(255,255,255,.75)', maxWidth: 520, mb: 4, ...entrance(250) }}>
                            Montamos a loja virtual completa para pequenos e médios negócios: catálogo, carrinho, pagamento,
                            frete e um painel simples para acompanhar cada pedido.
                        </Typography>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={entrance(350)}>
                            <Button variant="contained" size="large" href="#planos" endIcon={<ArrowForwardIcon />}>
                                Ver planos
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
                        <StoreMock />
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}

// O visitante informa o tamanho do catálogo e o plano indicado fica em destaque
function Plans() {
    const [stop, setStop] = useState(2);
    const products = catalogStops[stop];
    const recommended = plans.find((plan) => products <= plan.limit) ?? plans[plans.length - 1];
    const cards = useReveal({ stagger: true, delay: 80 });

    return (
        <Box component="section" id="planos" sx={{ bgcolor: brand.section, py: { xs: 8, md: 12.5 } }}>
            <Container maxWidth="lg">
                <SectionTitle>Planos</SectionTitle>
                <Box sx={{ maxWidth: 640, mb: { xs: 4, md: 6 } }}>
                    <Typography id="catalogo-label" sx={{ fontSize: 17, color: brand.ink, mb: 1 }}>
                        Quantos produtos você pretende vender?{' '}
                        <Box component="strong" sx={{ fontFamily: monoFont, color: brand.red }}>
                            {stop === catalogStops.length - 1 ? `${brl(products)}+` : brl(products)}
                        </Box>
                    </Typography>
                    <Slider
                        value={stop}
                        min={0}
                        max={catalogStops.length - 1}
                        step={1}
                        marks
                        onChange={(_, value) => setStop(value as number)}
                        aria-labelledby="catalogo-label"
                        getAriaValueText={(value) => `${brl(catalogStops[value])} produtos`}
                        valueLabelDisplay="off"
                    />
                </Box>
                <Grid container spacing={2} {...cards} sx={{ alignItems: 'stretch' }}>
                    {plans.map((plan) => {
                        const active = plan.id === recommended.id;
                        return (
                            <Grid key={plan.id} size={{ xs: 12, md: 4 }}>
                                <Box
                                    sx={{
                                        position: 'relative',
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        p: { xs: 3, md: 4 },
                                        borderRadius: 2.5,
                                        bgcolor: active ? brand.graphite : '#fff',
                                        color: active ? '#fff' : brand.dark,
                                        border: `2px solid ${active ? brand.red : 'transparent'}`,
                                        boxShadow: active ? '0 1.5rem 3rem rgba(224,20,59,.22)' : '0 .5rem 1rem rgba(0,0,0,.06)',
                                        transform: { md: active ? 'translateY(-8px)' : 'none' },
                                        transition: `background-color .4s ${ease}, color .4s ${ease}, border-color .4s ${ease}, box-shadow .4s ${ease}, transform .4s ${ease}`,
                                        '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
                                    }}
                                >
                                    {active && (
                                        <Box sx={{ position: 'absolute', top: -13, left: 24, px: 1.5, py: 0.25, borderRadius: 1, bgcolor: brand.red, color: '#fff', fontFamily: monoFont, fontSize: 12 }}>
                                            indicado para você
                                        </Box>
                                    )}
                                    <Typography variant="h5" component="h3" sx={{ fontSize: 24, mb: 1 }}>
                                        {plan.name}
                                    </Typography>
                                    <Typography sx={{ opacity: 0.7, mb: 3 }}>{plan.description}</Typography>
                                    <Stack component="ul" spacing={1.25} sx={{ listStyle: 'none', p: 0, m: 0, mb: 4 }}>
                                        {plan.items.map((item) => (
                                            <Box component="li" key={item} sx={{ display: 'flex', gap: 1.25, alignItems: 'flex-start' }}>
                                                <CheckIcon sx={{ fontSize: 20, color: brand.red, mt: '2px' }} aria-hidden="true" />
                                                {item}
                                            </Box>
                                        ))}
                                    </Stack>
                                    <Button
                                        variant={active ? 'contained' : 'outlined'}
                                        size="large"
                                        href={planWhatsapp(plan.name)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        startIcon={<WhatsAppIcon />}
                                        sx={{ mt: 'auto' }}
                                    >
                                        Quero esse plano
                                    </Button>
                                </Box>
                            </Grid>
                        );
                    })}
                </Grid>
                <Typography sx={{ mt: 4, color: brand.ink, fontSize: 15 }}>
                    Precisa de algo diferente?{' '}
                    <Box component={RouterLink} to="/orcamento-site" sx={{ color: brand.red, fontWeight: 600 }}>
                        Monte seu orçamento
                    </Box>{' '}
                    e combinamos a loja sob medida.
                </Typography>
            </Container>
        </Box>
    );
}

// Recursos agrupados por para que servem; os que pedem explicação têm um "i" com tooltip
function Features() {
    const groups = useReveal({ stagger: true, delay: 100 });
    return (
        <Box component="section" sx={{ bgcolor: '#fff', py: { xs: 8, md: 12.5 } }}>
            <Container maxWidth="lg">
                <SectionTitle>Tudo incluso</SectionTitle>
                <Grid container spacing={{ xs: 4, md: 3 }} {...groups}>
                    {featureGroups.map((group) => (
                        <Grid key={group.title} size={{ xs: 12, md: 4 }}>
                            <Typography sx={{ fontFamily: monoFont, fontSize: 14, color: brand.red, mb: 2 }}>{`// ${group.title.toLowerCase()}`}</Typography>
                            <Stack component="ul" spacing={1} sx={{ listStyle: 'none', p: 0, m: 0 }}>
                                {group.items.map((item) => (
                                    <Box
                                        component="li"
                                        key={item.label}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1.5,
                                            px: 2,
                                            py: 1.5,
                                            borderRadius: 2,
                                            bgcolor: brand.sectionAlt,
                                            transition: `background-color .3s ${ease}`,
                                            '&:hover': { bgcolor: 'rgba(224,20,59,.07)' },
                                        }}
                                    >
                                        <item.Icon sx={{ color: brand.red }} aria-hidden="true" />
                                        <Typography sx={{ flex: 1, fontWeight: 500 }}>{item.label}</Typography>
                                        {item.help && (
                                            <Tooltip title={item.help} arrow enterTouchDelay={0}>
                                                <Box component="button" type="button" aria-label={`Sobre ${item.label}: ${item.help}`} sx={{ display: 'flex', p: 0, border: 0, bgcolor: 'transparent', color: brand.ink, cursor: 'help' }}>
                                                    <InfoOutlinedIcon fontSize="small" />
                                                </Box>
                                            </Tooltip>
                                        )}
                                    </Box>
                                ))}
                            </Stack>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
}

// O caminho de um pedido dentro da loja. Avança sozinho até o visitante escolher uma etapa.
function Journey() {
    const [active, setActive] = useState(0);
    const [auto, setAuto] = useState(true);
    const text = useReveal({ preset: 'fade' });

    useEffect(() => {
        if (!auto || prefersReducedMotion()) return;
        const timer = window.setInterval(() => setActive((value) => (value + 1) % journey.length), 3200);
        return () => window.clearInterval(timer);
    }, [auto]);

    const choose = (index: number) => {
        setAuto(false);
        setActive(index);
    };
    const step = journey[active];

    return (
        <Box component="section" sx={{ color: '#fff', background: graphiteGlow('100% 100%'), py: { xs: 8, md: 12.5 } }}>
            <Container maxWidth="lg">
                <SectionTitle>Do clique à entrega</SectionTitle>
                <Box {...text}>
                    <Box component="ol" sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(5, 1fr)' }, gap: { xs: 1, md: 2 }, listStyle: 'none', p: 0, m: 0, mb: 4 }}>
                        {journey.map((item, index) => {
                            const reached = index <= active;
                            return (
                                <Box component="li" key={item.title}>
                                    <Box
                                        component="button"
                                        type="button"
                                        onClick={() => choose(index)}
                                        aria-current={index === active ? 'step' : undefined}
                                        aria-label={item.title}
                                        sx={{
                                            width: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: 1,
                                            p: 0,
                                            border: 0,
                                            bgcolor: 'transparent',
                                            color: 'inherit',
                                            cursor: 'pointer',
                                            font: 'inherit',
                                            '&:focus-visible': { outline: `2px solid ${brand.red}`, outlineOffset: 4, borderRadius: 1 },
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: { xs: 44, md: 60 },
                                                height: { xs: 44, md: 60 },
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                bgcolor: reached ? brand.red : 'rgba(255,255,255,.08)',
                                                border: `1px solid ${reached ? brand.red : 'rgba(255,255,255,.2)'}`,
                                                transform: index === active ? 'scale(1.1)' : 'none',
                                                transition: `background-color .4s ${ease}, border-color .4s ${ease}, transform .4s ${ease}`,
                                            }}
                                        >
                                            <item.Icon sx={{ fontSize: { xs: 22, md: 28 } }} aria-hidden="true" />
                                        </Box>
                                        <Typography sx={{ display: { xs: 'none', md: 'block' }, fontSize: 14, fontWeight: index === active ? 700 : 400, opacity: reached ? 1 : 0.6 }}>{item.title}</Typography>
                                    </Box>
                                </Box>
                            );
                        })}
                    </Box>
                    {/* Barra de progresso entre as etapas */}
                    <Box aria-hidden="true" sx={{ height: 3, borderRadius: 2, bgcolor: 'rgba(255,255,255,.12)', mb: 4, overflow: 'hidden' }}>
                        <Box sx={{ height: '100%', width: `${((active + 1) / journey.length) * 100}%`, bgcolor: brand.red, transition: `width .5s ${ease}` }} />
                    </Box>
                    <Box aria-live="polite" sx={{ maxWidth: 640, mx: 'auto', textAlign: 'center', minHeight: 96 }}>
                        <Typography sx={{ fontFamily: monoFont, fontSize: 13, opacity: 0.6, mb: 1 }}>
                            etapa {active + 1}/{journey.length}
                        </Typography>
                        <Typography variant="h5" component="h3" sx={{ fontSize: { xs: 22, md: 26 }, mb: 1 }}>
                            {step.title}
                        </Typography>
                        <Typography sx={{ fontSize: 17, opacity: 0.8 }}>{step.text}</Typography>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
}

export default function StorePage() {
    usePageTitle('Loja Virtual – Fetech');

    return (
        <>
            <StoreHero />
            <Plans />
            <Features />
            <Journey />
            <ServiceFaq items={faq} />
            <ServiceCta
                prompt="vamos abrir sua loja?"
                title="Conte o que você vende e montamos a proposta da sua loja."
                text="Sem compromisso: você recebe o orçamento e decide com calma."
                button="Quero minha loja"
            />
        </>
    );
}
