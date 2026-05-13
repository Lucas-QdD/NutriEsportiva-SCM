import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

import TelaLogin from '../telas/TelaLogin';
import TelaPrincipal from '../telas/TelaPrincipal';
import TelaAtletas from '../telas/TelaAtletas';
import TelaAvaliacao from '../telas/TelaAvaliacao';
import TelaConfiguracoes from '../telas/TelaConfiguracoes';
import TelaManual from '../telas/TelaManual';
import TelaTermos from '../telas/TelaTermos';
import { usarAutenticacao } from '../contextos/ContextoAutenticacao';

const Pilha = createStackNavigator();

const LayoutComBarraLateral = ({ children, navigation, tipoUsuario }) => {
  const ehNutricionista = tipoUsuario === 'NUTRITIONIST';

  const itensNavegacao = [
    { nome: 'Painel', rota: 'PainelInicio', icone: '📊' },
    ...(ehNutricionista ? [{ nome: 'Atletas', rota: 'AtletasInicio', icone: '👥' }] : []),
    ...(!ehNutricionista ? [{ nome: 'Começar Avaliação', rota: 'AvaliacaoInicio', icone: '📝' }] : []),
    { nome: 'Configurações', rota: 'ConfiguracoesInicio', icone: '⚙️' },
    { nome: 'Manual Operacional', rota: 'Manual', icone: '📖' },
    { nome: 'Termos de Uso', rota: 'Termos', icone: '📋' },
  ];

  return (
    <View style={estilos.layoutPrincipal}>
      {/* Barra Lateral */}
      <View style={estilos.barraLateral}>
        <ScrollView style={estilos.conteudoBarraLateral}>
          {/* Cabeçalho da Barra Lateral */}
          <View style={estilos.cabecalhoBarraLateral}>
            <Text style={estilos.tituloBarraLateral}>SAO</Text>
            <Text style={estilos.subtituloBarraLateral}>NutriEsportiva</Text>
            <Text style={estilos.subtituloBarraLateral}>SÃO CAMILO</Text>
          </View>

          {/* Itens de Navegação */}
          <View style={estilos.itensNavegacao}>
            {itensNavegacao.map((item) => (
              <TouchableOpacity
                key={item.rota}
                style={estilos.itemNavegacao}
                onPress={() => navigation.navigate(item.rota)}
              >
                <Text style={estilos.iconeItem}>{item.icone}</Text>
                <Text style={estilos.textoItem}>{item.nome}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Rodapé */}
          <View style={estilos.rodapeBarraLateral}>
            <Text style={estilos.textoRodape}>
              {ehNutricionista ? 'Nutricionista' : 'Atleta'}
            </Text>
          </View>
        </ScrollView>
      </View>

      {/* Área de Conteúdo Principal */}
      <View style={estilos.areaConteudo}>
        {children}
      </View>
    </View>
  );
};

const NavegadorAutenticacao = () => {
  return (
    <Pilha.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Pilha.Screen name="Entrar" component={TelaLogin} />
    </Pilha.Navigator>
  );
};

const NavegadorApp = ({ tipoUsuario }) => {
  return (
    <Pilha.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#c41e3a',
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Pilha.Screen
        name="PainelInicio"
        options={{ title: 'Dashboard' }}
      >
        {(props) => (
          <LayoutComBarraLateral navigation={props.navigation} tipoUsuario={tipoUsuario}>
            <TelaPrincipal {...props} />
          </LayoutComBarraLateral>
        )}
      </Pilha.Screen>
      {tipoUsuario === 'NUTRITIONIST' && (
        <Pilha.Screen
          name="AtletasInicio"
          options={{ title: 'Atletas' }}
        >
          {(props) => (
            <LayoutComBarraLateral navigation={props.navigation} tipoUsuario={tipoUsuario}>
              <TelaAtletas {...props} />
            </LayoutComBarraLateral>
          )}
        </Pilha.Screen>
      )}
      {tipoUsuario === 'ATHLETE' && (
        <Pilha.Screen
          name="AvaliacaoInicio"
          options={{ title: 'Começar Avaliação' }}
        >
          {(props) => (
            <LayoutComBarraLateral navigation={props.navigation} tipoUsuario={tipoUsuario}>
              <TelaAvaliacao {...props} />
            </LayoutComBarraLateral>
          )}
        </Pilha.Screen>
      )}
      <Pilha.Screen
        name="ConfiguracoesInicio"
        options={{ title: 'Configurações' }}
      >
        {(props) => (
          <LayoutComBarraLateral navigation={props.navigation} tipoUsuario={tipoUsuario}>
            <TelaConfiguracoes {...props} />
          </LayoutComBarraLateral>
          )}
      </Pilha.Screen>
      <Pilha.Screen
        name="Manual"
        options={{ title: 'Manual Operacional' }}
      >
        {(props) => (
          <LayoutComBarraLateral navigation={props.navigation} tipoUsuario={tipoUsuario}>
            <TelaManual {...props} />
          </LayoutComBarraLateral>
        )}
      </Pilha.Screen>
      <Pilha.Screen
        name="Termos"
        options={{ title: 'Termos de Uso' }}
      >
        {(props) => (
          <LayoutComBarraLateral navigation={props.navigation} tipoUsuario={tipoUsuario}>
            <TelaTermos {...props} />
          </LayoutComBarraLateral>
        )}
      </Pilha.Screen>
    </Pilha.Navigator>
  );
};

export const NavegadorPrincipal = () => {
  const { autenticado, tipoUsuario } = usarAutenticacao();

  return (
    <NavigationContainer>
      {autenticado ? (
        <NavegadorApp tipoUsuario={tipoUsuario} />
      ) : (
        <NavegadorAutenticacao />
      )}
    </NavigationContainer>
  );
};

export default NavegadorPrincipal;

const estilos = StyleSheet.create({
  layoutPrincipal: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
  },
  barraLateral: {
    width: 280,
    backgroundColor: '#1f2937', // gray-800
    borderRightWidth: 1,
    borderRightColor: '#374151', // gray-700
  },
  conteudoBarraLateral: {
    flex: 1,
  },
  cabecalhoBarraLateral: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
    alignItems: 'center',
  },
  tituloBarraLateral: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#c41e3a',
    marginBottom: 4,
  },
  subtituloBarraLateral: {
    fontSize: 12,
    color: '#ffffff',
    textAlign: 'center',
  },
  itensNavegacao: {
    paddingTop: 20,
  },
  itemNavegacao: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  itemNavegacaoAtivo: {
    backgroundColor: '#c41e3a',
  },
  iconeItem: {
    fontSize: 18,
    marginRight: 16,
    color: '#ffffff',
  },
  textoItem: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
  rodapeBarraLateral: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#374151',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  textoRodape: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
  areaConteudo: {
    flex: 1,
  },
});
