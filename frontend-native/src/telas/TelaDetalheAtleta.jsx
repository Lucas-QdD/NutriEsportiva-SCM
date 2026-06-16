import React, { useMemo, useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { usarAutenticacao } from '../contextos/ContextoAutenticacao';
import { usarDados } from '../contextos/ContextoDados';
import { usarTema } from '../contextos/ContextoTema';
import { api } from '../services/api';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ROLES_PROFISSIONAIS = ['NUTRITIONIST', 'COACH'];
const TRADUCAO_STATUS = {
  OVER: { label: 'Hiperidratado', cor: '#3b82f6', icone: 'emoticon-cool' },
  GOOD: { label: 'Hidratação Adequada', cor: '#10b981', icone: 'check-circle' },
  MODERATE: { label: 'Desidratação Moderada', cor: '#eab308', icone: 'alert-circle' },
  POOR: { label: 'Desidratação Crítica', cor: '#dc2626', icone: 'close-circle' }
};

const TelaDetalheAtleta = ({ navigation, route }) => {
  const { usuario } = usarAutenticacao();
  const { avaliacoes } = usarDados();
  const { temaTemaEscuro } = usarTema();
  const atletaUser = route?.params?.atleta || null;
  const podeAcessar = ROLES_PROFISSIONAIS.includes(usuario?.role);

  const [perfilCompleto, setPerfilCompleto] = useState(null);
  const [carregandoPerfil, setCarregandoPerfil] = useState(false);

  useEffect(() => {
    if (atletaUser?.id) {
      setCarregandoPerfil(true);
      api.get(`/users/${atletaUser.id}`)
        .then(dados => setPerfilCompleto(dados))
        .catch(() => setPerfilCompleto(atletaUser))
        .finally(() => setCarregandoPerfil(false));
    }
  }, [atletaUser, avaliacoes]);

  // Filtra comparando a session.athleteId com o perfil correto do banco
  const sessoesDoAtleta = useMemo(() => {
    const profileIdReal = perfilCompleto?.athleteProfile?.id;
    if (!profileIdReal) return [];

    return (avaliacoes || [])
      .filter((session) => session && (session.athleteId === profileIdReal || session.athleteProfileId === profileIdReal))
      .sort((a, b) => new Date(b.sessionDate || b.createdAt) - new Date(a.sessionDate || a.createdAt));
  }, [perfilCompleto, avaliacoes]);

  const cores = {
    fundoApp: temaTemaEscuro ? '#121212' : '#f3f4f6',
    fundoCabecalho: temaTemaEscuro ? '#1e1e1e' : '#f9fafb',
    bordaCabecalho: temaTemaEscuro ? '#2d2d2d' : '#e5e7eb',
    textoPrincipal: temaTemaEscuro ? '#ffffff' : '#1f2937',
    textoSecundario: temaTemaEscuro ? '#a3a3a3' : '#6b7280',
    fundoCartao: temaTemaEscuro ? '#1e1e1e' : '#ffffff',
    bordaCartao: temaTemaEscuro ? '#2d2d2d' : '#e5e7eb',
    vermelhoPadrao: '#c41e3a',
  };

  const estilos = StyleSheet.create({
    conteiner: { flex: 1, backgroundColor: cores.fundoApp },
    cabecalho: { backgroundColor: cores.fundoCabecalho, paddingVertical: 16, paddingHorizontal: 24, borderBottomWidth: 1, borderBottomColor: cores.bordaCabecalho, flexDirection: 'row', alignItems: 'center', gap: 12 },
    tituloCabecalho: { fontSize: 20, color: cores.textoPrincipal, fontWeight: 'bold' },
    conteudo: { padding: 30, gap: 16 },
    cartaoMestre: { backgroundColor: cores.fundoCartao, borderColor: cores.bordaCartao, borderWidth: 1, borderRadius: 12, padding: 20, gap: 10 },
    nomeAtleta: { color: cores.textoPrincipal, fontSize: 18, fontWeight: 'bold' },
    gradeInfo: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 4, borderTopWidth: 1, borderTopColor: cores.bordaCartao, paddingTop: 12 },
    blocoInfo: { minWidth: '45%', gap: 2 },
    rotuloMin: { fontSize: 11, color: cores.textoSecundario, textTransform: 'uppercase', fontWeight: '600' },
    valorMin: { fontSize: 14, color: cores.textoPrincipal, fontWeight: '500' },
    tituloSecao: { color: cores.textoPrincipal, fontSize: 16, fontWeight: 'bold', marginTop: 10 },
    cartaoSessao: { backgroundColor: cores.fundoCartao, borderColor: cores.bordaCartao, borderWidth: 1, borderRadius: 12, padding: 16, gap: 8 },
    statusLinha: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, marginRight: 8 },
    txtStatus: { fontSize: 14, fontWeight: 'bold' },
    txtDetalheSessao: { color: cores.textoSecundario, fontSize: 13 },
    caixaConduta: { backgroundColor: temaTemaEscuro ? '#2a1a1c' : '#fef2f2', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#fca5a5', marginTop: 4 },
    txtConduta: { color: cores.vermelhoPadrao, fontSize: 13, fontStyle: 'italic' },
    vazio: { color: cores.textoSecundario, textAlign: 'center', paddingVertical: 30 },
    botaoVoltar: { width: 40, height: 40, borderRadius: 20, backgroundColor: cores.fundoCartao, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: cores.bordaCartao },
    botaoColeta: { backgroundColor: cores.vermelhoPadrao, borderRadius: 8, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, marginTop: 10 }
  });

  if (!podeAcessar || !atletaUser) {
    return (
      <View style={estilos.conteiner}>
        <View style={[estilos.conteudo, { alignItems: 'center', justifyContent: 'center', flex: 1 }]}>
          <Text style={{ color: '#b91c1c' }}>Acesso restrito ou nenhum atleta selecionado.</Text>
        </View>
      </View>
    );
  }

  const perfilAtleta = perfilCompleto?.athleteProfile;

  return (
    <View style={estilos.conteiner}>
      <View style={estilos.cabecalho}>
        <TouchableOpacity style={estilos.botaoVoltar} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={cores.textoPrincipal} />
        </TouchableOpacity>
        <Text style={estilos.tituloCabecalho}>Prontuário Técnico</Text>
      </View>

      <ScrollView contentContainerStyle={estilos.conteudo} showsVerticalScrollIndicator={false}>
        {carregandoPerfil ? (
          <ActivityIndicator color={cores.vermelhoPadrao} size="small" />
        ) : (
          <View style={estilos.cartaoMestre}>
            <Text style={estilos.nomeAtleta}>{perfilCompleto?.name || atletaUser.name}</Text>
            <Text style={[estilos.txtDetalheSessao, { marginTop: -6 }]}>E-mail: {perfilCompleto?.email || atletaUser.email}</Text>
            
            <View style={estilos.gradeInfo}>
              <View style={estilos.blocoInfo}>
                <Text style={estilos.rotuloMin}>Idade Corporal</Text>
                <Text style={estilos.valorMin}>{perfilAtleta?.age ? `${perfilAtleta.age} anos` : 'Não informada'}</Text>
              </View>
              <View style={estilos.blocoInfo}>
                <Text style={estilos.rotuloMin}>Modalidade</Text>
                <Text style={estilos.valorMin}>{perfilAtleta?.sport || 'Geral'}</Text>
              </View>
              <View style={estilos.blocoInfo}>
                <Text style={estilos.rotuloMin}>Código Técnico</Text>
                <Text style={estilos.valorMin}>{perfilAtleta?.athleteCode || 'Pendente'}</Text>
              </View>
            </View>

            {perfilAtleta && (
              <TouchableOpacity style={estilos.botaoColeta} onPress={() => navigation.navigate('Avaliacao', { athleteId: atletaUser.id })}>
                <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 15 }}>Iniciar Avaliação</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <Text style={estilos.tituloSecao}>Histórico Hídrico Cronológico</Text>
        {sessoesDoAtleta.length === 0 ? (
          <Text style={estilos.vazio}>Nenhuma avaliação antropométrica vinculada a este perfil.</Text>
        ) : (
          sessoesDoAtleta.map((session, index) => {
            const res = session.result || {};
            const dataBR = session.sessionDate ? new Date(session.sessionDate).toLocaleDateString('pt-BR') : 'Data Indefinida';
            
            // CAPTURA RESILIENTE: Verifica tanto a propriedade mapeada quanto a raiz relacional crua do Prisma
            const pInicial = parseFloat(session.pesoInicial || session.preWeightKg || session.hydrationRecord?.preWeightKg || 0);
            const pFinal = parseFloat(session.pesoFinal || session.postWeightKg || session.hydrationRecord?.postWeightKg || 0);
            
            // SINCRONIZAÇÃO MATEMÁTICA IDÊNTICA À TELA DE AVALIAÇÃO
            let statusId = res.hydrationStatus || 'GOOD';
            if (pInicial > 0 && pFinal > 0) {
              const percentual = ((pInicial - pFinal) / pInicial) * 100;
              if (percentual < 0) {
                statusId = 'OVER';
              } else if (percentual >= 2.0 && percentual < 5.0) {
                statusId = 'MODERATE';
              } else if (percentual >= 5.0) {
                statusId = 'POOR';
              } else {
                statusId = 'GOOD';
              }
            }

            const statusConfig = TRADUCAO_STATUS[statusId] || TRADUCAO_STATUS.GOOD;
            
            return (
              <View key={session.id || index} style={estilos.cartaoSessao}>
                {/* Linha flexível que evita corte de data em celulares menores */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginBottom: 4 }}>
                  <View style={estilos.statusLinha}>
                    <MaterialCommunityIcons name={statusConfig.icone} size={18} color={statusConfig.cor} />
                    <Text style={[estilos.txtStatus, { color: statusConfig.cor }]} numberOfLines={1}>{statusConfig.label}</Text>
                  </View>
                  <Text style={[estilos.txtDetalheSessao, { fontWeight: '500', minWidth: 75, textAlign: 'right' }]}>{dataBR}</Text>
                </View>

                <Text style={estilos.txtDetalheSessao}>
                  Duração: <Text style={{ color: cores.textoPrincipal }}>{session.durationMin} min</Text>
                </Text>
                {res.sweatRateLitersHour !== undefined && (
                  <Text style={estilos.txtDetalheSessao}>
                    Taxa de Sudorese: <Text style={{ color: cores.textoPrincipal, fontWeight: 'bold' }}>{parseFloat(res.sweatRateLitersHour).toFixed(2)} L/h</Text>
                  </Text>
                )}
                {res.recommendation ? (
                  <View style={estilos.caixaConduta}>
                    <Text style={estilos.txtConduta}>Conduta: {res.recommendation}</Text>
                  </View>
                ) : null}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

export default TelaDetalheAtleta;