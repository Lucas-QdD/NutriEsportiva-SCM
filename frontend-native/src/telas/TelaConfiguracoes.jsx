import React from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
} from 'react-native';
import {
  Card,
  Text,
  Button,
  Switch,
  useTheme,
} from 'react-native-paper';
import { usarAutenticacao } from '../contextos/ContextoAutenticacao';
import { usarTema } from '../contextos/ContextoTema';

const ROTULOSPAPEL = {
  NUTRICIONISTA: 'Nutricionista',
  ATLETA: 'Atleta',
};

const TelaConfiguracoes = ({ navigation }) => {
  const theme = useTheme();
  const { temaTemaEscuro, alternarTema } = usarTema();
  const { usuario, tipoUsuario, sair } = usarAutenticacao();

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

  const estilos = StyleSheet.create({
    conteiner: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    conteudoRolagem: {
      padding: 16,
    },
    cartaoPerfil: {
      marginBottom: 20,
      backgroundColor: theme.colors.surfaceVariant,
    },
    conteudoPerfil: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    avatar: {
      width: 70,
      height: 70,
      borderRadius: 35,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    textoAvatar: {
      fontSize: 28,
      fontWeight: 'bold',
      color: 'white',
    },
    infoPerfil: {
      flex: 1,
    },
    nomePerfil: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.onBackground,
      marginBottom: 4,
    },
    papelPerfil: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
    },
    secao: {
      marginBottom: 24,
    },
    titulosecao: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.onBackground,
      marginBottom: 12,
    },
    itemConfiguracao: {
      marginBottom: 8,
    },
    rotulConfiguracao: {
      fontSize: 14,
      color: theme.colors.onBackground,
      fontWeight: '500',
    },
    conteinerBotoes: {
      gap: 12,
      marginTop: 20,
    },
  });

  return (
    <ScrollView style={estilos.conteiner}>
      <View style={estilos.conteudoRolagem}>

        <Card style={estilos.cartaoPerfil} elevation={4}>
          <Card.Content style={estilos.conteudoPerfil}>
            <View style={estilos.avatar}>
              <Text style={estilos.textoAvatar}>
                {obterIniciais(usuario?.nome)}
              </Text>
            </View>
            <View style={estilos.infoPerfil}>
              <Text style={estilos.nomePerfil}>
                {usuario?.nome || 'Usuário'}
              </Text>
              <Text style={estilos.papelPerfil}>
                {ROTULOSPAPEL[tipoUsuario]}
              </Text>
            </View>
          </Card.Content>
        </Card>

        <View style={estilos.secao}>
          <Text style={estilos.titulosecao}>Aparência</Text>
          <Card style={estilos.itemConfiguracao} elevation={2}>
            <Card.Content style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={estilos.rotulConfiguracao}>Tema Escuro</Text>
              <Switch
                value={temaTemaEscuro}
                onValueChange={alternarTema}
              />
            </Card.Content>
          </Card>
        </View>

        <View style={estilos.secao}>
          <Text style={estilos.titulosecao}>Informações</Text>
          <Card style={[estilos.itemConfiguracao, { backgroundColor: theme.colors.surfaceVariant }]} elevation={2}>
            <Card.Content style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={estilos.rotulConfiguracao}>Versão</Text>
              <Text style={{ color: theme.colors.onSurfaceVariant }}>
                1.0.0
              </Text>
            </Card.Content>
          </Card>
        </View>

        <View style={estilos.secao}>
          <Text style={estilos.titulosecao}>Navegação</Text>
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('Manual')}
            style={{ marginBottom: 8 }}
          >
            Manual Operacional
          </Button>
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('Termos')}
          >
            Termos de Uso
          </Button>
        </View>

        <View style={estilos.conteinerBotoes}>
          <Button
            mode="contained"
            buttonColor={theme.colors.error}
            textColor="white"
            onPress={tratarSaida}
          >
            Sair
          </Button>
        </View>
      </View>
    </ScrollView>
  );
};

export default TelaConfiguracoes;
