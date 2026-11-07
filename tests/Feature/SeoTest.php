<?php

namespace Tests\Feature;

use Illuminate\Testing\TestResponse;
use Tests\TestCase;

class SeoTest extends TestCase
{
    protected const APP_URL = 'https://www.fetech.systems';

    protected const SERVICES = ['websites', 'store', 'email', 'support'];

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
        config([
            'app.url' => self::APP_URL,
            'seo.blog_posts' => base_path('tests/Fixtures/blog/posts.json'),
        ]);
    }

    protected function production(): void
    {
        $this->app->detectEnvironment(fn () => 'production');
    }

    /** JSON-LD do <head>, já decodificado */
    protected function jsonLd(TestResponse $response): array
    {
        $this->assertMatchesRegularExpression('#<script type="application/ld\+json" nonce="[^"]+">#', $response->getContent());
        preg_match('#<script type="application/ld\+json"[^>]*>(.*?)</script>#s', $response->getContent(), $match);

        return json_decode($match[1], true, flags: JSON_THROW_ON_ERROR);
    }

    protected function types(array $jsonLd): array
    {
        return array_column($jsonLd['@graph'], '@type');
    }

    public function test_each_named_page_has_its_own_meta(): void
    {
        $this->production();

        foreach (config('seo.pages') as $name => $page) {
            $path = route($name, absolute: false);
            $canonical = self::APP_URL.($path === '/' ? '' : $path);

            $this->get($path)
                ->assertOk()
                ->assertSee('<title>'.e($page['title']).'</title>', false)
                ->assertSee('<meta name="description" content="'.e($page['description']).'">', false)
                ->assertSee('<link rel="canonical" href="'.$canonical.'">', false)
                ->assertSee('<meta property="og:url" content="'.$canonical.'">', false)
                ->assertSee('<meta property="og:image" content="'.self::APP_URL.'/assets/og/fetech-og.png">', false)
                ->assertSee('<meta property="og:image:width" content="1200">', false)
                ->assertSee('<meta name="robots" content="index,follow">', false)
                ->assertSee('<meta property="og:type" content="website">', false);
        }
    }

    public function test_meta_texts_fit_what_search_results_show(): void
    {
        foreach (config('seo.pages') as $name => $page) {
            $this->assertLessThanOrEqual(60, mb_strlen($page['title']), "Título de {$name}");
            $this->assertGreaterThanOrEqual(120, mb_strlen($page['description']), "Descrição de {$name}");
            $this->assertLessThanOrEqual(160, mb_strlen($page['description']), "Descrição de {$name}");
        }
    }

    public function test_html_is_portuguese(): void
    {
        $this->get('/')->assertSee('<html lang="pt-BR">', false);
    }

    public function test_canonical_ignores_query_string_and_request_host(): void
    {
        $this->production();

        $this->get('http://outro-host.test/criacao-de-sites?utm_source=teste')
            ->assertSee('<link rel="canonical" href="'.self::APP_URL.'/criacao-de-sites">', false)
            ->assertDontSee('outro-host.test');
    }

    public function test_unknown_url_is_404_and_not_indexed(): void
    {
        $this->production();

        foreach (['/pagina-que-nao-existe', '/blog/slug-que-nao-existe'] as $path) {
            $this->get($path)
                ->assertNotFound()
                ->assertSee('<title>Página não encontrada – Fetech</title>', false)
                ->assertSee('<meta name="robots" content="noindex,follow">', false)
                ->assertDontSee('rel="canonical"', false)
                ->assertSee('<div id="root"></div>', false);
        }
    }

    public function test_blog_post_has_article_meta(): void
    {
        $this->production();

        $response = $this->get('/blog/site-ou-loja-virtual')
            ->assertOk()
            ->assertSee('<title>Site institucional ou loja virtual: qual escolher? – Blog Fetech</title>', false)
            ->assertSee('<meta property="og:type" content="article">', false)
            ->assertSee('<meta property="article:published_time" content="2026-10-20">', false)
            ->assertSee('<meta property="og:image" content="'.self::APP_URL.'/assets/blog/site-ou-loja.png">', false)
            ->assertSee('<link rel="canonical" href="'.self::APP_URL.'/blog/site-ou-loja-virtual">', false);

        $graph = collect($this->jsonLd($response)['@graph']);
        $post = $graph->firstWhere('@type', 'BlogPosting');
        $this->assertSame('Site institucional ou loja virtual: qual escolher?', $post['headline']);
        $this->assertSame('2026-10-20', $post['datePublished']);
        $this->assertSame('Andre Ferreira', $post['author']['name']);
        $this->assertSame(self::APP_URL.'/blog/site-ou-loja-virtual', $post['mainEntityOfPage']);
        $this->assertSame(
            ['Início', 'Blog', 'Site institucional ou loja virtual: qual escolher?'],
            array_column($graph->firstWhere('@type', 'BreadcrumbList')['itemListElement'], 'name'),
        );
    }

    public function test_json_ld_is_valid_on_every_page(): void
    {
        $paths = [...array_map(fn ($name) => route($name, absolute: false), array_keys(config('seo.pages'))), '/blog/site-ou-loja-virtual', '/nao-existe'];

        foreach ($paths as $path) {
            $jsonLd = $this->jsonLd($this->get($path));
            $business = $jsonLd['@graph'][0];

            $this->assertSame('https://schema.org', $jsonLd['@context']);
            $this->assertSame('ProfessionalService', $business['@type'], $path);
            $this->assertSame('Maringá', $business['address']['addressLocality']);
            $this->assertSame(self::APP_URL.'/assets/logos/LogoFetech2.png', $business['logo']);
            $this->assertArrayNotHasKey('sameAs', $business, 'sameAs só aparece com redes sociais cadastradas');
        }
    }

    public function test_json_ld_types_per_page(): void
    {
        $this->assertContains('WebSite', $this->types($this->jsonLd($this->get('/'))));
        $this->assertNotContains('BreadcrumbList', $this->types($this->jsonLd($this->get('/'))));

        foreach (self::SERVICES as $name) {
            $graph = collect($this->jsonLd($this->get(route($name, absolute: false)))['@graph']);
            $service = $graph->firstWhere('@type', 'Service');

            $this->assertSame(config("seo.pages.{$name}.name"), $service['name']);
            $this->assertSame(self::APP_URL.'/#organizacao', $service['provider']['@id']);
            $this->assertSame([config('seo.pages.home.name'), config("seo.pages.{$name}.name")], array_column($graph->firstWhere('@type', 'BreadcrumbList')['itemListElement'], 'name'));
        }
    }

    public function test_post_text_cannot_close_the_script_tag(): void
    {
        $path = storage_path('framework/testing/posts-script.json');
        @mkdir(dirname($path), recursive: true);
        file_put_contents($path, json_encode([[
            'slug' => 'teste-script',
            'title' => 'Post </script><script>alert(1)</script>',
            'excerpt' => 'Resumo',
            'date' => '2026-11-01',
            'author' => ['name' => 'Fetech'],
        ]]));
        config(['seo.blog_posts' => $path]);

        $response = $this->get('/blog/teste-script')->assertOk();

        $this->assertStringNotContainsString('<script>alert(1)', $response->getContent());
        $this->assertSame('Post </script><script>alert(1)</script>', collect($this->jsonLd($response)['@graph'])->firstWhere('@type', 'BlogPosting')['headline']);
        unlink($path);
    }

    public function test_pages_are_not_indexed_outside_production(): void
    {
        $this->get('/criacao-de-sites')->assertSee('<meta name="robots" content="noindex,nofollow">', false);
    }

    public function test_frontend_receives_page_texts_from_the_server(): void
    {
        $this->production();

        preg_match('#window\.__SEO__ = (.*?);</script>#', $this->get('/')->getContent(), $match);
        $client = json_decode($match[1], true, flags: JSON_THROW_ON_ERROR);

        $this->assertSame(self::APP_URL, $client['url']);
        $this->assertSame(config('seo.pages.websites.title'), $client['pages']['websites']['title']);
        $this->assertSame('noindex,follow', $client['notFound']['robots']);
    }

    public function test_sitemap_lists_indexable_pages_and_posts(): void
    {
        $response = $this->get('/sitemap.xml')->assertOk();
        $this->assertStringStartsWith('application/xml', $response->headers->get('Content-Type'));

        $xml = simplexml_load_string($response->getContent());
        $this->assertNotFalse($xml, 'XML válido');
        $locs = array_map('strval', $xml->xpath('//*[local-name()="loc"]'));

        $this->assertContains(self::APP_URL, $locs);
        foreach (self::SERVICES as $name) {
            $this->assertContains(self::APP_URL.route($name, absolute: false), $locs);
        }
        $this->assertContains(self::APP_URL.'/blog', $locs);
        $this->assertContains(self::APP_URL.'/blog/site-ou-loja-virtual', $locs);
        $this->assertNotContains(self::APP_URL.'/orcamento-site', $locs);
        $this->assertStringContainsString('<lastmod>2026-10-20</lastmod>', $response->getContent());
    }

    public function test_robots_points_to_sitemap_in_production(): void
    {
        $this->production();

        $response = $this->get('/robots.txt')->assertOk();

        $this->assertStringStartsWith('text/plain', $response->headers->get('Content-Type'));
        $this->assertStringContainsString("Disallow: /api/\n", $response->getContent());
        $this->assertStringContainsString('Sitemap: '.self::APP_URL.'/sitemap.xml', $response->getContent());
    }

    public function test_robots_blocks_everything_outside_production(): void
    {
        $response = $this->get('/robots.txt')->assertOk();

        $this->assertStringContainsString("Disallow: /\n", $response->getContent());
        $this->assertStringNotContainsString('Sitemap:', $response->getContent());
    }
}
