# Prompt de Onboarding — Agente Google Ads

Cole o texto abaixo no Claude Code para configurar o agente automaticamente:

---

```
Preciso configurar o Agente Google Ads na minha máquina. Faça o seguinte:

1. Clone o repositório https://github.com/brunocunha77/agente-google-ads na pasta que eu indicar
2. Entre na pasta e rode npm install
3. Copie o arquivo skill/criar-campanha.md para ~/.claude/commands/criar-campanha.md (ou o equivalente no Windows: %USERPROFILE%\.claude\commands\)
4. Copie o .env.example para .env
5. Me mostre o conteúdo do .env e me guie preenchendo cada credencial uma por uma, explicando onde encontrar cada valor. Use o guia em docs/guia-credenciais.md como referência.
6. Após o .env estar preenchido com CLIENT_ID e CLIENT_SECRET, rode node gerar-refresh-token.js para obter o Refresh Token
7. Confirme que tudo está funcionando rodando: node criar-campanha.js --help (ou sem argumentos para ver a mensagem de uso)

Me avise quando estiver pronto para começar e me pergunte em qual pasta devo instalar.
```

---

## O que esse prompt faz

- Clona o repositório automaticamente
- Instala as dependências (`npm install`)
- Instala a skill `/criar-campanha` no Claude Code
- Guia o preenchimento das credenciais passo a passo
- Gera o Refresh Token via OAuth
- Valida que tudo está funcionando

## Após o onboarding

Use `/criar-campanha` no Claude Code para criar campanhas sem precisar digitar comandos manualmente.
