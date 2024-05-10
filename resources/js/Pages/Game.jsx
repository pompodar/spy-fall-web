import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';
import { db } from "./config/firebase";
import {
  collection,
  query, 
  orderBy, 
  onSnapshot,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import axios from 'axios';

export default function Game({ auth, gameId, gameCode }) {
  const [players, setPlayers] = useState([]);

  const [admin, setAdmin] = useState("");

  const [round, setRound] = useState(0);

  const [game, setGame] = useState([]);
  const usersCollectionRef = collection(db, "gameRooms");

  const userName = auth.user.name;

  let fetchInterval;

  // useEffect(() => {
  //   const getGames = async () => {
  //     const data = await getDocs(usersCollectionRef);

  //     setGame(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
  //   };

  //   getGames();
  // }, []);

  useEffect(() => {
    const q = query(collection(db, 'gameRooms'))
    onSnapshot(q, (querySnapshot) => {
      setGame(querySnapshot.docs.map(doc => ({
        id: doc.id,
        data: doc.data()
      })))
    })

    console.log(game);
  },[])

  useEffect(() => {
      // Fetch players for the current game
      const fetchPlayers = async () => {
          try {
              const response = await axios.get(`/api/game/${gameId}/players`);

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

          // Get the reference to the game document
          const gameDocRef = doc(db, "gameRooms", gameId);

          try {
            // Get the current data of the game document
            const gameDocSnap = await getDoc(gameDocRef);
            if (gameDocSnap.exists()) {
              // Extract the current players array
              const currentPlayers = gameDocSnap.data().players || [];

              // Check if the player to remove exists in the players array
              const playerIndex = currentPlayers.indexOf(userName);
              if (playerIndex !== -1) {
                // Remove the player from the players array
                const updatedPlayers = [...currentPlayers.slice(0, playerIndex), ...currentPlayers.slice(playerIndex + 1)];

                // Update the game document with the updated players array
                await updateDoc(gameDocRef, {
                  players: updatedPlayers,
                });

                console.log('Player removed from the game successfully');
              } else {
                console.log('Player does not exist in the game');
              }
            } else {
              console.error('Game document does not exist');
            }
          } catch (err) {
            console.error('Error removing player from game:', err);
          }

          router.visit("/game_lobby/");

        } catch (error) {
          console.error('Error leaving game:', error);
      }
  };

  const isSpy = (playerId, spyId) => playerId === spyId;

  return (
    <AuthenticatedLayout user={auth.user}>
      <Head title="Spyfall" />
      {game && game.map((game) => {
        return (
          <div>
            {" "}
            <h1>Game id: {game.id}</h1>

            {game.data.players && game.data.players.map((player) => {
              return (
                <div>
                  <h1>{player}</h1>
                </div>
              );
            })}
          </div>
        );
      })}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Game {gameCode}</h1>
        <h2 className="text-xl font-semibold mb-4">Round: {round}</h2>
        {admin.isAdmin &&
          <button onClick={startNewRound} className="bg-blue-500 text-white px-4 py-2 rounded-md mr-4">Start New Round</button>
        }
        <button onClick={leaveGame} className="bg-red-500 text-white px-4 py-2 rounded-md">Leave Game</button>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {players.map(player => (
            <div key={player.id} className="bg-gray-100 p-4 rounded-md">
              <h2 className="text-lg font-semibold mb-2">{player.name} {player.role === 'administrator' && <span className="text-blue-500">(Admin)</span>}</h2>
              <p className="text-gray-700">{isSpy(player.id, player.spy_id) ? 'Spy' : player.location}</p>
            </div>
          ))}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
