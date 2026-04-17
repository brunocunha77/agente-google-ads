# Agente Google Ads

Crie campanhas no Google Ads via linha de comando ou diretamente pelo Claude Code.

## Requisitos

- [Node.js](https://nodejs.org/) 18+
- [Claude Code](https://claude.ai/code)
- Conta Google Ads com acesso à API

## Instalação

```bash
git clone https://github.com/brunocunha77/agente-google-ads.git
cd agente-google-ads
npm install
```

## Configuração

Copie o arquivo de exemplo e preencha com suas credenciais:

```bash
cp .env.example .env
```

Edite o `.env` com suas credenciais do Google Ads:

```
GOOGLE_ADS_CLIENT_ID=seu_client_id
GOOGLE_ADS_CLIENT_SECRET=seu_client_secret
GOOGLE_ADS_REFRESH_TOKEN=seu_refresh_token
GOOGLE_ADS_DEVELOPER_TOKEN=seu_developer_token
GOOGLE_ADS_MANAGER_ID=id_da_conta_manager
GOOGLE_ADS_CUSTOMER_ID=id_da_conta_cliente
```

> Como obter as credenciais: [Google Ads API - Getting Started](https://developers.google.com/google-ads/api/docs/get-started/introduction)

## Uso via linha de comando

```bash
node criar-campanha.js \
  --nome "Nome da Campanha" \
  --url "https://meusite.com" \
  --orcamento 80 \
  --keywords "palavra1,palavra2,palavra3" \
  --titulos "Título 1,Título 2,Título 3,Título 4" \
  --descricoes "Descrição 1,Descrição 2"
```

### Parâmetros

| Parâmetro | Obrigatório | Descrição |
|---|---|---|
| `--nome` | ✅ | Nome da campanha |
| `--url` | ✅ | URL de destino dos anúncios |
| `--orcamento` | ✅ | Orçamento diário em R$ |
| `--keywords` | ✅ | Palavras-chave separadas por vírgula |
| `--titulos` | ✅ | Títulos do anúncio (mínimo 3, separados por vírgula) |
| `--descricoes` | ✅ | Descrições do anúncio (mínimo 2, separadas por vírgula) |
| `--grupo` | ❌ | Nome do grupo de anúncios (padrão: "Nome da Campanha - Grupo 1") |

## Uso via Claude Code (skill)

Copie a skill para o diretório de comandos do Claude Code:

**Mac/Linux:**
```bash
cp skill/criar-campanha.md ~/.claude/commands/criar-campanha.md
```

**Windows:**
```bash
copy skill\criar-campanha.md %USERPROFILE%\.claude\commands\criar-campanha.md
```

Depois, no Claude Code, basta digitar:
```
/criar-campanha
```

O Claude irá guiar você pelo processo de criação da campanha.
