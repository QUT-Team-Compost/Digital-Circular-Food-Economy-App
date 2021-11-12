// Script for the component showing a graph of the house scores.

// ------------ Imports ------------
import * as React from 'react';
import { StyleSheet, Text, View, Image, Dimensions } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { sharedStyles, dprint, VerticalBarGraph } from '../components/SharedComponents.js';
import { useState, Component, useEffect } from 'react';
import axios from 'axios';
import { BarCodeScanner } from 'expo-barcode-scanner';

// Environment variables used here.
import {SERVER_BASE_URL} from "@env"

// ------------ App code start ------------

// The colours and images used for each house. We use this instead of querying
// the database for a couple of reasons:
// - Require cannot be used dynamically; and
// - It needs to be present for the test data, which does not query the
//   database.
const houses = [
    {
        id: 1,
        name: "House 1",
        colour: 'rgba(100, 50, 50, 1)',
        image: require("../assets/images/House_logos/House_1.png"),
    },
    {
        id: 2,
        name: "House 2",
        colour: 'rgba(55, 82, 37, 1)',
        image: require("../assets/images/House_logos/House_2.png"),
    },
    {
        id: 3,
        name: "House 3",
        colour: 'rgba(100, 90, 50, 1)',
        image: require("../assets/images/House_logos/House_3.png"),
    },
    {
        id: 4,
        name: "House 4",
        colour: 'rgba(50, 70, 100, 1)',
        image: require("../assets/images/House_logos/House_4.png"),
    },
]

// The main component. It first shows a QR code scanner, and when the correct
// code is scanned, it shows the house scores. There is also a case for showing
// an example set of house scores for reviewing purposes.
export function HouseScores({navigation, route}) {

    // The codes that can be used to show scores.
    const validCodes = ["Example_mobile_app_reviewer_data", "Example_mobile_app_scores"]

    // Store whether permission was given to use the camera, and if something
    // was scanned.
    const [hasPermission, setHasPermission] = useState(null);
    const [scannedCode, setScannedCode] = useState("");

    // Attempt to get permission to use the camera to scan a QR code.
    useEffect(() => {
        (async () => {
            const { status } = await BarCodeScanner.requestPermissionsAsync();
            setHasPermission(status === 'granted');
        })();

        // Have the user scan again if they focus on the screen again.
        // Reload data when the user focuses on the screen again.
        const willFocusSubscription = navigation.addListener("focus", () => {
            setScannedCode("");
        })
        return willFocusSubscription;
    }, []);

    // Handle when a QR code is scanned.
    const handleBarCodeScanned = ({ type, data }) => {
        if(scannedCode !== data) {
            setScannedCode(data);
            dprint("HouseScores: Scanned in " + data);
        } 
    };

    // Before permission has been granted or denied, show a message showing
    // that the app is awaiting permission.
    if (hasPermission === null) {
        return (
            <View style={sharedStyles.standardContainer}>
                <Text style={sharedStyles.bannerText}>Waiting to see if we have permission to use your device's camera...</Text>
            </View>
        );
    }

    // If permission was denied, show a message saying so.
    if (hasPermission === false) {
        return (
            <View style={sharedStyles.standardContainer}>
                <Text style={sharedStyles.bannerText}>We don't have permission to use your device's camera!</Text>
            </View>
        );
    }
    
    // If the code that was scanned in was one of the valid ones, show a graph
    // with the house scores.
    if (validCodes.indexOf(scannedCode) !== -1) {
        return (<View style={sharedStyles.standardContainer}>
            <ScrollView style={sharedStyles.standardContainer} contentContainerStyle={sharedStyles.contentContainer}>
                <View style={sharedStyles.infoContainer}>
                    {scannedCode === "Example_mobile_app_reviewer_data" ? <HouseScoreGraph test={true}/> : <HouseScoreGraph/>}
                </View>
            </ScrollView>
        </View>)
    }

    // Otherwise, show the QR code reader as well as a message telling the user
    // what to do.
    return(
        <View style={sharedStyles.standardContainer}>
            <Text style={sharedStyles.bannerText}>Please use your device's camera to scan a QR code. If the code is correct, you will be shown the current house scores!</Text>
            <View
            style={styles.scannerContainer}>
                <BarCodeScanner
                onBarCodeScanned={scannedCode !== "" ? undefined : handleBarCodeScanned}
                style={styles.scanner}
                >
                    <Image source={require("../assets/images/QR_reticle.png")}
                    style={styles.scannerReticle}/>
                </BarCodeScanner>
            </View>
        </View>
    )
}

// A component for showing a graph of the house scores.
// Expects the following prop: 
// - test: If true, displays the example data.
// The data displayed in the graph should be an array of objects with the
// following properties:
// id: The identifier of the house.
// score: The house's current score.
export class HouseScoreGraph extends Component {
    state = {
        scores: -1,
    }

    // When the component is rendered, get the data to display in the graph.
    componentDidMount() {

        // If test is true, set the data as the example set.
        if (this.props.test === true) {
            this.setState(state => {
                return {
                scores: [
                    {id: 1, score: 30},
                    {id: 2, score: 10},
                    {id: 3, score: 40},
                    {id: 4, score: 20},
                ],
                }
            })

        // Otherwise, attempt to download the scores from the cloud server.
        // If there's an error, the scores are set to null.
        } else {
            dprint("HouseScores: running componentDidMount() for non-test data");
            dprint("HouseScores: Server URL is " + SERVER_BASE_URL);
            axios.get(SERVER_BASE_URL + '/getHouseScores', {}, {
                headers: {
                    'Content-Type': 'application/json', 'Accept': 'application/json',
                },
            })
                .then((response) => {
                    if (response.data.error) {
                        dprint("HouseScoreGraph: Caught an error:");
                        dprint(response.data.message);
                        this.setState(state => {
                            return {
                            scores: null,
                            }
                        });
                    } else {   
                        dprint("HouseScoreGraph: Successfully retrieved house scores");
                        this.setState(state => {
                            return {
                            scores: response.data.houses,
                            }
                        });
                    }
                })
                .catch((error) => {
                    dprint("HouseScoreGraph: Caught an error:");
                    dprint(error);
                    this.setState(state => {
                        return {
                        scores: null,
                        }
                    });
                });
            }
    }
    
    // Render this component.
    render() {
        dprint("HouseScoreGraph: Scores are...")
        dprint(this.state.scores);
        
        // If the scores are the default value, show that they are being
        // loaded.
        if (this.state.scores === -1) {
            return(<View style={sharedStyles.standardContainer}>
                <Text style={sharedStyles.bannerText}>Now loading house scores...</Text>
            </View>);
        }

        // If the scores are null or are not the expected number of houses,
        // show that they couldn't be loaded.
        if (this.state.scores === null || this.state.scores.length !== houses.length) {
            return(<View style={sharedStyles.standardContainer}>
                <Text style={sharedStyles.bannerText}>We couldn't load the house scores right now. Please try again later!</Text>
            </View>);
        }

        // If the scores are not formed correctly, also show that they couldn't
        // be loaded.
        for (var score of this.state.scores) {
            if (score.id === undefined || score.score === undefined) {

                // Force a reload of the page by setting scores to null.
                dprint("HouseScoreGraph: Did not receive correct scores data from the database.") 
                this.setState(state => {
                    return {
                    scores: null,
                    }
                })
            }
        }

        // Otherwise, show the house scores that were loaded.
        // Create the array of graph data, including what colours each bar
        // should be.
        var graphData = [];
        for (var house of houses) {
            graphData.push(
                {
                    value: this.state.scores.find(data => data.id === house.id).score,
                    svg: {
                        fill: house.colour
                    }
                }
            )
        }

        // Render the graph using the VerticalBarChart component. Also
        // creates a row of house logoes underneath the graph.
        return(<View style={sharedStyles.standardContainer}>
            <Text style={sharedStyles.bannerText}>Here are the current scores for each of the houses:</Text>
            <VerticalBarGraph data={graphData} height={Dimensions.get('window').height * 0.6}/>
            <View style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", alignContent: "center", alignItems: "center", justifyContent: "center" }}>
                {houses.map(house => (<Image source={house.image}style={{ width: "25%", height: 60, resizeMode: 'contain', }} />))}
            </View>
        </View>);
    }
}

// Styles used only in this script.
const styles = StyleSheet.create({
    scannerContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    scanner: {
        height: '80%',
        width: '80%',
        alignItems: "center",
        justifyContent: "center",
    },
    scannerReticle: {
        height: "80%",
        width: "80%",
        resizeMode: 'contain',
    }
})