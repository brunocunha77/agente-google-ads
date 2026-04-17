const { GoogleAdsApi, enums, toMicros } = require('google-ads-api');
require('dotenv').config();

// ── Credenciais via .env ───────────────────────────────────────────────────
const config = {
  clientId:     process.env.GOOGLE_ADS_CLIENT_ID,
  clientSecret: process.env.GOOGLE_ADS_CLIENT_SECRET,
  refreshToken: process.env.GOOGLE_ADS_REFRESH_TOKEN,
  developerToken: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
  managerId:    process.env.GOOGLE_ADS_MANAGER_ID,
  customerId:   process.env.GOOGLE_ADS_CUSTOMER_ID,
};

// ── Argumentos de linha de comando ────────────────────────────────────────
// Uso:
//   node criar-campanha-clinica.js \
//     --nome "Minha Campanha" \
//     --url "https://meusite.com" \
//     --orcamento 80 \
//     --keywords "dentista,clareamento dental,implante" \
//     --titulos "Título 1,Título 2,Título 3" \
//     --descricoes "Descrição 1,Descrição 2"
function parseArgs() {
  const args = process.argv.slice(2);
  const result = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2);
      const value = args[i + 1] && !args[i + 1].startsWith('--') ? args[++i] : true;
      result[key] = value;
    }
  }
  return result;
}

function validar(args) {
  const obrigatorios = ['nome', 'url', 'orcamento', 'keywords', 'titulos', 'descricoes'];
  const faltando = obrigatorios.filter(k => !args[k]);
  if (faltando.length) {
    console.error(`Erro: parâmetros obrigatórios faltando: --${faltando.join(', --')}`);
    console.error(`\nUso:\n  node criar-campanha-clinica.js \\`);
    console.error(`    --nome "Nome da Campanha" \\`);
    console.error(`    --url "https://meusite.com" \\`);
    console.error(`    --orcamento 80 \\`);
    console.error(`    --keywords "palavra1,palavra2,palavra3" \\`);
    console.error(`    --titulos "Título 1,Título 2,Título 3" \\`);
    console.error(`    --descricoes "Descrição 1,Descrição 2"`);
    process.exit(1);
  }
  if (isNaN(Number(args.orcamento)) || Number(args.orcamento) <= 0) {
    console.error('Erro: --orcamento deve ser um número positivo (ex: 80)');
    process.exit(1);
  }
  const titulos = args.titulos.split(',').map(t => t.trim());
  if (titulos.length < 3) {
    console.error('Erro: --titulos deve ter no mínimo 3 títulos separados por vírgula');
    process.exit(1);
  }
  const descricoes = args.descricoes.split(',').map(d => d.trim());
  if (descricoes.length < 2) {
    console.error('Erro: --descricoes deve ter no mínimo 2 descrições separadas por vírgula');
    process.exit(1);
  }
}

// Helper: extrai resource_name da resposta de mutateResources
function getResourceName(res, index = 0) {
  const op = res.mutate_operation_responses[index];
  return op[op.response].resource_name;
}

async function criarCampanha() {
  const args = parseArgs();
  validar(args);

  const nomeCampanha  = args.nome;
  const urlFinal      = args.url;
  const orcamento     = Number(args.orcamento);
  const keywords      = args.keywords.split(',').map(k => k.trim()).filter(Boolean);
  const titulos       = args.titulos.split(',').map(t => t.trim()).filter(Boolean);
  const descricoes    = args.descricoes.split(',').map(d => d.trim()).filter(Boolean);
  const nomeGrupo     = args.grupo || `${nomeCampanha} - Grupo 1`;

  const client = new GoogleAdsApi({
    client_id:      config.clientId,
    client_secret:  config.clientSecret,
    developer_token: config.developerToken,
  });

  const customer = client.Customer({
    customer_id:      config.customerId,
    login_customer_id: config.managerId,
    refresh_token:    config.refreshToken,
  });

  console.log(`\nCriando campanha: "${nomeCampanha}"...\n`);

  // ── 1. Orçamento ────────────────────────────────────────────────────────
  console.log(`1. Criando orçamento de R$${orcamento}/dia...`);
  const budgetRes = await customer.mutateResources([{
    entity: 'campaign_budget', operation: 'create',
    resource: {
      name: `Orçamento - ${nomeCampanha} - ${Date.now()}`,
      delivery_method: enums.BudgetDeliveryMethod.STANDARD,
      amount_micros: toMicros(orcamento),
      explicitly_shared: false,
    },
  }]);
  const budgetResourceName = getResourceName(budgetRes);
  console.log(`   OK: ${budgetResourceName}\n`);

  // ── 2. Campanha ──────────────────────────────────────────────────────────
  console.log('2. Criando campanha...');
  const campaignRes = await customer.mutateResources([{
    entity: 'campaign', operation: 'create',
    resource: {
      name: nomeCampanha,
      status: enums.CampaignStatus.PAUSED,
      advertising_channel_type: enums.AdvertisingChannelType.SEARCH,
      campaign_budget: budgetResourceName,
      network_settings: {
        target_google_search: true,
        target_search_network: true,
        target_content_network: false,
        target_partner_search_network: false,
      },
      target_spend: {},
      contains_eu_political_advertising:
        enums.EuPoliticalAdvertisingStatus.DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING,
    },
  }]);
  const campaignResourceName = getResourceName(campaignRes);
  const campaignId = campaignResourceName.split('/').pop();
  console.log(`   OK: ID ${campaignId}\n`);

  // ── 3. Grupo de Anúncios ─────────────────────────────────────────────────
  console.log('3. Criando grupo de anúncios...');
  const adGroupRes = await customer.mutateResources([{
    entity: 'ad_group', operation: 'create',
    resource: {
      name: nomeGrupo,
      campaign: campaignResourceName,
      status: enums.AdGroupStatus.ENABLED,
      type: enums.AdGroupType.SEARCH_STANDARD,
      cpc_bid_micros: toMicros(2),
    },
  }]);
  const adGroupResourceName = getResourceName(adGroupRes);
  console.log(`   OK: ${adGroupResourceName}\n`);

  // ── 4. Palavras-chave ────────────────────────────────────────────────────
  console.log(`4. Adicionando ${keywords.length} palavras-chave...`);
  await customer.mutateResources(
    keywords.map(kw => ({
      entity: 'ad_group_criterion', operation: 'create',
      resource: {
        ad_group: adGroupResourceName,
        status: enums.AdGroupCriterionStatus.ENABLED,
        keyword: { text: kw, match_type: enums.KeywordMatchType.PHRASE },
      },
      exempt_policy_violation_keys: [
        { policy_name: 'HEALTH_IN_PERSONALIZED_ADS', violating_text: kw },
      ],
    }))
  );
  console.log(`   OK: ${keywords.length} palavras-chave\n`);

  // ── 5. Anúncio Responsivo ────────────────────────────────────────────────
  console.log('5. Criando anúncio responsivo...');
  await customer.mutateResources([{
    entity: 'ad_group_ad', operation: 'create',
    resource: {
      ad_group: adGroupResourceName,
      status: enums.AdGroupAdStatus.ENABLED,
      ad: {
        final_urls: [urlFinal],
        responsive_search_ad: {
          headlines:    titulos.map((text, i) => i === 0
            ? { text, pinned_field: enums.ServedAssetFieldType.HEADLINE_1 }
            : { text }),
          descriptions: descricoes.map(text => ({ text })),
        },
      },
    },
  }]);
  console.log('   OK: anúncio criado\n');

  // ── Resultado ────────────────────────────────────────────────────────────
  console.log('='.repeat(60));
  console.log('CAMPANHA CRIADA COM SUCESSO!');
  console.log('='.repeat(60));
  console.log(`Nome            : ${nomeCampanha}`);
  console.log(`ID da Campanha  : ${campaignId}`);
  console.log(`Orçamento Diário: R$${orcamento},00`);
  console.log(`URL Final       : ${urlFinal}`);
  console.log(`Status          : PAUSADA (ative quando estiver pronto)`);
  console.log(`Palavras-chave  : ${keywords.length}`);
  console.log('='.repeat(60));
  console.log(`\nLink: https://ads.google.com/aw/campaigns?campaignId=${campaignId}`);
}

criarCampanha().catch(err => {
  console.error('\nErro ao criar campanha:');
  if (err?.errors) {
    err.errors.forEach(e => console.error(` - ${e.message}`));
  } else {
    console.error(err?.message || JSON.stringify(err));
  }
  process.exit(1);
});
