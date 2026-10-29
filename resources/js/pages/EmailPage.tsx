import { keyframes } from '@emotion/react';
import AlternateEmailOutlinedIcon from '@mui/icons-material/AlternateEmailOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import CloudSyncOutlinedIcon from '@mui/icons-material/CloudSyncOutlined';
import ContactsOutlinedIcon from '@mui/icons-material/ContactsOutlined';
import DnsOutlinedIcon from '@mui/icons-material/DnsOutlined';
import GppGoodOutlinedIcon from '@mui/icons-material/GppGoodOutlined';
import HeadsetMicOutlinedIcon from '@mui/icons-material/HeadsetMicOutlined';
import HttpsOutlinedIcon from '@mui/icons-material/HttpsOutlined';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';
import LaptopMacOutlinedIcon from '@mui/icons-material/LaptopMacOutlined';
import MoveToInboxOutlinedIcon from '@mui/icons-material/MoveToInboxOutlined';
import PhoneIphoneOutlinedIcon from '@mui/icons-material/PhoneIphoneOutlined';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router';

import { whatsappUrl } from '@/components/FloatingActions';
import SectionTitle from '@/components/SectionTitle';
import { ease, entrance, type FaqItem, graphiteGlow, ServiceCta, ServiceFaq, ServicePrompt, usePageTitle } from '@/components/ServiceSections';
import { useReveal } from '@/reveal/useReveal';
import { brand, monoFont } from '@/theme';

// Página do serviço de e-mail profissional: o endereço montado com o nome da empresa, a proteção
// da caixa de entrada, onde a conta funciona e como fazemos a troca do e-mail atual.

// Na caixa de entrada do topo, a mensagem suspeita é barrada e sai da lista; as outras continuam
const blocked = keyframes`
    0%, 35% { opacity: 1; transform: none; max-height: 64px; }
    45% { opacity: 1; transform: translateX(0); }
    60% { opacity: 0; transform: translateX(40px); max-height: 64px; }
    70%, 92% { opacity: 0; max-height: 0; }
    100% { opacity: 1; transform: none; max-height: 64px; }
`;

const stamp = keyframes`
    0%, 30% { opacity: 0; transform: scale(1.4) rotate(-8deg); }
    38%, 55% { opacity: 1; transform: scale(1) rotate(-8deg); }
    62%, 100% { opacity: 0; transform: scale(1) rotate(-8deg); }
`;

const inbox = [
    { from: 'Financeiro', subject: 'Nota fiscal do pedido 3381', time: '09:12' },
    { from: 'Prêmio urgente!!!', subject: 'Clique aqui para resgatar R$ 5.000', time: '09:08', spam: true },
    { from: 'Cliente: Marina', subject: 'Re: Proposta aprovada 🎉', time: '08:47' },
];

const protection = [
    { Icon: BlockOutlinedIcon, title: 'Filtro anti-spam', text: 'Propagandas em massa e golpes ficam fora da caixa de entrada antes de chegar até você.' },
    { Icon: GppGoodOutlinedIcon, title: 'Antivírus nos anexos', text: 'Arquivos recebidos passam por verificação para barrar vírus e programas maliciosos.' },
    { Icon: HttpsOutlinedIcon, title: 'Conexão criptografada', text: 'Mensagens trafegam protegidas entre o servidor, o celular e o computador.' },
    { Icon: VerifiedOutlinedIcon, title: 'Domínio autenticado', text: 'SPF, DKIM e DMARC configurados para seus e-mails não caírem no spam de quem recebe.' },
    { Icon: InboxOutlinedIcon, title: 'Sem anúncios', text: 'Caixa de entrada limpa, sem propaganda de terceiros no meio das suas mensagens.' },
    { Icon: HeadsetMicOutlinedIcon, title: 'Suporte de verdade', text: 'Esqueceu a senha ou precisa de uma conta nova? Fala com a Fetech e resolvemos.' },
];

const anywhere = [
    { Icon: LanguageOutlinedIcon, title: 'Webmail', text: 'Acesse pelo navegador de qualquer lugar.' },
    { Icon: PhoneIphoneOutlinedIcon, title: 'Celular', text: 'Android e iPhone, no app de e-mail que você já usa.' },
    { Icon: LaptopMacOutlinedIcon, title: 'Computador', text: 'Outlook, Apple Mail, Thunderbird e outros.' },
    { Icon: CalendarMonthOutlinedIcon, title: 'Agenda', text: 'Compromissos compartilhados com a equipe.' },
    { Icon: ContactsOutlinedIcon, title: 'Contatos', text: 'A mesma lista em todos os aparelhos.' },
    { Icon: CloudSyncOutlinedIcon, title: 'Sincronizado', text: 'Leu no celular, aparece lido no computador.' },
];

const migration = [
    { Icon: DnsOutlinedIcon, title: 'Domínio', text: 'Usamos o domínio que você já tem ou registramos um novo no nome da empresa.' },
    { Icon: AlternateEmailOutlinedIcon, title: 'Contas', text: 'Criamos os endereços da equipe e os apelidos como contato@ e financeiro@.' },
    { Icon: MoveToInboxOutlinedIcon, title: 'Mudança', text: 'Trazemos as mensagens antigas e configuramos o e-mail em cada aparelho.' },
];

const faq: FaqItem[] = [
    {
        q: 'O que muda em relação a um e-mail gratuito?',
        a: 'O endereço leva o nome da sua empresa, a caixa de entrada não tem anúncios e você controla as contas da equipe: cria, desativa e troca senhas quando alguém entra ou sai.',
    },
    {
        q: 'Preciso ter um site para ter e-mail profissional?',
        a: 'Não. Basta um domínio registrado. Se ainda não tiver, registramos para você e o mesmo domínio pode receber o site no futuro.',
    },
    {
        q: 'Vou perder os e-mails que já tenho?',
        a: 'Não. Na mudança importamos as mensagens da conta antiga e, se quiser, deixamos um redirecionamento para nada se perder no caminho.',
    },
    {
        q: 'Quantas contas posso ter?',
        a: 'Quantas a equipe precisar. O orçamento é montado pelo número de contas e pelo espaço de armazenamento de cada uma.',
    },
    {
        q: 'Meus e-mails vão cair no spam de quem recebe?',
        a: 'Configuramos a autenticação do domínio (SPF, DKIM e DMARC), que é o que os provedores verificam para confiar nas suas mensagens.',
    },
];

// "Ana Lúcia" -> "ana"; "Padaria São João" -> "padariasaojoao"
const slug = (value: string) =>
    value
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');

const firstName = (value: string) => slug(value.trim().split(/\s+/)[0] ?? '');

// Caixa de entrada com uma mensagem suspeita sendo barrada
function InboxMock() {
    return (
        <Box aria-hidden="true" sx={{ width: '100%', maxWidth: 440, ml: 'auto', borderRadius: 2.5, overflow: 'hidden', bgcolor: '#fff', color: brand.dark, boxShadow: '0 2rem 4rem rgba(0,0,0,.45)' }}>
            <Stack direction="row" sx={{ alignItems: 'center', gap: 1, px: 2, py: 1.5, bgcolor: brand.dark, color: '#fff' }}>
                <InboxOutlinedIcon sx={{ fontSize: 18 }} />
                <Typography sx={{ fontFamily: monoFont, fontSize: 13 }}>contato@suaempresa.com.br</Typography>
            </Stack>
            {inbox.map((mail) => (
                <Box
                    key={mail.subject}
                    sx={{
                        position: 'relative',
                        overflow: 'hidden',
                        borderBottom: `1px solid ${brand.section}`,
                        ...(mail.spam && {
                            bgcolor: 'rgba(224,20,59,.05)',
                            animation: `${blocked} 7s ${ease} 1s infinite`,
                            '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
                        }),
                    }}
                >
                    <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5, px: 2, py: 1.25 }}>
                        <Box sx={{ width: 32, height: 32, flexShrink: 0, borderRadius: '50%', bgcolor: mail.spam ? brand.red : brand.mist, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 }}>
                            {mail.from[0]}
                        </Box>
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography sx={{ fontWeight: 600, fontSize: 14 }} noWrap>
                                {mail.from}
                            </Typography>
                            <Typography sx={{ fontSize: 13, color: brand.ink }} noWrap>
                                {mail.subject}
                            </Typography>
                        </Box>
                        <Typography sx={{ fontFamily: monoFont, fontSize: 11, color: brand.ink }}>{mail.time}</Typography>
                    </Stack>
                    {mail.spam && (
                        <Box
                            sx={{
                                position: 'absolute',
                                right: 56,
                                top: '50%',
                                mt: '-14px',
                                px: 1.25,
                                py: 0.25,
                                border: `2px solid ${brand.red}`,
                                borderRadius: 1,
                                color: brand.red,
                                bgcolor: '#fff',
                                fontFamily: monoFont,
                                fontWeight: 700,
                                fontSize: 13,
                                letterSpacing: 1,
                                opacity: 0,
                                animation: `${stamp} 7s ${ease} 1s infinite`,
                                '@media (prefers-reduced-motion: reduce)': { animation: 'none', opacity: 1 },
                            }}
                        >
                            SPAM
                        </Box>
                    )}
                </Box>
            ))}
            <Box sx={{ px: 2, py: 1.25, fontSize: 12, color: brand.ink, bgcolor: brand.sectionAlt }}>
                <GppGoodOutlinedIcon sx={{ fontSize: 14, verticalAlign: '-2px', mr: 0.5, color: brand.teal }} />
                Caixa de entrada protegida
            </Box>
        </Box>
    );
}

function EmailHero() {
    return (
        <Box component="section" sx={{ position: 'relative', overflow: 'hidden', color: '#fff', background: graphiteGlow('100% 50%'), pt: { xs: 8, md: 12 }, pb: { xs: 8, md: 12 } }}>
            <Container maxWidth="lg">
                <Grid container spacing={6} sx={{ alignItems: 'center' }}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <ServicePrompt path="servicos/email-profissional" />
                        <Typography variant="h2" component="h1" sx={{ fontSize: { xs: 32, md: 50 }, lineHeight: 1.15, mb: 2.5, ...entrance(150) }}>
                            Cada e-mail enviado leva o <Box component="span" sx={{ color: brand.red }}>nome</Box> da sua empresa.
                        </Typography>
                        <Typography sx={{ fontSize: { xs: 16, md: 18 }, color: 'rgba(255,255,255,.75)', maxWidth: 520, mb: 4, ...entrance(250) }}>
                            Endereços com o seu domínio, caixa de entrada protegida contra spam e golpes, e tudo sincronizado
                            no celular e no computador. A Fetech configura e cuida para você.
                        </Typography>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={entrance(350)}>
                            <Button variant="contained" size="large" href="#seu-endereco" endIcon={<ArrowForwardIcon />}>
                                Montar meu endereço
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
                        <InboxMock />
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}

// Cartão de remetente como aparece para quem recebe a mensagem
function SenderCard({ label, name, address, highlight }: { label: string; name: string; address: string; highlight?: boolean }) {
    return (
        <Box
            sx={{
                height: '100%',
                p: 3,
                borderRadius: 2.5,
                bgcolor: '#fff',
                border: `2px solid ${highlight ? brand.red : 'transparent'}`,
                boxShadow: highlight ? '0 1.25rem 2.5rem rgba(224,20,59,.16)' : '0 .5rem 1rem rgba(0,0,0,.06)',
                opacity: highlight ? 1 : 0.75,
            }}
        >
            <Typography sx={{ fontFamily: monoFont, fontSize: 12, color: highlight ? brand.red : brand.ink, mb: 2 }}>{label}</Typography>
            <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 44, height: 44, flexShrink: 0, borderRadius: '50%', bgcolor: highlight ? brand.red : brand.mist, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18 }}>
                    {name[0]?.toUpperCase()}
                </Box>
                <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 600 }} noWrap>
                        {name}
                    </Typography>
                    <Typography sx={{ fontFamily: monoFont, fontSize: { xs: 13, sm: 14 }, color: brand.ink, wordBreak: 'break-all' }}>{address}</Typography>
                </Box>
            </Stack>
        </Box>
    );
}

// O visitante digita o nome e a empresa e vê o próprio endereço, ao lado de como seria num e-mail gratuito
function AddressBuilder() {
    const [name, setName] = useState('');
    const [company, setCompany] = useState('');
    const content = useReveal({ preset: 'fade' });

    const person = firstName(name) || 'ana';
    const domain = slug(company) || 'suaempresa';
    const displayName = name.trim() || 'Ana';

    return (
        <Box component="section" id="seu-endereco" sx={{ bgcolor: brand.section, py: { xs: 8, md: 12.5 } }}>
            <Container maxWidth="lg">
                <SectionTitle>Seu endereço</SectionTitle>
                <Box {...content}>
                    <Typography sx={{ fontSize: 17, color: brand.ink, maxWidth: 640, mb: 4 }}>
                        Digite seu nome e o da sua empresa para ver como as suas mensagens chegam para o cliente.
                    </Typography>
                    <Grid container spacing={2} sx={{ mb: 4, maxWidth: 720 }}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField fullWidth label="Seu nome" placeholder="Ana" value={name} onChange={(event) => setName(event.target.value)} slotProps={{ htmlInput: { maxLength: 40 } }} sx={{ bgcolor: '#fff' }} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField fullWidth label="Nome da empresa" placeholder="Sua Empresa" value={company} onChange={(event) => setCompany(event.target.value)} slotProps={{ htmlInput: { maxLength: 40 } }} sx={{ bgcolor: '#fff' }} />
                        </Grid>
                    </Grid>
                    <Grid container spacing={2} aria-live="polite">
                        <Grid size={{ xs: 12, md: 6 }}>
                            <SenderCard label="e-mail gratuito" name={displayName} address={`${person}.${domain}2024@gmail.com`} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <SenderCard label="e-mail profissional Fetech" name={displayName} address={`${person}@${domain}.com.br`} highlight />
                        </Grid>
                    </Grid>
                    <Typography sx={{ mt: 3, fontSize: 15, color: brand.ink }}>
                        Também dá para criar endereços por setor, como{' '}
                        <Box component="span" sx={{ fontFamily: monoFont, color: brand.dark }}>
                            contato@{domain}.com.br
                        </Box>{' '}
                        e{' '}
                        <Box component="span" sx={{ fontFamily: monoFont, color: brand.dark }}>
                            financeiro@{domain}.com.br
                        </Box>
                        .
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
}

// Proteções da conta em cards escuros, numerados como camadas
function Protection() {
    const cards = useReveal({ stagger: true, delay: 80 });
    return (
        <Box component="section" sx={{ color: '#fff', background: graphiteGlow('0% 0%'), py: { xs: 8, md: 12.5 } }}>
            <Container maxWidth="lg">
                <SectionTitle>Caixa de entrada protegida</SectionTitle>
                <Grid container spacing={2} {...cards}>
                    {protection.map((item, index) => (
                        <Grid key={item.title} size={{ xs: 12, sm: 6, lg: 4 }}>
                            <Box
                                sx={{
                                    height: '100%',
                                    p: 3,
                                    borderRadius: 2.5,
                                    bgcolor: 'rgba(255,255,255,.04)',
                                    border: '1px solid rgba(255,255,255,.1)',
                                    transition: `border-color .35s ${ease}, background-color .35s ${ease}`,
                                    '&:hover': { borderColor: brand.red, bgcolor: 'rgba(224,20,59,.08)', '& .icone': { color: '#fff', bgcolor: brand.red } },
                                }}
                            >
                                <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                    <Box className="icone" sx={{ width: 48, height: 48, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', color: brand.red, bgcolor: 'rgba(224,20,59,.12)', transition: `background-color .35s ${ease}, color .35s ${ease}` }}>
                                        <item.Icon aria-hidden="true" />
                                    </Box>
                                    <Typography aria-hidden="true" sx={{ fontFamily: monoFont, fontSize: 12, opacity: 0.45 }}>
                                        camada {String(index + 1).padStart(2, '0')}
                                    </Typography>
                                </Stack>
                                <Typography variant="h6" component="h3" sx={{ fontSize: 18, mb: 0.75 }}>
                                    {item.title}
                                </Typography>
                                <Typography sx={{ opacity: 0.7, fontSize: 15 }}>{item.text}</Typography>
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
}

// Onde a conta funciona, em blocos compactos
function Anywhere() {
    const items = useReveal({ stagger: true, delay: 60 });
    return (
        <Box component="section" sx={{ bgcolor: '#fff', py: { xs: 8, md: 12.5 } }}>
            <Container maxWidth="lg">
                <SectionTitle>Onde você estiver</SectionTitle>
                <Grid container spacing={2} {...items}>
                    {anywhere.map((item) => (
                        <Grid key={item.title} size={{ xs: 6, md: 4, lg: 2 }}>
                            <Box sx={{ height: '100%', p: 2.5, borderRadius: 2.5, bgcolor: brand.sectionAlt, textAlign: 'center' }}>
                                <item.Icon sx={{ fontSize: 36, color: brand.red, mb: 1 }} aria-hidden="true" />
                                <Typography component="h3" sx={{ fontWeight: 700, mb: 0.5 }}>
                                    {item.title}
                                </Typography>
                                <Typography sx={{ fontSize: 14, color: brand.ink }}>{item.text}</Typography>
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
}

// As três etapas da troca, ligadas por uma seta
function Migration() {
    const list = useReveal({ stagger: true, delay: 100 });
    return (
        <Box component="section" sx={{ bgcolor: brand.sectionAlt, py: { xs: 8, md: 12.5 } }}>
            <Container maxWidth="lg">
                <SectionTitle>Como fazemos a troca</SectionTitle>
                <Grid component="ol" container spacing={3} {...list} sx={{ listStyle: 'none', p: 0, m: 0 }}>
                    {migration.map((step, index) => (
                        <Grid component="li" key={step.title} size={{ xs: 12, md: 4 }}>
                            <Stack direction="row" sx={{ gap: 2, alignItems: 'flex-start' }}>
                                <Box sx={{ flexShrink: 0, width: 56, height: 56, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: index === migration.length - 1 ? brand.red : brand.dark, color: '#fff' }}>
                                    <step.Icon aria-hidden="true" />
                                </Box>
                                <Box>
                                    <Typography sx={{ fontFamily: monoFont, fontSize: 12, color: brand.red }}>passo {index + 1}</Typography>
                                    <Typography variant="h6" component="h3" sx={{ fontSize: 19, mb: 0.75 }}>
                                        {step.title}
                                    </Typography>
                                    <Typography sx={{ color: brand.ink }}>{step.text}</Typography>
                                </Box>
                            </Stack>
                        </Grid>
                    ))}
                </Grid>
                <Typography sx={{ mt: 5, color: brand.ink, fontSize: 15 }}>
                    Também vai precisar de um site?{' '}
                    <Box component={RouterLink} to="/criacao-de-sites" sx={{ color: brand.red, fontWeight: 600 }}>
                        Conheça a criação de sites
                    </Box>{' '}
                    no mesmo domínio.
                </Typography>
            </Container>
        </Box>
    );
}

export default function EmailPage() {
    usePageTitle('E-mail Profissional – Fetech');

    return (
        <>
            <EmailHero />
            <AddressBuilder />
            <Protection />
            <Anywhere />
            <Migration />
            <ServiceFaq items={faq} />
            <ServiceCta
                prompt="nome@suaempresa.com.br"
                title="Diga quantas contas você precisa e montamos a proposta."
                text="Configuramos tudo e deixamos funcionando em cada aparelho da equipe."
                button="Quero meu e-mail profissional"
            />
        </>
    );
}
