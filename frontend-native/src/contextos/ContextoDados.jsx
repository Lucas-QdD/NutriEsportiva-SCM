import React, { createContext, useContext, useState, useCallback } from 'react';

const ContextoDados = createContext();

const atletaVazio = {
  nome: '',
  dataNascimento: '',
  altura: '',
  peso: '',
  sexo: '',
  suor: '',
  sal: '',
  doencas: '',
  calipers: '',
  hidracao: '',
  sintomas: '',
  diureticos: '',
};

const avaliacaoVazia = {
  data: '',
  peso: '',
  suor: '',
  sal: '',
  hidracao: '',
  sintomas: '',
  diureticos: '',
};

export const ProvedorDados = ({ children }) => {
  const [atletas, setAtletas] = useState([]);
  const [avaliacoes, setAvaliacoes] = useState([]);

  // Funções de atleta
  const adicionarAtleta = useCallback(
    (atleta) => {
      const novoAtleta = { id: Date.now(), ...atleta };
      setAtletas((anterior) => [...anterior, novoAtleta]);
      return novoAtleta;
    },
    []
  );

  const editarAtleta = useCallback((id, atleta) => {
    setAtletas((anterior) =>
      anterior.map((item) => (item.id === id ? { ...item, ...atleta } : item))
    );
  }, []);

  const deletarAtleta = useCallback((id) => {
    setAtletas((anterior) => anterior.filter((item) => item.id !== id));
  }, []);

  const obterAtletaPorId = useCallback(
    (id) => {
      return atletas.find((item) => item.id === id);
    },
    [atletas]
  );

  // Funções de avaliação
  const adicionarAvaliacao = useCallback(
    (avaliacao, nomeUsuario) => {
      const novaAvaliacao = {
        id: Date.now(),
        nome: nomeUsuario || 'Usuário',
        ...avaliacao,
      };
      setAvaliacoes((anterior) => [novaAvaliacao, ...anterior]);
      return novaAvaliacao;
    },
    []
  );

  const obterAvaliacoesPorUsuario = useCallback(
    (nomeUsuario) => {
      return avaliacoes.filter((item) => item.nome === nomeUsuario);
    },
    [avaliacoes]
  );

  // Busca
  const pesquisarAtletas = useCallback(
    (consulta) => {
      if (!consulta) return atletas;
      return atletas.filter((atleta) =>
        atleta.nome.toLowerCase().includes(consulta.toLowerCase())
      );
    },
    [atletas]
  );

  return (
    <ContextoDados.Provider
      value={{
        atletas,
        avaliacoes,
        adicionarAtleta,
        editarAtleta,
        deletarAtleta,
        obterAtletaPorId,
        adicionarAvaliacao,
        obterAvaliacoesPorUsuario,
        pesquisarAtletas,
        atletaVazio,
        avaliacaoVazia,
      }}
    >
      {children}
    </ContextoDados.Provider>
  );
};

export const usarDados = () => {
  const context = useContext(ContextoDados);
  if (!context) {
    throw new Error('usarDados deve ser usado dentro de um ProvedorDados');
  }
  return context;
};
