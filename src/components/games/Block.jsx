import React from "react";

const Block = ({ letter, number, blockClicked }) => {
  let lastLetterOnly = letter;
  if (letter.length > 1) {
    lastLetterOnly = letter[letter.length - 1];
  }
  if (blockClicked) {
    return (
      <div
        id={letter + number}
        onClick={() => blockClicked(lastLetterOnly + number)}
        key={lastLetterOnly + number}
        className="block"
      >
        <small className="block-text">
          {lastLetterOnly}
          {number}
        </small>
      </div>
    );
  } else {
    return (
      <div id={letter + number} key={lastLetterOnly + number} className="block">
        <small className="block-text">
          {lastLetterOnly}
          {number}
        </small>
      </div>
    );
  }
};

export default Block;
