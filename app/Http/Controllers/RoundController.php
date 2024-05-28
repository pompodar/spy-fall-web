<?php

namespace App\Http\Controllers;

use App\Models\Round;
use Illuminate\Http\Request;
use App\Models\Player;
use App\Models\GameRoom;

class RoundController extends Controller
{
    public function index()
    {
        return Round::all();
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'game_room_id' => 'required',
            'round_number' => 'required|integer',
            'location' => 'required',
            'end_time' => 'nullable|date',
        ]);

        return Round::create($validatedData);
    }

    public function show($id)
    {
        return Round::findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $validatedData = $request->validate([
            'game_room_id' => 'required',
            'round_number' => 'required|integer',
            'location' => 'required',
            'end_time' => 'nullable|date',
        ]);

        $round = Round::findOrFail($id);
        $round->update($validatedData);

        return $round;
    }

    public function destroy($id)
    {
        $round = Round::findOrFail($id);
        $round->delete();

        return response()->json(['message' => 'Round deleted successfully']);
    }

    public function startNewRound(Request $request, $gameId, $userEmail, $round)
    {        
        $current_user_email = $request->user()?->email ?? $userEmail;
        
        // Generate a set of locations for the round (excluding the spy location)
        $locations = $this->generateRoundLocations();

        $game = GameRoom::where('id', $gameId)->first();

        // Update the round attribute
        $game->update(['round' => $round]);
        
        // Randomly choose one player as the spy
        $players = $game->players;
        $spyIndex = rand(0, count($players) - 1);

        $spy = $players[$spyIndex];
        $spy->update(['location' => 'Spy']);
        
        // Assign a regular location to each player for the round
        foreach ($players as $player) {
            if ($player->id !== $spy->id) {
                $location = array_shift($locations); // Get the next location from the list
                $player->update(['location' => $location]);
            }
        }

        $players->transform(function ($player) use ($current_user_email) {
            if ($player->email === $current_user_email) {
                $player->makeVisible('location');
            } else {
                $player->makeHidden('location');
            }
            return $player;
        });
        
        // Return the updated players with their assigned locations
        return response()->json(['players' => $players, 'round' => $round]);
    }

    private function generateRoundLocations()
    {
        // Define the list of regular locations (excluding the spy location)
        $locations = ['Казино', 'Космічна станція', 'Цирк', 'Піратський корабель', 'Пляж', 'Кінотеатр', 'Кімната'];

        // Shuffle the list of locations to randomize them
        shuffle($locations);

        return $locations;
    }

    public function getGameRound($gameId)
    {
        $gameRoom = GameRoom::where('id', $gameId)->first();

        // If the game room doesn't exist, return an error response
        if (!$gameRoom) {
            return response()->json(['error' => 'Game room not found'], 404);
        }

        // Retrieve the round of the game room
        $round = $gameRoom->round;

        // Return the players as JSON response
        return response()->json(['round' => $round]);

    }

}
