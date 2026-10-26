<?php

use App\Http\Controllers\ContactController;
use Illuminate\Support\Facades\Route;

Route::post('/contato', [ContactController::class, 'store'])
    ->middleware('throttle:contact')
    ->name('contact.store');
