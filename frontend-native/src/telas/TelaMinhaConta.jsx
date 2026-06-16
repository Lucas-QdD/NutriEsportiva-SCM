import React, { useState, useCallback } from 'react'; 
import { 
  StyleSheet, 
  View, 
  ScrollView, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator, 
  KeyboardAvoidingView, // Importado para gerenciar o teclado
  Platform // Importado para aplicar o comportamento correto por SO
} from 'react-native'; 
import { useFocusEffect } from '@react-navigation/native'; 
import { usarAutenticacao } from '../contextos/ContextoAutenticacao'; 
import { usarTema } from '../contextos/ContextoTema'; 
import { api } from '../services/api'; 

const TRADUCAO_PAPEL = {   
  ATHLETE: 'Atleta',   
  COACH: 'Treinador',   
  NUTRITIONIST: 'Nutricionista' 
};

const TelaMinhaConta = () => {   
  const { usuario, atualizarUsuario } = usarAutenticacao();   
  const { temaTemaEscuro } = usarTema();   
  const [nome, setNome] = useState('');   
  const [email, setEmail] = useState('');   
  const [idade, setIdade] = useState('');   
  const [esporte, setEsporte] = useState('');   
  const [idEquipe, setIdEquipe] = useState('');   
  const [codigoAtleta, setCodigoAtleta] = useState('');   
  const [salvando, setSalvando] = useState(false);   
  const [carregandoEquipas, setCarregandoEquipas] = useState(false);   
  const ehAtleta = usuario?.role === 'ATHLETE';   

  useFocusEffect(   
    useCallback(() => {       
      let ativo = true;       
      async function inicializarDados() {         
        if (!usuario) return;         
        setNome(usuario.name || '');         
        setEmail(usuario.email || '');                   
        const perfil = usuario.athleteProfile;         
        if (ehAtleta && perfil) {           
          setIdade(perfil.age ? String(perfil.age) : '');           
          setEsporte(perfil.sport || 'Geral');           
          setCodigoAtleta(perfil.athleteCode || '');         
        }         
        if (usuario.teamId) {           
          setIdEquipe(usuario.teamId);         
        } else {           
          if (ativo) setCarregandoEquipas(true);           
          try {             
            const equipas = await api.get('/teams');             
            if (equipas && equipas.length > 0 && ativo) {               
              setIdEquipe(equipas[0].id);             
            }           
          } catch (error) {             
            console.log('[MinhaConta] Erro ao sincronizar equipas automáticas.');           
          } finally {             
            if (ativo) setCarregandoEquipas(false);           
          }         
        }       
      }       
      inicializarDados();       
      return () => { ativo = false; };     
    }, [usuario, ehAtleta])   
  );   

  const salvarAlteracoes = async () => {     
    if (!nome.trim() || !email.trim()) {       
      Alert.alert('Erro  ', 'Os campos Nome e E-mail são estritamente obrigatórios.');       
      return;     
    }     
    if (!idEquipe) {       
      Alert.alert('Erro  ', 'Não foi possível detetar uma equipa ativa no SQLite. Crie um time primeiro.');       
      return;     
    }     
    const payload = {       
      name: nome.trim(),       
      email: email.trim(),       
      role: usuario?.role,       
      teamId: idEquipe     
    };     
    if (ehAtleta) {       
      if (!idade.trim()) {         
        Alert.alert('Erro  ', 'A idade corpórea é obrigatória para atletas.');         
        return;       
      }       
      payload.age = parseInt(idade, 10);       
      payload.sport = esporte.trim() || 'Geral';       
      payload.athleteCode = codigoAtleta.trim() || usuario?.athleteProfile?.athleteCode;     
    }     
    setSalvando(true);     
    try {       
      const usuarioAtualizado = await api.put(`/users/${usuario.id}`, payload);       
      await atualizarUsuario(usuarioAtualizado);       
      Alert.alert('Sucesso', 'Dados cadastrais updated!');     
    } catch (error) {       
      Alert.alert('Falha na Persistência', error.message || 'Verifique a conectividade com o servidor local.');     
    } finally {       
      setSalvando(false); // Corrigido a sintaxe inválida anterior 'defaultValue: setSalvando(false)'
    }   
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
    fundoInputBloqueado: temaTemaEscuro ? '#221618' : '#fff5f5',     
    bordaInputBloqueado: temaTemaEscuro ? '#4a151b' : '#fca5a5',     
    textoInput: temaTemaEscuro ? '#ffffff' : '#000000',     
    vermelhoPadrao: '#c41e3a',     
    badgePapel: temaTemaEscuro ? '#311014' : '#fee2e2',   
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
    conteudo: { 
      padding: 30,
      paddingBottom: 50 // Garante um espaçamento extra no final para rolar livremente
    },     
    cartao: {       
      backgroundColor: cores.fundoCartao,       
      borderColor: cores.bordaCabecalho,       
      borderWidth: 1,       
      borderRadius: 12,       
      padding: 20,       
      gap: 12,       
      shadowColor: '#000000',       
      shadowOffset: { width: 0, height: 4 },       
      shadowOpacity: temaTemaEscuro ? 0.3 : 0.08,       
      shadowRadius: 8,       
      elevation: 3,     
    },     
    titulo: { color: cores.textoPrincipal, fontSize: 18, fontWeight: 'bold', marginBottom: 2 },     
    subtitulo: { color: cores.textoSecundario, fontSize: 13, marginBottom: 4 },     
    badge: { alignSelf: 'flex-start', backgroundColor: cores.badgePapel, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: cores.vermelhoPadrao },     
    textoBadge: { color: cores.vermelhoPadrao, fontWeight: '700', fontSize: 18 },     
    rotulo: { color: cores.textoPrincipal, fontSize: 14, fontWeight: '600', marginTop: 6, marginBottom: 4 },     
    entrada: { backgroundColor: cores.fundoInput, borderColor: cores.bordaCartao, borderWidth: 1, borderRadius: 10, color: cores.textoInput, padding: 12, fontSize: 15 },     
    entradaBloqueada: { backgroundColor: cores.fundoInputBloqueado, borderColor: cores.bordaInputBloqueado, borderWidth: 1, borderRadius: 10, color: cores.vermelhoPadrao, padding: 12, fontSize: 14, fontWeight: '600' },     
    botao: {       
      backgroundColor: cores.vermelhoPadrao,        
      paddingVertical: 14,       
      borderRadius: 10,       
      alignItems: 'center',       
      marginTop: 16,       
      shadowColor: '#000000',       
      shadowOffset: { width: 0, height: 4 },       
      shadowOpacity: 0.15,       
      shadowRadius: 8,       
      elevation: 4,     
    }   
  });   

  return ( 
    <KeyboardAvoidingView 
      style={estilos.conteiner} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <View style={estilos.cabecalho}> 
        <Text style={estilos.tituloCabecalho}>Meus Dados Cadastrais</Text> 
      </View> 
      
      <ScrollView 
        contentContainerStyle={estilos.conteudo} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled" // Permite clicar em botões mesmo com o teclado aberto
      > 
        <View style={estilos.cartao}>                             
          <View style={estilos.badge}>             
            <Text style={estilos.textoBadge}>{TRADUCAO_PAPEL[usuario?.role] || 'Utilizador NESC'}</Text>           
          </View>           
          
          <Text style={estilos.rotulo}>Nome Completo</Text>           
          <TextInput value={nome} onChangeText={setNome} style={estilos.entrada} placeholder="Ex: Lucas Silva" placeholderTextColor={cores.textoSecundario} />           
          
          <Text style={estilos.rotulo}>E-mail de Acesso</Text>           
          <TextInput value={email} onChangeText={setEmail} style={estilos.entrada} autoCapitalize="none" keyboardType="email-address" placeholder="atleta@gmail.com" placeholderTextColor={cores.textoSecundario} />           
          
          <Text style={estilos.rotulo}>Identificador Relacional do Time</Text>           
          {carregandoEquipas ? (             
            <ActivityIndicator size="small" color={cores.vermelhoPadrao} style={{ alignSelf: 'flex-start', padding: 10 }} />           
          ) : (             
            <TextInput value={idEquipe} style={estilos.entradaBloqueada} editable={false} placeholder="Nenhum time localizado no SQLite" placeholderTextColor={cores.vermelhoPadrao} />           
          )}           
          
          {ehAtleta && (             
            <>               
              <Text style={estilos.rotulo}>Idade Corpórea *</Text>               
              <TextInput keyboardType="numeric" value={idade} onChangeText={setIdade} style={estilos.entrada} placeholder="Ex: 22" placeholderTextColor={cores.textoSecundario} />               
              
              <Text style={estilos.rotulo}>Modalidade Esportiva</Text>               
              <TextInput value={esporte} onChangeText={setEsporte} style={estilos.entrada} placeholder="Ex: Corrida de Fundo, Futebol" placeholderTextColor={cores.textoSecundario} />               
              
              {codigoAtleta ? (                 
                <>                   
                  <Text style={estilos.rotulo}>Código de Registro Técnico</Text>                   
                  <TextInput value={codigoAtleta} style={estilos.entradaBloqueada} editable={false} />                 
                </>               
              ) : null}             
            </>           
          )}           
          
          <TouchableOpacity style={estilos.botao} onPress={salvarAlteracoes} disabled={salvando}>             
            {salvando ? <ActivityIndicator color="#ffffff" /> : <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 16 }}>Salvar Alterações</Text>}           
          </TouchableOpacity>         
        </View>       
      </ScrollView>     
    </KeyboardAvoidingView>   
  ); 
};

export default TelaMinhaConta;