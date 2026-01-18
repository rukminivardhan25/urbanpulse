import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAdminAuth } from '../contexts/AdminAuthContext';

// Import screens
import AdminLandingScreen from '../screens/AdminLandingScreen';
import AdminSigninScreen from '../screens/AdminSigninScreen';
import AdminSignupScreen from '../screens/AdminSignupScreen';
import AdminLocationSelectionScreen from '../screens/AdminLocationSelectionScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import ManageServicesScreen from '../screens/ManageServicesScreen';
import SendAlertsScreen from '../screens/SendAlertsScreen';
import ViewReportsScreen from '../screens/ViewReportsScreen';
import AdminProfileScreen from '../screens/AdminProfileScreen';
import AdminChatScreen from '../screens/AdminChatScreen';

const Stack = createNativeStackNavigator();

export function AdminNavigator({ isAuthenticated }) {
  const navigationRef = useRef(null);
  const { checkAuthStatus } = useAdminAuth();

  useEffect(() => {
    if (navigationRef.current) {
      if (isAuthenticated) {
        // Admin is authenticated, redirect to Dashboard
        navigationRef.current.reset({
          index: 0,
          routes: [{ name: 'AdminDashboard' }],
        });
      } else {
        // Admin is not authenticated, redirect to Landing
        navigationRef.current.reset({
          index: 0,
          routes: [{ name: 'AdminLanding' }],
        });
      }
    }
  }, [isAuthenticated]);

  // Listen for navigation state changes to check auth on protected routes
  const handleNavigationStateChange = () => {
    const currentRoute = navigationRef.current?.getCurrentRoute();
    if (currentRoute) {
      const protectedRoutes = ['AdminDashboard', 'AdminProfile', 'ManageServices', 'SendAlerts', 'ViewReports', 'AdminChat'];
      const publicRoutes = ['AdminLanding', 'AdminSignin', 'AdminSignup'];
      
      if (protectedRoutes.includes(currentRoute.name) && !isAuthenticated) {
        // Redirect to Landing if trying to access protected route without auth
        navigationRef.current?.reset({
          index: 0,
          routes: [{ name: 'AdminLanding' }],
        });
      } else if (publicRoutes.includes(currentRoute.name) && isAuthenticated) {
        // Redirect to Dashboard if authenticated admin tries to access public routes
        navigationRef.current?.reset({
          index: 0,
          routes: [{ name: 'AdminDashboard' }],
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
        initialRouteName={isAuthenticated ? 'AdminDashboard' : 'AdminLanding'}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="AdminLanding" component={AdminLandingScreen} />
        <Stack.Screen name="AdminSignin" component={AdminSigninScreen} />
        <Stack.Screen name="AdminSignup" component={AdminSignupScreen} />
        <Stack.Screen
          name="AdminLocationSelection"
          component={AdminLocationSelectionScreen}
        />
        <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
        <Stack.Screen name="ManageServices" component={ManageServicesScreen} />
        <Stack.Screen name="SendAlerts" component={SendAlertsScreen} />
        <Stack.Screen name="ViewReports" component={ViewReportsScreen} />
        <Stack.Screen name="AdminProfile" component={AdminProfileScreen} />
        <Stack.Screen name="AdminChat" component={AdminChatScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

