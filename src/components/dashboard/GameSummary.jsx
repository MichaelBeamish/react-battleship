import React from "react";
import { NavLink } from "react-router-dom";

import moment from "moment";

const GameSummary = ({ game, id }) => {
  let thisPlayer = game.players.filter(player => player.userReference === id);
  let otherPlayer = game.players.filter(player => player.userReference !== id);
  //GENERATE DATE/TIME:
  let utcSeconds = game.createdAt.seconds;
  let utcMilliseconds = game.createdAt.nanoseconds / 1000000;
  let date = new Date(0);
  date.setUTCSeconds(utcSeconds);
  date.setUTCMilliseconds(utcMilliseconds);

  if (game.otherUser !== undefined && game.thisUser !== undefined) {
    return (
      <div className="col l6">
        <div className="game-summary">
          {thisPlayer[0].setUpBoard ? (
            <div>
              <div className="row">
                <div className="col l8">
                  <div className="summary-title">
                    <h4 className="left">{game.gameName.toUpperCase()}</h4>
                  </div>
                </div>
                <div className="col l4">
                  <div className="summary-button">
                    <NavLink to={"/game/" + game.id}>
                      <button className="btn green darken-2">Load Game</button>
                    </NavLink>
                  </div>
                </div>
              </div>
              {otherPlayer[0].setUpBoard ? (
                <div className="sub-display">
                  <b>STATUS:</b>
                  <br />
                  {game.whosTurn === thisPlayer[0].id ? (
                    <span>
                      <span className="your-turn-summary">It's your turn.</span>
                    </span>
                  ) : (
                    <span>It's {game.otherUser.nickname}'s turn.</span>
                  )}
                </div>
              ) : (
                <div className="sub-display">
                  <b>STATUS:</b>
                  <br />
                  <span>{game.otherUser.nickname} is still setting up.</span>
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="row">
                <div className="col l8">
                  <div className="summary-title">
                    <h4 className="left">{game.gameName.toUpperCase()}</h4>
                  </div>
                </div>
                <div className="col l4">
                  <div className="summary-button">
                    <NavLink to={"/setup/" + game.id}>
                      <button className="btn green darken-2">Load Game</button>
                    </NavLink>
                  </div>
                </div>
              </div>
              <div className="sub-display">
                <b>STATUS:</b>
                <br />
                <span>You are still setting up your board.</span>
              </div>
            </div>
          )}
          <div className="sub-display">
            <b>Opponent:</b>
            <br />
            {game.otherUser.nickname}
          </div>
          <div className="sub-display">
            <b>Started:</b>
            <br />
            {moment(date).calendar()}
          </div>
        </div>
      </div>
    );
  } else {
    return null;
  }
};

export default GameSummary;
