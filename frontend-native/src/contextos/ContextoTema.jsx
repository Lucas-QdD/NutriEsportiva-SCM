import React, { createContext, useContext, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { configureFonts, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

const coresOriginais = {
  primary: '#c41e3a',
  primaryDark: '#a01830',
  primaryLight: '#dc2541',
  secondary: '#e63946',
  danger: '#ef4444',
  success: '#10b981',
  warning: '#f59e0b',
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  gray900: '#111827',
};

const coresEscurasOriginais = {
  gray50: '#0f172a',
  gray100: '#1e293b',
  gray200: '#334155',
  gray300: '#475569',
  gray400: '#64748b',
  gray500: '#94a3b8',
  gray600: '#cbd5e1',
  gray700: '#e2e8f0',
  gray800: '#f1f5f9',
  gray900: '#ffffff',
};

const temaBase = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: coresOriginais.primary,
    primaryContainer: coresOriginais.primaryLight,
    secondary: coresOriginais.secondary,
    secondaryContainer: coresOriginais.gray200,
    tertiary: coresOriginais.warning,
    error: coresOriginais.danger,
    background: coresOriginais.gray100,
    surface: coresOriginais.gray50,
    surfaceVariant: coresOriginais.gray100,
    onPrimary: '#ffffff',
    onPrimaryContainer: coresOriginais.primaryDark,
    onSecondary: '#ffffff',
    onSecondaryContainer: coresOriginais.gray700,
    onTertiary: '#ffffff',
    onError: '#ffffff',
    onBackground: coresOriginais.gray900,
    onSurface: coresOriginais.gray900,
    onSurfaceVariant: coresOriginais.gray600,
    outline: coresOriginais.gray300,
    outlineVariant: coresOriginais.gray200,
    shadow: '#000000',
    scrim: '#000000',
    inverseSurface: coresOriginais.gray900,
    inverseOnSurface: coresOriginais.gray50,
    inversePrimary: coresOriginais.primaryLight,
    elevation: {
      level0: 'transparent',
      level1: 'rgba(0, 0, 0, 0.05)',
      level2: 'rgba(0, 0, 0, 0.08)',
      level3: 'rgba(0, 0, 0, 0.11)',
      level4: 'rgba(0, 0, 0, 0.12)',
      level5: 'rgba(0, 0, 0, 0.14)',
    },
  },
  roundness: 10,
};

const temaEscuro = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: coresOriginais.primary,
    primaryContainer: coresOriginais.primaryLight,
    secondary: coresOriginais.secondary,
    secondaryContainer: coresEscurasOriginais.gray200,
    tertiary: coresOriginais.warning,
    error: coresOriginais.danger,
    background: coresEscurasOriginais.gray50,
    surface: coresEscurasOriginais.gray100,
    surfaceVariant: coresEscurasOriginais.gray200,
    onPrimary: '#ffffff',
    onPrimaryContainer: coresOriginais.primaryDark,
    onSecondary: '#ffffff',
    onSecondaryContainer: coresEscurasOriginais.gray700,
    onTertiary: '#ffffff',
    onError: '#ffffff',
    onBackground: coresEscurasOriginais.gray900,
    onSurface: coresEscurasOriginais.gray900,
    onSurfaceVariant: coresEscurasOriginais.gray600,
    outline: coresEscurasOriginais.gray300,
    outlineVariant: coresEscurasOriginais.gray200,
    shadow: '#000000',
    scrim: '#000000',
    inverseSurface: coresEscurasOriginais.gray900,
    inverseOnSurface: coresEscurasOriginais.gray50,
    inversePrimary: coresOriginais.primaryLight,
    elevation: {
      level0: 'transparent',
      level1: 'rgba(0, 0, 0, 0.05)',
      level2: 'rgba(0, 0, 0, 0.08)',
      level3: 'rgba(0, 0, 0, 0.11)',
      level4: 'rgba(0, 0, 0, 0.12)',
      level5: 'rgba(0, 0, 0, 0.14)',
    },
  },
  roundness: 10,
};

const ContextoTema = createContext();

export const ProvedorTema = ({ children }) => {
  const [temaTemaEscuro, setTemaTemaEscuro] = useState(false);

  const alternarTema = useCallback(async () => {
    setTemaTemaEscuro((anterior) => {
      const novoValor = !anterior;
      AsyncStorage.setItem('tema', novoValor ? 'escuro' : 'claro').catch(
        console.error
      );
      return novoValor;
    });
  }, []);

  const tema = temaTemaEscuro ? temaEscuro : temaBase;

  return (
    <ContextoTema.Provider
      value={{
        temaTemaEscuro,
        alternarTema,
        tema,
      }}
    >
      {children}
    </ContextoTema.Provider>
  );
};

export const usarTema = () => {
  const context = useContext(ContextoTema);
  if (!context) {
    throw new Error('usarTema deve ser usado dentro de um ProvedorTema');
  }
  return context;
};
