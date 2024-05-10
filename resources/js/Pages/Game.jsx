import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Game({ auth, gameId, gameCode }) {
  const [players, setPlayers] = useState([]);

  const [admin, setAdmin] = useState("");

  const [round, setRound] = useState(0);

  const userName = auth.user.name;

  let fetchInterval;

  useEffect(() => {
      // Fetch players for the current game
      const fetchPlayers = async () => {
          try {
              const response = await axios.get(`/api/game/${userName}/players`);

              setPlayers(response.data.players);
          } catch (error) {
              console.error('Error fetching players:', error);
          }
      };

      const fetchAdmin = async () => {
        try {
            const response = await axios.get(`/api/game/${userName}/admin`);

            setAdmin(response.data);
        } catch (error) {
            console.error('Error fetching players:', error);
        }
    };

    fetchAdmin();

      if (round !== 0 && round !== null) return;

      fetchInterval = setInterval(() => {
        fetchPlayers();
      }, 1000);

      return () => clearInterval(fetchInterval);

  }, [round]);

  useEffect(() => {
    // Fetch players for the current game
    const fetchRound = async () => {
        try {
            const response = await axios.post(`/api/round/${gameId}`);

            console.log(response.data);

            if (!response.data.round) {
              //setRound(0);
            } else {
              setRound(response.data.round);
            }
        } catch (error) {
            console.error('Error fetching players:', error);
        }
    };

    setInterval(() => {
      fetchRound();
    }, 1000);

}, [round]);


  const startNewRound = async () => {
      try {
          const response = await axios.post(`/api/games/${gameId}/${round + 1}/rounds`);
          setPlayers(response.data.players);

          setRound(round + 1);
      } catch (error) {
          console.error('Error starting new round:', error);
      }
  };

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

            <h2>Round: {round}</h2>

            {admin.isAdmin && 
              (            
                  <button onClick={startNewRound}>Start New Round</button>
              )
            }

            {console.log(admin)}

            <button onClick={leaveGame}>Leave Game</button>

            {players.map(player => (
                <div key={player.id} className="player-card">
                    <h2>{player.name + " " + (player.role === 'administrator' ? "admin" : "")}</h2>
                    <p>Location: {isSpy(player.id, player.spy_id) ? 'Spy' : player.location}</p>
                                
                </div>
            ))}
        </div>
      
    </AuthenticatedLayout>
  );
}
