<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Painel · FETECH</title>
    <meta name="robots" content="noindex, nofollow">
    <meta name="referrer" content="same-origin">
    <meta name="theme-color" content="#1c1c1f">
    <meta name="recaptcha-site-key" content="{{ config('services.recaptcha.site_key') }}">
    <meta name="csp-nonce" content="{{ Illuminate\Support\Facades\Vite::cspNonce() }}">
    <link rel="icon" href="/favicon.ico" sizes="any">
    @viteReactRefresh
    @vite('resources/js/painel/main.tsx')
</head>
<body>
    <div id="root"></div>
</body>
</html>
