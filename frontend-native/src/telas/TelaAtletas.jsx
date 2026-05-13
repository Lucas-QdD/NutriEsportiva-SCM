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
} from 'react-native';
import { usarDados } from '../contextos/ContextoDados';

const TelaAtletas = () => {
  const {
    atletas,
    adicionarAtleta,
    editarAtleta,
    deletarAtleta,
    atletaVazio,
    pesquisarAtletas,
  } = usarDados();

  const [consultaPesquisa, setConsultaPesquisa] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [dadosFormulario, setDadosFormulario] = useState(atletaVazio);
  const [erro, setErro] = useState('');

  const atletasFiltrados = pesquisarAtletas(consultaPesquisa);

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

    if (editandoId) {
      editarAtleta(editandoId, dadosFormulario);
      Alert.alert('Sucesso', 'Atleta atualizado com sucesso!');
    } else {
      adicionarAtleta(dadosFormulario);
      Alert.alert('Sucesso', 'Atleta adicionado com sucesso!');
    }

    fecharModal();
  };

  const tratarDeletar = (id) => {
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
  };

  const obterIniciais = (nome) => {
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
      backgroundColor: '#f3f4f6', // gray-100
    },
    cabecalho: {
      backgroundColor: '#f9fafb', // gray-50
      paddingVertical: 20,
      paddingHorizontal: 30,
      borderBottomWidth: 1,
      borderBottomColor: '#e5e7eb', // gray-200
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    tituloCabecalho: {
      fontSize: 24,
      color: '#1f2937', // gray-800
      fontWeight: 'bold',
    },
    entradaPesquisa: {
      backgroundColor: '#ffffff',
      borderWidth: 1,
      borderColor: '#d1d5db', // gray-300
      borderRadius: 10,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      color: '#1f2937',
      marginBottom: 20,
    },
    conteudo: {
      flex: 1,
      padding: 30,
    },
    cartaoAtleta: {
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
    conteudoCartaoAtleta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    avatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: '#c41e3a',
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
      color: '#1f2937',
      marginBottom: 4,
    },
    detalhesAtleta: {
      fontSize: 14,
      color: '#6b7280', // gray-500
      marginBottom: 2,
    },
    acoesAtleta: {
      flexDirection: 'row',
      gap: 8,
    },
    botaoAcao: {
      backgroundColor: '#c41e3a',
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    botaoAcaoEditar: {
      backgroundColor: '#374151', // gray-700
    },
    textoBotaoAcao: {
      color: '#ffffff',
      fontSize: 14,
      fontWeight: '600',
    },
    textoVazio: {
      textAlign: 'center',
      color: '#9ca3af', // gray-400
      padding: 40,
      fontSize: 16,
    },
    botaoAdicionar: {
      backgroundColor: '#c41e3a',
      width: 60,
      height: 60,
      borderRadius: 30,
      position: 'absolute',
      right: 20,
      bottom: 20,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    textoBotaoAdicionar: {
      color: '#ffffff',
      fontSize: 24,
      fontWeight: 'bold',
    },
    modalConteudo: {
      backgroundColor: '#ffffff',
      margin: 20,
      borderRadius: 12,
      padding: 20,
      maxHeight: '90%',
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 8,
    },
    tituloModal: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 20,
      color: '#1f2937',
      textAlign: 'center',
    },
    entradaFormulario: {
      backgroundColor: '#ffffff',
      borderWidth: 1,
      borderColor: '#d1d5db',
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 16,
      color: '#1f2937',
      marginBottom: 12,
    },
    rotulo: {
      fontSize: 14,
      fontWeight: '600',
      color: '#374151',
      marginBottom: 4,
    },
    linhaFormulario: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 12,
    },
    colunaFormulario: {
      flex: 1,
    },
    entradaMultilinha: {
      height: 80,
      textAlignVertical: 'top',
    },
    erro: {
      backgroundColor: '#fef2f2',
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
    },
    botaoCancelar: {
      flex: 1,
      backgroundColor: '#6b7280',
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    botaoSalvar: {
      flex: 1,
      backgroundColor: '#c41e3a',
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    textoBotao: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '600',
    },
  });

  return (
    <View style={estilos.conteiner}>
      <View style={estilos.cabecalho}>
        <Text style={estilos.tituloCabecalho}>Gerenciar Atletas</Text>
      </View>

      <View style={estilos.conteudo}>
        <TextInput
          value={consultaPesquisa}
          onChangeText={setConsultaPesquisa}
          style={estilos.entradaPesquisa}
          placeholder="Pesquise por um atleta..."
          placeholderTextColor="#9ca3af"
        />

        {/* Lista de Atletas */}
        <ScrollView showsVerticalScrollIndicator={false}>
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
                  <View style={estilos.acoesAtleta}>
                    <TouchableOpacity
                      style={[estilos.botaoAcao, estilos.botaoAcaoEditar]}
                      onPress={() => abrirModal(item)}
                    >
                      <Text style={estilos.textoBotaoAcao}>Editar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={estilos.botaoAcao}
                      onPress={() => tratarDeletar(item.id)}
                    >
                      <Text style={estilos.textoBotaoAcao}>Deletar</Text>
                    </TouchableOpacity>
                  </View>
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
        <Text style={estilos.textoBotaoAdicionar}>+</Text>
      </TouchableOpacity>

      <Modal
        visible={mostrarModal}
        onRequestClose={fecharModal}
        transparent={true}
        animationType="slide"
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center' }}>
          <View style={estilos.modalConteudo}>
            <Text style={estilos.tituloModal}>
              {editandoId ? 'Editar Atleta' : 'Novo Atleta'}
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={estilos.rotulo}>Nome *</Text>
              <TextInput
                value={dadosFormulario.nome}
                onChangeText={(texto) =>
                  setDadosFormulario({ ...dadosFormulario, nome: texto })
                }
                style={estilos.entradaFormulario}
                placeholder="Digite o nome do atleta"
                placeholderTextColor="#9ca3af"
              />

              <Text style={estilos.rotulo}>Data de Nascimento *</Text>
              <TextInput
                value={dadosFormulario.dataNascimento}
                onChangeText={(texto) =>
                  setDadosFormulario({ ...dadosFormulario, dataNascimento: texto })
                }
                style={estilos.entradaFormulario}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#9ca3af"
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
                    placeholderTextColor="#9ca3af"
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
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </View>

              <View style={estilos.linhaFormulario}>
                <View style={estilos.colunaFormulario}>
                  <Text style={estilos.rotulo}>Sexo</Text>
                  <TextInput
                    value={dadosFormulario.sexo}
                    onChangeText={(texto) =>
                      setDadosFormulario({ ...dadosFormulario, sexo: texto })
                    }
                    style={estilos.entradaFormulario}
                    placeholder="M/F"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
                <View style={estilos.colunaFormulario}>
                  <Text style={estilos.rotulo}>Suor</Text>
                  <TextInput
                    value={dadosFormulario.suor}
                    onChangeText={(texto) =>
                      setDadosFormulario({ ...dadosFormulario, suor: texto })
                    }
                    style={estilos.entradaFormulario}
                    placeholder="Tipo de suor"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </View>

              <View style={estilos.linhaFormulario}>
                <View style={estilos.colunaFormulario}>
                  <Text style={estilos.rotulo}>Sal</Text>
                  <TextInput
                    value={dadosFormulario.sal}
                    onChangeText={(texto) =>
                      setDadosFormulario({ ...dadosFormulario, sal: texto })
                    }
                    style={estilos.entradaFormulario}
                    placeholder="Nível de sal"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
                <View style={estilos.colunaFormulario}>
                  <Text style={estilos.rotulo}>Doenças</Text>
                  <TextInput
                    value={dadosFormulario.doencas}
                    onChangeText={(texto) =>
                      setDadosFormulario({ ...dadosFormulario, doencas: texto })
                    }
                    style={estilos.entradaFormulario}
                    placeholder="Doenças conhecidas"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </View>

              <View style={estilos.linhaFormulario}>
                <View style={estilos.colunaFormulario}>
                  <Text style={estilos.rotulo}>Calipers</Text>
                  <TextInput
                    value={dadosFormulario.calipers}
                    onChangeText={(texto) =>
                      setDadosFormulario({ ...dadosFormulario, calipers: texto })
                    }
                    style={estilos.entradaFormulario}
                    placeholder="Medidas"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
                <View style={estilos.colunaFormulario}>
                  <Text style={estilos.rotulo}>Hidratação</Text>
                  <TextInput
                    value={dadosFormulario.hidracao}
                    onChangeText={(texto) =>
                      setDadosFormulario({ ...dadosFormulario, hidracao: texto })
                    }
                    style={estilos.entradaFormulario}
                    placeholder="Nível de hidratação"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </View>

              <Text style={estilos.rotulo}>Sintomas</Text>
              <TextInput
                value={dadosFormulario.sintomas}
                onChangeText={(texto) =>
                  setDadosFormulario({ ...dadosFormulario, sintomas: texto })
                }
                style={[estilos.entradaFormulario, estilos.entradaMultilinha]}
                multiline
                placeholder="Descreva os sintomas"
                placeholderTextColor="#9ca3af"
              />

              <Text style={estilos.rotulo}>Diuréticos</Text>
              <TextInput
                value={dadosFormulario.diureticos}
                onChangeText={(texto) =>
                  setDadosFormulario({ ...dadosFormulario, diureticos: texto })
                }
                style={estilos.entradaFormulario}
                placeholder="Uso de diuréticos"
                placeholderTextColor="#9ca3af"
              />

              {erro && (
                <View style={estilos.erro}>
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
                  onPress={tratarSalvar}
                >
                  <Text style={estilos.textoBotao}>Salvar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default TelaAtletas;
