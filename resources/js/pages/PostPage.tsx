import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FacebookIcon from '@mui/icons-material/Facebook';
import LinkIcon from '@mui/icons-material/Link';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router';

import { findPost, type Post, type PostBlock, sortedPosts } from '@/blog/posts';
import PostCard, { Avatar, CategoryTag, PostCover, PostMeta } from '@/components/PostCard';
import { graphiteGlow, usePageTitle } from '@/components/ServiceSections';
import { brand, monoFont } from '@/theme';

// Leitura de um post: barra de progresso da leitura, corpo em blocos, compartilhamento e posts
// relacionados da mesma categoria.

// Barra fina no topo da tela que acompanha a rolagem do texto
function ReadingProgress() {
    const [progress, setProgress] = useState(0);
    useEffect(() => {
        let frame = 0;
        const measure = () => {
            frame = 0;
            const max = document.documentElement.scrollHeight - window.innerHeight;
            setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
        };
        const onScroll = () => {
            if (!frame) frame = requestAnimationFrame(measure);
        };
        measure();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
        return () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
            if (frame) cancelAnimationFrame(frame);
        };
    }, []);
    return (
        <Box aria-hidden="true" sx={{ position: 'fixed', top: 0, left: 0, right: 0, height: 3, zIndex: (theme) => theme.zIndex.appBar + 1 }}>
            <Box sx={{ height: '100%', width: '100%', bgcolor: brand.red, transformOrigin: 'left', transform: `scaleX(${progress})` }} />
        </Box>
    );
}

function Block({ block }: { block: PostBlock }) {
    switch (block.type) {
        case 'h2':
            return (
                <Typography variant="h5" component="h2" sx={{ fontSize: { xs: 22, md: 26 }, mt: 5, mb: 2 }}>
                    {block.text}
                </Typography>
            );
        case 'list':
            return (
                <Box component="ul" sx={{ pl: 3, mb: 3, '& li': { mb: 1, '&::marker': { color: brand.red } } }}>
                    {block.items.map((item) => (
                        <li key={item}>{item}</li>
                    ))}
                </Box>
            );
        case 'quote':
            return (
                <Box component="blockquote" sx={{ m: 0, my: 4, pl: 3, borderLeft: `4px solid ${brand.red}`, fontSize: 20, fontStyle: 'italic', color: brand.dark }}>
                    {block.text}
                </Box>
            );
        case 'img':
            return (
                <Box component="figure" sx={{ m: 0, my: 4 }}>
                    <Box component="img" src={block.src} alt={block.alt} loading="lazy" sx={{ width: '100%', borderRadius: 2, display: 'block' }} />
                    {block.caption && <Typography component="figcaption" sx={{ mt: 1, fontSize: 13, color: brand.ink, textAlign: 'center' }}>{block.caption}</Typography>}
                </Box>
            );
        default:
            return <Typography sx={{ mb: 2.5 }}>{block.text}</Typography>;
    }
}

function Share({ post }: { post: Post }) {
    const [copied, setCopied] = useState(false);
    const url = window.location.href;
    const text = encodeURIComponent(`${post.title} ${url}`);
    const links = [
        { label: 'Compartilhar no WhatsApp', href: `https://wa.me/?text=${text}`, Icon: WhatsAppIcon },
        { label: 'Compartilhar no LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, Icon: LinkedInIcon },
        { label: 'Compartilhar no Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, Icon: FacebookIcon },
    ];
    const copy = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
        } catch {
            window.prompt('Copie o link do post:', url);
        }
    };
    const buttonSx = { color: brand.dark, bgcolor: '#fff', border: `1px solid ${brand.section}`, '&:hover': { bgcolor: brand.red, color: '#fff' } } as const;
    return (
        <Stack direction="row" sx={{ alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Typography sx={{ fontFamily: monoFont, fontSize: 13, color: brand.ink, mr: 1 }}>compartilhar</Typography>
            {links.map(({ label, href, Icon }) => (
                <Tooltip key={label} title={label}>
                    <IconButton component="a" href={href} target="_blank" rel="noopener noreferrer" aria-label={label} sx={buttonSx}>
                        <Icon fontSize="small" />
                    </IconButton>
                </Tooltip>
            ))}
            <Tooltip title="Copiar link">
                <IconButton onClick={copy} aria-label="Copiar link" sx={buttonSx}>
                    <LinkIcon fontSize="small" />
                </IconButton>
            </Tooltip>
            <Snackbar open={copied} autoHideDuration={2500} onClose={() => setCopied(false)} message="Link copiado" anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
        </Stack>
    );
}

function MissingPost() {
    usePageTitle('Post não encontrado – Fetech');
    return (
        <Container maxWidth="md" sx={{ py: 10 }}>
            <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center' }}>
                <SearchOffIcon color="primary" sx={{ fontSize: 64 }} />
                <Typography variant="h4" component="h1">
                    Post não encontrado
                </Typography>
                <Typography color="text.secondary">O endereço pode ter mudado ou o post ainda não foi publicado.</Typography>
                <Button variant="contained" component={RouterLink} to="/blog" startIcon={<ArrowBackIcon />}>
                    Voltar para o blog
                </Button>
            </Stack>
        </Container>
    );
}

function Article({ post }: { post: Post }) {
    usePageTitle(`${post.title} – Blog Fetech`);
    const related = sortedPosts()
        .filter((other) => other.category === post.category && other.slug !== post.slug)
        .slice(0, 3);

    // Ao trocar de post pelos relacionados, a leitura começa do topo
    useEffect(() => window.scrollTo(0, 0), [post.slug]);

    return (
        <>
            <ReadingProgress />
            <Box component="header" sx={{ color: '#fff', background: graphiteGlow('100% 0%'), pt: { xs: 6, md: 9 }, pb: { xs: 12, md: 16 } }}>
                <Container maxWidth="md">
                    <Button component={RouterLink} to="/blog" color="inherit" startIcon={<ArrowBackIcon />} sx={{ px: 0, mb: 3, opacity: 0.75, '&:hover': { opacity: 1, bgcolor: 'transparent' } }}>
                        Blog
                    </Button>
                    <Stack direction="row" sx={{ gap: 1.5, alignItems: 'center', flexWrap: 'wrap', mb: 2 }}>
                        <CategoryTag category={post.category} dark />
                        <PostMeta post={post} color="rgba(255,255,255,.7)" />
                    </Stack>
                    <Typography variant="h2" component="h1" sx={{ fontSize: { xs: 30, md: 44 }, lineHeight: 1.2, mb: 3 }}>
                        {post.title}
                    </Typography>
                    <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5 }}>
                        <Avatar name={post.author.name} size={40} />
                        <Box>
                            <Typography sx={{ fontWeight: 600 }}>{post.author.name}</Typography>
                            {post.author.role && <Typography sx={{ fontSize: 13, opacity: 0.7 }}>{post.author.role}</Typography>}
                        </Box>
                    </Stack>
                </Container>
            </Box>

            <Box component="article" sx={{ bgcolor: brand.sectionAlt, pb: { xs: 6, md: 10 } }}>
                <Container maxWidth="md">
                    <Box sx={{ mt: { xs: -8, md: -11 }, mb: { xs: 4, md: 6 }, boxShadow: '0 1.5rem 3rem rgba(0,0,0,.2)', borderRadius: 3, overflow: 'hidden' }}>
                        <PostCover post={post} category={post.category} height={{ xs: 200, md: 380 }} rounded={false} />
                    </Box>
                    <Typography sx={{ fontSize: { xs: 18, md: 20 }, color: brand.dark, fontWeight: 500, mb: 4 }}>{post.excerpt}</Typography>
                    <Box sx={{ fontSize: { xs: 16, md: 18 }, lineHeight: 1.75, color: brand.ink, '& .MuiTypography-root:not(h2)': { fontSize: 'inherit', lineHeight: 'inherit' } }}>
                        {post.content.map((block, index) => (
                            <Block key={index} block={block} />
                        ))}
                    </Box>
                    {post.credit && <Typography sx={{ mt: 4, fontSize: 13, color: brand.ink }}>Fonte: {post.credit}</Typography>}
                    <Box sx={{ mt: 5, pt: 3, borderTop: `1px solid ${brand.section}` }}>
                        <Share post={post} />
                    </Box>
                </Container>
            </Box>

            {related.length > 0 && (
                <Box component="section" sx={{ bgcolor: brand.section, py: { xs: 6, md: 9 } }}>
                    <Container maxWidth="lg">
                        <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
                            Continue lendo
                        </Typography>
                        <Grid container spacing={2}>
                            {related.map((other) => (
                                <Grid key={other.slug} size={{ xs: 12, sm: 6, md: 4 }}>
                                    <PostCard post={other} />
                                </Grid>
                            ))}
                        </Grid>
                    </Container>
                </Box>
            )}
        </>
    );
}

export default function PostPage() {
    const { slug } = useParams();
    const post = findPost(slug);
    return post ? <Article post={post} /> : <MissingPost />;
}
