import React, { createContext, useContext, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ContextoAutenticacao = createContext();

export const ProvedorAutenticacao = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [tipoUsuario, setTipoUsuario] = useState('NUTRICIONISTA');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  const entrar = useCallback(async (nomeUsuario, senha, tipoDeUsuario) => {
    setCarregando(true);
    setErro('');

    try {
      if (!nomeUsuario || !senha || !tipoDeUsuario) {
        setErro('Preencha todos os campos do login.');
        setCarregando(false);
        return false;
      } 

      const resposta = await fetch('http://192.168.100.103:3333/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: nomeUsuario,
          senha: senha,
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        setErro(dados.error || 'Erro no login');
        setCarregando(false);
        return false;
      }

      if (dados.usuario.papel !== tipoDeUsuario) {
        const perfilCorreto = dados.usuario.papel === 'ATLETA' ? 'Atleta' : 'Nutricionista';
        setErro(`Acesso negado. Esta conta é de um ${perfilCorreto}.`);
        setCarregando(false);
        return false;
      }
      setUsuario(dados.usuario);
      setTipoUsuario(dados.usuario.papel);

      await AsyncStorage.setItem('usuario', JSON.stringify(dados.usuario));
      await AsyncStorage.setItem('tipoUsuario', dados.usuario.papel);

      setCarregando(false);
      return true;

    } catch (erro) {
      setErro('Erro ao fazer login: ' + erro.message);
      setCarregando(false);
      return false;
    }
  }, []);

  const sair = useCallback(async () => {
    try {
      setUsuario(null);
      setTipoUsuario('NUTRICIONISTA');
      setErro('');
      await AsyncStorage.removeItem('usuario');
      await AsyncStorage.removeItem('tipoUsuario');
    } catch (error) {
      setErro('Erro ao fazer logout: ' + error.message);
    }
  }, []);

  const limparErro = useCallback(() => {
    setErro('');
  }, []);

  return (
    <ContextoAutenticacao.Provider
      value={{
        usuario,
        tipoUsuario,
        carregando,
        erro,
        entrar,
        sair,
        limparErro,
        autenticado: !!usuario,
      }}
    >
      {children}
    </ContextoAutenticacao.Provider>
  );
};

export const usarAutenticacao = () => {
  const context = useContext(ContextoAutenticacao);
  if (!context) {
    throw new Error('usarAutenticacao deve ser usado dentro de um ProvedorAutenticacao');
  }
  return context;
};