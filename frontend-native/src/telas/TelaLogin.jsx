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
import { usarTema } from '../contextos/ContextoTema'; // Importado para manter consistência com o Dark Mode

const TelaLogin = ({ navigation }) => {
  // Puxamos também a função 'sair' para deslogar caso o papel esteja incorreto
  const { entrar, sair, carregando, erro } = usarAutenticacao();
  const { temaTemaEscuro } = usarTema();

  const [dadosFormulario, setDadosFormulario] = useState({
    nomeUsuario: '',
    senha: '',
    tipoUsuario: 'NUTRITIONIST',
  });

  const tratarEntrada = async () => {
    if (!dadosFormulario.nomeUsuario || !dadosFormulario.senha) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos.');
      return;
    }

    // 1. Tenta fazer o login padrão na API/Contexto
    const usuarioLogado = await entrar(
      dadosFormulario.nomeUsuario,
      dadosFormulario.senha,
      dadosFormulario.tipoUsuario
    );

    if (usuarioLogado) {
      // 2. Restrição de Segurança: Verifica se o papel no banco bate com a seleção do botão
      // Caso sua função entrar já retorne o objeto usuário, usamos ele; senão, validamos pelo estado global atualizado
      const papelNoBanco = usuarioLogado?.role;

      const tipoValido = dadosFormulario.tipoUsuario;

      if (papelNoBanco && papelNoBanco !== tipoValido && papelNoBanco !== dadosFormulario.tipoUsuario) {
        // Se tentou entrar como Nutricionista sendo Atleta (ou vice-versa), barra o acesso!
        await sair(); 
        Alert.alert(
          'Acesso Negado', 
          `Este usuário está cadastrado como ${papelNoBanco === 'ATHLETE' ? 'Atleta' : papelNoBanco === 'COACH' ? 'Treinador' : 'Nutricionista'}. Selecione a opção correta para entrar.`
        );
      }
    } else {
      Alert.alert('Erro', erro || 'Falha ao fazer login. Verifique suas credenciais.');
    }
  };

  // Mapeamento dinâmico de cores idêntico ao restante do app
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
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    caixaLogin: {
      backgroundColor: cores.fundoCartao,
      borderRadius: 12,
      padding: 32,
      width: '100%',
      maxWidth: 400,
      borderWidth: 1,
      borderColor: cores.bordaCartao,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: temaTemaEscuro ? 0.3 : 0.08,
      shadowRadius: 12,
      elevation: 5,
    },
    logo: {
      alignItems: 'center',
      marginBottom: 32,
    },
    textoLogoGrande: {
      fontSize: 32,
      fontWeight: 'bold',
      color: cores.vermelhoPadrao,
      marginBottom: 2,
      letterSpacing: -0.5,
    },
    textoLogoPequeno: {
      color: cores.textoSecundario, 
      fontSize: 13,
      fontWeight: '600',
      letterSpacing: 1,
      textAlign: 'center',
    },
    formulario: {
      gap: 16,
    },
    grupoFormulario: {
      gap: 6,
    },
    rotulo: {
      fontWeight: '500',
      color: cores.textoPrincipal,
      fontSize: 14,
    },
    entrada: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: cores.bordaInput, 
      borderRadius: 10,
      fontSize: 15,
      backgroundColor: cores.fundoInput,
      color: cores.textoPrincipal,
    },
    selecaoTipo: {
      gap: 8,
      marginTop: 4,
    },
    conteinerBotoesTipo: {
      flexDirection: 'row',
      gap: 10,
    },
    botaoTipo: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 10,
      borderWidth: 1.5,
      borderColor: cores.bordaInput,
      backgroundColor: cores.fundoInput,
    },
    botaoTipoSelecionado: {
      borderColor: cores.vermelhoPadrao,
      backgroundColor: 'rgba(196, 30, 58, 0.08)',
    },
    textoBotaoTipo: {
      textAlign: 'center',
      fontSize: 14,
      fontWeight: '600',
      color: cores.textoSecundario,
    },
    textoBotaoTipoSelecionado: {
      color: cores.vermelhoPadrao,
    },
    botaoEntrar: {
      backgroundColor: cores.vermelhoPadrao,
      paddingVertical: 14,
      borderRadius: 10,
      alignItems: 'center',
      marginTop: 12,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    botaoCadastro: {
      paddingVertical: 12,
      alignItems: 'center',
    },
    textoCadastro: {
      color: cores.vermelhoPadrao,
      fontSize: 14,
      fontWeight: '600',
    },
    textoBotaoEntrar: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '600',
    },
    carregando: {
      marginTop: 16,
      alignItems: 'center',
    },
    caixaErro: {
      position: 'absolute',
      bottom: 24,
      left: 24,
      right: 24,
      backgroundColor: '#ef4444',
      padding: 16,
      borderRadius: 10,
    },
    textoErro: {
      color: '#ffffff',
      fontWeight: '600',
      textAlign: 'center',
    },
  });

  return (
    <View style={estilos.conteiner}>
      <View style={estilos.caixaLogin}>
        {/* Logo */}
        <View style={estilos.logo}>
          <Text style={estilos.textoLogoGrande}>NESC</Text>
          <Text style={estilos.textoLogoPequeno}>NutriEsportiva</Text>
          <Text style={estilos.textoLogoPequeno}>São Camilo</Text>
        </View>

        {/* Formulário */}
        <View style={estilos.formulario}>
          {/* Campo Usuário */}
          <View style={estilos.grupoFormulario}>
            <Text style={estilos.rotulo}>Usuário</Text>
            <TextInput
              value={dadosFormulario.nomeUsuario}
              onChangeText={(texto) =>
                setDadosFormulario({ ...dadosFormulario, nomeUsuario: texto })
              }
              style={estilos.entrada}
              editable={!carregando}
              placeholder="Digite seu usuário"
              placeholderTextColor={cores.textoSecundario}
              autoCapitalize="none"
            />
          </View>

          {/* Campo Senha */}
          <View style={estilos.grupoFormulario}>
            <Text style={estilos.rotulo}>Senha</Text>
            <TextInput
              value={dadosFormulario.senha}
              onChangeText={(texto) =>
                setDadosFormulario({ ...dadosFormulario, senha: texto })
              }
              style={estilos.entrada}
              secureTextEntry
              editable={!carregando}
              placeholder="Digite sua senha"
              placeholderTextColor={cores.textoSecundario}
              autoCapitalize="none"
            />
          </View>

          {/* Seleção de Tipo de Usuário */}
          <View style={estilos.selecaoTipo}>
            <Text style={estilos.rotulo}>Tipo de Usuário</Text>
            <View style={estilos.conteinerBotoesTipo}>
              {/* Botão Nutricionista */}
              <TouchableOpacity
                style={[
                  estilos.botaoTipo,
                  dadosFormulario.tipoUsuario === 'NUTRITIONIST' && estilos.botaoTipoSelecionado,
                ]}
                onPress={() =>
                  setDadosFormulario({ ...dadosFormulario, tipoUsuario: 'NUTRITIONIST' })
                }
                disabled={carregando}
              >
                <Text
                  style={[
                    estilos.textoBotaoTipo,
                    dadosFormulario.tipoUsuario === 'NUTRITIONIST' && estilos.textoBotaoTipoSelecionado,
                  ]}
                >
                  Nutricionista
                </Text>
              </TouchableOpacity>
              
              {/* Botão Atleta */}
              <TouchableOpacity
                style={[
                  estilos.botaoTipo,
                  dadosFormulario.tipoUsuario === 'ATHLETE' && estilos.botaoTipoSelecionado,
                ]}
                onPress={() =>
                  setDadosFormulario({ ...dadosFormulario, tipoUsuario: 'ATHLETE' })
                }
                disabled={carregando}
              >
                <Text
                  style={[
                    estilos.textoBotaoTipo,
                    dadosFormulario.tipoUsuario === 'ATHLETE' && estilos.textoBotaoTipoSelecionado,
                  ]}
                >
                  Atleta
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  estilos.botaoTipo,
                  dadosFormulario.tipoUsuario === 'COACH' && estilos.botaoTipoSelecionado,
                ]}
                onPress={() =>
                  setDadosFormulario({ ...dadosFormulario, tipoUsuario: 'COACH' })
                }
                disabled={carregando}
              >
                <Text
                  style={[
                    estilos.textoBotaoTipo,
                    dadosFormulario.tipoUsuario === 'COACH' && estilos.textoBotaoTipoSelecionado,
                  ]}
                >
                  Treinador
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Botão Entrar / Indicador de Carregamento */}
          {carregando ? (
            <View style={estilos.carregando}>
              <ActivityIndicator size="large" color={cores.vermelhoPadrao} />
            </View>
          ) : (
            <TouchableOpacity
              style={estilos.botaoEntrar}
              onPress={tratarEntrada}
            >
              <Text style={estilos.textoBotaoEntrar}>Entrar</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={estilos.botaoCadastro}
            onPress={() => navigation.navigate('Cadastro')}
            disabled={carregando}
          >
            <Text style={estilos.textoCadastro}>Criar nova conta</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Snackbar / Alerta de Erro de conexão/credenciais erradas */}
      {erro && (
        <View style={estilos.caixaErro}>
          <Text style={estilos.textoErro}>{String(erro)}</Text>
        </View>
      )}
    </View>
  );
};

export default TelaLogin;
