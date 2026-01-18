import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, ActivityIndicator } from 'react-native';
import { AdminNavigator } from './navigation/AdminNavigator';
import { AdminAuthProvider, useAdminAuth } from './contexts/AdminAuthContext';
import { theme } from './constants/theme';

function AppContent() {
  const { isAuthenticated, isLoading } = useAdminAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.admin} />
      </View>
    );
  }

  return <AdminNavigator isAuthenticated={isAuthenticated} />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AdminAuthProvider>
        <AppContent />
      </AdminAuthProvider>
    </SafeAreaProvider>
  );
}

