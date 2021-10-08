// Script that allows React Navigation information to be accessed throughout
// the app.

// ------------ Imports ------------
import * as React from 'react';

// ------------ App code start ------------

export const navigationRef = React.createRef();

export function navigate(name, params) {
    navigationRef.current?.navigate(name, params);
}