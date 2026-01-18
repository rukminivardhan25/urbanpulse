import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  Home,
  Grid3X3,
  FileText,
  Bell,
  User,
} from 'lucide-react-native';
import { theme } from '../constants/theme';

const tabs = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'services', icon: Grid3X3, label: 'Services' },
  { id: 'report', icon: FileText, label: 'Report' },
  { id: 'alerts', icon: Bell, label: 'Alerts' },
  { id: 'profile', icon: User, label: 'Profile' },
];

export const BottomNav = ({ activeTab, onTabChange }) => {
  return (
    <View style={styles.container}>
      <View style={styles.nav}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => onTabChange(tab.id)}
              style={[styles.tab, isActive && styles.tabActive]}
              activeOpacity={0.7}
            >
              <Icon
                size={20}
                color={isActive ? theme.colors.primary : theme.colors.textLight}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <Text
                style={[
                  styles.tabLabel,
                  isActive && styles.tabLabelActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.white,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
  },
  tabActive: {
    backgroundColor: `${theme.colors.primary}10`,
  },
  tabLabel: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textLight,
  },
  tabLabelActive: {
    color: theme.colors.primary,
  },
});







