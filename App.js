// Script for the initial application logic, and the starting point of the
// React Native app.

// ------------ Imports ------------
import 'react-native-gesture-handler';
import React, { useState } from 'react';
import { StyleSheet, Text, View, LogBox, TextInput, ScrollView, TouchableOpacity } from 'react-native';

// Set up for React Navigation.
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
const Links = createStackNavigator();

// Disables yellow warnings from React Native.
LogBox.ignoreAllLogs();

// Gets the route list from the Routes script, used to populate the menu and
// determine what each button navigates to.
import { routeIdList } from './routes/MainRoutes.js';

// These will allow navigation with React Navigation through a non-standard
// method - i.e. our menu.
import { navigationRef } from './components/RootNavigation.js';
import * as RootNavigation from './components/RootNavigation.js';

// Styles from the shared components.
import { sharedStyles, dprint } from './components/SharedComponents.js';

// Allows for messages to appear at the top of the screen.
import FlashMessage from "react-native-flash-message";

// Redux to allow for persistant data storage across the whole app.
import { Provider } from 'react-redux';
import { store, setCurrentPage } from './components/DataStore.js';
import { useSelector, useDispatch } from 'react-redux';

// Allows setting the theme of the status bar.
import { StatusBar } from 'expo-status-bar';

// Allows for keeping the splash screen visible until assets have been loaded.
import { Asset } from 'expo-asset';
import AppLoading from 'expo-app-loading';

// Allows hashing of passwords. Isaac is used to ensure that the produced
// result is cryptographically secure. 
import bcrypt from 'react-native-bcrypt';
import isaac from "isaac";

// Environment variables used here.
import {PASSCODE_HASH_ACTUAL, PASSCODE_HASH_TEST} from "@env"

// ------------ App code start ------------

//https://stackoverflow.com/a/45038881
// Sets a more secure random number generation.
bcrypt.setRandomFallback((len) => {
    const buf = new Uint8Array(len);

    return buf.map(() => Math.floor(isaac.random() * 256));
});

// Main app component
function App(props) {

    // State for when the app has loaded all assets.
    const [ready, setReady] = useState(false);

    // State for the passcode that the user has entered.
    const [passCode, setPassCode] = useState("");

    // Hashes for the two passcodes. They are stored this way in case someone
    // gets the code from the APK - though I am not sure that is a practical
    // concern.
    const accessPassCode = PASSCODE_HASH_ACTUAL; //worm21
    const accessPassCodeTest = PASSCODE_HASH_TEST; //reviewerTest05

    // Used to get and set the current selected menu item from the data store.
    const dispatch = useDispatch();
    const menu = useSelector((state) => state.menu);

    // When the selected menu item changes, navigate to the corresponding screen.
    const onSelectedItemsChange = (selectedItems) => {

        // Only navigate if the selected item changed.
        if (selectedItems !== menu.currentPage) {
            dispatch(setCurrentPage(selectedItems))
            RootNavigation.navigate( routeIdList.filter(obj => { return obj.id === selectedItems })[0].routeName );
        }
    };

    // Loads all of the assets used in the app before resolving a Promise.
    const loadImagesAndVideos = async () => {

        // The list of assets to load.
        const assets = [
            require('./assets/images/Example_Logo.png'),
            require('./assets/images/exampleImage1.png'),
            require('./assets/images/exampleImage2.png'),
            require('./assets/images/House_logos/House_1.png'),
            require('./assets/images/House_logos/House_2.png'),
            require('./assets/images/House_logos/House_2.png'),
            require('./assets/images/House_logos/House_3.png'),
            require('./assets/images/QR_reticle.png'),
            require('./assets/images/Icons/icon_dropup.png'),
            require('./assets/images/Icons/icon_dropdown.png'),
            require("./assets/images/Icons/icon_problem.png"),
            require('./assets/videos/exampleVideo.mp4'),
        ];

        // Function to load all of the assets from the above list.
        const cacheAssets = assets.map(asset => {
            return Asset.fromModule(asset).downloadAsync();
        }); 
        dprint("App: loadImagesAndVideos: Loaded assets")
        return Promise.all(cacheAssets);
    }
  
    // Generates elements for a menu item.
    const ItemToRender = (item) => {

        // Detemrine whether the screen this button is associated with is the
        // current screen.
        const selected = item.id === menu.currentPage;

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
  
    // If the app is not currently ready...
    if (!ready) {
        dprint("App: assets not ready")

        // Use AppLoading to display the splash screen, and wait for the assets
        // to be loaded before changing.
        return (
            <AppLoading
                startAsync={loadImagesAndVideos}
                onFinish={() => setReady(true)}
                onError={console.warn}
            />
        );

    // If the app is ready...
    } else {
        dprint("App: assets ready")

        // If the user has not yet entered a valid pass code...
        // (This is skipped if there is not a password has in the .env file.)
        if (PASSCODE_HASH_ACTUAL && !bcrypt.compareSync(passCode, accessPassCode) && !bcrypt.compareSync(passCode, accessPassCodeTest)) {

            // Show a screen asking the user to enter a passcode, including a
            // text box for them to do so.
            return (
                <>
                    <View style={styles.mainHeader}>
                        <StatusBar style="light"/>
                        <Text style={styles.mainHeaderText} allowFontScaling={false}>Example Compost App</Text>
                    </View>
                    <View style={sharedStyles.standardContainer}>
                        <View style={sharedStyles.infoContainer}>
                            <Text style={sharedStyles.infoMainPointText}>Welcome to the Example compost app. To use this, you will need to enter a pass code that was given to you by your teachers.</Text>
                            <Text style={sharedStyles.infoMainPointText}>Please put the pass code into the area below:</Text>
                            <TextInput placeholder="Pass code" style={sharedStyles.roundTextInput} value={passCode} onChangeText={(text) => setPassCode(text)} secureTextEntry={true}/>
                        </View>
                    </View>
                </>
            )

        // Otherwise, show the main part of the app.
        } else {
            return (

                // Put the app in a navigation container to allow for
                // navigating between screens.
                <NavigationContainer ref={navigationRef}>
                    <View style={styles.mainHeader}>
                        {/* Set up the status bar and the header. */}
                        <StatusBar style="light"/>
                        <Text style={styles.mainHeaderText} allowFontScaling={false}>Example Compost App</Text>
                    </View>
                    <View>

                        {/* Create a horizontal scroll view for the menu and
                        generate menu items from the route list. */}
                        <ScrollView horizontal={true} style={{paddingLeft: 10, paddingRight: 10}}>
                            {routeIdList.map((item) => {
                                return ItemToRender(item);
                            })}
                        </ScrollView>

                        {/* Create a header for the screen, taking the
                        corresponding screen name from the route list. */}
                        <View style={sharedStyles.pageHeader}>
                            <Text style={sharedStyles.pageHeaderText}>{routeIdList.filter(obj => { return obj.id === menu.currentPage })[0].name}</Text>
                        </View>
                    </View>
                    {/* Create the routes for navigation using the route list.
                    */}
                    <Links.Navigator
                        initialRouteName="Home"
                        screenOptions={{
                            headerShown: false
                        }}
                    >
                        {routeIdList.map((route, index) => (
                            <Links.Screen
                                key={route.id}
                                name={route.routeName}
                                component={route.routeComponent}
                                initialParams={{...route.routeInitialParams, ...{id: route.id}}}
                            />
                        ))}
                    </Links.Navigator>

                    {/* Used for the flash message library. */}
                    <FlashMessage position="top" />
                </NavigationContainer>
            );
        }
    }
}

// Used to ensure the Redux provider works correctly.
// https://stackoverflow.com/questions/60329421/usedispatch-error-could-not-find-react-redux-context-value-please-ensure-the
export default function AppWrapper(props) {
    return (
        <Provider store={store}>
            <App {...props}/>
        </Provider>
    )
}

// Styles used only in this script.
const styles = StyleSheet.create({
    mainHeader: {
        backgroundColor: '#002d74',
        paddingTop: 20,
    },
    mainHeaderText: {
        color: 'white',
        textAlign: 'center',
        fontSize: 25,
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
        borderRadius: 10,
    },
});
