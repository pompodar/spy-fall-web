import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';
import { AiOutlineSend } from "react-icons/ai";
import { AiOutlinePoweroff } from "react-icons/ai";
import { db } from "./config/firebase";
import { auth as firebaseAuth } from './config/firebase';
import { onAuthStateChanged, getAuth } from 'firebase/auth';
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

  const baseUrl = window.location.origin;

  const [user, setUser] = useState(null);

  let userEmail = "";

  useEffect(() => {
    const q = query(collection(db, 'gameRooms'))
    onSnapshot(q, (querySnapshot) => {
    })
  })

  useEffect(() => {    
    const unsubscribe = onAuthStateChanged(firebaseAuth, (currentUser) => {
      setUser(currentUser);

        // Fetch players for the current game
  const fetchPlayers = async () => {
    console.log(userEmail);
      try {
          const response = await axios.get(`/api/game/${gameId}/${userEmail}/players`);

          console.log(response);
          setPlayers(response.data.players);
      } catch (error) {
          console.error('Error fetching players:', error);
      }
  };

        const q = query(collection(db, 'gameRooms'))
        onSnapshot(q, (querySnapshot) => {
          fetchPlayers();
        })

    userEmail = auth?.user?.email || currentUser?.email || "";

    console.log(userEmail);

    const fetchAdmin = async () => {
      try {
          const response = await axios.get(`/api/game/${userEmail}/admin`);

          setAdmin(response.data);
      } catch (error) {
          console.error('Error fetching players:', error);
      }
  };

  fetchAdmin();

  // Fetch round for the current game
  const fetchRound = async () => {
      try {
          const response = await axios.post(`/api/round/${gameId}/${userEmail}`);

          if (!response.data.round) {
            //setRound(0);
          } else {
            setRound(response.data.round);
          }
      } catch (error) {
          console.error('Error fetching players:', error);
      }
  };

    fetchPlayers();

    fetchRound();

  });
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);


  useEffect(() => {

    // Fetch players for the current game
  const fetchPlayers = async () => {
      try {
          const response = await axios.get(`/api/game/${gameId}/${user?.email}/players`);

          setPlayers(response.data.players);

          console.log(response.data.players);
      } catch (error) {
          console.error('Error fetching players:', error);
      }
  };  

    fetchPlayers();

    // Fetch round for the current game
  const fetchRound = async () => {
    try {
        const response = await axios.post(`/api/round/${gameId}/${user?.email}`);

        if (!response.data.round) {
          //setRound(0);
        } else {
          setRound(response.data.round);
        }
    } catch (error) {
        console.error('Error fetching players:', error);
    }
};


    fetchRound();


  }, [round]);

  const startNewRound = async () => {
      userEmail = auth?.user?.email || user?.email || "";

      try {
          const response = await axios.post(`/api/games/${gameId}/${userEmail}/${round + 1}/rounds`);
          setPlayers(response.data.players);

          console.log(response);
          setRound(round + 1);

          try {
            // Get the reference to the game document
            const gameDocRef = doc(db, "gameRooms", gameId);
            
            // Update the game document with the updated players array
            await updateDoc(gameDocRef, {
              round: round + 1,
            });

          } catch (err) {
            console.error('Error setting round for game:', err);
          }

          setRound(round + 1);
      } catch (error) {
          console.error('Error starting new round:', error);
      }
  };

  const leaveGame = async () => {
    userEmail = auth?.user?.email || user?.email || "";
      try {
          await axios.delete(`/api/game/${gameId}/${userEmail}/leave`);

          try {
            // Get the reference to the game document
            const gameDocRef = doc(db, "gameRooms", gameId);
            
            // Get the current data of the game document
            const gameDocSnap = await getDoc(gameDocRef);
            if (gameDocSnap.exists()) {
              // Extract the current players array
              const currentPlayers = gameDocSnap.data().players || [];
          
              // Check if the player to remove exists in the players array
              const playerIndex = currentPlayers.indexOf(userEmail);
              if (playerIndex !== -1) {
                // Remove the player from the players array
                const updatedPlayers = [...currentPlayers.slice(0, playerIndex), ...currentPlayers.slice(playerIndex + 1)];
          
                // Update the game document with the updated players array
                await updateDoc(gameDocRef, {
                  players: updatedPlayers,
                });
          
                console.log('Player removed from the game successfully');
          
                // Check if there are no more players in the game
                if (updatedPlayers.length === 0) {
                  // Delete the game document
                  await deleteDoc(gameDocRef);
                  console.log('Game document deleted as there are no more players');
                }
              } else {
                console.log('Player does not exist in the game');
              }
            } else {
              console.error('Game document does not exist');
            }
          } catch (err) {
            console.error('Error removing player from game:', err);
          }
          

          router.visit("/");

        } catch (error) {
          console.error('Error leaving game:', error);
      }
  };

  const isSpy = (playerId, spyId) => playerId === spyId;

  return (
    <AuthenticatedLayout user={auth?.user || user?.displayName}>
      
      <Head title="Spy" />
      <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col justify-center items-center bg-background">
        <h1 className="text-3xl text-brightyellow font-bold mb-4">Game {gameCode}</h1>
        <img className="w-48 rounded-full" src={`${baseUrl}/android-chrome-512x512.png`} alt="Logo" />

        <h2 className="text-xl text-brightyellow font-semibold mb-4">Round: {round}</h2>
        {(players.length < 3) &&
          <h2 className="text-sm text-brightyellow italic mb-4">Waiting for players</h2>        
        }
        <div className="max-w-4xl mx-auto flex justify-center items-center">

          {(admin.isAdmin && players.length > 1) &&
            <button onClick={startNewRound} className="bg-brightgreen text-white px-4 py-2 rounded-md mr-4">
              <AiOutlineSend />
            </button>
          }
          <button onClick={leaveGame} className="bg-red-500 text-white px-4 py-2 rounded-md">
            <AiOutlinePoweroff />
          </button>

        </div>
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {players.map(player => (
            <div key={player.id} className="">
              <h2 className="text-lg text-brightyellow font-semibold mb-2">{player.name} {player.role === 'administrator' && <span className="text-sm text-brightgreen">(Admin)</span>}</h2>
              <p className="text-red-500">{isSpy(player.id, player.spy_id) ? 'Шпигунець' : player.location}</p>
            </div>
          ))}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
