import React from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Text,
} from 'react-native';
import { usarDados } from '../contextos/ContextoDados';
import { usarAutenticacao } from '../contextos/ContextoAutenticacao';
import { usarTema } from '../contextos/ContextoTema';

const TelaPrincipal = ({ navigation }) => {
  const { atletas, avaliacoes } = usarDados();
  const { usuario } = usarAutenticacao();
  const { temaTemaEscuro } = usarTema();

  const ehNutricionista = usuario?.papel === 'NUTRICIONISTA';
  const ehAtleta = usuario?.papel === 'ATLETA';

  const avaliacoesFiltradas = ehNutricionista
    ? avaliacoes
    : avaliacoes.filter(avaliacao => avaliacao.atletaId === usuario?.id || avaliacao.usuarioId === usuario?.id);

  const avaliacoesRecentes = avaliacoesFiltradas.slice(0, 5);

  const cores = {
    fundoApp: temaTemaEscuro ? '#121212' : '#f3f4f6',
    fundoCabecalho: temaTemaEscuro ? '#1e1e1e' : '#f9fafb',
    bordaCabecalho: temaTemaEscuro ? '#2d2d2d' : '#e5e7eb',
    textoPrincipal: temaTemaEscuro ? '#ffffff' : '#1f2937',
    textoSecundario: temaTemaEscuro ? '#a3a3a3' : '#6b7280',
    textoTres: temaTemaEscuro ? '#d4d4d4' : '#374151',
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
    grelhaEstatisticas: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 30,
      gap: 16,
    },
    cartaoEstatistica: {
      flex: 1,
      backgroundColor: cores.vermelhoPadrao,
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
      color: cores.textoPrincipal,
    },
    cartaoAvaliacao: {
      backgroundColor: cores.fundoCartao,
      borderRadius: 10,
      padding: 16,
      marginBottom: 12,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: temaTemaEscuro ? 0.2 : 0.08,
      shadowRadius: 4,
      elevation: 2,
      borderWidth: 1,
      borderColor: cores.bordaCartao,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    infoAvaliacao: {
      flex: 1,
    },
    nomeAvaliacao: {
      fontSize: 16,
      fontWeight: '600',
      color: cores.textoPrincipal,
      marginBottom: 4,
    },
    dataAvaliacao: {
      fontSize: 14,
      color: cores.textoSecundario,
    },
    pesoAvaliacao: {
      fontSize: 14,
      color: cores.textoTres, 
      fontWeight: '500',
    },
    textoVazio: {
      textAlign: 'center',
      color: cores.textoSecundario, 
      padding: 40,
      fontSize: 16,
    },
    botaoNavegacao: {
      backgroundColor: cores.vermelhoPadrao,
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

  return (
    <ScrollView style={estilos.conteiner}>
      {/* Cabeçalho */}
      <View style={estilos.cabecalho}>
        <Text style={estilos.tituloCabecalho}>
          {ehNutricionista ? 'Painel do Nutricionista' : 'Meu Painel de Atleta'}
        </Text>
      </View>

      <View style={estilos.conteudo}>
        {/* Bloco de Estatísticas - Visível apenas para o Nutricionista */}
        {ehNutricionista && (
          <View style={estilos.grelhaEstatisticas}>
            <View style={estilos.cartaoEstatistica}>
              <Text style={estilos.valorEstatistica}>{atletas.length}</Text>
              <Text style={estilos.rotuloEstatistica}>Atletas</Text>
            </View>
            <View style={estilos.cartaoEstatistica}>
              <Text style={estilos.valorEstatistica}>{avaliacoes.length}</Text>
              <Text style={estilos.rotuloEstatistica}>Avaliações Totais</Text>
            </View>
          </View>
        )}

        {/* Navegação Rápida / Ações */}
        <View style={estilos.secao}>
          <View style={estilos.cabecalhoSecao}>
            <Text style={estilos.tituloSecao}>Ações Rápidas</Text>
          </View>
          
          {/* Botão Gerenciar Atletas - Visível apenas para o Nutricionista */}
          {ehNutricionista && (
            <TouchableOpacity
              style={estilos.botaoNavegacao}
              onPress={() => navigation.navigate('Atletas')}
            >
              <Text style={estilos.textoBotaoNavegacao}>Gerenciar Atletas</Text>
            </TouchableOpacity>
          )}

          {/* SOLUÇÃO: Passa 'abrirFormulario: true' para abrir direto o preenchimento na outra tela */}
          <TouchableOpacity
            style={estilos.botaoNavegacao}
            onPress={() => navigation.navigate('Avaliacao', { abrirFormulario: true })}
          >
            <Text style={estilos.textoBotaoNavegacao}>Nova Avaliação</Text>
          </TouchableOpacity>
        </View>

        {/* Seção de Histórico de Avaliações */}
        <View style={estilos.secao}>
          <View style={estilos.cabecalhoSecao}>
            <Text style={estilos.tituloSecao}>
              {ehNutricionista ? 'Avaliações Recentes' : 'Minhas Avaliações'}
            </Text>
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
                
                {/* Botão de visualizar a avaliação antiga (Disponível para ambos) */}
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