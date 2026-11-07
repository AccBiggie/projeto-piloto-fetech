<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Endereço antigo da home
Route::permanentRedirect('/fetech/index', '/');

// Páginas do frontend React: o Blade só entrega o shell da SPA
Route::view('/', 'app')->name('home');
Route::view('/blog', 'app')->name('blog');
Route::view('/blog/{slug}', 'app')->where('slug', '[a-z0-9-]+')->name('blog.post');
Route::view('/orcamento-site', 'app')->name('quote');
Route::view('/criacao-de-sites', 'app')->name('websites');
Route::view('/loja-virtual', 'app')->name('store');
Route::view('/email-profissional', 'app')->name('email');
Route::view('/suporte-ti', 'app')->name('support');

// Qualquer outro endereço: o React mostra a página "não encontrada", mas a resposta sai como 404
// para buscadores e ferramentas não tratarem o endereço como página válida. Na API continua o 404 em JSON.
Route::fallback(function (Request $request) {
    abort_if($request->is('api/*'), 404);

    return response()->view('app', status: 404);
});
