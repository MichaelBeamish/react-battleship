import React from "react";

const Pins = ({ hits, misses, who }) => {
  if (hits !== null) {
    if (who === "me") {
      let hitsArray = [];
      hits.forEach(hit => {
        let element = document.getElementById("other" + hit);
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

        let name = hit;
        hitsArray.push({
          dynamicStyle,
          name
        });
      });
      let missesArray = [];
      misses.forEach(miss => {
        let element = document.getElementById("other" + miss);
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

        let name = miss;
        missesArray.push({
          dynamicStyle,
          name
        });
      });
      let hitList = hitsArray.map((hit, index) => (
        <span key={index} className="red pin" style={hit.dynamicStyle} />
      ));
      let missList = missesArray.map((miss, index) => (
        <span key={index} className="white pin" style={miss.dynamicStyle} />
      ));
      return (
        <span>
          {hitList}
          {missList}
        </span>
      );
    } else {
      let hitsArray = [];
      hits.forEach(hit => {
        let element = document.getElementById(hit);
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

        let name = hit;
        hitsArray.push({
          dynamicStyle,
          name
        });
      });
      let missesArray = [];
      misses.forEach(miss => {
        let element = document.getElementById(miss);
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

        let name = miss;
        missesArray.push({
          dynamicStyle,
          name
        });
      });
      let hitList = hitsArray.map((hit, index) => (
        <span key={index} className="red pin" style={hit.dynamicStyle} />
      ));
      let missList = missesArray.map((miss, index) => (
        <span key={index} className="white pin" style={miss.dynamicStyle} />
      ));
      return (
        <span>
          {hitList}
          {missList}
        </span>
      );
    }
  } else {
    return null;
  }
};

export default Pins;
