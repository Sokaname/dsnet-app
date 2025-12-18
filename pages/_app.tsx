import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useEffect } from 'react'; // <--- Importante

export default function App({ Component, pageProps }: AppProps) {
  
  // --- CÓDIGO NOVO PARA INSTALAR O APP ---
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(() => console.log('Service Worker registrado!'))
        .catch((err) => console.log('Falha ao registrar SW', err));
    }
  }, []);
  // ---------------------------------------

  return (
    <>
      <Head>
        <title>Dsnet App</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0f172a" />
        <link rel="apple-touch-icon" href="/icon-512.png" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
<link rel="manifest" href="/manifest.json?v=2" />