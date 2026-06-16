import React from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
} from 'react-native';
import { usarTema } from '../contextos/ContextoTema';
import Vlibras from '../components/Vlibras';

const TelaTermos = () => {
  const { temaTemaEscuro } = usarTema();

  const cores = {
    fundoApp: temaTemaEscuro ? '#121212' : '#f3f4f6',
    fundoCabecalho: temaTemaEscuro ? '#1e1e1e' : '#f9fafb',
    bordaCabecalho: temaTemaEscuro ? '#2d2d2d' : '#e5e7eb',
    textoPrincipal: temaTemaEscuro ? '#ffffff' : '#1f2937',
    textoSecundario: temaTemaEscuro ? '#a3a3a3' : '#6b7280',
    fundoCartao: temaTemaEscuro ? '#1e1e1e' : '#ffffff',
    bordaCartao: temaTemaEscuro ? '#2d2d2d' : '#f3f4f6',
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
      marginBottom: 24,
      backgroundColor: cores.fundoCartao,
      borderRadius: 10,
      padding: 20,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: temaTemaEscuro ? 0.2 : 0.06,
      shadowRadius: 4,
      elevation: 2,
      borderWidth: 1,
      borderColor: cores.bordaCartao,
    },
    titulosecao: {
      fontSize: 18,
      fontWeight: 'bold',
      color: cores.textoPrincipal,
      marginBottom: 10,
    },
    conteudosecao: {
      fontSize: 14,
      lineHeight: 22,
      color: cores.textoSecundario,
    },
  });

  return (
    <ScrollView style={estilos.conteiner}>
      {/* cabeçalho padronizado */}
      <View style={estilos.cabecalho}>
        <Text style={estilos.tituloCabecalho}>Termos de Uso</Text>
      </View>

      <View style={estilos.conteudo}>
        
        {/* componente do vlibras inserido no topo da tela */}
        <Vlibras 
          tituloBotao="Traduzir Termos em LIBRAS" 
          texto="Estes são os termos de uso e privacidade do sistema NutriEsportiva. Os seus dados de saúde e performance são tratados com total confidencialidade e privacidade." 
        />

        {/* seção 1 */}
        <View style={estilos.secao}>
          <Text style={estilos.titulosecao}>1. Aceitação</Text>
          <Text style={estilos.conteudosecao}>
            Ao utilizar o sistema NutriEsportiva, você concorda em manter os dados atualizados e utilizar a plataforma para fins profissionais e educacionais. O uso deste sistema implica na aceitação de todos os termos aqui descritos.
          </Text>
        </View>

        {/* seção 2 */}
        <View style={estilos.secao}>
          <Text style={estilos.titulosecao}>2. Privacidade</Text>
          <Text style={estilos.conteudosecao}>
            Dados de atletas e avaliações devem ser tratados com confidencialidade. Todos os usuários se comprometem a:
          </Text>
          <Text style={[estilos.conteudosecao, { marginTop: 12, lineHeight: 24 }]}>
            • Manter a confidencialidade das informações de atletas{'\n'}
            • Não compartilhar dados com terceiros sem autorização{'\n'}
            • Usar dados apenas para fins nutricionais e de treinamento{'\n'}
            • Cumprir com regulamentações de proteção de dados
          </Text>
        </View>

        {/* seção 3 */}
        <View style={estilos.secao}>
          <Text style={estilos.titulosecao}>3. Responsabilidade</Text>
          <Text style={estilos.conteudosecao}>
            O sistema fornece apoio ao trabalho nutricional, mas não substitui o acompanhamento profissional. Recomendações nutricionais devem sempre ser validadas por profissionais qualificados.
          </Text>
        </View>

        {/* seção 4 */}
        <View style={estilos.secao}>
          <Text style={estilos.titulosecao}>4. Dados e Registros</Text>
          <Text style={estilos.conteudosecao}>
            Todos os dados inseridos no sistema devem ser precisos e verificáveis. O sistema mantém históricos para fins de auditoria e acompanhamento clínico.
          </Text>
        </View>

        {/* seção 5 */}
        <View style={estilos.secao}>
          <Text style={estilos.titulosecao}>5. Modificações</Text>
          <Text style={estilos.conteudosecao}>
            O desenvolvedor se reserva o direito de modificar estes termos a qualquer momento. Notificações de mudanças significativas serão fornecidas aos usuários.
          </Text>
        </View>

        {/* seção 6 */}
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