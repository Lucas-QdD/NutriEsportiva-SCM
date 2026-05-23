import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Text, 
  TextInput,
  Modal,
  Alert,
  KeyboardAvoidingView, 
  Platform,             
} from 'react-native';
import { usarDados } from '../contextos/ContextoDados';
import { usarTema } from '../contextos/ContextoTema';
import { usarAutenticacao } from '../contextos/ContextoAutenticacao';

const OPCOES_SEXO = ['M', 'F'];
const OPCOES_SUOR = ['Leve', 'Moderada', 'Intensa'];
const OPCOES_SAL = ['Nenhuma', 'Pouca', 'Moderada', 'Muita'];
const OPCOES_DIURETICOS = ['Sim', 'Não'];

const TelaAtletas = ({ navigation }) => {
  const {
    atletas,
    adicionarAtleta,
    editarAtleta,
    deletarAtleta,
    atletaVazio,
    pesquisarAtletas,
  } = usarDados();

  const { temaTemaEscuro } = usarTema();
  const { usuario } = usarAutenticacao();

  const [consultaPesquisa, setConsultaPesquisa] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [dadosFormulario, setDadosFormulario] = useState(atletaVazio);
  const [erro, setErro] = useState('');

  const atletasFiltrados = (pesquisarAtletas(consultaPesquisa) || []).filter(
    (atleta) => atleta.nutricionistaResponsavel === usuario?.nome
  );

  const abrirModal = (atleta = null) => {
    if (atleta) {
      setDadosFormulario(atleta);
      setEditandoId(atleta.id);
    } else {
      setDadosFormulario(atletaVazio);
      setEditandoId(null);
    }
    setMostrarModal(true);
    setErro('');
  };

  const fecharModal = () => {
    setMostrarModal(false);
    setEditandoId(null);
    setDadosFormulario(atletaVazio);
    setErro('');
  };

  const tratarSalvar = () => {
    if (!dadosFormulario.nome || !dadosFormulario.dataNascimento || !dadosFormulario.altura || !dadosFormulario.peso) {
      setErro('Preencha os campos obrigatórios (Nome, Data de Nascimento, Altura, Peso)');
      return;
    }

    const atletaComVinculo = {
      ...dadosFormulario,
      nutricionistaResponsavel: usuario?.nome
    };

    if (editandoId) {
      editarAtleta(editandoId, atletaComVinculo);
      Alert.alert('Sucesso', 'Atleta atualizado com sucesso!');
    } else {
      adicionarAtleta(atletaComVinculo);
      Alert.alert('Sucesso', 'Atleta adicionado com sucesso!');
    }

    fecharModal();
  };

  const tratarDeletar = (id) => {
    if (Platform.OS === 'web') {
      const confirmacao = window.confirm('Tem certeza que deseja deletar este atleta?');
      if (confirmacao) {
        deletarAtleta(id);
        alert('Atleta deletado com sucesso!');
      }
    } else {
      Alert.alert(
        'Confirmar Exclusão',
        'Tem certeza que deseja deletar este atleta?',
        [
          { text: 'Cancelar', onPress: () => {}, style: 'cancel' },
          {
            text: 'Deletar',
            onPress: () => {
              deletarAtleta(id);
              Alert.alert('Sucesso', 'Atleta deletado com sucesso!');
            },
            style: 'destructive',
          },
        ]
      );
    }
  };

  const obterIniciais = (nome) => {
    if (!nome) return 'AT';
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
    fundoInput: temaTemaEscuro ? '#2a2a2a' : '#ffffff',
    textoInput: temaTemaEscuro ? '#ffffff' : '#000000',
    bordaInput: temaTemaEscuro ? '#404040' : '#d1d5db',
    fundoModal: temaTemaEscuro ? '#1e1e1e' : '#ffffff',
    vermelhoPadrao: '#c41e3a',
    botaoCinza: temaTemaEscuro ? '#374151' : '#4b5563',
    bordaOpcao: temaTemaEscuro ? '#404040' : '#d1d5db',
    verdeSucesso: '#10b981',
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
    },
    scrollConteudo: {
      paddingHorizontal: 30,
      paddingTop: 10,
      paddingBottom: 80,
    },
    entradaPesquisa: {
      backgroundColor: cores.fundoInput,
      borderWidth: 1,
      borderColor: cores.bordaInput, 
      borderRadius: 10,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      color: cores.textoInput,
      marginBottom: 20,
    },
    cartaoAtleta: {
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
    },
    conteudoCartaoAtleta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      marginBottom: 12,
    },
    avatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: cores.vermelhoPadrao,
      justifyContent: 'center',
      alignItems: 'center',
    },
    textoAvatar: {
      color: '#ffffff',
      fontWeight: 'bold',
      fontSize: 14,
    },
    infoAtleta: {
      flex: 1,
    },
    nomeAtleta: {
      fontSize: 16,
      fontWeight: '600',
      color: cores.textoPrincipal,
      marginBottom: 4,
    },
    detalhesAtleta: {
      fontSize: 14,
      color: cores.textoSecundario,
      marginBottom: 2,
    },
    acoesAtleta: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 8,
      borderTopWidth: 1,
      borderTopColor: cores.bordaCartao,
      paddingTop: 12,
    },
    botaoAcao: {
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    botaoAcaoAvaliar: {
      backgroundColor: cores.verdeSucesso,
    },
    botaoAcaoEditar: {
      backgroundColor: cores.botaoCinza,
    },
    botaoAcaoDeletar: {
      backgroundColor: cores.vermelhoPadrao,
    },
    textoBotaoAcao: {
      color: '#ffffff',
      fontSize: 13,
      fontWeight: '600',
    },
    textoVazio: {
      textAlign: 'center',
      color: cores.textoSecundario,
      padding: 40,
      fontSize: 16,
    },
    botaoAdicionar: {
      backgroundColor: cores.vermelhoPadrao,
      width: 56,
      height: 56,
      borderRadius: 28,
      position: 'absolute',
      right: 24,
      bottom: 24,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 6,
      elevation: 6,
    },
    iconeMaisHorizontal: {
      width: 18,
      height: 2,
      backgroundColor: '#ffffff',
      position: 'absolute',
      borderRadius: 1,
    },
    iconeMaisVertical: {
      width: 2,
      height: 18,
      backgroundColor: '#ffffff',
      position: 'absolute',
      borderRadius: 1,
    },
    modalFundo: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.45)',
      justifyContent: 'center',
      padding: 16,
    },
    modalConteudo: {
      backgroundColor: cores.fundoModal,
      marginHorizontal: 10,
      borderRadius: 16,
      padding: 20,
      maxHeight: '85%', 
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 10,
      elevation: 10,
      borderWidth: temaTemaEscuro ? 1 : 0,
      borderColor: cores.bordaCartao,
    },
    tituloModal: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 20,
      color: cores.textoPrincipal,
      textAlign: 'center',
    },
    rotulo: {
      fontSize: 14,
      fontWeight: '600',
      color: cores.textoPrincipal,
      marginBottom: 6,
      marginTop: 8,
    },
    entradaFormulario: {
      backgroundColor: cores.fundoInput,
      borderWidth: 1.5,
      borderColor: cores.bordaInput,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 10, 
      fontSize: 15,
      color: cores.textoInput,
      marginBottom: 12,
    },
    linhaFormulario: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 4,
      width: '100%',
    },
    colunaFormulario: {
      flex: 1,
    },
    conteinerOpcoes: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: 8,
      marginBottom: 14,
      marginTop: 4,
    },
    botaoOpcao: {
      width: '48%', 
      paddingVertical: 12,
      borderWidth: 1.5,
      borderColor: cores.bordaOpcao,
      borderRadius: 10,
      backgroundColor: cores.fundoInput,
      alignItems: 'center',
      justifyContent: 'center',
    },
    botaoOpcaoSelecionado: {
      borderColor: cores.vermelhoPadrao,
      backgroundColor: 'rgba(196, 30, 58, 0.08)',
    },
    textoOpcao: {
      fontSize: 13,
      fontWeight: '600',
      color: cores.textoSecundario,
    },
    textoOpcaoSelecionado: {
      color: cores.vermelhoPadrao,
    },
    entradaMultilinha: {
      backgroundColor: cores.fundoInput,
      borderWidth: 1.5,
      borderColor: cores.bordaInput,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingTop: 12,
      paddingBottom: 12,
      fontSize: 15,
      color: cores.textoInput,
      marginBottom: 12,
      minHeight: 95,
      textAlignVertical: 'top',
    },
    erro: {
      backgroundColor: '#fee2e2',
      borderWidth: 1,
      borderColor: '#fecaca',
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
    },
    textoErro: {
      color: '#dc2626',
      fontSize: 14,
    },
    acoesFormulario: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 20,
      marginBottom: 20, 
    },
    botaoCancelarForm: {
      flex: 1,
      backgroundColor: '#6b7280',
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    botaoSalvarForm: {
      flex: 1,
      backgroundColor: cores.vermelhoPadrao,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    textoBotaoForm: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '600',
    },
  });

  return (
    <View style={estilos.conteiner}>
      {/* Cabeçalho */}
      <View style={estilos.cabecalho}>
        <Text style={estilos.tituloCabecalho}>Gerenciar Atletas</Text>
      </View>

      <View style={estilos.conteudo}>
        <View style={{ paddingHorizontal: 30, paddingTop: 20 }}>
          <TextInput
            value={consultaPesquisa}
            onChangeText={setConsultaPesquisa}
            style={estilos.entradaPesquisa}
            placeholder="Pesquise por um atleta..."
            placeholderTextColor={cores.textoSecundario}
          />
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 30, paddingBottom: 100 }}
        >
          {atletasFiltrados.length === 0 ? (
            <Text style={estilos.textoVazio}>
              Nenhum atleta encontrado
            </Text>
          ) : (
            atletasFiltrados.map((item) => (
              <View key={item.id} style={estilos.cartaoAtleta}>
                <View style={estilos.conteudoCartaoAtleta}>
                  <View style={estilos.avatar}>
                    <Text style={estilos.textoAvatar}>
                      {obterIniciais(item.nome)}
                    </Text>
                  </View>
                  <View style={estilos.infoAtleta}>
                    <Text style={estilos.nomeAtleta}>{item.nome}</Text>
                    <Text style={estilos.detalhesAtleta}>
                      Data de Nasc.: {item.dataNascimento}
                    </Text>
                    <Text style={estilos.detalhesAtleta}>
                      Altura: {item.altura} cm · Peso: {item.peso} kg
                    </Text>
                  </View>
                </View>

                <View style={estilos.acoesAtleta}>
                  <TouchableOpacity
                    style={[estilos.botaoAcao, estilos.botaoAcaoAvaliar]}
                    onPress={() => 
                      navigation.navigate('Avaliacao', { 
                        abrirFormulario: true, 
                        atletaNome: item.nome 
                      })
                    }
                  >
                    <Text style={estilos.textoBotaoAcao}>Avaliar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[estilos.botaoAcao, estilos.botaoAcaoEditar]}
                    onPress={() => abrirModal(item)}
                  >
                    <Text style={estilos.textoBotaoAcao}>Editar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[estilos.botaoAcao, estilos.botaoAcaoDeletar]}
                    onPress={() => tratarDeletar(item.id)}
                  >
                    <Text style={estilos.textoBotaoAcao}>Deletar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>

      <TouchableOpacity
        style={estilos.botaoAdicionar}
        onPress={() => abrirModal()}
      >
        <View style={estilos.iconeMaisHorizontal} />
        <View style={estilos.iconeMaisVertical} />
      </TouchableOpacity>

      {/* Modal Formulário Cadastro/Edição */}
      <Modal
        visible={mostrarModal}
        onRequestClose={fecharModal}
        transparent={true}
        animationType="slide"
      >
        <View style={estilos.modalFundo}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={estilos.modalConteudo}
          >
            <Text style={estilos.tituloModal}>
              {editandoId ? 'Editar Atleta' : 'Novo Atleta'}
            </Text>

            <ScrollView 
              showsVerticalScrollIndicator={false}
              bounces={false}
              contentContainerStyle={{ paddingBottom: 40 }}
            >
              <Text style={estilos.rotulo}>Nome *</Text>
              <TextInput
                value={dadosFormulario.nome}
                onChangeText={(texto) =>
                  setDadosFormulario({ ...dadosFormulario, nome: texto })
                }
                style={estilos.entradaFormulario}
                placeholder="Digite o nome do atleta"
                placeholderTextColor={cores.textoSecundario}
              />

              <Text style={estilos.rotulo}>Data de Nascimento *</Text>
              <TextInput
                value={dadosFormulario.dataNascimento}
                onChangeText={(texto) =>
                  setDadosFormulario({ ...dadosFormulario, dataNascimento: texto })
                }
                style={estilos.entradaFormulario}
                placeholder="DD/MM/AAAA"
                placeholderTextColor={cores.textoSecundario}
              />

              <View style={estilos.linhaFormulario}>
                <View style={estilos.colunaFormulario}>
                  <Text style={estilos.rotulo}>Altura (cm) *</Text>
                  <TextInput
                    value={dadosFormulario.altura}
                    onChangeText={(texto) =>
                      setDadosFormulario({ ...dadosFormulario, altura: texto })
                    }
                    style={estilos.entradaFormulario}
                    keyboardType="numeric"
                    placeholder="Ex: 175"
                    placeholderTextColor={cores.textoSecundario}
                  />
                </View>
                <View style={estilos.colunaFormulario}>
                  <Text style={estilos.rotulo}>Peso (kg) *</Text>
                  <TextInput
                    value={dadosFormulario.peso}
                    onChangeText={(texto) =>
                      setDadosFormulario({ ...dadosFormulario, peso: texto })
                    }
                    style={estilos.entradaFormulario}
                    keyboardType="numeric"
                    placeholder="Ex: 70"
                    placeholderTextColor={cores.textoSecundario}
                  />
                </View>
              </View>

              {/* Seletor Sexo */}
              <Text style={estilos.rotulo}>Sexo</Text>
              <View style={estilos.conteinerOpcoes}>
                {OPCOES_SEXO.map((opcao) => {
                  const selecionado = dadosFormulario.sexo === opcao;
                  return (
                    <TouchableOpacity
                      key={opcao}
                      style={[estilos.botaoOpcao, selecionado && estilos.botaoOpcaoSelecionado]}
                      onPress={() => setDadosFormulario({ ...dadosFormulario, sexo: opcao })}
                    >
                      <Text style={[estilos.textoOpcao, selecionado && estilos.textoOpcaoSelecionado]}>
                        {opcao}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Seletor Sudoração */}
              <Text style={estilos.rotulo}>Sudoração Percebida</Text>
              <View style={estilos.conteinerOpcoes}>
                {OPCOES_SUOR.map((opcao) => {
                  const selecionado = dadosFormulario.suor === opcao;
                  return (
                    <TouchableOpacity
                      key={opcao}
                      style={[estilos.botaoOpcao, selecionado && estilos.botaoOpcaoSelecionado]}
                      onPress={() => setDadosFormulario({ ...dadosFormulario, suor: opcao })}
                    >
                      <Text style={[estilos.textoOpcao, selecionado && estilos.textoOpcaoSelecionado]}>
                        {opcao}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Seletor Manchas de Sal */}
              <Text style={estilos.rotulo}>Manchas de Sal</Text>
              <View style={estilos.conteinerOpcoes}>
                {OPCOES_SAL.map((opcao) => {
                  const selecionado = dadosFormulario.sal === opcao;
                  return (
                    <TouchableOpacity
                      key={opcao}
                      style={[estilos.botaoOpcao, selecionado && estilos.botaoOpcaoSelecionado]}
                      onPress={() => setDadosFormulario({ ...dadosFormulario, sal: opcao })}
                    >
                      <Text style={[estilos.textoOpcao, selecionado && estilos.textoOpcaoSelecionado]}>
                        {opcao}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={estilos.rotulo}>Calipers (Dobras)</Text>
              <TextInput
                value={dadosFormulario.calipers}
                onChangeText={(texto) =>
                  setDadosFormulario({ ...dadosFormulario, calipers: texto })
                }
                style={estilos.entradaFormulario}
                placeholder="Medidas ou dobras anatômicas"
                placeholderTextColor={cores.textoSecundario}
              />

              <Text style={estilos.rotulo}>Hidratação</Text>
              <TextInput
                value={dadosFormulario.hidracao}
                onChangeText={(texto) =>
                  setDadosFormulario({ ...dadosFormulario, hidracao: texto })
                }
                style={estilos.entradaFormulario}
                placeholder="Nível de hidratação atual"
                placeholderTextColor={cores.textoSecundario}
              />

              <Text style={estilos.rotulo}>Doenças Conhecidas</Text>
              <TextInput
                value={dadosFormulario.doencas}
                onChangeText={(texto) =>
                  setDadosFormulario({ ...dadosFormulario, doencas: texto })
                }
                style={estilos.entradaFormulario}
                placeholder="Histórico clínico ou patologias"
                placeholderTextColor={cores.textoSecundario}
              />

              <Text style={estilos.rotulo}>Sintomas</Text>
              <TextInput
                value={dadosFormulario.sintomas}
                onChangeText={(texto) =>
                  setDadosFormulario({ ...dadosFormulario, sintomas: texto })
                }
                style={[estilos.entradaFormulario, estilos.entradaMultilinha]}
                multiline
                placeholder="Descreva os sintomas relatados pelo atleta"
                placeholderTextColor={cores.textoSecundario}
              />

              {/* Seletor Diuréticos */}
              <Text style={estilos.rotulo}>Uso de Diuréticos</Text>
              <View style={estilos.conteinerOpcoes}>
                {OPCOES_DIURETICOS.map((opcao) => {
                  const selecionado = dadosFormulario.diureticos === opcao;
                  return (
                    <TouchableOpacity
                      key={opcao}
                      style={[estilos.botaoOpcao, selecionado && estilos.botaoOpcaoSelecionado]}
                      onPress={() => setDadosFormulario({ ...dadosFormulario, diureticos: opcao })}
                    >
                      <Text style={[estilos.textoOpcao, selecionado && estilos.textoOpcaoSelecionado]}>
                        {opcao}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {erro && (
                <View style={estilos.erro}>
                  <Text style={estilos.textoErro}>{erro}</Text>
                </View>
              )}

              <View style={estilos.acoesFormulario}>
                <TouchableOpacity
                  style={estilos.botaoCancelarForm}
                  onPress={fecharModal}
                >
                  <Text style={estilos.textoBotaoForm}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={estilos.botaoSalvarForm}
                  onPress={tratarSalvar}
                >
                  <Text style={estilos.textoBotaoForm}>Salvar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
};

export default TelaAtletas;