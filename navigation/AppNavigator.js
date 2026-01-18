import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';

// Import screens
import LandingScreen from '../screens/LandingScreen';
import SigninScreen from '../screens/SigninScreen';
import SignupScreen from '../screens/SignupScreen';
import AreaSelectionScreen from '../screens/AreaSelectionScreen';
import LocationSelectionScreen from '../screens/LocationSelectionScreen';
import ChangeAreaScreen from '../screens/ChangeAreaScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ServicesScreen from '../screens/ServicesScreen';
import AlertsScreen from '../screens/AlertsScreen';
import ReportIssueScreen from '../screens/ReportIssueScreen';
import ReportIssueLocationScreen from '../screens/ReportIssueLocationScreen';
import MakeRequestLocationScreen from '../screens/MakeRequestLocationScreen';
import ComplaintTrackingScreen from '../screens/ComplaintTrackingScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AIChatAssistantScreen from '../screens/AIChatAssistantScreen';
import EmergencyServicesScreen from '../screens/EmergencyServicesScreen';
import LanguageSelectionScreen from '../screens/LanguageSelectionScreen';
import MakeRequestScreen from '../screens/MakeRequestScreen';
import HelpRequestsScreen from '../screens/HelpRequestsScreen';
import RequestDetailsScreen from '../screens/RequestDetailsScreen';
import MyRequestsScreen from '../screens/MyRequestsScreen';
import ChatScreen from '../screens/ChatScreen';
import HelpOfferScreen from '../screens/HelpOfferScreen';
import HelpersListScreen from '../screens/HelpersListScreen';
import RequesterChatScreen from '../screens/RequesterChatScreen';
import HelperChatScreen from '../screens/HelperChatScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import MapScreen from '../screens/MapScreen';

const Stack = createNativeStackNavigator();

export function AppNavigator({ isAuthenticated }) {
  const navigationRef = useRef(null);
  const { checkAuthStatus } = useAuth();

  useEffect(() => {
    if (navigationRef.current) {
      if (isAuthenticated) {
        // User is authenticated, redirect to Dashboard
        navigationRef.current.reset({
          index: 0,
          routes: [{ name: 'Dashboard' }],
        });
      } else {
        // User is not authenticated, redirect to Landing
        navigationRef.current.reset({
          index: 0,
          routes: [{ name: 'Landing' }],
        });
      }
    }
  }, [isAuthenticated]);

  // Listen for navigation state changes to check auth on protected routes
  const handleNavigationStateChange = () => {
    const currentRoute = navigationRef.current?.getCurrentRoute();
    if (currentRoute) {
      const protectedRoutes = ['Dashboard', 'Profile', 'Services', 'Alerts', 'ReportIssue', 'ReportIssueLocation', 'ComplaintTracking', 'Complaints', 'AIChatAssistant', 'MakeRequest', 'MakeRequestLocation', 'HelpRequests', 'RequestDetails', 'MyRequests', 'Chat', 'HelpOffer', 'HelpersList', 'RequesterChat', 'HelperChat', 'Notifications'];
      const publicRoutes = ['Landing', 'Signin', 'Signup'];
      
      if (protectedRoutes.includes(currentRoute.name) && !isAuthenticated) {
        // Redirect to Landing if trying to access protected route without auth
        navigationRef.current?.reset({
          index: 0,
          routes: [{ name: 'Landing' }],
        });
      } else if (publicRoutes.includes(currentRoute.name) && isAuthenticated) {
        // Redirect to Dashboard if authenticated user tries to access public routes
        navigationRef.current?.reset({
          index: 0,
          routes: [{ name: 'Dashboard' }],
        });
      }
    }
  };

  return (
    <NavigationContainer 
      ref={navigationRef}
      onStateChange={handleNavigationStateChange}
    >
      <Stack.Navigator
        initialRouteName={isAuthenticated ? 'Dashboard' : 'Landing'}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Landing" component={LandingScreen} />
        <Stack.Screen name="Signin" component={SigninScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="AreaSelection" component={AreaSelectionScreen} />
        <Stack.Screen name="LocationSelection" component={LocationSelectionScreen} />
        <Stack.Screen name="ChangeArea" component={ChangeAreaScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Services" component={ServicesScreen} />
        <Stack.Screen name="Alerts" component={AlertsScreen} />
        <Stack.Screen name="ReportIssue" component={ReportIssueScreen} />
        <Stack.Screen name="ReportIssueLocation" component={ReportIssueLocationScreen} />
        <Stack.Screen name="ComplaintTracking" component={ComplaintTrackingScreen} />
        <Stack.Screen name="Complaints" component={ComplaintTrackingScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="AIChatAssistant" component={AIChatAssistantScreen} />
        <Stack.Screen name="EmergencyServices" component={EmergencyServicesScreen} />
        <Stack.Screen name="LanguageSelection" component={LanguageSelectionScreen} />
        <Stack.Screen name="EmergencyVolunteering" component={ServicesScreen} />
        <Stack.Screen name="MakeRequest" component={MakeRequestScreen} />
        <Stack.Screen name="MakeRequestLocation" component={MakeRequestLocationScreen} />
        <Stack.Screen name="HelpRequests" component={HelpRequestsScreen} />
        <Stack.Screen name="RequestDetails" component={RequestDetailsScreen} />
        <Stack.Screen name="MyRequests" component={MyRequestsScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen name="HelpOffer" component={HelpOfferScreen} />
        <Stack.Screen name="HelpersList" component={HelpersListScreen} />
        <Stack.Screen name="RequesterChat" component={RequesterChatScreen} />
        <Stack.Screen name="HelperChat" component={HelperChatScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="MapScreen" component={MapScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
