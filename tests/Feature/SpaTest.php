<?php

namespace Tests\Feature;

use Tests\TestCase;

class SpaTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
    }

    public function test_home_renders_react_shell(): void
    {
        $this->get('/')
            ->assertOk()
            ->assertSee('<div id="root"></div>', false);
    }

    public function test_blog_renders_react_shell(): void
    {
        $this->get('/blog')->assertOk();
    }

    public function test_blog_post_renders_react_shell(): void
    {
        config(['seo.blog_posts' => base_path('tests/Fixtures/blog/posts.json')]);

        $this->get('/blog/site-ou-loja-virtual')
            ->assertOk()
            ->assertSee('<div id="root"></div>', false);
    }

    public function test_quote_page_renders_react_shell(): void
    {
        $this->get('/orcamento-site')
            ->assertOk()
            ->assertSee('<div id="root"></div>', false);
    }

    public function test_website_page_renders_react_shell(): void
    {
        $this->get('/criacao-de-sites')
            ->assertOk()
            ->assertSee('<div id="root"></div>', false);
    }

    public function test_store_page_renders_react_shell(): void
    {
        $this->get('/loja-virtual')
            ->assertOk()
            ->assertSee('<div id="root"></div>', false);
    }

    public function test_email_page_renders_react_shell(): void
    {
        $this->get('/email-profissional')
            ->assertOk()
            ->assertSee('<div id="root"></div>', false);
    }

    public function test_support_page_renders_react_shell(): void
    {
        $this->get('/suporte-ti')
            ->assertOk()
            ->assertSee('<div id="root"></div>', false);
    }

    public function test_public_pages_do_not_set_cookies(): void
    {
        config(['seo.blog_posts' => base_path('tests/Fixtures/blog/posts.json')]);

        $paths = [
            '/', '/blog', '/blog/site-ou-loja-virtual', '/orcamento-site', '/criacao-de-sites', '/loja-virtual',
            '/email-profissional', '/suporte-ti', '/pagina-que-nao-existe', '/sitemap.xml', '/robots.txt',
            '/fetech/index',
        ];

        foreach ($paths as $path) {
            $cookies = $this->get($path)->headers->getCookies();

            $this->assertSame([], $cookies, "{$path} gravou cookie: ".implode(', ', array_map(fn ($c) => $c->getName(), $cookies)));
        }
    }

    public function test_panel_still_sets_session_and_csrf_cookies(): void
    {
        $response = $this->get('/painel/login')->assertOk();

        $response->assertCookie(config('session.cookie'));
        $response->assertCookie('XSRF-TOKEN');
    }

    public function test_unknown_url_renders_react_shell_with_404_status(): void
    {
        $response = $this->get('/pagina-que-nao-existe')
            ->assertNotFound()
            ->assertSee('<div id="root"></div>', false);

        $this->assertStringContainsString("default-src 'self'", $response->headers->get('Content-Security-Policy'));
    }

    public function test_unknown_api_url_still_returns_json_404(): void
    {
        $this->get('/api/nao-existe')->assertNotFound()->assertHeader('Content-Type', 'application/json');
    }

    public function test_old_home_url_redirects_permanently(): void
    {
        $this->get('/fetech/index')->assertRedirect('/')->assertStatus(301);
    }

    public function test_html_responses_have_content_security_policy(): void
    {
        $csp = $this->get('/')->headers->get('Content-Security-Policy');

        $this->assertStringContainsString("default-src 'self'", $csp);
        $this->assertStringContainsString("frame-ancestors 'none'", $csp);
        $this->assertMatchesRegularExpression("/script-src 'self' 'nonce-[^']+'/", $csp);
    }

    public function test_panel_csp_allows_recaptcha_without_unsafe_scripts(): void
    {
        foreach (['/painel', '/painel/login', '/painel/dois-fatores', '/painel/clientes/1'] as $path) {
            $csp = $this->get($path)->assertOk()->headers->get('Content-Security-Policy');
            preg_match('/(?:^|; )script-src ([^;]+)/', $csp, $scripts);

            $this->assertStringContainsString('https://www.google.com/recaptcha/', $scripts[1]);
            $this->assertStringContainsString('https://www.gstatic.com/recaptcha/', $scripts[1]);
            $this->assertMatchesRegularExpression("/'nonce-[^']+'/", $scripts[1]);
            $this->assertStringNotContainsString("'unsafe-inline'", $scripts[1]);
            $this->assertStringNotContainsString("'unsafe-eval'", $scripts[1]);
            $this->assertStringContainsString("frame-src 'self' https://www.google.com/recaptcha/ https://recaptcha.google.com/recaptcha/", $csp);
            $this->assertStringContainsString("connect-src 'self' https://www.google.com/recaptcha/", $csp);
            $this->assertStringContainsString("frame-ancestors 'none'", $csp);
        }
    }

    public function test_public_csp_does_not_allow_recaptcha(): void
    {
        foreach (['/' => 200, '/blog' => 200, '/painel-publico' => 404] as $path => $status) {
            $csp = $this->get($path)->assertStatus($status)->headers->get('Content-Security-Policy');

            $this->assertStringNotContainsString('google.com', $csp);
            $this->assertStringNotContainsString('gstatic.com', $csp);
            $this->assertStringContainsString("default-src 'self'", $csp);
        }
    }

    public function test_web_routes_are_rate_limited_per_ip(): void
    {
        config(['security.rate_limits.web' => 3]);

        for ($i = 0; $i < 3; $i++) {
            $this->get('/')->assertOk();
        }

        $this->get('/')->assertTooManyRequests()->assertHeader('Retry-After');

        // Outro IP continua sendo atendido normalmente
        $this->withServerVariables(['REMOTE_ADDR' => '10.0.0.2'])->get('/')->assertOk();
    }
}
