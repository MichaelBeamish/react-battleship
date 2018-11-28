import React, { Component } from "react";
import { Redirect } from "react-router-dom";

import { connect } from "react-redux"; //Connects redux store to component.
import { firestoreConnect } from "react-redux-firebase"; //Connects firestore to redux store.
import { compose } from "redux";

//COMPONENTS:
import Grid from "./Grid";
import Ships from "./Ships";

// ACTIONS:
import { finalizePlayerGrid } from "../../store/actions/gameActions";

class GamePlay extends Component {
  state = {
    propsLoaded: false,
    updated: false
  };

  blockClicked = numLetter => {
    let guess = numLetter;
    let thisID = this.props.thisPlayer.id;
    let turn = this.props.game.whosTurn;
    let otherPlayer = this.props.otherPlayer;
    let allOtherShips = [];
    if (otherPlayer.setUpBoard === true) {
      let hit = false;
      otherPlayer.ships.forEach(ship => {
        ship.occupiedBlocks.forEach(block => {
          if (block === guess) {
            hit = true;
          }
        });
      });
      if (hit === true) {
        console.log("Hit!");
      } else {
        console.log("Miss.");
      }
    } else {
      console.log("the other player isn't set up yet");
    }
    if (thisID === turn) {
      if (otherPlayer.setUpBoard === true) {
        allOtherShips.forEach(ship => {
          console.log(ship.name);
        });
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
      otherPlayer,
      shipsFormated
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

    return (
      <div className="full-height">
        <div className="row height-100">
          <div className="col l2 center height-100">
            <div className="center">
              <h5>*GAME</h5>
              <h5>Whos turn is it?</h5>
              <p>*PLAYER</p>
              <h5>SHIPS SUNK:</h5>
              <p>*SHIPS</p>
            </div>
          </div>
          <div className="col l5 height-100">
            <div className="left">
              <h3>Your Board</h3>
              <Grid typeOfGrid={"gamePlay"} blockClicked={null} />
              {this.state.updated === true ? (
                <Ships allShips={shipsFormated} />
              ) : null}
            </div>
          </div>
          <div className="col l5 height-100">
            <div className="left">
              <h3>*Other Board</h3>
              <Grid
                typeOfGrid={"otherPlayer"}
                blockClicked={this.blockClicked}
              />
            </div>
          </div>
        </div>
      </div>
    );
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

  let otherPlayerInfo = null;
  if (users !== undefined && otherPlayer !== null) {
    otherPlayerInfo = users.find(user => user.id === otherPlayer.userReference);
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
    otherPlayerInfo: otherPlayerInfo
  };
};

export default compose(
  connect(
    mapStateToProps,
    { finalizePlayerGrid }
  ),
  firestoreConnect([{ collection: "users" }, { collection: "games" }])
)(GamePlay);
