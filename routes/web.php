<?php

use App\Http\Controllers\Panel\ClientController;
use App\Http\Controllers\Panel\SessionController;
use App\Http\Controllers\RobotsController;
use App\Http\Controllers\SitemapController;
use App\Http\Middleware\EnsureTwoFactorEnabled;
use App\Support\BlogPosts;
use App\Support\Seo;
use Illuminate\Foundation\Http\Middleware\PreventRequestForgery;
use Illuminate\Http\Request;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\Support\Facades\Route;
use Illuminate\View\Middleware\ShareErrorsFromSession;

// O site público não tem login nem formulário que use sessão (contato e orçamento vão pela /api), então não
// grava cookie nenhum no visitante. Sessão e cookie XSRF-TOKEN ficam só no painel. Ver a página /privacidade.
$withoutCookies = [StartSession::class, ShareErrorsFromSession::class, PreventRequestForgery::class];

Route::withoutMiddleware($withoutCookies)->group(function () {
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
});

// Painel administrativo (login com senha Argon2id + TOTP via Fortify, em /painel/login e /painel/two-factor-challenge).
// As telas são uma SPA à parte (resources/js/painel); o shell não traz dado nenhum, tudo passa pela API autenticada.
Route::prefix('painel')->name('painel.')->group(function () {
    Route::view('/', 'painel')->name('home');
    Route::view('/login', 'painel')->name('login');
    Route::view('/dois-fatores', 'painel')->name('two-factor');
    Route::view('/clientes/{client}', 'painel')->whereNumber('client')->name('client');

    Route::prefix('api')->middleware(['auth', 'throttle:painel'])->group(function () {
        Route::get('/sessao', SessionController::class)->name('session');

        Route::middleware(EnsureTwoFactorEnabled::class)->group(function () {
            Route::get('/clientes', [ClientController::class, 'index'])->name('clients.index');
            Route::post('/clientes', [ClientController::class, 'store'])->name('clients.store');
            Route::get('/clientes/{client}', [ClientController::class, 'show'])->name('clients.show');
            Route::put('/clientes/{client}', [ClientController::class, 'update'])->name('clients.update');
            Route::patch('/clientes/{client}/status', [ClientController::class, 'status'])->name('clients.status');
            Route::delete('/clientes/{client}', [ClientController::class, 'destroy'])->name('clients.destroy');
            Route::get('/clientes/{client}/estatisticas', [ClientController::class, 'stats'])->name('clients.stats');
        });
    });
});

// Qualquer outro endereço: o React mostra a página "não encontrada", mas a resposta sai como 404
// para buscadores e ferramentas não tratarem o endereço como página válida. Na API continua o 404 em JSON.
Route::fallback(function (Request $request, Seo $seo) {
    abort_if($request->is('api/*'), 404);

    return response()->view('app', ['seo' => $seo->notFound()], 404);
})->withoutMiddleware($withoutCookies);
