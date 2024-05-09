<?php

namespace App\Http\Controllers;

use App\Models\Round;
use Illuminate\Http\Request;

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

    public function startNewRound(Request $request, $gameId)
    {
        // Logic to start a new round...
        
        // Generate a set of locations for the round (excluding the spy location)
        $locations = $this->generateRoundLocations();
        
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
        
        // Return the updated players with their assigned locations
        return response()->json($players);
    }

    private function generateRoundLocations()
    {
        // Define the list of regular locations (excluding the spy location)
        $locations = ['Casino', 'Space Station', 'Traveling Circus', 'Pirate Ship', 'Beach'];

        // Shuffle the list of locations to randomize them
        shuffle($locations);

        return $locations;
    }

}
