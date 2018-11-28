import React from "react";

const ShipsButtons = ({ allShips, handleShipClick }) => {
  let shipsAbbreviated = ["AC", "BS", "SM", "DS", "CR"];
  let buttonList = shipsAbbreviated.map(ship => (
    <button
      id={ship}
      key={ship}
      onClick={() => handleShipClick(ship)}
      className={`btn ship-buttons ${allShips[ship].color}`}
    >
      {allShips[ship].name.toUpperCase()}
    </button>
  ));
  return <div>{buttonList}</div>;
};

export default ShipsButtons;
