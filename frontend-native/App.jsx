import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';

import { ProvedorAutenticacao } from './src/contextos/ContextoAutenticacao';
import { ProvedorTema, usarTema } from './src/contextos/ContextoTema';
import { ProvedorDados } from './src/contextos/ContextoDados';
import { NavegadorPrincipal } from './src/navegacao/NavegadorPrincipal';

const ConteudoApp = () => {
  const { tema } = usarTema();

  return (
    <PaperProvider theme={tema}>
      <NavegadorPrincipal />
    </PaperProvider>
  );
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ProvedorAutenticacao>
        <ProvedorTema>
          <ProvedorDados>
            <ConteudoApp />
          </ProvedorDados>
        </ProvedorTema>
      </ProvedorAutenticacao>
    </GestureHandlerRootView>
  );
}
