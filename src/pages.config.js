import Home from './pages/Home';
import CreateTrip from './pages/CreateTrip';
import TripDetails from './pages/TripDetails';
import MyTrips from './pages/MyTrips';
import AIRecommendations from './pages/AIRecommendations';
import Profile from './pages/Profile';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "CreateTrip": CreateTrip,
    "TripDetails": TripDetails,
    "MyTrips": MyTrips,
    "AIRecommendations": AIRecommendations,
    "Profile": Profile,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};