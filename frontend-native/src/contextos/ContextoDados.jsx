import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { Alert } from 'react-native';
import { api } from '../services/api';

const ContextoDados = createContext();

export const usarDados = () => {
  return useContext(ContextoDados);
};

export const ProvedorDados = ({ children }) => {
  const [atletas, setAtletas] = useState([]);
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [carregando, setCarregando] = useState(false);

  // 1. Busca os dados de forma assíncrona do SQLite/API backend
  const carregarDadosIniciais = useCallback(async () => {
    setCarregando(true);
    try {
      // Busca os usuários cadastrados
      const respostaUsuarios = await api.get('/users'); 
      const listaUsuarios = respostaUsuarios?.data || respostaUsuarios;
      
      if (listaUsuarios && Array.isArray(listaUsuarios)) {
        setAtletas(listaUsuarios.filter(u => u.role === 'ATHLETE'));
      }

      // Coleta o histórico técnico a partir dos vínculos profissionais
      const links = await api.get('/professional-athletes');
      const listaVinculos = links?.data || links || [];
      
      let sessoesAcumuladas = [];
      if (Array.isArray(listaVinculos)) {
        listaVinculos.forEach(link => {
          if (link.athlete && Array.isArray(link.athlete.sessions)) {
            link.athlete.sessions.forEach(s => {
              // 🔍 MAPEAMENTO DO PRISMA STUDIO: Puxa de dentro do hídrico se não estiver na raiz
              const registroHidrico = s.HydrationRecord || s.hydrationRecord;
              const resultadoHidrico = registroHidrico?.HydrationResult || registroHidrico?.hydrationResult || s.result;

              const pesoPre = registroHidrico?.preWeightKg || s.pesoInicial || 0;
              const pesoPos = registroHidrico?.postWeightKg || s.pesoFinal || 0;
              const liquido = registroHidrico?.fluidIntakeLiters || s.liquidoIngerido || 0;
              const temp = registroHidrico?.temperatureC || s.temperatureC || null;
              const umid = registroHidrico?.humidityPercent || s.humidityPercent || null;
              const sint = registroHidrico?.symptoms || s.symptoms || '';

              const taxaSuorCalculada = resultadoHidrico?.sweatRateLitersHour || 0;
              const statusCalculado = resultadoHidrico?.hydrationStatus || 'GOOD';

              sessoesAcumuladas.push({
                ...s,
                pesoInicial: String(pesoPre),
                pesoFinal: String(pesoPos),
                liquidoIngerido: String(liquido),
                temperatureC: temp ? String(temp) : '',
                humidityPercent: umid ? String(umid) : '',
                symptoms: sint,
                athleteId: link.athlete.id, // ID da conta do usuário (cuid...)
                athleteProfileId: s.athleteId, // ID do perfil físico (cmqfq...)
                athlete: link.athlete,
                result: {
                  sweatRateLitersHour: taxaSuorCalculada,
                  hydrationStatus: statusCalculado
                }
              });
            });
          }
        });
      }

      // Se localizou sessões na árvore de vínculos, adota. Senão, recorre ao plano de fallback relacional
      if (sessoesAcumuladas.length > 0) {
        setAvaliacoes(sessoesAcumuladas);
      } else {
        const listaSessoesAcumuladas = [];
        if (Array.isArray(listaUsuarios)) {
          listaUsuarios.forEach(u => {
            if (u.athleteProfile && Array.isArray(u.athleteProfile.sessions)) {
              u.athleteProfile.sessions.forEach(s => {
                const registroHidrico = s.HydrationRecord || s.hydrationRecord;
                const resultadoHidrico = registroHidrico?.HydrationResult || registroHidrico?.hydrationResult || s.result;

                const pesoPre = registroHidrico?.preWeightKg || s.pesoInicial || 0;
                const pesoPos = registroHidrico?.postWeightKg || s.pesoFinal || 0;
                const liquido = registroHidrico?.fluidIntakeLiters || s.liquidoIngerido || 0;
                const temp = registroHidrico?.temperatureC || s.temperatureC || null;
                const umid = registroHidrico?.humidityPercent || s.humidityPercent || null;
                const sint = registroHidrico?.symptoms || s.symptoms || '';

                const taxaSuorCalculada = resultadoHidrico?.sweatRateLitersHour || 0;
                const statusCalculado = resultadoHidrico?.hydrationStatus || 'GOOD';

                listaSessoesAcumuladas.push({
                  ...s,
                  pesoInicial: String(pesoPre),
                  pesoFinal: String(pesoPos),
                  liquidoIngerido: String(liquido),
                  temperatureC: temp ? String(temp) : '',
                  humidityPercent: umid ? String(umid) : '',
                  symptoms: sint,
                  athleteId: u.id,
                  athleteProfileId: s.athleteId,
                  athlete: u,
                  result: {
                    sweatRateLitersHour: taxaSuorCalculada,
                    hydrationStatus: statusCalculado
                  }
                });
              });
            }
          });
        }
        if (listaSessoesAcumuladas.length > 0) {
          setAvaliacoes(listaSessoesAcumuladas);
        }
      }
    } catch (error) {
      console.log('[ContextoDados] Erro na sincronização com SQLite.', error.message);
    } finally {
      setCarregando(false);
    }
  }, []);

  // Dispara a carga na montagem inicial do provedor
  useEffect(() => {
    carregarDadosIniciais();
  }, [carregarDadosIniciais]);

  // 2. Adiciona uma nova avaliação disparando as rotas relacionais do servidor
  const adicionarAvaliacao = useCallback(async (payloadCompleto) => {
    try {
      const idUsuarioSelecionado = payloadCompleto.athleteId;
      if (!idUsuarioSelecionado) {
        throw new Error('Nenhum atleta foi selecionado para a avaliação.');
      }

      console.log(`[ContextoDados] Buscando perfil completo do usuário ID: ${idUsuarioSelecionado}`);
      const usuarioCompleto = await api.get(`/users/${idUsuarioSelecionado}`);
      
      let idPerfilAtletaPrisma = usuarioCompleto?.athleteProfile?.id;

      if (!idPerfilAtletaPrisma) {
        const atletaNoEstado = atletas.find(a => a.id === idUsuarioSelecionado || a.athleteProfile?.userId === idUsuarioSelecionado);
        idPerfilAtletaPrisma = atletaNoEstado?.athleteProfile?.id;
      }

      if (!idPerfilAtletaPrisma) {
        throw new Error('Este atleta precisa configurar a Idade Corpórea na tela "Minha Conta" para ativar o perfil dele no Prisma.');
      }

      const dadosSessao = {
        athleteId: String(idPerfilAtletaPrisma),
        sessionDate: payloadCompleto.sessionDate,
        durationMin: parseInt(payloadCompleto.durationMin, 10),
        measurementMethod: 'WEIGHT_BASED'
      };

      const sessaoSalva = await api.post('/training-sessions', dadosSessao);

      const dadosCalculoEnvio = {
        sessionId: sessaoSalva.id,
        pesoInicial: parseFloat(payloadCompleto.pesoInicial),
        pesoFinal: parseFloat(payloadCompleto.pesoFinal),
        liquidoIngerido: parseFloat(payloadCompleto.liquidoIngerido || 0),
        temperatureC: payloadCompleto.temperatureC ? parseFloat(payloadCompleto.temperatureC) : null,
        humidityPercent: payloadCompleto.humidityPercent ? parseFloat(payloadCompleto.humidityPercent) : null,
        symptoms: payloadCompleto.symptoms
      };

      const dadosCalculo = await api.post('/hydration/calculate', dadosCalculoEnvio);

      const novaSessaoFormatada = {
        id: sessaoSalva.id,
        sessionDate: payloadCompleto.sessionDate,
        durationMin: payloadCompleto.durationMin,
        athleteId: idUsuarioSelecionado, 
        athleteProfileId: idPerfilAtletaPrisma,
        pesoInicial: payloadCompleto.pesoInicial,
        pesoFinal: payloadCompleto.pesoFinal,
        liquidoIngerido: payloadCompleto.liquidoIngerido,
        temperatureC: payloadCompleto.temperatureC,
        humidityPercent: payloadCompleto.humidityPercent,
        symptoms: payloadCompleto.symptoms,
        athlete: usuarioCompleto,
        result: {
          sweatRateLitersHour: dadosCalculo?.taxaSudorese || dadosCalculo?.sweatRateLitersHour || 0,
          hydrationStatus: dadosCalculo?.hydrationStatus || 'GOOD',
          recommendation: dadosCalculo?.recommendation || 'Hidratação adequada.'
        }
      };

      setAvaliacoes((anterior) => [novaSessaoFormatada, ...(anterior || [])]);
      return dadosCalculo;
    } catch (error) {
      const msg = error.message || 'Falha no processamento relacional.';
      throw new Error(msg);
    }
  }, [atletas]);

  // 3. Remove o registro físico do banco e limpa do estado local síncronamente
  const deletarAvaliacao = useCallback(async (sessionId) => {
    if (!sessionId) return;
    try {
      await api.delete(`/training-sessions/${sessionId}`);
      setAvaliacoes((anterior) => (anterior || []).filter((item) => item.id !== sessionId));
    } catch (error) {
      console.error('Erro ao deletar do banco relacional:', error.message);
      Alert.alert(
        'Erro de Conectividade ⚠️', 
        'O banco de dados rejeitou a operação.'
      );
    }
  }, []);

  // 4. Filtro unificado inteligente e tolerante a variações do Prisma
  const obterAvaliacoesPorUsuario = useCallback((userId) => {
    if (!avaliacoes || !Array.isArray(avaliacoes)) return [];
    return avaliacoes.filter((item) => {
      if (!item) return false;
      return item.athleteId === userId || 
             item.athleteProfileId === userId || 
             item.athlete?.id === userId || 
             item.athlete?.userId === userId ||
             item.athlete?.athleteProfile?.userId === userId ||
             item.athlete?.athleteProfile?.id === userId;
    });
  }, [avaliacoes]);

  return (
    <ContextoDados.Provider
      value={{
        atletas,
        avaliacoes,
        carregando,
        adicionarAvaliacao,
        deletarAvaliacao,
        obterAvaliacoesPorUsuario,
        atualizarHistorico: carregarDadosIniciais,
        avaliacaoVazia: { pesoInicial: '', pesoFinal: '', liquidoIngerido: '', durationMin: '', temperatureC: '', humidityPercent: '', symptoms: '' }
      }}
    >
      {children}
    </ContextoDados.Provider>
  );
};

export default ContextoDados;