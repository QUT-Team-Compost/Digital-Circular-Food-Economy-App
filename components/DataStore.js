// Script for the data store, pesisting data across all areas of the app.
// Based on the following tutorial:
// https://redux-toolkit.js.org/tutorials/advanced-tutorial

// ------------ Imports ------------
import { combineReducers, createSlice, configureStore, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios';
import { dprint } from './SharedComponents.js';

// Environment variables used here.
import {SERVER_BASE_URL} from "@env"

// ------------ App code start ------------

// ------------ Menu ------------
const menuInitialState = {
    currentPage: 0,
} 

// Slice for the menu state
const menuSlice = createSlice({
    name: "menu",
    initialState: menuInitialState,
    reducers: {
        setCurrentPage(state, action) {
            state.currentPage = action.payload;
        },
    }
})

export const {
    setCurrentPage,
} = menuSlice.actions

// ------------ Login ------------
const loginInitialState = {
    jwt: null,
    username: null,
    loading: false,
    error: null,
}

// Thunk for logging out
export const logoutUsingToken = createAsyncThunk('login/logoutUsingToken', (token) => {
    dprint ("logoutUsingToken: running");
    return axios.post(SERVER_BASE_URL + '/logout', {}, {
        headers: {
            'Content-Type': 'application/json', 'Accept': 'application/json',
            "Authorization": token,
        },
    })
    .then(response => {
        if (!response) {
            throw Error("No response from server.");
        } else {
            return response.data;
        }
    })
    .catch((err) => {
        throw Error(err.response.data.message);
    });
})

// Thunk for checking login status
export const checkIfLoggedIn = createAsyncThunk('login/checkIfLoggedIn', (token) => {
    dprint ("checkifLoggedIn: running");
    return axios.post(SERVER_BASE_URL + '/validateToken', {}, {
        headers: {
            'Content-Type': 'application/json', 'Accept': 'application/json',
            "Authorization": token,
        },
    })
    .then(response => {
        if (!response) {
            throw Error("No response from server.");
        } else {
            return response.data;
        }
    })
    .catch((err) => {
        throw Error(err.response.data.message);
    });
})

// Slice for the login state
const loginSlice = createSlice({
    name: "login",
    initialState: loginInitialState,
    reducers: {
        setLoginToken(state, action) {
            state.jwt = action.payload;
        },
        setUsername(state, action) {
            state.username = action.payload;
        },
    },
    extraReducers: {
        // Results for logoutUsingToken
        [logoutUsingToken.pending]: state => {
          state.loading = true;
          state.error = null;
          dprint("logoutUsingToken: Waiting for thunk...");
        },
        [logoutUsingToken.rejected]: (state, action) => {
          state.loading = false;
          state.error = action.error.message;
          dprint("logoutUsingToken: Thunk encountered an error.");
          dprint("Action contents are:");
          dprint(action);
        },
        [logoutUsingToken.fulfilled]: (state, action) => {
          state.loading = false;
          state.jwt = null;
          state.username = null;
          state.error = null;
          dprint("logoutUsingToken: Thunk was successful.");
        },
        // Results for checkIfLoggedIn
        [checkIfLoggedIn.pending]: state => {
            dprint("checkIfLoggedIn: Waiting for thunk...");
          },
          [checkIfLoggedIn.rejected]: (state, action) => {
            dprint("checkIfLoggedIn: Thunk encountered an error.");
            dprint("Action contents are:");
            dprint(action);
            if (action.error.message.includes("Unauthorized")) {
                dprint("Got an unauthorized error - user's token is invalid.");
                state.jwt = null;
                state.username = null;
            }
          },
          [checkIfLoggedIn.fulfilled]: (state, action) => {
            dprint("checkIfLoggedIn: Thunk was successful.");
          }
      }
})

export const {
    setLoginToken,
    setUsername,
} = loginSlice.actions

// ------------ UserInfo ------------
/*const userInfoInitialState = {
    scraps: null,
}

// Thunk for getting number of scraps composted
export const getScrapsFromServer = createAsyncThunk('userInfo/getScraps', (token) => {
    dprint ("getScraps: running");
    return axios.post('http://sefyrb01-dev.qut.edu.au:3000/users_old/getScraps_test_old', {}, {
        headers: {
            'Content-Type': 'application/json', 'Accept': 'application/json',
            "Authorization": token,
        },
    })
    .then(response => {
        if (!response) {
            throw Error("No response from server.");
        } else {
            return response.data;
        }
    })
    .catch((err) => {
        throw Error(err.response.data.message);
    });
})

// Slice for the user info state
const userInfoSlice = createSlice({
    name: "userInfo",
    initialState: userInfoInitialState,
    reducers: {
        setScraps(state, action) {
            state.scraps = action.payload;
        },
    },
    extraReducers: {
        // Results for getScraps
        [getScrapsFromServer.pending]: state => {
            dprint("getScrapsFromServer: Waiting for thunk...");
          },
          [getScrapsFromServer.rejected]: (state, action) => {
            dprint("getScrapsFromServer: Thunk encountered an error.");
            dprint("Action contents are:");
            dprint(action);
            if (action.error.message.includes("Unauthorized")) {
                dprint("Got an unauthorized error - user's token is invalid.");
            }
          },
          [getScrapsFromServer.fulfilled]: (state, action) => {
            dprint("getScrapsFromServer: Thunk was successful.");
            state.scraps = action.payload.scraps_amount;
          }
      }
})

export const {
    setScraps,
} = userInfoSlice.actions*/

// Shared things for the store
const rootReducer = combineReducers({
    menu: menuSlice.reducer,
    login: loginSlice.reducer,
    //userInfo: userInfoSlice.reducer,
})

export const store = configureStore({
    reducer: rootReducer
  })