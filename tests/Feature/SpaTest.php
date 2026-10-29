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
