import { Head, Html, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="pt-BR">
      <Head>
        <meta name="theme-color" content="#07070a" />
        <meta name="color-scheme" content="dark" />
        {/* .ico para navegadores antigos; o SVG (nítido em qualquer tamanho) tem prioridade onde é suportado. */}
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
