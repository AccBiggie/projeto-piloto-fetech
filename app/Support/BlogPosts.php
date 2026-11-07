<?php

namespace App\Support;

use Illuminate\Support\Facades\Cache;

/**
 * Posts do blog, lidos do mesmo JSON que o React usa (resources/content/blog/posts.json).
 * O PHP só precisa dos dados de capa (título, resumo, data, imagem) para a meta e o sitemap.
 */
class BlogPosts
{
    /** @return list<array<string, mixed>> */
    public function all(): array
    {
        $path = config('seo.blog_posts');
        if (! is_file($path)) {
            return [];
        }

        // A data de modificação entra na chave: publicar um post invalida o cache sozinho
        return Cache::remember('blog-posts:'.md5($path).':'.filemtime($path), now()->addDay(), function () use ($path) {
            return json_decode(file_get_contents($path), true, flags: JSON_THROW_ON_ERROR);
        });
    }

    /** @return array<string, mixed>|null */
    public function find(string $slug): ?array
    {
        return collect($this->all())->firstWhere('slug', $slug);
    }
}
