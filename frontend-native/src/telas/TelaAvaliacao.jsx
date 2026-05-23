import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Alert,
  Modal,
  TouchableOpacity,
  Text,
  TextInput, 
  KeyboardAvoidingView, 
  Platform,             
} from 'react-native';
import {
  Snackbar,
} from 'react-native-paper';
import { usarDados } from '../contextos/ContextoDados';
import { usarAutenticacao } from '../contextos/ContextoAutenticacao';
import { usarTema } from '../contextos/ContextoTema';

const OPCOES_SUOR = ['Leve', 'Moderada', 'Intensa'];
const OPCOES_SAL = ['Nenhuma', 'Pouca', 'Moderada', 'Muita'];
const OPCOES_DIURETICOS = ['Sim', 'Não'];

const TelaAvaliacao = ({ route }) => {
  const { adicionarAvaliacao, avaliacoes, obterAvaliacoesPorUsuario, avaliacaoVazia } = usarDados();
  const { usuario } = usarAutenticacao();
  const { temaTemaEscuro } = usarTema();

  const [dadosFormulario, setDadosFormulario] = useState(avaliacaoVazia);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoVisualizacao, setModoVisualizacao] = useState(false);
  
  // Verifica se quem está logado é um atleta
  const ehAtleta = usuario?.papel === 'ATLETA';
  
  // Define o nome padrão caso venha da navegação do Nutricionista
  const nomeAtletaSelecionado = route.params?.atletaNome || route.params?.atleta?.nome || "";

  const avaliacoesDousesuario = (obterAvaliacoesPorUsuario(usuario?.nome) || []).filter(
    (av) => av.nutricionistaResponsavel === usuario?.nome || (ehAtleta && av.atletaNome === usuario?.nome)
  );

  useEffect(() => {
    if (route.params?.id) {
      const avaliacaoEncontrada = avaliacoes.find(a => a.id === route.params.id);
      if (avaliacaoEncontrada) {
        setDadosFormulario(avaliacaoEncontrada);
        setModoVisualizacao(true);
        setMostrarModal(true);
      }
    } 
    else if (route.params?.abrirFormulario) {
      setDadosFormulario(avaliacaoVazia);
      setModoVisualizacao(false);
      setErro('');
      setMostrarModal(true);
    }
  }, [route.params?.id, route.params?.abrirFormulario, avaliacoes]);

  const abrirModal = () => {
    setDadosFormulario(avaliacaoVazia);
    setModoVisualizacao(false);
    setErro('');
    setMostrarModal(true);
  };

  const fecharModal = () => {
    setMostrarModal(false);
    setErro('');
    setModoVisualizacao(false);
  };

  const tratarEnvio = () => {
    const nomeFinal = ehAtleta 
      ? usuario?.nome 
      : (dadosFormulario.atletaNome?.trim() || nomeAtletaSelecionado || "Geral");

    if (!dadosFormulario.data || !dadosFormulario.peso) {
      setErro('Preencha os campos obrigatórios (Data, Peso)');
      return;
    }

    const avaliacaoComAtleta = {
      ...dadosFormulario,
      atletaNome: nomeFinal,
      nutricionistaResponsavel: ehAtleta ? "Autoavaliação" : usuario?.nome
    };

    adicionarAvaliacao(avaliacaoComAtleta, usuario?.nome);
    Alert.alert('Sucesso', 'Avaliação registrada com sucesso!');
    
    setDadosFormulario(avaliacaoVazia);
    setErro('');
    setMostrarModal(false);
    setMensagem('Avaliação registrada com sucesso.');

    setTimeout(() => setMensagem(''), 3000);
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
    bordaOpcao: temaTemaEscuro ? '#404040' : '#d1d5db',
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
    // CORREÇÃO: Resgatado o padding: 30 idêntico ao da TelaPrincipal para alinhar as quinas horizontais
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
      marginBottom: 2,
    },
    pesoAvaliacao: {
      fontSize: 14,
      color: cores.textoSecundario, 
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
    modalFundo: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.45)',
      justifyContent: 'center',
      padding: 16,
    },
    modalConteudo: {
      backgroundColor: cores.fundoModal,
      borderRadius: 16,
      padding: 20,
      maxHeight: '85%',
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
    areaTexto: {
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
    conteinerOpcoes: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between', 
      gap: 8,
      marginBottom: 10,
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
    caixaErro: {
      backgroundColor: '#fee2e2',
      padding: 12,
      borderRadius: 8,
      marginBottom: 12,
    },
    textoErro: {
      color: '#dc2626',
      fontSize: 14,
    },
    acoesFormulario: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 16,
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
      {/* CORREÇÃO: Cabeçalho agora fixo no topo da View raiz, igualzinho ao Painel Principal */}
      <View style={estilos.cabecalho}>
        <Text style={estilos.tituloCabecalho}>Histórico de Avaliações</Text>
      </View>

      {/* O ScrollView agora envelopa estritamente a área interna de conteúdo */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={estilos.conteudo}>
          {/* Bloco de Ações */}
          <View style={estilos.secao}>
            <View style={estilos.cabecalhoSecao}>
              <Text style={estilos.tituloSecao}>Ações</Text>
            </View>
            <TouchableOpacity style={estilos.botaoNavegacao} onPress={abrirModal}>
              <Text style={estilos.textoBotaoNavegacao}>Nova Avaliação</Text>
            </TouchableOpacity>
          </View>

          {/* Listagem de Avaliações Anteriores */}
          <View style={estilos.secao}>
            <View style={estilos.cabecalhoSecao}>
              <Text style={estilos.tituloSecao}>Suas Avaliações Anteriores</Text>
            </View>

          {avaliacoesDousesuario.length === 0 ? (
            <Text style={estilos.textoVazio}>
              Nenhuma avaliação registrada
            </Text>
          ) : (
            avaliacoesDousesuario.map((item) => (
              <View key={item.id} style={estilos.cartaoAvaliacao}>
                <View style={estilos.infoAvaliacao}>
                  <Text style={estilos.nomeAvaliacao}>
                    {item.data}
                  </Text>
                  <Text style={estilos.dataAvaliacao}>
                    Atleta: {item.atletaNome || "Geral"} · Peso: {item.peso} kg
                  </Text>
                  <Text style={estilos.pesoAvaliacao}>
                    {item.suor && `Suor: ${item.suor}`} {item.sal && `• Mancha: ${item.sal}`}
                  </Text>
                </View>

                <TouchableOpacity
                  style={[estilos.botaoNavegacao, { paddingVertical: 8, paddingHorizontal: 16, marginBottom: 0 }]}
                  onPress={() => {
                    setDadosFormulario(item);
                    setModoVisualizacao(true);
                    setMostrarModal(true);
                  }}
                >
                  <Text style={estilos.textoBotaoNavegacao}>Ver</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
          </View>
        </View>
      </ScrollView>

      {/* Modal Cadastro/Visualização Protegido com trava de Teclado */}
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
              {modoVisualizacao ? 'Visualizar Avaliação' : 'Nova Avaliação'}
            </Text>

            {/* CONDICIONAL: O campo só aparece se NÃO for um usuário Atleta logado */}
            {!ehAtleta && (
              <View>
                <Text style={estilos.rotulo}>Atleta *</Text>
                <TextInput
                  value={dadosFormulario.atletaNome || (nomeAtletaSelecionado ? nomeAtletaSelecionado : '')}
                  editable={!nomeAtletaSelecionado && !modoVisualizacao}
                  onChangeText={(texto) =>
                    setDadosFormulario({ ...dadosFormulario, atletaNome: texto })
                  }
                  style={[
                    estilos.entradaFormulario, 
                    nomeAtletaSelecionado && { backgroundColor: temaTemaEscuro ? '#221c1c' : '#fef2f2', borderColor: cores.vermelhoPadrao }
                  ]}
                  placeholder="Digite o nome do atleta..."
                  placeholderTextColor={cores.textoSecundario}
                />
              </View>
            )}
            
            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 30 }}
            >
              <Text style={estilos.rotulo}>Data da Avaliação *</Text>
              <TextInput
                value={dadosFormulario.data}
                editable={!modoVisualizacao}
                onChangeText={(texto) =>
                  setDadosFormulario({ ...dadosFormulario, data: texto })
                }
                style={estilos.entradaFormulario}
                placeholder="DD/MM/AAAA"
                placeholderTextColor={cores.textoSecundario}
              />

              <Text style={estilos.rotulo}>Peso Atual (kg) *</Text>
              <TextInput
                value={dadosFormulario.peso}
                editable={!modoVisualizacao}
                onChangeText={(texto) =>
                  setDadosFormulario({ ...dadosFormulario, peso: texto })
                }
                style={estilos.entradaFormulario}
                keyboardType="numeric"
                placeholder="Ex: 70.5"
                placeholderTextColor={cores.textoSecundario}
              />

              {/* Seletor Sudoração Percebida */}
              <Text style={estilos.rotulo}>Sudoração Percebida</Text>
              <View style={estilos.conteinerOpcoes}>
                {OPCOES_SUOR.map((opcao) => {
                  const scaler = dadosFormulario.suor === opcao;
                  return (
                    <TouchableOpacity
                      key={opcao}
                      style={[estilos.botaoOpcao, scaler && estilos.botaoOpcaoSelecionado]}
                      disabled={modoVisualizacao}
                      onPress={() => setDadosFormulario({ ...dadosFormulario, suor: opcao })}
                    >
                      <Text style={[estilos.textoOpcao, scaler && estilos.textoOpcaoSelecionado]}>
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
                  const scaler = dadosFormulario.sal === opcao;
                  return (
                    <TouchableOpacity
                      key={opcao}
                      style={[estilos.botaoOpcao, scaler && estilos.botaoOpcaoSelecionado]}
                      disabled={modoVisualizacao}
                      onPress={() => setDadosFormulario({ ...dadosFormulario, sal: opcao })}
                    >
                      <Text style={[estilos.textoOpcao, scaler && estilos.textoOpcaoSelecionado]}>
                        {opcao}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={estilos.rotulo}>Estratégia de Hidratação</Text>
              <TextInput
                value={dadosFormulario.hidracao}
                editable={!modoVisualizacao}
                onChangeText={(texto) =>
                  setDadosFormulario({ ...dadosFormulario, hidracao: texto })
                }
                placeholder="Descreva sua estratégia de consumo de líquidos..."
                placeholderTextColor={cores.textoSecundario}
                style={estilos.areaTexto}
                multiline
              />

              <Text style={estilos.rotulo}>Sintomas Percebidos</Text>
              <TextInput
                value={dadosFormulario.sintomas}
                editable={!modoVisualizacao}
                onChangeText={(texto) =>
                  setDadosFormulario({ ...dadosFormulario, sintomas: texto })
                }
                placeholder="Ex: Cãibras, fadiga excessiva, tontura..."
                placeholderTextColor={cores.textoSecundario}
                style={estilos.areaTexto}
                multiline
              />

              {/* Seletor Medicamentos Diuréticos */}
              <Text style={estilos.rotulo}>Uso de Medicamentos Diuréticos</Text>
              <View style={estilos.conteinerOpcoes}>
                {OPCOES_DIURETICOS.map((opcao) => {
                  const scaler = dadosFormulario.diureticos === opcao;
                  return (
                    <TouchableOpacity
                      key={opcao}
                      style={[estilos.botaoOpcao, scaler && estilos.botaoOpcaoSelecionado]}
                      disabled={modoVisualizacao}
                      onPress={() => setDadosFormulario({ ...dadosFormulario, diureticos: opcao })}
                    >
                      <Text style={[estilos.textoOpcao, scaler && estilos.textoOpcaoSelecionado]}>
                        {opcao}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {erro && (
                <View style={estilos.caixaErro}>
                  <Text style={estilos.textoErro}>{erro}</Text>
                </View>
              )}

              <View style={estilos.acoesFormulario}>
                <TouchableOpacity
                  style={estilos.botaoCancelarForm}
                  onPress={fecharModal}
                >
                  <Text style={estilos.textoBotaoForm}>
                    {modoVisualizacao ? 'Fechar' : 'Cancelar'}
                  </Text>
                </TouchableOpacity>
                
                {!modoVisualizacao && (
                  <TouchableOpacity
                    style={estilos.botaoSalvarForm}
                    onPress={tratarEnvio}
                  >
                    <Text style={estilos.textoBotaoForm}>Salvar</Text>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <Snackbar
        visible={!!mensagem}
        onDismiss={() => setMensagem('')}
        duration={3000}
        style={{ backgroundColor: '#10b981' }}
      >
        {mensagem}
      </Snackbar>
    </View>
  );
};

export default TelaAvaliacao;