import React from "react";

import Row from "./Row";

const Grid = ({ typeOfGrid, blockClicked }) => {
  let grid = [];
  let letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
  if (typeOfGrid === "playerSetup") {
    letters.forEach(letter => {
      grid.push(
        <Row key={letter} letter={letter} blockClicked={blockClicked} />
      );
    });
  } else if (typeOfGrid === "gamePlay") {
    letters.forEach(letter => {
      grid.push(
        <Row key={letter} letter={letter} blockClicked={blockClicked} />
      );
    });
  } else {
    letters.forEach(letter => {
      grid.push(
        <Row
          key={letter}
          letter={"other" + letter}
          blockClicked={blockClicked}
        />
      );
    });
  }
  return <div>{grid}</div>;
};

export default Grid;
