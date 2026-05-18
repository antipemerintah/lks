<?php

use Illuminate\Support\Facades\Route;
use App\Services\AIService;

Route::get('/', function () {
    return view('welcome');  // ← ganti ini
});

Route::get('/test-ai', function (AIService $ai) {
    return $ai->generateSQL('', '');
});