<?php

namespace App\Http\Controllers;

use App\Models\Player;
use Illuminate\Http\Request;
use App\Models\GameRoom;

class PlayerController extends Controller
{
    public function index()
    {
        return Player::all();
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'game_room_id' => 'required',
            'name' => 'required',
            'role' => 'required',
            'score' => 'nullable|integer',
        ]);

        return Player::create($validatedData);
    }

    public function show($id)
    {
        return Player::findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $validatedData = $request->validate([
            'game_room_id' => 'required',
            'name' => 'required',
            'role' => 'required',
            'score' => 'nullable|integer',
        ]);

        $player = Player::findOrFail($id);
        $player->update($validatedData);

        return $player;
    }

    public function destroy($id)
    {
        $player = Player::findOrFail($id);
        $player->delete();

        return response()->json(['message' => 'Player deleted successfully']);
    }

    public function getPlayersByGameCode(Request $request, $gameId)
    {
        $current_user = $request->user();

        $gameRoom = GameRoom::where('id', $gameId)->first();

        // If the game room doesn't exist, return an error response
        if (!$gameRoom) {
            return response()->json(['error' => 'Game room not found'], 404);
        }

        // Retrieve the round of the game room
        $round = $gameRoom->round;

        // Retrieve players based on the provided game code
        $players = Player::whereHas('gameRoom', function ($query) use ($gameId) {
            $query->where('game_room_id', $gameId);
        })->get();

        $players->transform(function ($player) use ($current_user) {
            if ($player->name === $current_user->name) {
                $player->makeVisible('location');
            } else {
                $player->makeHidden('location');
            }
            return $player;
        });

        // Return the players as JSON response
        return response()->json(['players' => $players, 'round' => $round]);

    }

    public function getAdmin(Request $request, $userName)
    {
        // Retrieve the player based on the provided username
        $player = Player::where('name', $userName)->first();
    
        // If the player doesn't exist, return an error response
        if (!$player) {
            return response()->json(['error' => 'Player not found'], 404);
        }
    
        // Check if the player is an administrator
        $isAdmin = $player->role === 'administrator';
    
        // Return whether the player is an administrator as a JSON response
        return response()->json(['isAdmin' => $isAdmin]);
    }
}
