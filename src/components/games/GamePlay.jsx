import React, { Component } from "react";
import { Redirect } from "react-router-dom";

import { connect } from "react-redux"; //Connects redux store to component.
import { firestoreConnect } from "react-redux-firebase"; //Connects firestore to redux store.
import { compose } from "redux";

import moment from "moment";

//COMPONENTS:
import Grid from "./Grid";
import Ships from "./Ships";
import Pins from "./Pins";

// ACTIONS:
import { submitGuess } from "../../store/actions/gameActions";
import { gameOver } from "../../store/actions/gameActions";

class GamePlay extends Component {
  state = {
    propsLoaded: false,
    updated: false,
    messageToUser: null,
    yourTurnArrived: false
  };

  blockClicked = numLetter => {
    let existingGuesses = JSON.parse(
      JSON.stringify(this.props.thisPlayer.guessedBlocks)
    );
    let guess = numLetter;
    let thisID = this.props.thisPlayer.id;
    let turn = this.props.game.whosTurn;
    let thisPlayerInfo = this.props.thisPlayerInfo;
    let otherPlayer = this.props.otherPlayer;

    if (this.props.game.status === "inProgress") {
      if (thisID === turn) {
        if (otherPlayer.setUpBoard === true) {
          //CHECK IF ALREADY GUESSED:
          let alreadyChecked = false;
          let thingsToCheck = ["AC", "BS", "SM", "DS", "CR", "MISSES"];
          let countShipsHit = 0;
          thingsToCheck.forEach(thing => {
            existingGuesses[thing].forEach(priorGuess => {
              if (priorGuess === guess) {
                alreadyChecked = true;
              }
              if (thing !== "MISSES") {
                countShipsHit++;
              }
            });
          });
          //IF NOT ALREADY GUESSED:
          if (alreadyChecked === false) {
            let hit = false;
            otherPlayer.ships.forEach(ship => {
              ship.occupiedBlocks.forEach(block => {
                if (block === guess) {
                  countShipsHit++;
                  hit = true;
                  existingGuesses[ship.acronym].push(block); //HIT
                  console.log("hit", guess);
                }
              });
            });
            if (hit !== true) {
              existingGuesses.MISSES.push(guess); //MISS
              console.log("missed", guess);
            }

            //UPDATE DATABASE WITH GUESS (weather or not it hit):
            //IF ALL SHIPS HIT RUN END GAME LOGIC:
            if (countShipsHit === 17) {
              console.log("GAME OVER:");
              console.log(thisPlayerInfo.nickname, "won!");
              this.props.gameOver(
                this.props.gameID,
                this.props.game,
                this.props.thisPlayer.id,
                existingGuesses
              );
            } else {
              //OTHERWISE JUST UPDATE THE DATABASAE AS NORMAL:
              this.props.submitGuess(
                this.props.gameID,
                this.props.game,
                this.props.thisPlayer.id,
                existingGuesses
              );
            }
            this.setState({
              messageToUser: null,
              yourTurnArrived: false
            });
          } else {
            this.setState({
              messageToUser: `Already guessed '${guess}'.`
            });
          }
        } else {
          console.log("Other player is setting up their board.");
        }
      } else {
        this.setState({
          messageToUser: "It's not your turn."
        });
      }
    } else {
      console.log("Can't click when the game is over.");
    }
  };

  componentDidUpdate() {
    if (this.state.propsLoaded === true) {
      if (this.props.game.whosTurn === this.props.thisPlayer.id) {
        if (this.state.yourTurnArrived === false) {
          this.setState({
            yourTurnArrived: true,
            messageToUser: null
          });
        }
      } else {
        if (this.state.yourTurnArrived === true) {
          this.setState({
            yourTurnArrived: false,
            messageToUser: null
          });
        }
      }

      if (this.props.game.status === "gameOver") {
        if (this.state.messageToUser) {
          this.setState({
            messageToUser: null
          });
        }
      }

      if (this.state.updated === false) {
        this.setState({
          updated: true
        });
      }
    }
  }

  render() {
    const {
      auth,
      game,
      gameID,
      thisPlayer,
      thisPlayerInfo,
      shipsFormated,
      otherPlayer,
      otherPlayerInfo,
      otherShipsFormated
    } = this.props;
    if (game !== null && thisPlayer !== null && otherPlayer !== null) {
      if (this.state.propsLoaded === false) {
        this.setState({
          propsLoaded: true
        });
      }
    }

    //AUTHENTICATION:
    if (!auth.uid) {
      console.log("Not logged in.");
      return <Redirect to="/splash" />; //If not logged in redirect.
    }
    if (game) {
      let userIsAuthorized = false;
      game.players.forEach(player => {
        if (player.userReference === auth.uid) {
          userIsAuthorized = true;
        }
      });
      if (userIsAuthorized === false) {
        console.log("Not a member of this game.");
        return <Redirect to="/" />; //If user is not part of game redirect.
      }
      if (thisPlayer.setUpBoard === false) {
        return <Redirect to={"/setup/" + gameID} />;
      }
    }

    if (game) {
      //GENERATE DATE/TIME:
      let utcSeconds = game.createdAt.seconds;
      let utcMilliseconds = game.createdAt.nanoseconds / 1000000;
      let date = new Date(0);
      date.setUTCSeconds(utcSeconds);
      date.setUTCMilliseconds(utcMilliseconds);

      //WHAT SHIPS HAVE BEEN HIT?
      let sunkShips = [];
      let allGuesses = thisPlayer.guessedBlocks;
      if (allGuesses.AC.length === 5) {
        sunkShips.push("AC");
      }
      if (allGuesses.BS.length === 4) {
        sunkShips.push("BS");
      }
      if (allGuesses.SM.length === 3) {
        sunkShips.push("SM");
      }
      if (allGuesses.DS.length === 3) {
        sunkShips.push("DS");
      }
      if (allGuesses.CR.length === 2) {
        sunkShips.push("CR");
      }
      if (game.status === "gameOver") {
        sunkShips = ["AC", "BS", "SM", "DS", "CR"];
      }

      //HIT AND MISS PINS:
      let thingsThatAreHits = ["AC", "BS", "SM", "DS", "CR"];
      //MY GUESSES
      let hitPins = [];
      thingsThatAreHits.forEach(thing => {
        thisPlayer.guessedBlocks[thing].forEach(hit => {
          hitPins.push(hit);
        });
      });
      let missPins = [];
      thisPlayer.guessedBlocks.MISSES.forEach(miss => {
        missPins.push(miss);
      });
      //OTHER PLAYER GUESSES
      let othersHitPins = [];
      thingsThatAreHits.forEach(thing => {
        otherPlayer.guessedBlocks[thing].forEach(hit => {
          othersHitPins.push(hit);
        });
      });
      let othersMissPins = [];
      otherPlayer.guessedBlocks.MISSES.forEach(miss => {
        othersMissPins.push(miss);
      });

      let otherPlayerSettingUp = null;
      if (otherPlayer.setUpBoard === false) {
        otherPlayerSettingUp = `Waiting for ${
          otherPlayerInfo.nickname
        } to finish
          setting up their board.`;
      }

      return (
        <div className="full-height">
          <div className="row height-100">
            <div className="col l2 height-100">
              <div className="game-info">
                <div className="title-date">
                  <h4>{game.gameName.toUpperCase()}</h4>
                  <p>Started: {moment(date).calendar()}</p>
                </div>
                {game.status === "inProgress" ? (
                  <div>
                    {!otherPlayerSettingUp ? (
                      <div>
                        <h5>Whos Turn:</h5>
                        {game.whosTurn === thisPlayer.id ? (
                          <div>
                            {thisPlayer.id === 0 ? (
                              <div className="red small-player-name-bar">
                                <h5 className="make-inline">
                                  {thisPlayerInfo.nickname}
                                </h5>
                                <p className="make-inline"> (yours)</p>
                              </div>
                            ) : (
                              <div className="blue small-player-name-bar">
                                <h5 className="make-inline">
                                  {thisPlayerInfo.nickname}
                                </h5>
                                <p className="make-inline"> (yours)</p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div>
                            {thisPlayer.id === 0 ? (
                              <div className="blue small-player-name-bar">
                                <h5 className="make-inline">
                                  {otherPlayerInfo.nickname}
                                </h5>
                              </div>
                            ) : (
                              <div className="red small-player-name-bar">
                                <h5 className="make-inline">
                                  {otherPlayerInfo.nickname}
                                </h5>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="center">
                    <h3>Game Over!</h3>
                    <h4>Champion:</h4>
                    {game.winner === thisPlayer.id ? (
                      <div>
                        {thisPlayer.id === 0 ? (
                          <h5 className="red small-player-name-bar">
                            {thisPlayerInfo.nickname}
                          </h5>
                        ) : (
                          <h5 className="blue small-player-name-bar">
                            {thisPlayerInfo.nickname}
                          </h5>
                        )}
                        <br />
                        <img
                          className="trophy-icon"
                          src={"/images/champion.png"}
                          alt="trophy-player-won"
                        />
                        <div>You are the winner!</div>
                      </div>
                    ) : (
                      <div>
                        {otherPlayer.id === 0 ? (
                          <h5 className="red small-player-name-bar">
                            {otherPlayerInfo.nickname}
                          </h5>
                        ) : (
                          <h5 className="blue small-player-name-bar">
                            {otherPlayerInfo.nickname}
                          </h5>
                        )}
                        <br />
                        <img
                          className="skull-icon"
                          src={"/images/skull.png"}
                          alt="skull-player-lost"
                        />
                        <div>You lost!</div>
                      </div>
                    )}
                  </div>
                )}
                {otherPlayerSettingUp ? (
                  <div className="row center small-messages-display">
                    <h5 className="red-text">
                      <b>NOTE:</b>
                    </h5>
                    <h6 className="white-text">{otherPlayerSettingUp}</h6>
                  </div>
                ) : null}
                {this.state.messageToUser ? (
                  <div className="row center small-messages-display">
                    <h5 className="red-text">
                      <b>NOTE:</b>
                    </h5>
                    <h6 className="white-text">{this.state.messageToUser}</h6>
                  </div>
                ) : null}
              </div>
            </div>
            <div className="col l5 height-100">
              <div className="name-icon-container">
                {thisPlayer.id === 0 ? (
                  <div className="red player-name-bar">
                    <h3 className="make-inline">{thisPlayerInfo.nickname}</h3>
                    <h5 className="make-inline"> (you)</h5>
                  </div>
                ) : (
                  <div className="blue player-name-bar">
                    <h3 className="make-inline">{thisPlayerInfo.nickname}</h3>
                    <h5 className="make-inline"> (you)</h5>
                  </div>
                )}
              </div>
              <Grid typeOfGrid={"gamePlay"} blockClicked={null} />
            </div>
            <div className="col l5 height-100">
              <div className="name-icon-container">
                {otherPlayer.id === 0 ? (
                  <div className="red player-name-bar">
                    <h3 className="make-inline">{otherPlayerInfo.nickname}</h3>
                  </div>
                ) : (
                  <div className="blue player-name-bar">
                    <h3 className="make-inline">{otherPlayerInfo.nickname}</h3>
                  </div>
                )}
              </div>
              {game.whosTurn === thisPlayer.id ? (
                <div className="play-cursor">
                  <Grid
                    typeOfGrid={"otherPlayer"}
                    blockClicked={this.blockClicked}
                  />
                </div>
              ) : (
                <div className="cant-cursor">
                  <Grid
                    typeOfGrid={"otherPlayer"}
                    blockClicked={this.blockClicked}
                  />
                </div>
              )}
            </div>
          </div>
          <div id="ALL-SHIPS-AND-PINS">
            {this.state.updated === true ? (
              <div>
                <Ships allShips={shipsFormated} who={"me"} />
                <Pins
                  hits={othersHitPins}
                  misses={othersMissPins}
                  who={"other"}
                />
                <Ships
                  allShips={otherShipsFormated}
                  who={"other"}
                  sunkShips={sunkShips}
                />
                <Pins hits={hitPins} misses={missPins} who={"me"} />
              </div>
            ) : null}
          </div>
        </div>
      );
    } else {
      return null;
    }
  }
}

const mapStateToProps = (state, ownProps) => {
  let users = state.firestore.ordered.users;
  //SET GAME ID:
  let gameID = ownProps.match.params.id;
  //SET GAME:
  let games = state.firestore.data.games;
  let game = games ? games[gameID] : null;
  //SET THIS PLAYER:
  let thisUserID = state.firebase.auth.uid;
  let thisPlayer = games
    ? game.players.find(player => {
        return player.userReference === thisUserID;
      })
    : null;
  let otherPlayer = games
    ? game.players.find(player => {
        return player.userReference !== thisUserID;
      })
    : null;

  //FORMAT SHIPS FOR THIS USER:
  let thisPlayerInfo = null;
  let shipsFormated = null;
  if (users !== undefined && thisPlayer !== null) {
    thisPlayerInfo = users.find(user => user.id === thisPlayer.userReference);
    if (thisPlayer.ships) {
      shipsFormated = {
        AC: thisPlayer.ships[0],
        BS: thisPlayer.ships[1],
        SM: thisPlayer.ships[2],
        DS: thisPlayer.ships[3],
        CR: thisPlayer.ships[4]
      };
    }
  }
  //FORMAT SHIPS FOR OTHER USER:
  let otherPlayerInfo = null;
  let otherShipsFormated = null;
  if (users !== undefined && otherPlayer !== null) {
    otherPlayerInfo = users.find(user => user.id === otherPlayer.userReference);
    if (otherPlayer.ships) {
      otherShipsFormated = {
        AC: otherPlayer.ships[0],
        BS: otherPlayer.ships[1],
        SM: otherPlayer.ships[2],
        DS: otherPlayer.ships[3],
        CR: otherPlayer.ships[4]
      };
    }
  }

  return {
    auth: state.firebase.auth,
    game: game,
    gameID: gameID,
    users: users,
    thisPlayer: thisPlayer,
    thisPlayerInfo: thisPlayerInfo,
    shipsFormated: shipsFormated,
    otherPlayer: otherPlayer,
    otherPlayerInfo: otherPlayerInfo,
    otherShipsFormated: otherShipsFormated
  };
};

export default compose(
  connect(
    mapStateToProps,
    { submitGuess, gameOver }
  ),
  firestoreConnect([{ collection: "users" }, { collection: "games" }])
)(GamePlay);
