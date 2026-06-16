import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';

const ContextoAutenticacao = createContext();
const ROLES = ['ATHLETE', 'COACH', 'NUTRITIONIST'];

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
        const [usuarioSalvo, tokenSalvo] = await Promise.all([
          AsyncStorage.getItem('user'),
          AsyncStorage.getItem('token'),
        ]);
        if (usuarioSalvo && tokenSalvo) {
          const user = JSON.parse(usuarioSalvo);
          setUsuario(user);
          setToken(tokenSalvo);
          setTipoUsuario(user.role || null);
        }
      } catch (error) {
        await AsyncStorage.multiRemove(['user', 'token']);
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
        setErro('Resposta inválida do servidor.');
        return false;
      }

      if (user.role !== roleSelecionada) {
        setErro('Perfil incorreto selecionado.');
        return false;
      }

      setUsuario(user);
      setToken(jwtToken);
      setTipoUsuario(user.role);

      await AsyncStorage.multiSet([
        ['user', JSON.stringify(user)],
        ['token', jwtToken],
      ]);
      return user;
    } catch (error) {
      setErro(error.message || 'Erro de autenticação.');
      return false;
    } finally {
      setCarregando(false);
    }
  }, []);

  const sair = useCallback(async () => {
    setUsuario(null);
    setToken(null);
    setTipoUsuario(null);
    await AsyncStorage.multiRemove(['user', 'token']);
  }, []);

  // Sincroniza a resposta relacional do Prisma com o cache local
  const atualizarUsuario = useCallback(async (dadosNovos) => {
    if (!dadosNovos) return;
    setUsuario((anterior) => {
      const unificado = {
        ...anterior,
        ...dadosNovos,
        athleteProfile: dadosNovos.athleteProfile || anterior?.athleteProfile || null,
        team: dadosNovos.team || anterior?.team || null
      };
      AsyncStorage.setItem('user', JSON.stringify(unificado)).catch(console.error);
      return unificado;
    });
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
        atualizarUsuario,
        autenticado: !!usuario && !!token,
      }}
    >
      {children}
    </ContextoAutenticacao.Provider>
  );
};

export const usarAutenticacao = () => {
  const context = useContext(ContextoAutenticacao);
  if (!context) throw new Error('usarAutenticacao deve ser usado dentro de um ProvedorAutenticacao');
  return context;
};