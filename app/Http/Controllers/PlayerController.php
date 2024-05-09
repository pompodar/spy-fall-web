<?php

namespace App\Http\Controllers;

use App\Models\Player;
use Illuminate\Http\Request;

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
}
