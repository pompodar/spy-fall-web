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
}
