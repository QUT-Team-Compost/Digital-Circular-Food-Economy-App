// Script for the home screen used when the user first enters the app.

// ------------ Imports ------------
import * as React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { sharedStyles } from '../components/SharedComponents.js';

// ------------ App code start ------------

// Component the home screen of the app.
export default function HomeScreen() {

    return (
        <View style={sharedStyles.standardContainer}>
            <ScrollView style={sharedStyles.standardContainer} contentContainerStyle={sharedStyles.contentContainer}>
                <View style={styles.imageContainer}>
                    <Image
                        source={require('../assets/images/Example_Logo.png')}
                        style={styles.schoolLogo}
                    />
                </View>

                <View style={styles.homeScreenTitleContainer}>
                    <Text style={styles.homeScreenTitle}>Example compost app</Text>
                </View>

                <View style={styles.homeScreenTextContainer}>
                    <Text style={styles.homeScreenText}>Learn all about compost!</Text>
                    <Text style={styles.homeScreenText}>Swipe the top bar to pick the screen you want to get started!</Text>
                </View>
            </ScrollView>
        </View>
    );
}

// Styles used only in this script.
const styles = StyleSheet.create({
    developmentModeText: {
        marginBottom: 20,
        color: 'rgba(0,0,0,0.4)',
        fontSize: 14,
        lineHeight: 19,
        textAlign: 'center',
    },
    imageContainer: {
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
    },
    schoolLogo: {
        width: 200,
        height: 200,
        resizeMode: 'contain',
        marginTop: 3,
        marginLeft: -10,
    },
    homeScreenTextContainer: {
        alignItems: 'center',
        marginHorizontal: 50,
    },
    homeScreenText: {
        fontSize: 17,
        color: 'rgba(96,100,109, 1)',
        lineHeight: 24,
        textAlign: 'center',
    },
    homeScreenTitle: {
        fontSize: 24,
        color: 'rgba(0,0,0, 1)',
        lineHeight: 30,
        textAlign: 'center',
    },
    homeScreenTitleContainer: {
        alignItems: 'center',
        marginHorizontal: 50,
        marginBottom: 10,
    },
});