import AIRecommendations from './pages/AIRecommendations';
import AboutUs from './pages/AboutUs';
import AccessibilityStatement from './pages/AccessibilityStatement';
import Admin from './pages/Admin';
import CodeAnalyzer from './pages/CodeAnalyzer';
import Community from './pages/Community';
import CookiePolicy from './pages/CookiePolicy';
import CreateTrip from './pages/CreateTrip';
import Dashboard from './pages/Dashboard';
import EditTrip from './pages/EditTrip';
import Feedback from './pages/Feedback';
import Home from './pages/Home';
import Inbox from './pages/Inbox';
import JournalEditor from './pages/JournalEditor';
import JournalEntry from './pages/JournalEntry';
import Legal from './pages/Legal';
import ListDetails from './pages/ListDetails';
import MyLists from './pages/MyLists';
import MyTrips from './pages/MyTrips';
import Notifications from './pages/Notifications';
import Onboarding from './pages/Onboarding';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import TermsOfService from './pages/TermsOfService';
import TermsOfUse from './pages/TermsOfUse';
import TravelJournal from './pages/TravelJournal';
import TripDetails from './pages/TripDetails';
import TripSummary from './pages/TripSummary';
import Weather from './pages/Weather';
import Landing from './pages/Landing';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AIRecommendations": AIRecommendations,
    "AboutUs": AboutUs,
    "AccessibilityStatement": AccessibilityStatement,
    "Admin": Admin,
    "CodeAnalyzer": CodeAnalyzer,
    "Community": Community,
    "CookiePolicy": CookiePolicy,
    "CreateTrip": CreateTrip,
    "Dashboard": Dashboard,
    "EditTrip": EditTrip,
    "Feedback": Feedback,
    "Home": Home,
    "Inbox": Inbox,
    "JournalEditor": JournalEditor,
    "JournalEntry": JournalEntry,
    "Legal": Legal,
    "ListDetails": ListDetails,
    "MyLists": MyLists,
    "MyTrips": MyTrips,
    "Notifications": Notifications,
    "Onboarding": Onboarding,
    "PrivacyPolicy": PrivacyPolicy,
    "Profile": Profile,
    "Settings": Settings,
    "TermsOfService": TermsOfService,
    "TermsOfUse": TermsOfUse,
    "TravelJournal": TravelJournal,
    "TripDetails": TripDetails,
    "TripSummary": TripSummary,
    "Weather": Weather,
    "Landing": Landing,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};