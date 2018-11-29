import React from "react";

const ShipsButtons = ({ allShips, handleShipClick }) => {
  let shipsAbbreviated = ["AC", "BS", "SM", "DS", "CR"];
  let buttonList = shipsAbbreviated.map(ship => (
    <div key={ship}>
      <button
        id={ship}
        onClick={() => handleShipClick(ship)}
        className={`btn ${ship + "ship-width"} ship-buttons ${
          allShips[ship].color
        }`}
      >
        {allShips[ship].name.toUpperCase()}
      </button>
      <br />
    </div>
  ));
  return <div>{buttonList}</div>;
};

export default ShipsButtons;
