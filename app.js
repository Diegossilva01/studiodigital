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
  filterBox.innerHTML = categories.map(item => `<button type="button" class="model-filter${item === category ? ' active' : ''}" data-category="${esc(item)}" aria-pressed="${item === category}">${esc(item)}</button>`).join('');
  function renderModels() {
    const term = norm(search.value.trim());
    const list = models.filter(([name,type]) => (category === 'Todos' || type === category) && (!term || norm(`${name} ${type}`).includes(term)));
    grid.innerHTML = list.map(([name,type,slug]) => `<article class="model-card"><a class="model-shot-link" href="assets/sites/${slug}.webp?v=7" target="_blank" rel="noopener noreferrer" aria-label="Ampliar imagem do conceito ${esc(name)}"><img src="assets/sites/${slug}.webp?v=7" alt="Prévia ilustrativa da página inicial ${esc(name)}: identidade, navegação, chamada e botão" loading="lazy" width="1448" height="1086"></a><div class="model-info"><span>${esc(type)} · conceito visual ilustrativo</span><strong>${esc(name)}</strong><div class="model-actions"><a href="assets/sites/${slug}.webp?v=7" target="_blank" rel="noopener noreferrer">Ampliar imagem ↗</a><button type="button" data-model="${esc(name)}" aria-label="Pedir um site inspirado no conceito ${esc(name)}">Quero um parecido ↗</button></div></div></article>`).join('') || '<p class="model-empty">Nenhum modelo encontrado. Tente outro termo.</p>';
    $('#model-count').textContent = `${list.length} ${list.length === 1 ? 'conceito ilustrativo' : 'conceitos ilustrativos'}`;
  }
  filterBox.addEventListener('click', event => {
    const button = event.target.closest('button[data-category]');
    if (!button) return;
    category = button.dataset.category;
    $$('.model-filter', filterBox).forEach(item => {const active = item === button; item.classList.toggle('active', active); item.setAttribute('aria-pressed', String(active));});
    renderModels();
  });
  search.addEventListener('input', renderModels);
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
  $$('.button-plan').forEach(button => button.addEventListener('click', () => {$('#brief-form select[name="tipo"]').value = button.dataset.plan;$('#orcamento').scrollIntoView({behavior:'smooth'});$('#brief-form input[name="nome"]').focus({preventScroll:true});}));
  $('#year').textContent = new Date().getFullYear();
  const form = $('#brief-form');
  let pendingKey = '', pendingId = '', busy = false;
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (busy) return;
    const feedback = $('.form-feedback', form);
    const data = Object.fromEntries(new FormData(form));
    if (!data.consentimento || !form.reportValidity()) return;
    const phone = String(data.telefone || '').replace(/\D/g,'');
    if (phone.length < 10 || phone.length > 13) {feedback.textContent = 'Confira o número de WhatsApp informado.';return;}
    const key = JSON.stringify(data);
    if (key !== pendingKey) {pendingKey = key; pendingId = crypto.randomUUID();}
    const button = $('button[type="submit"]', form);
    busy = true; button.disabled = true; feedback.textContent = 'Enviando sua solicitação…';
    try {
      const response = await fetch('/api/contatos', {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({...data, id: pendingId, consentimento: true}),
        signal: AbortSignal.timeout(30000)
      });
      const result = await response.json();
      if (!response.ok || result.ok !== true) throw new Error(result.error || 'Não foi possível confirmar o envio. Tente novamente.');
      feedback.textContent = 'Solicitação recebida! Nossa equipe entrará em contato.';
      const message = `Olá! Meu nome é ${data.nome}. Gostaria de um orçamento para ${data.tipo}. Meu WhatsApp: ${data.telefone}.${data.mensagem ? ` Sobre o projeto: ${data.mensagem}` : ''}`;
      const destination = String(config.whatsapp || '').replace(/\D/g,'');
      form.reset(); pendingKey = ''; pendingId = '';
      if (/^55\d{10,11}$/.test(destination)) {
        window.DGAds?.trackLead();
        window.location.assign(`https://wa.me/${destination}?text=${encodeURIComponent(message)}`);
      }
    } catch (error) {
      feedback.textContent = error.name === 'TimeoutError' ? 'O envio demorou. Tente novamente; seus dados continuam preenchidos.' : (error.message || 'Falha no envio. Tente novamente.');
    } finally {busy = false; button.disabled = false;}
  });
})();
