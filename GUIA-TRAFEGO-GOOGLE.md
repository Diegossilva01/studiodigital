# Google Ads — Agência DG

## Antes de ativar anúncios

1. Abra a versão publicada do site no celular e no computador. Confira se a página, os preços, o formulário e o WhatsApp funcionam. Use o endereço HTTPS definitivo da campanha.
2. Faça um envio de teste **com dados fictícios**: a mensagem de sucesso deve aparecer e o contato deve entrar na planilha/painel. O evento de formulário só é disparado depois da confirmação de gravação.
3. Defina qual conta do Google Ads pertence a esta agência. **Não reutilize a tag de outra empresa.** Em `config.js`, preencha `googleAds.id` com o identificador `AW-...` dessa conta.
4. No Google Ads, crie uma ação de conversão de **site** para o envio de formulário (lead). Escolha instalação manual e copie o rótulo do evento para `googleAds.formConversionLabel`. Deixe essa ação como meta principal da campanha e contagem de uma conversão por clique/lead, conforme suas configurações de medição.
5. Se quiser medir cliques diretos no WhatsApp separadamente, crie outra ação e informe seu rótulo em `googleAds.whatsappConversionLabel`. Comece usando-a como **secundária** para não misturar clique com lead salvo. O redirecionamento após o formulário não dispara uma segunda conversão de WhatsApp.
6. Publique a alteração de `config.js` no Git. No site, aceite a medição no aviso e use o **Tag Assistant** para confirmar o ID e o disparo da conversão após um formulário salvo. Se o visitante recusar, a tag não é carregada.

## Campanha inicial sugerida

- Objetivo: **leads**; tipo: **Pesquisa**. URL final: a página publicada da Agência DG.
- Comece por uma área que você consegue atender bem (por exemplo, São Paulo). Se o serviço é remoto para o Brasil inteiro, amplie com base nos contatos qualificados. Revise a opção de local para **Presença** caso queira evitar interesse geográfico fora da área.
- Separe pelo menos os grupos **site essencial de uma página** e **site profissional**, com anúncios que repitam a oferta e os preços exibidos na página. Não anuncie entregas ou prazos que você não combinou.
- Termos iniciais para avaliar em correspondência de frase/exata: `"criação de site profissional"`, `"empresa de criação de sites"`, `"criar site para empresa"`, `"site de uma página para empresa"`, `"site para empresa preço"`. Revise o relatório de termos e adicione negativas como `grátis`, `curso`, `emprego`, `tutorial`, `template` quando não representarem compradores.
- Configure recursos de sitelink para **Planos**, **Exemplos** e **Pedir orçamento**. Os 15 exemplos do site são conceitos ilustrativos; não os anuncie como clientes ou cases reais.
- Estabeleça um limite diário que possa manter durante o teste. Acompanhe contatos **qualificados**, custo por lead, termos de pesquisa e resultado comercial; ajuste o orçamento com esses dados.

## Exemplo de anúncio para revisar

**Títulos:** Criação de Sites para Empresas · Site Essencial a Partir de R$ 350 · Site Profissional a Partir de R$ 490 · Peça Sua Proposta · Seu Site Para Celular

**Descrições:** Criamos um site para apresentar sua empresa e facilitar o contato dos clientes. Peça uma proposta com escopo e preço final antes de contratar. · Site essencial ou profissional com design para sua marca. Criação a partir de R$ 350 e manutenção mensal de R$ 35 após a publicação; confira o escopo.

Os preços anunciados são **a partir de**; domínio, hospedagem e recursos extras são apresentados separadamente na proposta.

## Documentação oficial

- [Criar campanha de pesquisa](https://support.google.com/google-ads/answer/9510373?hl=pt-BR)
- [Tag de conversão de site](https://support.google.com/google-ads/answer/7548399?hl=pt-BR)
- [Verificar com o Tag Assistant](https://support.google.com/google-ads/answer/10989978?hl=pt-BR)
- [Anúncios responsivos de pesquisa](https://support.google.com/google-ads/answer/6167122?hl=pt-BR)
