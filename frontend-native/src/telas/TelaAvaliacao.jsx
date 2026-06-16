import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { StyleSheet, View, FlatList, Alert, Modal, TouchableOpacity, Text, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as Location from 'expo-location';
import { usarDados } from '../contextos/ContextoDados';
import { usarAutenticacao } from '../contextos/ContextoAutenticacao';
import { usarTema } from '../contextos/ContextoTema';
import { api } from '../services/api';

const MAPA_STATUS = {
  OVER: { texto: 'Hiperidratado (Excesso de Fluidos)', color: '#3b82f6' },
  GOOD: { texto: 'Hidratado (Adequado)', color: '#10b981' },
  MODERATE: { texto: 'Desidratação Moderada (Alerta)', color: '#eab308' },
  POOR: { texto: 'Desidratação Crítica (Perigo)', color: '#dc2626' }
};

const obterDataHojeBR = () => {
  const hoje = new Date();
  const dia = String(hoje.getDate()).padStart(2, '0');
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  const ano = hoje.getFullYear();
  return `${dia}/${mes}/${ano}`;
};

const converterBRParaISO = (dataBR) => {
  try {
    const [dia, mes, ano] = dataBR.split('/');
    const dataConstruida = new Date(parseInt(ano, 10), parseInt(mes, 10) - 1, parseInt(dia, 10), 12, 0, 0);
    return dataConstruida.toISOString();
  } catch (e) {
    return new Date().toISOString();
  }
};

const TelaAvaliacao = () => {
  const contextoDados = usarDados();
  const { usuario } = usarAutenticacao();
  const { temaTemaEscuro } = usarTema();
  
  const adicionarAvaliacao = contextoDados?.adicionarAvaliacao;
  const deletarAvaliacao = contextoDados?.deletarAvaliacao;
  const obterAvaliacoesPorUsuario = contextoDados?.obterAvaliacoesPorUsuario;
  const atualizarHistorico = contextoDados?.atualizarHistorico;
  const avaliacoes = contextoDados?.avaliacoes || [];

  const [dadosFormulario, setDadosFormulario] = useState({
    pesoInicial: '', pesoFinal: '', liquidoIngerido: '', durationMin: '', athleteId: '', temperatureC: '', humidityPercent: '', symptoms: '', sessionDateBR: obterDataHojeBR()
  });

  const [resultadoCalculado, setResultadoCalculado] = useState({
    sweatRateLitersHour: '0.00', waterLossLiters: '0.00', dehydrationPercent: '0.0', rehydrationNeedLiters: '0.00', hydrationStatus: 'GOOD'
  });
  
  const [erro, setErro] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [buscandoClima, setBuscandoClima] = useState(false);
  const [listaAtletasBanco, setListaAtletasBanco] = useState([]);
  const [idSessaoEditando, setIdSessaoEditando] = useState(null);
  const [modoVisualizacao, setModoVisualizacao] = useState(false);

  const ehAtleta = usuario?.role === 'ATHLETE';

  const carregarAtletasDoProfissional = useCallback(async () => {
    if (ehAtleta) return;
    try {
      const dados = await api.get('/professional-athletes');
      const filtrados = (dados || []).map(l => l.athlete).filter(Boolean);
      setListaAtletasBanco(filtrados);
      
      if (filtrados.length > 0 && !dadosFormulario.athleteId) {
        setDadosFormulario(prev => ({ ...prev, athleteId: filtrados[0].id }));
      }
    } catch (e) {
      console.log('Erro ao sincronizar atletas vinculados.');
    }
  }, [ehAtleta, dadosFormulario.athleteId]);

  useFocusEffect(
    useCallback(() => {
      if (atualizarHistorico) {
        atualizarHistorico();
      }
      carregarAtletasDoProfissional();
    }, [atualizarHistorico, carregarAtletasDoProfissional])
  );

  const idFiltragemSessao = ehAtleta ? usuario?.id : dadosFormulario.athleteId;

  const listaSessoes = useMemo(() => {
    if (!Array.isArray(avaliacoes)) return [];
    
    if (idFiltragemSessao) {
      if (contextoDados?.obterAvaliacoesPorUsuario) {
        return contextoDados.obterAvaliacoesPorUsuario(idFiltragemSessao);
      }
      return avaliacoes.filter(item => 
        item && (
          item.athleteId === idFiltragemSessao || 
          item.athleteProfileId === idFiltragemSessao || 
          item.athlete?.id === idFiltragemSessao
        )
      );
    }
    return avaliacoes;
  }, [avaliacoes, idFiltragemSessao, contextoDados, ehAtleta]);

  const buscarDadosClimaticos = async () => {
    if (idSessaoEditando || modoVisualizacao) return;
    setBuscandoClima(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      
      const localizacao = await Location.getCurrentPositionAsync({});
      const resposta = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${localizacao.coords.latitude}&longitude=${localizacao.coords.longitude}&current=temperature_2m,relative_humidity_2m`
      );
      const dadosClima = await resposta.json();
      if (dadosClima?.current) {
        setDadosFormulario(anterior => ({
          ...anterior,
          temperatureC: String(Math.round(dadosClima.current.temperature_2m)),
          humidityPercent: String(dadosClima.current.relative_humidity_2m)
        }));
      }
    } catch (e) {
      console.log('Sem internet para meteorologia.');
    } finally {
      setBuscandoClima(false);
    }
  };

  useEffect(() => {
    if (mostrarModal) {
      buscarDadosClimaticos();
      if (!ehAtleta) {
        api.get('/professional-athletes')
          .then(dados => {
            const filtrados = (dados || []).map(l => l.athlete).filter(Boolean);
            setListaAtletasBanco(filtrados);
          })
          .catch(() => setListaAtletasBanco([]));
      }
    }
  }, [mostrarModal]);

  useEffect(() => {
    const pInicial = parseFloat(dadosFormulario.pesoInicial);
    const pFinal = parseFloat(dadosFormulario.pesoFinal);
    const duracaoMin = parseFloat(dadosFormulario.durationMin);
    const liqIngerido = parseFloat(dadosFormulario.liquidoIngerido) || 0;
    
    if (!isNaN(pInicial) && !isNaN(pFinal) && !isNaN(duracaoMin) && duracaoMin > 0) {
      const horas = duracaoMin / 60;
      const perdaHidrica = (pInicial - pFinal) + liqIngerido;
      const taxaSudorese = perdaHidrica / horas;
      const variacaoPesoBalanca = pInicial - pFinal;
      const percentualDesidratacao = (variacaoPesoBalanca / pInicial) * 100;
      const reposicaoPosTreino = variacaoPesoBalanca * 1.5;

      let status = 'GOOD';
      if (percentualDesidratacao < 0) {
        status = 'OVER';
      } else if (percentualDesidratacao >= 2.0 && percentualDesidratacao < 5.0) {
        status = 'MODERATE';
      } else if (percentualDesidratacao >= 5.0) {
        status = 'POOR';
      }

      setResultadoCalculado({
        sweatRateLitersHour: taxaSudorese.toFixed(2),
        waterLossLiters: perdaHidrica.toFixed(2),
        dehydrationPercent: percentualDesidratacao.toFixed(1),
        rehydrationNeedLiters: reposicaoPosTreino > 0 ? reposicaoPosTreino.toFixed(2) : '0.00',
        hydrationStatus: status
      });
    } else {
      setResultadoCalculado({
        sweatRateLitersHour: '0.00', waterLossLiters: '0.00', dehydrationPercent: '0.0', rehydrationNeedLiters: '0.00', hydrationStatus: 'GOOD'
      });
    }
  }, [dadosFormulario.pesoInicial, dadosFormulario.pesoFinal, dadosFormulario.durationMin, dadosFormulario.liquidoIngerido]);

  const extrairDadosParaModal = (sessao) => {
    const sessaoReal = avaliacoes.find(av => av.id === sessao.id) || sessao;
    let dataFormatada = obterDataHojeBR();
    
    if (sessaoReal.sessionDate) {
      const d = new Date(sessaoReal.sessionDate);
      dataFormatada = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    }

    const pInicial = sessaoReal.pesoInicial || sessaoReal.preWeightKg || sessaoReal.hydrationRecord?.preWeightKg || '';
    const pFinal = sessaoReal.pesoFinal || sessaoReal.postWeightKg || sessaoReal.hydrationRecord?.postWeightKg || '';
    const liqIngerido = sessaoReal.liquidoIngerido !== undefined ? sessaoReal.liquidoIngerido : (sessaoReal.fluidIntakeLiters || sessaoReal.hydrationRecord?.fluidIntakeLiters || '0');
    const duracao = sessaoReal.durationMin || '';
    const temp = sessaoReal.temperatureC || '';
    const hum = sessaoReal.humidityPercent || '';
    const sint = sessaoReal.symptoms || '';
    const atletaId = sessaoReal.athleteId || sessaoReal.athlete?.id || '';

    setDadosFormulario({
      pesoInicial: pInicial ? String(pInicial) : '',
      pesoFinal: pFinal ? String(pFinal) : '',
      liquidoIngerido: liqIngerido ? String(liqIngerido) : '0',
      durationMin: duracao ? String(duracao) : '',
      athleteId: atletaId,
      temperatureC: temp && temp !== 'null' ? String(temp) : '',
      humidityPercent: hum && hum !== 'null' ? String(hum) : '',
      symptoms: sint && sint !== 'null' ? String(sint) : '',
      sessionDateBR: dataFormatada
    });
  };

  const iniciarVisualizacaoPura = (sessao) => {
    setModoVisualizacao(true);
    setIdSessaoEditando(null);
    extrairDadosParaModal(sessao);
    setMostrarModal(true);
  };

  const iniciarEdicaoAvaliacao = (sessao) => {
    setModoVisualizacao(false);
    setIdSessaoEditando(sessao.id);
    extrairDadosParaModal(sessao);
    setMostrarModal(true);
  };

  const tratarEnvio = async () => {
    if (modoVisualizacao) return;

    const idAtletaFinal = ehAtleta ? usuario?.id : dadosFormulario.athleteId;
    if (!idAtletaFinal && !ehAtleta) {
      setErro('Por favor, selecione um atleta.');
      return;
    }
    if (!dadosFormulario.pesoInicial || !dadosFormulario.pesoFinal || !dadosFormulario.durationMin) {
      setErro('Campos obrigatórios vazios.');
      return;
    }

    const regexData = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!regexData.test(dadosFormulario.sessionDateBR)) {
      setErro('Formato de data inválido. Use DD/MM/AAAA.');
      return;
    }

    try {
      setErro('');
      const dataFormatadaISO = converterBRParaISO(dadosFormulario.sessionDateBR);
      
      if (idSessaoEditando && deletarAvaliacao) {
        await deletarAvaliacao(idSessaoEditando);
      }

      if (adicionarAvaliacao) {
        await adicionarAvaliacao({
          ...dadosFormulario,
          athleteId: idAtletaFinal,
          teamId: usuario?.teamId || 'team_123',
          sessionDate: dataFormatadaISO
        });
      }

      setMostrarModal(false);
      setIdSessaoEditando(null);
      setDadosFormulario({
        pesoInicial: '', pesoFinal: '', liquidoIngerido: '', durationMin: '', athleteId: idAtletaFinal, temperatureC: '', humidityPercent: '', symptoms: '', sessionDateBR: obterDataHojeBR()
      });
      Alert.alert('Sucesso', idSessaoEditando ? 'Coleta modificada com sucesso!' : 'Coleta hídrica registrada e sincronizada!');
    } catch (e) {
      setErro(e.message || 'Falha na persistência relacional.');
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
    fundoInputLeitura: temaTemaEscuro ? '#1a1a1a' : '#e5e7eb',
    textoInput: temaTemaEscuro ? '#ffffff' : '#000000',
    bordaInput: temaTemaEscuro ? '#404040' : '#d1d5db',
    fundoModal: temaTemaEscuro ? '#1e1e1e' : '#ffffff',
    vermelhoPadrao: '#c41e3a',
    cinzaEdicao: '#6b7280',
    verdeVer: '#10b981',
    fundoDestaque: temaTemaEscuro ? '#2a1a1c' : '#fef2f2'
  };

  const estilos = StyleSheet.create({
    conteiner: { flex: 1, backgroundColor: cores.fundoApp },
    cabecalho: { backgroundColor: cores.fundoCabecalho, paddingVertical: 20, paddingHorizontal: 30, borderBottomWidth: 1, borderBottomColor: cores.bordaCabecalho },
    tituloCabecalho: { fontSize: 24, color: cores.textoPrincipal, fontWeight: 'bold' },
    conteudo: { padding: 24 },
    tituloSecao: { fontSize: 22, fontWeight: '700', color: cores.textoPrincipal, marginBottom: 16, marginTop: 12 },
    cartaoAvaliacao: { backgroundColor: cores.fundoCartao, borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: cores.bordaCartao, flexDirection: 'column', alignItems: 'stretch' },
    botaoNavegacao: { backgroundColor: cores.vermelhoPadrao, paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginBottom: 16 },
    modalFundo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 16 },
    modalConteudo: { backgroundColor: cores.fundoModal, borderRadius: 16, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 16, width: '100%', maxWidth: 440, height: '88%' },
    tituloModal: { fontSize: 20, fontWeight: 'bold', marginBottom: 14, color: cores.textoPrincipal, textAlign: 'center' },
    rotulo: { fontSize: 13, fontWeight: '600', color: cores.textoPrincipal, marginBottom: 4, marginTop: 8 },
    entradaFormulario: { backgroundColor: cores.fundoInput, borderWidth: 1, borderColor: cores.bordaInput, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, color: cores.textoInput, marginBottom: 4 },
    entradaFormularioBloqueada: { backgroundColor: cores.fundoInputLeitura, borderWidth: 1, borderColor: cores.bordaInput, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, color: cores.textoSecundario, marginBottom: 4 },
    linhaFormulario: { flexDirection: 'row', justifyContent: 'space-between' },
    colunaMetade: { width: '48%' },
    caixaCalculo: { backgroundColor: cores.fundoDestaque, borderRadius: 10, padding: 16, marginVertical: 12, borderWidth: 1, borderColor: cores.vermelhoPadrao },
    chipAtleta: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: cores.bordaInput, backgroundColor: cores.fundoInput, marginRight: 6, marginBottom: 6 },
    chipAtletaAtivo: { borderColor: cores.vermelhoPadrao, backgroundColor: 'rgba(196, 30, 58, 0.08)' },
    chipAtletaDesativado: { opacity: 0.6, borderColor: cores.bordaInput },
    conteinerBotoesCard: { flexDirection: 'row', gap: 8, justifyContent: 'flex-end', marginTop: 12, borderTopWidth: 1, borderTopColor: cores.bordaCartao, paddingTop: 10 }
  });

  // Cabeçalho da Lista (Chips + Botão + Título do Histórico) para não quebrar o gesto do ScrollView nativo
  const renderHeader = () => (
    <View>
      {!ehAtleta && listaAtletasBanco.length > 0 && (
        <View style={{ marginBottom: 12 }}>
          <Text style={[estilos.rotulo, { marginTop: 0 }]}>Filtrar por Atleta:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row', marginTop: 6 }}>
            {listaAtletasBanco.map((atl) => {
              const ativo = dadosFormulario.athleteId === atl.id;
              return (
                <TouchableOpacity
                  key={atl.id}
                  style={[estilos.chipAtleta, ativo && estilos.chipAtletaAtivo]}
                  onPress={() => setDadosFormulario({ ...dadosFormulario, athleteId: atl.id })}
                >
                  <Text style={{ color: ativo ? cores.vermelhoPadrao : cores.textoInput, fontWeight: ativo ? 'bold' : 'normal' }}>
                    {atl.name || 'Atleta'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      <TouchableOpacity 
        style={estilos.botaoNavegacao} 
        onPress={() => { 
          setDadosFormulario({ pesoInicial: '', pesoFinal: '', liquidoIngerido: '', durationMin: '', athleteId: dadosFormulario.athleteId, temperatureC: '', humidityPercent: '', symptoms: '', sessionDateBR: obterDataHojeBR() }); 
          setIdSessaoEditando(null); 
          setModoVisualizacao(false); 
          setMostrarModal(true); 
        }}
      >
        <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 16 }}>Nova Avaliação de Sudorese</Text>
      </TouchableOpacity>

      <Text style={estilos.tituloSecao}>Histórico Técnico</Text>
    </View>
  );

  // Renderizador de cada item (card) do histórico
  const renderItemSessao = ({ item, index }) => {
    if (!item) return null;
    const pInicial = parseFloat(item.pesoInicial || item.preWeightKg || item.hydrationRecord?.preWeightKg || 0);
    const pFinal = parseFloat(item.pesoFinal || item.postWeightKg || item.hydrationRecord?.postWeightKg || 0);
    const taxaSuor = item.result?.sweatRateLitersHour || item.sweatRateLitersHour || 0;
    
    let statusId = 'GOOD';
    if (pInicial && pFinal) {
      const percentual = ((pInicial - pFinal) / pInicial) * 100;
      if (percentual < 0) statusId = 'OVER';
      else if (percentual >= 2.0 && percentual < 5.0) statusId = 'MODERATE';
      else if (percentual >= 5.0) statusId = 'POOR';
    }

    const configStatus = MAPA_STATUS[statusId] || MAPA_STATUS.GOOD;
    const dataExibicao = item.sessionDate ? new Date(item.sessionDate).toLocaleDateString('pt-BR') : obterDataHojeBR();
    
    return (
      <View style={estilos.cartaoAvaliacao}>
        <View style={{ width: '100%' }}>
          <Text style={{ fontWeight: 'bold', color: configStatus.color, fontSize: 15 }}>{configStatus.texto}</Text>
          <Text style={{ color: cores.textoPrincipal, fontSize: 13, marginTop: 4 }}>Atleta: {item.athleteName || item.athlete?.name || item.hydrationRecord?.athlete?.name || 'Atleta não identificado'}</Text>
          <Text style={{ color: cores.textoPrincipal, fontSize: 13, marginTop: 4 }}>Data: {dataExibicao}  |  Taxa: {parseFloat(taxaSuor).toFixed(2)} L/h</Text>
        </View>
        <View style={estilos.conteinerBotoesCard}>
          <TouchableOpacity style={{ backgroundColor: cores.verdeVer, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 6 }} onPress={() => iniciarVisualizacaoPura(item)}>
            <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: 'bold' }}>Ver</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ backgroundColor: cores.cinzaEdicao, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 6 }} onPress={() => iniciarEdicaoAvaliacao(item)}>
            <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: 'bold' }}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ backgroundColor: '#dc2626', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 6 }} onPress={() => deletarAvaliacao && deletarAvaliacao(item.id)}>
            <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: 'bold' }}>Excluir</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={estilos.conteiner}>
      <View style={estilos.cabecalho}><Text style={estilos.tituloCabecalho}>Controle de Hidratação</Text></View>
      
      {/* Mudança chave: FlatList gerenciando o scroll vertical principal da tela */}
      <FlatList
        data={listaSessoes}
        keyExtractor={(item, index) => item?.id ? String(item.id) : String(index)}
        contentContainerStyle={estilos.conteudo}
        ListHeaderComponent={renderHeader}
        renderItem={renderItemSessao}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', color: cores.textoSecundario, marginTop: 40 }}>
            Nenhuma coleta hídrica localizada para este atleta.
          </Text>
        }
      />

      <Modal visible={mostrarModal} transparent animationType="slide" onRequestClose={() => setMostrarModal(false)}>
        <View style={estilos.modalFundo}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={estilos.modalConteudo}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              <Text style={estilos.tituloModal}>{modoVisualizacao ? 'Visualizar Coleta Hidroeletrolítica' : idSessaoEditando ? 'Editar Coleta Hidroeletrolítica' : 'Nova Coleta Hidroeletrolítica'}</Text>
              
              {buscandoClima && !idSessaoEditando && !modoVisualizacao && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <ActivityIndicator size="small" color={cores.vermelhoPadrao} />
                  <Text style={{ color: cores.vermelhoPadrao, fontSize: 12, fontStyle: 'italic' }}>Capturando meteorologia via GPS...</Text>
                </View>
              )}

              {!ehAtleta && (
                <View style={{ marginBottom: 10 }}>
                  <Text style={estilos.rotulo}>Nome do Atleta</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row', marginTop: 6 }}>
                    {listaAtletasBanco.map((atl) => {
                      const idAtletaMapeado = atl.id;
                      const ativo = dadosFormulario.athleteId === idAtletaMapeado;
                      return (
                        <TouchableOpacity
                          key={atl.id}
                          disabled={modoVisualizacao}
                          style={[estilos.chipAtleta, ativo && estilos.chipAtletaAtivo, modoVisualizacao && estilos.chipAtletaDesativado]}
                          onPress={() => setDadosFormulario({ ...dadosFormulario, athleteId: idAtletaMapeado })}
                        >
                          <Text style={{ color: ativo ? cores.vermelhoPadrao : cores.textoInput, fontWeight: ativo ? 'bold' : 'normal' }}>
                            {atl.name || 'Atleta'}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              )}

              <Text style={estilos.rotulo}>Data da Avaliação (DD/MM/AAAA)</Text>
              <TextInput editable={!modoVisualizacao} value={dadosFormulario.sessionDateBR} onChangeText={(t) => setDadosFormulario({ ...dadosFormulario, sessionDateBR: t })} style={modoVisualizacao ? estilos.entradaFormularioBloqueada : estilos.entradaFormulario} placeholder="Ex: 15/06/2026" placeholderTextColor={cores.textoSecundario} maxLength={10} />
              
              <View style={estilos.linhaFormulario}>
                <View style={estilos.colunaMetade}><Text style={estilos.rotulo}>Peso Pré-Treino (kg)</Text><TextInput editable={!modoVisualizacao} value={dadosFormulario.pesoInicial} onChangeText={(t) => setDadosFormulario({ ...dadosFormulario, pesoInicial: t })} keyboardType="numeric" style={modoVisualizacao ? estilos.entradaFormularioBloqueada : estilos.entradaFormulario} placeholder="Ex: 80.2" placeholderTextColor={cores.textoSecundario} /></View>
                <View style={estilos.colunaMetade}><Text style={estilos.rotulo}>Peso Pós-Treino (kg)</Text><TextInput editable={!modoVisualizacao} value={dadosFormulario.pesoFinal} onChangeText={(t) => setDadosFormulario({ ...dadosFormulario, pesoFinal: t })} keyboardType="numeric" style={modoVisualizacao ? estilos.entradaFormularioBloqueada : estilos.entradaFormulario} placeholder="Ex: 78.9" placeholderTextColor={cores.textoSecundario} /></View>
              </View>

              <View style={estilos.linhaFormulario}>
                <View style={estilos.colunaMetade}><Text style={estilos.rotulo}>Líquidos Ingeridos (L)</Text><TextInput editable={!modoVisualizacao} value={dadosFormulario.liquidoIngerido} onChangeText={(t) => setDadosFormulario({ ...dadosFormulario, liquidoIngerido: t })} keyboardType="numeric" style={modoVisualizacao ? estilos.entradaFormularioBloqueada : estilos.entradaFormulario} placeholder="0.5" placeholderTextColor={cores.textoSecundario} /></View>
                <View style={estilos.colunaMetade}><Text style={estilos.rotulo}>Duração do Treino (Min)</Text><TextInput editable={!modoVisualizacao} value={dadosFormulario.durationMin} onChangeText={(t) => setDadosFormulario({ ...dadosFormulario, durationMin: t })} keyboardType="numeric" style={modoVisualizacao ? estilos.entradaFormularioBloqueada : estilos.entradaFormulario} placeholder="60" placeholderTextColor={cores.textoSecundario} /></View>
              </View>

              <View style={estilos.linhaFormulario}>
                <View style={estilos.colunaMetade}><Text style={estilos.rotulo}>Temperatura (°C)</Text><TextInput editable={!modoVisualizacao} value={dadosFormulario.temperatureC} onChangeText={(t) => setDadosFormulario({ ...dadosFormulario, temperatureC: t })} keyboardType="numeric" style={modoVisualizacao ? estilos.entradaFormularioBloqueada : estilos.entradaFormulario} placeholder="Graus" placeholderTextColor={cores.textoSecundario} /></View>
                <View style={estilos.colunaMetade}><Text style={estilos.rotulo}>Umidade Relativa (%)</Text><TextInput editable={!modoVisualizacao} value={dadosFormulario.humidityPercent} onChangeText={(t) => setDadosFormulario({ ...dadosFormulario, humidityPercent: t })} keyboardType="numeric" style={modoVisualizacao ? estilos.entradaFormularioBloqueada : estilos.entradaFormulario} placeholder="%" placeholderTextColor={cores.textoSecundario} /></View>
              </View>

              <Text style={estilos.rotulo}>Sintomas Clínicos Adicionais</Text>
              <TextInput editable={!modoVisualizacao} value={dadosFormulario.symptoms} onChangeText={(t) => setDadosFormulario({ ...dadosFormulario, symptoms: t })} style={modoVisualizacao ? estilos.entradaFormularioBloqueada : estilos.entradaFormulario} placeholder="Ex: Fadiga, sede extrema" placeholderTextColor={cores.textoSecundario} />

              <View style={estilos.caixaCalculo}>
                <Text style={{ fontWeight: 'bold', color: cores.vermelhoPadrao, marginBottom: 6 }}>Resultados Calculados</Text>
                <Text style={{ color: cores.textoPrincipal }}>Taxa de Sudorese: {resultadoCalculado.sweatRateLitersHour} L/h</Text>
                <Text style={{ color: cores.textoPrincipal }}>Perda de Peso Total: {resultadoCalculado.waterLossLiters} L</Text>
                <Text style={{ color: cores.textoPrincipal }}>Índice de Desidratação: {resultadoCalculado.dehydrationPercent}%</Text>
                <Text style={{ color: cores.textoPrincipal }}>Reposição Recomendada: {resultadoCalculado.rehydrationNeedLiters} L</Text>
                <Text style={{ color: MAPA_STATUS[resultadoCalculado.hydrationStatus]?.color, fontWeight: 'bold', marginTop: 6 }}>
                  Estado Clínico: {MAPA_STATUS[resultadoCalculado.hydrationStatus]?.texto}
                </Text>
              </View>

              {erro && !modoVisualizacao ? <Text style={{ color: '#dc2626', marginBottom: 10, fontWeight: '600' }}> {erro}</Text> : null}

              {modoVisualizacao ? (
                <View style={{ marginTop: 8 }}>
                  <TouchableOpacity style={{ backgroundColor: cores.verdeVer, padding: 14, borderRadius: 8, alignItems: 'center' }} onPress={() => setMostrarModal(false)}>
                    <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 16 }}>Fechar Ficha</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
                  <TouchableOpacity style={{ flex: 1, backgroundColor: 'transparent', padding: 14, borderRadius: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: cores.vermelhoPadrao }} onPress={() => setMostrarModal(false)}><Text style={{ color: '#c41e3a', fontWeight: 'bold' }}>Cancelar</Text></TouchableOpacity>
                  <TouchableOpacity style={{ flex: 1, backgroundColor: idSessaoEditando ? cores.cinzaEdicao : cores.vermelhoPadrao, padding: 14, borderRadius: 8, alignItems: 'center' }} onPress={tratarEnvio}>
                    <Text style={{ color: '#ffffff', fontWeight: 'bold' }}>{idSessaoEditando ? 'Salvar Alterações' : 'Salvar Avaliação'}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
};

export default TelaAvaliacao;