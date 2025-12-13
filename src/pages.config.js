import Home from './pages/Home';
import TripDetails from './pages/TripDetails';
import MyTrips from './pages/MyTrips';
import AIRecommendations from './pages/AIRecommendations';
import Profile from './pages/Profile';
import Onboarding from './pages/Onboarding';
import CreateTrip from './pages/CreateTrip';
import EditTrip from './pages/EditTrip';
import Community from './pages/Community';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfUse from './pages/TermsOfUse';
import AccessibilityStatement from './pages/AccessibilityStatement';
import AboutUs from './pages/AboutUs';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "TripDetails": TripDetails,
    "MyTrips": MyTrips,
    "AIRecommendations": AIRecommendations,
    "Profile": Profile,
    "Onboarding": Onboarding,
    "CreateTrip": CreateTrip,
    "EditTrip": EditTrip,
    "Community": Community,
    "TermsOfService": TermsOfService,
    "PrivacyPolicy": PrivacyPolicy,
    "TermsOfUse": TermsOfUse,
    "AccessibilityStatement": AccessibilityStatement,
    "AboutUs": AboutUs,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};