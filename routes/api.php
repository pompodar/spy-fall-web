<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\PlayerController;
use App\Http\Controllers\GameRoomController;
use App\Http\Controllers\QuestionController;
use App\Http\Controllers\RoundController;
use App\Http\Controllers\ScoreController;

Route::resource('players', PlayerController::class);

Route::resource('game-rooms', GameRoomController::class);

Route::resource('questions', QuestionController::class);

Route::resource('rounds', RoundController::class);

Route::resource('scores', ScoreController::class);

Route::post('/create-game/{user_name}', [GameRoomController::class, 'create']);

Route::post('/join-game', [GameRoomController::class, 'join']);

Route::get('/game/{gameCode}/players', [PlayerController::class, 'getPlayersByGameCode']);

Route::delete('/game/{gameId}/{userName}/leave', [GameRoomController::class, 'leaveGame']);
