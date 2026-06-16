import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { usarAutenticacao } from '../contextos/ContextoAutenticacao';
import { usarTema } from '../contextos/ContextoTema';

const TelaLogin = ({ navigation }) => {
  const { entrar, sair, carregando, erro } = usarAutenticacao();
  const { temaTemaEscuro } = usarTema();

  const [dadosFormulario, setDadosFormulario] = useState({
    email: '',
    senha: '',
    tipoUsuario: 'NUTRITIONIST',
  });

  const tratarEntrada = async () => {
    if (!dadosFormulario.email || !dadosFormulario.senha) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos.');
      return;
    }

    const usuarioLogado = await entrar(
      dadosFormulario.email.trim(),
      dadosFormulario.senha,
      dadosFormulario.tipoUsuario
    );

    if (usuarioLogado) {
      const papelNoBanco = usuarioLogado?.role;
      const tipoValido = dadosFormulario.tipoUsuario;

      if (papelNoBanco && papelNoBanco !== tipoValido) {
        await sair(); 
        Alert.alert(
          'Acesso Negado', 
          `Este usuário está cadastrado como ${papelNoBanco === 'ATHLETE' ? 'Atleta' : papelNoBanco === 'COACH' ? 'Treinador' : 'Nutricionista'}. Selecione a opção correta.`
        );
      }
    } else {
      Alert.alert('Erro', erro || 'Falha ao fazer login. Verifique suas credenciais.');
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
    conteiner: { flex: 1, backgroundColor: cores.fundoApp, justifyContent: 'center', alignItems: 'center', padding: 24 },
    caixaLogin: { width: '100%', maxWidth: 420, backgroundColor: cores.fundoCartao, borderColor: cores.bordaCartao, borderWidth: 1, borderRadius: 12, padding: 28, gap: 14 },
    logo: { alignItems: 'center', marginBottom: 32 },
    textoLogoGrande: { fontSize: 32, fontWeight: 'bold', color: cores.vermelhoPadrao, marginBottom: 2, letterSpacing: -0.5 },
    textoLogoPequeno: { color: cores.textoSecundario, fontSize: 13, fontWeight: '600', textAlign: 'center' },
    formulario: { gap: 16 },
    grupoFormulario: { gap: 6 },
    rotulo: { fontWeight: '500', color: cores.textoPrincipal, fontSize: 14 },
    entrada: { paddingVertical: 12, paddingHorizontal: 16, borderWidth: 1, borderColor: cores.bordaInput, borderRadius: 10, fontSize: 15, backgroundColor: cores.fundoInput, color: cores.textoPrincipal },
    selecaoTipo: { gap: 8, marginTop: 4 },
    conteinerBotoesTipo: { flexDirection: 'row', gap: 9 },
    botaoTipo: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, borderColor: cores.bordaInput, backgroundColor: cores.fundoInput },
    botaoTipoSelecionado: { borderColor: cores.vermelhoPadrao, backgroundColor: 'rgba(196, 30, 58, 0.08)' },
    textoBotaoTipo: { textAlign: 'center', fontSize: 13, fontWeight: '600', color: cores.textoSecundario },
    textoBotaoTipoSelecionado: { color: cores.vermelhoPadrao },
    botaoEntrar: { backgroundColor: cores.vermelhoPadrao, paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 12 },
    botaoCadastro: { paddingVertical: 12, alignItems: 'center' },
    textoCadastro: { color: cores.vermelhoPadrao, fontSize: 14, fontWeight: '600' },
    textoBotaoEntrar: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
    carregando: { marginTop: 16, alignItems: 'center' },
    caixaErro: { position: 'absolute', bottom: 24, left: 24, right: 24, backgroundColor: '#ef4444', padding: 16, borderRadius: 10 },
    textoErro: { color: '#ffffff', fontWeight: '600', textAlign: 'center' },
  });

  return (
    <View style={estilos.conteiner}>
      <View style={estilos.caixaLogin}>
        <View style={estilos.logo}>
          <Text style={estilos.textoLogoGrande}>NESC</Text>
          <Text style={estilos.textoLogoPequeno}>NutriEsportiva São Camilo</Text>
        </View>

        <View style={estilos.formulario}>
          <View style={estilos.grupoFormulario}>
            <Text style={estilos.rotulo}>E-mail</Text>
            <TextInput value={dadosFormulario.email} onChangeText={(t) => setDadosFormulario({ ...dadosFormulario, email: t })} style={estilos.entrada} editable={!carregando} placeholder="email@exemplo.com" placeholderTextColor={cores.textoSecundario} autoCapitalize="none" keyboardType="email-address" />
          </View>

          <View style={estilos.grupoFormulario}>
            <Text style={estilos.rotulo}>Senha</Text>
            <TextInput value={dadosFormulario.senha} onChangeText={(t) => setDadosFormulario({ ...dadosFormulario, senha: t })} style={estilos.entrada} secureTextEntry editable={!carregando} placeholder="Senha" placeholderTextColor={cores.textoSecundario} autoCapitalize="none" />
          </View>

          <View style={estilos.selecaoTipo}>
            <Text style={estilos.rotulo}>Perfil</Text>
            <View style={estilos.conteinerBotoesTipo}> 
              {['ATHLETE', 'NUTRITIONIST', 'COACH'].map((role) => (
                <TouchableOpacity key={role} style={[estilos.botaoTipo, dadosFormulario.tipoUsuario === role && estilos.botaoTipoSelecionado]} onPress={() => setDadosFormulario({ ...dadosFormulario, tipoUsuario: role })} disabled={carregando}>
                  <Text style={[estilos.textoBotaoTipo, dadosFormulario.tipoUsuario === role && estilos.textoBotaoTipoSelecionado]}>
                    {role === 'ATHLETE' ? 'Atleta' : role === 'COACH' ? 'Treinador' : 'Nutricionista'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {carregando ? (
            <View style={estilos.carregando}><ActivityIndicator size="large" color={cores.vermelhoPadrao} /></View>
          ) : (
            <TouchableOpacity style={estilos.botaoEntrar} onPress={tratarEntrada}><Text style={estilos.textoBotaoEntrar}>Entrar</Text></TouchableOpacity>
          )}

          <TouchableOpacity style={estilos.botaoCadastro} onPress={() => navigation.navigate('Cadastro')} disabled={carregando}>
            <Text style={estilos.textoCadastro}>Criar nova conta</Text>
          </TouchableOpacity>
        </View>
      </View>
      {erro ? <View style={estilos.caixaErro}><Text style={estilos.textoErro}>{String(erro)}</Text></View> : null}
    </View>
  );
};

export default TelaLogin;