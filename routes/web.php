<?php

use App\Http\Controllers\RobotsController;
use App\Http\Controllers\SitemapController;
use App\Support\BlogPosts;
use App\Support\Seo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Endereço antigo da home
Route::permanentRedirect('/fetech/index', '/');

Route::get('/sitemap.xml', SitemapController::class)->name('sitemap');
Route::get('/robots.txt', RobotsController::class)->name('robots');

// Páginas do frontend React: o Blade só entrega o shell da SPA, com a meta de cada rota (config/seo.php)
Route::view('/', 'app')->name('home');
Route::view('/blog', 'app')->name('blog');
Route::view('/orcamento-site', 'app')->name('quote');
Route::view('/criacao-de-sites', 'app')->name('websites');
Route::view('/loja-virtual', 'app')->name('store');
Route::view('/email-profissional', 'app')->name('email');
Route::view('/suporte-ti', 'app')->name('support');

// Post do blog com a meta dele; slug que não existe é 404, como qualquer endereço desconhecido
Route::get('/blog/{slug}', function (string $slug, BlogPosts $posts, Seo $seo) {
    $post = $posts->find($slug);

    return $post
        ? response()->view('app', ['seo' => $seo->post($post)])
        : response()->view('app', ['seo' => $seo->notFound()], 404);
})->where('slug', '[a-z0-9-]+')->name('blog.post');

// Qualquer outro endereço: o React mostra a página "não encontrada", mas a resposta sai como 404
// para buscadores e ferramentas não tratarem o endereço como página válida. Na API continua o 404 em JSON.
Route::fallback(function (Request $request, Seo $seo) {
    abort_if($request->is('api/*'), 404);

    return response()->view('app', ['seo' => $seo->notFound()], 404);
});
