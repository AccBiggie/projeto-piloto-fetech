<?php

use App\Http\Controllers\ContactController;
use App\Http\Controllers\QuoteController;
use Illuminate\Support\Facades\Route;

Route::post('/contato', [ContactController::class, 'store'])
    ->middleware('throttle:contact')
    ->name('contact.store');

Route::post('/orcamento-site', [QuoteController::class, 'store'])
    ->middleware('throttle:contact')
    ->name('quote.store');
