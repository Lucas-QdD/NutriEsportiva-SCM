import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { usarAutenticacao } from '../contextos/ContextoAutenticacao';
import { usarTema } from '../contextos/ContextoTema';
import { api } from '../services/api';

const ROTULOS_ROLE = {
  ATHLETE: 'Atleta',
  NUTRITIONIST: 'Nutricionista',
  COACH: 'Treinador',
};

function mensagemErroConta(error) {
  const status = error?.status;
  const mensagem = error?.message || '';

  if (status === 409 || mensagem.toLowerCase().includes('email')) {
    return 'Este email ja esta em uso por outra conta.';
  }

  if (status === 401) {
    return 'Sua sessao expirou. Faca login novamente.';
  }

  if (status === 400) {
    return mensagem || 'Confira os dados informados.';
  }

  return mensagem || 'Nao foi possivel atualizar seus dados.';
}

const TelaMinhaConta = () => {
  const { usuario, atualizarUsuario, sair } = usarAutenticacao();
  const { temaTemaEscuro } = usarTema();

  const [name, setName] = useState(usuario?.name || '');
  const [email, setEmail] = useState(usuario?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    setName(usuario?.name || '');
    setEmail(usuario?.email || '');
  }, [usuario?.email, usuario?.name]);

  const salvar = async () => {
    const nomeLimpo = name.trim();
    const emailLimpo = email.trim().toLowerCase();

    setErro('');
    setMensagem('');

    if (!nomeLimpo || !emailLimpo) {
      setErro('Preencha nome e email para continuar.');
      return;
    }

    if (password && password.length < 6) {
      setErro('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (password && password !== confirmPassword) {
      setErro('A confirmacao da senha nao confere.');
      return;
    }

    setSalvando(true);

    try {
      const payload = {
        name: nomeLimpo,
        email: emailLimpo,
        role: usuario.role,
        teamId: usuario.teamId || null,
      };

      // Password e opcional: so enviamos quando o usuario realmente preenche.
      if (password) {
        payload.password = password;
      }

      const userAtualizado = await api.put(`/users/${usuario.id}`, payload);

      await atualizarUsuario(userAtualizado);
      setPassword('');
      setConfirmPassword('');
      setMensagem('Dados atualizados com sucesso.');
    } catch (error) {
      setErro(mensagemErroConta(error));
    } finally {
      setSalvando(false);
    }
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
    conteudo: { padding: 30 },
    cartao: {
      backgroundColor: cores.fundoCartao,
      borderColor: cores.bordaCartao,
      borderWidth: 1,
      borderRadius: 8,
      padding: 18,
      gap: 12,
    },
    rotulo: { color: cores.textoPrincipal, fontSize: 14, fontWeight: '700' },
    campo: {
      backgroundColor: cores.fundoInput,
      borderColor: cores.bordaCartao,
      borderWidth: 1,
      borderRadius: 8,
      color: cores.textoInput,
      fontSize: 15,
      paddingHorizontal: 14,
      paddingVertical: 11,
    },
    campoSomenteLeitura: {
      backgroundColor: temaTemaEscuro ? '#252525' : '#f3f4f6',
      color: cores.textoSecundario,
    },
    ajuda: { color: cores.textoSecundario, fontSize: 13, lineHeight: 18 },
    botaoSalvar: {
      backgroundColor: cores.vermelhoPadrao,
      borderRadius: 8,
      paddingVertical: 13,
      alignItems: 'center',
      marginTop: 8,
    },
    botaoSair: {
      backgroundColor: '#dc2626',
      borderRadius: 8,
      paddingVertical: 13,
      alignItems: 'center',
      marginTop: 12,
    },
    textoBotao: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
    alertaErro: { backgroundColor: '#fee2e2', borderRadius: 8, padding: 12 },
    textoErro: { color: '#b91c1c', fontSize: 14 },
    alertaSucesso: { backgroundColor: '#dcfce7', borderRadius: 8, padding: 12 },
    textoSucesso: { color: '#166534', fontSize: 14 },
  });

  return (
    <ScrollView style={estilos.conteiner}>
      <View style={estilos.cabecalho}>
        <Text style={estilos.tituloCabecalho}>Minha Conta</Text>
      </View>

      <View style={estilos.conteudo}>
        <View style={estilos.cartao}>
          <Text style={estilos.rotulo}>Perfil</Text>
          <TextInput
            value={ROTULOS_ROLE[usuario?.role] || usuario?.role || ''}
            editable={false}
            style={[estilos.campo, estilos.campoSomenteLeitura]}
          />

          <Text style={estilos.rotulo}>Nome</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            placeholder="Seu nome"
            placeholderTextColor={cores.textoSecundario}
            style={estilos.campo}
          />

          <Text style={estilos.rotulo}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="seu@email.com"
            placeholderTextColor={cores.textoSecundario}
            style={estilos.campo}
          />

          <Text style={estilos.rotulo}>Nova senha</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Deixe em branco para manter a atual"
            placeholderTextColor={cores.textoSecundario}
            style={estilos.campo}
          />

          <Text style={estilos.rotulo}>Confirmar nova senha</Text>
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            placeholder="Repita a nova senha"
            placeholderTextColor={cores.textoSecundario}
            style={estilos.campo}
          />

          <Text style={estilos.ajuda}>
            A senha so sera alterada se os dois campos de senha forem preenchidos corretamente.
          </Text>

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

          <TouchableOpacity style={estilos.botaoSalvar} onPress={salvar} disabled={salvando}>
            {salvando ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={estilos.textoBotao}>Salvar dados</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={estilos.botaoSair} onPress={sair}>
            <Text style={estilos.textoBotao}>Sair</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default TelaMinhaConta;
