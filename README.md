# Mobile App Companion for Circular Food Economy - Template

## Introduction

This is a template of a mobile app that can be used as a companion for a circular food economy scheme that has been set up at primary or secondary school (Australian definitions). It is based upon the mobile app that is being used for the scheme at Yarrabilba State Secondary College, which has been released on both Android and iOS.

The app is mainly intended for displaying information about the relevant scheme, and related information such as how to compost and what can and cannot be composted, both in text as well as with pictures or videoes. It also includes a screen that allows users to take a quiz to test their knowledge.

This app also has the capability to connect to a server, the code of which can be found [here](https://github.com/QUT-Team-Compost/Digital-Circular-Food-Economy-Server). This server is intended to store house scores for participating in the compost scheme, as well as connect to sensors on the Thingsboard platform. If these features are not included, the server is not necessary (and it can be modified for different purposes).

As a React Native app, this is compatiable with both Android and iOS phone operating systems.

## Included source code

There are extensive comments included to allow you to get a further idea of how the code functions.

#### App.js
The initial screen of the app. It sets up the status bar and header of the app, as well as the navigation settings and the menu to navigate between screens. It also initially shows a screen to enter a passcode (if one is defined in the environment variables) to prevent people outside the school from using the app.

### Components

#### DataStore.js
Contains the state storage that is shared across the mobile app. At present, this is used to keep track of the screen that the user is currently on, so that it can be shown by the menu. This makes use of the [Redux Toolkit](https://redux-toolkit.js.org/).

#### RootNavigation.js
Contains a reference to the React Navigation reference so that navigation information can be used throughout the app.

#### SharedComponents.js
Contains several different components, functions and variables that are used across multiple different screens in the app. Included in here are:
- Stylesheets for common styles used thorughout the app.
- An InfoScreen component that is intended to display various text and visual content on a screen with just defining the content itself and the styles, rather than JSX elements. This component can display, through the InfoContent component:
    - Regular text;
    - Bulletpointed text for lists;
    - Two types of images, one of which automatically adjusts its height based on its width; and
    - Videoes that will automatically play when the screen is navigated to, and stop when navigating away.
        - If multiple videos are put in an InfoScreen, only the last one will exhibit the automated stop and start behaviour.
        - Currently, this video cannot be set to loop (without modifying SharedComponents.js).
    - Other elements may also be included as well by passing JSX.
- A VerticalBarChart component which displays a vertical bar chart, used for house scores but can be reused for other purposes. This makes use of the the react-native-svg-charts package.
- A CollapsableList component which allows content to be hidden under a header and then revealed (and rehidden) by tapping on that header. This works similarly as InfoScreen as an object containing the content only can be passed, rather than using JSX. An array configured in the same way as using InfoScreen can also be passed as content.
- A WrappedAutoHeightImage component that automatically sets the height of an image when given the width. This makes use of the react-native-auto-height-image package.

### Routes

#### MainRoutes.js
Contains the information for the different screens that can be navigated to using React Navigation, referenced by App.js. The array used to create the routes also populates the menu bar at the top of the app. The intention is to keep the routes logic outside of the actual components and thus make it easier to modify. While it is also intended that most screens in the app make use of the InfoScreen component, any component that is valid as a screen can be used.

#### ExampleRoute.js
Contains two examples of content to populate screens on routes, to show how to define them. The first example shows all of the different possible content types, and the second shows how to use the CollapsableList component. This example uses two arrays in the same script file, though they can be combined and separated however the developer wishes to organise them.

#### AboutApp.js
Contains the content for the app's about screen. Similar in construction to the above.

### Screens

#### HomeScreen.js
Contains the screen that is displayed on starting the app (after entering the passcode); used to quickly introduce the app and how to navigate.

#### HouseScores.js
Contains the screen that shows the house scores in a VerticalBarChart component. While this is intended to download the data from the mobile app's server, it can get it from another source if the developer so desires. It also requires a QR code to scan before showing the scores, but this can be removed. It also contains sample data for reviewers using a separate QR code.

#### QuizScreen.js
Contains the screen that allows users to take a series of quiz questions. By default, this is five randomly selected from a list. Users will be invited to start the quiz, answer the questions and then be shown how many they got right, with a button to start again. Questions are multiple choice, can have multiple correct answers, and can include images.

#### SensorScreen.js
Contains the screen that shows information from sensors in the compost. Like with the house scores, this is intended to be downloaded from the mobile app's server, though the actual source is up to the developer. The data is originally from a sensor by [Substation33](https://substation33.com.au/) in Queensland, Australia, the design of which will also be released at some point alongside this source code.


## Building

In order to build this app, the process is as follows:
1. Install node and npm on your system. The latest LTS version should be sufficient as this app was developed using version 14.17.1.
    - For Mac or Linux, use the package manager included with your distribution.
    - For Windows, download and install from https://nodejs.org/en/download/.
1. Install the Expo CLI globally using npm with the command `npm install -g expo-cli` at the command line.
1. In the root directory where the code resides, execute the command `npm ci` (or `npm install` if package-lock.json is not present) followed by `expo install` at the command line in order to install the packages required by the app.
1. Before building, an .env file should be created in the root directory. On Windows, a file with this name can be created through the Command Prompt through `echo. > .env` or by saving a file in a text editor with the name surrounded in double quotes.
    - This file can contain the following entries:
        - PASSCODE_HASH_ACTUAL - A hash for a passcode to enter the app, intended to prevent random users from using it (this passcode would be supplied at the school). If not supplied, the app skips the passcode step.
        - PASSCODE_HASH_TEST - A hash for an alternate passcode to enter the app, for reviewers or other types of testing.
        - SERVER_BASE_URL - The base URL for the server that this app will communicate with. This is required for the house scores and sensors screens to show data.
        - DEBUG - For use during development only, where the app can be run with output to a console window. Whether debug statements should be printed to the console. "true" (in any type of case) will set them to be shown - any other value (or no value at all) is considered to be false.
    - Bcyrpt should be used to generate the passcode hashes. A site such as https://bcrypt-generator.com/ is able to create such hashes - it is recommended to use five salt rounds as that has what has been tested.
1. `expo build` can then be used at the command line to package the source code and send it to Expo's servers to build.
    - To build for iOS, use the command `expo build:ios -t`. Add `archive` to create an archive that can be submitted to the App Store, or `simulator` to create an archive to use in Xcode's simulator. Note that for the former, an Apple Developer account will be required to properly make credentials, if you do not have any already.
    - To build for Android, use the command `expo build:android -t`. Add `apk` to create an APK version, or `app-bundle` to create an App Bundle version. If this is the first time building the project, you will also be asked if you wish to create a keystore or upload your own. If the former, you can later retrieve your keystore using the command `expo fetch:android:keystore`.
1. Wait for the app to build, either through the display in the CLI, or by logging on to your account on the Expo website to view your builds there. Once they are complete, you can download the builds from the website.

## Running through Expo

This app can be tested through Expo, either within an emulator or on a physical device. Note that if you wish to test on an iOS emulator, you must be on a computer running MacOS.
1. In a terminal or Command Prompt window in the root directory of the app's code, run `expo start`. This will open up a browser window with the Expo Developer Tools.
1. To run in an emulator:
    1. Open the emulator corresponding to the platform you want to test on - an AVD created with Android Studio for Android, or one of Xcode's simulator options for iOS.
    1. When the emuatlor has loaded the operating system, click the corresponding option in the browser: "Run on Android device/emulator" or "Run on iOS simulator".
1. Alternatively, to run on your physical device:
    1. Install the Expo Go app on your phone if you have not already - it can be found on either platform's app store.
    1. Enter the Expo Go app and select "Scan QR Code", and then scan the QR code on the bottom left corner of the browser.
    
## A note about building through Expo

If the app is built using Expo, it will include all the base Expo packages and their code even if they are not used. This includes the Amplitude and Segment pacakges, which are used for collecting the device's advertising ID ("Android Advertising ID" on Android, and "Identifier for Advertisers" on iOS). This means that you must declare that the advertising or device ID is collected when uploading the app for review on the iOS App Store, and it will need to be mentioned in your app's privacy policy as well.

To avoid having to do this (and also potentially avoid the app being rejected depending on the targetted age group), the Expo framework can be removed by using `expo eject` at the command line. This turns the app into a bare React Native app, though any Expo packages you were using can still be kept. More information on the process can be found in the [Expo documentation](https://docs.expo.dev/expokit/eject/). You will need Android Studio to build the app for Android, and Xcode to build the app for iOS. Bear in mind that the latter requires a computer running Mac OS.

After successfully ejecting the app, there are a few changes that need to be made to some of the build files to ensure that the Amplitude and Segment packages are not included.

- For Android:
    1. In android\settings.gradle, find the line `includeUnimodulesProjects()` and insert into the brackets: `exclude:['expo-analytics-segment','expo-analytics-amplitude']`.
    1. In android\app\build.gradle, find the line `addUnimodulesDependencies()` and insert into the brackets: `exclude:['expo-analytics-segment','expo-analytics-amplitude']`.
- For iOS:
    1. In ios\Podfile, find the line `use_unimodules!()` and insert into the brackets: `exclude: ['expo-analytics-segment', 'expo-analytics-amplitude']`.
    
The app can then be built without either of the two packages being included.
    
## License and copyright

This code is released under the MIT Licence. You may use this code either as is or build upon it for any purpose, even for commercial use. The only condition is that a copy of the LICENCE file, which includes the declaration of copyright, is included in any copies or derivations of the source code.

The copyright of this code belongs to the Queensland University of Technology, 2021.