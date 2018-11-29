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

      //Find next ship.
      let allOptions = ["AC", "BS", "SM", "DS", "CR"];
      let currentIndex = allOptions.indexOf(this.state.shipClicked);
      let nextShip;
      if (currentIndex === 4) {
        nextShip = allOptions[0];
      } else {
        nextShip = allOptions[currentIndex + 1];
      }

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
          messageToUser: "",
          shipClicked: nextShip
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
        <div className="row height-100">
          <div className="col l3 height-100">
            <div className="what-to-do">
              <h3>What to do:</h3>
              <h6>(1) Click a ship to select it. (right side)</h6>
              <h6>(2) Choose orientation. (vertical or horizontal)</h6>
              <h6>(3) Select a grid-block to place it on.</h6>
              <h6>(4) Place all five ships.</h6>
              <h6>(5) Click the finalize button.</h6>
            </div>
            <div className="directions">
              <h4>Selected:</h4>
              <div className="selected-ship center">
                {this.state.orientation === "horizontal" ? (
                  <button
                    className={`${this.state.shipClicked +
                      "ship-width"} ship-buttons ${
                      this.state[this.state.shipClicked].color
                    }`}
                  >
                    {this.state[this.state.shipClicked].name.toUpperCase()}
                  </button>
                ) : (
                  <button
                    className={`${this.state.shipClicked +
                      "ship-width"} ship-buttons right-90 ${
                      this.state[this.state.shipClicked].color
                    }`}
                  >
                    {this.state[this.state.shipClicked].name.toUpperCase()}
                  </button>
                )}
              </div>

              {this.state.messageToUser ? (
                <div className="row messages-display">
                  <div className="col l2">
                    <h5 className="red-text center">
                      <b>NOTE:</b>
                    </h5>
                  </div>
                  <div className="col l10 white-text">
                    <h6>{this.state.messageToUser}</h6>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
          <div className="col l6 center height-100">
            <h3>Set Up Your Board</h3>
            {this.state.orientation === "horizontal" ? (
              <div className="right-cursor">
                <Grid
                  typeOfGrid={"playerSetup"}
                  blockClicked={this.blockClicked}
                />
              </div>
            ) : (
              <div className="down-cursor">
                <Grid
                  typeOfGrid={"playerSetup"}
                  blockClicked={this.blockClicked}
                />
              </div>
            )}
          </div>
          <div className="col l3 height-100">
            <div className="right-col">
              <div className="h-v-button-container">
                {this.state.orientation === "horizontal" ? (
                  <div className="center">
                    <button
                      className="btn black hz-btn"
                      onClick={this.verticalClicked}
                    >
                      Horizontal
                    </button>
                  </div>
                ) : (
                  <div className="center">
                    <button
                      className="btn black vt-btn"
                      onClick={this.horizontalClicked}
                    >
                      Vertical
                    </button>
                  </div>
                )}
              </div>
              <div className="ships center">
                {this.state.orientation === "horizontal" ? (
                  <div className="shps-hz">
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
                ) : (
                  <div className="shps-vt">
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
                )}
              </div>
              <div className="finalize-container center">
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
              </div>
              <Ships
                allShips={{
                  AC: this.state.AC,
                  BS: this.state.BS,
                  SM: this.state.SM,
                  DS: this.state.DS,
                  CR: this.state.CR
                }}
                who={"me"}
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
