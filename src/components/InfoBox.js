// Import der Dependency-Bibliotheken
import React from "react";
import { Card, CardContent, Typography } from "@material-ui/core";

// Import der Styles
import "../styles/InfoBox.css";

// Hauptfunktion für Komponente der Statusanzeigen
function InfoBox({ title, isRed, isGrey, active, cases, total, ...props }) {
  return (
    <Card
      onClick={props.onClick}
      className={`infoBox ${active && "infoBox--selected"} ${
        isRed && "infoBox--red"
      } ${isGrey && "infoBox--grey"}`}
      style={{'background' : 'lightslategrey', 'borderRadius' : '20px'}}
    >
      <CardContent>
        {/* Title */}
        <Typography className="infoBox__title">
          {title}
        </Typography>

        {/* Number of Cases */}
        <h2
          className={`infoBox__cases ${!isRed && "infoBox__cases--green"} ${
            isGrey && "infoBox__cases--grey"
          }`}
        >
          {props.isloading ? <i className="fa fa-cog fa-spin fa-fw" /> : cases}
        </h2>

        {/* Total Cases */}
        <Typography className="infoBox__total">
          {total} Gesamt
        </Typography>
      </CardContent>
    </Card>
  );
}

export default InfoBox;
