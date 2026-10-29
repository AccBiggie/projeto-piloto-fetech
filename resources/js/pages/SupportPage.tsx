import { keyframes } from '@emotion/react';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import BackupOutlinedIcon from '@mui/icons-material/BackupOutlined';
import BugReportOutlinedIcon from '@mui/icons-material/BugReportOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import CheckIcon from '@mui/icons-material/Check';
import ComputerOutlinedIcon from '@mui/icons-material/ComputerOutlined';
import DesktopWindowsOutlinedIcon from '@mui/icons-material/DesktopWindowsOutlined';
import DeviceThermostatOutlinedIcon from '@mui/icons-material/DeviceThermostatOutlined';
import EngineeringOutlinedIcon from '@mui/icons-material/EngineeringOutlined';
import ExtensionOutlinedIcon from '@mui/icons-material/ExtensionOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import HourglassBottomOutlinedIcon from '@mui/icons-material/HourglassBottomOutlined';
import LaptopOutlinedIcon from '@mui/icons-material/LaptopOutlined';
import MemoryOutlinedIcon from '@mui/icons-material/MemoryOutlined';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import PowerSettingsNewOutlinedIcon from '@mui/icons-material/PowerSettingsNewOutlined';
import RequestQuoteOutlinedIcon from '@mui/icons-material/RequestQuoteOutlined';
import RouterOutlinedIcon from '@mui/icons-material/RouterOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import ScreenshotMonitorOutlinedIcon from '@mui/icons-material/ScreenshotMonitorOutlined';
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined';
import SportsEsportsOutlinedIcon from '@mui/icons-material/SportsEsportsOutlined';
import StorageOutlinedIcon from '@mui/icons-material/StorageOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import TvOutlinedIcon from '@mui/icons-material/TvOutlined';
import UpgradeOutlinedIcon from '@mui/icons-material/UpgradeOutlined';
import VideogameAssetOutlinedIcon from '@mui/icons-material/VideogameAssetOutlined';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import WifiOffOutlinedIcon from '@mui/icons-material/WifiOffOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router';

import { whatsappUrl } from '@/components/FloatingActions';
import SectionTitle from '@/components/SectionTitle';
import { ease, entrance, type FaqItem, graphiteGlow, noMotion, ServiceCta, ServiceFaq, ServicePrompt, usePageTitle } from '@/components/ServiceSections';
import { useReveal } from '@/reveal/useReveal';
import { brand, monoFont } from '@/theme';

// Página do serviço de suporte e soluções em TI, a origem da Fetech na assistência técnica:
// pré-diagnóstico pelo aparelho e sintoma, o caminho do equipamento na bancada e o suporte
// contínuo para empresas.

const whatsappWith = (message: string) => `${whatsappUrl}?text=${encodeURIComponent(message)}`;

// As linhas do diagnóstico surgem uma a uma e o ciclo recomeça
const lineIn = keyframes`
    0%, 6% { opacity: 0; transform: translate3d(-6px, 0, 0); }
    12%, 88% { opacity: 1; transform: none; }
    96%, 100% { opacity: 0; }
`;

// O resultado do pré-diagnóstico entra de novo a cada troca de aparelho ou sintoma
const resultIn = keyframes`
    from { opacity: 0; transform: translate3d(0, 8px, 0); }
    to { opacity: 1; transform: none; }
`;

const diagnostics = [
    { label: 'fonte de energia', status: 'ok' },
    { label: 'memória RAM 16 GB', status: 'ok' },
    { label: 'temperatura da CPU 94 °C', status: 'atenção' },
    { label: 'saúde do SSD 98%', status: 'ok' },
    { label: 'bateria 61% da capacidade', status: 'atenção' },
    { label: 'sistema e drivers', status: 'ok' },
];

const devices = [
    { id: 'notebook', label: 'Notebook', Icon: LaptopOutlinedIcon },
    { id: 'desktop', label: 'Desktop', Icon: DesktopWindowsOutlinedIcon },
    { id: 'tv', label: 'Televisor', Icon: TvOutlinedIcon },
] as const;
type DeviceId = (typeof devices)[number]['id'];

// Sintomas mais comuns por aparelho, com as causas prováveis e o que fazemos na bancada
const symptoms: { id: string; label: string; Icon: typeof LaptopOutlinedIcon; devices: DeviceId[]; causes: Partial<Record<DeviceId, string[]>>; fix: string }[] = [
    {
        id: 'nao-liga',
        label: 'Não liga',
        Icon: PowerSettingsNewOutlinedIcon,
        devices: ['notebook', 'desktop', 'tv'],
        causes: {
            notebook: ['Carregador ou conector de energia', 'Bateria sem carga ou estufada', 'Curto na placa-mãe'],
            desktop: ['Fonte de alimentação', 'Botão ou cabo de energia', 'Componente da placa-mãe'],
            tv: ['Fonte interna', 'Placa principal', 'Cabo ou tomada'],
        },
        fix: 'Medimos a alimentação etapa por etapa até achar o componente que falhou e trocamos só o necessário.',
    },
    {
        id: 'lento',
        label: 'Lento ou travando',
        Icon: HourglassBottomOutlinedIcon,
        devices: ['notebook', 'desktop'],
        causes: { notebook: ['HD antigo no lugar de SSD', 'Pouca memória RAM', 'Sistema sobrecarregado'], desktop: ['HD antigo no lugar de SSD', 'Pouca memória RAM', 'Sistema sobrecarregado'] },
        fix: 'Testamos disco e memória, limpamos o sistema e indicamos o upgrade que mais rende pelo investimento.',
    },
    {
        id: 'esquentando',
        label: 'Esquentando ou desligando',
        Icon: DeviceThermostatOutlinedIcon,
        devices: ['notebook', 'desktop'],
        causes: { notebook: ['Poeira no cooler e nas aletas', 'Pasta térmica ressecada', 'Cooler com defeito'], desktop: ['Poeira no gabinete', 'Pasta térmica ressecada', 'Fluxo de ar ruim no gabinete'] },
        fix: 'Fazemos a limpeza interna completa, trocamos a pasta térmica e conferimos as temperaturas sob carga.',
    },
    {
        id: 'tela',
        label: 'Problema na tela',
        Icon: ScreenshotMonitorOutlinedIcon,
        devices: ['notebook', 'desktop', 'tv'],
        causes: {
            notebook: ['Tela trincada ou com manchas', 'Cabo flat da tela', 'Chip de vídeo'],
            desktop: ['Monitor ou cabo de vídeo', 'Placa de vídeo', 'Driver de vídeo'],
            tv: ['Barras de LED (som sem imagem)', 'Placa T-CON (imagem com listras)', 'Painel danificado'],
        },
        fix: 'Isolamos se o defeito é no painel, no cabo ou na placa antes de orçar, para não trocar peça à toa.',
    },
    {
        id: 'virus',
        label: 'Vírus ou propagandas',
        Icon: BugReportOutlinedIcon,
        devices: ['notebook', 'desktop'],
        causes: { notebook: ['Programas instalados junto com downloads', 'Extensões maliciosas no navegador', 'Sistema desatualizado'], desktop: ['Programas instalados junto com downloads', 'Extensões maliciosas no navegador', 'Sistema desatualizado'] },
        fix: 'Removemos as ameaças, atualizamos o sistema e deixamos a proteção configurada, preservando seus arquivos.',
    },
    {
        id: 'upgrade',
        label: 'Quero um upgrade',
        Icon: UpgradeOutlinedIcon,
        devices: ['notebook', 'desktop'],
        causes: { notebook: ['Trocar HD por SSD', 'Ampliar memória RAM', 'Reinstalar o sistema do zero'], desktop: ['SSD e memória', 'Placa de vídeo nova', 'Fonte e gabinete compatíveis'] },
        fix: 'Conferimos a compatibilidade das peças com o seu equipamento e indicamos o que vale a pena trocar.',
    },
    {
        id: 'conexao',
        label: 'Wi-Fi ou conexão',
        Icon: WifiOffOutlinedIcon,
        devices: ['notebook', 'desktop', 'tv'],
        causes: {
            notebook: ['Placa de rede sem fio', 'Driver de rede', 'Configuração do roteador'],
            desktop: ['Placa ou adaptador de rede', 'Driver de rede', 'Cabo ou roteador'],
            tv: ['Módulo Wi-Fi da TV', 'Sistema da Smart TV desatualizado', 'Sinal fraco do roteador'],
        },
        fix: 'Testamos o equipamento em rede conhecida para separar defeito do aparelho de problema na internet.',
    },
];

// Etapas da ordem de serviço, como o cliente acompanha o equipamento
const serviceOrder = [
    { Icon: AssignmentTurnedInOutlinedIcon, status: 'Recebido', text: 'Registramos o equipamento, os acessórios e o problema relatado por você.' },
    { Icon: FactCheckOutlinedIcon, status: 'Diagnóstico', text: 'Testamos os componentes e encontramos a causa, com laudo técnico do que foi achado.' },
    { Icon: RequestQuoteOutlinedIcon, status: 'Orçamento', text: 'Você recebe o valor e o prazo pelo WhatsApp e decide se aprova. Nada é feito sem o seu ok.' },
    { Icon: BuildOutlinedIcon, status: 'Reparo', text: 'Fazemos o conserto ou o upgrade aprovado, com peças compatíveis.' },
    { Icon: CheckIcon, status: 'Testado e pronto', text: 'O equipamento passa por testes antes da entrega e você é avisado para retirar.' },
];

// Compra orientada: o perfil de uso define a configuração indicada. Os níveis (1 a 4) desenham o
// medidor de cada peça; os modelos exatos saem na cotação, conforme o que houver no mercado.
const usages = [
    {
        id: 'estudos',
        label: 'Estudos e casa',
        Icon: SchoolOutlinedIcon,
        summary: 'Aulas online, pesquisas, redes sociais, filmes e documentos do dia a dia.',
        specs: [
            { part: 'Processador', value: 'Linha de entrada atual', level: 1 },
            { part: 'Memória', value: '8 a 16 GB', level: 2 },
            { part: 'Armazenamento', value: 'SSD de 256 a 512 GB', level: 1 },
            { part: 'Vídeo', value: 'Integrado ao processador', level: 1 },
        ],
    },
    {
        id: 'escritorio',
        label: 'Escritório',
        Icon: WorkOutlineOutlinedIcon,
        summary: 'Sistemas da empresa, planilhas grandes, muitas abas abertas e videochamadas.',
        specs: [
            { part: 'Processador', value: 'Intermediário', level: 2 },
            { part: 'Memória', value: '16 GB', level: 2 },
            { part: 'Armazenamento', value: 'SSD de 512 GB', level: 2 },
            { part: 'Vídeo', value: 'Integrado ao processador', level: 1 },
        ],
    },
    {
        id: 'criacao',
        label: 'Design e vídeo',
        Icon: PaletteOutlinedIcon,
        summary: 'Edição de fotos e vídeos, modelagem 3D, arquitetura e projetos pesados.',
        specs: [
            { part: 'Processador', value: 'Avançado, com muitos núcleos', level: 4 },
            { part: 'Memória', value: '32 GB ou mais', level: 4 },
            { part: 'Armazenamento', value: 'SSD de 1 TB + HD para arquivos', level: 3 },
            { part: 'Vídeo', value: 'Placa dedicada com bastante memória', level: 3 },
        ],
    },
    {
        id: 'jogos',
        label: 'Jogos',
        Icon: SportsEsportsOutlinedIcon,
        summary: 'Jogos atuais com boa taxa de quadros, transmissões e gravação de partidas.',
        specs: [
            { part: 'Processador', value: 'Intermediário a avançado', level: 3 },
            { part: 'Memória', value: '16 a 32 GB', level: 3 },
            { part: 'Armazenamento', value: 'SSD de 1 TB', level: 3 },
            { part: 'Vídeo', value: 'Placa dedicada de desempenho', level: 4 },
        ],
    },
] as const;
type UsageId = (typeof usages)[number]['id'];

const specIcons = { Processador: SpeedOutlinedIcon, Memória: MemoryOutlinedIcon, Armazenamento: StorageOutlinedIcon, Vídeo: VideogameAssetOutlinedIcon } as const;

const formats = [
    { id: 'notebook', label: 'Notebook', Icon: LaptopOutlinedIcon, tip: 'Leva para qualquer lugar e ocupa pouco espaço; em troca, as peças têm upgrade limitado.' },
    { id: 'desktop', label: 'Desktop', Icon: DesktopWindowsOutlinedIcon, tip: 'Mais desempenho pelo mesmo valor e fácil de atualizar peça por peça com o tempo.' },
] as const;
type FormatId = (typeof formats)[number]['id'];

const buyingSteps = [
    { Icon: TuneOutlinedIcon, text: 'Entendemos o uso, os programas e o orçamento' },
    { Icon: RequestQuoteOutlinedIcon, text: 'Cotamos as opções e explicamos as diferenças' },
    { Icon: ExtensionOutlinedIcon, text: 'Entregamos configurado, com seus arquivos e programas' },
];

const business = [
    { Icon: EngineeringOutlinedIcon, title: 'Manutenção preventiva', text: 'Limpeza e revisão periódica dos computadores para evitar parada no meio do expediente.' },
    { Icon: MemoryOutlinedIcon, title: 'Montagem e upgrade', text: 'Computadores montados para a tarefa de cada setor, sem pagar por desempenho que não será usado.' },
    { Icon: RouterOutlinedIcon, title: 'Rede e Wi-Fi', text: 'Organização da rede e do Wi-Fi do escritório para todo mundo conectar sem queda.' },
    { Icon: BackupOutlinedIcon, title: 'Backup e segurança', text: 'Rotina de cópia dos arquivos importantes e proteção das máquinas contra ameaças.' },
];

const faq: FaqItem[] = [
    {
        q: 'Quanto custa o diagnóstico?',
        a: 'O valor do diagnóstico é informado antes de recebermos o equipamento. Você só paga o reparo se aprovar o orçamento.',
    },
    {
        q: 'Vou perder meus arquivos?',
        a: 'Sempre que possível o reparo preserva os seus dados. Se houver risco, como troca de disco ou formatação, avisamos antes e oferecemos fazer uma cópia de segurança.',
    },
    {
        q: 'Em quanto tempo o equipamento fica pronto?',
        a: 'Depende do defeito e da disponibilidade das peças. O prazo vem junto com o orçamento, e você acompanha cada etapa pelo WhatsApp.',
    },
    {
        q: 'Vale a pena consertar ou é melhor comprar outro?',
        a: 'No diagnóstico dizemos com franqueza quando o reparo não compensa e sugerimos alternativas, como um upgrade ou um equipamento novo.',
    },
    {
        q: 'Vocês ajudam a comprar um computador novo?',
        a: 'Sim. Indicamos a configuração certa para o seu uso, cotamos as opções e entregamos o computador pronto, com sistema, programas e os arquivos do equipamento antigo.',
    },
    {
        q: 'Atendem empresas?',
        a: 'Sim. Além do reparo avulso, cuidamos da manutenção dos computadores, da rede e dos backups da empresa, e também de sites e e-mails profissionais.',
    },
];

// Painel de diagnóstico em estilo terminal, rodando os testes de um notebook
function DiagnosticMock() {
    const cycle = 9;
    return (
        <Box aria-hidden="true" sx={{ width: '100%', maxWidth: 460, ml: 'auto', borderRadius: 2.5, overflow: 'hidden', bgcolor: '#0e0e10', border: '1px solid rgba(255,255,255,.1)', boxShadow: '0 2rem 4rem rgba(0,0,0,.45)' }}>
            <Stack direction="row" sx={{ alignItems: 'center', gap: 0.75, px: 1.5, py: 1, bgcolor: brand.graphiteLight }}>
                {['#ff5f57', '#febc2e', '#28c840'].map((color) => (
                    <Box key={color} sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: color }} />
                ))}
                <Typography sx={{ ml: 1.5, fontFamily: monoFont, fontSize: 12, color: 'rgba(255,255,255,.6)' }}>fetech-diagnostico</Typography>
            </Stack>
            <Box sx={{ p: 2.5, fontFamily: monoFont, fontSize: { xs: 12, md: 13 }, lineHeight: 2, color: 'rgba(255,255,255,.85)' }}>
                <Box>
                    <Box component="span" sx={{ color: brand.red }}>
                        {'>'}
                    </Box>{' '}
                    diagnosticar --equipamento notebook
                </Box>
                {diagnostics.map((line, index) => {
                    const warn = line.status !== 'ok';
                    return (
                        <Stack
                            key={line.label}
                            direction="row"
                            sx={{
                                justifyContent: 'space-between',
                                gap: 2,
                                opacity: 0,
                                animation: `${lineIn} ${cycle}s ${ease} ${0.4 + index * 0.6}s infinite`,
                                '@media (prefers-reduced-motion: reduce)': { animation: 'none', opacity: 1 },
                            }}
                        >
                            <span>{line.label}</span>
                            <Box component="span" sx={{ color: warn ? '#febc2e' : '#28c840', whiteSpace: 'nowrap' }}>
                                [{line.status}]
                            </Box>
                        </Stack>
                    );
                })}
                <Box
                    sx={{
                        mt: 1,
                        pt: 1,
                        borderTop: '1px dashed rgba(255,255,255,.15)',
                        color: brand.red,
                        opacity: 0,
                        animation: `${lineIn} ${cycle}s ${ease} ${0.4 + diagnostics.length * 0.6}s infinite`,
                        '@media (prefers-reduced-motion: reduce)': { animation: 'none', opacity: 1 },
                    }}
                >
                    → limpeza interna e troca da pasta térmica
                </Box>
            </Box>
        </Box>
    );
}

function SupportHero() {
    return (
        <Box component="section" sx={{ position: 'relative', overflow: 'hidden', color: '#fff', background: graphiteGlow('0% 0%'), pt: { xs: 8, md: 12 }, pb: { xs: 8, md: 12 } }}>
            <Container maxWidth="lg">
                <Grid container spacing={6} sx={{ alignItems: 'center' }}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <ServicePrompt path="servicos/suporte-ti" />
                        <Typography variant="h2" component="h1" sx={{ fontSize: { xs: 32, md: 50 }, lineHeight: 1.15, mb: 2.5, ...entrance(150) }}>
                            Diagnóstico de verdade antes de <Box component="span" sx={{ color: brand.red }}>trocar</Box> qualquer peça.
                        </Typography>
                        <Typography sx={{ fontSize: { xs: 16, md: 18 }, color: 'rgba(255,255,255,.75)', maxWidth: 520, mb: 4, ...entrance(250) }}>
                            Conserto, manutenção, upgrade e ajuda na compra de computadores. Você sabe o que tem, quanto custa e
                            quando fica pronto antes de aprovar qualquer serviço.
                        </Typography>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={entrance(350)}>
                            <Button variant="contained" size="large" href="#pre-diagnostico" startIcon={<ComputerOutlinedIcon />}>
                                Fazer pré-diagnóstico
                            </Button>
                            <Button
                                variant="outlined"
                                color="inherit"
                                size="large"
                                href={whatsappWith('Olá! Preciso de suporte técnico da Fetech.')}
                                target="_blank"
                                rel="noopener noreferrer"
                                startIcon={<WhatsAppIcon />}
                                sx={{ borderColor: 'rgba(255,255,255,.6)', '&:hover': { bgcolor: '#fff', color: brand.dark, borderColor: '#fff' } }}
                            >
                                Chamar no WhatsApp
                            </Button>
                        </Stack>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }} sx={{ display: { xs: 'none', sm: 'block' }, ...entrance(300) }}>
                        <DiagnosticMock />
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}

// O visitante escolhe o aparelho e o sintoma e vê as causas prováveis, já com a mensagem pronta
// para o WhatsApp
function PreDiagnosis() {
    const [device, setDevice] = useState<DeviceId>('notebook');
    const available = symptoms.filter((symptom) => symptom.devices.includes(device));
    const [symptomId, setSymptomId] = useState(available[0].id);
    const symptom = available.find((item) => item.id === symptomId) ?? available[0];
    const deviceLabel = devices.find((item) => item.id === device)?.label ?? '';
    const content = useReveal({ preset: 'fade' });

    const message = `Olá! Meu ${deviceLabel.toLowerCase()} está com este problema: ${symptom.label.toLowerCase()}. Podem me ajudar?`;

    return (
        <Box component="section" id="pre-diagnostico" sx={{ bgcolor: brand.section, py: { xs: 8, md: 12.5 } }}>
            <Container maxWidth="lg">
                <SectionTitle>Pré-diagnóstico</SectionTitle>
                <Box {...content}>
                    <Typography sx={{ fontSize: 17, color: brand.ink, maxWidth: 640, mb: 4 }}>
                        Escolha o equipamento e o que está acontecendo. Mostramos as causas mais comuns e você já fala com a gente
                        com o problema descrito.
                    </Typography>

                    <Typography sx={{ fontFamily: monoFont, fontSize: 13, color: brand.red, mb: 1.5 }}>1. equipamento</Typography>
                    <ToggleButtonGroup
                        exclusive
                        value={device}
                        onChange={(_, value: DeviceId | null) => value && setDevice(value)}
                        aria-label="Equipamento"
                        sx={{
                            flexWrap: 'wrap',
                            mb: 3,
                            bgcolor: '#fff',
                            '& .MuiToggleButton-root': { gap: 1, px: 2.5, textTransform: 'none', fontWeight: 600 },
                            '& .Mui-selected, & .Mui-selected:hover': { bgcolor: `${brand.red} !important`, color: '#fff !important' },
                        }}
                    >
                        {devices.map((item) => (
                            <ToggleButton key={item.id} value={item.id}>
                                <item.Icon fontSize="small" aria-hidden="true" /> {item.label}
                            </ToggleButton>
                        ))}
                    </ToggleButtonGroup>

                    <Typography sx={{ fontFamily: monoFont, fontSize: 13, color: brand.red, mb: 1.5 }}>2. o que está acontecendo</Typography>
                    <Stack role="group" aria-label="Sintoma" direction="row" sx={{ gap: 1, flexWrap: 'wrap', mb: 4 }}>
                        {available.map((item) => {
                            const active = item.id === symptom.id;
                            return (
                                <Chip
                                    key={item.id}
                                    icon={<item.Icon />}
                                    label={item.label}
                                    onClick={() => setSymptomId(item.id)}
                                    aria-pressed={active}
                                    sx={{
                                        height: 38,
                                        px: 0.5,
                                        fontWeight: 600,
                                        bgcolor: active ? brand.dark : '#fff',
                                        color: active ? '#fff' : brand.dark,
                                        '& .MuiChip-icon': { color: active ? brand.red : brand.ink },
                                        transition: `background-color .3s ${ease}, color .3s ${ease}`,
                                        '&:hover': { bgcolor: active ? brand.dark : 'rgba(224,20,59,.1)' },
                                    }}
                                />
                            );
                        })}
                    </Stack>

                    {/* Resultado: causas prováveis e o que fazemos */}
                    <Box
                        key={`${device}-${symptom.id}`}
                        aria-live="polite"
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                            borderRadius: 3,
                            overflow: 'hidden',
                            boxShadow: '0 1rem 2rem rgba(0,0,0,.08)',
                            animation: `${resultIn} .4s ${ease} both`,
                            ...noMotion,
                        }}
                    >
                        <Box sx={{ p: { xs: 3, md: 4 }, bgcolor: '#fff' }}>
                            <Typography variant="h6" component="h3" sx={{ fontSize: 18, mb: 2 }}>
                                Causas mais comuns
                            </Typography>
                            <Stack component="ol" spacing={1.25} sx={{ listStyle: 'none', p: 0, m: 0 }}>
                                {(symptom.causes[device] ?? []).map((cause, index) => (
                                    <Box component="li" key={cause} sx={{ display: 'flex', gap: 1.5, alignItems: 'baseline' }}>
                                        <Box component="span" sx={{ fontFamily: monoFont, fontSize: 13, color: brand.red }}>
                                            {String(index + 1).padStart(2, '0')}
                                        </Box>
                                        {cause}
                                    </Box>
                                ))}
                            </Stack>
                        </Box>
                        <Box sx={{ p: { xs: 3, md: 4 }, bgcolor: brand.graphite, color: '#fff', display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="h6" component="h3" sx={{ fontSize: 18, mb: 2 }}>
                                O que fazemos
                            </Typography>
                            <Typography sx={{ opacity: 0.8, mb: 3 }}>{symptom.fix}</Typography>
                            <Button variant="contained" size="large" href={whatsappWith(message)} target="_blank" rel="noopener noreferrer" startIcon={<WhatsAppIcon />} sx={{ mt: 'auto', alignSelf: 'flex-start' }}>
                                Enviar esse problema
                            </Button>
                        </Box>
                    </Box>
                    <Typography sx={{ mt: 2, fontSize: 13, color: brand.ink }}>
                        O pré-diagnóstico é só uma indicação. A causa é confirmada na análise técnica do equipamento.
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
}

// Linha do tempo vertical, como a ordem de serviço que o cliente acompanha
function ServiceOrder() {
    const list = useReveal({ stagger: true, delay: 100 });
    const intro = useReveal({ preset: 'fade' });
    return (
        <Box component="section" sx={{ bgcolor: '#fff', py: { xs: 8, md: 12.5 } }}>
            <Container maxWidth="lg">
                <Grid container spacing={{ xs: 4, md: 8 }}>
                    <Grid size={{ xs: 12, md: 5 }} {...intro}>
                        <SectionTitle sx={{ mb: 3 }}>Na bancada</SectionTitle>
                        <Typography sx={{ fontSize: 17, color: brand.ink, mb: 2 }}>
                            Cada equipamento recebe uma ordem de serviço. Você acompanha em que etapa ele está e nada é feito sem a
                            sua aprovação.
                        </Typography>
                        <Typography sx={{ fontFamily: monoFont, fontSize: 13, color: brand.ink }}>
                            <Box component="span" sx={{ color: brand.red }}>
                                os
                            </Box>{' '}
                            #0427 · notebook · não liga
                        </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, md: 7 }}>
                        <Box component="ol" {...list} sx={{ listStyle: 'none', p: 0, m: 0, position: 'relative' }}>
                            {serviceOrder.map((step, index) => {
                                const last = index === serviceOrder.length - 1;
                                return (
                                    <Box component="li" key={step.status} sx={{ position: 'relative', display: 'flex', gap: 2.5, pb: last ? 0 : 4 }}>
                                        {/* Trilho entre as etapas */}
                                        {!last && <Box aria-hidden="true" sx={{ position: 'absolute', left: 21, top: 48, bottom: 4, width: 2, bgcolor: brand.section }} />}
                                        <Box
                                            sx={{
                                                flexShrink: 0,
                                                width: 44,
                                                height: 44,
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: '#fff',
                                                bgcolor: last ? brand.red : brand.dark,
                                            }}
                                        >
                                            <step.Icon fontSize="small" aria-hidden="true" />
                                        </Box>
                                        <Box sx={{ pt: 0.5 }}>
                                            <Typography sx={{ fontFamily: monoFont, fontSize: 12, color: brand.red }}>etapa {index + 1}</Typography>
                                            <Typography variant="h6" component="h3" sx={{ fontSize: 19, mb: 0.5 }}>
                                                {step.status}
                                            </Typography>
                                            <Typography sx={{ color: brand.ink }}>{step.text}</Typography>
                                        </Box>
                                    </Box>
                                );
                            })}
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}

// O visitante escolhe o uso e o formato e vê a configuração indicada, com o pedido pronto para o
// WhatsApp. Cada peça tem um medidor de 4 níveis.
function ComputerAdvisor() {
    const [usageId, setUsageId] = useState<UsageId>('escritorio');
    const [formatId, setFormatId] = useState<FormatId>('notebook');
    const usage = usages.find((item) => item.id === usageId) ?? usages[0];
    const format = formats.find((item) => item.id === formatId) ?? formats[0];
    const content = useReveal({ preset: 'fade' });

    const message = `Olá! Quero comprar um ${format.label.toLowerCase()} para ${usage.label.toLowerCase()}. Podem me ajudar a escolher?`;

    return (
        <Box component="section" id="computador-sob-medida" sx={{ bgcolor: brand.sectionAlt, py: { xs: 8, md: 12.5 } }}>
            <Container maxWidth="lg">
                <SectionTitle>Computador sob medida</SectionTitle>
                <Box {...content}>
                    <Typography sx={{ fontSize: 17, color: brand.ink, maxWidth: 680, mb: 4 }}>
                        Vai comprar um computador? Antes de pagar por desempenho que não vai usar, ou de levar um que não dá conta,
                        diga para que ele serve e indicamos a configuração certa.
                    </Typography>

                    <Grid container spacing={{ xs: 3, md: 4 }}>
                        <Grid size={{ xs: 12, md: 5 }}>
                            <Typography sx={{ fontFamily: monoFont, fontSize: 13, color: brand.red, mb: 1.5 }}>1. para que vai usar</Typography>
                            <Grid container spacing={1.5} role="radiogroup" aria-label="Uso do computador" sx={{ mb: 3 }}>
                                {usages.map((item) => {
                                    const active = item.id === usage.id;
                                    return (
                                        <Grid key={item.id} size={6}>
                                            <Box
                                                component="button"
                                                type="button"
                                                role="radio"
                                                aria-checked={active}
                                                onClick={() => setUsageId(item.id)}
                                                sx={{
                                                    width: '100%',
                                                    height: '100%',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'flex-start',
                                                    gap: 1,
                                                    p: 2,
                                                    font: 'inherit',
                                                    fontWeight: 600,
                                                    textAlign: 'left',
                                                    cursor: 'pointer',
                                                    borderRadius: 2,
                                                    border: `2px solid ${active ? brand.red : brand.section}`,
                                                    bgcolor: active ? 'rgba(224,20,59,.06)' : '#fff',
                                                    color: brand.dark,
                                                    transition: `border-color .3s ${ease}, background-color .3s ${ease}`,
                                                    '&:hover': { borderColor: brand.red },
                                                    '&:focus-visible': { outline: `2px solid ${brand.red}`, outlineOffset: 2 },
                                                }}
                                            >
                                                <item.Icon sx={{ color: active ? brand.red : brand.ink }} aria-hidden="true" />
                                                {item.label}
                                            </Box>
                                        </Grid>
                                    );
                                })}
                            </Grid>

                            <Typography sx={{ fontFamily: monoFont, fontSize: 13, color: brand.red, mb: 1.5 }}>2. formato</Typography>
                            <ToggleButtonGroup
                                exclusive
                                fullWidth
                                value={formatId}
                                onChange={(_, value: FormatId | null) => value && setFormatId(value)}
                                aria-label="Formato"
                                sx={{
                                    bgcolor: '#fff',
                                    mb: 1.5,
                                    '& .MuiToggleButton-root': { gap: 1, textTransform: 'none', fontWeight: 600 },
                                    '& .Mui-selected, & .Mui-selected:hover': { bgcolor: `${brand.red} !important`, color: '#fff !important' },
                                }}
                            >
                                {formats.map((item) => (
                                    <ToggleButton key={item.id} value={item.id}>
                                        <item.Icon fontSize="small" aria-hidden="true" /> {item.label}
                                    </ToggleButton>
                                ))}
                            </ToggleButtonGroup>
                            <Typography sx={{ fontSize: 14, color: brand.ink }}>{format.tip}</Typography>
                        </Grid>

                        {/* Ficha da configuração indicada */}
                        <Grid size={{ xs: 12, md: 7 }}>
                            <Box
                                key={`${usage.id}-${format.id}`}
                                aria-live="polite"
                                sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: { xs: 3, md: 4 }, borderRadius: 3, bgcolor: brand.graphite, color: '#fff', boxShadow: '0 1.25rem 2.5rem rgba(0,0,0,.18)', animation: `${resultIn} .4s ${ease} both`, ...noMotion }}
                            >
                                <Typography sx={{ fontFamily: monoFont, fontSize: 13, opacity: 0.6, mb: 1 }}>
                                    {`> configuracao --uso ${usage.id} --formato ${format.id}`}
                                </Typography>
                                <Typography variant="h5" component="h3" sx={{ fontSize: { xs: 22, md: 26 }, mb: 1 }}>
                                    {format.label} para {usage.label.toLowerCase()}
                                </Typography>
                                <Typography sx={{ opacity: 0.7, mb: 3 }}>{usage.summary}</Typography>
                                <Stack component="dl" spacing={2} sx={{ m: 0, mb: 3 }}>
                                    {usage.specs.map((spec) => {
                                        const Icon = specIcons[spec.part];
                                        return (
                                            <Stack key={spec.part} direction="row" sx={{ alignItems: 'center', gap: 2 }}>
                                                <Icon sx={{ color: brand.red }} aria-hidden="true" />
                                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                                    <Typography component="dt" sx={{ fontSize: 12, opacity: 0.6, fontFamily: monoFont }}>
                                                        {spec.part.toLowerCase()}
                                                    </Typography>
                                                    <Typography component="dd" sx={{ m: 0, fontWeight: 600 }}>
                                                        {spec.value}
                                                    </Typography>
                                                </Box>
                                                <Stack direction="row" spacing={0.5} aria-label={`Nível ${spec.level} de 4`} role="img">
                                                    {[1, 2, 3, 4].map((step) => (
                                                        <Box key={step} sx={{ width: { xs: 10, sm: 16 }, height: 8, borderRadius: 0.5, bgcolor: step <= spec.level ? brand.red : 'rgba(255,255,255,.15)' }} />
                                                    ))}
                                                </Stack>
                                            </Stack>
                                        );
                                    })}
                                </Stack>
                                <Button variant="contained" size="large" href={whatsappWith(message)} target="_blank" rel="noopener noreferrer" startIcon={<WhatsAppIcon />} sx={{ mt: 'auto', alignSelf: 'flex-start' }}>
                                    Pedir cotação
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>

                    {/* Como a compra acontece */}
                    <Grid component="ol" container spacing={2} sx={{ listStyle: 'none', p: 0, m: 0, mt: { xs: 4, md: 5 } }}>
                        {buyingSteps.map((step, index) => (
                            <Grid component="li" key={step.text} size={{ xs: 12, md: 4 }}>
                                <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5, p: 2, borderRadius: 2, bgcolor: '#fff', height: '100%' }}>
                                    <Box sx={{ flexShrink: 0, width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(224,20,59,.08)', color: brand.red }}>
                                        <step.Icon fontSize="small" aria-hidden="true" />
                                    </Box>
                                    <Typography sx={{ fontSize: 15 }}>
                                        <Box component="span" sx={{ fontFamily: monoFont, color: brand.red, mr: 1 }}>
                                            {index + 1}.
                                        </Box>
                                        {step.text}
                                    </Typography>
                                </Stack>
                            </Grid>
                        ))}
                    </Grid>
                    <Typography sx={{ mt: 2, fontSize: 13, color: brand.ink }}>
                        As configurações são um ponto de partida. Os modelos exatos e os valores saem na cotação, conforme o que houver
                        disponível no mercado.
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
}

// Suporte contínuo para empresas, com ponte para os serviços de desenvolvimento
function Business() {
    const cards = useReveal({ stagger: true, delay: 80 });
    return (
        <Box component="section" sx={{ color: '#fff', background: graphiteGlow('100% 100%'), py: { xs: 8, md: 12.5 } }}>
            <Container maxWidth="lg">
                <SectionTitle>Para empresas</SectionTitle>
                <Typography sx={{ fontSize: 17, opacity: 0.75, maxWidth: 640, mb: { xs: 4, md: 5 } }}>
                    Além do reparo avulso, cuidamos da tecnologia do dia a dia do seu negócio para a equipe não parar.
                </Typography>
                <Grid container spacing={2} {...cards}>
                    {business.map((item) => (
                        <Grid key={item.title} size={{ xs: 12, sm: 6, md: 3 }}>
                            <Box
                                sx={{
                                    height: '100%',
                                    p: 3,
                                    borderRadius: 2.5,
                                    bgcolor: 'rgba(255,255,255,.04)',
                                    border: '1px solid rgba(255,255,255,.1)',
                                    transition: `border-color .35s ${ease}, transform .35s ${ease}`,
                                    '&:hover': { borderColor: brand.red, transform: 'translateY(-4px)' },
                                    '@media (prefers-reduced-motion: reduce)': { transition: 'none', '&:hover': { transform: 'none' } },
                                }}
                            >
                                <item.Icon sx={{ fontSize: 34, color: brand.red, mb: 1.5 }} aria-hidden="true" />
                                <Typography variant="h6" component="h3" sx={{ fontSize: 18, mb: 0.75 }}>
                                    {item.title}
                                </Typography>
                                <Typography sx={{ opacity: 0.7, fontSize: 15 }}>{item.text}</Typography>
                            </Box>
                        </Grid>
                    ))}
                </Grid>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 5, alignItems: { sm: 'center' } }}>
                    <Typography sx={{ opacity: 0.75, mr: 1 }}>Sua empresa também precisa estar online?</Typography>
                    <Button component={RouterLink} to="/criacao-de-sites" variant="outlined" color="inherit" startIcon={<StorefrontOutlinedIcon />} sx={{ borderColor: 'rgba(255,255,255,.4)' }}>
                        Sites e lojas
                    </Button>
                    <Button component={RouterLink} to="/email-profissional" variant="outlined" color="inherit" sx={{ borderColor: 'rgba(255,255,255,.4)' }}>
                        E-mail profissional
                    </Button>
                </Stack>
            </Container>
        </Box>
    );
}

export default function SupportPage() {
    usePageTitle('Suporte e Soluções em TI – Fetech');

    return (
        <>
            <SupportHero />
            <PreDiagnosis />
            <ServiceOrder />
            <ComputerAdvisor />
            <Business />
            <ServiceFaq items={faq} />
            <ServiceCta
                prompt="suporte --agora"
                title="Conte o que está acontecendo com o seu equipamento."
                text="Respondemos pelo WhatsApp com os próximos passos e o valor do diagnóstico."
                button="Falar com o suporte"
                href={whatsappWith('Olá! Preciso de suporte técnico da Fetech.')}
            />
        </>
    );
}
