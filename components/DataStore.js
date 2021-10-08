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

// Shared things for the store
const rootReducer = combineReducers({
    menu: menuSlice.reducer
})

export const store = configureStore({
    reducer: rootReducer
})