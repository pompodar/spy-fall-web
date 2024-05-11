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
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc, 
  doc,
} from "firebase/firestore";
import axios from 'axios';

export default function GameLobby({ auth }) {
  const [newGameCode, setNewGameCode] = useState('');
  const [joinGameCode, setJoinGameCode] = useState('');
  const [createGameError, setCreateGameError] = useState(null);

  const userName = auth.user.name;

  const handleNewGameSubmit = async (e) => {
    e.preventDefault();
    try {
      // Send request to backend to create a new game
      const response = await axios.post(`/api/create-game/${userName}`);
      // Set the new game code
      console.log(response);
      setNewGameCode(response.data.gameId);
      setCreateGameError(null);

      const gameId = response.data.gameId.toString();

      try {
        // Add the document to the 'gameRooms' collection with the custom ID
        await setDoc(doc(db, "gameRooms", gameId), {
          players: [userName],
        });
        console.log('Game added to Firestore successfully');
      } catch (err) {
        console.error('Error adding game to Firestore:', err);
      }

      // Redirect to the game window
      router.visit(`/game/${response.data.gameId}/${response.data.gameCode}`);
    } catch (error) {
      // Handle error if creating game fails
      console.log('Error creating game:', error.response.data.game_code);
      setCreateGameError(error.response.data.error + ". Your game code is " + error.response.data.game_code);
    }
  };

  const handleJoinGameSubmit = async (e) => {
    e.preventDefault();
    try {
      // Send request to backend to join the game
      const response = await axios.post('/api/join-game', { gameCode: joinGameCode, userName: userName });
      console.log('Join game response:', response.data);
      // Reset the input field after successful submission
      setJoinGameCode('');

      const gameDocRef = doc(db, "gameRooms", response.data.gameId.toString());

      try {
        // Get the current data of the game document
        const gameDocSnap = await getDoc(gameDocRef);
        if (gameDocSnap.exists()) {
          
          // Extract the current players array
          const currentPlayers = gameDocSnap.data().players || [];
      
          // Check if the user is already in the players array
          if (!currentPlayers.includes(userName)) {
            // Add the new user to the players array
            const updatedPlayers = [...currentPlayers, userName];
      
            // Update the game document with the new players array
            await updateDoc(gameDocRef, {
              players: updatedPlayers,
            });
      
            console.log('User added to the game successfully');
          } else {
            console.log('User already exists in the game');
          }
        } else {
          console.error('Game document does not exist');
        }
      } catch (err) {
        console.error('Error updating game document:', err);
      }
      // Redirect to the game window
      router.visit(`/game/${response.data.gameId}/${response.data.gameCode}`);
    } catch (error) {
      // Handle error if joining game fails
      console.error('Error joining game:', error.response.data);
    }
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
    >
      <Head title="Spyfall" />
      <div className="GameLobby bg-gray-100 p-4 flex flex-col justify-center items-center">

        <h1 className="text-3xl font-bold mb-4">Welcome to Spyfall!</h1>
        <p className="text-lg mb-8">Create a new game or join an existing game to start playing.</p>

        {/* New Game Form */}
        <div className="FormContainer mb-8">
          <form onSubmit={handleNewGameSubmit}>
            <button className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 focus:outline-none" type="submit">Create New Game</button>
            {createGameError && <p className="text-red-500 mt-2">{createGameError}</p>}
          </form>
        </div>

        {/* Join Game Form */}
        <div className="FormContainer">
          <form className="flex flex-col justify-center items-center" onSubmit={handleJoinGameSubmit}>
            <label className="block mb-2 flex flex-col justify-center items-center">
              <span className="text-gray-700">Game Code:</span>
              <input
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none"
                type="text"
                value={joinGameCode}
                onChange={(e) => setJoinGameCode(e.target.value)}
              />
            </label>
            <button className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 focus:outline-none" type="submit">Join Game</button>
          </form>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
