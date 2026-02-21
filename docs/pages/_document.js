import React from 'react';
import Document, { Head, Main, NextScript } from 'next/document';
import createEmotionServer from '@emotion/server/create-instance';
import getPageContext from '../utils/getPageContext';
import createEmotionCache from '../utils/createEmotionCache';

class MyDocument extends Document {
  render() {
    return (
      <html lang="en" dir="ltr">
        <Head>
          <title>Material-UI DataTables</title>

          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
          <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />

          <meta
            name="description"
            content={'MUI-Datatables is a data tables component built for React Material-UI V1'}
          />
          <meta
            name="keywords"
            content={
              'material-ui, data tables, datatables, material-ui, material-ui-datables, react tables, react data tables'
            }
          />
          <meta name="robots" content="index,follow,noodp" />
          <meta name="author" content="Gregory Nowakowski" />
          <meta name="googlebot" content="noarchive" />

          <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500" />
          <link rel="shortcut icon" href="/static/favicon.ico" />
          <style>
            {`
              body {   
                margin: 0px;
                padding: 0px;
                height: 100%;
                font-size: 16px;
                min-height: min-content;
                font-family: Roboto, Helvetica, Arial, sans-serif;
              }
              a {
                color: #0366d6;
                text-decoration: none;
              }
              p {
                line-height: 1.6;
              }
              .token.operator, .token.entity, .token.url, .language-css .token.string, .style .token.string {
                background: none !important;
              }
            `}
          </style>

          <script async src="https://www.googletagmanager.com/gtag/js?id=UA-116686642-1" />
          <script
            dangerouslySetInnerHTML={{
              __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'UA-116686642-1');
          `,
            }}
          />
          {/* Inject MUI styles first to match with the prepend: true configuration. */}
          {this.props.emotionStyleTags}
        </Head>
        <body>
          {this.props.customValue}
          <Main />
          <NextScript />
        </body>
      </html>
    );
  }
}

MyDocument.getInitialProps = async ctx => {
  const originalRenderPage = ctx.renderPage;
  const cache = createEmotionCache();
  const { extractCriticalToChunks } = createEmotionServer(cache);

  ctx.renderPage = () =>
    originalRenderPage({
      enhanceApp: App =>
        function EnhanceApp(props) {
          return <App emotionCache={cache} {...props} />;
        },
    });

  const initialProps = await Document.getInitialProps(ctx);
  const emotionStyles = extractCriticalToChunks(initialProps.html);
  const emotionStyleTags = emotionStyles.styles.map(style => (
    <style
      data-emotion={`${style.key} ${style.ids.join(' ')}`}
      key={style.key}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: style.css }}
    />
  ));

  return {
    ...initialProps,
    emotionStyleTags,
  };
};

export default MyDocument;
