<?php

namespace App\Http\Controllers;

use App\Support\Seo;
use Illuminate\Http\Response;

class RobotsController extends Controller
{
    public function __invoke(Seo $seo): Response
    {
        // Fora de produção (staging, local) os buscadores ficam de fora do site inteiro
        $rules = app()->isProduction()
            ? "User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ".$seo->url('/sitemap.xml')."\n"
            : "User-agent: *\nDisallow: /\n";

        return response($rules)->header('Content-Type', 'text/plain; charset=UTF-8');
    }
}
