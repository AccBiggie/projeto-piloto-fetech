<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $seo['title'] }}</title>
    <meta name="description" content="{{ $seo['description'] }}">
    <meta name="robots" content="{{ $seo['robots'] }}">
@if ($seo['canonical'])
    <link rel="canonical" href="{{ $seo['canonical'] }}">
@endif
    <meta name="theme-color" content="#e0143b">

    <meta property="og:type" content="{{ $seo['type'] }}">
    <meta property="og:site_name" content="{{ $seo['site_name'] }}">
    <meta property="og:locale" content="{{ $seo['locale'] }}">
    <meta property="og:title" content="{{ $seo['title'] }}">
    <meta property="og:description" content="{{ $seo['description'] }}">
@if ($seo['canonical'])
    <meta property="og:url" content="{{ $seo['canonical'] }}">
@endif
    <meta property="og:image" content="{{ $seo['image'] }}">
@if ($seo['image_width'])
    <meta property="og:image:width" content="{{ $seo['image_width'] }}">
    <meta property="og:image:height" content="{{ $seo['image_height'] }}">
@endif
@if ($seo['published_time'])
    <meta property="article:published_time" content="{{ $seo['published_time'] }}">
@endif
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{{ $seo['title'] }}">
    <meta name="twitter:description" content="{{ $seo['description'] }}">
    <meta name="twitter:image" content="{{ $seo['image'] }}">

    <link rel="icon" href="/favicon.ico" sizes="any">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">

    {{-- JSON gerado com JSON_HEX_TAG (App\Support\Seo::json): o conteúdo não consegue fechar a tag --}}
    <script type="application/ld+json" nonce="{{ Vite::cspNonce() }}">{!! $seo['json_ld'] !!}</script>
    <script nonce="{{ Vite::cspNonce() }}">window.__SEO__ = {!! $seoClient !!};</script>
    @viteReactRefresh
    @vite('resources/js/main.tsx')
</head>
<body>
    <div id="root"></div>
</body>
</html>
