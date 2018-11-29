import React from "react";
import Ship from "./Ship";

const Ships = ({ allShips, who, sunkShips }) => {
  if (allShips !== null) {
    if (who === "me") {
      let shipsAbbreviated = ["AC", "BS", "SM", "DS", "CR"];
      let shipsArray = [];
      shipsAbbreviated.forEach(ship => {
        if (allShips[ship].location !== null) {
          let element = document.getElementById(allShips[ship].location);
          let windowInfo = element.getBoundingClientRect();
          let scrollLeft =
            window.pageXOffset || document.documentElement.scrollLeft;
          let scrollTop =
            window.pageYOffset || document.documentElement.scrollTop;
          let top = windowInfo.top + scrollTop;
          let left = windowInfo.left + scrollLeft;

          let dynamicStyle = {
            position: "absolute",
            left: left + "px",
            top: top + "px"
          };
          let orientation = allShips[ship].orientation;
          let acronym = allShips[ship].acronym;
          let name = allShips[ship].name;
          let color = allShips[ship].color;
          shipsArray.push({
            color,
            acronym,
            name,
            dynamicStyle,
            orientation
          });
        }
      });
      let shipList = shipsArray.map((ship, index) => (
        <Ship key={index} ship={ship} />
      ));
      return <div>{shipList}</div>;
    } else {
      let shipsAbbreviated = sunkShips;
      let shipsArray = [];
      shipsAbbreviated.forEach(ship => {
        if (allShips[ship].location !== null) {
          let element = document.getElementById(
            "other" + allShips[ship].location
          );
          let windowInfo = element.getBoundingClientRect();
          let scrollLeft =
            window.pageXOffset || document.documentElement.scrollLeft;
          let scrollTop =
            window.pageYOffset || document.documentElement.scrollTop;
          let top = windowInfo.top + scrollTop;
          let left = windowInfo.left + scrollLeft;

          let dynamicStyle = {
            position: "absolute",
            left: left + "px",
            top: top + "px"
          };
          let orientation = allShips[ship].orientation;
          let acronym = allShips[ship].acronym;
          let name = allShips[ship].name;
          let color = allShips[ship].color;
          shipsArray.push({
            color,
            acronym,
            name,
            dynamicStyle,
            orientation
          });
        }
      });
      let shipList = shipsArray.map((ship, index) => (
        <Ship key={index} ship={ship} />
      ));
      return <div>{shipList}</div>;
    }
  } else {
    return null;
  }
};

export default Ships;
