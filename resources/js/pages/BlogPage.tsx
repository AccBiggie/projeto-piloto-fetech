import { keyframes } from '@emotion/react';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CloseIcon from '@mui/icons-material/Close';
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined';
import SearchIcon from '@mui/icons-material/Search';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link as RouterLink, useSearchParams } from 'react-router';

import { categories, categoryOf, type CategoryId, isCategory, normalize, type Post, posts, readingMinutes, sortedPosts } from '@/blog/posts';
import { whatsappUrl } from '@/components/FloatingActions';
import PostCard, { Avatar, CategoryTag, PostCover, PostMeta } from '@/components/PostCard';
import SectionTitle from '@/components/SectionTitle';
import { ease, entrance, graphiteGlow, noMotion, ServicePrompt, usePageTitle } from '@/components/ServiceSections';
import { useReveal } from '@/reveal/useReveal';
import { brand, monoFont } from '@/theme';

// Blog da Fetech: busca, filtro por categoria e ordenação guardados na URL (?busca=&categoria=&ordem=),
// post em destaque, "carregar mais" e dois estados vazios: o blog ainda sem posts e a busca sem resultado.

const PAGE_SIZE = 6;

const orders = [
    { id: 'recentes', label: 'Mais recentes' },
    { id: 'antigos', label: 'Mais antigos' },
    { id: 'rapidos', label: 'Leitura rápida' },
] as const;
type OrderId = (typeof orders)[number]['id'];
const isOrder = (value: string | null): value is OrderId => orders.some((order) => order.id === value);

// O que cada categoria vai trazer, para o aviso de lançamento
const categoryPitch: Record<CategoryId, string> = {
    desenvolvimento: 'Bastidores dos sites, lojas e sistemas que entregamos e o que aprendemos em cada um.',
    hardware: 'Peças, upgrades e manutenção de notebooks e desktops explicados sem complicação.',
    'inteligencia-artificial': 'Como a IA já pode ajudar pequenas empresas no dia a dia.',
    dicas: 'Segurança, backup, e-mail e outros cuidados rápidos com a tecnologia do seu negócio.',
    jogos: 'Novidades do mundo dos games e do hardware que faz eles rodarem.',
};

const shimmer = keyframes`
    from { background-position: 200% 0; }
    to { background-position: -200% 0; }
`;

function sortPosts(list: Post[], order: OrderId) {
    if (order === 'antigos') return [...list].reverse();
    if (order === 'rapidos') return [...list].sort((a, b) => readingMinutes(a) - readingMinutes(b));
    return list;
}

function BlogHero() {
    return (
        <Box component="section" sx={{ color: '#fff', background: graphiteGlow('100% 0%'), pt: { xs: 7, md: 10 }, pb: { xs: 7, md: 9 } }}>
            <Container maxWidth="lg">
                <ServicePrompt path="blog" />
                <Typography variant="h2" component="h1" sx={{ fontSize: { xs: 34, md: 52 }, lineHeight: 1.15, mb: 2, ...entrance(150) }}>
                    Blog da <Box component="span" sx={{ color: brand.red }}>Fetech</Box>
                </Typography>
                <Typography sx={{ fontSize: { xs: 16, md: 18 }, color: 'rgba(255,255,255,.75)', maxWidth: 600, ...entrance(250) }}>
                    Desenvolvimento, hardware e tecnologia contados por quem coloca a mão no código e no equipamento.
                </Typography>
                <Typography sx={{ fontFamily: monoFont, fontSize: 13, color: 'rgba(255,255,255,.55)', mt: 3, ...entrance(350) }}>
                    {posts.length === 0 ? '// primeiros posts em breve' : `// ${posts.length} ${posts.length === 1 ? 'post publicado' : 'posts publicados'}`}
                </Typography>
            </Container>
        </Box>
    );
}

// Post em destaque: capa larga ao lado do resumo
function Featured({ post }: { post: Post }) {
    return (
        <Box
            component={RouterLink}
            to={`/blog/${post.slug}`}
            sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1.2fr 1fr' },
                gap: { xs: 2, md: 4 },
                alignItems: 'center',
                p: 1.5,
                mb: 4,
                borderRadius: 3,
                bgcolor: '#fff',
                color: brand.dark,
                textDecoration: 'none',
                border: '1px solid transparent',
                boxShadow: '0 .75rem 1.5rem rgba(0,0,0,.07)',
                transition: `border-color .35s ${ease}, box-shadow .35s ${ease}`,
                '&:hover, &:focus-visible': { borderColor: brand.red, boxShadow: '0 1.25rem 2.5rem rgba(224,20,59,.16)' },
                '&:focus-visible': { outline: `2px solid ${brand.red}`, outlineOffset: 3 },
            }}
        >
            <PostCover post={post} category={post.category} height={{ xs: 200, md: 320 }} />
            <Box sx={{ px: { xs: 1, md: 0 }, pr: { md: 4 }, pb: { xs: 1, md: 0 } }}>
                <Typography sx={{ fontFamily: monoFont, fontSize: 12, color: brand.red, mb: 1.5 }}>em destaque</Typography>
                <Stack direction="row" sx={{ gap: 1.5, alignItems: 'center', flexWrap: 'wrap', mb: 2 }}>
                    <CategoryTag category={post.category} />
                    <PostMeta post={post} />
                </Stack>
                <Typography variant="h4" component="h2" sx={{ fontSize: { xs: 24, md: 32 }, lineHeight: 1.2, mb: 1.5 }}>
                    {post.title}
                </Typography>
                <Typography sx={{ color: brand.ink, mb: 3 }}>{post.excerpt}</Typography>
                <Stack direction="row" sx={{ alignItems: 'center', gap: 1.25 }}>
                    <Avatar name={post.author.name} />
                    <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{post.author.name}</Typography>
                </Stack>
            </Box>
        </Box>
    );
}

// Blog ainda sem posts: cards fantasmas "carregando" e as categorias que vêm por aí
function Launching() {
    const topics = useReveal({ stagger: true, delay: 80 });
    return (
        <Box>
            <Box sx={{ position: 'relative', mb: { xs: 6, md: 8 } }}>
                <Grid container spacing={2} aria-hidden="true">
                    {[0, 1, 2].map((i) => (
                        <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }} sx={{ display: { xs: i ? 'none' : 'block', sm: i === 2 ? 'none' : 'block', md: 'block' } }}>
                            <Box sx={{ p: 1.5, borderRadius: 2.5, bgcolor: '#fff', opacity: 0.7 }}>
                                {[180, 14, 20, 12, 12].map((height, line) => (
                                    <Box
                                        key={line}
                                        sx={{
                                            height,
                                            width: line === 0 ? '100%' : ['', '30%', '85%', '100%', '60%'][line],
                                            mb: line === 0 ? 2 : 1.25,
                                            borderRadius: line === 0 ? 2 : 1,
                                            background: `linear-gradient(90deg, ${brand.section} 25%, ${brand.sectionAlt} 50%, ${brand.section} 75%)`,
                                            backgroundSize: '200% 100%',
                                            animation: `${shimmer} 1.8s linear infinite`,
                                            ...noMotion,
                                        }}
                                    />
                                ))}
                            </Box>
                        </Grid>
                    ))}
                </Grid>
                <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
                    <Box sx={{ maxWidth: 520, textAlign: 'center', p: { xs: 3, md: 4 }, borderRadius: 3, bgcolor: brand.graphite, color: '#fff', boxShadow: '0 1.5rem 3rem rgba(0,0,0,.3)' }}>
                        <EditNoteOutlinedIcon sx={{ fontSize: 44, color: brand.red, mb: 1 }} aria-hidden="true" />
                        <Typography variant="h5" component="h2" sx={{ fontSize: { xs: 22, md: 26 }, mb: 1 }}>
                            Os primeiros posts estão sendo escritos
                        </Typography>
                        <Typography sx={{ opacity: 0.75, mb: 3 }}>
                            Em breve, conteúdo sobre desenvolvimento, hardware e tecnologia para o seu negócio. Enquanto isso, fale com a
                            gente ou conheça nossos serviços.
                        </Typography>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ justifyContent: 'center' }}>
                            <Button variant="contained" href={whatsappUrl} target="_blank" rel="noopener noreferrer" startIcon={<WhatsAppIcon />}>
                                Sugerir um assunto
                            </Button>
                            <Button variant="outlined" color="inherit" component={RouterLink} to="/#servicos" sx={{ borderColor: 'rgba(255,255,255,.5)' }}>
                                Ver serviços
                            </Button>
                        </Stack>
                    </Box>
                </Box>
            </Box>

            <SectionTitle sx={{ fontSize: { xs: 24, md: 30 } }}>O que vem por aí</SectionTitle>
            <Grid container spacing={2} {...topics}>
                {categories.map(({ id, label, Icon }) => (
                    <Grid key={id} size={{ xs: 12, sm: 6, md: 'grow' }}>
                        <Box sx={{ height: '100%', p: 2.5, borderRadius: 2.5, bgcolor: '#fff', borderTop: `3px solid ${brand.red}` }}>
                            <Icon sx={{ color: brand.red, mb: 1 }} aria-hidden="true" />
                            <Typography component="h3" sx={{ fontWeight: 700, mb: 0.75 }}>
                                {label}
                            </Typography>
                            <Typography sx={{ fontSize: 14, color: brand.ink }}>{categoryPitch[id]}</Typography>
                        </Box>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}

function NoResults({ search, category, onClear }: { search: string; category: CategoryId | null; onClear: () => void }) {
    return (
        <Stack role="status" spacing={2} sx={{ alignItems: 'center', textAlign: 'center', py: { xs: 6, md: 10 } }}>
            <SearchOffIcon sx={{ fontSize: 56, color: brand.red }} aria-hidden="true" />
            <Typography variant="h5" component="h2">
                Nenhum post encontrado
            </Typography>
            <Typography sx={{ color: brand.ink, maxWidth: 480 }}>
                {search ? <>Não achamos nada para “{search}”</> : 'Ainda não há posts'}
                {category ? <> em {categoryOf(category).label}</> : null}. Tente outra palavra ou veja todas as categorias.
            </Typography>
            <Button variant="outlined" onClick={onClear} startIcon={<CloseIcon />}>
                Limpar filtros
            </Button>
        </Stack>
    );
}

export default function BlogPage() {
    usePageTitle('Blog – Fetech');
    const [params, setParams] = useSearchParams();
    const [visible, setVisible] = useState(PAGE_SIZE);
    const searchRef = useRef<HTMLInputElement>(null);

    const search = params.get('busca') ?? '';
    const categoryParam = params.get('categoria');
    const category = isCategory(categoryParam) ? categoryParam : null;
    const orderParam = params.get('ordem');
    const order: OrderId = isOrder(orderParam) ? orderParam : 'recentes';

    // Atualiza um parâmetro sem empilhar uma entrada no histórico a cada letra digitada
    const update = (key: string, value: string | null) => {
        setParams(
            (current) => {
                const next = new URLSearchParams(current);
                if (value) next.set(key, value);
                else next.delete(key);
                return next;
            },
            { replace: true },
        );
    };

    const all = useMemo(sortedPosts, []);
    const filtering = Boolean(search || category);
    // Destaque só na visão geral: o post marcado mais recente
    const featured = !filtering && order === 'recentes' ? all.find((post) => post.featured) : undefined;

    const results = useMemo(() => {
        const terms = normalize(search).split(/\s+/).filter(Boolean);
        const matched = all.filter((post) => {
            if (category && post.category !== category) return false;
            const haystack = normalize(`${post.title} ${post.excerpt} ${categoryOf(post.category).label} ${post.author.name}`);
            return terms.every((term) => haystack.includes(term));
        });
        return sortPosts(matched, order).filter((post) => post !== featured);
    }, [all, search, category, order, featured]);

    const countBy = (id: CategoryId) => all.filter((post) => post.category === id).length;

    // Nova busca ou filtro volta para a primeira página
    useEffect(() => setVisible(PAGE_SIZE), [search, category, order]);

    // "/" leva o foco para a busca, como em muitos sites de conteúdo
    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement;
            if (event.key === '/' && !/^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName) && !target.isContentEditable) {
                event.preventDefault();
                searchRef.current?.focus();
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    const clear = () => setParams({}, { replace: true });
    const shown = results.slice(0, visible);

    return (
        <>
            <BlogHero />
            <Box component="section" sx={{ bgcolor: brand.section, py: { xs: 5, md: 7 }, flex: 1 }}>
                <Container maxWidth="lg">
                    {/* Barra de busca, ordenação e categorias */}
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2.5 }}>
                        <TextField
                            inputRef={searchRef}
                            fullWidth
                            type="search"
                            value={search}
                            onChange={(event) => update('busca', event.target.value)}
                            placeholder="Buscar no blog"
                            aria-label="Buscar no blog"
                            sx={{ bgcolor: '#fff', borderRadius: 1 }}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                    ),
                                    endAdornment: search ? (
                                        <InputAdornment position="end">
                                            <IconButton aria-label="Limpar busca" edge="end" onClick={() => update('busca', null)}>
                                                <CloseIcon />
                                            </IconButton>
                                        </InputAdornment>
                                    ) : (
                                        <InputAdornment position="end" sx={{ display: { xs: 'none', md: 'flex' } }}>
                                            <Box component="kbd" sx={{ fontFamily: monoFont, fontSize: 12, px: 0.75, borderRadius: 0.5, border: `1px solid ${brand.mist}`, color: brand.ink }}>
                                                /
                                            </Box>
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />
                        <TextField select value={order} onChange={(event) => update('ordem', event.target.value === 'recentes' ? null : event.target.value)} label="Ordenar" sx={{ bgcolor: '#fff', borderRadius: 1, minWidth: { md: 200 } }}>
                            {orders.map((item) => (
                                <MenuItem key={item.id} value={item.id}>
                                    {item.label}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Stack>
                    <Stack role="group" aria-label="Categorias" direction="row" sx={{ gap: 1, flexWrap: 'wrap', mb: { xs: 4, md: 5 } }}>
                        {[{ id: null, label: 'Todos', count: all.length }, ...categories.map((item) => ({ id: item.id, label: item.label, count: countBy(item.id) }))].map((item) => {
                            const active = category === item.id;
                            return (
                                <Chip
                                    key={item.label}
                                    label={
                                        <>
                                            {item.label}{' '}
                                            <Box component="span" sx={{ fontFamily: monoFont, opacity: 0.6, ml: 0.5 }}>
                                                {item.count}
                                            </Box>
                                        </>
                                    }
                                    onClick={() => update('categoria', item.id)}
                                    aria-pressed={active}
                                    sx={{
                                        height: 36,
                                        px: 0.5,
                                        fontWeight: 600,
                                        bgcolor: active ? brand.red : '#fff',
                                        color: active ? '#fff' : brand.dark,
                                        transition: `background-color .3s ${ease}, color .3s ${ease}`,
                                        '&:hover': { bgcolor: active ? brand.red : 'rgba(224,20,59,.1)' },
                                    }}
                                />
                            );
                        })}
                    </Stack>

                    {posts.length === 0 ? (
                        <Launching />
                    ) : (
                        <>
                            {featured && <Featured post={featured} />}
                            {results.length === 0 && !featured ? (
                                <NoResults search={search} category={category} onClear={clear} />
                            ) : (
                                <>
                                    {filtering && (
                                        <Typography role="status" sx={{ fontFamily: monoFont, fontSize: 13, color: brand.ink, mb: 2 }}>
                                            {results.length} {results.length === 1 ? 'resultado' : 'resultados'}
                                        </Typography>
                                    )}
                                    <Grid container spacing={2}>
                                        {shown.map((post) => (
                                            <Grid key={post.slug} size={{ xs: 12, sm: 6, md: 4 }}>
                                                <PostCard post={post} />
                                            </Grid>
                                        ))}
                                    </Grid>
                                    {results.length > visible && (
                                        <Stack spacing={1} sx={{ alignItems: 'center', mt: 5 }}>
                                            <Button variant="outlined" size="large" onClick={() => setVisible((value) => value + PAGE_SIZE)} endIcon={<ArrowForwardIcon sx={{ transform: 'rotate(90deg)' }} />}>
                                                Carregar mais
                                            </Button>
                                            <Typography sx={{ fontSize: 13, color: brand.ink }}>
                                                Mostrando {shown.length} de {results.length}
                                            </Typography>
                                        </Stack>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </Container>
            </Box>
        </>
    );
}
