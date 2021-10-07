// Script that gives the list of screens that can be navigated to in the app.

// ------------ Imports ------------
import HomeScreen from '../screens/HomeScreen.js';
import QuizScreen from '../screens/QuizScreen.js';
import { HouseScores } from '../screens/HouseScores.js';
import { InfoScreen } from '../components/SharedComponents.js';

// Example route screen.
import {
  ExampleRoute,
  ExampleRouteCL
} from './ExampleRoute.js';

// Screens for about the app.
import {
  AboutApp
} from './AboutApp.js';

// Screen for compost sensors.
import SensorScreen from '../screens/SensorScreen.js'

// ------------ App code start ------------

// List of routes and their required components. Also includes a name for the
// drop down menu.
// The structure of this array is as follows:
// id: A unique id number of the screen, used to identify it in the menu.
// routeName: A unique name for the route used internally by React Navigation.
// routeComponent: The component used to render the screen.
// routeInitialParams: An object for any parameters that should be passed to
//      the routeComponent. For example, when using an InfoScreen, the contents
//      of the screen will be here.
// name: The name of the screen that will be shown in the menu.
export const routeIdList = [
  { id: 0,  routeName: 'Home',            routeComponent: HomeScreen,   routeInitialParams: { key: 0, },                            name: 'Home', },
  { id: 1,  routeName: 'ExampleRoute',    routeComponent: InfoScreen,   routeInitialParams: { key: 1, contents: ExampleRoute, },    name: 'Example route', },
  { id: 2,  routeName: 'ExampleRouteCL',  routeComponent: InfoScreen,   routeInitialParams: { key: 1, contents: ExampleRouteCL, },  name: 'Example route with list', },
  { id: 3,  routeName: 'HouseScores',     routeComponent: HouseScores,  routeInitialParams: { key: 2, },                            name: 'House scores', },
  { id: 4,  routeName: 'Sensors',         routeComponent: SensorScreen, routeInitialParams: { key: 3 },                             name: 'Compost sensors', },
  { id: 5,  routeName: 'Quiz',            routeComponent: QuizScreen,   routeInitialParams: { key: 4, },                            name: 'Quiz', },
  { id: 6,  routeName: 'AboutApp',        routeComponent: InfoScreen,   routeInitialParams: { key: 5, contents: AboutApp, },        name: 'About the app', },
]