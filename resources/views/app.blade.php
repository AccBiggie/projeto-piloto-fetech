<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="Fetech: criação de sites, lojas virtuais, sistemas web, hospedagem e e-mail profissional, além de suporte e soluções em TI.">
    <title>{{ config('app.name') }} – Professional Hardware and Technology</title>
    <link rel="icon" href="/assets/logos/LogoHeader.png" type="image/png">
    @viteReactRefresh
    @vite('resources/js/main.tsx')
</head>
<body>
    <div id="root"></div>
</body>
</html>
