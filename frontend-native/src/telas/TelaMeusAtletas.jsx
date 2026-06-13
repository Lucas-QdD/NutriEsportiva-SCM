import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { api } from '../services/api';
import { usarAutenticacao } from '../contextos/ContextoAutenticacao';
import { usarTema } from '../contextos/ContextoTema';

const ROLES_PROFISSIONAIS = ['NUTRITIONIST', 'COACH'];

const TelaMeusAtletas = () => {
  const { usuario } = usarAutenticacao();
  const { temaTemaEscuro } = usarTema();

  const [emailAtleta, setEmailAtleta] = useState('');
  const [vinculos, setVinculos] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');

  const podeVincular = ROLES_PROFISSIONAIS.includes(usuario?.role);

  const carregarVinculos = useCallback(async () => {
    setCarregando(true);
    setErro('');

    try {
      const dados = await api.get('/professional-athletes');
      setVinculos(Array.isArray(dados) ? dados : []);
    } catch (error) {
      setErro(error.message || 'Nao foi possivel carregar seus atletas.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarVinculos();
  }, [carregarVinculos]);

  const vincularAtleta = async () => {
    const email = emailAtleta.trim();

    if (!email) {
      setErro('Informe o email do atleta.');
      return;
    }

    setSalvando(true);
    setErro('');
    setMensagem('');

    try {
      const atleta = await api.get(`/users/search?email=${encodeURIComponent(email)}`);

      if (atleta.role !== 'ATHLETE') {
        setErro('O usuario encontrado nao e um atleta.');
        return;
      }

      await api.post('/professional-athletes', {
        athleteId: atleta.id,
      });

      setEmailAtleta('');
      setMensagem('Atleta vinculado com sucesso.');
      await carregarVinculos();
    } catch (error) {
      setErro(error.message || 'Nao foi possivel vincular o atleta.');
    } finally {
      setSalvando(false);
    }
  };

  const removerVinculo = async (id) => {
    const executarRemocao = async () => {
      setErro('');
      setMensagem('');

      try {
        await api.delete(`/professional-athletes/${id}`);
        setMensagem('Vinculo removido com sucesso.');
        await carregarVinculos();
      } catch (error) {
        setErro(error.message || 'Nao foi possivel remover o vinculo.');
      }
    };

    if (typeof window !== 'undefined' && window.confirm) {
      if (window.confirm('Remover este atleta dos seus vinculos?')) {
        executarRemocao();
      }
      return;
    }

    Alert.alert('Remover vinculo', 'Remover este atleta dos seus vinculos?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: executarRemocao },
    ]);
  };

  const cores = {
    fundoApp: temaTemaEscuro ? '#121212' : '#f3f4f6',
    fundoCabecalho: temaTemaEscuro ? '#1e1e1e' : '#f9fafb',
    bordaCabecalho: temaTemaEscuro ? '#2d2d2d' : '#e5e7eb',
    textoPrincipal: temaTemaEscuro ? '#ffffff' : '#1f2937',
    textoSecundario: temaTemaEscuro ? '#a3a3a3' : '#6b7280',
    fundoCartao: temaTemaEscuro ? '#1e1e1e' : '#ffffff',
    bordaCartao: temaTemaEscuro ? '#2d2d2d' : '#e5e7eb',
    fundoInput: temaTemaEscuro ? '#2a2a2a' : '#ffffff',
    textoInput: temaTemaEscuro ? '#ffffff' : '#000000',
    vermelhoPadrao: '#c41e3a',
    verdeSucesso: '#10b981',
  };

  const estilos = StyleSheet.create({
    conteiner: { flex: 1, backgroundColor: cores.fundoApp },
    cabecalho: {
      backgroundColor: cores.fundoCabecalho,
      paddingVertical: 20,
      paddingHorizontal: 30,
      borderBottomWidth: 1,
      borderBottomColor: cores.bordaCabecalho,
    },
    tituloCabecalho: { fontSize: 24, color: cores.textoPrincipal, fontWeight: 'bold' },
    conteudo: { padding: 30, gap: 16 },
    textoAjuda: { color: cores.textoSecundario, fontSize: 14, lineHeight: 20 },
    campo: {
      backgroundColor: cores.fundoInput,
      color: cores.textoInput,
      borderColor: cores.bordaCartao,
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 15,
    },
    botao: {
      backgroundColor: cores.vermelhoPadrao,
      borderRadius: 8,
      paddingVertical: 12,
      alignItems: 'center',
    },
    botaoSecundario: {
      backgroundColor: '#6b7280',
      borderRadius: 8,
      paddingVertical: 10,
      paddingHorizontal: 14,
      alignItems: 'center',
    },
    textoBotao: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
    alertaErro: { backgroundColor: '#fee2e2', borderRadius: 8, padding: 12 },
    textoErro: { color: '#b91c1c', fontSize: 14 },
    alertaSucesso: { backgroundColor: '#dcfce7', borderRadius: 8, padding: 12 },
    textoSucesso: { color: '#166534', fontSize: 14 },
    cartao: {
      backgroundColor: cores.fundoCartao,
      borderColor: cores.bordaCartao,
      borderWidth: 1,
      borderRadius: 8,
      padding: 16,
      gap: 6,
    },
    nome: { color: cores.textoPrincipal, fontSize: 16, fontWeight: '700' },
    detalhe: { color: cores.textoSecundario, fontSize: 14 },
    vazio: { color: cores.textoSecundario, textAlign: 'center', paddingVertical: 30 },
  });

  if (!podeVincular) {
    return (
      <View style={estilos.conteiner}>
        <View style={estilos.cabecalho}>
          <Text style={estilos.tituloCabecalho}>Meus Atletas</Text>
        </View>
        <View style={estilos.conteudo}>
          <Text style={estilos.textoAjuda}>
            Esta area e exclusiva para nutricionistas e treinadores.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={estilos.conteiner}>
      <View style={estilos.cabecalho}>
        <Text style={estilos.tituloCabecalho}>Meus Atletas</Text>
      </View>

      <ScrollView contentContainerStyle={estilos.conteudo}>
        <Text style={estilos.textoAjuda}>
          Vincule atletas cadastrados pelo email. Apenas os seus vinculos aparecem nesta lista.
        </Text>

        <TextInput
          value={emailAtleta}
          onChangeText={setEmailAtleta}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="email do atleta"
          placeholderTextColor={cores.textoSecundario}
          style={estilos.campo}
        />

        <TouchableOpacity style={estilos.botao} onPress={vincularAtleta} disabled={salvando}>
          <Text style={estilos.textoBotao}>{salvando ? 'Vinculando...' : 'Vincular atleta'}</Text>
        </TouchableOpacity>

        {erro ? (
          <View style={estilos.alertaErro}>
            <Text style={estilos.textoErro}>{erro}</Text>
          </View>
        ) : null}

        {mensagem ? (
          <View style={estilos.alertaSucesso}>
            <Text style={estilos.textoSucesso}>{mensagem}</Text>
          </View>
        ) : null}

        {carregando ? (
          <ActivityIndicator size="large" color={cores.vermelhoPadrao} />
        ) : vinculos.length === 0 ? (
          <Text style={estilos.vazio}>Nenhum atleta vinculado ainda.</Text>
        ) : (
          vinculos.map((vinculo) => {
            const atleta = vinculo.athlete;

            return (
              <View key={vinculo.id} style={estilos.cartao}>
                <Text style={estilos.nome}>{atleta?.name || 'Atleta'}</Text>
                <Text style={estilos.detalhe}>{atleta?.email}</Text>
                <Text style={estilos.detalhe}>Role: {atleta?.role}</Text>
                <TouchableOpacity
                  style={estilos.botaoSecundario}
                  onPress={() => removerVinculo(vinculo.id)}
                >
                  <Text style={estilos.textoBotao}>Remover vinculo</Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

export default TelaMeusAtletas;
