import CodeOutlinedIcon from '@mui/icons-material/CodeOutlined';
import MemoryOutlinedIcon from '@mui/icons-material/MemoryOutlined';
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';
import SportsEsportsOutlinedIcon from '@mui/icons-material/SportsEsportsOutlined';
import TipsAndUpdatesOutlinedIcon from '@mui/icons-material/TipsAndUpdatesOutlined';

// Conteúdo do blog. Enquanto a lista de posts estiver vazia, a página mostra o aviso de
// lançamento; para publicar, basta acrescentar um post em `posts` (o mais recente pode ficar em
// qualquer posição: a listagem ordena pela data).

export const categories = [
    { id: 'desenvolvimento', label: 'Desenvolvimento', Icon: CodeOutlinedIcon },
    { id: 'hardware', label: 'Hardware', Icon: MemoryOutlinedIcon },
    { id: 'inteligencia-artificial', label: 'Inteligência Artificial', Icon: PsychologyOutlinedIcon },
    { id: 'dicas', label: 'Dicas de TI', Icon: TipsAndUpdatesOutlinedIcon },
    { id: 'jogos', label: 'Jogos', Icon: SportsEsportsOutlinedIcon },
] as const;

export type CategoryId = (typeof categories)[number]['id'];

/** Blocos do corpo do post, na ordem em que aparecem */
export type PostBlock =
    | { type: 'p'; text: string }
    | { type: 'h2'; text: string }
    | { type: 'list'; items: string[] }
    | { type: 'quote'; text: string }
    | { type: 'img'; src: string; alt: string; caption?: string };

export interface Post {
    /** Endereço do post: /blog/<slug> */
    slug: string;
    title: string;
    excerpt: string;
    category: CategoryId;
    /** Data de publicação no formato AAAA-MM-DD */
    date: string;
    author: { name: string; role?: string };
    /** Imagem de capa em /public; sem ela, a capa é gerada com o ícone da categoria */
    cover?: string;
    /** Fonte ou crédito da notícia e das imagens */
    credit?: string;
    /** Fica em destaque no topo da listagem (vale o mais recente marcado) */
    featured?: boolean;
    content: PostBlock[];
}

export const posts: Post[] = [];

export const categoryOf = (id: CategoryId) => categories.find((category) => category.id === id) ?? categories[0];

export const isCategory = (value: string | null): value is CategoryId => categories.some((category) => category.id === value);

/** Mais recentes primeiro */
export const sortedPosts = () => [...posts].sort((a, b) => b.date.localeCompare(a.date));

export const findPost = (slug: string | undefined) => posts.find((post) => post.slug === slug);

// 200 palavras por minuto, contando título e corpo
export function readingMinutes(post: Post) {
    const text = [post.title, ...post.content.map((block) => (block.type === 'list' ? block.items.join(' ') : block.type === 'img' ? '' : block.text))].join(' ');
    return Math.max(1, Math.round(text.split(/\s+/).filter(Boolean).length / 200));
}

// "2026-10-28" -> "28 de out. de 2026", sem deslocar o dia pelo fuso
export const formatDate = (date: string) =>
    new Date(`${date}T12:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

/** Para comparar a busca sem diferenciar acentos e maiúsculas */
export const normalize = (value: string) =>
    value
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase();
