import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Game({ auth, gameId, gameCode }) {
  const [players, setPlayers] = useState([]);
  const userName = auth.user.name;

  useEffect(() => {
      // Fetch players for the current game
      const fetchPlayers = async () => {
          try {
              const response = await axios.get(`/api/game/${gameId}/players`);

              console.log(response.data);
              setPlayers(response.data);
          } catch (error) {
              console.error('Error fetching players:', error);
          }
      };

      setInterval(() => {
        fetchPlayers();
      }, 1000);

  }, [gameId]);

  const leaveGame = async () => {
      try {
          await axios.delete(`/api/game/${gameId}/${userName}/leave`);

          router.visit("/game_lobby/");

        } catch (error) {
          console.error('Error leaving game:', error);
      }
  };

  const isSpy = (playerId, spyId) => playerId === spyId;

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Spyfall</h2>}
    >
      <Head title="Spyfall" />

      <div className="game">
            <h1>Game {gameCode}</h1>

            <button onClick={leaveGame}>Leave Game</button>

            {players.map(player => (
                <div key={player.id} className="player-card">
                    <h2>{player.name}</h2>
                    <p>Location: {isSpy(player.id, player.spy_id) ? 'Spy' : player.location}</p>
                </div>
            ))}
        </div>
      
    </AuthenticatedLayout>
  );
}
