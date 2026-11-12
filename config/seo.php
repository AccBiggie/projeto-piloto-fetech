<?php

/*
 * Meta de cada página, gerada no servidor (Blade) para buscadores e prévias de link lerem sem
 * rodar JavaScript. As chaves de "pages" são os nomes das rotas em routes/web.php; o React recebe
 * esses mesmos textos (window.__SEO__) para atualizar a aba ao navegar sem recarregar.
 *
 * Títulos com até ~60 caracteres e descrições entre 120 e 160, o que o Google mostra sem cortar.
 */
return [
    'site_name' => 'Fetech',
    'default_image' => '/assets/og/fetech-og.png',
    'default_image_size' => [1200, 630],
    'logo' => '/assets/logos/LogoFetech2.png',
    'locale' => 'pt_BR',

    // %s é o título do post
    'post_title' => '%s – Blog Fetech',

    // Posts do blog, lidos também pelo React (resources/js/blog/posts.ts)
    'blog_posts' => resource_path('content/blog/posts.json'),

    'business' => [
        'name' => 'Fetech',
        'telephone' => '+55 44 99883-3731',
        'email' => 'fetech.ferreira@gmail.com',
        'street' => 'Rua Osvaldo Cruz, 317, apto 201',
        'city' => 'Maringá',
        'region' => 'PR',
        'postal_code' => '87020-200',
        'country' => 'BR',
        'same_as' => [], // preencher quando as redes sociais existirem (hoje são "#" no Footer)
    ],

    // "name" é o nome curto usado na trilha (breadcrumb) e no JSON-LD; "service" marca as páginas de serviço
    'pages' => [
        'home' => [
            'name' => 'Início',
            'title' => 'Fetech – Sites, Lojas Virtuais e Suporte em TI em Maringá',
            'description' => 'Criamos sites, lojas virtuais e sistemas web, com hospedagem, e-mail profissional e suporte em TI para empresas de Maringá e região.',
        ],
        'websites' => [
            'name' => 'Criação de Sites',
            'service' => true,
            'title' => 'Criação de Sites em Maringá – Fetech',
            'description' => 'Sites institucionais e landing pages sob medida, rápidos em qualquer tela e prontos para aparecer no Google. Você acompanha cada etapa até o site no ar.',
        ],
        'store' => [
            'name' => 'Loja Virtual',
            'service' => true,
            'title' => 'Loja Virtual – Fetech',
            'description' => 'Loja virtual completa para pequenos e médios negócios venderem pela internet, com catálogo, carrinho, pagamento, frete e painel para acompanhar pedidos.',
        ],
        'email' => [
            'name' => 'E-mail Profissional',
            'service' => true,
            'title' => 'E-mail Profissional – Fetech',
            'description' => 'E-mail com o domínio da sua empresa, caixa de entrada protegida contra spam e golpes e tudo sincronizado no celular e no computador. A Fetech configura.',
        ],
        'support' => [
            'name' => 'Suporte e Soluções em TI',
            'service' => true,
            'title' => 'Suporte e Soluções em TI em Maringá – Fetech',
            'description' => 'Conserto, manutenção e upgrade de computadores e notebooks, redes e suporte em TI para empresas e residências, com diagnóstico e orçamento antes do serviço.',
        ],
        'blog' => [
            'name' => 'Blog',
            'title' => 'Blog – Fetech',
            'description' => 'Dicas de TI, hardware, desenvolvimento e inteligência artificial para o seu negócio, contadas por quem coloca a mão no código e no equipamento.',
        ],
        'quote' => [
            'name' => 'Orçamento',
            'title' => 'Orçamento – Fetech',
            'description' => 'Peça um orçamento de site, loja virtual ou sistema web em poucos passos: conte como é o seu projeto e a Fetech prepara a proposta com base nas respostas.',
        ],
        'privacy' => [
            'name' => 'Privacidade',
            'title' => 'Política de Privacidade – Fetech',
            'description' => 'Como a Fetech trata os dados de quem visita o site ou pede um orçamento: o que é coletado, para quê, por quanto tempo e como exercer seus direitos pela LGPD.',
        ],
    ],

    // Endereço inexistente: não entra no índice e não tem canonical
    'not_found' => [
        'title' => 'Página não encontrada – Fetech',
        'description' => 'O endereço pode ter sido digitado errado ou a página mudou de lugar.',
        'robots' => 'noindex,follow',
    ],

    // Páginas que ficam fora do sitemap (continuam indexáveis)
    'sitemap_exclude' => ['quote'],
];
