import React from "react";

const Splash = () => {
  return (
    <div className="full-height">
      <div className="splash container center">
        <h1>Battleship</h1>
        <img className="ship-img" src="/images/ship.jpg" alt="ship" />
        <p>
          Battleship is a war-themed board game for two players in which the
          opponents try to guess the location of the other's various ships. A
          paper and pencil version of the game dates back to World War I, but
          most people are familiar with the game through the plastic board game
          that was first marketed by the Milton Bradley Company in 1967. Since
          then, the game has spawned various video games and smartphone app
          variations. Today, the board game version is produced by Hasbro, which
          acquired Milton Bradley in 1984. The object of the game is to guess
          the location of the ships each player hides on a plastic grid
          containing vertical and horizontal space coordinates. Players take
          turns calling out row and column coordinates on the other player's
          grid in an attempt to identify a square that contains a ship. The game
          board each player gets has two grids. One of the grids is used by the
          player to "hide" the location of his own ships, while the other grid
          is used to record the shots fired toward the opponent and to document
          whether those shots were hits or misses. The goal of the game is to
          sink all of the opponent's ships by correctly guessing their location
          on the grid.{" "}
        </p>
      </div>
    </div>
  );
};

export default Splash;
