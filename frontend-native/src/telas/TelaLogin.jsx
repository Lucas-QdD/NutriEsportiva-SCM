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

const TelaLogin = () => {
  const { entrar, carregando, erro, limparErro } = usarAutenticacao();

  const [dadosFormulario, setDadosFormulario] = useState({
    nomeUsuario: '',
    senha: '',
    tipoUsuario: 'NUTRICIONISTA',
  });

  const tratarEntrada = async () => {
    const sucesso = await entrar(
      dadosFormulario.nomeUsuario,
      dadosFormulario.senha,
      dadosFormulario.tipoUsuario
    );
    if (!sucesso) {
      Alert.alert('Erro', erro || 'Falha ao fazer login');
    }
  };

  const estilos = StyleSheet.create({
    conteiner: {
      flex: 1,
      backgroundColor: '#f3f4f6', 
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    caixaLogin: {
      backgroundColor: '#ffffff',
      borderRadius: 10,
      padding: 50,
      width: '100%',
      maxWidth: 420,
      borderWidth: 2,
      borderColor: '#000000',
      shadowColor: '#000000',
      shadowOffset: {
        width: 0,
        height: 20,
      },
      shadowOpacity: 0.12,
      shadowRadius: 60,
      elevation: 20,
    },
    logo: {
      alignItems: 'center',
      marginBottom: 45,
    },
    textoLogoGrande: {
      fontSize: 32,
      fontWeight: '800',
      color: '#c41e3a',
      marginTop: 15,
      marginBottom: 3,
      letterSpacing: -0.5,
    },
    textoLogoPequeno: {
      color: '#6b7280', 
      fontSize: 13,
      fontWeight: '600',
      letterSpacing: 1,
    },
    formulario: {
      gap: 20,
    },
    grupoFormulario: {
      gap: 8,
    },
    rotulo: {
      fontWeight: '500',
      color: '#374151',
      fontSize: 14,
    },
    entrada: {
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: '#d1d5db', 
      borderRadius: 10,
      fontSize: 14,
      backgroundColor: '#ffffff',
    },
    entradaFoco: {
      borderColor: '#c41e3a',
      shadowColor: '#c41e3a',
      shadowOffset: {
        width: 0,
        height: 0,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
    },
    selecaoTipo: {
      gap: 8,
    },
    rotuloSelecao: {
      fontWeight: '500',
      color: '#374151',
      fontSize: 14,
    },
    conteinerBotoesTipo: {
      flexDirection: 'row',
      gap: 10,
    },
    botaoTipo: {
      flex: 1,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 10,
      borderWidth: 1.5,
      borderColor: '#d1d5db',
      backgroundColor: '#ffffff',
    },
    botaoTipoSelecionado: {
      borderColor: '#c41e3a',
      backgroundColor: 'rgba(196, 30, 58, 0.05)',
    },
    textoBotaoTipo: {
      textAlign: 'center',
      fontSize: 14,
      fontWeight: '600',
      color: '#374151',
    },
    textoBotaoTipoSelecionado: {
      color: '#c41e3a',
    },
    botaoEntrar: {
      backgroundColor: '#c41e3a',
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 10,
      alignItems: 'center',
      marginTop: 10,
      shadowColor: '#000000',
      shadowOffset: {
        width: 0,
        height: 6,
      },
      shadowOpacity: 0.15,
      shadowRadius: 20,
      elevation: 6,
    },
    textoBotaoEntrar: {
      color: '#ffffff',
      fontSize: 14,
      fontWeight: '600',
    },
    carregando: {
      marginTop: 20,
    },
  });

  return (
    <View style={estilos.conteiner}>
      <View style={estilos.caixaLogin}>
        {/* Logo */}
        <View style={estilos.logo}>
          <Text style={estilos.textoLogoGrande}>SAO</Text>
          <Text style={estilos.textoLogoPequeno}>NutriEsportiva</Text>
          <Text style={estilos.textoLogoPequeno}>SÃO CAMILO</Text>
        </View>

        {/* Formulário */}
        <View style={estilos.formulario}>
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
              placeholderTextColor="#9ca3af"
            />
          </View>

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
              placeholderTextColor="#9ca3af"
            />
          </View>

          {/* Seleção de Tipo de Usuário */}
          <View style={estilos.selecaoTipo}>
            <Text style={estilos.rotuloSelecao}>Tipo de Usuário</Text>
            <View style={estilos.conteinerBotoesTipo}>
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
            </View>
          </View>

          {/* Botão Entrar */}
          <TouchableOpacity
            style={estilos.botaoEntrar}
            onPress={tratarEntrada}
            disabled={carregando}
          >
            <Text style={estilos.textoBotaoEntrar}>
              {carregando ? 'Entrando...' : 'Entrar'}
            </Text>
          </TouchableOpacity>

          {carregando && (
            <View style={estilos.carregando}>
              <ActivityIndicator size="large" color="#c41e3a" />
            </View>
          )}
        </View>
      </View>

      {/* Barra de Erro */}
      {erro ? (
        <View
         style={{
          position: 'absolute',
          bottom: 20,
          left: 20,
          right: 20,
          backgroundColor: '#ef4444',
          padding: 16,
          borderRadius: 10,
         }}
       >
         <Text style={{ color: '#ffffff', fontWeight: '600' }}>
            {String(erro)}
        </Text>
      </View>
    ) : null}
    </View>
  );
};

export default TelaLogin;
