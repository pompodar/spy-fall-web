import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import React, { useState } from 'react';
import { router } from '@inertiajs/react'
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
    } catch (error) {
      // Handle error if joining game fails
      console.error('Error joining game:', error.response.data);
    }
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Spyfall</h2>}
    >
      <Head title="Spyfall" />

      
    </AuthenticatedLayout>
  );
}
