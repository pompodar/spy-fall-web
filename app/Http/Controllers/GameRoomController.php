<?php

namespace App\Http\Controllers;

use App\Models\GameRoom;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

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

    public function create(Request $request)
    {
        // Generate a random game code (you can customize this as needed)
        $gameCode = strtoupper(Str::random(6));

        // Create a new game with the generated game code
        $game = GameRoom::create([
            'code' => $gameCode,
            // Add any other game data you need to store
        ]);

        // Return the game code
        return response()->json(['gameCode' => $game->code], 201);
    }

    public function join(Request $request)
    {
        $request->validate([
            'gameCode' => 'required|exists:games,code',
            // Add any other validation rules you need
        ]);

        // You can add logic here to handle joining the game
        // For example, adding the user to the game session

        return response()->json(['message' => 'Successfully joined the game'], 200);
    }
}
