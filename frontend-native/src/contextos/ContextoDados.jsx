import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';

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
  durationMin: '',
  preWeightKg: '',
  postWeightKg: '',
  fluidIntakeLiters: '0',
  urineVolumeLiters: '0',
  suor: '',
  sal: '',
  sintomas: '',
};

export const ProvedorDados = ({ children }) => {
  const [atletas, setAtletas] = useState([]);
  const [avaliacoes, setAvaliacoes] = useState([]);

  const carregarDadosIniciais = useCallback(async () => {
    try {
      const dadosAtletas = await api.get('/athletes');
      setAtletas(dadosAtletas);

      const dadosAvaliacoes = await api.get('/training-sessions');
      setAvaliacoes(dadosAvaliacoes);
    } catch (error) {
      console.log('Servidor offline ou rotas ainda indisponiveis. Usando dados em memoria local.');
    }
  }, []);

  useEffect(() => {
    carregarDadosIniciais();
  }, [carregarDadosIniciais]);

  const adicionarAtleta = useCallback(async (atleta) => {
    const novoAtletaLocal = { id: String(Date.now()), ...atleta };
    setAtletas((anterior) => [...anterior, novoAtletaLocal]);

    try {
      const atletaServidor = await api.post('/athletes', atleta);
      setAtletas((anterior) =>
        anterior.map((item) => (item.id === novoAtletaLocal.id ? atletaServidor : item))
      );
      return atletaServidor;
    } catch (error) {
      console.error('Erro ao sincronizar atleta com o servidor:', error.message);
    }

    return novoAtletaLocal;
  }, []);

  const editarAtleta = useCallback(async (id, atleta) => {
    setAtletas((anterior) =>
      anterior.map((item) => (item.id === id ? { ...item, ...atleta } : item))
    );

    try {
      await api.put(`/athletes/${id}`, atleta);
    } catch (error) {
      console.error('Erro ao editar atleta no servidor:', error.message);
    }
  }, []);

  const deletarAtleta = useCallback(async (id) => {
    setAtletas((anterior) => anterior.filter((item) => String(item.id) !== String(id)));

    try {
      await api.delete(`/athletes/${id}`);
    } catch (error) {
      console.error('Erro ao deletar atleta no servidor:', error.message);
    }
  }, []);

  const obterAtletaPorId = useCallback(
    (id) => atletas.find((item) => item.id === id),
    [atletas]
  );

  const adicionarAvaliacao = useCallback(async (avaliacao, nomeUsuario) => {
    const avaliacaoFormatada = {
      id: String(Date.now()),
      atletaId:
        avaliacao.atletaId ||
        (atletas.find((a) => a.nome === avaliacao.atletaNome || a.nome === avaliacao.nome)?.id ||
          'geral'),
      atletaNome: avaliacao.atletaNome || avaliacao.nome || 'Geral',
      data: avaliacao.data || new Date().toLocaleDateString('pt-BR'),
      durationMin: parseInt(avaliacao.durationMin, 10) || 0,
      preWeightKg: parseFloat(avaliacao.preWeightKg) || 0,
      postWeightKg: parseFloat(avaliacao.postWeightKg) || 0,
      fluidIntakeLiters: parseFloat(avaliacao.fluidIntakeLiters) || 0,
      urineVolumeLiters: parseFloat(avaliacao.urineVolumeLiters) || 0,
      suor: avaliacao.suor || '',
      sal: avaliacao.sal || '',
      sintomas: avaliacao.sintomas || '',
      sweatRate: parseFloat(avaliacao.sweatRate) || 0,
      statusHidratacao: avaliacao.statusHidratacao || 'Nao calculado',
      recommendation: avaliacao.recomendacao || avaliacao.recommendation || '',
      nutricionistaResponsavel: nomeUsuario || 'Autoavaliacao',
    };

    setAvaliacoes((anterior) => [avaliacaoFormatada, ...anterior]);

    try {
      await api.post('/training-sessions', avaliacaoFormatada);
    } catch (error) {
      console.log('Modo offline: registro mantido apenas localmente na sessao atual.');
    }

    return avaliacaoFormatada;
  }, [atletas]);

  const obterAvaliacoesPorUsuario = useCallback(
    (nomeUsuario) =>
      avaliacoes.filter(
        (item) => item.atletaNome === nomeUsuario || item.nutricionistaResponsavel === nomeUsuario
      ),
    [avaliacoes]
  );

  const editarAvaliacao = useCallback(async (id, avaliacaoAtualizada) => {
    setAvaliacoes((anterior) =>
      anterior.map((item) => (item.id === id ? { ...item, ...avaliacaoAtualizada } : item))
    );

    try {
      await api.put(`/training-sessions/${id}`, avaliacaoAtualizada);
    } catch (error) {
      console.error('Erro ao editar avaliacao no servidor:', error.message);
    }
  }, []);

  const deletarAvaliacao = useCallback(async (id) => {
    setAvaliacoes((anterior) => anterior.filter((item) => String(item.id) !== String(id)));

    try {
      await api.delete(`/training-sessions/${id}`);
    } catch (error) {
      console.error('Erro ao deletar avaliacao no servidor:', error.message);
    }
  }, []);

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
        editarAvaliacao,
        deletarAvaliacao,
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
