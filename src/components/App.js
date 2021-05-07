// Import der Dependency-Bibliotheken
import React, { useEffect, useState } from 'react';
import { 
  MenuItem, 
  Select, 
  FormControl, 
  Card, CardContent 
} from '@material-ui/core';
import { sortData, prettyPrintStat } from '../util';

// Import der React-Komponenten
import InfoBox from './InfoBox';
import Map from './Map';
import Table from './Table';
import LineGraph from './LineGraph';

// Import der Styles
import '../styles/App.css';
import "leaflet/dist/leaflet.css";
import "../styles/InfoBox.css";


// Hauptfunktion der App
function App() {
  // Anlegen der State-Variablen
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState("worldwide");
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [mapCenter, setMapCenter] = useState([50.084548, 9.246232]);
  const [zoom, setZoom] = useState(7);
  const [mapCountries, setMapCountries] = useState([]);
  const [casesType, setCasesType] = useState("recovered");
  const [isLoading, setLoading] = useState(false);
  const [lineColor, setLineColor] = useState("rgba(144,238,144 ,0.5 )");
  const [borderColor, setBorderColor] = useState("rgba(144,238,144 ,0.7 )");
  const [graphHeader, setGraphHeader] = useState("Genesene");
  // const [vaccineInfo, setVaccineInfo] = useState({});

  // Effekt-Hook, lädt beim ersten Rendering 
  // die weltweiten Krankheitsfälle, für heute, gestern, und vorgestern
  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all")
      .then((response) => response.json())
      .then((data) => {
        setCountryInfo(data);
      });
  }, [])

// Effekt-Hook, lädt beim ersten Rendering 
  // die weltweiten Krankheitsfälle, für heute, gestern, und vorgestern
  //fetch("https://disease.sh/v3/covid-19/vaccine/coverage/countries")
      //.then((response) => response.json())
      //.then((data) => {
        //setCountryInfo(data);       
      //});
  //}, [])

  // Effekt-Hook, lädt beim ersten Rendering 
  // die totalen Krankheitsfälle nach Ländernamen/-kürzel 
  useEffect(() => {
    const getCountriesData = async () => {
      await fetch("https://disease.sh/v3/covid-19/countries")
        .then((response) => response.json())
        .then((data) => {
          const countries = data.map((country) => ({
            name: country.country,          // United States, United Kingdom
            value: country.countryInfo.iso2 // UK, USA, FR        
          }));
          
          const sortedData = sortData(data);
          setTableData(sortedData);
          setMapCountries(data);
          setCountries(countries);          
        });
    };
    getCountriesData();
  }, []);

  function graphCases(){
    setCasesType("cases");
    setLineColor("rgba(139,0,0,0.5)");
    setBorderColor("rgba(139,0,0,0.7)");
    setGraphHeader("Erkrankte");
  }
  
  function graphRecovered(){
    setCasesType("recovered");
    setLineColor("rgba(144,238,144,0.5)");
    setBorderColor(("rgba(144,238,144,0.7 )"));
    setGraphHeader("Genesene");
  }
  
  function graphDeaths(){
    setCasesType("deaths");
    setLineColor("rgba(255,255,255,0.5)");
    setBorderColor("rgba(255,255,255,0.7)");
    setGraphHeader("Verstorbene");
  }

  // Funktion zur Ausführung bei Länderwechsel im Select-Menü
  const onCountryChange = async (event) => {
    const CountryCode = event.target.value;
    setCountry(CountryCode);

    // Wenn worldwide gewählt wird, benutze die "all"-URL, sonst die URL des jeweiligen Landes
    // Achtung Ausdrücke mit String Concat müssen in "Backticks" stehen!

    const url = CountryCode === "worldwide"
    ? "https://disease.sh/v3/covid-19/all"
    : `https://disease.sh/v3/covid-19/countries/${CountryCode}`;

    await fetch(url)
    .then(response => response.json())
    .then(data => {
      setCountry(CountryCode);
      setCountryInfo(data);
      setLoading(false);
      if (CountryCode === "worldwide")
      {
        setMapCenter([50.084548, 9.246232]);
        setZoom(4);
      }
      else 
      {
        setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
        setZoom(6);
      }                 
    });
  };
  
    return (
    <div className="app">
      <div className="app__left">
        <div className="app__header">
          <h1>COVID 19 Daten</h1>
          <FormControl className="app_dropdown">
            <Select 
              variant="outlined" 
              onChange={onCountryChange} 
              value={country}
              style={{'color':'wheat', 'backgroundColor':'lightslategrey', 'borderRadius':'10px'}}              
            >
              <MenuItem value="worldwide">Worldwide</MenuItem>
              {countries.map((country) => (
                <MenuItem key={country} value={country.value}>{country.name}</MenuItem>
              )
              )}
            </Select>
          </FormControl>
        </div>
       
        <div className="app__stats">
          <InfoBox
            isRed
            active={casesType === "cases"}
            className="infoBox__cases"
            onClick={(e) => graphCases()}
            title="Erkankte Personen"
            total={prettyPrintStat(countryInfo.cases)}
            cases={prettyPrintStat(countryInfo.todayCases)}
            isloading={isLoading}
          />
          <InfoBox
            active={casesType === "recovered"}
            className="infoBox__recovered"
            onClick={(e) => graphRecovered()}
            title="Wiedergenesene Personen"
            total={prettyPrintStat(countryInfo.recovered)}
            cases={prettyPrintStat(countryInfo.todayRecovered)}
            isloading={isLoading}
          />
          <InfoBox
            isGrey
            active={casesType === "deaths"}
            className="infoBox__deaths"
            onClick={(e) => graphDeaths()}
            title="Verstorbene Personen"
            total={prettyPrintStat(countryInfo.deaths)}
            cases={prettyPrintStat(countryInfo.todayDeaths)}
            isloading={isLoading}
          />
        </div>
        {/* Map */}
        <Map
          countries={mapCountries}
          center={mapCenter}
          zoom={zoom}
          casesType={casesType}
        />
      </div>
      <Card className="app__right" style={{'background' : 'lightslategrey', 'borderRadius': '20px'}}>
        <CardContent>
          <h3>Krankheitsfälle pro Land</h3>
          <Table countries={tableData} />
          <h3 className="app__graphTitle">Weltweit {graphHeader}</h3>
          <LineGraph className="app__graph" casesType={casesType} lineColor={lineColor} borderColor={borderColor}/>
        </CardContent>
        {/* Table */}
        {/* Graph */}
      </Card>
    </div>
  );
}


export default App;
