import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  FlatList,
  Alert,
  Modal,
  TouchableOpacity,
} from 'react-native';
import {
  TextInput,
  Button,
  Card,
  Text,
  useTheme,
  Snackbar,
} from 'react-native-paper';
import { usarDados } from '../contextos/ContextoDados';
import { usarAutenticacao } from '../contextos/ContextoAutenticacao';

const TelaAvaliacao = () => {
  const theme = useTheme();
  const { adicionarAvaliacao, avaliacoes, obterAvaliacoesPorUsuario, avaliacaoVazia } = usarDados();
  const { usuario } = usarAutenticacao();

  const [dadosFormulario, setDadosFormulario] = useState(avaliacaoVazia);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);

  const avaliacoesDousesuario = obterAvaliacoesPorUsuario(usuario?.nome);

  const abrirModal = () => {
    setDadosFormulario(avaliacaoVazia);
    setErro('');
    setMostrarModal(true);
  };

  const fecharModal = () => {
    setMostrarModal(false);
    setErro('');
  };

  const tratarEnvio = () => {
    if (!dadosFormulario.data || !dadosFormulario.peso) {
      setErro('Preencha os campos obrigatórios (Data, Peso)');
      return;
    }

    adicionarAvaliacao(dadosFormulario, usuario?.nome);
    Alert.alert('Sucesso', 'Avaliação registrada com sucesso!');
    setDadosFormulario(avaliacaoVazia);
    setErro('');
    setMostrarModal(false);
    setMensagem('Avaliação registrada com sucesso.');

    setTimeout(() => setMensagem(''), 3000);
  };

  const tratarLimpar = () => {
    setDadosFormulario(avaliacaoVazia);
    setErro('');
  };

  const estilos = StyleSheet.create({
    conteiner: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    conteudoRolagem: {
      padding: 16,
    },
    cabecalho: {
      marginBottom: 20,
    },
    tituloCabecalho: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.onBackground,
      marginBottom: 4,
    },
    subtituloCabecalho: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
    },
    entradaFormulario: {
      marginBottom: 12,
    },
    linhaFormulario: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 12,
    },
    colunaFormulario: {
      flex: 1,
    },
    areaTexto: {
      marginBottom: 12,
      minHeight: 80,
    },
    caixaErro: {
      backgroundColor: theme.colors.errorContainer,
      padding: 12,
      borderRadius: 8,
      marginBottom: 12,
    },
    textoErro: {
      color: theme.colors.error,
      fontSize: 14,
    },
    acoesFormulario: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 24,
    },
    titulosecao: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.onBackground,
      marginBottom: 12,
      marginTop: 20,
    },
    itemAvaliacao: {
      marginBottom: 12,
    },
    cartaoAvaliacao: {
      padding: 12,
    },
    dataAvaliacao: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.onBackground,
      marginBottom: 4,
    },
    detalhesAvaliacao: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
    },
    textoVazio: {
      textAlign: 'center',
      color: theme.colors.onSurfaceVariant,
      padding: 20,
      fontSize: 14,
    },
    modalFundo: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.45)',
      justifyContent: 'center',
      padding: 16,
    },
    modalConteudo: {
      backgroundColor: '#ffffff',
      borderRadius: 16,
      padding: 20,
      maxHeight: '90%',
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 10,
      elevation: 10,
    },
    tituloModal: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 16,
      color: '#1f2937',
      textAlign: 'center',
    },
    labelModal: {
      marginBottom: 8,
      color: theme.colors.onBackground,
      fontWeight: '500',
    },
    botaoCancelar: {
      flex: 1,
      backgroundColor: '#6b7280',
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    botaoSalvar: {
      flex: 1,
      backgroundColor: '#c41e3a',
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    textoBotao: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '600',
    },
  });

  return (
    <ScrollView style={estilos.conteiner}>
      <View style={estilos.conteudoRolagem}>
        {/* Cabeçalho */}
        <View style={estilos.cabecalho}>
          <Text style={estilos.tituloCabecalho}>Começar Avaliação</Text>
          <Text style={estilos.subtituloCabecalho}>
            Preencha os dados para sua avaliação nutricional
          </Text>
        </View>

      <Button mode="contained" onPress={abrirModal} style={{ marginBottom: 20 }}>
        Nova Avaliação
      </Button>

      <Text style={estilos.titulosecao}>Suas Avaliações Anteriores</Text>

      {avaliacoesDousesuario.length === 0 ? (
        <Text style={estilos.textoVazio}>
          Nenhuma avaliação registrada
        </Text>
      ) : (
        <FlatList
          data={avaliacoesDousesuario}
          scrollEnabled={false}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={estilos.itemAvaliacao}>
              <Card>
                <Card.Content style={estilos.cartaoAvaliacao}>
                  <Text style={estilos.dataAvaliacao}>{item.data}</Text>
                  <Text style={estilos.detalhesAvaliacao}>
                    Peso: {item.peso} kg {item.suor && `• Suor: ${item.suor}`}{' '}
                    {item.sal && `• Mancha: ${item.sal}`}
                  </Text>
                </Card.Content>
              </Card>
            </View>
          )}
        />
      )}
      </View>

      <Modal
        visible={mostrarModal}
        onRequestClose={fecharModal}
        transparent={true}
        animationType="slide"
      >
        <View style={estilos.modalFundo}>
          <View style={estilos.modalConteudo}>
            <Text style={estilos.tituloModal}>Nova Avaliação</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              <TextInput
                label="Data da Avaliação *"
                value={dadosFormulario.data}
                onChangeText={(texto) =>
                  setDadosFormulario({ ...dadosFormulario, data: texto })
                }
                mode="outlined"
                style={estilos.entradaFormulario}
                placeholder="YYYY-MM-DD"
              />

              <TextInput
                label="Peso Atual (kg) *"
                value={dadosFormulario.peso}
                onChangeText={(texto) =>
                  setDadosFormulario({ ...dadosFormulario, peso: texto })
                }
                mode="outlined"
                style={estilos.entradaFormulario}
                keyboardType="decimal-pad"
                placeholder="Ex: 70.5"
              />

              <View style={estilos.linhaFormulario}>
                <View style={estilos.colunaFormulario}>
                  <Text style={estilos.labelModal}>Sudoração Percebida</Text>
                  <TextInput
                    value={dadosFormulario.suor}
                    onChangeText={(texto) =>
                      setDadosFormulario({ ...dadosFormulario, suor: texto })
                    }
                    mode="outlined"
                    placeholder="Leve, Moderada, Intensa"
                    style={estilos.entradaFormulario}
                  />
                </View>
                <View style={estilos.colunaFormulario}>
                  <Text style={estilos.labelModal}>Manchas de Sal</Text>
                  <TextInput
                    value={dadosFormulario.sal}
                    onChangeText={(texto) =>
                      setDadosFormulario({ ...dadosFormulario, sal: texto })
                    }
                    mode="outlined"
                    placeholder="Nenhuma, Pouca, Moderada, Muita"
                    style={estilos.entradaFormulario}
                  />
                </View>
              </View>

              <TextInput
                label="Estratégia de Hidratação"
                value={dadosFormulario.hidracao}
                onChangeText={(texto) =>
                  setDadosFormulario({ ...dadosFormulario, hidracao: texto })
                }
                mode="outlined"
                style={[estilos.entradaFormulario, estilos.areaTexto]}
                multiline
                numberOfLines={3}
                placeholder="Descreva sua estratégia de hidratação..."
              />

              <TextInput
                label="Sintomas"
                value={dadosFormulario.sintomas}
                onChangeText={(texto) =>
                  setDadosFormulario({ ...dadosFormulario, sintomas: texto })
                }
                mode="outlined"
                style={[estilos.entradaFormulario, estilos.areaTexto]}
                multiline
                numberOfLines={3}
                placeholder="Descreva seus sintomas..."
              />

              <TextInput
                label="Medicamentos Diuréticos"
                value={dadosFormulario.diureticos}
                onChangeText={(texto) =>
                  setDadosFormulario({ ...dadosFormulario, diureticos: texto })
                }
                mode="outlined"
                style={estilos.entradaFormulario}
                placeholder="Sim/Não"
              />

              {erro && (
                <View style={estilos.caixaErro}>
                  <Text style={estilos.textoErro}>{erro}</Text>
                </View>
              )}

              <View style={estilos.acoesFormulario}>
                <TouchableOpacity
                  style={estilos.botaoCancelar}
                  onPress={fecharModal}
                >
                  <Text style={estilos.textoBotao}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={estilos.botaoSalvar}
                  onPress={tratarEnvio}
                >
                  <Text style={estilos.textoBotao}>Salvar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Snackbar
        visible={!!mensagem}
        onDismiss={() => setMensagem('')}
        duration={3000}
        style={{ backgroundColor: theme.colors.tertiary }}
      >
        {mensagem}
      </Snackbar>
    </ScrollView>
  );
};

export default TelaAvaliacao;
