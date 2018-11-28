import React, { Component } from "react";
import { Redirect } from "react-router-dom";

import { connect } from "react-redux"; //Connects redux store to component.
import { firestoreConnect } from "react-redux-firebase"; //Connects firestore to redux store.
import { compose } from "redux";

//COMPONENTS:
import Grid from "./Grid";
import Ships from "./Ships";
import ShipsButtons from "./ShipsButtons";

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
      occupiedBlocks: [],
      size: 5
    },
    BS: {
      location: null,
      orientation: null,
      name: "battleship",
      acronym: "BS",
      color: "orange",
      occupiedBlocks: [],
      size: 4
    },
    SM: {
      location: null,
      orientation: null,
      name: "submarine",
      acronym: "SM",
      color: "green",
      occupiedBlocks: [],
      size: 3
    },
    DS: {
      location: null,
      orientation: null,
      name: "destroyer",
      acronym: "DS",
      color: "purple",
      occupiedBlocks: [],
      size: 3
    },
    CR: {
      location: null,
      orientation: null,
      name: "cruiser",
      acronym: "CR",
      color: "blue",
      occupiedBlocks: [],
      size: 2
    }
  };

  handleShipClick = ship => {
    this.setState({
      shipClicked: ship
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
  blockClicked = numLetter => {
    if (this.state.shipClicked !== null) {
      let message = "";
      let blockClicked = numLetter;
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
            location: numLetter,
            orientation: this.state.orientation,
            name: shipName,
            acronym: this.state[shipAcronym].acronym,
            color: this.state[shipAcronym].color,
            size: this.state[shipAcronym].size,
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
      if (thisPlayer.setUpBoard === true) {
        return <Redirect to={"/game/" + gameID} />;
      }
    }

    return (
      <div className="full-height">
        <div className="row height-100 container">
          <div className="col l4 center height-100">
            <h3>Your Ships</h3>
            <span className="left">(1) Click a ship to select it.</span>
            <br />
            <span className="left">(2) Choose vertical or horizontal.</span>
            <br />
            <span className="left">(3) Click a block to place it.</span>
            <div className="ships center">
              <ShipsButtons
                allShips={{
                  [this.state.AC.acronym]: this.state.AC,
                  [this.state.BS.acronym]: this.state.BS,
                  [this.state.SM.acronym]: this.state.SM,
                  [this.state.DS.acronym]: this.state.DS,
                  [this.state.CR.acronym]: this.state.CR
                }}
                handleShipClick={this.handleShipClick}
              />
            </div>
            <div className="horizOrVert">
              {this.state.orientation === "horizontal" ? (
                <button
                  onClick={this.verticalClicked}
                  className={`btn hz-btn ${"hbtn" + this.state.orientation}`}
                >
                  Horizontal
                </button>
              ) : (
                <button
                  onClick={this.horizontalClicked}
                  className={`btn vt-btn ${"vbtn" + this.state.orientation}`}
                >
                  Vertical
                </button>
              )}
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
            <Ships
              allShips={{
                AC: this.state.AC,
                BS: this.state.BS,
                SM: this.state.SM,
                DS: this.state.DS,
                CR: this.state.CR
              }}
            />
          </div>
          <div className="col l8 center height-100">
            <h3>Set Up Your Board</h3>
            <Grid typeOfGrid={"playerSetup"} blockClicked={this.blockClicked} />
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
