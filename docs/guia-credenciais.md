# Guia de Credenciais — Google Ads API

Você vai precisar de **6 valores** para preencher o `.env`. Este guia mostra onde encontrar cada um.

```
GOOGLE_ADS_CLIENT_ID=
GOOGLE_ADS_CLIENT_SECRET=
GOOGLE_ADS_REFRESH_TOKEN=
GOOGLE_ADS_DEVELOPER_TOKEN=
GOOGLE_ADS_MANAGER_ID=
GOOGLE_ADS_CUSTOMER_ID=
```

---

## Parte 1 — Client ID e Client Secret (Google Cloud Console)

### Passo 1: Acesse o Google Cloud Console

Acesse [console.cloud.google.com](https://console.cloud.google.com) e faça login com sua conta Google.

Clique no seletor de projetos no topo (ao lado do logo Google Cloud) e selecione um projeto existente ou clique em **"Novo projeto"** para criar um.

> Dica: crie um projeto com nome como "agente-google-ads" para ficar organizado.

---

### Passo 2: Ative a Google Ads API

1. No menu lateral, clique em **"APIs e serviços"** → **"Biblioteca"**
2. Na caixa de pesquisa, digite: `google ads api`
3. Clique no card **"Google Ads API"** (o de cor azul com o logo do Google Ads)
4. Clique em **"Ativar"**

---

### Passo 3: Configure a tela de consentimento OAuth

Antes de criar as credenciais, você precisa configurar o OAuth do projeto.

1. No menu lateral, clique em **"Google Auth Platform"**
   - Se aparecer a tela "A plataforma de autenticação do Google ainda não está configurada", clique em **"Vamos começar"**
2. Preencha:
   - **Nome do app**: qualquer nome (ex: `Agente Google Ads`)
   - **E-mail para suporte do usuário**: seu e-mail
3. Clique em **"Avançar"** em cada seção (**Público**, **Dados de contato**, **Concluir**)
4. Clique em **"Criar"**

---

### Passo 4: Crie o cliente OAuth (Client ID e Secret)

1. Após a configuração, na tela de "Visão geral de OAuth", clique em **"Criar um cliente OAuth"**
   - Ou no menu lateral, clique em **"Clientes"** → **"Criar cliente"**
2. Preencha:
   - **Tipo de aplicativo**: `Aplicativo da Web`
   - **Nome**: qualquer nome (ex: `Cliente Web 1`)
3. Em **"URIs de redirecionamento autorizados"**, clique em **"+ Adicionar URI"** e insira:
   ```
   http://localhost:3000/callback
   ```
4. Clique em **"Criar"**
5. Uma janela vai aparecer com o **ID do cliente** e o **Segredo do cliente** — **copie e salve os dois agora**, pois o segredo não aparece novamente.

Suas variáveis:
```
GOOGLE_ADS_CLIENT_ID=    ← "ID do cliente" mostrado
GOOGLE_ADS_CLIENT_SECRET= ← "Segredo do cliente" mostrado
```

---

## Parte 2 — Developer Token (Google Ads)

### Passo 5: Acesse o Google Ads com conta de administrador (MCC)

Acesse [ads.google.com](https://ads.google.com).

Você precisa de uma **conta de administrador (MCC)**. Se não tiver:
- Na tela inicial do Google Ads, clique em **"Criar uma conta de administrador"**
- Siga os passos para criar a conta MCC

> Uma conta MCC (My Client Center) é diferente de uma conta normal do Google Ads. Ela permite gerenciar várias contas de clientes.

---

### Passo 6: Obtenha o Developer Token

1. Dentro da conta de administrador (MCC), clique no ícone de engrenagem no menu lateral esquerdo (**Adm.**)
2. Clique em **"Central de API"**
3. O **Token de desenvolvedor** aparece no campo "Acesso à API"

Sua variável:
```
GOOGLE_ADS_DEVELOPER_TOKEN= ← valor mostrado em "Token de desenvolvedor"
```

> Atenção: o nível de acesso padrão é "Acesso às Análises". Para uso em produção você precisará solicitar "Acesso padrão" ao Google, mas para testes o padrão já funciona.

---

## Parte 3 — Manager ID e Customer ID

### Passo 7: Encontre o Manager ID

O Manager ID é o ID da sua conta de administrador (MCC).

- Na conta MCC, o ID aparece no **topo da página** ao lado do nome da conta
- Formato: `771-053-6947`
- **Remova os traços** antes de colocar no `.env`: `7710536947`

Sua variável:
```
GOOGLE_ADS_MANAGER_ID= ← ID da conta MCC sem traços
```

---

### Passo 8: Encontre o Customer ID

O Customer ID é o ID da conta do cliente onde as campanhas serão criadas.

1. No menu lateral, clique em **"Contas"**
2. A tabela mostra todas as contas vinculadas com seus IDs (ex: `Smart CRM — 558-877-4898`)
3. Ou clique no ícone de perfil no canto superior direito para ver a lista de contas
4. **Remova os traços** antes de colocar no `.env`: `5588774898`

Sua variável:
```
GOOGLE_ADS_CUSTOMER_ID= ← ID da conta cliente sem traços
```

> Se você não tiver uma conta cliente vinculada, crie uma em "Contas" → "Criar nova conta" ou vincule uma existente em "Vincular conta existente".

---

## Parte 4 — Refresh Token

### Passo 9: Gere o Refresh Token

Com as 4 credenciais anteriores já no `.env`, execute no terminal:

```bash
node gerar-refresh-token.js
```

O navegador vai abrir automaticamente pedindo autorização. Depois de autorizar:
- A página mostrará "Autorização concluída!"
- **Copie o Refresh Token** que aparece no terminal
- Cole no `.env`

Sua variável:
```
GOOGLE_ADS_REFRESH_TOKEN= ← token gerado pelo script
```

---

## Resumo: .env preenchido

```env
GOOGLE_ADS_CLIENT_ID=841631129373-xxxx.apps.googleusercontent.com
GOOGLE_ADS_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxx
GOOGLE_ADS_REFRESH_TOKEN=1//0gxxxxxxxxxxxxxxxxxxxxxxxxx
GOOGLE_ADS_DEVELOPER_TOKEN=xxxxxxxxxxxxxxxxxxx
GOOGLE_ADS_MANAGER_ID=7710536947
GOOGLE_ADS_CUSTOMER_ID=5588774898
```

---

## Dúvidas frequentes

**O Developer Token foi recusado?**  
O Google exige que o token passe por uma revisão para "Acesso padrão". Para testes iniciais, o "Acesso às Análises" já funciona.

**O refresh token não apareceu?**  
Certifique-se de que adicionou `http://localhost:3000/callback` como URI de redirecionamento autorizado no Google Cloud Console (Passo 4).

**"Invalid client" ao rodar o script?**  
Verifique se o `GOOGLE_ADS_CLIENT_ID` e `GOOGLE_ADS_CLIENT_SECRET` no `.env` estão corretos e sem espaços extras.
