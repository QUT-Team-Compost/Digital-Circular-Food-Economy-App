// Script for the screen showing the data from the Substation33 compost
// sensors.

// ------------ Imports ------------
import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { sharedStyles, dprint } from '../components/SharedComponents.js';
import { useState, useEffect } from 'react';
import RNSpeedometer from 'react-native-speedometer'
import Svg, {
  Rect,
  Line
} from 'react-native-svg';
import axios from 'axios';
import dateFormat from "dateformat";

// Environment variables used here.
import {SERVER_BASE_URL} from "@env"

// ------------ App code start ------------

// The RNSpeedometer component can take in an array of objects to define
// colours. This needs both a key property as well as a string with the actual
// colour in hexadecimal. The component can also take a label for each colour
// but that is not used here.

// Colours for the gauge showing the methane level, from green to red.
const MethaneColours = [
  {
    key: 1,
    activeBarColor: '#1a9850'
  },
  {
    key: 2,
    activeBarColor: '#91cf60'
  },
  {
    key: 3,
    activeBarColor: '#d9ef8b'
  },
  {
    key: 4,
    activeBarColor: '#fee08b'
  },
  {
    key: 5,
    activeBarColor: '#fc8d59'
  },
  {
    key: 6,
    activeBarColor: '#d73027'
  }
];

// Colours for the gauge showing the humidity level, from white to blue.
const HumidityColours = [
  {
    key: 1,
    activeBarColor: '#eff3ff'
  },
  {
    key: 2,
    activeBarColor: '#c6dbef'
  },
  {
    key: 3,
    activeBarColor: '#9ecae1'
  },
  {
    key: 4,
    activeBarColor: '#6baed6'
  },
  {
    key: 5,
    activeBarColor: '#3182bd'
  },
  {
    key: 6,
    activeBarColor: '#08519c'
  }
];

// Component that shows a semi-circular gauge for data, using the RNSpeedometer
// library.
// Expects the following props: 
// - header: The title of the gauge.
// - value: The current level of the gauge.
// - minValue: The minimum level of the gauge.
// - maxValue: The maximum level of the gauge.
// - valueUnit: The unit of measure for the gauge level.
// - colourScheme: The colours to use for the gauge.
function SensorGauge (props) {
  const header = props.header;
  const value = props.value;
  const minValue = props.minValue;
  const maxValue = props.maxValue;
  const valueUnit = props.valueUnit;
  const colourScheme = props.colourScheme;

  // Render the gauge component with a title as well as showing the minimum and
  // maximum values on either side.
  return (
  <View style={styles.outsideContainer}>
    <Text style={styles.SensorHeaderText}>{header}</Text>
      <View style={styles.SensorGaugeContainer}>
        <RNSpeedometer value={value}
          size={200}
          minValue={minValue}
          maxValue={maxValue}
          labelStyle={{ height: 0, width: 0 }}
          labelNoteStyle={{ height: 0, width: 0 }}
          labels={colourScheme}
          />
        </View>
        <View style={styles.SensorGaugeContainer}>
          <View style={styles.SensorGaugeValueTextContainer}>
            <Text style={styles.SensorMinValueText}>{minValue}{valueUnit}</Text>
            <Text style={styles.SensorMaxValueText}>{maxValue}{valueUnit}</Text>
          </View>
        </View>
      <Text style={styles.SensorValueText}>{value}{valueUnit}</Text>
    </View>
  )
}

// Component that shows a vertical gauge for temperature data, using SVG
// graphics.
// Expects the following props: 
// - header: The title of the gauge.
// - value: The current level of the gauge.
// - minValue: The minimum level of the gauge.
// - maxValue: The maximum level of the gauge.
function SensorTemp (props) {
  const header = props.header;
  const value = props.value;
  const minValue = props.minValue;
  const maxValue = props.maxValue;

  // Determine the height of the gauge value based on the minimum and maximum
  // values.
  var tempHeight;
  if (value > maxValue) {
    tempHeight = 100;
  } else if (value < minValue) {
    tempHeight = 0;
  } else {
    tempHeight = 100 * (value / (maxValue - minValue));
  }

  // Render the gauge component with a title.
  return (
    <View style={styles.outsideContainer}>
      <Text style={styles.SensorHeaderText}>{header}</Text>
        <View style={styles.SensorTempContainer}>
          <Svg height="220" width="60" viewBox="0 0 30 110">
              <Rect x="3" y="3" rx="2" ry="2" width="24" height="104" fill="white" />
              <Rect x="5" y="5" rx="2" ry="2" width="20" height="100" fill="black" />
              <Rect x="5" y={105 - tempHeight} rx="2" ry="2" width="20" height={tempHeight} fill="red" />
              <Line x1="4" x2="10" y1="15" y2="15" stroke="white" strokeWidth="2" />
              <Line x1="4" x2="10" y1="25" y2="25" stroke="white" strokeWidth="2" />
              <Line x1="4" x2="10" y1="35" y2="35" stroke="white" strokeWidth="2" />
              <Line x1="4" x2="10" y1="45" y2="45" stroke="white" strokeWidth="2" />
              <Line x1="4" x2="10" y1="55" y2="55" stroke="white" strokeWidth="2" />
              <Line x1="4" x2="10" y1="65" y2="65" stroke="white" strokeWidth="2" />
              <Line x1="4" x2="10" y1="75" y2="75" stroke="white" strokeWidth="2" />
              <Line x1="4" x2="10" y1="85" y2="85" stroke="white" strokeWidth="2" />
              <Line x1="4" x2="10" y1="95" y2="95" stroke="white" strokeWidth="2" />
            </Svg>
          </View>
        <Text style={styles.SensorValueText}>{value}</Text>
      </View>
    )
}

// https://stackoverflow.com/a/27013409
// Parses an ISOString to get the correct date and time.
function parseISOString(s) {
  var b = s.split(/\D+/);
  return new Date(Date.UTC(b[0], --b[1], b[2], b[3], b[4], b[5], b[6]));
}

// The main component. It shows the latest sensor data from the cloud server,
// if it is available.
// The retrieved data should be a JSON array of objects with the following
// properties. This is based on the data that the Substation33 compost sensor
// sends to Thingsboard, which the mobile app's server gets the data from and
// puts it in a database. All properties are floats except for the timestamp
// which is a date.
// mv: Voltage of the methane sensor. The actual PPM is this value, minus 2,
//      divided by 5 and then multiplied by 10000. Values under 2 are invalid.
// mvmax: Maximum voltage of the methane sensor in the last 30 minutes.
// mvmin: Minimum voltage of the methane sensor in the last 30 minutes.
// h: The current humidity in percent.
// st: The temperature at the sensor in the compost.
// et: The temperature outside the sensor.
// timestamp: The date and time this data was sent to the server.
export default function SensorScreen( {navigation, route} ) {

    // Store the sensor data, and if any data was actually loaded.
    const [sensorData, setSensorData] = useState(-1);
    const [dataLoaded, setDataLoaded] = useState(-1);

    const loadData = () => {
      dprint("SensorScreen: running loadData()");
      dprint("Server URL is " + SERVER_BASE_URL);
      axios.post(SERVER_BASE_URL + "/getSensorData", {'sensor_id': "d444f210-9025-11eb-b5ca-d76ebde59f16"}, {
          headers: {
            'Content-Type': 'application/json', 'Accept': 'application/json'
          }
        }).then(function(response) {
          setSensorData(response.data.sensor_data);
          setDataLoaded(true);
        }).catch(function(error) {
          dprint('Error on getting sensor data: ' + error);
          setDataLoaded(false);
        });
      }

    // Attempt to load the data from the cloud server. If no data can be
    // loaded, the status of data loading is set to false.
    useEffect(() => {
      if (dataLoaded === -1) {
        loadData();
      }
      
      // Reload data when the user focuses on the screen again.
      const willFocusSubscription = navigation.addListener("focus", () => {
        loadData();
      })
      return willFocusSubscription;
    }, []);

    // Before any attempts to load data, show that the app is loading data.
    if (dataLoaded === -1) {
      return (<View style={sharedStyles.standardContainer}>
          <Text style={sharedStyles.bannerText}>Now loading sensor data...</Text>
        </View>);

    // If data failed to load, show a message saying so.
    } else if (dataLoaded === false || sensorData === -1) {
      return (<View style={sharedStyles.standardContainer}>
          <Text style={sharedStyles.bannerText}>We couldn't load sensor data right now. Please try again later!</Text>
        </View>);

    // Otherwise, parse the donwloaded data for showing in gauges.
    } else {
      var firstRow = sensorData[0];
      var mv = Number.parseFloat(firstRow.mv);
      var h = Number.parseFloat(firstRow.h);
      var st = Number.parseFloat(firstRow.st);
      var et = Number.parseFloat(firstRow.et);
      var mvmin = Number.parseFloat(firstRow.mvmin);
      var mvmax = Number.parseFloat(firstRow.mvmax);
      var timestamp = dateFormat(
        parseISOString(firstRow.timestamp)
        , "dddd, mmmm dS, yyyy, h:MM:ss TT");
      var methanePPM = Math.round(mv >= 2 ? ((mv - 2) / 5) * 10000 : 0);
      var methanePPMMin = Math.round(mvmin >= 2 ? ((mvmin - 2) / 5) * 10000 : 0);
      var methanePPMMax = Math.round(mvmax >= 2 ? ((mvmax - 2) / 5) * 10000 : 0);
      return (
        <View style={sharedStyles.standardContainer}>
            <ScrollView style={sharedStyles.standardContainer} contentContainerStyle={sharedStyles.contentContainer}>
              <Text style={styles.TitleText}>Sensor data as of {timestamp}:</Text>
              <SensorGauge header={"Methane level"} value={methanePPM} minValue={0} maxValue={10000} valueUnit={" ppm"} colourScheme={MethaneColours}/>
              <Text style={styles.SubText}>Range in last 30 minutes: {methanePPMMin} ppm - {methanePPMMax} ppm</Text>
              <SensorGauge header={"Humidity"} value={h} minValue={0} maxValue={100} valueUnit={"%"} colourScheme={HumidityColours}/>
              <View style={styles.SensorTempParentContainer}>
                <SensorTemp header={"Sensor temperature"} value={st} minValue={0} maxValue={100}/>
                <SensorTemp header={"External temperature"} value={et} minValue={0} maxValue={100}/>
              </View>
              </ScrollView>
        </View>
      );
    }
  }

// Styles used only in this script.
const styles = StyleSheet.create({
  SensorHeaderText: {
    fontSize: 20,
    color: 'black',
    textAlign: 'center'
  },
  SensorValueText: {
    fontSize: 20,
    color: 'black',
    textAlign: 'center',
    fontWeight: 'bold'
  },
  SensorMinValueText: {
    textAlign: "left",
    fontSize: 15,
    color: 'black',
    fontWeight: 'bold'
  },
  SensorMaxValueText: {
    textAlign: "right",
    fontSize: 15,
    color: 'black',
    fontWeight: 'bold'
  },
  SensorGaugeContainer: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    alignContent: "center",
    alignItems: "flex-end",
    justifyContent: "center"
  },
  SensorTempContainer: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    alignContent: "center",
    alignItems: "flex-end",
    justifyContent: "center"
  },
  outsideContainer: {
    paddingTop: 30
  },  
  TitleText: {
    fontSize: 20,
    color: 'black',
    textAlign: 'center',
    fontWeight: 'bold'
  },
  SubText: {
    fontSize: 15,
    color: 'black',
    textAlign: 'center'
  },
  SensorTempParentContainer: {
      display: "flex",
      flexDirection: "row",
      flexWrap: "wrap",
      alignContent: "center",
      alignItems: "center",
      justifyContent: "space-evenly"
  },
  SensorGaugeValueTextContainer: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    alignContent: "space-between",
    justifyContent: "space-between",
    width: 200
  }
});