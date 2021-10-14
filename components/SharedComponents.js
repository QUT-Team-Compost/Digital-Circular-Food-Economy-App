// Script for elements and other functions that are used throughout the app.

// ------------ Imports ------------
import React from 'react';
import { StyleSheet, Text, View, ScrollView, Image, Platform } from 'react-native';

import Unorderedlist from 'react-native-unordered-list';
import { useEffect, useState, useRef } from 'react';
import { Video } from 'expo-av';

import { showMessage } from "react-native-flash-message";

import { BarChart, Grid } from 'react-native-svg-charts'
import { Text as SVGText } from 'react-native-svg'
import { Component } from 'react';

import * as Animatable from 'react-native-animatable';
import Accordion from 'react-native-collapsible/Accordion';

import AutoHeightImage from 'react-native-auto-height-image';

// Environment variables used here.
import {DEBUG} from "@env"

// ------------ App code start ------------

// Styles that are used in many places throughout the app.
export const sharedStyles = StyleSheet.create({
    pageHeader: {
        backgroundColor: '#ea0029',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly',
    },
    pageHeaderText: {
        color: 'white',
        textAlign: 'center',
        fontSize: 18,
        paddingTop: 10,
        paddingBottom: 10,
    },
    pageHeaderBackButton: {
        color: 'white',
        textAlign: 'center',
        fontSize: 18,
    },
    infoMainPointText: {
        fontSize: 17,
        color: 'black',
        marginBottom: 5,
    },
    infoSubPointText: {
        color: 'black',
        fontSize: 14,
        marginBottom: 5,
    },
    standardContainer: {
        flex: 1,
    },
    infoContentContainer: {
        paddingTop: 10,
    },
    infoContainer: {
        textAlign: 'left',
        padding: 20,
    },
    backgroundImage: {
        flex: 1,
        resizeMode: "cover",
        justifyContent: "center"
    },
    imageCaption: {
        color: 'black',
        fontSize: 15,
        fontStyle: 'italic',
        textAlign: 'center',
        marginBottom: 7,
    },
    diagramImage: {
        width: 300,
        resizeMode: 'contain',
    },
    buttonText: {
        backgroundColor: "#00A000",
        color: "white",
        fontSize: 15,
        textAlign: 'center',
        borderRadius: 5,
        borderWidth: 5,
        borderColor: "#008000",
        paddingTop: 10,
        paddingLeft: 5,
        paddingBottom: 3,
        paddingRight: 5,
    },
    boldText: {
        fontWeight: 'bold'
    },
    titleText: {
        fontSize: 25,
        color: 'black',
    },
    roundTextInput: {
        textAlign: 'center',
        height: 40,
        borderWidth: 2,
        borderColor: 'black',
        borderRadius: 20,
        color: 'black',
        margin: 5,
        fontSize: 20,
    },
    roundButton: {
        backgroundColor: "#ea0029",
        color: "white",
        fontSize: 20,
        textAlign: 'center',
        borderRadius: 20,
        borderWidth: 5,
        borderColor: "#ce0025",
        textAlignVertical: 'center',
        minHeight: 40,
        margin: 5,
        overflow: 'hidden',
    },
    roundButtonText: {
        color: "white",
        fontSize: 20,
        textAlign: 'center',
        textAlignVertical: 'center',
        ...Platform.select({
          android: {
            textAlignVertical: 'center',
          },
          ios: {
            lineHeight: 30,
          },
        }),
    },
    linkText: {
        color: "blue",
        textDecorationLine: "underline",
    },
    contentContainer: {
        paddingTop: 30,
    },
    bannerText: {
        fontSize: 17,
        lineHeight: 24,
        textAlign: 'center',
    },
});

// Allows printing to the console under debugging conditions, by setting the
// following variable to true.
const isDebug = (DEBUG ? DEBUG.toLowerCase() === "true" : false);
console.log("Debug mode: " + isDebug)
export function dprint(message) {
    if (isDebug === true) {
        console.log(message);
    }
}

// Constant array representing valid "types" for the information arrays used to
// generate content in InfoScreen and InfoContent.
export const CONTENT_TYPES = {
    IMAGE: "image",             // Image component inside a centred View component
    BULLETPOINT: "bulletpoint", // Text component inside an Unorderedlist component
    TEXT: "text",               // Text component
    VIDEO: "video",             // Video component using expo-av
    AUTOIMAGE: "autoImage",     // Uses the AutoHeightImage library to set an image to a specific percentage width while preserving correct aspect ratio
}

// Creates the correct components from an array of content passed as a prop.
// - If type is "image", creates an Image component centred using a View
//   component.
// - If type is "bulletpoint", creates a Text component inside the external
//   Unorderedlist component.
// - If type is "text", creates a Text component.
// - If type is "video", creates an expo-av Video component. This will be set
//   to pause when the user navigates away from the screen and restart when
//   they return. At present, only the last video in an InfoContent will
//   exhibit that automatic behaviour due to how this is coded.
// - If type is "autoImage", creates a wrapped AutoHeightImage component that
//   will be the width specified in the supplied style and centred using a View
//   component.
// Otherwise creates a View component.
export function InfoContent (props) {
    
    // Get the contents of this screen, as well as setting up video handling.
    const contents = props.contents;
    const video = useRef(undefined)
    const _handleVideoRef = component => {
        video.current = component;
    }

  // If there is valid navigation, and there's a video on this screen, ensure
  // that it stops when the screen is not in focus, and starts when it is.
  useEffect(() => {
        if (props.navigation) {
            const stopVideo = props.navigation.addListener("blur", () => {
                if (video.current) {
                    video.current.stopAsync();
                }
            });

            const startVideo = props.navigation.addListener("focus", () => {
                if (video.current) {
                    video.current.playAsync();
                }
            });
        }
    }, [props.navigation]);

    //https://stackoverflow.com/a/46593006
    // Create different elements for the page depending on the type of content.
    function renderSwitch(item) {
        switch (item.type) {

            // For an image...
            case CONTENT_TYPES.IMAGE:
                return (<View key={item.id} style={{alignItems: "center"}}><Image source={item.contents} style={item.style}/></View>);
                break;

            // For bullet pointed text...
            case CONTENT_TYPES.BULLETPOINT:
                return (<Unorderedlist key={item.id}><Text style={item.style}>{item.contents}</Text></Unorderedlist>);
                break;

            // For regular text...
            case CONTENT_TYPES.TEXT:
                return (<Text key={item.id} style={item.style}>{item.contents}</Text>);
                break;

            // For a video...
            case CONTENT_TYPES.VIDEO:
                return (
                    <View key={item.id} style={{alignItems: "center"}}>
                        <Video
                            key={0}
                            source={item.contents}
                            rate={1.0}
                            volume={1.0}
                            isMuted={false}
                            resizeMode="cover"
                            shouldPlay
                            isLooping={false}
                            style={Platform.OS === 'web' ? [item.style, {maxWidth: '512px', maxHeight: '288px'}] : item.style}
                            useNativeControls={true}
                            ref={_handleVideoRef}
                        />
                    </View>
                );
                break;

            // For an image that should automatically be sized...
            case CONTENT_TYPES.AUTOIMAGE:
                return (<View key={item.id} style={{alignItems: "center"}}><WrappedAutoHeightImage style={item.style} source={item.contents}/></View>)
                break;

            // If the content does not have a valid type, put it in a view for
            // rendering.
            default:
                return (<View key={item.id} style={item.style}>{item.contents}</View>);
                break;
        }
    }
    
    // Return the correct element.
    return (
        <>{contents.map(item => (
            renderSwitch(item)
        ))}</>
    )
}

// A generic screen component for displaying text and images, to be used in a
// Navigation component.
// Expects an initialParams containing an array of information with the key
// "contents" to display using the InfoContent component.
// Array should contain objects with the following properties:
// - id: an unique identifier for the information item.
// - type: the type of component to use, specified in CONTENT_TYPE.
// - contents: the information to show. Expects an image supplied with require
//             for CONTENT_TYPES.IMAGE, and a video supplied with require for
//             CONTENT_TYPES.VIDEO, otherwise expects a string.
// - style: a style to apply to the component.
// initialParams can also contain an extra_components: an array of components
// that should be included on the screen as well. These will be added under the
// InfoContent component.
export function InfoScreen( {navigation, route} ) {

    return (
    <View style={sharedStyles.standardContainer}>
        <ScrollView style={sharedStyles.standardContainer} contentContainerStyle={sharedStyles.infoContentContainer}>
            <View style={sharedStyles.infoContainer}>
                <InfoContent contents={route.params.contents} navigation={navigation} key={route.params.key} keyProp={route.params.key}/>
                {route.params.extra_components && route.params.extra_components.map((component, index) => (component))}
            </View>
        </ScrollView>
    </View>
    )
}

// Shows an error message, also printing it to the console if debugging is
// enabled.
// Parameters:
// - error: The error to display. Treated as an object from a thunk using Axios
//          if the second paramter is true.
// - axois: True if an error from Axios, false otherwise.
export function displayErrorMessage(error, axios) {
    if (axios) {
        if (error.response) {
          // Request made and server responded
            dprint(error.response.data);
            dprint(error.response.status);
            dprint(error.response.headers);
            showMessage({
                message: error.response.data.message,
                type: "danger",
                //autoHide: false,
                duration: 5000,
            });
        } else if (error.request) {
            // The request was made but no response was received
            dprint(error.request);
            showMessage({
                message: "We could not access the server right now to get information to show you.\n Have another go later!",
                type: "danger",
                //autoHide: false,
                duration: 5000,
            });
        } else {
            // Something happened in setting up the request that triggered an Error
            dprint(error.message);
            dprint(error.stack);
            showMessage({
                message: "An error occured while trying to access the server to get information to show you: " + error.message + "\n Have another go later!",
                type: "danger",
                //autoHide: false,
                duration: 5000,
            });
        }
    } else {
        dprint(error);
        showMessage({
            message: error,
            type: "danger",
            //autoHide: false,
            duration: 5000,
        });
    }
}

//Modified from https://github.com/JesperLekland/react-native-svg-charts-examples/blob/master/storybook/stories/bar-chart/vertical-with-labels.js
// A component that draws a vertical bar chart with labels, using
// react-native-svg-charts.
// Expects the following props: 
// - data: the data for the graph.
// - height: the height of the graph.
class VerticalBarChart extends Component {

    render() {
        const data = this.props.data;
        const fontSize = 20;
        const height = this.props.height;
        const Labels = ({ x, y, bandwidth, data }) => (
            data.map((column, index) => (
                <SVGText
                    key={ index }
                    x={ x(index) + (bandwidth / 2) }
                    y={ height - y(column.value) > height - fontSize - 10 ? y(column.value) + 15 : y(column.value) - 10 }
                    fontSize={ fontSize }
                    fill={ height - y(column.value) > height - fontSize - 10 ? 'white' : 'black' }
                    alignmentBaseline={ 'middle' }
                    textAnchor={ 'middle' }
                >
                    {column.value}
                </SVGText>
            ))
        )

        return (
            <View style={{ flexDirection: 'row', height: height }}>
                <BarChart
                    style={{ flex: 1 }}
                    data={data}
                    svg={{ fill: 'rgba(134, 65, 244, 0.8)' }}
                    contentInset={{ top: 10, bottom: 10 }}
                    spacing={0.2}
                    gridMin={0}
                    yAccessor={({ item }) => item.value}
                >
                    <Grid direction={Grid.Direction.HORIZONTAL}/>
                    <Labels/>
                </BarChart>
            </View>
        )
    }
}

export { VerticalBarChart };

// Styles specifically used to create the collapsible list component.
const CL_styles = StyleSheet.create({
    CL_roundButton: {
        backgroundColor: "#ea0029",
        borderRadius: 20,
        borderWidth: 5,
        borderColor: "#ce0025",
        minHeight: 40,
        margin: 5,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    CL_roundButtonSelected: {
        backgroundColor: "#FB113A",
        borderRadius: 20,
        borderWidth: 5,
        borderColor: "#DF1136",
        minHeight: 40,
        margin: 5,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    CL_content: {
        padding: 20,
        backgroundColor: '#fff',
    },
    CL_active: {
        backgroundColor: 'rgba(255,255,255,1)',
    },
    CL_inactive: {
        backgroundColor: 'rgba(245,252,255,1)',
    },
    CL_imageIcon: {
        width: 30,
        height: 30,
        resizeMode: 'contain',
        marginLeft: 10,
        marginRight: 10,
        flex: 1,
    },
    CL_roundButtonText: {
        color: "white",
        fontSize: 20,
        textAlign: 'center',
        flex: 6,
        ...Platform.select({
          android: {
            textAlignVertical: 'center',
          },
          ios: {
            lineHeight: 40,
          },
        }),
    },
    CL_roundButtonChild: {
        flexDirection: 'row',
        flex: 7,
    }
})

// Based on https://github.com/oblador/react-native-collapsible/blob/master/Example/App.js
// A component that makes a list of items, with a button to show and hide the
// content of each item.
// Expects the following props:
// - content: An array of objects that will be turned into the contents of the
//            list. Each object is made up of two properties:
//    - title: What will be used for the title button of the item. This can be
//             an element, an object with a string (text) and an image asset
//             (icon), or a plain string.
//    - content: What will be used for the content of the item. This can be an
//               element, an array of objects, or a plain string. The array of
//               objects has the same specification as that for InfoContent:
// - id: an unique identifier for the information item.
// - type: the type of component to use, specified in CONTENT_TYPE.
// - contents: the information to show. Expects an image supplied with require
//             for CONTENT_TYPES.IMAGE, and a video supplied with require for
//             CONTENT_TYPES.VIDEO, otherwise expects a string.
// - style: a style to apply to the component.
class CollapsibleList extends Component {
  
    // Used to keep track of the currently opened sections of the list.
    state = {
        activeSections : [],
    };
    setSections = sections => {
        this.setState({
            activeSections: sections.includes(undefined) ? [] : sections,
        });
    };

    // If elements were passed in, use them, otherwise prepare what was passed
    // as data.
    getContent = (rawContent) => {
        var content = [];
        for (var rawSection of rawContent) {
            var section = {}

            // If an element was passed for the title of this list item, use
            // that.
            if (React.isValidElement(rawSection.title)) {
                section.title = rawSection.title;
            }

            // If an icon was included for the title of this list item, create a
            // title element that includes an icon.
            else if (rawSection.title.icon !== undefined) {
                section.title = (
                    <View style={CL_styles.CL_roundButtonChild}>
                        <Image
                            source={rawSection.title.icon}
                            style={CL_styles.CL_imageIcon}
                        />
                        <Text style={CL_styles.CL_roundButtonText}>{rawSection.title.text}</Text>
                    </View>
                );
            }

            // Otherwise, if it is just text, create a title element with only
            // text.
            else if (typeof rawSection.title.text === "string" || typeof rawSection.title === "string") {
                var title = rawSection.title.text !== undefined ? rawSection.title.text : rawSection.title;
                section.title = (
                    <View>
                        <Text style={CL_styles.CL_roundButtonText}>{title}</Text>
                    </View>
                );
            }

            // Placeholder if nothing valid was passed.
            else {
                section.title = (
                    <View>
                        <Text style={CL_styles.CL_roundButtonText}>Placeholder</Text>
                    </View>
                );
            }

            // If an element was passed for the content of this list item, use
            // that.
            if (React.isValidElement(rawSection.content)) {
                section.content = rawSection.content;
            }

            // Otherwise, assume it is a list of items for InfoContent and create
            // an element for it.
            else if (Array.isArray(rawSection.content)) {
                section.content = (<InfoContent contents={rawSection.content}/>)
            }

            // Othrerwise, if it is just text, create a text element.
            else if (typeof rawSection.content === "string") {
                section.content = (
                    <View>
                        <Text>{rawSection.content}</Text>
                    </View>
                )
            }

            // Placeholder if nothing valid was passed.
            else {
                section.content = (
                    <View>
                        <Text>Placeholder content</Text>
                    </View>
                )
            }

            content.push(section);
        }
        return content;
    }

    // Render elements for the header.
    renderHeader = (section, _, isActive) => {
        return (
            <View
            style={isActive ? CL_styles.CL_roundButtonSelected : CL_styles.CL_roundButton}
            >{section.title}{isActive ? (
                <Image
                    source={require('../assets/images/Icons/icon_dropup.png')}
                    style={CL_styles.CL_imageIcon}
                />
                ) : (
                <Image
                    source={require('../assets/images/Icons/icon_dropdown.png')}
                    style={CL_styles.CL_imageIcon}
                />
            )}</View>
        );
    };

    // Render elements for the content.
    renderContent = (section, _, isActive) => {
        return (
            <Animatable.View
                duration={100}
                style={[CL_styles.CL_content, isActive ? CL_styles.CL_active : CL_styles.CL_inactive]}
                transition="backgroundColor"
            >
                <Animatable.View animation={isActive ? 'bounceIn' : undefined}>
                {section.content}
                </Animatable.View>
            </Animatable.View>
            );
    };

    render () {
        const { activeSections } = this.state;

        return (
            <View>
                <Accordion
                    activeSections={activeSections}
                    sections={this.getContent(this.props.content)}
                    renderHeader={this.renderHeader}
                    renderContent={this.renderContent}
                    duration={100}
                    onChange={this.setSections}
                />
            </View>
        )
    }
}

export { CollapsibleList };

// Based on: https://github.com/vivaxy/react-native-auto-height-image/issues/9#issuecomment-500166639
// A component that makes an image that is automatically set to the right height, given its width.
// Expects the following props:
// - source: The source of the image to display.
// - style: Any styling to use for the image.
export function WrappedAutoHeightImage( props ) {
    const [wrapperWidth, setWrapperWidth] = useState(0)
    return (
        <View
            style={props.style}
            onLayout={event => setWrapperWidth(event.nativeEvent.layout.width)}
        >
            {Platform.OS === 'web' ? <img style={{ width: wrapperWidth, maxWidth: "512px", display: 'block', marginLeft: 'auto', marginRight: 'auto' }} src={props.source}/> : <AutoHeightImage width={wrapperWidth} source={props.source}/>}
        </View>
    )
}