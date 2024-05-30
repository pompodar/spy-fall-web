<?php

namespace App\Http\Controllers;

use App\Models\GameRoom;
use App\Models\Player;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;

class GameRoomController extends Controller
{
    public function index()
    {
        return GameRoom::all();
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'code' => 'required|unique:game_rooms',
        ]);

        return GameRoom::create($validatedData);
    }

    public function show($id)
    {
        return GameRoom::findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $validatedData = $request->validate([
            'code' => 'required|unique:game_rooms,code,'.$id,
        ]);

        $gameRoom = GameRoom::findOrFail($id);
        $gameRoom->update($validatedData);

        return $gameRoom;
    }

    public function destroy($id)
    {
        $gameRoom = GameRoom::findOrFail($id);
        $gameRoom->delete();

        return response()->json(['message' => 'Game Room deleted successfully']);
    }

    public function create($user_email, Request $request)
    {
        // Check if the user is already associated with a game
        $existingPlayer = Player::where('email', $user_email)->first();

        if ($existingPlayer) {
            $gameRoomCode = $existingPlayer->gameRoom->code;
            
            return response()->json(['error' => 'You are already in a game', 'game_code' => $gameRoomCode], 403);
        }

        $user = User::where('email', $user_email)->first();

        // Generate a random game code (you can customize this as needed)
        $gameCode = strtoupper(Str::random(6));

        // Create a new game with the generated game code
        $game = GameRoom::create([
            'code' => $gameCode,
            // Add any other game data you need to store
        ]);

        $game = GameRoom::where('code', $gameCode)->first();

        // If the game does not exist, return an error response
        if (!$game) {
            return response()->json(['error' => 'Game not found'], 404);
        }

        // Create a new player for the game
        $player = Player::create([
            'game_room_id' => $game->id,
            'email' => $user_email,
            'name' => $user->name,
            'role' => 'administrator',
        ]);

        // Return the game code
        return response()->json(['gameId' => $game->id, 'gameCode' => $game->code, $player], 201);
    }

    public function join(Request $request)
    {
        $request->validate([
            'gameCode' => 'required|exists:game_rooms,code',
            'userEmail' => 'required'
        ]);

        $game = GameRoom::where('code', $request->input('gameCode'))->first();

        // If the game does not exist, return an error response
        if (!$game) {
            return response()->json(['error' => 'Game not found'], 404);
        }

        // Check if the user is already associated with a game
        $existingPlayer = Player::where('email', $request->input('userEmail'))->first();

        $user = User::where('email', $request->input('userEmail'))->first();
        
        if (!$existingPlayer) {
            // Create a new player for the game
            $player = Player::create([
                'game_room_id' => $game->id,
                'email' => $request->input('userEmail'),
                'name' => $user->name,
                'role' => 'guest',
            ]);


            // Return the player information
            return response()->json(['gameId' => $game->id, 'gameCode' => $game->code, 'existing_player' => true], 201);
        } else {
            if ($existingPlayer->game_room_id == $game->id) {

                // Return the player information
                return response()->json(['gameId' => $game->id, 'gameCode' => $game->code, 'existing_player' => false], 201);
            } else {
                return response()->json(['error' => 'You are still in another game. First leave it and you can join this one.', 'already in another game' => true ], 403);
            }
        }
    }

    public function leaveGame($gameId, $userEmail)
    {

        $player = Player::where('game_room_id', $gameId)->where('email', $userEmail)->first();
        
        if ($player) {
            $player->delete();

            // Check if the game has no more players
            $remainingPlayers = Player::where('game_room_id', $gameId)->count();
            if ($remainingPlayers === 0) {
                // Delete the game room if there are no remaining players
                GameRoom::where('id', $gameId)->delete();
                return response()->json(['message' => 'Game deleted successfully'], 200);
            }

            return response()->json(['message' => 'Left the game successfully'], 200);

        } else {
            // Player not found or not in the game
            return response()->json(['error' => 'Player not found or not in the game'], 404);
        }
    }

}
