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

const TelaAtletas = ({ navigation }) => {
  const {
    atletas,
    adicionarAtleta,
    deletarAtleta,
    atletaVazio,
    pesquisarAtletas,
  } = usarDados();

  const { temaTemaEscuro } = usarTema();
  const { usuario } = usarAutenticacao();

  const [consultaPesquisa, setConsultaPesquisa] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [dadosFormulario, setDadosFormulario] = useState(atletaVazio);
  const [erro, setErro] = useState('');

  const atletasFiltrados = pesquisarAtletas(consultaPesquisa);

  const abrirModal = () => {
    setDadosFormulario({
      ...atletaVazio,
      teamId: usuario?.teamId || 'default-team-id' // Auto-preenche com o time do profissional logado
    });
    setMostrarModal(true);
    setErro('');
  };

  const fecharModal = () => {
    setMostrarModal(false);
    setDadosFormulario(atletaVazio);
    setErro('');
  };

  const tratarSalvar = async () => {
    // Validação estrita baseada nas regras de negócio do seu athleteProfileService.js
    if (!dadosFormulario.nome || !dadosFormulario.userId || !dadosFormulario.age) {
      setErro('Nome, ID do Usuário e Idade são campos obrigatórios.');
      return;
    }

    const idadeNum = parseInt(dadosFormulario.age, 10);
    if (isNaN(idadeNum) || idadeNum <= 0) {
      setErro('Idade inválida. O valor deve ser um número inteiro maior que zero.');
      return;
    }

    const payloadAtleta = {
      nome: dadosFormulario.nome.trim(),
      userId: dadosFormulario.userId.trim(),
      teamId: dadosFormulario.teamId || usuario?.teamId || 'default-team-id',
      athleteCode: dadosFormulario.athleteCode ? dadosFormulario.athleteCode.trim() : `ATL-${Math.floor(100000 + Math.random() * 900000)}`,
      age: idadeNum,
      sport: dadosFormulario.sport ? dadosFormulario.sport.trim() : 'Geral'
    };

    try {
      await adicionarAtleta(payloadAtleta);
      Alert.alert('Sucesso', 'Perfil de atleta gerado e salvo!');
      fecharModal();
    } catch (e) {
      setErro(e.message || 'Falha ao salvar perfil. Verifique os dados relacionais.');
    }
  };

  const obterIniciais = (nome) => {
    if (!nome || typeof nome !== 'string') return 'AT';
    const partes = nome.trim().split(/\s+/);
    if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
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
    verdeSucesso: '#10b981',
  };

  const estilos = StyleSheet.create({
    conteiner: { flex: 1, backgroundColor: cores.fundoApp },
    cabecalho: { backgroundColor: cores.fundoCabecalho, paddingVertical: 20, paddingHorizontal: 30, borderBottomWidth: 1, borderBottomColor: cores.bordaCabecalho },
    tituloCabecalho: { fontSize: 24, color: cores.textoPrincipal, fontWeight: 'bold' },
    conteudo: { flex: 1 },
    entradaPesquisa: { backgroundColor: cores.fundoInput, borderWidth: 1, borderColor: cores.bordaInput, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, color: cores.textoInput, marginBottom: 20 },
    cartaoAtleta: { backgroundColor: cores.fundoCartao, borderRadius: 10, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: cores.bordaCartao },
    conteudoCartaoAtleta: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 12 },
    avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: cores.vermelhoPadrao, justifyContent: 'center', alignItems: 'center' },
    textoAvatar: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
    infoAtleta: { flex: 1 },
    nomeAtleta: { fontSize: 16, fontWeight: '600', color: cores.textoPrincipal, marginBottom: 4 },
    detalhesAtleta: { fontSize: 14, color: cores.textoSecundario, marginBottom: 2 },
    acoesAtleta: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, borderTopWidth: 1, borderTopColor: cores.bordaCartao, paddingTop: 12 },
    botaoAcao: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    botaoAcaoAvaliar: { backgroundColor: cores.verdeSucesso },
    botaoAcaoDeletar: { backgroundColor: cores.vermelhoPadrao },
    textoBotaoAcao: { color: '#ffffff', fontSize: 13, fontWeight: '600' },
    botaoAdicionar: { backgroundColor: cores.vermelhoPadrao, width: 56, height: 56, borderRadius: 28, position: 'absolute', right: 24, bottom: 24, justifyContent: 'center', alignItems: 'center', elevation: 6 },
    iconeMaisHorizontal: { width: 18, height: 2, backgroundColor: '#ffffff', position: 'absolute' },
    iconeMaisVertical: { width: 2, height: 18, backgroundColor: '#ffffff', position: 'absolute' },
    modalFundo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 16 },
    modalConteudo: { backgroundColor: cores.fundoModal, marginHorizontal: 10, borderRadius: 16, padding: 20, maxHeight: '85%' },
    tituloModal: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, color: cores.textoPrincipal, textAlign: 'center' },
    rotulo: { fontSize: 14, fontWeight: '600', color: cores.textoPrincipal, marginBottom: 6, marginTop: 8 },
    entradaFormulario: { backgroundColor: cores.fundoInput, borderWidth: 1.5, borderColor: cores.bordaInput, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, color: cores.textoInput, marginBottom: 12 },
    linhaFormulario: { flexDirection: 'row', justifyContent: 'space-between' },
    colunaMetade: { width: '48%' },
    erro: { backgroundColor: '#fee2e2', borderWidth: 1, borderColor: '#fecaca', borderRadius: 8, padding: 12, marginBottom: 16 },
    textoErro: { color: '#dc2626', fontSize: 14 },
    acoesFormulario: { flexDirection: 'row', gap: 12, marginTop: 20 },
    botaoCancelarForm: { flex: 1, backgroundColor: '#6b7280', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
    botaoSalvarForm: { flex: 1, backgroundColor: cores.vermelhoPadrao, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
    textoBotaoForm: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  });

  return (
    <View style={estilos.conteiner}>
      <View style={estilos.cabecalho}>
        <Text style={estilos.tituloCabecalho}>Gerenciar Atletas</Text>
      </View>

      <View style={estilos.conteudo}>
        <View style={{ paddingHorizontal: 30, paddingTop: 20 }}>
          <TextInput value={consultaPesquisa} onChangeText={setConsultaPesquisa} style={estilos.entradaPesquisa} placeholder="Pesquise por nome, código ou modalidade..." placeholderTextColor={cores.textoSecundario} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 30, paddingBottom: 100 }}>
          {atletasFiltrados.length === 0 ? (
            <Text style={{ textAlign: 'center', color: cores.textoSecundario, padding: 40 }}>Nenhum perfil cadastrado.</Text>
          ) : (
            atletasFiltrados.map((item) => {
              const nomeExibicao = item.user?.name || item.nome || 'Atleta SCM';
              return (
                <View key={item.id} style={estilos.cartaoAtleta}>
                  <View style={estilos.conteudoCartaoAtleta}>
                    <View style={estilos.avatar}>
                      <Text style={estilos.textoAvatar}>{obterIniciais(nomeExibicao)}</Text>
                    </View>
                    <View style={estilos.infoAtleta}>
                      <Text style={estilos.nomeAtleta}>{nomeExibicao}</Text>
                      <Text style={estilos.detalhesAtleta}>Código Técnico: {item.athleteCode}</Text>
                      <Text style={estilos.detalhesAtleta}>Idade: {item.age} anos · Esporte: {item.sport}</Text>
                    </View>
                  </View>

                  <View style={estilos.acoesAtleta}>
                    <TouchableOpacity style={[estilos.botaoAcao, estilos.botaoAcaoAvaliar]} onPress={() => navigation.navigate('Avaliacao', { abrirFormulario: true, atletaNome: nomeExibicao, athleteId: item.id })}>
                      <Text style={estilos.textoBotaoAcao}>Nova Avaliação</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[estilos.botaoAcao, estilos.botaoAcaoDeletar]} onPress={() => deletarAtleta(item.id)}>
                      <Text style={estilos.textoBotaoAcao}>Excluir</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      </View>

      <TouchableOpacity style={estilos.botaoAdicionar} onPress={abrirModal}>
        <View style={estilos.iconeMaisHorizontal} />
        <View style={estilos.iconeMaisVertical} />
      </TouchableOpacity>

      <Modal visible={mostrarModal} onRequestClose={fecharModal} transparent={true} animationType="slide">
        <View style={estilos.modalFundo}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={estilos.modalConteudo}>
            <Text style={estilos.tituloModal}>Criar Perfil de Atleta</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              
              <Text style={estilos.rotulo}>Nome de Exibição do Atleta *</Text>
              <TextInput value={dadosFormulario.nome} onChangeText={(t) => setDadosFormulario({ ...dadosFormulario, nome: t })} style={estilos.entradaFormulario} placeholder="Ex: Lucas Silva" placeholderTextColor={cores.textoSecundario} />

              <Text style={estilos.rotulo}>ID de Usuário *</Text>
              <TextInput value={dadosFormulario.userId} onChangeText={(t) => setDadosFormulario({ ...dadosFormulario, userId: t })} style={estilos.entradaFormulario} placeholder="Código CUID da conta do atleta" placeholderTextColor={cores.textoSecundario} autoCapitalize="none" />

              <View style={estilos.linhaFormulario}>
                <View style={estilos.colunaMetade}>
                  <Text style={estilos.rotulo}>Idade *</Text>
                  <TextInput keyboardType="numeric" value={String(dadosFormulario.age || '')} onChangeText={(t) => setDadosFormulario({ ...dadosFormulario, age: t })} style={estilos.entradaFormulario} placeholder="Ex: 22" placeholderTextColor={cores.textoSecundario} />
                </View>
                <View style={estilos.colunaMetade}>
                  <Text style={estilos.rotulo}>Modalidade Esportiva</Text>
                  <TextInput value={dadosFormulario.sport} onChangeText={(t) => setDadosFormulario({ ...dadosFormulario, sport: t })} style={estilos.entradaFormulario} placeholder="Ex: Natação" placeholderTextColor={cores.textoSecundario} />
                </View>
              </View>

              <Text style={estilos.rotulo}>Código Customizado do Atleta (Opcional)</Text>
              <TextInput value={dadosFormulario.athleteCode} onChangeText={(t) => setDadosFormulario({ ...dadosFormulario, athleteCode: t })} style={estilos.entradaFormulario} placeholder="(Gerado Automaticamente)" placeholderTextColor={cores.textoSecundario} />

              {erro ? <View style={estilos.erro}><Text style={estilos.textoErro}>{erro}</Text></View> : null}

              <View style={estilos.acoesFormulario}>
                <TouchableOpacity style={estilos.botaoCancelarForm} onPress={fecharModal}><Text style={estilos.textoBotaoForm}>Cancelar</Text></TouchableOpacity>
                <TouchableOpacity style={estilos.botaoSalvarForm} onPress={tratarSalvar}><Text style={estilos.textoBotaoForm}>Salvar</Text></TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
};

export default TelaAtletas;