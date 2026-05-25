import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const ContextoDados = createContext();

const API_URL = 'https://tired-crabs-matter.loca.lt';

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

  // --- CARREGAMENTO INICIAL (API) ---
  const carregarDadosIniciais = useCallback(async () => {
    try {
      const resAtletas = await fetch(`${API_URL}/athletes`);
      if (resAtletas.ok) {
        const dadosAtletas = await resAtletas.json();
        setAtletas(dadosAtletas);
      }

      const resAvaliacoes = await fetch(`${API_URL}/training-sessions`);
      if (resAvaliacoes.ok) {
        const dadosAvaliacoes = await resAvaliacoes.json();
        setAvaliacoes(dadosAvaliacoes);
      }
    } catch (error) {
      console.log("Servidor offline. Usando apenas dados em memória local por enquanto.");
    }
  }, []);

  useEffect(() => {
    carregarDadosIniciais();
  }, [carregarDadosIniciais]);


  // --- FUNÇÕES DE ATLETA ---
  const adicionarAtleta = useCallback(async (atleta) => {
    const novoAtletaLocal = { id: String(Date.now()), ...atleta };
    setAtletas((anterior) => [...anterior, novoAtletaLocal]);

    try {
      const resposta = await fetch(`${API_URL}/athletes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(atleta),
      });
      
      if (resposta.ok) {
        const atletaServidor = await resposta.json();
        setAtletas((anterior) => 
          anterior.map(item => item.id === novoAtletaLocal.id ? atletaServidor : item)
        );
        return atletaServidor;
      }
    } catch (error) {
      console.error("Erro ao sincronizar atleta com o servidor:", error.message);
    }

    return novoAtletaLocal;
  }, []);

  const editarAtleta = useCallback(async (id, atleta) => {
    setAtletas((anterior) =>
      anterior.map((item) => (item.id === id ? { ...item, ...atleta } : item))
    );

    try {
      await fetch(`${API_URL}/athletes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(atleta),
      });
    } catch (error) {
      console.error("Erro ao editar atleta no servidor:", error.message);
    }
  }, []);

  const deletarAtleta = useCallback(async (id) => {
    setAtletas((anterior) => anterior.filter((item) => String(item.id) !== String(id)));

    try {
      await fetch(`${API_URL}/athletes/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error("Erro ao deletar atleta no servidor:", error.message);
    }
  }, []);

  const obterAtletaPorId = useCallback((id) => {
    return atletas.find((item) => item.id === id);
  }, [atletas]);


  // --- FUNÇÕES DE AVALIAÇÃO ---
  const adicionarAvaliacao = useCallback(async (avaliacao, nomeUsuario) => {
    const avaliacaoFormatada = {
      id: String(Date.now()), 
      atletaId: avaliacao.atletaId || (atletas.find(a => a.nome === avaliacao.atletaNome || a.nome === avaliacao.nome)?.id || 'geral'),
      atletaNome: avaliacao.atletaNome || avaliacao.nome || 'Geral',
      data: avaliacao.data || new Date().toLocaleDateString('pt-BR'),
      durationMin: parseInt(avaliacao.durationMin) || 0,
      preWeightKg: parseFloat(avaliacao.preWeightKg) || 0,
      postWeightKg: parseFloat(avaliacao.postWeightKg) || 0,
      fluidIntakeLiters: parseFloat(avaliacao.fluidIntakeLiters) || 0,
      urineVolumeLiters: parseFloat(avaliacao.urineVolumeLiters) || 0,
      suor: avaliacao.suor || '',
      sal: avaliacao.sal || '',
      sintomas: avaliacao.sintomas || '',
      sweatRate: parseFloat(avaliacao.sweatRate) || 0,
      statusHidratacao: avaliacao.statusHidratacao || 'Não calculado',
      recommendation: avaliacao.recomendacao || avaliacao.recommendation || '',
      nutricionistaResponsavel: nomeUsuario || 'Autoavaliação'
    };

    setAvaliacoes((anterior) => [avaliacaoFormatada, ...anterior]);

    try {
      const resposta = await fetch(`${API_URL}/training-sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(avaliacaoFormatada), 
      });

      if (!resposta.ok) {
        console.warn('O servidor rejeitou o payload recebido, mas os dados estão mantidos na memória do app.');
      }
    } catch (error) {
      console.log("Modo offline: Registro mantido apenas localmente na sessão atual.");
    }

    return avaliacaoFormatada;
  }, [atletas]);

  const obterAvaliacoesPorUsuario = useCallback((nomeUsuario) => {
    return avaliacoes.filter(
      (item) => item.atletaNome === nomeUsuario || item.nutricionistaResponsavel === nomeUsuario
    );
  }, [avaliacoes]);

  // CORRIGIDO: Agora sincronizando também com a sua API em segundo plano
  const editarAvaliacao = useCallback(async (id, avaliacaoAtualizada) => {
    setAvaliacoes((anterior) =>
      anterior.map((item) => (item.id === id ? { ...item, ...avaliacaoAtualizada } : item))
    );

    try {
      await fetch(`${API_URL}/training-sessions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(avaliacaoAtualizada),
      });
    } catch (error) {
      console.error("Erro ao editar avaliação no servidor:", error.message);
    }
  }, []);

  // CORRIGIDO: Agora sincronizando também com a sua API em segundo plano
  const deletarAvaliacao = useCallback(async (id) => {
    setAvaliacoes((anterior) => anterior.filter((item) => String(item.id) !== String(id)));

    try {
      await fetch(`${API_URL}/training-sessions/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error("Erro ao deletar avaliação no servidor:", error.message);
    }
  }, []);

  const pesquisarAtletas = useCallback((consulta) => {
    if (!consulta) return atletas;
    return atletas.filter((atleta) =>
      atleta.nome.toLowerCase().includes(consulta.toLowerCase())
    );
  }, [atletas]);

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
        editarAvaliacao, // <-- ADICIONADO AQUI NO PROVIDER
        deletarAvaliacao, // <-- ADICIONADO AQUI NO PROVIDER
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