import { useEffect } from 'react';
import { useLocation } from 'react-router';

// Meta das páginas na navegação sem recarregar. Os textos vêm do servidor (config/seo.php), que os
// injeta em window.__SEO__ no app.blade.php: uma fonte só para o HTML inicial e para o React.

export type PageName = 'home' | 'websites' | 'store' | 'email' | 'support' | 'blog' | 'quote';

interface MetaText {
    title: string;
    description: string;
    robots: string;
}

declare global {
    interface Window {
        __SEO__?: {
            url: string;
            postTitle: string;
            robots: string;
            pages: Record<PageName, MetaText>;
            notFound: MetaText;
        };
    }
}

export interface PageMeta extends MetaText {
    /** Sem canonical (página não encontrada) */
    canonical: boolean;
}

const seo = window.__SEO__;

export const pageMeta = (name: PageName): PageMeta => ({ ...(seo?.pages[name] ?? emptyMeta), canonical: true });

export const postMeta = (post: { title: string; excerpt: string }): PageMeta => ({
    title: seo ? seo.postTitle.replace('%s', post.title) : post.title,
    description: post.excerpt,
    robots: seo?.robots ?? '',
    canonical: true,
});

export const notFoundMeta = (): PageMeta => ({ ...(seo?.notFound ?? emptyMeta), canonical: false });

const emptyMeta: MetaText = { title: '', description: '', robots: '' };

/** URL canônica do caminho, como o servidor gera: APP_URL + caminho, sem barra final */
const canonicalUrl = (pathname: string) => `${seo?.url}${pathname.replace(/\/+$/, '')}`;

/** Troca título, description, robots e canonical enquanto a página estiver aberta e restaura ao sair. */
export function usePageMeta({ title, description, robots, canonical }: PageMeta) {
    const { pathname } = useLocation();
    const href = canonical ? canonicalUrl(pathname) : null;

    useEffect(() => {
        if (!seo) return;
        const previousTitle = document.title;
        document.title = title;
        const restore = [
            setHeadTag('meta', ['name', 'description'], 'content', description),
            setHeadTag('meta', ['name', 'robots'], 'content', robots),
            setHeadTag('link', ['rel', 'canonical'], 'href', href),
        ];
        return () => {
            document.title = previousTitle;
            restore.forEach((undo) => undo());
        };
    }, [title, description, robots, href]);
}

// Define o atributo da tag do <head> (criando-a se faltar; null remove) e devolve como desfazer
function setHeadTag(tag: 'meta' | 'link', [key, keyValue]: [string, string], attribute: string, value: string | null) {
    const selector = `${tag}[${key}="${keyValue}"]`;
    const previous = document.head.querySelector(selector)?.getAttribute(attribute) ?? null;
    const apply = (next: string | null) => {
        let element = document.head.querySelector(selector);
        if (next === null) {
            element?.remove();
            return;
        }
        if (!element) {
            element = document.createElement(tag);
            element.setAttribute(key, keyValue);
            document.head.append(element);
        }
        element.setAttribute(attribute, next);
    };
    apply(value);
    return () => apply(previous);
}
