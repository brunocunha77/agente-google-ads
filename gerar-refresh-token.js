const http = require('http');
const { exec } = require('child_process');
require('dotenv').config();

const CLIENT_ID     = process.env.GOOGLE_ADS_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_ADS_CLIENT_SECRET;
const REDIRECT_URI  = 'http://localhost:3000/callback';
const SCOPE         = 'https://www.googleapis.com/auth/adwords';

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Erro: GOOGLE_ADS_CLIENT_ID e GOOGLE_ADS_CLIENT_SECRET devem estar no .env');
  process.exit(1);
}

const authUrl =
  `https://accounts.google.com/o/oauth2/v2/auth` +
  `?client_id=${encodeURIComponent(CLIENT_ID)}` +
  `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
  `&response_type=code` +
  `&scope=${encodeURIComponent(SCOPE)}` +
  `&access_type=offline` +
  `&prompt=consent`;

const server = http.createServer(async (req, res) => {
  const url  = new URL(req.url, 'http://localhost:3000');
  const code = url.searchParams.get('code');

  if (!code) {
    res.writeHead(400);
    res.end('Código de autorização não encontrado.');
    return;
  }

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id:     CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri:  REDIRECT_URI,
      grant_type:    'authorization_code',
    }),
  });

  const tokens = await tokenRes.json();

  if (tokens.refresh_token) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h2 style="font-family:sans-serif">Autorização concluída! Pode fechar esta aba e voltar ao terminal.</h2>');
    server.close();

    console.log('\n✅ REFRESH TOKEN OBTIDO COM SUCESSO!\n');
    console.log('Adicione esta linha ao seu .env:\n');
    console.log(`GOOGLE_ADS_REFRESH_TOKEN=${tokens.refresh_token}`);
    console.log('');
  } else {
    res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`<pre>${JSON.stringify(tokens, null, 2)}</pre>`);
    console.error('\nErro ao obter token:', tokens);
    server.close();
  }
});

server.listen(3000, () => {
  console.log('');
  console.log('='.repeat(60));
  console.log('GERADOR DE REFRESH TOKEN — Google Ads API');
  console.log('='.repeat(60));
  console.log('\nAbrindo navegador para autorização...');
  console.log('Se não abrir automaticamente, acesse:\n');
  console.log(authUrl);
  console.log('');

  // Abre o navegador no Windows, Mac ou Linux
  const open =
    process.platform === 'win32'  ? `start "" "${authUrl}"` :
    process.platform === 'darwin' ? `open "${authUrl}"` :
                                    `xdg-open "${authUrl}"`;
  exec(open);
});
