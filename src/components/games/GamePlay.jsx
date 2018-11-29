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

class GamePlay extends Component {
  state = {
    propsLoaded: false,
    updated: false
  };

  blockClicked = numLetter => {
    let existingGuesses = JSON.parse(
      JSON.stringify(this.props.thisPlayer.guessedBlocks)
    );
    let guess = numLetter;
    let thisID = this.props.thisPlayer.id;
    let turn = this.props.game.whosTurn;
    let otherPlayer = this.props.otherPlayer;

    // guessedBlocks: { AC: [], BS: [], SM: [], DS: [], CR: [], MISSES: [] }

    if (thisID === turn) {
      if (otherPlayer.setUpBoard === true) {
        //CHECK IF ALREADY GUESSED:
        let alreadyChecked = false;
        let thingsToCheck = ["AC", "BS", "SM", "DS", "CR", "MISSES"];
        thingsToCheck.forEach(thing => {
          existingGuesses[thing].forEach(priorGuess => {
            if (priorGuess === guess) {
              alreadyChecked = true;
            }
          });
        });
        //IF NOT ALREADY GUESSED:
        if (alreadyChecked === false) {
          let hit = false;
          otherPlayer.ships.forEach(ship => {
            ship.occupiedBlocks.forEach(block => {
              if (block === guess) {
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
          this.props.submitGuess(
            this.props.gameID,
            this.props.game,
            this.props.thisPlayer.id,
            existingGuesses
          );
        } else {
          console.log("already guessed", guess);
        }
      } else {
        console.log("the other player isn't set up yet");
      }
    } else {
      console.log("its the other players turn");
    }
  };

  componentDidUpdate() {
    if (this.state.propsLoaded === true) {
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

      return (
        <div className="full-height">
          <div className="row height-100">
            <div className="col l2 height-100">
              <div className="game-info">
                <h4>{game.gameName}</h4>
                <p>Started: {moment(date).calendar()}</p>
                <div />
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
                {otherPlayer.setUpBoard === false ? (
                  <h6>
                    *Waiting for {otherPlayerInfo.nickname} to finish setting up
                    their board.
                  </h6>
                ) : null}
              </div>
            </div>
            <div className="col l5 height-100">
              <div className="left">
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
                <Grid typeOfGrid={"gamePlay"} blockClicked={null} />
                {this.state.updated === true ? (
                  <div>
                    <Ships allShips={shipsFormated} who={"me"} />
                    <Pins
                      hits={othersHitPins}
                      misses={othersMissPins}
                      who={"other"}
                    />
                  </div>
                ) : null}
              </div>
            </div>
            <div className="col l5 height-100">
              <div className="left">
                {thisPlayer.id === 0 ? (
                  <div className="blue player-name-bar">
                    <h3 className="make-inline">{otherPlayerInfo.nickname}</h3>
                  </div>
                ) : (
                  <div className="red player-name-bar">
                    <h3 className="make-inline">{otherPlayerInfo.nickname}</h3>
                  </div>
                )}
                <Grid
                  typeOfGrid={"otherPlayer"}
                  blockClicked={this.blockClicked}
                />
                {this.state.updated === true ? (
                  <div>
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
    { submitGuess }
  ),
  firestoreConnect([{ collection: "users" }, { collection: "games" }])
)(GamePlay);
