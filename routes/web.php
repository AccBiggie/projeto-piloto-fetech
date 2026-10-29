<?php

use Illuminate\Support\Facades\Route;

// Endereço antigo da home
Route::permanentRedirect('/fetech/index', '/');

// Páginas do frontend React: o Blade só entrega o shell da SPA
Route::view('/', 'app')->name('home');
Route::view('/blog', 'app')->name('blog');
Route::view('/orcamento-site', 'app')->name('quote');
Route::view('/criacao-de-sites', 'app')->name('websites');
