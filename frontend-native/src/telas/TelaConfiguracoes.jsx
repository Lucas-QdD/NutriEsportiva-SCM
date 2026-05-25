import React from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  Switch,
} from 'react-native';
import { usarAutenticacao } from '../contextos/ContextoAutenticacao';
import { usarTema } from '../contextos/ContextoTema';

const ROTULOSPAPEL = {
  NUTRICIONISTA: 'Nutricionista',
  NUTRITIONIST: 'Nutricionista',
  ATLETA: 'Atleta',
  ATHLETE: 'Atleta',
  COACH: 'Técnico',
  TECNICO: 'Técnico',
};

const TelaConfiguracoes = ({ navigation }) => {
  const { temaTemaEscuro, alternarTema } = usarTema();
  const { usuario, sair } = usarAutenticacao();

  const papelUsuario = usuario?.role || usuario?.papel || 'ATLETA';
  const nomeUsuario = usuario?.name || nomeUsuario || 'Usuário';

  const tratarSaida = () => {
    sair();
  };

  const obterIniciais = (nome) => {
    if (!nome) return 'U';
    return nome
      .split(' ')
      .map((parte) => parte[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const cores = {
    fundoApp: temaTemaEscuro ? '#121212' : '#f3f4f6',
    fundoCabecalho: temaTemaEscuro ? '#1e1e1e' : '#f9fafb',
    bordaCabecalho: temaTemaEscuro ? '#2d2d2d' : '#e5e7eb',
    textoPrincipal: temaTemaEscuro ? '#ffffff' : '#1f2937',
    textoSecundario: temaTemaEscuro ? '#a3a3a3' : '#6b7280',
    fundoCartao: temaTemaEscuro ? '#1e1e1e' : '#ffffff',
    bordaCartao: temaTemaEscuro ? '#2d2d2d' : '#f3f4f6',
    vermelhoPadrao: '#c41e3a',
  };

  const estilos = StyleSheet.create({
    conteiner: {
      flex: 1,
      backgroundColor: cores.fundoApp,
    },
    cabecalho: {
      backgroundColor: cores.fundoCabecalho, 
      paddingVertical: 20,
      paddingHorizontal: 30,
      borderBottomWidth: 1,
      borderBottomColor: cores.bordaCabecalho,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: temaTemaEscuro ? 0.2 : 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    tituloCabecalho: {
      fontSize: 24,
      color: cores.textoPrincipal, 
      fontWeight: 'bold',
    },
    conteudo: {
      flex: 1,
      padding: 30,
    },
    secao: {
      marginBottom: 30,
    },
    cabecalhoSecao: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    tituloSecao: {
      fontSize: 18,
      fontWeight: 'bold',
      color: cores.textoPrincipal,
    },
    cartaoPerfil: {
      backgroundColor: cores.fundoCartao,
      borderRadius: 12,
      padding: 20,
      marginBottom: 24,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: temaTemaEscuro ? 0.3 : 0.08,
      shadowRadius: 8,
      elevation: 3,
      borderWidth: 1,
      borderColor: cores.bordaCabecalho,
    },
    avatar: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: cores.vermelhoPadrao, 
      justifyContent: 'center',
      alignItems: 'center',
    },
    textoAvatar: {
      fontSize: 22,
      fontWeight: 'bold',
      color: '#ffffff',
    },
    infoPerfil: {
      flex: 1,
    },
    nomePerfil: {
      fontSize: 18,
      fontWeight: 'bold',
      color: cores.textoPrincipal,
      marginBottom: 4,
    },
    papelPerfil: {
      fontSize: 14,
      color: cores.textoSecundario,
      fontWeight: '500',
    },
    cartaoConfiguracao: {
      backgroundColor: cores.fundoCartao,
      borderRadius: 10,
      padding: 16,
      marginBottom: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: temaTemaEscuro ? 0.2 : 0.06,
      shadowRadius: 4,
      elevation: 2,
      borderWidth: 1,
      borderColor: cores.bordaCartao,
    },
    rotuloConfiguracao: {
      fontSize: 16,
      color: cores.textoPrincipal,
      fontWeight: '500',
    },
    valorConfiguracao: {
      fontSize: 15,
      color: cores.textoSecundario,
      fontWeight: '500',
    },
    textoBotaoNavegacao: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '600',
    },
    botaoSecundario: {
      backgroundColor: 'transparent',
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 10,
      alignItems: 'center',
      marginBottom: 12,
      borderWidth: 2,
      borderColor: cores.vermelhoPadrao,
    },
    textoBotaoSecundario: {
      color: cores.vermelhoPadrao,
      fontSize: 16,
      fontWeight: '600',
    },
    botaoSair: {
      backgroundColor: '#dc2626', 
      paddingVertical: 14,
      borderRadius: 10,
      alignItems: 'center',
      marginTop: 10,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
  });

  return (
    <ScrollView style={estilos.conteiner}>
      {/* Cabeçalho */}
      <View style={estilos.cabecalho}>
        <Text style={estilos.tituloCabecalho}>Configurações</Text>
      </View>

      <View style={estilos.conteudo}>
        {/* Cartão de Perfil */}
        <View style={estilos.cartaoPerfil}>
          <View style={estilos.avatar}>
            <Text style={estilos.textoAvatar}>
              {obterIniciais(nomeUsuario)}
            </Text>
          </View>
          <View style={estilos.infoPerfil}>
            <Text style={estilos.nomePerfil}>
              {nomeUsuario || 'Usuário'}
            </Text>
            <Text style={estilos.papelPerfil}>
              {ROTULOSPAPEL[papelUsuario] || 'Atleta'}
            </Text>
          </View>
        </View>

        {/* Seção Aparência */}
        <View style={estilos.secao}>
          <View style={estilos.cabecalhoSecao}>
            <Text style={estilos.tituloSecao}>Aparência</Text>
          </View>
          <View style={estilos.cartaoConfiguracao}>
            <Text style={estilos.rotuloConfiguracao}>Tema Escuro</Text>
            <Switch
              value={temaTemaEscuro}
              onValueChange={alternarTema}
              trackColor={{ false: '#d1d5db', true: '#fca5a5' }}
              thumbColor={temaTemaEscuro ? '#c41e3a' : '#f4f4f5'}
            />
          </View>
        </View>

        {/* Seção Informações */}
        <View style={estilos.secao}>
          <View style={estilos.cabecalhoSecao}>
            <Text style={estilos.tituloSecao}>Informações</Text>
          </View>
          <View style={estilos.cartaoConfiguracao}>
            <Text style={estilos.rotuloConfiguracao}>Versão do Aplicativo</Text>
            <Text style={estilos.valorConfiguracao}>1.0.0</Text>
          </View>
        </View>

        {/* Seção Navegação / Documentos */}
        <View style={estilos.secao}>
          <View style={estilos.cabecalhoSecao}>
            <Text style={estilos.tituloSecao}>Documentos Legais</Text>
          </View>
          
          <TouchableOpacity
            style={estilos.botaoSecundario}
            onPress={() => navigation.navigate('Manual')}
          >
            <Text style={estilos.textoBotaoSecundario}>Manual Operacional</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={estilos.botaoSecundario}
            onPress={() => navigation.navigate('Termos')}
          >
            <Text style={estilos.textoBotaoSecundario}>Termos de Uso</Text>
          </TouchableOpacity>
        </View>

        {/* Ação de Desconexão */}
        <TouchableOpacity style={estilos.botaoSair} onPress={tratarSaida}>
          <Text style={estilos.textoBotaoNavegacao}>Sair da Conta</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default TelaConfiguracoes;