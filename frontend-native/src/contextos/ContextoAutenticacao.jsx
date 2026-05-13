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

      const resposta = await fetch('http://127.0.0.1:3333/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
       },
        body: JSON.stringify({
         email: nomeUsuario,
          password: senha,
       }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        setErro(dados.error || 'Erro no login');
        setCarregando(false);
        return false;
      }

      setUsuario(dados.user);
      setTipoUsuario(dados.user.role);

      await AsyncStorage.setItem('usuario', JSON.stringify(dados.user));
      await AsyncStorage.setItem('tipoUsuario', dados.user.role);

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
