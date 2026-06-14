import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  useWindowDimensions,
  ActivityIndicator
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import TelaLogin from '../telas/TelaLogin';
import TelaCadastro from '../telas/TelaCadastro';
import TelaPrincipal from '../telas/TelaPrincipal';
import TelaAtletas from '../telas/TelaAtletas';
import TelaMeusAtletas from '../telas/TelaMeusAtletas';
import TelaDetalheAtleta from '../telas/TelaDetalheAtleta';
import TelaMinhaConta from '../telas/TelaMinhaConta';
import TelaAvaliacao from '../telas/TelaAvaliacao';
import TelaConfiguracoes from '../telas/TelaConfiguracoes';
import TelaManual from '../telas/TelaManual';
import TelaTermos from '../telas/TelaTermos';
import { usarAutenticacao } from '../contextos/ContextoAutenticacao';
import { usarTema } from '../contextos/ContextoTema';

const Pilha = createStackNavigator();

const LayoutComBarraLateral = ({ children, navigation, tipoUsuario }) => {
  const podeGerenciarAtletas = tipoUsuario === 'NUTRITIONIST' || tipoUsuario === 'COACH';
  const { temaTemaEscuro } = usarTema();
  const { width } = useWindowDimensions();
  const ehDispositivoMovel = width < 768;

  // Estado para controlar se a barra lateral esta aberta/expandida no celular
  const [expandido, setExpandido] = useState(!ehDispositivoMovel);

  const itensNavegacao = [
    { nome: 'Minha Conta', rota: 'MinhaConta', icone: 'account-circle' },
    ...(podeGerenciarAtletas ? [{ nome: 'Meus Atletas', rota: 'MeusAtletas', icone: 'account-group' }] : []),
    { nome: 'Painel', rota: 'PainelInicio', icone: 'view-dashboard' },
    { nome: 'Avaliacoes', rota: 'Avaliacao', icone: 'clipboard-pulse' },
    { nome: 'Configuracoes', rota: 'ConfiguracoesInicio', icone: 'cog' },
    { nome: 'Manual', rota: 'Manual', icone: 'book-open-page-variant' },
    { nome: 'Termos', rota: 'Termos', icone: 'file-document-outline' },
  ];

  const cores = {
    fundoApp: temaTemaEscuro ? '#121212' : '#f3f4f6',
    barraLateral: temaTemaEscuro ? '#380000' : '#610000',
    bordaLateral: temaTemaEscuro ? '#310000' : '#420000',
  };

  const larguraBarra = ehDispositivoMovel ? (expandido ? 240 : 70) : 260;
  const mostrarTextos = !ehDispositivoMovel || expandido;

  return (
    <View style={[estilos.layoutPrincipal, { backgroundColor: cores.fundoApp }]}>
      {/* Barra lateral dinamica e expansivel */}
      <View 
        style={[
          estilos.barraLateral, 
          { 
            backgroundColor: cores.barraLateral, 
            borderRightColor: cores.bordaLateral,
            width: larguraBarra,
            position: (ehDispositivoMovel && expandido) ? 'absolute' : 'relative',
            zIndex: 999,
            height: '100%',
          }
        ]}
      >
        <ScrollView style={estilos.conteudoBarraLateral} showsVerticalScrollIndicator={false}>
          {/* Cabecalho com botao de expandir/colapsar */}
          <View style={[estilos.cabecalhoBarraLateral, { borderBottomColor: cores.bordaLateral, padding: 12 }]}>
            {ehDispositivoMovel ? (
              <TouchableOpacity 
                style={estilos.botaoAlternar} 
                onPress={() => setExpandido(!expandido)}
              >
                <MaterialCommunityIcons
                  name={expandido ? 'close' : 'menu'}
                  size={28}
                  color="#ffffff"
                />
              </TouchableOpacity>
            ) : (
              <Text style={[estilos.tituloBarraLateral, { color: '#ffffff' }]}>NESC</Text>
            )}

            {mostrarTextos && (
              <>
                {ehDispositivoMovel && <Text style={[estilos.tituloBarraLateral, { color: '#ffffff', marginTop: 8 }]}>NESC</Text>}
                <Text style={estilos.subtituloBarraLateral}>NutriEsportiva</Text>
                <Text style={estilos.subtituloBarraLateral}>Sao Camilo</Text>
              </>
            )}
          </View>

          {/* Itens de navegacao */}
          <View style={estilos.itensNavegacao}>
            {itensNavegacao.map((item) => (
              <TouchableOpacity
                key={item.rota}
                style={[
                  estilos.itemNavegacao, 
                  { 
                    justifyContent: mostrarTextos ? 'flex-start' : 'center', 
                    paddingHorizontal: mostrarTextos ? 20 : 0 
                  }
                ]}
                onPress={() => {
                  navigation.navigate(item.rota);
                  if (ehDispositivoMovel) setExpandido(false);
                }}
              >
                <MaterialCommunityIcons
                  name={item.icone}
                  size={24}
                  color="#ffffff"
                  style={[estilos.iconeItem, { marginRight: mostrarTextos ? 16 : 0 }]}
                />
                {mostrarTextos && <Text style={estilos.textoItem}>{item.nome}</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Area de conteudo principal */}
      <View style={estilos.areaConteudo}>
        {children}
      </View>
    </View>
  );
};

const NavegadorApp = ({ tipoUsuario }) => {
  return (
    <Pilha.Navigator
      screenOptions={{
        headerStyle: { 
          backgroundColor: '#c41e3a',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: { fontWeight: 'bold', fontSize: 18 },
      }}
    >
      <Pilha.Screen name="PainelInicio" options={{ title: 'Painel Principal' }}>
        {(props) => (
          <LayoutComBarraLateral navigation={props.navigation} tipoUsuario={tipoUsuario}>
            <TelaPrincipal {...props} />
          </LayoutComBarraLateral>
        )}
      </Pilha.Screen>

      <Pilha.Screen name="MeusAtletas" options={{ title: 'Meus Atletas' }}>
        {(props) => (
          <LayoutComBarraLateral navigation={props.navigation} tipoUsuario={tipoUsuario}>
            <TelaMeusAtletas {...props} />
          </LayoutComBarraLateral>
        )}
      </Pilha.Screen>

      <Pilha.Screen name="DetalheAtleta" options={{ title: 'Detalhe do Atleta' }}>
        {(props) => (
          <LayoutComBarraLateral navigation={props.navigation} tipoUsuario={tipoUsuario}>
            <TelaDetalheAtleta {...props} />
          </LayoutComBarraLateral>
        )}
      </Pilha.Screen>

      <Pilha.Screen name="Atletas" options={{ title: 'Gerenciar Atletas' }}>
        {(props) => (
          <LayoutComBarraLateral navigation={props.navigation} tipoUsuario={tipoUsuario}>
            <TelaAtletas {...props} />
          </LayoutComBarraLateral>
        )}
      </Pilha.Screen>

      <Pilha.Screen name="Avaliacao" options={{ title: 'Avaliacao Nutricional' }}>
        {(props) => (
          <LayoutComBarraLateral navigation={props.navigation} tipoUsuario={tipoUsuario}>
            <TelaAvaliacao {...props} />
          </LayoutComBarraLateral>
        )}
      </Pilha.Screen>

      <Pilha.Screen name="MinhaConta" options={{ title: 'Minha Conta' }}>
        {(props) => (
          <LayoutComBarraLateral navigation={props.navigation} tipoUsuario={tipoUsuario}>
            <TelaMinhaConta {...props} />
          </LayoutComBarraLateral>
        )}
      </Pilha.Screen>

      <Pilha.Screen name="ConfiguracoesInicio" options={{ title: 'Configuracoes' }}>
        {(props) => (
          <LayoutComBarraLateral navigation={props.navigation} tipoUsuario={tipoUsuario}>
            <TelaConfiguracoes {...props} />
          </LayoutComBarraLateral>
        )}
      </Pilha.Screen>

      <Pilha.Screen name="Manual" options={{ title: 'Manual Operacional' }}>
        {(props) => (
          <LayoutComBarraLateral navigation={props.navigation} tipoUsuario={tipoUsuario}>
            <TelaManual {...props} />
          </LayoutComBarraLateral>
        )}
      </Pilha.Screen>

      <Pilha.Screen name="Termos" options={{ title: 'Termos de Uso' }}>
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
  const { autenticado, usuario, restaurando } = usarAutenticacao();

  if (restaurando) {
    return (
      <View style={estilos.telaCarregando}>
        <ActivityIndicator size="large" color="#c41e3a" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {autenticado ? (
        <NavegadorApp tipoUsuario={usuario?.role} />
      ) : (
        <Pilha.Navigator screenOptions={{ headerShown: false }}>
          <Pilha.Screen name="Entrar" component={TelaLogin} />
          <Pilha.Screen name="Cadastro" component={TelaCadastro} />
        </Pilha.Navigator>
      )}
    </NavigationContainer>
  );
};

export default NavegadorPrincipal;

const estilos = StyleSheet.create({
  layoutPrincipal: {
    flex: 1,
    flexDirection: 'row',
  },
  barraLateral: {
    borderRightWidth: 1,
  },
  conteudoBarraLateral: {
    flex: 1,
  },
  cabecalhoBarraLateral: {
    borderBottomWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  botaoAlternar: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  tituloBarraLateral: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtituloBarraLateral: {
    fontSize: 11,
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 2,
  },
  itensNavegacao: {
    paddingTop: 16,
  },
  itemNavegacao: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 4,
    width: '100%',
  },
  iconeItem: {
    fontSize: 22,
    color: '#ffffff',
    textAlign: 'center',
    minWidth: 70,
  },
  textoItem: {
    fontSize: 15,
    color: '#ffffff',
    fontWeight: '500',
  },
  areaConteudo: {
    flex: 1,
  },
  telaCarregando: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
  },
});
