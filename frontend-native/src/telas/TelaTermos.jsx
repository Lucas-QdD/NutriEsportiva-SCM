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

const TelaTermos = () => {
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
    conteudosecao: {
      fontSize: 14,
      lineHeight: 22,
      color: theme.colors.onSurfaceVariant,
    },
  });

  return (
    <ScrollView style={estilos.conteiner}>
      <View style={estilos.conteudoRolagem}>
        <Text style={estilos.titulo}>Termos de Uso</Text>

        <View style={estilos.secao}>
          <Text style={estilos.titulosecao}>1. Aceitação</Text>
          <Text style={estilos.conteudosecao}>
            Ao utilizar o sistema NutriEsportiva, você concorda em manter os dados atualizados e utilizar a plataforma para fins profissionais e educacionais. O uso deste sistema implica na aceitação de todos os termos aqui descritos.
          </Text>
        </View>

        <View style={estilos.secao}>
          <Text style={estilos.titulosecao}>2. Privacidade</Text>
          <Text style={estilos.conteudosecao}>
            Dados de atletas e avaliações devem ser tratados com confidencialidade. Todos os usuários se comprometem a:
          </Text>
          <Text style={[estilos.conteudosecao, { marginTop: 8 }]}>
            • Manter a confidencialidade das informações de atletas{'\n'}
            • Não compartilhar dados com terceiros sem autorização{'\n'}
            • Usar dados apenas para fins nutricionais e de treinamento{'\n'}
            • Cumprir com regulamentações de proteção de dados
          </Text>
        </View>

        <View style={estilos.secao}>
          <Text style={estilos.titulosecao}>3. Responsabilidade</Text>
          <Text style={estilos.conteudosecao}>
            O sistema fornece apoio ao trabalho nutricional, mas não substitui o acompanhamento profissional. Recomendações nutricionais devem sempre ser validadas por profissionais qualificados.
          </Text>
        </View>

        <View style={estilos.secao}>
          <Text style={estilos.titulosecao}>4. Dados e Registros</Text>
          <Text style={estilos.conteudosecao}>
            Todos os dados inseridos no sistema devem ser precisos e verificáveis. O sistema mantém históricos para fins de auditoria e acompanhamento clínico.
          </Text>
        </View>

        <View style={estilos.secao}>
          <Text style={estilos.titulosecao}>5. Modificações</Text>
          <Text style={estilos.conteudosecao}>
            O desenvolvedor se reserva o direito de modificar estes termos a qualquer momento. Notificações de mudanças significativas serão fornecidas aos usuários.
          </Text>
        </View>

        <View style={estilos.secao}>
          <Text style={estilos.titulosecao}>6. Conformidade</Text>
          <Text style={estilos.conteudosecao}>
            Os usuários concordam em cumprir com todas as leis e regulamentações aplicáveis ao uso deste sistema, incluindo regulamentações de proteção de dados pessoais.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default TelaTermos;
