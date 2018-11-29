import {
  GENERATE_GAME,
  GENERATE_GAME_ERROR,
  CREATED_GAME_TO_NULL,
  FINALIZE_GAME,
  FINALIZE_GAME_ERROR,
  GUESS,
  GUESS_ERROR
} from "../actions/gameActions";

const initState = { gameCreatedID: null };

const gameReducer = (state = initState, action) => {
  switch (action.type) {
    case GENERATE_GAME:
      console.log("generated game", action.payload);
      return { gameCreatedID: action.payload };
    case GENERATE_GAME_ERROR:
      console.log("error generating game", action.payload);
      return state;
    case CREATED_GAME_TO_NULL:
      console.log("reverted game ID to null in redux state");
      return { gameCreatedID: null };
    case FINALIZE_GAME:
      console.log("finalized game", action.payload);
      return state;
    case FINALIZE_GAME_ERROR:
      console.log("error finalizing game", action.payload);
      return state;
    case GUESS:
      console.log("guess reached reducer", action.payload);
      return state;
    case GUESS_ERROR:
      console.log("guess error at reducer", action.payload);
      return state;
    default:
      return state;
  }
};

export default gameReducer;
