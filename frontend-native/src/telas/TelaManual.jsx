import React from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Text, 
} from 'react-native';
import { usarTema } from '../contextos/ContextoTema';

const TelaManual = () => {
  const { temaTemaEscuro } = usarTema();

  const cores = {
    fundoApp: temaTemaEscuro ? '#121212' : '#f3f4f6',
    fundoCabecalho: temaTemaEscuro ? '#1e1e1e' : '#f9fafb',
    bordaCabecalho: temaTemaEscuro ? '#2d2d2d' : '#e5e7eb',
    textoPrincipal: temaTemaEscuro ? '#ffffff' : '#1f2937',
    textoSecundario: temaTemaEscuro ? '#a3a3a3' : '#6b7280',
    fundoCartao: temaTemaEscuro ? '#1e1e1e' : '#ffffff',
    bordaCartao: temaTemaEscuro ? '#2d2d2d' : '#f3f4f6',
    
    // Cores para os alertas didáticos
    fundoAlertaAzul: temaTemaEscuro ? '#1d3557' : '#e0f2fe',
    textoAlertaAzul: temaTemaEscuro ? '#f1faee' : '#0369a1',
    bordaAlertaAzul: '#0284c7',

    fundoAlertaLaranja: temaTemaEscuro ? '#3b2e1e' : '#fff7ed',
    textoAlertaLaranja: temaTemaEscuro ? '#fed7aa' : '#c2410c',
    bordaAlertaLaranja: '#ea580c',
  };

  const estilos = StyleSheet.create({
    conteiner: { flex: 1, backgroundColor: cores.fundoApp },
    cabecalho: { backgroundColor: cores.fundoCabecalho, paddingVertical: 20, paddingHorizontal: 30, borderBottomWidth: 1, borderBottomColor: cores.bordaCabecalho },
    tituloCabecalho: { fontSize: 24, color: cores.textoPrincipal, fontWeight: 'bold' },
    conteudo: { flex: 1, padding: 30 },
    secao: { marginBottom: 35 },
    titulosecao: { fontSize: 18, fontWeight: 'bold', color: cores.textoPrincipal, marginBottom: 12 },
    subtituloSecao: { fontSize: 14, color: cores.textoSecundario, marginBottom: 12, lineHeight: 20 },
    
    cartaoPassos: { backgroundColor: cores.fundoCartao, borderRadius: 12, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: cores.bordaCartao, elevation: 2 },
    itemPasso: { fontSize: 15, color: cores.textoPrincipal, marginBottom: 10, lineHeight: 22 },
    textoNegrito: { fontWeight: 'bold' },
    
    caixaAlerta: { borderRadius: 8, padding: 14, borderLeftWidth: 4, marginTop: 8, marginBottom: 4 },
    textoAlerta: { fontSize: 14, lineHeight: 22 },
    tituloAlerta: { fontWeight: 'bold', fontSize: 14, marginBottom: 4 }
  });

  return (
    <ScrollView style={estilos.conteiner} showsVerticalScrollIndicator={false}>
      {/* Cabeçalho */}
      <View style={estilos.cabecalho}>
        <Text style={estilos.tituloCabecalho}>Guia de Uso do App</Text>
      </View>

      <View style={estilos.conteudo}>
        
        {/* SEÇÃO 1: PESO DO DIA A DIA */}
        <View style={estilos.secao}>
          <Text style={estilos.titulosecao}>⚖️ 1. Como se pesar Corretamente</Text>
          <Text style={estilos.subtituloSecao}>Para sabermos o seu peso real de rotina, siga esses passos simples todas as manhãs:</Text>
          
          <View style={estilos.cartaoPassos}>
            <Text style={estilos.itemPasso}>
              1️⃣ <Text style={estilos.textoNegrito}>Sempre no mesmo horário:</Text> De preferência de manhã, logo após acordar e ir ao banheiro.
            </Text>
            <Text style={estilos.itemPasso}>
              2️⃣ <Text style={estilos.textoNegrito}>Em jejum:</Text> Antes de tomar café da manhã ou beber água.
            </Text>
            <Text style={estilos.itemPasso}>
              3️⃣ <Text style={estilos.textoNegrito}>Mesma roupa:</Text> Use roupas leves (ou tire o excesso) e fique descalço.
            </Text>
            <Text style={estilos.itemPasso}>
              4️⃣ <Text style={estilos.textoNegrito}>Chão firme:</Text> Coloque a balança em um piso reto e liso (evite tapetes).
            </Text>
          </View>

          <View style={[estilos.caixaAlerta, { backgroundColor: cores.fundoAlertaAzul, borderLeftColor: cores.bordaAlertaAzul }]}>
            <Text style={[estilos.tituloAlerta, { color: cores.textoAlertaAzul }]}>🔍 Regra dos 5% (Peso de um dia para o outro):</Text>
            <Text style={[estilos.textoAlerta, { color: cores.textoAlertaAzul }]}>
              Se o seu peso mudar muito de ontem para hoje, investigue! 
              {"\n"}• <Text style={estilos.textoNegrito}>Exemplo:</Text> Se você pesa <Text style={estilos.textoNegrito}>60 kg</Text> e a balança marcar <Text style={estilos.textoNegrito}>63 kg</Text> (ou <Text style={estilos.textoNegrito}>57 kg</Text>) do nada, confira se a balança não saiu do lugar ou se você não pesou com tênis/moletom pesado!
            </Text>
          </View>
        </View>

        {/* SEÇÃO 2: PESO DO TREINO */}
        <View style={estilos.secao}>
          <Text style={estilos.titulosecao}>🏃‍♂️ 2. O Teste do Treino (Suor e Hidratação)</Text>
          <Text style={estilos.subtituloSecao}>Aqui medimos o quanto de água seu corpo perde através do suor durante o exercício:</Text>
          
          <View style={estilos.cartaoPassos}>
            <Text style={estilos.itemPasso}>
              • <Text style={estilos.textoNegrito}>Peso PRÉ-Treino:</Text> Suba na balança exatamente antes de começar a treinar.
            </Text>
            <Text style={estilos.itemPasso}>
              • <Text style={estilos.textoNegrito}>Peso PÓS-Treino:</Text> Suba na balança logo após terminar, antes de tomar banho.
            </Text>
            <Text style={estilos.itemPasso}>
              • <Text style={estilos.textoNegrito}>Líquidos (L):</Text> Marque quanta água você bebeu durante a atividade.
            </Text>
          </View>

          <View style={[estilos.caixaAlerta, { backgroundColor: cores.fundoAlertaLaranja, borderLeftColor: cores.bordaAlertaLaranja }]}>
            <Text style={[estilos.tituloAlerta, { color: cores.textoAlertaLaranja }]}>⚠️ Atenção com o Limite de Perda no Treino:</Text>
            <Text style={[estilos.textoAlerta, { color: cores.textoAlertaLaranja }]}>
              Perder <Text style={estilos.textoNegrito}>mais de 2%</Text> do seu peso em um treino significa que você está ficando <Text style={estilos.textoNegrito}>Desidratado</Text>.
              {"\n"}• Se o app avisar que você passou de <Text style={estilos.textoNegrito}>5% de perda</Text>, seu corpo está em perigo! Você sentirá muita cãibra, tontura e fadiga. Avise seu nutricionista para ajustar seus isotônicos.
            </Text>
          </View>
        </View>

        {/* SEÇÃO 3: SINAIS DO CORPO */}
        <View style={estilos.secao}>
          <Text style={estilos.titulosecao}>👀 3. Fique de olho nos Sinais</Text>
          <View style={estilos.cartaoPassos}>
            <Text style={estilos.itemPasso}>
              👕 <Text style={estilos.textoNegrito}>Manchas brancas na roupa:</Text> Se sua roupa fica marcada de sal após o treino, você perde muito sódio. Avise o nutricionista!
            </Text>
            <Text style={estilos.itemPasso}>
              🚽 <Text style={estilos.textoNegrito}>Cor da Urina:</Text> Urina escura (cor de suco de maçã) é sinal claro de que você precisa beber mais água imediatamente.
            </Text>
          </View>
        </View>

      </View>
    </ScrollView>
  );
};

export default TelaManual;