import React from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Text, // Alterado para o componente nativo para unificar as fontes do sistema
} from 'react-native';
import { usarTema } from '../contextos/ContextoTema';

const TelaManual = () => {
  const { temaTemaEscuro } = usarTema();

  const cores = {
    fundoApp: temaTemaEscuro ? '#121212' : '#f3f4f6',
    fundoCabecalho: temaTemaEscuro ? '#1e1e1e' : '#f9fafb',
    bordaCabecalho: temaTemaEscuro ? '#2d2d2d' : '#e5e7eb',
    textoPrincipal: temaTemaEscuro ? '#ffffff' : '#1f2937',
    textoSecundario: temaTemaEscuro ? '#a3a3a3' : '#6b7280',
    fundoCartao: temaTemaEscuro ? '#1e1e1e' : '#ffffff',
    bordaCartao: temaTemaEscuro ? '#2d2d2d' : '#f3f4f6',
    fundoInfo: temaTemaEscuro ? '#1d3557' : '#e0f2fe',
    textoInfo: temaTemaEscuro ? '#f1faee' : '#0369a1',
    bordaInfo: '#0284c7', 
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
    titulosecao: {
      fontSize: 18,
      fontWeight: 'bold',
      color: cores.textoPrincipal,
      marginBottom: 16,
    },
    listaVerificacao: {
      backgroundColor: cores.fundoCartao,
      borderRadius: 10,
      padding: 16,
      marginBottom: 12,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: temaTemaEscuro ? 0.2 : 0.06,
      shadowRadius: 4,
      elevation: 2,
      borderWidth: 1,
      borderColor: cores.bordaCartao,
    },
    itemListaVerificacao: {
      fontSize: 15,
      color: cores.textoPrincipal,
      marginBottom: 8,
      lineHeight: 22,
    },
    caixaInfo: {
      backgroundColor: cores.fundoInfo,
      borderRadius: 8,
      padding: 16,
      borderLeftWidth: 4,
      borderLeftColor: cores.bordaInfo,
      marginTop: 4,
    },
    textoInfo: {
      fontSize: 14,
      color: cores.textoInfo,
      lineHeight: 22,
      fontWeight: '500',
    },
  });

  return (
    <ScrollView style={estilos.conteiner}>
      {/* Cabeçalho Padronizado */}
      <View style={estilos.cabecalho}>
        <Text style={estilos.tituloCabecalho}>Manual Operacional</Text>
      </View>

      <View style={estilos.conteudo}>
        {/* Seção 1 */}
        <View style={estilos.secao}>
          <Text style={estilos.titulosecao}>📏 Padronização de Pesagem</Text>
          <View style={estilos.listaVerificacao}>
            <Text style={estilos.itemListaVerificacao}>✓ Balança calibrada em superfície plana</Text>
            <Text style={estilos.itemListaVerificacao}>✓ Horário padrão (manhã em jejum)</Text>
            <Text style={estilos.itemListaVerificacao}>✓ Roupa padronizada</Text>
            <Text style={estilos.itemListaVerificacao}>✓ Registro imediato</Text>
          </View>
          <View style={estilos.caixaInfo}>
            <Text style={estilos.textoInfo}>
              Variações superiores a 5% em relação à medição anterior devem ser investigadas.
            </Text>
          </View>
        </View>

        {/* Seção 2 */}
        <View style={estilos.secao}>
          <Text style={estilos.titulosecao}>💧 Hidratação</Text>
          <View style={estilos.listaVerificacao}>
            <Text style={estilos.itemListaVerificacao}>✓ Registrar consumo diário</Text>
            <Text style={estilos.itemListaVerificacao}>✓ Documentar distribuição ao longo do dia</Text>
            <Text style={estilos.itemListaVerificacao}>✓ Acompanhar densidade urinária quando possível</Text>
          </View>
        </View>

        {/* Seção 3 */}
        <View style={estilos.secao}>
          <Text style={estilos.titulosecao}>⚡ Avaliação de Sudoração</Text>
          <View style={estilos.listaVerificacao}>
            <Text style={estilos.itemListaVerificacao}>✓ Observar manchas de sal na roupa</Text>
            <Text style={estilos.itemListaVerificacao}>✓ Avaliar percepção do atleta</Text>
            <Text style={estilos.itemListaVerificacao}>✓ Considerar tipo de treino e clima</Text>
          </View>
        </View>

        {/* Seção 4 */}
        <View style={estilos.secao}>
          <Text style={estilos.titulosecao}>📝 Documentação</Text>
          <View style={estilos.caixaInfo}>
            <Text style={estilos.textoInfo}>
              Todas as avaliações devem ser documentadas com data, hora e assinatura do profissional responsável. Mantenha históricos para acompanhamento longitudinal.
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default TelaManual;