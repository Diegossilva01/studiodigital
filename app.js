(() => {
  'use strict';
  const config = window.DG_CONFIG || {};
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  // Cada imagem é uma composição estática de página fictícia, sem site publicado.
  const models = [
    ['Frio Certo','Ar-condicionado','frio-certo'],
    ['CellFix','Assistência técnica','cellfix'],
    ['Veste Boutique','Loja de roupas','veste-boutique'],
    ['Auto Prime','Mecânica','auto-prime'],
    ['Clínica Vitta','Saúde','clinica-vitta'],
    ['Casa Sálvia','Casa','casa-salvia'],
    ['Brasa & Sal','Gastronomia','brasa-sal'],
    ['Flor de Abril','Beleza','flor-abril'],
    ['Rota Livre','Turismo','rota-livre'],
    ['Pet&Co','Pets','pet-co'],
    ['Tempo Café','Gastronomia','tempo-cafe'],
    ['Nuance Joias','Moda','nuance-joias'],
    ['Orla Hotel','Turismo','orla-hotel'],
    ['Lume Arquitetura','Casa','lume-arquitetura'],
    ['Auréa Odonto','Saúde','aurea-odonto'],
  ];
  const esc = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const norm = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const categories = ['Todos', ...new Set(models.map(model => model[1]))];
  let category = 'Todos';
  const grid = $('#model-grid');
  const filterBox = $('#model-filters');
  const search = $('#model-search');
  const showAll = $('#show-all-models');
  let expanded = false;
  filterBox.innerHTML = categories.map(item => `<button type="button" class="model-filter${item === category ? ' active' : ''}" data-category="${esc(item)}" aria-pressed="${item === category}">${esc(item)}</button>`).join('');
  function renderModels() {
    const term = norm(search.value.trim());
    const list = models.filter(([name,type]) => (category === 'Todos' || type === category) && (!term || norm(`${name} ${type}`).includes(term)));
    const visible = expanded || term || category !== 'Todos' ? list : list.slice(0, 6);
    grid.innerHTML = visible.map(([name,type,slug]) => `<article class="model-card"><a class="model-shot-link" href="assets/sites/${slug}.webp?v=7" target="_blank" rel="noopener noreferrer" aria-label="Ampliar imagem do conceito ${esc(name)}"><img src="assets/sites/${slug}.webp?v=7" alt="Prévia ilustrativa da página inicial ${esc(name)}: identidade, navegação, chamada e botão" loading="lazy" width="1448" height="1086"></a><div class="model-info"><span>${esc(type)} · conceito visual ilustrativo</span><strong>${esc(name)}</strong><div class="model-actions"><a href="assets/sites/${slug}.webp?v=7" target="_blank" rel="noopener noreferrer">Ampliar imagem ↗</a><button type="button" data-model="${esc(name)}" aria-label="Pedir um site inspirado no conceito ${esc(name)}">Quero um parecido ↗</button></div></div></article>`).join('') || '<p class="model-empty">Nenhum modelo encontrado. Tente outro termo.</p>';
    $('#model-count').textContent = visible.length === list.length ? `${list.length} ${list.length === 1 ? 'conceito ilustrativo' : 'conceitos ilustrativos'}` : `${visible.length} de ${list.length} conceitos ilustrativos`;
    showAll.hidden = expanded || !!term || category !== 'Todos';
  }
  filterBox.addEventListener('click', event => {
    const button = event.target.closest('button[data-category]');
    if (!button) return;
    category = button.dataset.category;
    $$('.model-filter', filterBox).forEach(item => {const active = item === button; item.classList.toggle('active', active); item.setAttribute('aria-pressed', String(active));});
    renderModels();
  });
  search.addEventListener('input', renderModels);
  showAll.addEventListener('click', () => {expanded = true;renderModels();});
  grid.addEventListener('click', event => {
    const button = event.target.closest('button[data-model]');
    if (!button) return;
    $('#brief-form select[name="tipo"]').value = 'Não sei ainda';
    $('#brief-form textarea[name="mensagem"]').value = `Gostaria de um site inspirado no modelo demonstrativo ${button.dataset.model}.`;
    $('#orcamento').scrollIntoView({behavior:'smooth'});
  });
  renderModels();
  const menu = $('.menu-toggle');
  const nav = $('#site-nav');
  menu.addEventListener('click', () => {const active = nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(active));menu.setAttribute('aria-label',active?'Fechar menu':'Abrir menu');});
  $$('#site-nav a').forEach(link => link.addEventListener('click', () => {nav.classList.remove('open');menu.setAttribute('aria-expanded','false');}));
  $$('[data-price]').forEach(node => {const price = config.precos?.[node.dataset.price];if(price)node.textContent = price;});
  // O Apps Script publicado ainda aceita os códigos legados Landing page/Sistema digital.
  $$('.button-plan').forEach(link => link.addEventListener('click', () => {$('#brief-form select[name="tipo"]').value = link.dataset.plan;const notice = $('#selected-plan');notice.textContent = `Plano escolhido: ${link.dataset.planLabel}. Complete os dados abaixo para enviar sua solicitação.`;notice.hidden = false;}));
  $('#year').textContent = new Date().getFullYear();
  const whatsappButton = $('#whatsapp-contact');
  const agencyPhone = String(config.whatsapp || '').replace(/\D/g, '');
  if (/^55\d{10,11}$/.test(agencyPhone)) {
    const contactUrl = `https://wa.me/${agencyPhone}?text=${encodeURIComponent('Olá! Vi o site da Agência DG e gostaria de conversar sobre a criação de um site.')}`;
    [whatsappButton, $('#process-whatsapp')].forEach(link => {
      link.href = contactUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.addEventListener('click', () => window.DGAds?.trackWhatsapp());
    });
  } else {
    whatsappButton.title = 'Informe o WhatsApp da agência em config.js';
  }
  // Google recebe diretamente; não usa API ou variáveis da Vercel.
  const GOOGLE_URL = 'https://script.google.com/macros/s/AKfycbxIPqGn_OH9XXmvCJhSM0PywdHeB4mtvnwqBTbpk0mwalwNfxNpyaVkrEsYK9TH1HWf0Q/exec';
  function enviarAoGoogle(data) {
    return new Promise((resolve, reject) => {
      const frame = document.createElement('iframe');
      frame.name = 'dg_envio_' + data.id;
      frame.hidden = true; frame.title = 'Envio do formulário';
      const transport = document.createElement('form');
      transport.method = 'POST'; transport.action = GOOGLE_URL;
      transport.target = frame.name; transport.hidden = true;
      const input = document.createElement('input');
      input.name = 'payload'; input.value = JSON.stringify(data);
      transport.append(input);
      let timer;
      function finish(error, result) {
        clearTimeout(timer); window.removeEventListener('message', receive);
        transport.remove(); frame.remove();
        if (error) reject(error); else resolve(result);
      }
      function receive(event) {
        // O HTML do Apps Script pode vir de um subdomínio com sufixo
        // -script.googleusercontent.com ou de um iframe com origem opaca.
        const googleOrigin = event.origin === 'https://script.google.com' ||
          /^https:\/\/[a-z0-9.-]*script\.googleusercontent\.com$/.test(event.origin) ||
          event.origin === 'null';
        if (!googleOrigin) return;
        const result = event.data;
        if (!result || result.channel !== 'dg-contatos' || result.id !== data.id) return;
        finish(result.ok === true ? null : new Error('Não foi possível salvar. Tente novamente.'), result);
      }
      window.addEventListener('message', receive);
      timer = setTimeout(() => finish(new Error('O Google não confirmou o envio. Confira se publicou a nova versão do Apps Script e tente novamente. Seus dados continuam preenchidos.')), 20000);
      document.body.append(frame, transport);
      transport.submit();
    });
  }
  const form = $('#brief-form');
  let pendingKey = '', pendingId = '', busy = false;
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (busy || !form.reportValidity()) return;
    const feedback = $('.form-feedback', form);
    const data = Object.fromEntries(new FormData(form));
    const phone = String(data.telefone || '').replace(/\D/g,'');
    if (phone.length < 10 || phone.length > 13) {feedback.textContent = 'Confira o número de WhatsApp informado.';return;}
    const key = JSON.stringify(data);
    if (key !== pendingKey) {
      pendingKey = key;
      pendingId = Array.from(crypto.getRandomValues(new Uint8Array(20)), v => v.toString(16).padStart(2,'0')).join('');
    }
    const button = $('button[type="submit"]', form);
    busy = true; button.disabled = true; feedback.textContent = 'Enviando sua solicitação…';
    try {
      await enviarAoGoogle({...data, id: pendingId, consentimento: true});
      await window.DGAds?.trackForm(pendingId);
      feedback.textContent = 'Solicitação recebida! Nossa equipe entrará em contato.';
      const tipoVisivel = data.tipo === 'Landing page' ? 'Site essencial' : data.tipo === 'Sistema digital' ? 'Site com sistema' : data.tipo;
      const message = `Olá! Meu nome é ${data.nome}. Gostaria de um orçamento para ${tipoVisivel}. Meu WhatsApp: ${data.telefone}.${data.mensagem ? ` Sobre o projeto: ${data.mensagem}` : ''}`;
      const destination = String(config.whatsapp || '').replace(/\D/g,'');
      form.reset(); $('#selected-plan').hidden = true; pendingKey = ''; pendingId = '';
      if (/^55\d{10,11}$/.test(destination)) {
        const whatsappUrl = `https://wa.me/${destination}?text=${encodeURIComponent(message)}`;
        const link = document.createElement('a');
        link.href = whatsappUrl;
        link.textContent = ' Abrir conversa no WhatsApp';
        feedback.append(link);
        window.location.assign(whatsappUrl);
      }
    } catch (error) {
      feedback.textContent = error.message || 'Falha no envio. Tente novamente.';
    } finally {busy = false; button.disabled = false;}
  });
})();
