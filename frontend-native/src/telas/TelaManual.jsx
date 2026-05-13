import React from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
} from 'react-native';
import {
  Text,
  useTheme,
} from 'react-native-paper';

const TelaManual = () => {
  const theme = useTheme();

  const estilos = StyleSheet.create({
    conteiner: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    conteudoRolagem: {
      padding: 16,
    },
    titulo: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.onBackground,
      marginBottom: 20,
    },
    secao: {
      marginBottom: 20,
    },
    titulosecao: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.onBackground,
      marginBottom: 10,
    },
    listaVerificacao: {
      backgroundColor: theme.colors.surface,
      borderRadius: 8,
      padding: 12,
      marginBottom: 12,
    },
    itemListaVerificacao: {
      fontSize: 14,
      color: theme.colors.onBackground,
      marginBottom: 8,
      paddingLeft: 12,
    },
    caixaInfo: {
      backgroundColor: theme.colors.primaryContainer,
      borderRadius: 8,
      padding: 12,
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.primary,
    },
    textoInfo: {
      fontSize: 14,
      color: theme.colors.onPrimaryContainer,
      lineHeight: 20,
    },
  });

  return (
    <ScrollView style={estilos.conteiner}>
      <View style={estilos.conteudoRolagem}>
        <Text style={estilos.titulo}>Manual Operacional</Text>

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

        <View style={estilos.secao}>
          <Text style={estilos.titulosecao}>💧 Hidratação</Text>
          <View style={estilos.listaVerificacao}>
            <Text style={estilos.itemListaVerificacao}>✓ Registrar consumo diário</Text>
            <Text style={estilos.itemListaVerificacao}>✓ Documentar distribuição ao longo do dia</Text>
            <Text style={estilos.itemListaVerificacao}>✓ Acompanhar densidade urinária quando possível</Text>
          </View>
        </View>

        <View style={estilos.secao}>
          <Text style={estilos.titulosecao}>⚡ Avaliação de Sudoração</Text>
          <View style={estilos.listaVerificacao}>
            <Text style={estilos.itemListaVerificacao}>✓ Observar manchas de sal na roupa</Text>
            <Text style={estilos.itemListaVerificacao}>✓ Avaliar percepção do atleta</Text>
            <Text style={estilos.itemListaVerificacao}>✓ Considerar tipo de treino e clima</Text>
          </View>
        </View>

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
