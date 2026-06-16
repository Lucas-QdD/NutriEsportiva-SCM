import Vlibras from '../components/Vlibras';
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
import { Snackbar } from 'react-native-paper';
import { usarDados } from '../contextos/ContextoDados';
import { usarAutenticacao } from '../contextos/ContextoAutenticacao';
import { usarTema } from '../contextos/ContextoTema';

const OPCOES_SUOR = ['Leve', 'Moderada', 'Intensa'];
const OPCOES_SAL = ['Nenhuma', 'Pouca', 'Moderada', 'Muita'];

const TelaAvaliacao = ({ route }) => {
  const { 
    adicionarAvaliacao, 
    editarAvaliacao, 
    deletarAvaliacao, 
    avaliacoes, 
    obterAvaliacoesPorUsuario, 
    avaliacaoVazia 
  } = usarDados();
  
  const { usuario } = usarAutenticacao();
  const { temaTemaEscuro } = usarTema();

  const [dadosFormulario, setDadosFormulario] = useState(avaliacaoVazia);
  const [resultadoCalculado, setResultadoCalculado] = useState({
    sweatRate: 0,
    perdaPesoPercent: 0,
    statusHidratacao: 'Aguardando dados...',
    recomendacao: ''
  });

  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false); 
  const [modoVisualizacaoOnly, setModoVisualizacaoOnly] = useState(false);

  const ehAtleta = usuario?.role === 'ATHLETE';
  const nomeAtletaSelecionado = route.params?.atletaNome || route.params?.atleta?.nome || "";
  const nomeDoUsuario = usuario?.name || usuario?.nome;

  const avaliacoesDousesuario = (obterAvaliacoesPorUsuario(nomeDoUsuario) || []).filter(
    (av) => av.nutricionistaResponsavel === nomeDoUsuario || (ehAtleta && av.atletaNome === nomeDoUsuario)
  );

  useEffect(() => {
    const pre = parseFloat(dadosFormulario.preWeightKg);
    const pos = parseFloat(dadosFormulario.postWeightKg);
    const duracao = parseFloat(dadosFormulario.durationMin);
    const líquidos = parseFloat(dadosFormulario.fluidIntakeLiters) || 0;
    const urina = parseFloat(dadosFormulario.urineVolumeLiters) || 0;

    if (pre && pos && duracao && duracao > 0) {
      const horas = duracao / 60;
      const taxaSuor = ((pre - pos) + líquidos - urina) / horas;
      const perdaPercent = ((pre - pos) / pre) * 100;

      let status = 'Hidratado';
      let rec = 'Manter a estratégia atual de hidratação.';

      if (perdaPercent >= 2) {
        status = 'Desidratado';
        rec = 'Atenção Perda drástica de fluido detectada. Aumentar o consumo de água/isotônicos durante a sessão.';
      } else if (perdaPercent < 0) {
        status = 'Hiperidratado';
        rec = 'Reduzir o consumo excessivo de água livre para evitar riscos de hiponatremia.';
      }

      setResultadoCalculado({
        sweatRate: taxaSuor.toFixed(2),
        perdaPesoPercent: perdaPercent.toFixed(1),
        statusHidratacao: status,
        recomendacao: rec
      });
    } else {
      setResultadoCalculado({
        sweatRate: 0,
        perdaPesoPercent: 0,
        statusHidratacao: 'Aguardando dados...',
        recomendacao: ''
      });
    }
  }, [dadosFormulario.preWeightKg, dadosFormulario.postWeightKg, dadosFormulario.durationMin, dadosFormulario.fluidIntakeLiters, dadosFormulario.urineVolumeLiters]);

  useEffect(() => {
    if (route.params?.id) {
      const avaliacaoEncontrada = avaliacoes.find(a => a.id === route.params.id);
      if (avaliacaoEncontrada) {
        setDadosFormulario(avaliacaoEncontrada);
        setModoEdicao(false);
        setModoVisualizacaoOnly(true);
        setMostrarModal(true);
      }
    } else if (route.params?.abrirFormulario) {
      resetFormulario();
      setModoEdicao(false);
      setModoVisualizacaoOnly(false);
      setMostrarModal(true);
    }
  }, [route.params?.id, route.params?.abrirFormulario, avaliacoes]);

  const resetFormulario = () => {
    setDadosFormulario({
      data: new Date().toLocaleDateString('pt-BR'),
      durationMin: '',
      preWeightKg: '',
      postWeightKg: '',
      fluidIntakeLiters: '0',
      urineVolumeLiters: '0',
      suor: '',
      sal: '',
      sintomas: '',
      temperatureC: '',
      humidityPercent: '',
    });
    setErro('');
  };

  const abrirParaVisualizar = (item) => {
    setDadosFormulario(item);
    setModoEdicao(false);
    setModoVisualizacaoOnly(true);
    setMostrarModal(true);
  };

  const abrirParaEdicao = (item) => {
    setDadosFormulario(item);
    setModoEdicao(true);
    setModoVisualizacaoOnly(false);
    setMostrarModal(true);
  };

  const tratarEnvio = () => {
    const nomeFinal = ehAtleta ? nomeDoUsuario : (dadosFormulario.atletaNome?.trim() || nomeAtletaSelecionado || "Geral");

    if (!dadosFormulario.data || !dadosFormulario.preWeightKg || !dadosFormulario.postWeightKg || !dadosFormulario.durationMin) {
      setErro('Preencha os campos obrigatórios (Data, Duração, Peso Pré e Peso Pós)');
      return;
    }

    const avaliacaoCompleta = {
      ...dadosFormulario,
      ...resultadoCalculado,
      atletaNome: nomeFinal,
      nutricionistaResponsavel: ehAtleta ? "Autoavaliação" : nomeDoUsuario
    };

    if (modoEdicao) {
      if (editarAvaliacao) editarAvaliacao(dadosFormulario.id, avaliacaoCompleta);
      Alert.alert('Sucesso', 'Avaliação atualizada com sucesso!');
    } else {
      adicionarAvaliacao(avaliacaoCompleta, nomeDoUsuario);
      Alert.alert('Sucesso', 'Avaliação registrada!');
    }
    
    setMostrarModal(false);
    setModoEdicao(false);
    setModoVisualizacaoOnly(false);
    setMensagem(modoEdicao ? 'Avaliação atualizada.' : 'Avaliação registrada.');
    setTimeout(() => setMensagem(''), 3000);
  };

  const tratarExclusao = (id) => {
    const dispararDeletar = () => {
      if (deletarAvaliacao) deletarAvaliacao(id);
      setMensagem('Avaliação removida com sucesso.');
      setTimeout(() => setMensagem(''), 3000);
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Deseja realmente apagar este registro permanentemente?')) {
        dispararDeletar();
      }
    } else {
      Alert.alert(
        'Remover Registro',
        'Deseja realmente apagar este registro permanentemente?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Excluir', onPress: dispararDeletar, style: 'destructive' }
        ]
      );
    }
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
    fundoDestaque: temaTemaEscuro ? '#2d1f22' : '#fef2f2',
    verdeSucesso: '#10b981',
    cinzaBotao: temaTemaEscuro ? '#374151' : '#4b5563',
  };

  const estilos = StyleSheet.create({
    conteiner: { flex: 1, backgroundColor: cores.fundoApp },
    cabecalho: { backgroundColor: cores.fundoCabecalho, paddingVertical: 20, paddingHorizontal: 30, borderBottomWidth: 1, borderBottomColor: cores.bordaCabecalho },
    tituloCabecalho: { fontSize: 24, color: cores.textoPrincipal, fontWeight: 'bold' },
    conteudo: { flex: 1, padding: 30 },
    secao: { marginBottom: 30 },
    cabecalhoSecao: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    tituloSecao: { fontSize: 18, fontWeight: 'bold', color: cores.textoPrincipal },
    cartaoAvaliacao: { backgroundColor: cores.fundoCartao, borderRadius: 10, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: cores.bordaCartao, flexDirection: 'column' },
    infoAvaliacao: { marginBottom: 12 },
    nomeAvaliacao: { fontSize: 16, fontWeight: '600', color: cores.textoPrincipal, marginBottom: 4 },
    dataAvaliacao: { fontSize: 14, color: cores.textoSecundario, marginBottom: 2 },
    pesoAvaliacao: { fontSize: 14, color: cores.textoSecundario, fontWeight: '500' },
    
    acoesCard: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, borderTopWidth: 1, borderTopColor: cores.bordaCartao, paddingTop: 10 },
    botaoAcaoCard: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    botaoCardVer: { backgroundColor: cores.verdeSucesso },
    botaoCardEditar: { backgroundColor: cores.cinzaBotao },
    botaoCardDeletar: { backgroundColor: cores.vermelhoPadrao },
    textoBotaoCard: { color: '#ffffff', fontSize: 13, fontWeight: '600' },

    textoVazio: { textAlign: 'center', color: cores.textoSecundario, padding: 40, fontSize: 16 },
    botaoNavegacao: { backgroundColor: cores.vermelhoPadrao, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10, alignItems: 'center', marginBottom: 16 },
    textoBotaoNavegacao: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
    modalFundo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 16 },
    modalConteudo: { backgroundColor: cores.fundoModal, borderRadius: 16, padding: 20, maxHeight: '90%' },
    tituloModal: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: cores.textoPrincipal, textAlign: 'center' },
    rotulo: { fontSize: 14, fontWeight: '600', color: cores.textoPrincipal, marginBottom: 4, marginTop: 8},
    entradaFormulario: { backgroundColor: cores.fundoInput, borderWidth: 1.5, borderColor: cores.bordaInput, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, fontSize: 15, color: cores.textoInput, marginBottom: 8 },
    areaTexto: { backgroundColor: cores.fundoInput, borderWidth: 1.5, borderColor: cores.bordaInput, borderRadius: 10, paddingHorizontal: 14, paddingTop: 10, fontSize: 15, color: cores.textoInput, marginBottom: 8, minHeight: 60, textAlignVertical: 'top' },
    conteinerOpcoes: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 6, marginBottom: 6 },
    botaoOpcao: { width: '48%', paddingVertical: 10, borderWidth: 1.5, borderColor: cores.bordaOpcao, borderRadius: 10, backgroundColor: cores.fundoInput, alignItems: 'center' },
    botaoOpcaoSelecionado: { borderColor: cores.vermelhoPadrao, backgroundColor: 'rgba(196, 30, 58, 0.08)' },
    textoOpcao: { fontSize: 13, fontWeight: '600', color: cores.textoSecundario },
    textoOpcaoSelecionado: { color: cores.vermelhoPadrao },
    caixaCalculo: { backgroundColor: cores.fundoDestaque, borderRadius: 10, padding: 14, marginVertical: 12, borderWidth: 1, borderColor: cores.vermelhoPadrao },
    tituloCalculo: { fontSize: 15, fontWeight: 'bold', color: cores.vermelhoPadrao, marginBottom: 6 },
    textoCalculo: { fontSize: 14, color: cores.textoPrincipal, marginBottom: 2 },
    caixaErro: { backgroundColor: '#fee2e2', padding: 12, borderRadius: 8, marginBottom: 12 },
    textoErro: { color: '#dc2626', fontSize: 14 },
    
    acoesFormulario: { flexDirection: 'row', gap: 12, marginTop: 16 },
    botaoCancelarForm: { flex: 1, backgroundColor: cores.cinzaBotao, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
    botaoSalvarForm: { flex: 1, backgroundColor: cores.vermelhoPadrao, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
    textoBotaoForm: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  });

  const inputsLiberados = !modoVisualizacaoOnly || modoEdicao;

  return (
    <View style={estilos.conteiner}>
      <View style={estilos.cabecalho}>
        <Text style={estilos.tituloCabecalho}>Controle de Hidratação</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={estilos.conteudo}>
          <View style={estilos.secao}>
            <TouchableOpacity style={estilos.botaoNavegacao} onPress={() => { resetFormulario(); setModoEdicao(false); setModoVisualizacaoOnly(false); setMostrarModal(true); }}>
              <Text style={estilos.textoBotaoNavegacao}>Nova Avaliação de Sudorese</Text>
            </TouchableOpacity>
          </View>

          <View style={estilos.secao}>
            <View style={estilos.cabecalhoSecao}>
              <Text style={estilos.tituloSecao}>Histórico Técnico</Text>
            </View>

            {avaliacoesDousesuario.length === 0 ? (
              <Text style={estilos.textoVazio}>Nenhuma avaliação registrada</Text>
            ) : (
              avaliacoesDousesuario.map((item) => (
                <View key={item.id} style={estilos.cartaoAvaliacao}>
                  <View style={estilos.infoAvaliacao}>
                    <Text 
                      style={[
                        { fontWeight: 'bold' },
                        item.statusHidratacao === 'Desidratado' && { color: '#dc2626' },
                        item.statusHidratacao === 'Hiperidratado' && { color: '#eab308' },
                        item.statusHidratacao === 'Hidratado' && { color: '#10b981' }
                      ]}
                    >
                      {item.statusHidratacao} ({item.perdaPesoPercent}%)
                    </Text>
                    <Text style={estilos.dataAvaliacao}>Data {item.data} · Atleta {item.atletaNome}</Text>
                    <Text style={estilos.pesoAvaliacao}>Taxa de Suor {item.sweatRate} L/h</Text>
                  </View>
                  
                  <View style={estilos.acoesCard}>
                    <TouchableOpacity
                      style={[estilos.botaoAcaoCard, estilos.botaoCardVer]}
                      onPress={() => abrirParaVisualizar(item)}
                    >
                      <Text style={estilos.textoBotaoCard}>Ver</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[estilos.botaoAcaoCard, estilos.botaoCardEditar]}
                      onPress={() => abrirParaEdicao(item)}
                    >
                      <Text style={estilos.textoBotaoCard}>Editar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[estilos.botaoAcaoCard, estilos.botaoCardDeletar]}
                      onPress={() => tratarExclusao(item.id)}
                    >
                      <Text style={estilos.textoBotaoCard}>Excluir</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      <Modal visible={mostrarModal} onRequestClose={() => setMostrarModal(false)} transparent={true} animationType="slide">
        <View style={estilos.modalFundo}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={estilos.modalConteudo}>
            <Text style={estilos.tituloModal}>
              {modoEdicao ? 'Editar Registro Técnico' : modoVisualizacaoOnly ? 'Ficha Técnica (Apenas Leitura)' : 'Nova Coleta Hidroeletrolítica'}
            </Text>

            {!ehAtleta && (
              <View>
                <Text style={estilos.rotulo}>Atleta *</Text>
                <TextInput
                  value={dadosFormulario.atletaNome || nomeAtletaSelecionado}
                  editable={!nomeAtletaSelecionado && inputsLiberados}
                  onChangeText={(texto) => setDadosFormulario({ ...dadosFormulario, atletaNome: texto })}
                  style={estilos.entradaFormulario}
                  placeholder="Nome do atleta"
                  placeholderTextColor={cores.textoSecundario}
                />
              </View>
            )}
            
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              
              <Vlibras 
                tituloBotao="Ajuda com a Pesagem em LIBRAS" 
                texto="Por favor, insira sua massa corporal exata e dados de hidratação para o cálculo de sudorese" 
              />

              <Text style={estilos.rotulo}>Data *</Text>
              <TextInput value={dadosFormulario.data} editable={inputsLiberados} onChangeText={(texto) => setDadosFormulario({ ...dadosFormulario, data: texto })} style={estilos.entradaFormulario} />

              <Text style={estilos.rotulo}>Duração do Treino (Minutos) *</Text>
              <TextInput keyboardType="numeric" value={String(dadosFormulario.durationMin || '')} editable={inputsLiberados} onChangeText={(texto) => setDadosFormulario({ ...dadosFormulario, durationMin: texto })} style={estilos.entradaFormulario} placeholder="Ex 60" placeholderTextColor={cores.textoSecundario} />

              <View style={{flexDirection: 'row', justifyContent:'space-between'}}>
                <View style={{width: '48%'}}>
                  <Text style={estilos.rotulo}>Peso Pré (kg) *</Text>
                  <TextInput keyboardType="numeric" value={String(dadosFormulario.preWeightKg || '')} editable={inputsLiberados} onChangeText={(texto) => setDadosFormulario({ ...dadosFormulario, preWeightKg: texto })} style={estilos.entradaFormulario} placeholder="75.0" placeholderTextColor={cores.textoSecundario} />
                </View>
                <View style={{width: '48%'}}>
                  <Text style={estilos.rotulo}>Peso Pós (kg) *</Text>
                  <TextInput keyboardType="numeric" value={String(dadosFormulario.postWeightKg || '')} editable={inputsLiberados} onChangeText={(texto) => setDadosFormulario({ ...dadosFormulario, postWeightKg: texto })} style={estilos.entradaFormulario} placeholder="73.8" placeholderTextColor={cores.textoSecundario} />
                </View>
              </View>

              <View style={{flexDirection: 'row', justifyContent:'space-between'}}>
                <View style={{width: '48%'}}>
                  <Text style={estilos.rotulo}>Líquidos Ingeridos (L)</Text>
                  <TextInput keyboardType="numeric" value={String(dadosFormulario.fluidIntakeLiters ?? '0')} editable={inputsLiberados} onChangeText={(texto) => setDadosFormulario({ ...dadosFormulario, fluidIntakeLiters: texto })} style={estilos.entradaFormulario} />
                </View>
                <View style={{width: '48%'}}>
                  <Text style={estilos.rotulo}>Volume de Urina (L)</Text>
                  <TextInput keyboardType="numeric" value={String(dadosFormulario.urineVolumeLiters ?? '0')} editable={inputsLiberados} onChangeText={(texto) => setDadosFormulario({ ...dadosFormulario, urineVolumeLiters: texto })} style={estilos.entradaFormulario} />
                </View>
              </View>

              <View style={estilos.caixaCalculo}>
                <Text style={estilos.tituloCalculo}>📊 Resultados Calculados</Text>
                <Text style={estilos.textoCalculo}>Taxa de Sudorese <Text style={{fontWeight: 'bold'}}>{resultadoCalculado.sweatRate} Litros/hora</Text></Text>
                <Text style={estilos.textoCalculo}>Perda de Peso Corpóreo {resultadoCalculado.perdaPesoPercent}%</Text>
                <Text style={estilos.textoCalculo}>Estado Clínico {resultadoCalculado.statusHidratacao}</Text>
                {resultadoCalculado.recomendacao ? <Text style={[estilos.textoCalculo, {marginTop: 6, fontStyle: 'italic', fontSize: 13}]}>Obs {resultadoCalculado.recomendacao}</Text> : null}
              </View>

              <Text style={estilos.rotulo}>Sudoração Percebida</Text>
              <View style={estilos.conteinerOpcoes}>
                {OPCOES_SUOR.map((o) => (
                  <TouchableOpacity key={o} style={[estilos.botaoOpcao, dadosFormulario.suor === o && estilos.botaoOpcaoSelecionado]} disabled={!inputsLiberados} onPress={() => setDadosFormulario({ ...dadosFormulario, suor: o })}>
                    <Text style={[estilos.textoOpcao, dadosFormulario.suor === o && estilos.textoOpcaoSelecionado]}>{o}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={estilos.rotulo}>Sintomas Percebidos</Text>
              <TextInput value={dadosFormulario.sintomas} editable={inputsLiberados} onChangeText={(texto) => setDadosFormulario({ ...dadosFormulario, sintomas: texto })} placeholder="Ex Cãibras, sede excessiva" placeholderTextColor={cores.textoSecundario} style={estilos.areaTexto} multiline />

              {erro ? <View style={estilos.caixaErro}><Text style={estilos.textoErro}>{erro}</Text></View> : null}

              <View style={estilos.acoesFormulario}>
                <TouchableOpacity style={estilos.botaoCancelarForm} onPress={() => setMostrarModal(false)}>
                  <Text style={estilos.textoBotaoForm}>{modoVisualizacaoOnly ? 'Fechar' : 'Cancelar'}</Text>
                </TouchableOpacity>
                {inputsLiberados && (
                  <TouchableOpacity style={estilos.botaoSalvarForm} onPress={tratarEnvio}>
                    <Text style={estilos.textoBotaoForm}>{modoEdicao ? 'Salvar Alterações' : 'Salvar Registro'}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <Snackbar visible={!!mensagem} onDismiss={() => setMensagem('')} style={{ backgroundColor: '#10b981' }}>{mensagem}</Snackbar>
    </View>
  );
};

export default TelaAvaliacao;