import { router } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import React, { useState } from 'react';
import axios from 'axios';

export default function GameLobby({ auth }) {
  const [newGameCode, setNewGameCode] = useState('');
  const [joinGameCode, setJoinGameCode] = useState('');
  const [createGameError, setCreateGameError] = useState(null);

  const handleNewGameSubmit = async (e) => {
    e.preventDefault();
    try {
      // Send request to backend to create a new game
      const response = await axios.post('/api/create-game');
      console.log('New game created:', response.data);
      // Set the new game code
      setNewGameCode(response.data.gameCode);
      setCreateGameError(null);
      // Redirect to the game window
      router.visit(`/game/${response.data.gameCode}`);
    } catch (error) {
      // Handle error if creating game fails
      console.error('Error creating game:', error.response.data);
      setCreateGameError(error.response.data.message);
    }
  };

  const handleJoinGameSubmit = async (e) => {
    e.preventDefault();
    try {
      // Send request to backend to join the game
      const response = await axios.post('/api/join-game', { gameCode: joinGameCode });
      console.log('Join game response:', response.data);
      // Reset the input field after successful submission
      setJoinGameCode('');
      // Redirect to the game window
      router.visit(`/game/${joinGameCode}`);
    } catch (error) {
      // Handle error if joining game fails
      console.error('Error joining game:', error.response.data);
    }
  };

  return (
    <div className="GameLobby bg-gray-100 p-4">
      <Head title="Spyfall" />

      <h1 className="text-3xl font-bold mb-4">Welcome to Spyfall!</h1>
      <p className="text-lg mb-8">Create a new game or join an existing game to start playing.</p>

      {/* New Game Form */}
      <div className="FormContainer mb-8">
        <form onSubmit={handleNewGameSubmit}>
          <h2 className="text-xl font-semibold mb-2">Create a New Game</h2>
          <button className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none" type="submit">Create New Game</button>
          {newGameCode && <p className="text-green-500 mt-2">Game created! Game code: {newGameCode}</p>}
          {createGameError && <p className="text-red-500 mt-2">{createGameError}</p>}
        </form>
      </div>

      {/* Join Game Form */}
      <div className="FormContainer">
        <form onSubmit={handleJoinGameSubmit}>
          <h2 className="text-xl font-semibold mb-2">Join an Existing Game</h2>
          <label className="block mb-2">
            <span className="text-gray-700">Game Code:</span>
            <input
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none"
              type="text"
              value={joinGameCode}
              onChange={(e) => setJoinGameCode(e.target.value)}
            />
          </label>
          <button className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none" type="submit">Join Game</button>
        </form>
      </div>
    </div>
  );
}
