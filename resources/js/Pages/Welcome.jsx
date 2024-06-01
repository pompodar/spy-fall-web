import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, router } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';
import { db } from "./config/firebase";
import { auth as firebaseAuth } from './config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  setDoc,
  updateDoc,
  getDoc, 
  doc,
} from "firebase/firestore";
import axios from 'axios';

export default function Welcome({ auth }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (currentUser) => {
      setUser(currentUser);

      console.log("User set on Auth State Changed in Welcome:", currentUser);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const isAuthenticated = !!(auth?.user || user);

  const [newGameCode, setNewGameCode] = useState('');
  const [joinGameCode, setJoinGameCode] = useState('');
  const [createGameError, setCreateGameError] = useState(null);

  const userEmail = auth?.user?.email || user?.email || "";

  const handleNewGameSubmit = async (e) => {
    e.preventDefault();

    if (!userEmail) {

      console.error("No user email found in Game when starting new game from Welcome page.");
      return;
    }
    try {
      // Send request to backend to create a new game
      const response = await axios.post(`/api/create-game/${userEmail}`);
      // Set the new game code
      setNewGameCode(response.data.gameId);
      setCreateGameError(null);

      console.log('Successfully created a new game:', response.data);

      const gameId = response.data.gameId.toString();

      try {
        // Add the document to the 'gameRooms' collection with the custom ID
        await setDoc(doc(db, "gameRooms", gameId), {
          players: [userEmail],
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
    if (!joinGameCode) {

        console.error("No game code found in Game when joining game from Welcome page.");
        return;
    }

    if (!userEmail) {

      console.error("No user email found in Game when joining game from Welcome page.");
      return;
    }
    try {
      // Send request to backend to join the game
      const response = await axios.post('/api/join-game', { gameCode: joinGameCode, userEmail: userEmail });
      console.log('Joined game successfully:', response.data);
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
          if (!currentPlayers.includes(userEmail)) {
            // Add the new user to the players array
            const updatedPlayers = [...currentPlayers, userEmail];
      
            // Update the game document with the new players array
            await updateDoc(gameDocRef, {
              players: updatedPlayers,
            });
      
            console.log('User added to the game in Firebase successfully');
          } else {
            console.log('User already exists in the game in Firebase');
          }
        } else {
          console.error('Game document does not exist in Firebase');
        }
      } catch (err) {
        console.error('Error updating game document in Firebase:', err);
      }

      // Redirect to the game window
      router.visit(`/game/${response.data.gameId}/${response.data.gameCode}`);
    } catch (error) {
      // Handle error if joining game fails
      console.error('Error joining game:', error.response.data);
    }
  };

    return (
        <div>
            <Head title="Welcome" />
            <div className="bg-transparent text-black/50 dark:bg-black dark:text-white/50">
                <div className="relative min-h-screen flex flex-col selection:bg-[#FF2D20] selection:text-white">
                    <div className="relative mx-auto w-full max-w-2xl">

                        {(isAuthenticated) ? (
                            <AuthenticatedLayout user={auth.user || user}>
                            <Head title="Spy" />

                              <div className="GameLobby bg-gradient-to-r from-brightpurple to-darkpurple p-4 flex flex-col justify-center items-center">

                                <h1 className="text-3xl text-brightyellow font-bold mb-4">Welcome to Spy!</h1>
                                <img className="w-48 rounded-full" src="android-chrome-512x512.png" alt="Logo" />

                                {/* New Game Form */}
                                <div className="FormContainer mb-8">
                                <form onSubmit={handleNewGameSubmit}>
                                    <button className="bg-brightpurple text-brightyellow py-2 px-4 mt-4 rounded-md hover:bg-darkpurple focus:outline-none" type="submit">Create New Game</button>
                                    {createGameError && <p className="text-red-500 mt-2">{createGameError}</p>}
                                </form>
                                </div>

                                {/* Join Game Form */}
                                <div className="FormContainer mb-8">
                                <form className="flex flex-col justify-center items-center" onSubmit={handleJoinGameSubmit}>
                                    <label className="block mb-2 flex flex-col justify-center items-center">
                                    <span className="text-brightyellow">Game Code:</span>
                                    <input
                                        className="w-full mt-2 outline-brightyellow p-2 border border-brightyellow text-brightyellow rounded-md focus:outline-none bg-gradient-to-r from-brightpurple to-darkpurple"
                                        type="text"
                                        value={joinGameCode}
                                        onChange={(e) => setJoinGameCode(e.target.value)}
                                    />
                                    </label>
                                    <button className="bg-brightpurple text-brightyellow py-2 px-4 rounded-md hover:bg-darkpurple focus:outline-none" type="submit">Join Game</button>
                                </form>
                                </div>
                            </div>
                            </AuthenticatedLayout>
                        ) : (
                            <GuestLayout>
                            <Head title="Spy" />
                                <h1 className="text-3xl text-center bg-transparent text-brightyellow font-bold mb-4">Welcome to Spy!</h1>
                                <img className="w-48 text-center rounded-full" src="android-chrome-512x512.png" alt="Logo" />

                                <p className="mt-4 text-brightyellow w-full bg-transparent ">
                                Game background:
                                </p>
                                <p className="text-brightyellow w-full bg-transparent ">
                                You're an FBI detective.
                                </p>

                                <p className="text-brightyellow w-full bg-transparent ">

                                Problem: someone in your department is an enemy spy.
                                </p>

                                <p className="text-brightyellow w-full bg-transparent ">

                                Your full department has been brought in. You must question each other to discover the spy.
                                </p>

                                <p className="text-brightyellow w-full bg-transparent ">

                                What you need to play:
                                </p>

                                <p className="text-brightyellow w-full bg-transparent ">

                                3-12 people.
                                </p>

                                <p className="text-brightyellow w-full bg-transparent ">

                                All in same room or same call
                                </p>

                                <p className="text-brightyellow w-full bg-transparent ">

                                Each has their own phone, computer, or tablet.
                                </p>

                                <p className="text-brightyellow w-full bg-transparent ">

                                Game objectives:
                                </p>

                                <p className="text-brightyellow w-full bg-transparent ">

                                The spy: try to guess the round's location. Infer from others' questions and answers.
                                </p>

                                <p className="text-brightyellow w-full bg-transparent ">

                                Other players: figure out who the spy is.
                                    
                                </p>

                                <p className="text-brightyellow w-full bg-transparent ">

                                Round length: 6-10 minutes. Shorter for smaller groups, longer for larger.

                                </p>

                                
                                <p className="text-brightyellow w-full bg-transparent ">

                                The location: round starts, each player is given a location. The location is the same for all players (e.g., the bank) except for one player, who is randomly the "spy". The spy does not know the round's location.
                                
                                </p>

                                <p className="text-brightyellow w-full bg-transparent ">

                                Questioning: the game leader (person who started the game) begins by questioning another player about the location. Example: ("is this a place where children are welcome?").

                                </p>

                                <p className="text-brightyellow w-full bg-transparent ">

                                Answering: the questioned player must answer. No follow up questions allowed. After they answer, it's then their turn to ask someone else a question. This continues until round is over.

                                </p>

                                <p className="text-brightyellow w-full bg-transparent ">

                                No retaliation questions: if someone asked you a question for their turn, you cannot then immediately ask them a question back for your turn. You must choose someone else.
                                
                                </p>

                            </GuestLayout>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
