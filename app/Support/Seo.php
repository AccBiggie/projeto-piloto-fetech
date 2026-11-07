<?php

namespace App\Support;

/**
 * Meta do <head> de cada página (title, description, canonical, Open Graph e JSON-LD), montada a
 * partir de config/seo.php. URLs absolutas saem sempre do APP_URL, nunca do Host da requisição.
 */
class Seo
{
    public function __construct(protected BlogPosts $posts) {}

    /** Página de uma rota nomeada; nome desconhecido cai na home. */
    public function page(?string $name): array
    {
        $name = $name !== null && config("seo.pages.{$name}") ? $name : 'home';
        $page = config("seo.pages.{$name}");
        $canonical = $this->url(route($name, absolute: false));

        $graph = [$this->organization()];
        if ($name === 'home') {
            $graph[] = [
                '@type' => 'WebSite',
                '@id' => $this->url('/').'/#website',
                'name' => config('seo.site_name'),
                'url' => $this->url('/'),
                'inLanguage' => 'pt-BR',
                'publisher' => ['@id' => $this->organizationId()],
            ];
        } else {
            $graph[] = $this->breadcrumbs([[$page['name'], $canonical]]);
        }
        if ($page['service'] ?? false) {
            $graph[] = [
                '@type' => 'Service',
                'name' => $page['name'],
                'description' => $page['description'],
                'url' => $canonical,
                'provider' => ['@id' => $this->organizationId()],
                'areaServed' => $this->areaServed(),
            ];
        }

        return $this->meta([
            'title' => $page['title'],
            'description' => $page['description'],
            'canonical' => $canonical,
            'robots' => $page['robots'] ?? null,
            'image' => $page['image'] ?? null,
        ], $graph);
    }

    /** @param array<string, mixed> $post */
    public function post(array $post): array
    {
        $canonical = $this->url(route('blog.post', ['slug' => $post['slug']], absolute: false));
        $image = $post['cover'] ?? null;

        return $this->meta([
            'title' => sprintf(config('seo.post_title'), $post['title']),
            'description' => $post['excerpt'],
            'canonical' => $canonical,
            'image' => $image,
            'type' => 'article',
            'published_time' => $post['date'],
        ], [
            $this->organization(),
            [
                '@type' => 'BlogPosting',
                'headline' => $post['title'],
                'description' => $post['excerpt'],
                'datePublished' => $post['date'],
                'author' => ['@type' => 'Person', 'name' => $post['author']['name']],
                'image' => $this->url($image ?? config('seo.default_image')),
                'mainEntityOfPage' => $canonical,
                'publisher' => ['@id' => $this->organizationId()],
            ],
            $this->breadcrumbs([
                [config('seo.pages.blog.name'), $this->url(route('blog', absolute: false))],
                [$post['title'], $canonical],
            ]),
        ]);
    }

    /** Endereço inexistente: fora do índice e sem canonical. */
    public function notFound(): array
    {
        return $this->meta([...config('seo.not_found'), 'canonical' => null], [$this->organization()]);
    }

    /** URL absoluta a partir do APP_URL, sem barra final (a home é o próprio APP_URL). */
    public function url(string $path): string
    {
        $path = trim(parse_url($path, PHP_URL_PATH) ?? '', '/');

        return rtrim(config('app.url'), '/').($path === '' ? '' : "/{$path}");
    }

    /** Fora de produção nada é indexado, para staging e ambiente local não aparecerem no Google. */
    public function robots(?string $robots = null): string
    {
        return app()->isProduction() ? ($robots ?? 'index,follow') : 'noindex,nofollow';
    }

    /**
     * Textos que o React usa ao navegar sem recarregar (window.__SEO__): mesma fonte do servidor.
     */
    public function client(): array
    {
        $pages = [];
        foreach (config('seo.pages') as $name => $page) {
            $pages[$name] = ['title' => $page['title'], 'description' => $page['description'], 'robots' => $this->robots($page['robots'] ?? null)];
        }
        $notFound = config('seo.not_found');

        return [
            'url' => rtrim(config('app.url'), '/'),
            'postTitle' => config('seo.post_title'),
            'robots' => $this->robots(),
            'pages' => $pages,
            'notFound' => ['title' => $notFound['title'], 'description' => $notFound['description'], 'robots' => $this->robots($notFound['robots'])],
        ];
    }

    /** JSON seguro para <script>: JSON_HEX_TAG troca "<" e ">", então "</script>" não fecha a tag. */
    public static function json(array $data): string
    {
        return json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_THROW_ON_ERROR);
    }

    /**
     * @param  array<string, mixed>  $meta
     * @param  list<array<string, mixed>>  $graph
     */
    protected function meta(array $meta, array $graph): array
    {
        $image = $meta['image'] ?? null;
        [$width, $height] = $image ? [null, null] : config('seo.default_image_size');

        return [
            'title' => $meta['title'],
            'description' => $meta['description'],
            'canonical' => $meta['canonical'],
            'robots' => $this->robots($meta['robots'] ?? null),
            'type' => $meta['type'] ?? 'website',
            'published_time' => $meta['published_time'] ?? null,
            'site_name' => config('seo.site_name'),
            'locale' => config('seo.locale'),
            'image' => $this->url($image ?? config('seo.default_image')),
            'image_width' => $width,
            'image_height' => $height,
            'json_ld' => self::json(['@context' => 'https://schema.org', '@graph' => $graph]),
        ];
    }

    protected function organizationId(): string
    {
        return $this->url('/').'/#organizacao';
    }

    protected function organization(): array
    {
        $business = config('seo.business');

        return array_filter([
            '@type' => 'ProfessionalService',
            '@id' => $this->organizationId(),
            'name' => $business['name'],
            'url' => $this->url('/'),
            'logo' => $this->url(config('seo.logo')),
            'image' => $this->url(config('seo.default_image')),
            'telephone' => $business['telephone'],
            'email' => $business['email'],
            'address' => [
                '@type' => 'PostalAddress',
                'streetAddress' => $business['street'],
                'addressLocality' => $business['city'],
                'addressRegion' => $business['region'],
                'postalCode' => $business['postal_code'],
                'addressCountry' => $business['country'],
            ],
            'areaServed' => $this->areaServed(),
            'sameAs' => $business['same_as'],
        ]);
    }

    protected function areaServed(): array
    {
        return ['@type' => 'City', 'name' => config('seo.business.city')];
    }

    /** @param list<array{0: string, 1: string}> $trail  Itens depois da home: [nome, url] */
    protected function breadcrumbs(array $trail): array
    {
        $items = [[config('seo.pages.home.name'), $this->url('/')], ...$trail];

        return [
            '@type' => 'BreadcrumbList',
            'itemListElement' => array_map(fn ($item, $index) => [
                '@type' => 'ListItem',
                'position' => $index + 1,
                'name' => $item[0],
                'item' => $item[1],
            ], $items, array_keys($items)),
        ];
    }
}
