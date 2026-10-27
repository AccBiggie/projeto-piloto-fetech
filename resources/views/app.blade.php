<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="Fetech: assistência técnica em computadores, notebooks, periféricos e televisores.">
    <title>{{ config('app.name') }} – Professional Hardware and Technology</title>
    <link rel="icon" href="/assets/logos/LogoHeader.png" type="image/png">
    @viteReactRefresh
    @vite('resources/js/main.tsx')
</head>
<body>
    <div id="root"></div>
</body>
</html>
