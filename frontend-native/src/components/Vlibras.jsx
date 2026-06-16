import React, { useRef } from 'react';
import { View, Button, StyleSheet, Platform } from 'react-native';
import { WebView } from 'react-native-webview';

export default function Vlibras({ texto, tituloBotao }) {
  const webviewRef = useRef(null);
  const iframeRef = useRef(null);

  const traduzirTexto = () => {
    if (Platform.OS === 'web') {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage({ tipo: 'TRADUZIR', textoAtraduzir: texto }, '*');
      }
    } else {
      const scriptInjetado = `
        if (window.plugin && window.plugin.vlibras) {
          window.plugin.vlibras.translate('${texto}');
        }
        true;
      `;
      if (webviewRef.current) {
        webviewRef.current.injectJavaScript(scriptInjetado);
      }
    }
  };

  const htmlVlibras = `
    <!DOCTYPE html>
    <html lang="pt-br">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { background-color: transparent; margin: 0; }
        </style>
      </head>
      <body>
        <div vw class="enabled">
          <div vw-access-button class="active"></div>
          <div vw-plugin-wrapper>
            <div class="vw-plugin-top-wrapper"></div>
          </div>
        </div>
        <script src="https://vlibras.gov.br/app/vlibras-plugin.js"></script>
        <script>
          new window.VLibras.Widget('https://vlibras.gov.br/app');
          
          window.addEventListener('message', function(event) {
            if (event.data && event.data.tipo === 'TRADUZIR') {
              if (window.plugin && window.plugin.vlibras) {
                window.plugin.vlibras.translate(event.data.textoAtraduzir);
              }
            }
          });
        </script>
      </body>
    </html>
  `;

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <Button title={tituloBotao} onPress={traduzirTexto} />
        <iframe 
          ref={iframeRef}
          srcDoc={htmlVlibras} 
          style={{ width: '100%', minHeight: '250px', border: 'none', marginTop: 10 }} 
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Button title={tituloBotao} onPress={traduzirTexto} />
      <WebView
        ref={webviewRef}
        source={{ html: htmlVlibras }}
        style={styles.webview}
        javaScriptEnabled={true}
        scalesPageToFit={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 250,
    marginVertical: 10,
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  }
});