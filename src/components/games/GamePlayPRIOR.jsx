import React, { Component } from "react";
import { Redirect } from "react-router-dom";

import { connect } from "react-redux"; //Connects redux store to component.
import { firestoreConnect } from "react-redux-firebase"; //Connects firestore to redux store.
import { compose } from "redux";

// ACTIONS:
import { finalizePlayerGrid } from "../../store/actions/gameActions";

class GamePlay extends Component {
  state = {
    propsLoaded: false,
    updated: false
  };

  handleGuess = e => {
    let guess = e.target.id;
    let thisID = this.props.thisPlayer.id;
    let turn = this.props.game.whosTurn;
    let otherPlayer = this.props.otherPlayer;
    let allOtherShips = [];
    if (otherPlayer.setUpBoard === true) {
      let hit = false;
      otherPlayer.ships.forEach(ship => {
        ship.occupiedBlocks.forEach(block => {
          if ("other" + block === guess) {
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
    const { auth, game, gameID, thisPlayer, otherPlayer } = this.props;
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
    }
    if (this.state.updated === true) {
      if (thisPlayer.setUpBoard === false) {
        return <Redirect to={"/setup/" + gameID} />;
      }
    }

    //CREATE YOUR GRID:
    let grid = [];
    let row = [];
    let letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
    letters.forEach(letter => {
      row = [];
      for (let i = 1; i <= 10; i++) {
        row.push(
          <div id={letter + i} key={letter + i} className="block">
            <small className="block-text">
              {letter}
              {i}
            </small>
          </div>
        );
      }
      grid.push(
        <div key={"row" + letter} className="grid-row">
          {row}
        </div>
      );
    });
    //CREATE OTHER GRID:
    let grid2 = [];
    let row2 = [];
    let letters2 = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
    letters2.forEach(letter => {
      row2 = [];
      for (let i = 1; i <= 10; i++) {
        row2.push(
          <div
            id={"other" + letter + i}
            onClick={this.handleGuess}
            key={letter + i}
            className="block"
          >
            <small className="block-text">
              {letter}
              {i}
            </small>
          </div>
        );
      }
      grid2.push(
        <div key={"row" + letter} className="grid-row">
          {row2}
        </div>
      );
    });

    //CREATE SHIPS:
    let completedShips = [];
    if (this.state.updated === true) {
      completedShips = [];

      thisPlayer.ships.forEach(ship => {
        let element = document.getElementById(ship.location);
        let windowInfo = element.getBoundingClientRect();
        let scrollLeft =
          window.pageXOffset || document.documentElement.scrollLeft;
        let scrollTop =
          window.pageYOffset || document.documentElement.scrollTop;
        let top = windowInfo.top + scrollTop;
        let left = windowInfo.left + scrollLeft;

        let dynamicStyle = {
          position: "absolute",
          left: left + "px",
          top: top + "px"
        };
        let orientation = ship.orientation;
        let acronym = ship.acronym;
        let name = ship.name;
        let color = ship.color;
        completedShips.push({
          color,
          acronym,
          name,
          dynamicStyle,
          orientation
        });
      });
    }

    let shipList = null;
    if (completedShips.length === 5) {
      shipList = completedShips.map(ship => (
        <div
          key={ship.location + ship.name}
          className={`ship ${ship.acronym + ship.orientation} ${ship.color}`}
          style={ship.dynamicStyle}
        >
          <p className={`no-wrap ${ship.orientation}`}>
            {ship.name.toUpperCase()}
          </p>
        </div>
      ));
    }

    return (
      <div className="full-height">
        <div className="row height-100">
          <div className="col l2 center height-100 blue">
            <div className="center">
              <h3>GAME</h3>
              <h5>Whos turn is it?</h5>
              <p>*PLAYER</p>
              <h5>SHIPS SUNK:</h5>
              <p>*SHIPS</p>
            </div>
          </div>
          <div className="col l5 center height-100 grey darken-2">
            <div className="center">
              <h3>Your Board</h3>
              {grid}
              {shipList}
            </div>
          </div>
          <div className="col l5 center height-100 blue">
            <div className="center">
              <h3>Other Board</h3>
              {grid2}
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
  if (users !== undefined && thisPlayer !== null) {
    thisPlayerInfo = users.find(user => user.id === thisPlayer.userReference);
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
