// Script with the contents for the "About the app" screen.

// ------------ Imports ------------
import {
    sharedStyles,
    CONTENT_TYPES,
  } from '../components/SharedComponents.js';

import React from 'react';
import { Text, Linking } from 'react-native';

// ------------ App code start ------------

const appJson = require('../app.json');

export const AboutApp = [
    {
        id: 0,
        type: CONTENT_TYPES.TEXT,
        contents: (<Text>Version {appJson.expo.version} of this mobile app.</Text>),
        style: sharedStyles.infoMainPointText,
    },
    {
        id: 1,
        type: CONTENT_TYPES.TEXT,
        contents: (<Text>You can put any information you want to put about the app here, and can also include <Text style={sharedStyles.linkText} onPress={() => Linking.openURL('https://www.bing.com')}>links</Text>.</Text>),
        style: sharedStyles.infoMainPointText,
    }
]