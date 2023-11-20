import { ColorModeScript } from '@chakra-ui/color-mode';
import Document, {
  Html,
  Head,
  Main,
  NextScript,
  DocumentContext,
} from 'next/document';

import theme from '../styles/theme';

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext): Promise<any> {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render(): any {
    return (
      <Html>
        <Head />
        <div className='snow z-[-1000]'></div>
        <body style={{ width: `100vw`, height: `100vh` }}>
          <ColorModeScript initialColorMode={theme.config.initialColorMode} />
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
