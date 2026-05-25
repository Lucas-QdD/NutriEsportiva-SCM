import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';

const ContextoAutenticacao = createContext();

const ROLES = ['ATHLETE', 'NUTRITIONIST', 'COACH'];

export const ProvedorAutenticacao = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);
  const [tipoUsuario, setTipoUsuario] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [restaurando, setRestaurando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    async function restaurarSessao() {
      try {
        const [usuarioSalvo, tokenSalvo, roleSalva] = await Promise.all([
          AsyncStorage.getItem('user'),
          AsyncStorage.getItem('token'),
          AsyncStorage.getItem('tipoUsuario'),
        ]);

        if (usuarioSalvo && tokenSalvo) {
          const user = JSON.parse(usuarioSalvo);
          setUsuario(user);
          setToken(tokenSalvo);
          setTipoUsuario(user.role || roleSalva || null);
        }
      } catch (error) {
        await AsyncStorage.multiRemove(['user', 'usuario', 'token', 'tipoUsuario']);
        setErro('Nao foi possivel restaurar a sessao.');
      } finally {
        setRestaurando(false);
      }
    }

    restaurarSessao();
  }, []);

  const entrar = useCallback(async (email, password, roleSelecionada) => {
    setCarregando(true);
    setErro('');

    try {
      if (!email || !password || !roleSelecionada) {
        setErro('Preencha todos os campos do login.');
        return false;
      }

      const dados = await api.post('/login', { email, password });
      const user = dados.user;
      const jwtToken = dados.token;

      if (!user || !jwtToken || !ROLES.includes(user.role)) {
        setErro('Resposta invalida do servidor.');
        return false;
      }

      if (user.role !== roleSelecionada) {
        setErro('Acesso negado. Selecione o perfil correto para esta conta.');
        return false;
      }

      setUsuario(user);
      setToken(jwtToken);
      setTipoUsuario(user.role);

      await AsyncStorage.multiSet([
        ['user', JSON.stringify(user)],
        ['usuario', JSON.stringify(user)],
        ['token', jwtToken],
        ['tipoUsuario', user.role],
      ]);

      return user;
    } catch (error) {
      setErro(error.message || 'Erro ao conectar com o servidor.');
      return false;
    } finally {
      setCarregando(false);
    }
  }, []);

  const sair = useCallback(async () => {
    try {
      setUsuario(null);
      setToken(null);
      setTipoUsuario(null);
      setErro('');
      await AsyncStorage.multiRemove(['user', 'usuario', 'token', 'tipoUsuario']);
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
        token,
        tipoUsuario,
        carregando,
        restaurando,
        erro,
        entrar,
        sair,
        limparErro,
        autenticado: !!usuario && !!token,
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
