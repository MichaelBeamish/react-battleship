import React, { Component } from "react";
import { Redirect } from "react-router-dom";

import { connect } from "react-redux"; //Connects redux store to component.
import { firestoreConnect } from "react-redux-firebase"; //Connects firestore to redux store.
import { compose } from "redux";

// ACTIONS:
import { finalizePlayerGrid } from "../../store/actions/gameActions";

class PlayerSetup extends Component {
  state = {
    haveAllShipsBeenPlaced: false,
    messageToUser: "",
    allOccupiedBlocks: [],
    shipClicked: "AC",
    orientation: "horizontal",
    AC: {
      location: null,
      orientation: null,
      name: "aircraft carrier",
      acronym: "AC",
      color: "red",
      occupiedBlocks: []
    },
    BS: {
      location: null,
      orientation: null,
      name: "battleship",
      acronym: "BS",
      color: "orange",
      occupiedBlocks: []
    },
    SM: {
      location: null,
      orientation: null,
      name: "submarine",
      acronym: "SM",
      color: "green",
      occupiedBlocks: []
    },
    DS: {
      location: null,
      orientation: null,
      name: "destroyer",
      acronym: "DS",
      color: "purple",
      occupiedBlocks: []
    },
    CR: {
      location: null,
      orientation: null,
      name: "cruiser",
      acronym: "CR",
      color: "blue",
      occupiedBlocks: []
    }
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
  handleFinalize = (gameID, game, player, ships) => {
    if (this.state.haveAllShipsBeenPlaced) {
      this.props.finalizePlayerGrid(gameID, game, player, ships);
    } else {
      this.setState({
        messageToUser: "You need to place all of the ships to continue."
      });
    }
  };
  blockClicked = e => {
    if (this.state.shipClicked !== null) {
      let message = "";
      let blockClicked = e.target.id;
      let blockClickedLetter = blockClicked[0].toLowerCase();
      blockClickedLetter = blockClickedLetter.charCodeAt(0) - 96;
      let blockClickedNumber = blockClicked[1];
      let blockClickedNumber2 = blockClicked[2];
      if (blockClickedNumber2 !== undefined) {
        blockClickedNumber = Number(blockClickedNumber + blockClickedNumber2);
      } else {
        blockClickedNumber = Number(blockClickedNumber);
      }
      let orientation = this.state.orientation;
      let shipAcronym = this.state.shipClicked;
      let shipName = this.state[this.state.shipClicked].name;

      //Board Placement Restrictions:
      let shipSize;
      let okToGo = false;
      //AIRCRAFT CARRIER CHECK:
      if (shipAcronym === "AC") {
        shipSize = 5;
        if (orientation === "horizontal") {
          if (blockClickedNumber < 7) {
            okToGo = true;
          }
        } else {
          if (blockClickedLetter < 7) {
            okToGo = true;
          }
        }
        //BATTLESHIP CHECK:
      } else if (shipAcronym === "BS") {
        shipSize = 4;
        if (orientation === "horizontal") {
          if (blockClickedNumber < 8) {
            okToGo = true;
          }
        } else {
          if (blockClickedLetter < 8) {
            okToGo = true;
          }
        }
      } else if (shipAcronym === "CR") {
        shipSize = 2;
        if (orientation === "horizontal") {
          if (blockClickedNumber < 10) {
            okToGo = true;
          }
        } else {
          if (blockClickedLetter < 10) {
            okToGo = true;
          }
        }
      } else {
        shipSize = 3;
        if (orientation === "horizontal") {
          if (blockClickedNumber < 9) {
            okToGo = true;
          }
        } else {
          if (blockClickedLetter < 9) {
            okToGo = true;
          }
        }
      }
      if (okToGo === false) {
        message = `You can't place the ${this.state[shipAcronym].name} ${
          this.state.orientation
        }ly on '${blockClicked}'. It will run off the edge of the grid.`;
      }

      //THIS SHIP REQUIRED BLOCKS
      let requiredBlocks = [];
      if (orientation === "horizontal") {
        let letter = blockClicked[0]; //Needs to be uppercase.
        for (let i = 0; i < shipSize; i++) {
          requiredBlocks.push(letter + String(blockClickedNumber + i));
        }
      } else {
        let number = String(blockClickedNumber);
        for (let i = 0; i < shipSize; i++) {
          let letter = blockClickedLetter + i;
          letter = String.fromCharCode(96 + letter).toLocaleUpperCase();
          requiredBlocks.push(letter + number);
        }
      }

      //COMPARE REQUIRED TO CURRENT:

      //First remove all current ships existing blocks from used block list.
      let thisShipCurrentState = this.state[shipAcronym].occupiedBlocks;
      let currentStateAllUsedBlocks = this.state.allOccupiedBlocks;
      let currentAllLessCurrentShip = [];
      if (currentStateAllUsedBlocks.length) {
        currentStateAllUsedBlocks.forEach(block => {
          if (!thisShipCurrentState.includes(block)) {
            currentAllLessCurrentShip.push(block);
          }
        });
      }

      //Check if a collision between this ship and all others less this last.
      currentAllLessCurrentShip.forEach(block => {
        if (requiredBlocks.includes(block)) {
          message = `You can't place the ${this.state[shipAcronym].name} ${
            this.state.orientation
          }ly on '${blockClicked}'. It will collide with another ship.`;
          okToGo = false;
        }
      });

      //Combine this ship new with current all less ship last:
      let newAllUsedBlocks = [];
      currentAllLessCurrentShip.forEach(block => {
        newAllUsedBlocks.push(block);
      });
      requiredBlocks.forEach(block => {
        newAllUsedBlocks.push(block);
      });

      //IF EVERYTHING IS OK CHANGE THE STATE:
      if (okToGo) {
        if (newAllUsedBlocks.length === 17) {
          this.setState({
            haveAllShipsBeenPlaced: true
          });
        }

        this.setState({
          [shipAcronym]: {
            location: e.target.id,
            orientation: this.state.orientation,
            name: shipName,
            acronym: this.state[shipAcronym].acronym,
            color: this.state[shipAcronym].color,
            occupiedBlocks: requiredBlocks
          },
          allOccupiedBlocks: newAllUsedBlocks,
          messageToUser: ""
        });
      } else {
        this.setState({
          messageToUser: message
        });
      }
    }
  };

  render() {
    const { auth, game, gameID, thisPlayer } = this.props;

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
    if (game && thisPlayer) {
      if (thisPlayer.setUpBoard === true) {
        return <Redirect to={"/game/" + gameID} />;
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
      <div className="full-height">
        <div className="row height-100">
          <div className="col l4 center height-100 grey darken-2">
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
                    "-text"} clicked-ship`}
                >
                  {this.state[this.state.shipClicked].name.toUpperCase()}
                </b>
                {this.state.orientation === "horizontal" ? (
                  <span>
                    {" "}
                    <u>HORIZONTALLY</u>.
                  </span>
                ) : (
                  <span>
                    {" "}
                    <u>VERTICALLY</u>.
                  </span>
                )}
              </p>
              {this.state.messageToUser ? (
                <div className="row width-100 messages-display">
                  <div className="col l2">
                    <b className="red-text inline">*NOTE*</b>
                  </div>
                  <div className="col l8 white-text">
                    {this.state.messageToUser}
                  </div>
                  <div className="col l2">
                    <b className="red-text">*NOTE*</b>
                  </div>
                </div>
              ) : null}
            </div>
            {this.state.haveAllShipsBeenPlaced ? (
              <button
                onClick={() =>
                  this.handleFinalize(gameID, game, thisPlayer, [
                    this.state.AC,
                    this.state.BS,
                    this.state.SM,
                    this.state.DS,
                    this.state.CR
                  ])
                }
                className="btn submit-button yellow darken-2 black-text"
              >
                Finalize
              </button>
            ) : (
              <button
                onClick={() => this.handleFinalize()}
                className="btn grey"
              >
                Finalize
              </button>
            )}
            {shipList}
          </div>
          <div className="col l8 center blue height-100">
            <h3>Set Up Your Board</h3>
            {grid}
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
)(PlayerSetup);
