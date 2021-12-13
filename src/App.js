import { Select, MenuItem, FormControl, Card, CardContent } from '@mui/material';
import './App.css';
import React,{ useState, useEffect } from 'react';
import InfoBoxs from './InfoBoxs';
import Map from './Map';
import Table from './Table';
import {sortData} from './util';
import LineGraph from './LineGraph';
import "leaflet/dist/leaflet.css";
import { prettyPrintStat } from './util';

function App() {

    const [countries, setCountries] = useState([]);
    const [country, setCountry] = useState("worldwide");
    const [countryInfo, setCountryInfo] = useState();
    const [ tableData, setTableData ] = useState([]);
    const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
    const [mapZoom, setMapZoom] = useState(3);
    const [mapCountries, setMapCountries] = useState([]);
    const [casesType, setCasesType] = useState("cases");

    useEffect( ()=>{
        if(country === "worldwide")
        {
            fetch("https://disease.sh/v3/covid-19/all?yesterday=today")
                .then( response => response.json())
                .then( data => {
                    setCountryInfo(data); 
                    ////console.log(data);
                })
        }
    }, [])

    useEffect( ()=>{

        const getCountriesData = async() =>{
            await fetch('https://disease.sh/v3/covid-19/countries')
            .then((response)=> response.json())
            .then((data) =>{
                const values = 
                    data.map((country)=>({
                    name: country.country,
                    value: country.countryInfo.iso2
                    }))
                const sortedData = sortData(data);
                setTableData(sortedData);
                setMapCountries(data);
                setCountries(values);
            })
        }

        getCountriesData();

    },[])

    const onCountryChange = async(e) =>{
        const countryCode = e.target.value;

        const url = countryCode === 'worldwide' 
        ? 'https://disease.sh/v3/covid-19/all?yesterday=today' 
        : `https://disease.sh/v3/covid-19/countries/${countryCode}?strict=true`;

        //console.log(url);
        await fetch(url)
        .then( response => response.json())
        .then( data => {
            setCountry(countryCode);
            setCountryInfo(data); 
            if(countryCode !== 'worldwide')
                setMapCenter([data.countryInfo.lat, data.countryInfo.long])
            setMapZoom(4);
            ////console.log(data);
        })
    }

  return (
    <div className="app">
        <div className='app__left'>
            <div className="app__header">
                <h1>COVID-19 TRACKER</h1>
                <FormControl className="app__dropdown">
                    <Select
                        variant="outlined"
                        onChange={onCountryChange}
                        value={country}>
                            <MenuItem value="worldwide">WorldWide</MenuItem>
                            {
                                countries.map( country =>(
                                    <MenuItem value={country.value}
                                    >{country.name}</MenuItem>
                                ))
                            }
                            
                        </Select>
                </FormControl>
            </div>

            <div className='app__stats'>
                <InfoBoxs
                isRed
                active={casesType === "cases"}
                onClick={(e) => setCasesType("cases")}
                 title={"Coronavirus Cases"} 
                 cases={prettyPrintStat(countryInfo?.todayCases)} 
                 total={prettyPrintStat(countryInfo?.cases)}/>

                <InfoBoxs 
                active={casesType === "recovered"}
                onClick={(e) => setCasesType("recovered")}
                title={"Recovered"}
                cases={prettyPrintStat(countryInfo?.todayDeaths)} 
                total={prettyPrintStat(countryInfo?.recovered)}/>

                <InfoBoxs 
                active={casesType === "deaths"}
                onClick={(e) => setCasesType("deaths")}
                title={"Deaths"}
                isRed
                cases={prettyPrintStat(countryInfo?.todayDeaths)} 
                total={prettyPrintStat(countryInfo?.deaths)}/>
            </div>
                
            <Map 
                casesType={casesType}
                countries={mapCountries}
                center={mapCenter} 
                zoom={mapZoom}
            />
        
        </div>
        <Card className='app__right'>
            <CardContent>
                <h3>Live Cases by Country</h3>
                <Table countries={tableData}/>
                <h3>World wide new {casesType}</h3>
                <LineGraph casesType={casesType}/>
            </CardContent>
        </Card>
    </div>
  );
}

export default App;
