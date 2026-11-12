import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

import { address, email } from '@/components/Footer';
import { entrance, graphiteGlow, ServicePrompt } from '@/components/ServiceSections';
import { pageMeta, usePageMeta } from '@/seo';
import { brand, monoFont } from '@/theme';

// Política de Privacidade (LGPD). O texto descreve o que o site faz de fato: o site público não grava cookies
// (routes/web.php), os formulários só enviam e-mail (QuoteController) e o servidor guarda o log de acesso do Caddy.
// Ao mudar algum desses comportamentos, atualizar o texto e a data abaixo.

const updatedAt = '12 de novembro de 2026';
const controller = 'FETECH Professional Hardware and Software';
const cnpj = '52.295.758/0001-06';

const subtitleSx = { fontSize: 18, fontWeight: 600, color: brand.dark, mt: 3, mb: 1 } as const;
const listSx = { pl: 3, '& li': { mb: 1 } } as const;
const codeSx = { fontFamily: monoFont, fontSize: '0.9em', bgcolor: 'rgba(0,0,0,.06)', px: 0.5, borderRadius: 0.5 } as const;

const mail = (
    <Link href={`mailto:${email}`} sx={{ color: brand.redText, fontWeight: 600 }}>
        {email}
    </Link>
);

interface Section {
    id: string;
    title: string;
    body: ReactNode;
}

const sections: Section[] = [
    {
        id: 'quem-somos',
        title: '1. Quem cuida dos seus dados',
        body: (
            <>
                <p>
                    O controlador dos dados é a <strong>{controller}</strong> (Fetech), microempreendedor individual (MEI) inscrito no CNPJ {cnpj}, com endereço
                    na {address.join(', ')}.
                </p>
                <p>
                    Para qualquer assunto de privacidade, inclusive para exercer os seus direitos, escreva para {mail}. Como agente de
                    tratamento de pequeno porte, a Fetech não é obrigada a indicar um encarregado (Resolução CD/ANPD nº 2/2022), e este
                    e-mail é o canal de atendimento ao titular.
                </p>
            </>
        ),
    },
    {
        id: 'dados',
        title: '2. Quais dados tratamos e para quê',
        body: (
            <>
                <Typography variant="h3" sx={subtitleSx}>
                    Pedido de orçamento
                </Typography>
                <p>
                    Quando você preenche o formulário de orçamento, recebemos o seu <strong>nome</strong>, <strong>e-mail</strong>,{' '}
                    <strong>telefone</strong> (opcional) e as respostas sobre o projeto. Esses dados são enviados por e-mail para a
                    Fetech e usados <strong>somente para preparar a proposta e responder ao seu pedido</strong>. Não são guardados em
                    banco de dados do site, não entram em lista de marketing e não são vendidos nem cedidos.
                </p>
                <p>
                    Base legal: procedimentos preliminares a um contrato, a pedido do titular (art. 7º, V, da LGPD). O mesmo vale quando
                    você nos procura pelo WhatsApp ou por e-mail.
                </p>

                <Typography variant="h3" sx={subtitleSx}>
                    Registros de acesso ao site
                </Typography>
                <p>
                    Como todo servidor web, o nosso grava um registro de cada acesso: <strong>endereço IP</strong>, data e hora, página
                    pedida, navegador usado e endereço de origem. Esses registros servem para manter o site seguro e funcionando,
                    investigar abusos e cumprir o Marco Civil da Internet, que obriga a guardá-los por 6 meses (Lei 12.965/2014, art.
                    15).
                </p>
                <p>
                    A partir deles contamos, de forma <strong>agregada e sem identificar ninguém</strong>, quantos acessos cada site
                    recebe por hora. Essas contagens não guardam o IP.
                </p>
                <p>Base legal: cumprimento de obrigação legal e legítimo interesse na segurança do serviço (art. 7º, II e IX).</p>
            </>
        ),
    },
    {
        id: 'cookies',
        title: '3. Cookies',
        body: (
            <>
                <p>
                    <strong>O site da Fetech não usa cookies.</strong> Não há ferramentas de análise (como Google Analytics), pixels de
                    redes sociais, publicidade ou qualquer rastreamento entre sites.
                </p>
                <p>
                    O navegador guarda apenas uma marcação local (<Box component="code" sx={codeSx}>fetech.cookie-notice</Box>) para não
                    mostrar de novo o aviso de privacidade depois que você o fecha. Ela fica só no seu aparelho, não identifica você e
                    não é enviada para o servidor. Você pode apagá-la limpando os dados do site no navegador.
                </p>
                <p>
                    A área restrita <Box component="code" sx={codeSx}>/painel</Box>, usada só pela equipe da Fetech, usa cookies
                    estritamente necessários para manter o login e proteger contra ataques (sessão e token CSRF), além do reCAPTCHA do
                    Google na tela de login. Quem só visita o site não passa por ela.
                </p>
                <p>
                    Os botões de WhatsApp, Google Maps e redes sociais são apenas links: nada desses serviços é carregado até você
                    clicar. Depois do clique, vale a política de privacidade de cada um.
                </p>
            </>
        ),
    },
    {
        id: 'compartilhamento',
        title: '4. Com quem os dados são compartilhados',
        body: (
            <>
                <p>Só com os fornecedores necessários para o site funcionar, que tratam os dados em nome da Fetech:</p>
                <Box component="ul" sx={listSx}>
                    <li>
                        <strong>Provedor do servidor (VPS)</strong>, onde ficam o site e os registros de acesso.
                    </li>
                    <li>
                        <strong>Serviço de e-mail</strong> que entrega e recebe as mensagens dos formulários. A caixa de entrada da
                        Fetech é do Google (Gmail), que pode armazenar dados fora do Brasil com as garantias previstas no art. 33 da
                        LGPD.
                    </li>
                </Box>
                <p>Além disso, os dados podem ser fornecidos a autoridades quando houver ordem judicial ou obrigação legal.</p>
            </>
        ),
    },
    {
        id: 'prazos',
        title: '5. Por quanto tempo guardamos',
        body: (
            <Box component="ul" sx={listSx}>
                <li>
                    <strong>Pedidos de orçamento e mensagens:</strong> até 1 ano depois do último contato. Se o pedido virar um
                    contrato, os dados ficam pelo tempo exigido por lei, como os prazos fiscais e contábeis.
                </li>
                <li>
                    <strong>Registros de acesso:</strong> 6 meses, como exige o Marco Civil da Internet, e depois são descartados.
                </li>
                <li>
                    <strong>Contagens de acesso por hora:</strong> até 400 dias. São anônimas.
                </li>
            </Box>
        ),
    },
    {
        id: 'direitos',
        title: '6. Seus direitos',
        body: (
            <>
                <p>Pela LGPD (art. 18), você pode pedir a qualquer momento:</p>
                <Box component="ul" sx={listSx}>
                    <li>a confirmação de que tratamos seus dados e o acesso a eles;</li>
                    <li>a correção de dados incompletos, inexatos ou desatualizados;</li>
                    <li>a anonimização, o bloqueio ou a eliminação de dados desnecessários ou tratados em desconformidade com a lei;</li>
                    <li>a eliminação dos dados, quando não houver obrigação legal de guardá-los;</li>
                    <li>a portabilidade dos dados a outro fornecedor;</li>
                    <li>a informação sobre com quem os dados foram compartilhados;</li>
                    <li>a oposição a um tratamento que descumpra a lei.</li>
                </Box>
                <p>
                    Envie o pedido para {mail}. Respondemos em até 15 dias. Se não ficar satisfeito, você também pode reclamar à
                    Autoridade Nacional de Proteção de Dados (
                    <Link href="https://www.gov.br/anpd" target="_blank" rel="noopener noreferrer" sx={{ color: brand.redText }}>
                        gov.br/anpd
                    </Link>
                    ).
                </p>
            </>
        ),
    },
    {
        id: 'seguranca',
        title: '7. Segurança',
        body: (
            <p>
                Todo o tráfego do site é criptografado (HTTPS), os formulários têm proteção contra robôs e abuso, e o acesso à área
                administrativa exige senha e verificação em duas etapas. Nenhuma medida é infalível, mas, se acontecer um incidente que
                possa trazer risco a você, avisaremos você e a ANPD, como manda a lei.
            </p>
        ),
    },
    {
        id: 'alteracoes',
        title: '8. Alterações desta política',
        body: (
            <p>
                Esta política pode mudar quando o site mudar. A data da última atualização fica no topo da página e, se a mudança for
                relevante, avisaremos no próprio site.
            </p>
        ),
    },
];

export default function PrivacyPage() {
    usePageMeta(pageMeta('privacy'));

    return (
        <>
            <Box component="section" sx={{ color: '#fff', background: graphiteGlow('100% 0%'), pt: { xs: 7, md: 10 }, pb: { xs: 7, md: 9 } }}>
                <Container maxWidth="lg">
                    <ServicePrompt path="cat privacidade.md" />
                    <Typography variant="h2" component="h1" sx={{ fontSize: { xs: 34, md: 52 }, lineHeight: 1.15, mb: 2, ...entrance(150) }}>
                        Política de <Box component="span" sx={{ color: brand.red }}>Privacidade</Box>
                    </Typography>
                    <Typography sx={{ fontSize: { xs: 16, md: 18 }, color: 'rgba(255,255,255,.75)', maxWidth: 640, ...entrance(250) }}>
                        O que acontece com os seus dados quando você visita o site ou pede um orçamento. Em resumo: nada de cookies, nada de
                        rastreamento, e os seus dados servem só para responder você.
                    </Typography>
                    <Typography sx={{ fontFamily: monoFont, fontSize: 13, color: 'rgba(255,255,255,.55)', mt: 3, ...entrance(350) }}>
                        {`// última atualização: ${updatedAt}`}
                    </Typography>
                </Container>
            </Box>

            <Box component="section" sx={{ bgcolor: brand.sectionAlt, py: { xs: 5, md: 8 }, flex: 1 }}>
                <Container maxWidth="md">
                    <Box component="nav" aria-label="Seções da política" sx={{ mb: 5 }}>
                        <Box component="ol" sx={{ ...listSx, m: 0, columns: { sm: 2 }, listStyle: 'none', pl: 0 }}>
                            {sections.map((section) => (
                                <li key={section.id}>
                                    <Link href={`#${section.id}`} sx={{ color: brand.ink }}>
                                        {section.title}
                                    </Link>
                                </li>
                            ))}
                        </Box>
                    </Box>

                    {sections.map((section) => (
                        <Box
                            component="section"
                            key={section.id}
                            id={section.id}
                            aria-labelledby={`${section.id}-titulo`}
                            sx={{ mb: 5, color: brand.ink, fontSize: 16, lineHeight: 1.7, '& p': { mt: 0, mb: 1.5 } }}
                        >
                            <Typography id={`${section.id}-titulo`} variant="h2" sx={{ fontSize: { xs: 22, md: 26 }, fontWeight: 600, color: brand.dark, mb: 2 }}>
                                {section.title}
                            </Typography>
                            {section.body}
                        </Box>
                    ))}
                </Container>
            </Box>
        </>
    );
}
