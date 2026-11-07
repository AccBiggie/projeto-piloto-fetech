<?php

namespace App\Http\Controllers;

use App\Support\BlogPosts;
use App\Support\Seo;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    public function __invoke(Seo $seo, BlogPosts $posts): Response
    {
        $urls = collect(config('seo.pages'))
            ->keys()
            ->reject(fn (string $name) => in_array($name, config('seo.sitemap_exclude'), true))
            ->map(fn (string $name) => ['loc' => $seo->url(route($name, absolute: false)), 'lastmod' => null])
            ->concat(collect($posts->all())->map(fn (array $post) => [
                'loc' => $seo->url(route('blog.post', ['slug' => $post['slug']], absolute: false)),
                'lastmod' => $post['date'],
            ]));

        // A declaração fica fora do Blade, que interpreta "<?" como abertura de PHP
        $xml = '<?xml version="1.0" encoding="UTF-8"?>'."\n".view('sitemap', ['urls' => $urls])->render();

        return response($xml)->header('Content-Type', 'application/xml; charset=UTF-8');
    }
}
