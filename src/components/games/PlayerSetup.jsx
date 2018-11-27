import React, { Component } from "react";
import { Redirect } from "react-router-dom";

import { connect } from "react-redux"; //Connects redux store to component.
import { firestoreConnect } from "react-redux-firebase"; //Connects firestore to redux store.
import { compose } from "redux";

class PlayerSetup extends Component {
  state = {
    shipClicked: "AC",
    orientation: "horizontal",
    AC: {
      location: null,
      orientation: null,
      name: "aircraft carrier",
      color: "red"
    },
    BS: {
      location: null,
      orientation: null,
      name: "battleship",
      color: "orange"
    },
    SM: {
      location: null,
      orientation: null,
      name: "submarine",
      color: "green"
    },
    DS: {
      location: null,
      orientation: null,
      name: "destroyer",
      color: "purple"
    },
    CR: { location: null, orientation: null, name: "cruiser", color: "blue" }
  };

  handleShipClick = e => {
    this.setState({
      shipClicked: e.target.id
    });
  };
  verticalClicked = () => {
    this.setState({
      orientation: "vertical"
    });
  };
  horizontalClicked = () => {
    this.setState({
      orientation: "horizontal"
    });
  };
  blockClicked = e => {
    if (this.state.shipClicked !== null) {
      let shipName = this.state[this.state.shipClicked].name;
      let color = this.state[this.state.shipClicked].color;
      this.setState({
        [this.state.shipClicked]: {
          location: e.target.id,
          orientation: this.state.orientation,
          name: shipName,
          color: color
        }
      });
    }
  };

  render() {
    const { auth, game } = this.props;

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

    //CREATE GRID:
    let grid = [];
    let row = [];
    let letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
    letters.forEach(letter => {
      row = [];
      for (let i = 1; i <= 10; i++) {
        row.push(
          <div
            id={letter + i}
            onClick={this.blockClicked}
            key={letter + i}
            className="block"
          >
            {letter}
            {i}
          </div>
        );
      }
      grid.push(
        <div key={"row" + letter} className="grid-row">
          {row}
        </div>
      );
    });

    //RETURN POSITION OF GIVEN ELEMENT:
    function offset(el) {
      var rect = el.getBoundingClientRect(),
        scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
        scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      return { top: rect.top + scrollTop, left: rect.left + scrollLeft };
    }

    //CREATE SHIPS
    let allShips = ["AC", "BS", "SM", "DS", "CR"];
    let completedShips = {};

    if (grid.length === 10) {
      completedShips = [];

      allShips.forEach(ship => {
        if (this.state[ship].location !== null) {
          let position = offset(
            document.getElementById(this.state[ship].location)
          );
          let dynamicStyle = {
            position: "absolute",
            left: position.left + "px",
            top: position.top + "px"
          };
          let orientation = this.state[ship].orientation;
          let acronym = ship;
          let name = this.state[ship].name;
          let color = this.state[ship].color;
          completedShips.push({
            color,
            acronym,
            name,
            dynamicStyle,
            orientation
          });
        }
      });
    }

    let shipList = completedShips.map(ship => (
      <div
        key={ship.acronym}
        className={`ship ${ship.acronym + ship.orientation} ${ship.color}`}
        style={ship.dynamicStyle}
      >
        <p className={`no-wrap ${ship.orientation}`}>
          {ship.name.toUpperCase()}
        </p>
      </div>
    ));

    let buttonList = allShips.map(ship => (
      <button
        id={ship}
        key={ship}
        onClick={this.handleShipClick}
        className={`btn ship-buttons ${this.state[ship].color}`}
      >
        {this.state[ship].name.toUpperCase()}
      </button>
    ));

    return (
      <div className="row full-height">
        <div className="col l4 center height-100">
          <div className="ships center">
            <h3>Your Ships</h3>
            {buttonList}
          </div>
          <div className="horizOrVert center">
            <button
              onClick={this.horizontalClicked}
              className={`btn orient-btn grey ${"hbtn" +
                this.state.orientation}`}
            >
              Horizontal
            </button>
            <button
              onClick={this.verticalClicked}
              className={`btn orient-btn grey ${"vbtn" +
                this.state.orientation}`}
            >
              Vertical
            </button>
          </div>
          <div className="directions">
            <p>
              Click a square to place the{" "}
              <b
                className={`${this.state[this.state.shipClicked].color +
                  "-text"}`}
              >
                {this.state[this.state.shipClicked].name.toUpperCase()}
              </b>
              {this.state.orientation === "horizontal" ? (
                <span>
                  <u> HORIZONTALLY.</u>
                </span>
              ) : (
                <span>
                  <u> VERTICALLY.</u>
                </span>
              )}
            </p>
          </div>
          {shipList}
        </div>
        <div className="col l8 center blue height-100">
          <h3>Set Up Your Board</h3>
          {grid}
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
  connect(mapStateToProps),
  firestoreConnect([{ collection: "users" }, { collection: "games" }])
)(PlayerSetup);
