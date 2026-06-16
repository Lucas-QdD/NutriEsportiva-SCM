import React, { useCallback, useEffect, useState } from 'react'; 
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'; 
import { api } from '../services/api'; 
import { usarAutenticacao } from '../contextos/ContextoAutenticacao'; 
import { usarTema } from '../contextos/ContextoTema'; 
import { MaterialCommunityIcons } from '@expo/vector-icons'; 

const ROLES_PROFISSIONAIS = ['NUTRITIONIST', 'COACH']; 

const TelaMeusAtletas = ({ navigation }) => {   
  const { usuario } = usarAutenticacao();   
  const { temaTemaEscuro } = usarTema();   
  const [emailAtleta, setEmailAtleta] = useState('');   
  const [vinculos, setVinculos] = useState([]);   
  const [carregando, setCarregando] = useState(false);   
  const [salvando, setSalvando] = useState(false);   
  const [erro, setErro] = useState('');   
  const [mensagem, setMensagem] = useState('');   
  const podeVincular = ROLES_PROFISSIONAIS.includes(usuario?.role);   

  const carregarVinculos = useCallback(async () => {     
    setCarregando(true);     
    setErro('');     
    try {       
      const dados = await api.get('/professional-athletes');       
      setVinculos(Array.isArray(dados) ? dados : []);     
    } catch (error) {       
      setErro('Não foi possível sincronizar a lista de vínculos técnicos.');     
    } finally {       
      setCarregando(false);     
    }   
  }, []);   

  useEffect(() => {     
    carregarVinculos();   
  }, [carregarVinculos]);   

  const vincularAtleta = async () => {   
    const email = emailAtleta.trim();   
    if (!email) {     
      setErro('Informe o email cadastrado do atleta.');     
      return;   
    }   
    setSalvando(true);   
    setErro('');   
    setMensagem('');   
    try {     
      const atletaEncontrado = await api.get(`/users/search?email=${encodeURIComponent(email)}`);     
      if (atletaEncontrado.role !== 'ATHLETE') {       
        setErro('O usuário correspondente a esse e-mail não possui o papel ATHLETE.');       
        return;     
      }     
      await api.post('/professional-athletes', { athleteId: atletaEncontrado.id });                  
      setEmailAtleta('');     
      setMensagem('Vínculo técnico estabelecido com sucesso!');     
      await carregarVinculos();   
    } catch (error) {     
      setErro(error.message || 'Erro ao mapear link no banco relacional.');   
    } finally {     
      setSalvando(false);   
    }   
  };   

  const removerVinculo = async (id) => {     
    const ejecutarRemocao = async () => {       
      try {         
        await api.delete(`/professional-athletes/${id}`);         
        setMensagem('Vínculo desfeito com sucesso.');         
        await carregarVinculos();       
      } catch (error) {         
        setErro('Não foi possível remover o elo.');       
      }     
    };     
    Alert.alert('Desfazer Elos', 'Remover este atleta da sua lista técnica?', [       
      { text: 'Cancelar', style: 'cancel' },       
      { text: 'Remover', style: 'destructive', onPress: ejecutarRemocao },     
    ]);   
  };   

  const cores = {     
    fundoApp: temaTemaEscuro ? '#121212' : '#f3f4f6',     
    fundoCabecalho: temaTemaEscuro ? '#1e1e1e' : '#f9fafb',     
    bordaCabecalho: temaTemaEscuro ? '#2d2d2d' : '#e5e7eb',     
    textoPrincipal: temaTemaEscuro ? '#ffffff' : '#1f2937',     
    textoSecundario: temaTemaEscuro ? '#a3a3a3' : '#6b7280',     
    fundoCartao: temaTemaEscuro ? '#1e1e1e' : '#ffffff',     
    bordaCartao: temaTemaEscuro ? '#2d2d2d' : '#f3f4f6',     
    fundoInput: temaTemaEscuro ? '#2a2a2a' : '#ffffff',     
    textoInput: temaTemaEscuro ? '#ffffff' : '#000000',     
    vermelhoPadrao: '#c41e3a',     
    verdeSucesso: '#10b981',   
  };   

  const estilos = StyleSheet.create({     
    conteiner: { flex: 1, backgroundColor: cores.fundoApp },     
    cabecalho: {       
      backgroundColor: cores.fundoCabecalho,        
      paddingVertical: 20,       
      paddingHorizontal: 30,       
      borderBottomWidth: 1,       
      borderBottomColor: cores.bordaCabecalho,       
      shadowColor: '#000000',       
      shadowOffset: { width: 0, height: 2 },       
      shadowOpacity: temaTemaEscuro ? 0.2 : 0.05,       
      shadowRadius: 4,       
      elevation: 2,     
    },     
    tituloCabecalho: { fontSize: 24, color: cores.textoPrincipal, fontWeight: 'bold' },     
    conteudo: { padding: 30, gap: 24 },     
    tituloSecao: { fontSize: 18, fontWeight: 'bold', color: cores.textoPrincipal, marginBottom: 16 },     
    cartaoFiltro: {       
      backgroundColor: cores.fundoCartao,       
      padding: 20,       
      borderRadius: 12,       
      borderWidth: 1,       
      borderColor: cores.bordaCabecalho,       
      gap: 12,       
      shadowColor: '#000000',       
      shadowOffset: { width: 0, height: 4 },       
      shadowOpacity: temaTemaEscuro ? 0.3 : 0.08,       
      shadowRadius: 8,       
      elevation: 3,     
    },     
    tituloFiltro: { fontSize: 16, fontWeight: 'bold', color: cores.textoPrincipal },     
    textoAjuda: { color: cores.textoSecundario, fontSize: 13, lineHeight: 18 },     
    campo: { backgroundColor: cores.fundoInput, color: cores.textoInput, borderColor: cores.bordaCartao, borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },     
    botao: {       
      backgroundColor: cores.vermelhoPadrao,        
      borderRadius: 10,       
      paddingVertical: 14,       
      alignItems: 'center',       
      justifyContent: 'center',       
      flexDirection: 'row',       
      gap: 8,       
      shadowColor: '#000000',       
      shadowOffset: { width: 0, height: 4 },       
      shadowOpacity: 0.15,       
      shadowRadius: 8,       
      elevation: 4,     
    },     
    botaoSecundario: {       
      backgroundColor: 'transparent',       
      paddingVertical: 10,       
      paddingHorizontal: 14,       
      borderRadius: 10,       
      alignItems: 'center',       
      justifyContent: 'center',       
      borderWidth: 2,       
      borderColor: cores.vermelhoPadrao,     
    },     
    botaoVerAvaliacoes: {       
      backgroundColor: cores.vermelhoPadrao,       
      borderRadius: 10,       
      paddingVertical: 10,       
      paddingHorizontal: 16,       
      alignItems: 'center',       
      justifyContent: 'center',       
      flex: 1,       
      shadowColor: '#000000',       
      shadowOffset: { width: 0, height: 2 },       
      shadowOpacity: 0.1,       
      shadowRadius: 4,       
      elevation: 2,     
    },     
    acoesCartao: { flexDirection: 'row', gap: 10, marginTop: 12, borderTopWidth: 1, borderTopColor: cores.bordaCartao, paddingTop: 12 },     
    textoBotao: { color: '#ffffff', fontSize: 14, fontWeight: '700' },     
    textoBotaoRemover: { color: cores.vermelhoPadrao, fontSize: 14, fontWeight: '700' },     
    cartao: {       
      backgroundColor: cores.fundoCartao,       
      borderColor: cores.bordaCartao,       
      borderWidth: 1,       
      borderRadius: 10,       
      padding: 16,       
      marginBottom: 12,       
      shadowColor: '#000000',       
      shadowOffset: { width: 0, height: 2 },       
      shadowOpacity: temaTemaEscuro ? 0.2 : 0.06,       
      shadowRadius: 4,       
      elevation: 2,     
    },     
    linhaPerfil: { flexDirection: 'row', alignItems: 'center', gap: 14 },     
    avatarMin: { width: 48, height: 48, borderRadius: 24, backgroundColor: cores.vermelhoPadrao, alignItems: 'center', justifyContent: 'center' },     
    avatarTxt: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 },     
    nome: { color: cores.textoPrincipal, fontSize: 16, fontWeight: '700', marginBottom: 2 },     
    detalhe: { color: cores.textoSecundario, fontSize: 13 },     
    vazio: { color: cores.textoSecundario, textAlign: 'center', paddingVertical: 40, fontSize: 14 },   
  });   

  if (!podeVincular) {     
    return (       
      <View style={estilos.conteiner}>         
        <View style={[estilos.conteudo, {alignItems: 'center', justifyContent: 'center', flex: 1}]}>           
          <Text style={{ color: cores.textoPrincipal, fontSize: 16 }}>Área restrita a profissionais de saúde e treinadores.</Text>         
        </View>       
      </View>     
    );   
  }   

  return (     
    <View style={estilos.conteiner}>       
      <View style={estilos.cabecalho}>         
        <Text style={estilos.tituloCabecalho}>Gerenciar Atletas</Text>       
      </View>       
      <ScrollView contentContainerStyle={estilos.conteudo} showsVerticalScrollIndicator={false}>         
        <View style={estilos.cartaoFiltro}>           
          <Text style={estilos.tituloFiltro}>Adicionar Novo Atleta</Text>           
          <Text style={estilos.textoAjuda}>Insira o e-mail exato cadastrado pelo atleta para integrá-lo ao seu painel clínico.</Text>           
          <TextInput value={emailAtleta} onChangeText={setEmailAtleta} autoCapitalize="none" keyboardType="email-address" placeholder="atleta@exemplo.com" placeholderTextColor={cores.textoSecundario} style={estilos.campo} />           
          <TouchableOpacity style={estilos.botao} onPress={vincularAtleta} disabled={salvando}>             
            {salvando ? (               
              <ActivityIndicator color="#ffffff" size="small" />             
            ) : (               
              <>                 
                <MaterialCommunityIcons name="link-variant" size={20} color="#ffffff" />                 
                <Text style={estilos.textoBotao}>Estabelecer Vínculo</Text>               
              </>             
            )}           
          </TouchableOpacity>                      
          {erro ? <View style={{ backgroundColor: '#fee2e2', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#fca5a5' }}><Text style={{ color: '#b91c1c', fontSize: 13, fontWeight: '500' }}>{erro}</Text></View> : null}           
          {mensagem ? <View style={{ backgroundColor: '#dcfce7', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#bbf7d0' }}><Text style={{ color: '#166534', fontSize: 13, fontWeight: '500' }}>{mensagem}</Text></View> : null}         
        </View>         

        <View>           
          <Text style={estilos.tituloSecao}>Atletas Monitorados ({vinculos.length})</Text>           
          {carregando ? (             
            <ActivityIndicator size="large" color={cores.vermelhoPadrao} style={{ marginTop: 20 }} />           
          ) : vinculos.length === 0 ? (             
            <Text style={estilos.vazio}>Nenhum elo estabelecido nesta conta ainda.</Text>           
          ) : (             
            vinculos.map((link) => {               
              const atlUser = link.athlete;               
              const iniciais = atlUser?.name ? atlUser.name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase() : 'AT';               
              return (                 
                <View key={link.id} style={estilos.cartao}>                   
                  <View style={estilos.linhaPerfil}>                     
                    <View style={estilos.avatarMin}>                       
                      <Text style={estilos.avatarTxt}>{iniciais}</Text>                     
                    </View>                     
                    <View style={{ flex: 1 }}>                       
                      <Text style={estilos.nome}>{atlUser?.name || 'Atleta Cadastrado'}</Text>                       
                      <Text style={estilos.detalhe}>{atlUser?.email}</Text>                     
                    </View>                   
                  </View>                                                    
                  <View style={estilos.acoesCartao}>                     
                    <TouchableOpacity style={estilos.botaoVerAvaliacoes} onPress={() => navigation.navigate('DetalheAtleta', { atleta: atlUser })}>                       
                      <Text style={estilos.textoBotao}>Ver Prontuário</Text>                     
                    </TouchableOpacity>                     
                    <TouchableOpacity style={estilos.botaoSecundario} onPress={() => removerVinculo(link.id)}>                       
                      <Text style={estilos.textoBotaoRemover}>Desfazer</Text>                     
                    </TouchableOpacity>                   
                  </View>                 
                </View>               
              );             
            })           
          )}         
        </View>       
      </ScrollView>     
    </View>   
  ); 
};

export default TelaMeusAtletas;