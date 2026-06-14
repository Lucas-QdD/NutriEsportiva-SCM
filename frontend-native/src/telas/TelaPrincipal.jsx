import React, { useEffect, useMemo, useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Text,
} from 'react-native';
import { usarDados } from '../contextos/ContextoDados';
import { usarAutenticacao } from '../contextos/ContextoAutenticacao';
import { usarTema } from '../contextos/ContextoTema';
import { api } from '../services/api';

const TelaPrincipal = ({ navigation }) => {
  const { atletas, avaliacoes } = usarDados();
  const { usuario, sair } = usarAutenticacao();
  const { temaTemaEscuro } = usarTema();
  const [atletasVinculados, setAtletasVinculados] = useState([]);

  // Estado para controlar qual atleta esta selecionado no grafico.
  const [atletaSelecionadoId, setAtletaSelecionadoId] = useState(atletas[0]?.id || null);

  useEffect(() => {
    if (atletas.length > 0 && !atletaSelecionadoId) {
      setAtletaSelecionadoId(atletas[0].id);
    }
  }, [atletas, atletaSelecionadoId]);

  const papelUser = usuario?.role;
  const ehNutricionista = papelUser === 'NUTRITIONIST' || papelUser === 'COACH';
  const ehAtleta = papelUser === 'ATHLETE';
  const tituloPainel =
    papelUser === 'ATHLETE'
      ? 'Meu Painel de Atleta'
      : papelUser === 'COACH'
        ? 'Painel do Treinador'
        : 'Painel do Nutricionista';

  useEffect(() => {
    let ativo = true;

    async function carregarAtletasVinculados() {
      if (!ehNutricionista) {
        setAtletasVinculados([]);
        return;
      }

      try {
        const links = await api.get('/professional-athletes');
        const atletasDoProfissional = (Array.isArray(links) ? links : [])
          .map((link) => link.athlete)
          .filter(Boolean);

        if (ativo) {
          setAtletasVinculados(atletasDoProfissional);
        }
      } catch (error) {
        if (ativo) {
          setAtletasVinculados([]);
        }
      }
    }

    carregarAtletasVinculados();

    return () => {
      ativo = false;
    };
  }, [ehNutricionista, usuario?.id]);

  const atletasDoPainel = useMemo(() => {
    if (!ehNutricionista) {
      return atletas;
    }

    return atletasVinculados.map((atleta) => ({
      id: atleta.id,
      nome: atleta.name || atleta.nome,
      email: atleta.email,
      role: atleta.role,
    }));
  }, [atletas, atletasVinculados, ehNutricionista]);

  const nomesAtletasVinculados = useMemo(
    () => new Set(atletasDoPainel.map((atleta) => atleta.nome).filter(Boolean)),
    [atletasDoPainel]
  );

  useEffect(() => {
    if (!ehNutricionista || atletasDoPainel.length === 0) {
      return;
    }

    const atletaAindaExiste = atletasDoPainel.some((atleta) => atleta.id === atletaSelecionadoId);

    if (!atletaAindaExiste) {
      setAtletaSelecionadoId(atletasDoPainel[0].id);
    }
  }, [atletaSelecionadoId, atletasDoPainel, ehNutricionista]);

  const avaliacoesFiltradas = ehNutricionista
    ? avaliacoes.filter((avaliacao) => nomesAtletasVinculados.has(avaliacao.atletaNome || avaliacao.nome))
    : avaliacoes.filter(avaliacao => avaliacao.atletaId === usuario?.id || avaliacao.usuarioId === usuario?.id);

  const avaliacoesRecentes = avaliacoesFiltradas.slice(0, 5);

  // --- LOGICA DO DASHBOARD DE EVOLUCAO ---
  const dadosGrafico = avaliacoesFiltradas
    .filter(av => ehAtleta || av.atletaId === atletaSelecionadoId || av.atletaNome === atletasDoPainel.find(a => a.id === atletaSelecionadoId)?.nome)
    // Ordena por data para o grafico fazer sentido cronologico.
    .sort((a, b) => new Date(a.data.split('/').reverse().join('-')) - new Date(b.data.split('/').reverse().join('-')))
    .slice(-6); // Pega os ultimos 6 pontos para nao poluir o layout.

  // Encontra o maior valor para calcular a escala vertical do grafico proporcionalmente.
  const valoresSuor = dadosGrafico.map(d => parseFloat(d.sweatRate) || 0);
  const maxSuor = valoresSuor.length > 0 ? Math.max(...valoresSuor, 2) : 2; 

  const cores = {
    fundoApp: temaTemaEscuro ? '#121212' : '#f3f4f6',
    fundoCabecalho: temaTemaEscuro ? '#1e1e1e' : '#f9fafb',
    bordaCabecalho: temaTemaEscuro ? '#2d2d2d' : '#e5e7eb',
    textoPrincipal: temaTemaEscuro ? '#ffffff' : '#1f2937',
    textoSecundario: temaTemaEscuro ? '#a3a3a3' : '#6b7280',
    textoTres: temaTemaEscuro ? '#d4d4d4' : '#374151',
    fundoCartao: temaTemaEscuro ? '#1e1e1e' : '#ffffff',
    bordaCartao: temaTemaEscuro ? '#2d2d2d' : '#f3f4f6',
    vermelhoPadrao: '#c41e3a',
    fundoEvolucao: temaTemaEscuro ? '#1c1c1e' : '#f9fafb',
    gradeGrafico: temaTemaEscuro ? '#2c2c2e' : '#e5e7eb'
  };

  const estilos = StyleSheet.create({
    conteiner: { flex: 1, backgroundColor: cores.fundoApp },
    cabecalho: { backgroundColor: cores.fundoCabecalho, paddingTop: 40, paddingBottom: 20, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: cores.bordaCabecalho, shadowColor: '#000000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: temaTemaEscuro ? 0.2 : 0.05, shadowRadius: 4, elevation: 2 },
    cabecalhoLinha: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
    
    // O titulo encolhe para dar espaco ao botao se o texto for muito longo.
    tituloCabecalho: { fontSize: 22, color: cores.textoPrincipal, fontWeight: 'bold', flex: 1, flexShrink: 1 },
    
    // Botao Sair com largura controlada para evitar corte.
    botaoSair: { backgroundColor: '#dc2626', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8, alignItems: 'center', justifyContent: 'center', minWidth: 65, flexShrink: 0 },
    textoBotaoSair: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
    
    conteudo: { flex: 1, padding: 30 },
    grelhaEstatisticas: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, gap: 16 },
    cartaoEstatistica: { flex: 1, backgroundColor: cores.vermelhoPadrao, borderRadius: 12, padding: 20, alignItems: 'center', justifyContent: 'center', shadowColor: '#000000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
    valorEstatistica: { fontSize: 32, fontWeight: 'bold', color: '#ffffff', marginBottom: 8 },
    rotuloEstatistica: { fontSize: 12, color: '#ffffff', textAlign: 'center', fontWeight: '600' },
    secao: { marginBottom: 30 },
    cabecalhoSecao: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    tituloSecao: { fontSize: 18, fontWeight: 'bold', color: cores.textoPrincipal },
    conteinerFiltros: { flexDirection: 'row', marginBottom: 12, gap: 8 },
    pilulaFiltro: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: cores.fundoCartao, borderWidth: 1, borderColor: cores.bordaCartao },
    pilulaFiltroAtiva: { backgroundColor: cores.vermelhoPadrao, borderColor: cores.vermelhoPadrao },
    textoPilula: { fontSize: 12, color: cores.textoSecundario, fontWeight: '500' },
    textoPilulaAtiva: { color: '#ffffff', fontWeight: 'bold' },
    cartaoDashboard: { backgroundColor: cores.fundoEvolucao, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: cores.bordaCartao, marginBottom: 20 },
    areaGrafico: { height: 160, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingTop: 20, borderBottomWidth: 2, borderBottomColor: cores.textoSecundario, paddingHorizontal: 10 },
    colunaGrafico: { flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end' },
    pontoLinha: { width: 12, borderRadius: 6, backgroundColor: cores.vermelhoPadrao, position: 'absolute', bottom: 0, alignItems: 'center', justifyContent: 'center' },
    rotuloValorPonto: { color: cores.textoPrincipal, fontSize: 10, fontWeight: 'bold', position: 'absolute', top: -16 },
    rotuloDataPonto: { color: cores.textoSecundario, fontSize: 10, marginTop: 8, textAlign: 'center' },
    linhasDeGrade: { position: 'absolute', width: '100%', height: '100%', justifyContent: 'space-between', zIndex: -1 },
    linhaGrade: { width: '100%', borderTopWidth: 1, borderTopColor: cores.gradeGrafico },
    cartaoAvaliacao: { backgroundColor: cores.fundoCartao, borderRadius: 10, padding: 16, marginBottom: 12, shadowColor: '#000000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: temaTemaEscuro ? 0.2 : 0.08, shadowRadius: 4, elevation: 2, borderWidth: 1, borderColor: cores.bordaCartao, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    infoAvaliacao: { flex: 1 },
    nomeAvaliacao: { fontSize: 16, fontWeight: '600', color: cores.textoPrincipal, marginBottom: 4 },
    dataAvaliacao: { fontSize: 14, color: cores.textoSecundario },
    pesoAvaliacao: { fontSize: 14, color: cores.textoTres, fontWeight: '500' },
    textoVazio: { textAlign: 'center', color: cores.textoSecundario, padding: 40, fontSize: 16 },
    botaoNavegacao: { backgroundColor: cores.vermelhoPadrao, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10, alignItems: 'center', marginBottom: 16, shadowColor: '#000000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 },
    textoBotaoNavegacao: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  });

  return (
    <ScrollView style={estilos.conteiner}>
      {/* Cabecalho */}
      <View style={estilos.cabecalho}>
        <View style={estilos.cabecalhoLinha}>
          <Text style={estilos.tituloCabecalho} numberOfLines={1}>{tituloPainel}</Text>
          <TouchableOpacity style={estilos.botaoSair} onPress={sair}>
            <Text style={estilos.textoBotaoSair}>Sair</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={estilos.conteudo}>
        {/* Bloco de estatisticas visivel apenas para profissionais */}
        {ehNutricionista && (
          <View style={estilos.grelhaEstatisticas}>
            <View style={estilos.cartaoEstatistica}>
              <Text style={estilos.valorEstatistica}>{atletasDoPainel.length}</Text>
              <Text style={estilos.rotuloEstatistica}>Atletas</Text>
            </View>
            <View style={estilos.cartaoEstatistica}>
              <Text style={estilos.valorEstatistica}>{avaliacoes.length}</Text>
              <Text style={estilos.rotuloEstatistica}>Avaliacoes Totais</Text>
            </View>
          </View>
        )}

        {/* --- DASHBOARD DE EVOLUCAO COMPACTO --- */}
        <View style={estilos.secao}>
          <View style={estilos.cabecalhoSecao}>
            <Text style={estilos.tituloSecao}>Evolucao da Taxa de Sudorese (L/h)</Text>
          </View>

          {/* Filtro por Atleta se for Nutricionista */}
          {ehNutricionista && atletasDoPainel.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={estilos.conteinerFiltros}>
              {atletasDoPainel.map((atleta) => (
                <TouchableOpacity
                  key={atleta.id}
                  style={[estilos.pilulaFiltro, atletaSelecionadoId === atleta.id && estilos.pilulaFiltroAtiva]}
                  onPress={() => setAtletaSelecionadoId(atleta.id)}
                >
                  <Text style={[estilos.textoPilula, atletaSelecionadoId === atleta.id && estilos.textoPilulaAtiva]}>
                    {atleta.nome}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          <View style={estilos.cartaoDashboard}>
            {dadosGrafico.length === 0 ? (
              <Text style={estilos.textoVazio}>Dados insuficientes para gerar a curva de tendencia.</Text>
            ) : (
              <View style={{ height: 200, justifyContent: 'flex-end' }}>
                <View style={estilos.areaGrafico}>
                  {/* Linhas de Grade de Fundo */}
                  <View style={estilos.linhasDeGrade}>
                    <View style={estilos.linhaGrade} />
                    <View style={estilos.linhaGrade} />
                    <View style={estilos.linhaGrade} />
                  </View>

                  {/* Renderizacao dinamica dos pontos do grafico */}
                  {dadosGrafico.map((item, index) => {
                    const taxaVal = parseFloat(item.sweatRate) || 0;
                    const alturaPercent = maxSuor > 0 ? (taxaVal / maxSuor) * 85 : 0; 

                    return (
                      <View key={item.id || index} style={estilos.colunaGrafico}>
                        <View style={[estilos.pontoLinha, { height: 12, bottom: `${alturaPercent}%` }]}>
                          <Text style={estilos.rotuloValorPonto}>{taxaVal.toFixed(1)}L</Text>
                        </View>
                        <Text style={estilos.rotuloDataPonto} numberOfLines={1}>
                          {item.data.substring(0, 5)}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Navegacao rapida / acoes */}
        <View style={estilos.secao}>
          <View style={estilos.cabecalhoSecao}>
            <Text style={estilos.tituloSecao}>Acoes Rapidas</Text>
          </View>

          <TouchableOpacity
            style={estilos.botaoNavegacao}
            onPress={() => navigation.navigate('MinhaConta')}
          >
            <Text style={estilos.textoBotaoNavegacao}>Minha Conta</Text>
          </TouchableOpacity>
          
          {ehNutricionista && (
            <TouchableOpacity
              style={estilos.botaoNavegacao}
              onPress={() => navigation.navigate('MeusAtletas')}
            >
              <Text style={estilos.textoBotaoNavegacao}>Meus Atletas</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={estilos.botaoNavegacao}
            onPress={() => navigation.navigate('Avaliacao', { abrirFormulario: true })}
          >
            <Text style={estilos.textoBotaoNavegacao}>Nova Avaliacao</Text>
          </TouchableOpacity>
        </View>

        {/* Secao de historico de avaliacoes */}
        <View style={estilos.secao}>
          <View style={estilos.cabecalhoSecao}>
            <Text style={estilos.tituloSecao}>
              {ehNutricionista ? 'Avaliacoes Recentes' : 'Minhas Avaliacoes'}
            </Text>
          </View>

          {avaliacoesRecentes.length === 0 ? (
            <Text style={estilos.textoVazio}>Nenhuma avaliacao registrada</Text>
          ) : (
            avaliacoesRecentes.map((item) => (
              <View key={item.id} style={estilos.cartaoAvaliacao}>
                <View style={estilos.infoAvaliacao}>
                  <Text style={estilos.nomeAvaliacao}>
                    {item.atletaNome || item.nome || "Geral"}
                  </Text>
                  <Text style={estilos.dataAvaliacao}>
                    {item.data} {item.statusHidratacao && `- ${item.statusHidratacao}`}
                  </Text>
                  <Text style={estilos.pesoAvaliacao}>
                    Taxa: {item.sweatRate ? `${item.sweatRate} L/h` : 'Nao calculada'}
                  </Text>
                </View>
                
                <TouchableOpacity
                  style={[estilos.botaoNavegacao, { paddingVertical: 8, paddingHorizontal: 16, marginBottom: 0 }]}
                  onPress={() => navigation.navigate('Avaliacao', { id: item.id })}
                >
                  <Text style={estilos.textoBotaoNavegacao}>Ver</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default TelaPrincipal;


