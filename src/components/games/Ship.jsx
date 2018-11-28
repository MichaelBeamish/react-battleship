import React from "react";

const Ship = ({ ship }) => {
  return (
    <div
      key={ship.acronym}
      className={`ship ${ship.acronym + ship.orientation} ${ship.color}`}
      style={ship.dynamicStyle}
    >
      <p className={`no-wrap ${ship.orientation}`}>{ship.name.toUpperCase()}</p>
    </div>
  );
};

export default Ship;
