import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { useIsFocused } from '@react-navigation/native'; // Adicionado para ouvir o foco da tela
import { usarDados } from '../contextos/ContextoDados';
import { usarAutenticacao } from '../contextos/ContextoAutenticacao';
import { usarTema } from '../contextos/ContextoTema';
import { api } from '../services/api';

const TelaPrincipal = ({ navigation }) => {
  const { avaliacoes, carregando } = usarDados();
  const { usuario, sair } = usarAutenticacao();
  const { temaTemaEscuro } = usarTema();
  const [atletasVinculados, setAtletasVinculados] = useState([]);
  const [atletaSelecionadoId, setAtletaSelecionadoId] = useState(null);
  
  // Hook que retorna true sempre que esta tela estiver visível/focada
  const estaFocada = useIsFocused();

  const papelUser = usuario?.role;
  const ehNutricionista = papelUser === 'NUTRITIONIST' || papelUser === 'COACH';
  const ehAtleta = papelUser === 'ATHLETE';

  const tituloPainel = ehAtleta
    ? 'Meu Painel de Atleta'
    : papelUser === 'COACH'
      ? 'Painel do Treinador'
      : 'Painel do Nutricionista';

  // Função isolada de busca para podermos chamá-la de forma reativa
  const buscarAtletas = useCallback(async (ativo) => {
    if (!ehNutricionista) return;
    try {
      const links = await api.get('/professional-athletes');
      const filtrados = (links || [])
        .map((l) => l.athlete)
        .filter(Boolean);
      
      if (ativo) {
        setAtletasVinculados(filtrados);
        // Atualiza o ID selecionado se ele sumiu da lista (foi deletado) ou se não havia nenhum
        if (filtrados.length > 0) {
          const aindaExiste = filtrados.some(a => a.id === atletaSelecionadoId);
          if (!atletaSelecionadoId || !aindaExiste) {
            setAtletaSelecionadoId(filtrados[0].id);
          }
        } else {
          setAtletaSelecionadoId(null);
        }
      }
    } catch (error) {
      if (ativo) setAtletasVinculados([]);
    }
  }, [ehNutricionista, atletaSelecionadoId]);

  // Sincroniza a lista de atletas sempre que a tela ganha foco ou as avaliações mudam
  useEffect(() => {
    let ativo = true;
    if (estaFocada) {
      buscarAtletas(ativo);
    }
    return () => { ativo = false; };
  }, [estaFocada, buscarAtletas, avaliacoes]); 
  // Colocar 'avaliacoes' aqui força a atualização se o contexto global de avaliações mudar

  // Filtra as avaliações do utilizador selecionado para plotar no gráfico cronológico
  const dadosGrafico = useMemo(() => {
    const alvoId = ehAtleta ? usuario?.id : atletaSelecionadoId;
    if (!alvoId) return [];
    
    return (avaliacoes || [])
      .filter(av => av && (av.athleteId === alvoId || av.athlete?.userId === alvoId))
      .sort((a, b) => new Date(a.sessionDate || a.createdAt) - new Date(b.sessionDate || b.createdAt))
      .slice(-6); 
  }, [avaliacoes, ehAtleta, usuario, atletaSelecionadoId]);

  const maxSuor = useMemo(() => {
    const valores = dadosGrafico.map(d => parseFloat(d.result?.sweatRateLitersHour) || 0);
    return valores.length > 0 ? Math.max(...valores, 2) : 2;
  }, [dadosGrafico]);

  // CORREÇÃO CRÍTICA: Mapeamento de cores dinâmico escuro/claro integrado ao ContextoTema
  const cores = {
    fundoApp: temaTemaEscuro ? '#121212' : '#f4f7f9', 
    fundoCabecalho: temaTemaEscuro ? '#1e1e1e' : '#ffffff',
    bordaCabecalho: temaTemaEscuro ? '#2d2d2d' : '#e2e8f0',
    textoPrincipal: temaTemaEscuro ? '#ffffff' : '#1e293b', 
    textoSecundario: temaTemaEscuro ? '#a3a3a3' : '#707d93', 
    fundoCartao: temaTemaEscuro ? '#1e1e1e' : '#ffffff',
    bordaCartao: temaTemaEscuro ? '#2d2d2d' : '#f1f5f9',
    vermelhoPrincipal: '#bd3339',
    vermelhoBotaoSair: '#dc2626',
  };

  const estilos = StyleSheet.create({
    conteiner: { flex: 1, backgroundColor: cores.fundoApp },
    cabecalho: { 
      backgroundColor: cores.fundoCabecalho, 
      paddingTop: 20, 
      paddingBottom: 20, 
      paddingHorizontal: 20, 
      borderBottomWidth: 1, 
      borderBottomColor: cores.bordaCabecalho 
    },
    cabecalhoLinha: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    tituloCabecalho: { fontSize: 24, color: cores.textoPrincipal, fontWeight: 'bold', flex: 0.7 },
    botaoSair: { backgroundColor: cores.vermelhoBotaoSair, paddingVertical: 10, paddingHorizontal: 22, borderRadius: 12 },
    textoBotaoSair: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 },
    conteudo: { padding: 30 },
    conteinerContadores: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24, gap: 16 },
    cartaoContador: { flex: 1, backgroundColor: cores.vermelhoPrincipal, borderRadius: 16, padding: 20, alignItems: 'center', justifyContent: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4 },
    numeroContador: { fontSize: 42, color: '#ffffff', fontWeight: 'bold', marginBottom: 4 },
    rotuloContador: { fontSize: 14, color: '#ffffff', fontWeight: '600', textAlign: 'center' },
    secao: { marginBottom: 28 },
    tituloSecao: { fontSize: 18, fontWeight: 'bold', color: cores.textoPrincipal, marginBottom: 16 },
    conteinerFiltros: { flexDirection: 'row', marginBottom: 14, gap: 8 },
    pilulaFiltro: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: cores.fundoCartao, borderWidth: 1, borderColor: cores.bordaCartao },
    pilulaFiltroAtiva: { backgroundColor: cores.vermelhoPrincipal, borderColor: cores.vermelhoPrincipal },
    textoPilula: { fontSize: 14, color: cores.textoSecundario },
    textoPilulaAtiva: { color: '#ffffff', fontWeight: 'bold' },
    cartaoDashboard: { 
      backgroundColor: cores.fundoCartao, 
      borderRadius: 16, 
      padding: 32, 
      minHeight: 180,
      justifyContent: 'center', 
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.03,
      shadowRadius: 8,
      elevation: 1,
      borderWidth: temaTemaEscuro ? 1 : 0,
      borderColor: cores.bordaCartao,
    },
    textoDadosInsuficientes: { 
      textAlign: 'center', 
      color: cores.textoSecundario, 
      fontSize: 18, 
      lineHeight: 24,
      fontWeight: '500'
    },
    areaGrafico: { height: 180, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', width: '100%' },
    colunaGrafico: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: '100%' },
    pontoLinha: { width: 14, borderRadius: 7, backgroundColor: cores.vermelhoPrincipal, position: 'absolute', alignItems: 'center', justifyContent: 'center' },
    rotuloValorPonto: { color: cores.textoPrincipal, fontSize: 11, fontWeight: 'bold', position: 'absolute', top: -20, width: 50, textAlign: 'center' },
    rotuloDataPonto: { color: cores.textoSecundario, fontSize: 11, marginTop: 10 },
    linhasDeGrade: { position: 'absolute', width: '100%', height: '100%', justifyContent: 'space-between', zIndex: -1 },
    linhaGrade: { width: '100%', borderTopWidth: 1, borderTopColor: temaTemaEscuro ? '#2d2d2d' : '#e2e8f0' },
    botaoNavegacao: { 
      backgroundColor: cores.vermelhoPrincipal, 
      paddingVertical: 16, 
      borderRadius: 12, 
      alignItems: 'center', 
      marginBottom: 12,
    },
    textoBotaoNavegacao: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 },
    textoNenhumaAvaliacao: {
      textAlign: 'center',
      color: cores.textoSecundario,
      fontSize: 18,
      paddingVertical: 16,
      fontWeight: '500'
    }
  });

  return (
    <ScrollView style={estilos.conteiner} showsVerticalScrollIndicator={false}>
      {/* Cabeçalho */}
      <View style={estilos.cabecalho}>
        <View style={estilos.cabecalhoLinha}>
          <Text style={estilos.tituloCabecalho}>{tituloPainel}</Text>
          <TouchableOpacity style={estilos.botaoSair} onPress={sair}>
            <Text style={estilos.textoBotaoSair}>Sair</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={estilos.conteudo}>
        {/* Bloco de Contadores Superiores - Atualização instantânea via state e context */}
        {ehNutricionista && (
          <View style={estilos.conteinerContadores}>
            <View style={estilos.cartaoContador}>
              <Text style={estilos.numeroContador}>{atletasVinculados.length}</Text>
              <Text style={estilos.rotuloContador}>Atletas</Text>
            </View>
            <View style={estilos.cartaoContador}>
              <Text style={estilos.numeroContador}>{(avaliacoes || []).length}</Text>
              <Text style={estilos.rotuloContador}>Avaliações Totais</Text>
            </View>
          </View>
        )}

        {/* Seção da Curva de Sudorese */}
        <View style={estilos.secao}>
          <Text style={estilos.tituloSecao}>Evolução da Taxa de Sudorese (L/h)</Text>
          
          {ehNutricionista && atletasVinculados.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={estilos.conteinerFiltros}>
              {atletasVinculados.map((a) => (
                <TouchableOpacity key={a.id} style={[estilos.pilulaFiltro, atletaSelecionadoId === a.id && estilos.pilulaFiltroAtiva]} onPress={() => setAtletaSelecionadoId(a.id)}>
                  <Text style={[estilos.textoPilula, atletaSelecionadoId === a.id && estilos.textoPilulaAtiva]}>{a.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          <View style={estilos.cartaoDashboard}>
            {carregando ? (
              <ActivityIndicator size="small" color={cores.vermelhoPrincipal} />
            ) : dadosGrafico.length === 0 ? (
              <Text style={estilos.textoDadosInsuficientes}>
                Dados insuficientes para gerar a curva de tendência.
              </Text>
            ) : (
              <View style={estilos.areaGrafico}>
                <View style={estilos.linhasDeGrade}><View style={estilos.linhaGrade} /><View style={estilos.linhaGrade} /></View>
                {dadosGrafico.map((item, index) => {
                  const valor = parseFloat(item.result?.sweatRateLitersHour) || 0;
                  const altura = maxSuor > 0 ? (valor / maxSuor) * 80 : 0;
                  return (
                    <View key={item.id || index} style={estilos.colunaGrafico}>
                      <View style={[estilos.pontoLinha, { height: 14, bottom: `${altura}%` }]}>
                        <Text style={estilos.rotuloValorPonto}>{valor.toFixed(2)} L/h</Text>
                      </View>
                      <Text style={estilos.rotuloDataPonto}>
                        {item.sessionDate ? new Date(item.sessionDate).toLocaleDateString('pt-BR').substring(0, 5) : 'N/A'}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        </View>

        {/* Seção de Ações Rápidas */}
        <View style={estilos.secao}>
          <Text style={estilos.tituloSecao}>Ações Rápidas</Text>
          
          {ehNutricionista ? (
            <>
              <TouchableOpacity style={estilos.botaoNavegacao} onPress={() => navigation.navigate('MeusAtletas')}>
                <Text style={estilos.textoBotaoNavegacao}>Gerenciar Atletas</Text>
              </TouchableOpacity>
              <TouchableOpacity style={estilos.botaoNavegacao} onPress={() => navigation.navigate('Avaliacao')}>
                <Text style={estilos.textoBotaoNavegacao}>Nova Avaliação</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={estilos.botaoNavegacao} onPress={() => navigation.navigate('Avaliacao')}>
              <Text style={estilos.textoBotaoNavegacao}>Nova Avaliação</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Seção Exclusiva "Minhas Avaliações" */}
        {ehAtleta && (
          <View style={estilos.secao}>
            <Text style={estilos.tituloSecao}>Minhas Avaliações</Text>
            <Text style={estilos.textoNenhumaAvaliacao}>Nenhuma avaliação registrada</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default TelaPrincipal;