import React from "react";

import Block from "./Block";

const Row = ({ letter, blockClicked }) => {
  let row = [];
  for (let i = 1; i <= 10; i++) {
    row.push(
      <Block key={i} letter={letter} number={i} blockClicked={blockClicked} />
    );
  }

  return (
    <div key={"row" + letter} className="grid-row">
      {row}
    </div>
  );
};

export default Row;
