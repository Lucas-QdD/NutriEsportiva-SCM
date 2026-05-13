import React from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Text } from 'react-native';
import { usarDados } from '../contextos/ContextoDados';
import { usarAutenticacao } from '../contextos/ContextoAutenticacao';

const TelaPrincipal = ({ navigation }) => {
  const { atletas, avaliacoes } = usarDados();
  const { usuario } = usarAutenticacao();

  const estilos = StyleSheet.create({
    conteiner: {
      flex: 1,
      backgroundColor: '#f3f4f6',
    },
    cabecalho: {
      backgroundColor: '#f9fafb', 
      paddingVertical: 20,
      paddingHorizontal: 30,
      borderBottomWidth: 1,
      borderBottomColor: '#e5e7eb',
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    tituloCabecalho: {
      fontSize: 24,
      color: '#1f2937', 
      fontWeight: 'bold',
    },
    conteudo: {
      flex: 1,
      padding: 30,
    },
    grelhaEstatisticas: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 30,
      gap: 16,
    },
    cartaoEstatistica: {
      flex: 1,
      backgroundColor: '#c41e3a',
      borderRadius: 12,
      padding: 20,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    valorEstatistica: {
      fontSize: 32,
      fontWeight: 'bold',
      color: '#ffffff',
      marginBottom: 8,
    },
    rotuloEstatistica: {
      fontSize: 12,
      color: '#ffffff',
      textAlign: 'center',
      fontWeight: '600',
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
      color: '#1f2937',
    },
    cartaoAvaliacao: {
      backgroundColor: '#ffffff',
      borderRadius: 10,
      padding: 16,
      marginBottom: 12,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
      borderWidth: 1,
      borderColor: '#f3f4f6',
    },
    infoAvaliacao: {
      flex: 1,
    },
    nomeAvaliacao: {
      fontSize: 16,
      fontWeight: '600',
      color: '#1f2937',
      marginBottom: 4,
    },
    dataAvaliacao: {
      fontSize: 14,
      color: '#6b7280',
    },
    pesoAvaliacao: {
      fontSize: 14,
      color: '#374151', 
      fontWeight: '500',
    },
    textoVazio: {
      textAlign: 'center',
      color: '#9ca3af', 
      padding: 40,
      fontSize: 16,
    },
    botaoNavegacao: {
      backgroundColor: '#c41e3a',
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 10,
      alignItems: 'center',
      marginBottom: 16,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    textoBotaoNavegacao: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '600',
    },
  });

  const avaliacoesRecentes = avaliacoes.slice(0, 5);

  return (
    <ScrollView style={estilos.conteiner}>
      {/* Cabeçalho */}
      <View style={estilos.cabecalho}>
        <Text style={estilos.tituloCabecalho}>Bem-vindo ao Dashboard</Text>
      </View>

      <View style={estilos.conteudo}>
        {/* Estatísticas */}
        <View style={estilos.grelhaEstatisticas}>
          <View style={estilos.cartaoEstatistica}>
            <Text style={estilos.valorEstatistica}>{atletas.length}</Text>
            <Text style={estilos.rotuloEstatistica}>Atletas</Text>
          </View>
          <View style={estilos.cartaoEstatistica}>
            <Text style={estilos.valorEstatistica}>{avaliacoes.length}</Text>
            <Text style={estilos.rotuloEstatistica}>Avaliações</Text>
          </View>
        </View>

        {/* Navegação Rápida */}
        <View style={estilos.secao}>
          <View style={estilos.cabecalhoSecao}>
            <Text style={estilos.tituloSecao}>Navegação Rápida</Text>
          </View>
          <TouchableOpacity
            style={estilos.botaoNavegacao}
            onPress={() => navigation.navigate('Atletas')}
          >
            <Text style={estilos.textoBotaoNavegacao}>Gerenciar Atletas</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={estilos.botaoNavegacao}
            onPress={() => navigation.navigate('Avaliacao')}
          >
            <Text style={estilos.textoBotaoNavegacao}>Nova Avaliação</Text>
          </TouchableOpacity>
        </View>

        {/* Avaliações Recentes */}
        <View style={estilos.secao}>
          <View style={estilos.cabecalhoSecao}>
            <Text style={estilos.tituloSecao}>Avaliações Recentes</Text>
            <TouchableOpacity
              style={[estilos.botaoNavegacao, { paddingVertical: 8, paddingHorizontal: 16 }]}
              onPress={() => navigation.navigate('Avaliacao')}
            >
              <Text style={estilos.textoBotaoNavegacao}>Nova</Text>
            </TouchableOpacity>
          </View>

          {avaliacoesRecentes.length === 0 ? (
            <Text style={estilos.textoVazio}>
              Nenhuma avaliação registrada
            </Text>
          ) : (
            avaliacoesRecentes.map((item) => (
              <View key={item.id} style={estilos.cartaoAvaliacao}>
                <View style={estilos.infoAvaliacao}>
                  <Text style={estilos.nomeAvaliacao}>
                    {item.nome}
                  </Text>
                  <Text style={estilos.dataAvaliacao}>
                    {item.data}
                  </Text>
                  <Text style={estilos.pesoAvaliacao}>
                    Peso: {item.peso}kg
                  </Text>
                </View>
                <TouchableOpacity
                  style={[estilos.botaoNavegacao, { paddingVertical: 8, paddingHorizontal: 16, marginBottom: 0 }]}
                  onPress={() => navigation.navigate('Avaliacao', { id: item.id })}
                >
                  <Text style={estilos.textoBotaoNavegacao}>Ver</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default TelaPrincipal;
