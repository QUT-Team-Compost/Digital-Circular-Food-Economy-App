// Script with the contents for the "What is compost?"" screen.

// ------------ Imports ------------
import {
    sharedStyles,
    CONTENT_TYPES,
    CollapsibleList,
  } from '../components/SharedComponents.js';

import React from 'react';
import { Dimensions, Text } from 'react-native';
import Unorderedlist from 'react-native-unordered-list';

// ------------ App code start ------------

// This is an example of an array that can be used to populate an InfoScreen
// component. It is made up of a series of objects that define seperate pieces
// of content. Though this is intended to allow creating content without having
// to use JSX, raw JSX elements can be included as well.
// Each individual content object requires the following two properties:
// - id: A unique key for that element.
// - content: The content itself. What this should consist of depends on the
//      type. If no type is defined, it will be placed in a View component.
// Additionally, there are two other properties that can be included:
// - type: The type of content, which determines what kind of component is
//      used. This can be five different options:
//      - CONTENT_TYPES.TEXT: A regular text component.
//      - CONTENT_TYPES.BULLETPOINT: A text component that includes a bullet
//          point at the start.
//      - CONTENT_TYPES.IMAGE: An image component. The content should be a
//          require statement to a valid image file.
//      - CONTENT_TYPES.AUTOIMAGE: An image component that automatically
//          changes its height based on the image width, to allow for images
//          that change size depending on the screen resolution. The content
//          should be a require statement to a valid image file.
//      - CONTENT_TYPES.VIDEO: An expo-av video component. The video will
//          automatically play when the user navigates to the screen, and will
//          stop when they navigate away. This feature will only work with one
//          video in the same InfoScreen. The content should be a a require
//          statement to a valid video file.
// - style: Any styling that should be applied to the content's component.
export const ExampleRoute = [
    // Regular text content.
    {
        id: 0,
        type: CONTENT_TYPES.TEXT,
        contents: "This is an example route.",
        style: sharedStyles.infoMainPointText,
    },
    // Text content with a bullet point.
    {
        id: 1,
        type: CONTENT_TYPES.BULLETPOINT,
        contents: "The recognised types are text, bullet points, videos and images. There is also a special image type to automatically give the image the correct height when given a width. Each can be given its own styling as well.",
        style: sharedStyles.infoSubPointText,
    },
    // Raw JSX element.
    {
        id: 2,
        contents: (<Unorderedlist><Text>Raw elements can also be used, if a type is not defined. This can be used to allow things such as <Text style={sharedStyles.boldText}>bold text</Text>.</Text></Unorderedlist>),
        style: sharedStyles.infoSubPointText,
    },
    // Regular image content.
    {
        id: 3,
        type: CONTENT_TYPES.IMAGE,
        contents: require("../assets/images/exampleImage1.png"),
        style: { width: "90%", marginTop: 10 },
    },
    // Regular text content.
    {
        id: 4,
        type: CONTENT_TYPES.TEXT,
        contents: "A normal image; height is not automatically set.",
        style: sharedStyles.imageCaption,
    },
    // Video content that will automatically play when the user navigates to the screen, and stop when they navigate away.
    {
        id: 5,
        type: CONTENT_TYPES.VIDEO,
        contents: require("../assets/videos/exampleVideo.mp4"),
        style: {
                  width: "90%",
                  marginTop: 10,
                  height: ((Dimensions.get('window').width * 0.9) / (16 / 9)), // This is intended to make the height correct to the given width for a 16:9 ratio video.
                  marginTop: 5,
                  backgroundColor: "black",
                }
    },
    // Regular text content.
    {
        id: 6,
        type: CONTENT_TYPES.TEXT,
        contents: "A video that will automatically play when navigating to the screen and automatically stop when navigating away.",
        style: sharedStyles.imageCaption,
    },
    // Image content which will have its height automatically adjusted.
    {
        id: 7,
        type: CONTENT_TYPES.AUTOIMAGE,
        contents: require("../assets/images/exampleImage2.png"),
        style: { width: "90%", marginTop: 10 },
    },
    // Regular text content.
    {
        id: 9,
        type: CONTENT_TYPES.TEXT,
        contents: "An auto image; height is automatically set.",
        style: sharedStyles.imageCaption,
    }
]

// This is an example of content that includes the CollapsableList component.
// That component is also designed to accept an array of objects to avoid
// having to define JSX (though of course it can be used in places). The
// content is passsed to the component through the "content" prop.
// Each individual object in the content prop for a CollapasbleList requires
// the following two properties:
// title: The text that appears in the header. This can be a plain string. To
//      have a header with an icon in it, an object can be used for this
//      property with the two properties text (a string) and icon (a require
//      statement to a valid image).
// content: The content that appears when the header is tapped. This can also
//      be a plain string. Any JSX elements passed in are also valid, and if an
//      array is used, it will place it in the same kind of component as used
//      in an InfoScreen.
export const ExampleRouteCL = [
    // Regular text content to start with.
    {
        id: 0,
        type: CONTENT_TYPES.TEXT,
        contents: "This is an example route that shows off the collapsable list component.",
        style: sharedStyles.infoMainPointText,
    },
    // Inserting the CollapsableList as a JSX element. The content prop expects
    // an array of objects, each with a "title" and "content" property.
    {
        id: 1,
        contents: (<CollapsibleList content={
            [
                // One piece of content for the list. This one has an icon in
                // the header and several elements that will be displayed
                // inside it.
                {
                    // The icon needs to be an image that is retrieved using
                    // the require statement.
                    title: { text: "What is in this list?", icon: require("../assets/images/Icons/icon_problem.png") },
                    
                    // Content can follow the same pattern as a regular route
                    // using an InfoScreen; the correct element will be placed
                    // in the list automatically.
                    content: [
                        {
                            id: 0,
                            type: CONTENT_TYPES.TEXT,
                            contents: "Collapasble lists can contain several different elements by defining them in the same way as a regular route.",
                            style: sharedStyles.infoMainPointText,
                        },
                        {
                            id: 1,
                            type: CONTENT_TYPES.BULLETPOINT,
                            contents: "This can include bulletpoints, images and a video as well.",
                            style: sharedStyles.infoSubPointText,
                        },
                        {
                            id: 2,
                            type: CONTENT_TYPES.AUTOIMAGE,
                            contents: require("../assets/images/exampleImage2.png"),
                            style: { width: "90%", marginTop: 10 },
                        },
                        {
                            id: 3,
                            type: CONTENT_TYPES.TEXT,
                            contents: "An auto image; height is automatically set.",
                            style: sharedStyles.imageCaption,
                        }
                    ]
                },
                // Both the title and content can also be simple strings.
                {
                    title: "Header title without icon",
                    content: "Titles and content can be simple elements as well, such as by passing a plain string like this."
                }
            ]
        }/>)
    }
]