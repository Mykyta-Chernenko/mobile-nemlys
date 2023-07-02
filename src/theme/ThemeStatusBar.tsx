import React from 'react';

import { StatusBar } from 'expo-status-bar';
import { useThemeMode } from '@rneui/themed';

export default function () {
  const { mode } = useThemeMode();

  // status bar must be opposed color to the current theme mode
  return <StatusBar style={mode === 'light' ? 'dark' : 'light'}></StatusBar>;
}
