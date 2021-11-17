// Script for the screen showing the data from the Substation33 compost
// sensors.

// ------------ Imports ------------
import * as React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { sharedStyles, dprint } from '../components/SharedComponents.js';
import { useState, useEffect } from 'react';
import RNSpeedometer from 'react-native-speedometer'
import Svg, { Rect, Line, G, Circle, Text as SvgText } from 'react-native-svg';
import axios from 'axios';
import { XAxis, YAxis, LineChart } from 'react-native-svg-charts'
import * as scale from 'd3-scale'
import * as shape from 'd3-shape'
import {format, differenceInDays, parseISO} from 'date-fns'

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
// - valueUnit: The unit of measure for the gauge level.
function SensorTemp (props) {
    const header = props.header;
    const value = props.value;
    const minValue = props.minValue;
    const maxValue = props.maxValue;
    const valueUnit = props.valueUnit;

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
            <Text style={styles.SensorValueText}>{value}{valueUnit}</Text>
        </View>
    )
}

// Component that shows a series of methane levels as a line graph.
// Expects the following props: 
// - header: The title of the gauge.
// - data: An array of data objects. Each object should have the form:
//    - value: The methane level after correct conversion to PPM.
//    - date: The date that corresponds to the methane level. Should be a valid
//            date object.
// - dateFormat: A string to format the date. If not given, defaults to "MMM d"
function MethaneGraph (props) {

    // Get the values of the props.
    const header = props.header;
    const data = props.data;
    const dateFormat = props.dateFormat ? props.dateFormat : "MMM d";

    // Specifications used for the graph.
    const numberOfTicks = 4;
    const axisSvg = {
        fontSize: 10,
        fill: 'grey'
    };
    const graphSvg = {
        stroke: 'rgb(134, 65, 244)',
        strokeWidth: 3
    };
    const xContentInsert = {
        left: 15,
        right: 45
    };
    const yContentInsert = {
        top: 10,
        bottom: 10
    };
    const graphContentInsert = {...xContentInsert, ...yContentInsert};

    // Stores the currently tapped data point.
    const [selectedPoint, setSelectedPoint] = useState(-1);

    // Creates a grid to display behind the graph.
    // Grid based on: https://github.com/JesperLekland/react-native-svg-charts/issues/90#issuecomment-374684648
    const CustomGrid = ({ x, y, data, ticks }) => {
        const xValues = data.map((item, index) => item.date)
        const xTicks = scale.scaleTime()
                .domain(xValues)
                .ticks(numberOfTicks)

        return(
            <G
                // If the user presses on an empty space on the graph, hide the
                // toolip if there's any.
                onPress={ () => {
                    if (selectedPoint !== -1) {
                        dprint("Background tapped while a tooltip is visible - removing it.");
                        setSelectedPoint(-1);
                    }
                }}
            >
                {
                    // Background.
                    <Rect key="background" x={0} y={0} width={"100%"} height={"100%"} fill={ "rgb(255,255,255)" } />
                }
                {
                    // Horizontal grid
                    ticks.map(tick => (
                        <Line key={ tick } x1={ '0%' } x2={ '100%' } y1={ y(tick) } y2={ y(tick) } stroke={ 'rgba(0,0,0,0.2)' } />
                    ))
                }
                {
                    // Vertical grid
                    xTicks.map((value, index) => {
                        return (
                        <Line key={ index } y1={ '0%' } y2={ '100%' } x1={ x(value) } x2={ x(value) } stroke={ 'rgba(0,0,0,0.2)' } />
                        )
                    })
                }
                {
                    // Lines for top and bottom.
                    <Line key={"bottom"} y1={'100%'} y2={'100%'} x1={ '0%' } x2={ '100%' } stroke={'rgba(0,0,0,0.2)'} />
                }
                {
                    <Line key={"top"} y1={'0%'} y2={'0%'} x1={ '0%' } x2={ '100%' } stroke={'rgba(0,0,0,0.2)'} />
                }
            </G>
        )
    }

    // Draws a circle at the position of each data point.
    // Based on: https://github.com/JesperLekland/react-native-svg-charts-examples/blob/master/storybook/stories/decorator.js
    const DataCircle = ({ x, y, data }) => {
        return data.map((item, index) => (
            <Circle
                key={ index }
                cx={ x(item.date) }
                cy={ y(item.value) }
                r={ 4 }

                // If the user has tapped on this circle and the tooltip is
                // showing, highlight the cirlce in red.
                stroke={ item === selectedPoint ? "rgb(255, 0, 0)" : "rgb(134, 65, 244)" }
                fill={ 'white' }

                // If the user presses on one of the circles, shows a tooltip
                // showing the corresponding data.
                onPress={ () => {
                    dprint(`Point for ${item.date} was tapped.`);
                    setSelectedPoint(item);
                }}
            />
        ))
    }

    // A tooltip that shows the PPM and time for a data point.
    // Partly based on: https://github.com/JesperLekland/react-native-svg-charts-examples/blob/master/storybook/stories/extras.js
    const Tooltip = ({x, y, height, width}) => {

        // Width and height for the tooltip.
        const tooltipWidth = 150;
        const tooltipHeight = 40;

        // Space that should be left between the border of the graph and the
        // tooltip.
        const graphBorderSpace = 5;

        // Space that should be left between the circle and the tooltip in the
        // X direction.
        const circleSpace = 5;

        // If no data point has been selected, do not render anything.
        if (selectedPoint === -1) {
            return null;

        // Otherwise, render a tooltip.
        } else {
            // Make sure the X and Y value does not cause the tooltip to be
            // outside the graph bounds.
            tooltipX = x(selectedPoint.date) + circleSpace;
            tooltipY = Math.max(y(selectedPoint.value) - tooltipHeight/2, graphBorderSpace);
            if (tooltipX + tooltipWidth + graphBorderSpace > width) {
                tooltipX = x(selectedPoint.date) - tooltipWidth - circleSpace;
            }
            if (tooltipY + tooltipHeight + graphBorderSpace > height) {
                tooltipY = height - tooltipHeight - graphBorderSpace;
            }

            // Draw the tooltip.
            return(<G
                x={ tooltipX }
                y={ tooltipY }
                key={ "tooltip" }

                // If the user presses on the tooltip, hide it.
                onPress={ () => {
                    dprint(`Tooltip for ${selectedPoint.date} was tapped.`);
                    setSelectedPoint(-1);
                }}
            >
                <Rect
                    height={ tooltipHeight }
                    width={ tooltipWidth }
                    stroke={ 'grey' }
                    fill={ 'white' }
                    ry={ 10 }
                    rx={ 10 }
                />
                <SvgText
                    x={tooltipWidth/2}
                    y={tooltipHeight/2}
                    alignmentBaseline={ 'middle' }
                    textAnchor={ 'middle' }
                    stroke={ 'rgb(0, 0, 0)' }
                >
                    {`${selectedPoint.value} ppm at ${format(selectedPoint.date, dateFormat)}`}
                </SvgText>
            </G>);
        }
    }

    return (
        <View style={styles.outsideContainer}>
            <Text style={styles.SensorHeaderText}>{header}</Text>
            <Text style={styles.SubText}>Tap on one of the points to see the exact time and ppm.</Text>

            {/* Main container for the graph components. */}
            <View style={styles.MethaneGraphContainer}>

                {/* Label for Y axis. */}
                <View style={styles.MethaneGraphYAxisLabelContainer}>
                    <Text style={styles.MethaneGraphYAxisLabel}>Methane</Text>
                </View>

                {/* Y axis value lables and ticks. */}
                <YAxis
                    data={data}
                    style={styles.MethaneGraphYAxis}
                    contentInset={yContentInsert}
                    svg={axisSvg}
                    yAccessor={ ({ item }) => item.value }
                    formatLabel={ (value) => `${value} ppm`}
                />

                {/* Container for line graph and X axis. */}
                <View style={styles.MethaneGraphContainerInside}>

                    {/* Line graph. */}
                    <LineChart
                        style={{ flex: 1 }}
                        data={data}
                        contentInset={graphContentInsert}
                        svg={graphSvg}
                        yAccessor={ ({ item }) => item.value }
                        xAccessor={ ({ item }) => item.date }
                        xScale={ scale.scaleTime }
                        curve={ shape.curveLinear }
                    >
                        <CustomGrid belowChart={true}/>
                        <DataCircle/>
                        <Tooltip/>
                    </LineChart>

                    {/* X axis value lables and ticks. */}
                    <XAxis
                        style={styles.MethaneGraphXAxis}
                        data={data}
                        formatLabel={(value, index) => index}
                        contentInset={xContentInsert}
                        svg={axisSvg}
                        xAccessor={ ({ item }) => item.date }
                        scale={ scale.scaleTime }
                        formatLabel={ (value) => format(value, dateFormat) }
                        numberOfTicks = {numberOfTicks}
                    />

                    {/* Label for X axis. */}
                    <Text style={styles.MethaneGraphXAxisLabel}>Time</Text>
                </View>
            </View>
        </View>
    );
}

// Checks a row of the sensor data to ensure it is valid.
function checkSensorDataRow(row) {

    // Check that all rows are present and the right format.
    if (row.mv === undefined || isNaN(parseFloat(row.mv)) ||
        row.h === undefined || isNaN(parseFloat(row.h)) ||
        row.st === undefined || isNaN(parseFloat(row.st)) ||
        row.et === undefined || isNaN(parseFloat(row.et)) ||
        row.mvmin === undefined || isNaN(parseFloat(row.mvmin)) ||
        row.mvmax === undefined || isNaN(parseFloat(row.mvmax)) ||
        row.timestamp === undefined || isNaN(parseISO(row.timestamp))) {
        return false;
    } else {
        return true;
    }
}

// The main component. It shows the latest sensor data from the cloud server,
// if it is available.
// It first returns a list of the available sensors, and then gets the data
// for the first sensor on that list. Later on, this screen will be modified
// to allow selecting a sensor to show its data.
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

    // Stores the list of sensors, as well as whether the list was actually
    // loaded.
    const [sensorList, setSensorList] = useState(-1);
    const [sensorListLoaded, setSensorListLoaded] = useState(-1);

    // Stores the data for the current sensor, as well as whether any data was
    // actually loaded.
    const [sensorData, setSensorData] = useState(-1);
    const [sensorDataLoaded, setSensorDataLoaded] = useState(-1);

    // Stores the ID for the currently selected sensor.
    const [selectedSensor, setSelectedSensor] = useState(-1);

    // Stores the currently selected sensor data row.
    const [selectedRow, setSelectedRow] = useState(0);

    // Function for using Axios to load a sensor's data, based on the ID.
    const loadData = (sensorId) => {
        dprint("SensorScreen: running loadData() for sensor with ID " + sensorId);
        dprint("SensorScreen: Server URL is " + SERVER_BASE_URL);
        axios.post(SERVER_BASE_URL + "/getSensorData", {'sensor_id': sensorId}, {
            headers: {
                'Content-Type': 'application/json', 'Accept': 'application/json'
            }
        }).then(function(response) {
            var data = response.data.sensor_data;

            // Check to see if all rows in the data are valid. If there are
            // invalid ones, remove them.
            dprint(`SensorScreen: Checking retrieved data for sensor with ID ${sensorId}.`);
            for (var i = data.length -1; i >= 0; i--) {
                if (checkSensorDataRow(data[i]) === false) {
                    dprint(`SensorScreen: Row ${i} in sensor data is not valid, removing it.`);
                    data.splice(i, 1);
                }
            }
            setSensorData(data);
            setSensorData(response.data.sensor_data);
            setSensorDataLoaded(true);
        }).catch(function(error) {
            dprint('Error on getting sensor data: ' + error);
            setSensorDataLoaded(false);
        });
    }

    // Function for using Axios to load the list of sensors.
    // Parameter indicates whether to automatically load the data for the
    // first sensor in the list.
    const loadList = (load) => {
        dprint("SensorScreen: running loadList()");
        dprint("SensorScreen: Server URL is " + SERVER_BASE_URL);
        axios.get(SERVER_BASE_URL + "/getSensorList", {
            headers: {
                'Content-Type': 'application/json', 'Accept': 'application/json'
            }
        }).then(function(response) {
            setSensorList(response.data.sensors);
            setSensorListLoaded(true);
            if (sensorDataLoaded === -1 && load === true) {
                if (response.data.sensors !== undefined && response.data.sensors.length > 0) {
                    dprint("SensorScreen: loadList - calling loadData()");
                    setSelectedSensor(response.data.sensors[0].id);
                    loadData(response.data.sensors[0].id);
                } else {
                    dprint("SensorScreen: loadList - setting sensorDataLoaded to false");
                    setSensorDataLoaded(false);
                }
            }
        }).catch(function(error) {
            dprint('Error on getting sensor list: ' + error);
            setSensorListLoaded(false);
        });
    }

    // When the screen is loaded, first attempt to retrieve a list of sensors,
    // and then get the data of the first sensor on the list.
    useEffect(() => {
        if (sensorListLoaded === -1) {
            loadList(true);
        }
      
        // Reload data when the user focuses on the screen again.
        const willFocusSubscription = navigation.addListener("focus", () => {
            if (sensorListLoaded === -1) {
                loadList(true);
            }
        })
        return willFocusSubscription;
    }, []);

    // When the selected menu item changes, change to the corresponding sensor.
    const onSelectedItemsChange = (selectedId) => {

        // Only change if the selected item changed.
        if (selectedId !== selectedSensor) {
            dprint("SensorScreen: onSelectedItemsChange - calling loadData()");
            setSensorDataLoaded(-1);
            setSelectedSensor(selectedId);
            loadData(selectedId);
        }
    };
  
    // Generates elements for a menu item.
    const ItemToRender = (item) => {

        // Detemrine whether the screen this button is associated with is the
        // current screen.
        const selected = item.id === selectedSensor;

        // Create a button-like element using TouchableOpacity. If the menu item is
        // selected, the outline will be darker than usual to act as a visual
        // indicator.
        return (
            <TouchableOpacity
                style={[styles.OptionWrapper, { borderColor: selected ? '#8888FF' : '#DDDDFF', width: 'auto'}]}
                onPress={() => onSelectedItemsChange(item.id)}
                key={item.id + "_button"}
            >
                <Text style={sharedStyles.infoMainPointText}
                    key={item.id + "_text"}>
                    {item.name}
                </Text>
            </TouchableOpacity>
        );
    };

    // Show that the app is loading the sensor list if it is not yet loaded.
    if (sensorListLoaded === -1) {
        return (<View style={sharedStyles.standardContainer}>
            <Text style={sharedStyles.bannerText}>Now checking what sensors are available...</Text>
        </View>);

    // If the list of sensors failed to be retrieved from the database, show
    // a message saying so.
    } else if (sensorListLoaded === false || sensorList === -1 || sensorList.length < 1) {
        return (<View style={sharedStyles.standardContainer}>
            <Text style={sharedStyles.bannerText}>We couldn't check what sensors are available right now. Please try again later!</Text>
        </View>);

    // Show that the app is loading the sensor data if it is not yet loaded.
    } else if (sensorDataLoaded === -1) {
        var currentSensor = sensorList[0];
        if (selectedSensor !== -1) {
            currentSensor = sensorList.find(data => data.id === selectedSensor);
        }
        return (<View style={sharedStyles.standardContainer}>
            {/* Create a horizontal scroll view for the menu and generate
            menu items from the sensor list, if there is more than one
            sensor available. */}
            {sensorList.length > 1 && <View><ScrollView horizontal={true} style={{paddingLeft: 10, paddingRight: 10}}>
                {sensorList.map((item) => {
                    return ItemToRender(item);
                })}
            </ScrollView></View>}
            <Text style={sharedStyles.bannerText}>Now loading data for sensor {currentSensor.name}...</Text>
        </View>);

    // If the data of a sensor failed to be retrieved from the database, show
    // a message saying so.
    } else if (sensorDataLoaded === false || sensorData === -1 || sensorData.length < 1) {

        // Get the currently selected sensor.
        var currentSensor = sensorList[0];
        if (selectedSensor !== -1) {
            currentSensor = sensorList.find(data => data.id === selectedSensor);
        }
        return (<View style={sharedStyles.standardContainer}>
            {/* Create a horizontal scroll view for the menu and generate
            menu items from the sensor list, if there is more than one
            sensor available. */}
            {sensorList.length > 1 && <View><ScrollView horizontal={true} style={{paddingLeft: 10, paddingRight: 10}}>
                {sensorList.map((item) => {
                    return ItemToRender(item);
                })}
            </ScrollView></View>}
            <Text style={sharedStyles.bannerText}>We couldn't load data for sensor {currentSensor.name} right now. {sensorList.length > 1 ? "Please select another sensor, or" : "Please"} try again later!</Text>
        </View>);

    // Otherwise, parse the donwloaded data for showing in gauges.
    } else {

        // Get the data for the selected row. (At the moment this is always the
        // first row of retrieved data for the sensor.)
        var currentRow = sensorData[selectedRow];

        // Check if the retrived data is correct, with at least one row of data
        // which has the correct properties. If not, show the error message
        // above.
        if (currentRow === undefined ||
            checkSensorDataRow(currentRow) === false)
        {
            // Force a reload of the screen by setting dataLoaded to false.
            dprint("SensorScreen: Did not receive correct sensor data from the database.") 
            setSensorDataLoaded(false);
            return(<></>);
        }

        // Parse all the values of the current row.
        var mv = Number.parseFloat(currentRow.mv);
        var h = Number.parseFloat(currentRow.h);
        var st = Number.parseFloat(currentRow.st);
        var et = Number.parseFloat(currentRow.et);
        var mvmin = Number.parseFloat(currentRow.mvmin);
        var mvmax = Number.parseFloat(currentRow.mvmax);
        var timestamp = parseISO(currentRow.timestamp);
        var methanePPM = Math.round(mv >= 2 ? ((mv - 2) / 5) * 10000 : 0);
        var methanePPMMin = Math.round(mvmin >= 2 ? ((mvmin - 2) / 5) * 10000 : 0);
        var methanePPMMax = Math.round(mvmax >= 2 ? ((mvmax - 2) / 5) * 10000 : 0);

        // Get the currently selected sensor.
        var currentSensor = sensorList[0];
        if (selectedSensor !== -1) {
            currentSensor = sensorList.find(data => data.id === selectedSensor);
        }

        // Set up an array for the last day's methane readings.
        var data = [{
            value: methanePPM,
            date: timestamp
       }]

       // Go through all the sensor data for rows that occured within the last
       // day. If there are any, add them to the above array.
       for (var i = 1; i < sensorData.length; i++) {
            var currentTimestamp = parseISO(sensorData[i].timestamp);

            // Compare the two dates to see if the current date is within the
            // last day.
            if (differenceInDays(timestamp, currentTimestamp) < 1) {
                data.push({value: Math.round(sensorData[i].mv >= 2 ? ((sensorData[i].mv - 2) / 5) * 10000 : 0), date: parseISO(sensorData[i].timestamp)});
            }
        }

        return (
            <View style={sharedStyles.standardContainer}>
                {/* Create a horizontal scroll view for the menu and generate
                menu items from the sensor list, if there is more than one
                sensor available. */}
                {sensorList.length > 1 && <View><ScrollView horizontal={true} style={{paddingLeft: 10, paddingRight: 10}}>
                    {sensorList.map((item) => {
                        return ItemToRender(item);
                    })}
                </ScrollView></View>}
                <ScrollView style={sharedStyles.standardContainer} contentContainerStyle={sharedStyles.contentContainer}>
                    <Text style={styles.TitleText}>Sensor data at {format(timestamp, "hh:mm b")} on {format(timestamp, "MMMM do")}:</Text>
                    <SensorGauge header={"Methane level"} value={methanePPM} minValue={0} maxValue={10000} valueUnit={" ppm"} colourScheme={MethaneColours}/>
                    <Text style={styles.SubText}>Range in last 30 minutes: {methanePPMMin} ppm - {methanePPMMax} ppm</Text>
                    <SensorGauge header={"Humidity"} value={h} minValue={0} maxValue={100} valueUnit={"%"} colourScheme={HumidityColours}/>
                    <View style={styles.SensorTempParentContainer}>
                        <SensorTemp header={"Sensor temperature"} value={st} minValue={0} maxValue={100} valueUnit={"°C"}/>
                        <SensorTemp header={"External temperature"} value={et} minValue={0} maxValue={100} valueUnit={"°C"}/>
                    </View>
                    {/* Only show the methane graph if there's more than one
                    data point from the last day. */}
                    {data.length > 1 && <MethaneGraph header={"Methane readings over the last day"} data={data} dateFormat={"hh:mm a"}/>}
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
    },
    OptionWrapper: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 10,
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 30,
        paddingRight: 30,
        height: 50,
        borderWidth: 3,
        borderRadius: 10
    },
    MethaneGraphContainer: {
        height: 300,
        padding: 10,
        flexDirection: 'row'
    },
    MethaneGraphYAxisLabelContainer: {
        width: 14,
        justifyContent: "center",
        marginBottom: 30
    },
    // Translation position based off:
    // https://medium.com/@therealmaarten/how-to-layout-rotated-text-in-react-native-6d55b7d71ca5
    MethaneGraphYAxisLabel: {
        transform: [{ rotate: "90deg" }, { translateY: 29.5 }],
        width: 65,
        fontWeight: 'bold'
    },
    MethaneGraphYAxis: {
        marginBottom: 30
    },
    MethaneGraphContainerInside: {
        flex: 1,
        marginLeft: 10
    },
    MethaneGraphXAxis: {
        height: 8,
        marginLeft: 10,
        marginRight: -10,
        marginTop: 2
    },
    MethaneGraphXAxisLabel: {
        textAlign: "center",
        height: 20,
        fontWeight: 'bold'
    }
});