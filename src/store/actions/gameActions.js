export const FINALIZE_GAME = "FINALIZE_GAME";
export const FINALIZE_GAME_ERROR = "FINALIZE_GAME_ERROR";
export const GUESS = "GUESS";
export const GUESS_ERROR = "GUESS_ERROR";
export const GAME_OVER = "GUESS";
export const GAME_OVER_ERROR = "GUESS_ERROR";
export const GENERATE_GAME = "GENERATE_GAME";
export const GENERATE_GAME_ERROR = "GENERATE_GAME_ERROR";
export const CREATED_GAME_TO_NULL = "CREATED_GAME_TO_NULL";

export const createdToNull = () => {
  return {
    type: CREATED_GAME_TO_NULL
  };
};

export const gameOver = (
  gameID,
  deliveredGame,
  playerID,
  guessedBlocksUpdated
) => {
  return (dispatch, getState, { getFirebase, getFirestore }) => {
    let game = JSON.parse(JSON.stringify(deliveredGame));
    let allPlayers = game.players;
    let thisPlayer = allPlayers.filter(player => player.id === playerID);
    thisPlayer = thisPlayer[0];
    let otherPlayer = allPlayers.filter(player => player.id !== playerID);
    otherPlayer = otherPlayer[0];

    //CHANGE STUFF
    thisPlayer.winner = true;
    thisPlayer.guessedBlocks = guessedBlocksUpdated;

    allPlayers = [thisPlayer, otherPlayer];

    const firestore = getFirestore();
    firestore
      .collection("games")
      .doc(gameID)
      .update({
        players: allPlayers,
        status: "gameOver",
        winner: playerID
      })
      .then(() => {
        //Then resumes the dispatch.
        dispatch({ type: GAME_OVER, payload: gameID });
      })
      .catch(err => {
        dispatch({ type: GAME_OVER_ERROR, payload: err });
      });
  };
};

export const submitGuess = (
  gameID,
  deliveredGame,
  playerID,
  guessedBlocksUpdated
) => {
  return (dispatch, getState, { getFirebase, getFirestore }) => {
    let game = JSON.parse(JSON.stringify(deliveredGame));
    let allPlayers = game.players;
    let thisPlayer = allPlayers.filter(player => player.id === playerID);
    thisPlayer = thisPlayer[0];
    let otherPlayer = allPlayers.filter(player => player.id !== playerID);
    otherPlayer = otherPlayer[0];

    let nextPlayer;
    if (playerID === 0) {
      nextPlayer = 1;
    } else {
      nextPlayer = 0;
    }

    thisPlayer.guessedBlocks = guessedBlocksUpdated;

    allPlayers = [thisPlayer, otherPlayer];

    const firestore = getFirestore();
    firestore
      .collection("games")
      .doc(gameID)
      .update({
        players: allPlayers,
        whosTurn: nextPlayer
      })
      .then(() => {
        //Then resumes the dispatch.
        dispatch({ type: GUESS, payload: gameID });
      })
      .catch(err => {
        dispatch({ type: GUESS_ERROR, payload: err });
      });
  };
};

export const finalizePlayerGrid = (gameID, deliveredGame, player, ships) => {
  return (dispatch, getState, { getFirebase, getFirestore }) => {
    let game = JSON.parse(JSON.stringify(deliveredGame));
    let thisPlayerID = player.id;
    let allPlayers = game.players;
    let thisPlayer = allPlayers.filter(player => player.id === thisPlayerID);
    thisPlayer = thisPlayer[0];
    let otherPlayer = allPlayers.filter(player => player.id !== thisPlayerID);
    otherPlayer = otherPlayer[0];

    thisPlayer.setUpBoard = true;
    thisPlayer.ships = ships;

    allPlayers = [thisPlayer, otherPlayer];

    const firestore = getFirestore();
    firestore
      .collection("games")
      .doc(gameID)
      .update({
        players: allPlayers
      })
      .then(() => {
        //Then resumes the dispatch.
        dispatch({ type: FINALIZE_GAME, payload: gameID });
      })
      .catch(err => {
        dispatch({ type: FINALIZE_GAME_ERROR, payload: err });
      });
  };
};

export const generateGame = (receivedPlayers, gameName) => {
  return (dispatch, getState, { getFirebase, getFirestore }) => {
    //Uses thunk. A function that takes in the dispatch.
    //Pauses the dispatch.

    let players = [];

    let player1 = {
      id: 0,
      userReference: receivedPlayers[0],
      winner: false,
      setUpBoard: false,
      guessedBlocks: { AC: [], BS: [], SM: [], DS: [], CR: [], MISSES: [] }
    };
    players.push(player1);

    let player2 = {
      id: 1,
      userReference: receivedPlayers[1],
      winner: false,
      setUpBoard: false,
      guessedBlocks: { AC: [], BS: [], SM: [], DS: [], CR: [], MISSES: [] }
    };
    players.push(player2);

    //Make async call to database.
    const firestore = getFirestore();
    firestore
      .collection("games")
      .add({
        gameName: gameName,
        players: players,
        status: "inProgress",
        winner: "",
        whosTurn: 0,
        createdAt: new Date()
      })
      .then(game => {
        //Then resumes the dispatch.
        dispatch({ type: GENERATE_GAME, payload: game.id });
      })
      .catch(err => {
        dispatch({ type: GENERATE_GAME_ERROR, payload: err });
      });
  };
};
