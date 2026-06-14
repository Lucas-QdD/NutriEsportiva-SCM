import React, { useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { usarAutenticacao } from '../contextos/ContextoAutenticacao';
import { usarDados } from '../contextos/ContextoDados';
import { usarTema } from '../contextos/ContextoTema';

const ROLES_PROFISSIONAIS = ['NUTRITIONIST', 'COACH'];

function normalizarTexto(valor) {
  return String(valor || '').trim().toLowerCase();
}

function pertenceAoAtleta(avaliacao, atleta) {
  const atletaId = String(atleta?.id || '');
  const atletaNome = normalizarTexto(atleta?.name || atleta?.nome);
  const atletaEmail = normalizarTexto(atleta?.email);

  return (
    (atletaId && String(avaliacao?.atletaId || '') === atletaId) ||
    (atletaId && String(avaliacao?.usuarioId || '') === atletaId) ||
    (atletaId && String(avaliacao?.userId || '') === atletaId) ||
    (atletaNome && normalizarTexto(avaliacao?.atletaNome || avaliacao?.nome) === atletaNome) ||
    (atletaEmail && normalizarTexto(avaliacao?.email || avaliacao?.atletaEmail) === atletaEmail)
  );
}

const TelaDetalheAtleta = ({ navigation, route }) => {
  const { usuario } = usarAutenticacao();
  const { avaliacoes } = usarDados();
  const { temaTemaEscuro } = usarTema();

  const atleta = route?.params?.atleta || null;
  const podeAcessar = ROLES_PROFISSIONAIS.includes(usuario?.role);

  const avaliacoesDoAtleta = useMemo(() => {
    if (!atleta) {
      return [];
    }

    return (avaliacoes || []).filter((avaliacao) => pertenceAoAtleta(avaliacao, atleta));
  }, [atleta, avaliacoes]);

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
    cabecalho: {
      backgroundColor: cores.fundoCabecalho,
      paddingVertical: 20,
      paddingHorizontal: 30,
      borderBottomWidth: 1,
      borderBottomColor: cores.bordaCabecalho,
      gap: 12,
    },
    tituloCabecalho: { fontSize: 24, color: cores.textoPrincipal, fontWeight: 'bold' },
    conteudo: { padding: 30, gap: 16 },
    cartao: {
      backgroundColor: cores.fundoCartao,
      borderColor: cores.bordaCartao,
      borderWidth: 1,
      borderRadius: 8,
      padding: 16,
      gap: 8,
    },
    nome: { color: cores.textoPrincipal, fontSize: 20, fontWeight: '700' },
    tituloSecao: { color: cores.textoPrincipal, fontSize: 18, fontWeight: '700' },
    detalhe: { color: cores.textoSecundario, fontSize: 14 },
    vazio: { color: cores.textoSecundario, textAlign: 'center', paddingVertical: 28 },
    botaoVoltar: {
      alignSelf: 'flex-start',
      backgroundColor: '#6b7280',
      borderRadius: 8,
      paddingVertical: 10,
      paddingHorizontal: 14,
    },
    textoBotao: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
    alertaErro: { backgroundColor: '#fee2e2', borderRadius: 8, padding: 12 },
    textoErro: { color: '#b91c1c', fontSize: 14 },
    status: { color: cores.vermelhoPadrao, fontSize: 14, fontWeight: '700' },
  });

  if (!podeAcessar) {
    return (
      <View style={estilos.conteiner}>
        <View style={estilos.cabecalho}>
          <Text style={estilos.tituloCabecalho}>Detalhe do Atleta</Text>
        </View>
        <View style={estilos.conteudo}>
          <View style={estilos.alertaErro}>
            <Text style={estilos.textoErro}>Esta area e exclusiva para nutricionistas e treinadores.</Text>
          </View>
          <TouchableOpacity style={estilos.botaoVoltar} onPress={() => navigation.goBack()}>
            <Text style={estilos.textoBotao}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!atleta) {
    return (
      <View style={estilos.conteiner}>
        <View style={estilos.cabecalho}>
          <Text style={estilos.tituloCabecalho}>Detalhe do Atleta</Text>
        </View>
        <View style={estilos.conteudo}>
          <View style={estilos.alertaErro}>
            <Text style={estilos.textoErro}>Nenhum atleta selecionado.</Text>
          </View>
          <TouchableOpacity style={estilos.botaoVoltar} onPress={() => navigation.goBack()}>
            <Text style={estilos.textoBotao}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={estilos.conteiner} contentContainerStyle={{ paddingBottom: 30 }}>
      <View style={estilos.cabecalho}>
        <TouchableOpacity style={estilos.botaoVoltar} onPress={() => navigation.goBack()}>
          <Text style={estilos.textoBotao}>Voltar</Text>
        </TouchableOpacity>
        <Text style={estilos.tituloCabecalho}>Detalhe do Atleta</Text>
      </View>

      <View style={estilos.conteudo}>
        <View style={estilos.cartao}>
          <Text style={estilos.nome}>{atleta.name || atleta.nome || 'Atleta'}</Text>
          <Text style={estilos.detalhe}>Email: {atleta.email || 'Nao informado'}</Text>
          <Text style={estilos.detalhe}>Role: {atleta.role || 'ATHLETE'}</Text>
          {atleta.teamId ? <Text style={estilos.detalhe}>Time: {atleta.teamId}</Text> : null}
        </View>

        <View style={estilos.cartao}>
          <Text style={estilos.tituloSecao}>Avaliacoes / Sessoes</Text>

          {avaliacoesDoAtleta.length === 0 ? (
            <Text style={estilos.vazio}>Nenhuma avaliacao encontrada para este atleta.</Text>
          ) : (
            avaliacoesDoAtleta.map((avaliacao, index) => (
              <View key={avaliacao.id || index} style={estilos.cartao}>
                <Text style={estilos.status}>{avaliacao.statusHidratacao || 'Registro'}</Text>
                <Text style={estilos.detalhe}>Data: {avaliacao.data || 'Nao informada'}</Text>
                <Text style={estilos.detalhe}>
                  Duracao: {avaliacao.durationMin || avaliacao.duracao || 'Nao informada'} min
                </Text>
                <Text style={estilos.detalhe}>
                  Taxa de sudorese: {avaliacao.sweatRate ? `${avaliacao.sweatRate} L/h` : 'Nao calculada'}
                </Text>
              </View>
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default TelaDetalheAtleta;
