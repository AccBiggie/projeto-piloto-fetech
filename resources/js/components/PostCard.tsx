import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router';

import { categoryOf, type CategoryId, formatDate, type Post, readingMinutes } from '@/blog/posts';
import { brand, monoFont } from '@/theme';

const ease = 'cubic-bezier(.22,.61,.36,1)';

/** Capa do post: a imagem, se houver, ou o grafite da Fetech com o ícone da categoria */
export function PostCover({ post, category, height = 200, rounded = true }: { post?: Post; category: CategoryId; height?: number | object; rounded?: boolean }) {
    const { Icon, label } = categoryOf(category);
    return (
        <Box
            className="capa"
            sx={{
                position: 'relative',
                height,
                overflow: 'hidden',
                borderRadius: rounded ? 2 : 0,
                background: `radial-gradient(80% 90% at 100% 0%, rgba(224,20,59,.5), transparent 70%), linear-gradient(160deg, ${brand.graphiteLight}, ${brand.graphite} 70%)`,
                color: '#fff',
            }}
        >
            {post?.cover ? (
                <Box component="img" src={post.cover} alt="" loading="lazy" sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: `transform .5s ${ease}` }} />
            ) : (
                <>
                    <Icon aria-hidden="true" sx={{ position: 'absolute', right: -12, bottom: -18, fontSize: 150, opacity: 0.12 }} />
                    <Typography aria-hidden="true" sx={{ position: 'absolute', left: 16, bottom: 14, fontFamily: monoFont, fontSize: 13, opacity: 0.75 }}>
                        {`> ${label.toLowerCase()}`}
                    </Typography>
                </>
            )}
        </Box>
    );
}

export function CategoryTag({ category, dark }: { category: CategoryId; dark?: boolean }) {
    const { Icon, label } = categoryOf(category);
    return (
        <Box
            component="span"
            sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                px: 1,
                py: 0.25,
                borderRadius: 1,
                fontSize: 12,
                fontWeight: 600,
                color: dark ? '#fff' : brand.red,
                bgcolor: dark ? 'rgba(255,255,255,.12)' : 'rgba(224,20,59,.08)',
            }}
        >
            <Icon aria-hidden="true" sx={{ fontSize: 14 }} />
            {label}
        </Box>
    );
}

/** Data e tempo de leitura */
export function PostMeta({ post, color = brand.ink }: { post: Post; color?: string }) {
    return (
        <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5, flexWrap: 'wrap', fontSize: 13, color }}>
            <Box component="time" dateTime={post.date}>
                {formatDate(post.date)}
            </Box>
            <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                <AccessTimeIcon aria-hidden="true" sx={{ fontSize: 14 }} /> {readingMinutes(post)} min de leitura
            </Box>
        </Stack>
    );
}

export function Avatar({ name, size = 32 }: { name: string; size?: number }) {
    const initials = name
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase();
    return (
        <Box aria-hidden="true" sx={{ width: size, height: size, flexShrink: 0, borderRadius: '50%', bgcolor: brand.red, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: size * 0.4 }}>
            {initials}
        </Box>
    );
}

/** Card da listagem. O card inteiro é o link para o post. */
export default function PostCard({ post }: { post: Post }) {
    return (
        <Box
            component={RouterLink}
            to={`/blog/${post.slug}`}
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                p: 1.5,
                borderRadius: 2.5,
                bgcolor: '#fff',
                color: brand.dark,
                textDecoration: 'none',
                boxShadow: '0 .5rem 1rem rgba(0,0,0,.06)',
                border: '1px solid transparent',
                transition: `transform .35s ${ease}, box-shadow .35s ${ease}, border-color .35s ${ease}`,
                '&:hover, &:focus-visible': {
                    transform: 'translateY(-4px)',
                    borderColor: brand.red,
                    boxShadow: '0 1rem 2rem rgba(224,20,59,.14)',
                    '& .capa img': { transform: 'scale(1.04)' },
                    '& .ler svg': { transform: 'translateX(4px)' },
                },
                '&:focus-visible': { outline: `2px solid ${brand.red}`, outlineOffset: 3 },
                '@media (prefers-reduced-motion: reduce)': { '&, & .capa img, & .ler svg': { transition: 'none' }, '&:hover, &:focus-visible': { transform: 'none' } },
            }}
        >
            <PostCover post={post} category={post.category} height={180} />
            <Box sx={{ px: 1, pt: 2, pb: 1, display: 'flex', flexDirection: 'column', flex: 1 }}>
                <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
                    <CategoryTag category={post.category} />
                    <PostMeta post={post} />
                </Stack>
                <Typography variant="h6" component="h3" sx={{ fontSize: 19, lineHeight: 1.3, mb: 1 }}>
                    {post.title}
                </Typography>
                <Typography sx={{ color: brand.ink, fontSize: 15, mb: 2, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{post.excerpt}</Typography>
                <Stack direction="row" sx={{ mt: 'auto', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                    <Stack direction="row" sx={{ alignItems: 'center', gap: 1, minWidth: 0 }}>
                        <Avatar name={post.author.name} size={28} />
                        <Typography sx={{ fontSize: 13, fontWeight: 600 }} noWrap>
                            {post.author.name}
                        </Typography>
                    </Stack>
                    <Box component="span" className="ler" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, color: brand.red, fontWeight: 600, fontSize: 14, flexShrink: 0, '& svg': { transition: `transform .35s ${ease}` } }}>
                        Ler <ArrowForwardIcon sx={{ fontSize: 16 }} />
                    </Box>
                </Stack>
            </Box>
        </Box>
    );
}
