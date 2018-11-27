export const GENERATE_GAME = "GENERATE_GAME";
export const GENERATE_GAME_ERROR = "GENERATE_GAME_ERROR";
export const CREATED_GAME_TO_NULL = "CREATED_GAME_TO_NULL";

export const createdToNull = () => {
  return {
    type: CREATED_GAME_TO_NULL
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
      personalMessage: ["Started game."]
    };
    players.push(player1);

    let player2 = {
      id: 1,
      userReference: receivedPlayers[1],
      winner: false,
      personalMessage: ["Started game."]
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
