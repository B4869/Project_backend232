<?php

use App\Http\Controllers\ChatController;
use App\Http\Controllers\FontendController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Homepage');
})->name('home');

Route::middleware('auth')->group(function () {

    // fontend controller
    Route::get('/chat', [FontendController::class, 'chatIndex'])->name('chat.index');
    Route::get('/admin', [FontendController::class, 'adminIndex'])->name('admin.index');

    // backend controller
    Route::post('/chat/ask', [ChatController::class, 'ask'])->name('chat.ask');
    Route::get('/chat/history/{historyId?}', [ChatController::class, 'getHistory'])->name('chat.history');
    Route::post('/chat/new', [ChatController::class, 'createNewChat'])->name('chat.new');
    Route::get('/chat/histories', [ChatController::class, 'getUserChatHistories'])->name('chat.histories');
    Route::delete('/chat/{id}', [ChatController::class, 'delete'])->name('chat.delete');

    Route::post('/upload_data/store', [FontendController::class, 'uploadDataStore'])->name('upload_data.store');
    Route::put('/rule-bases/{id}', [FontendController::class, 'updateRuleBase'])->name('rule_bases.update');
    Route::delete('/rule-bases/{id}', [FontendController::class, 'destroyRuleBase'])->name('rule_bases.destroy');
    Route::post('/rule-bases', [FontendController::class, 'storeRuleBase'])->name('rule_bases.store');
});

require __DIR__ . '/auth.php';
