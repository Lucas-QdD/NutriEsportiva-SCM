import React, { useState } from 'react';
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
import { usarTema } from '../contextos/ContextoTema';

const ROLES = [
  { value: 'ATHLETE', label: 'Atleta' },
  { value: 'NUTRITIONIST', label: 'Nutricionista' },
  { value: 'COACH', label: 'Treinador' },
];

const TelaCadastro = ({ navigation }) => {
  const { temaTemaEscuro } = usarTema();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'ATHLETE',
  });
  const [carregando, setCarregando] = useState(false);

  const atualizarCampo = (campo, valor) => {
    setForm((anterior) => ({ ...anterior, [campo]: valor }));
  };

  const cadastrar = async () => {
    if (!form.name || !form.email || !form.password || !form.role) {
      Alert.alert('Atencao', 'Preencha todos os campos.');
      return;
    }

    setCarregando(true);

    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      };

      console.log('[Cadastro] Payload enviado para POST /users:', payload);

      const resposta = await api.post('/users', payload);

      console.log('[Cadastro] Resposta da API:', resposta);

      Alert.alert('Sucesso', 'Conta criada. Agora faca login.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.log('[Cadastro] Erro retornado pela API:', {
        message: error.message,
        status: error.status,
        data: error.data,
      });
      Alert.alert('Erro', error.message || 'Nao foi possivel criar a conta.');
    } finally {
      setCarregando(false);
    }
  };

  const cores = {
    fundoApp: temaTemaEscuro ? '#121212' : '#f3f4f6',
    fundoCartao: temaTemaEscuro ? '#1e1e1e' : '#ffffff',
    bordaCartao: temaTemaEscuro ? '#2d2d2d' : '#e5e7eb',
    textoPrincipal: temaTemaEscuro ? '#ffffff' : '#1f2937',
    textoSecundario: temaTemaEscuro ? '#a3a3a3' : '#6b7280',
    fundoInput: temaTemaEscuro ? '#2a2a2a' : '#ffffff',
    bordaInput: temaTemaEscuro ? '#404040' : '#d1d5db',
    vermelhoPadrao: '#c41e3a',
  };

  const estilos = StyleSheet.create({
    conteiner: {
      flex: 1,
      backgroundColor: cores.fundoApp,
      padding: 24,
    },
    conteudo: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    cartao: {
      width: '100%',
      maxWidth: 420,
      backgroundColor: cores.fundoCartao,
      borderColor: cores.bordaCartao,
      borderWidth: 1,
      borderRadius: 12,
      padding: 28,
      gap: 14,
    },
    titulo: {
      color: cores.textoPrincipal,
      fontSize: 26,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 10,
    },
    rotulo: {
      color: cores.textoPrincipal,
      fontSize: 14,
      fontWeight: '600',
    },
    entrada: {
      backgroundColor: cores.fundoInput,
      borderColor: cores.bordaInput,
      borderWidth: 1,
      borderRadius: 10,
      color: cores.textoPrincipal,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 15,
    },
    linhaRoles: {
      flexDirection: 'row',
      gap: 8,
    },
    botaoRole: {
      flex: 1,
      borderColor: cores.bordaInput,
      borderWidth: 1.5,
      borderRadius: 10,
      paddingVertical: 10,
      alignItems: 'center',
    },
    botaoRoleAtivo: {
      borderColor: cores.vermelhoPadrao,
      backgroundColor: 'rgba(196, 30, 58, 0.08)',
    },
    textoRole: {
      color: cores.textoSecundario,
      fontSize: 13,
      fontWeight: '600',
    },
    textoRoleAtivo: {
      color: cores.vermelhoPadrao,
    },
    botaoCadastrar: {
      backgroundColor: cores.vermelhoPadrao,
      borderRadius: 10,
      paddingVertical: 14,
      alignItems: 'center',
      marginTop: 8,
    },
    textoBotaoCadastrar: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '700',
    },
    botaoVoltar: {
      paddingVertical: 10,
      alignItems: 'center',
    },
    textoVoltar: {
      color: cores.vermelhoPadrao,
      fontSize: 14,
      fontWeight: '600',
    },
  });

  return (
    <ScrollView style={estilos.conteiner} contentContainerStyle={estilos.conteudo}>
      <View style={estilos.cartao}>
        <Text style={estilos.titulo}>Criar conta</Text>

        <Text style={estilos.rotulo}>Nome</Text>
        <TextInput
          value={form.name}
          onChangeText={(texto) => atualizarCampo('name', texto)}
          style={estilos.entrada}
          placeholder="Seu nome"
          placeholderTextColor={cores.textoSecundario}
        />

        <Text style={estilos.rotulo}>Email</Text>
        <TextInput
          value={form.email}
          onChangeText={(texto) => atualizarCampo('email', texto)}
          style={estilos.entrada}
          placeholder="email@exemplo.com"
          placeholderTextColor={cores.textoSecundario}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={estilos.rotulo}>Senha</Text>
        <TextInput
          value={form.password}
          onChangeText={(texto) => atualizarCampo('password', texto)}
          style={estilos.entrada}
          placeholder="Senha"
          placeholderTextColor={cores.textoSecundario}
          secureTextEntry
        />

        <Text style={estilos.rotulo}>Perfil</Text>
        <View style={estilos.linhaRoles}>
          {ROLES.map((role) => (
            <TouchableOpacity
              key={role.value}
              style={[estilos.botaoRole, form.role === role.value && estilos.botaoRoleAtivo]}
              onPress={() => atualizarCampo('role', role.value)}
              disabled={carregando}
            >
              <Text style={[estilos.textoRole, form.role === role.value && estilos.textoRoleAtivo]}>
                {role.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={estilos.botaoCadastrar}
          onPress={cadastrar}
          disabled={carregando}
        >
          {carregando ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={estilos.textoBotaoCadastrar}>Cadastrar</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={estilos.botaoVoltar} onPress={() => navigation.goBack()}>
          <Text style={estilos.textoVoltar}>Voltar para login</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default TelaCadastro;
