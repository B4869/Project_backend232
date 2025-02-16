<?php

use App\Http\Controllers\ChatController;
use App\Http\Controllers\FontendController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Route::get('/', function () {
//     return Inertia::render('Welcome', [
//         'canLogin' => Route::has('login'),
//         'canRegister' => Route::has('register'),
//         'laravelVersion' => Application::VERSION,
//         'phpVersion' => PHP_VERSION,
//     ]);
// });

// Route::get('/dashboard', function () {
//     return Inertia::render('Dashboard');
// })->middleware(['auth', 'verified'])->name('dashboard');

// Route::middleware('auth')->group(function () {
//     Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
//     Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
//     Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
// });

Route::get('/', function () {
    return Inertia::render('Homepage');
})->name('home');

Route::middleware('auth')->group(function () {
    
    // fontend controller
    Route::get('/chat', [FontendController::class, 'chatIndex'])->name('chat.index');
    Route::get('/upload_data', [FontendController::class, 'uploadDataIndex'])->name('upload_data.index');

    // backend controller
    Route::post('/chat/ask', [ChatController::class, 'ask'])->name('chat.ask');
    Route::post('/upload_data/store', [FontendController::class, 'uploadDataStore'])->name('upload_data.store');
});

require __DIR__ . '/auth.php';
