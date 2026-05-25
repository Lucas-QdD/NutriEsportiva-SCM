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

      const resposta = await fetch('https://tired-crabs-matter.loca.lt/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: nomeUsuario,
          password: senha, // alterado de 'senha' para 'password' para bater com o backend
        }),
      });

      // Captura a resposta como texto bruto primeiro para evitar o travamento do JSON Parse
      const textoBruto = await resposta.text();
      let dados;

      try {
        dados = JSON.parse(textoBruto);
      } catch (e) {
        // Se cair aqui, a resposta veio em formato HTML ou Texto Puro (Ex: Página de bloqueio do túnel ou erro 500 do Express)
        setErro('Resposta inválida do servidor. Verifique o túnel no navegador do celular.');
        setCarregando(false);
        console.log('Conteúdo bruto recebido:', textoBruto);
        return false;
      }

      if (!resposta.ok) {
        setErro(dados.error || 'Erro no login');
        setCarregando(false);
        return false;
      }

      const usuarioLogado = dados.user || dados.usuario;
      const papel = usuarioLogado.role || usuarioLogado.papel;

      let tipoDeUsuarioValidado = tipoDeUsuario === 'NUTRICIONISTA' ? 'NUTRITIONIST' : 'ATHLETE';
      if (tipoDeUsuario === 'ATLETA') tipoDeUsuarioValidado = 'ATHLETE';

      if (papel !== tipoDeUsuarioValidado && papel !== tipoDeUsuario) {
        const perfilCorreto = (papel === 'ATLETA' || papel === 'ATHLETE') ? 'Atleta' : 'Nutricionista';
        setErro(`Acesso negado. Esta conta é de um ${perfilCorreto}.`);
        setCarregando(false);
        return false;
      }
      setUsuario(usuarioLogado);
      setTipoUsuario(papel);

      await AsyncStorage.setItem('usuario', JSON.stringify(usuarioLogado));
      await AsyncStorage.setItem('tipoUsuario', papel);

      setCarregando(false);
      return true;

    } catch (erro) {
      setErro('Erro ao conectar com o servidor: ' + erro.message);
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