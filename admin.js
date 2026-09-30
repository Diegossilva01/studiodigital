
(() => {
'use strict';
const $ = selector => document.querySelector(selector);
let token = '', contacts = [], next = null, total = 0, tab = 'waiting', loading = false;
try { token = sessionStorage.getItem('dg_admin_session') || ''; } catch {}
function store(value) {token=value;try {if(value)sessionStorage.setItem('dg_admin_session',value);else sessionStorage.removeItem('dg_admin_session');}catch{}}
const GOOGLE_URL = 'https://script.google.com/macros/s/AKfycbxIPqGn_OH9XXmvCJhSM0PywdHeB4mtvnwqBTbpk0mwalwNfxNpyaVkrEsYK9TH1HWf0Q/exec';
function call(method, ...args) {
 return new Promise((resolve,reject) => {
  if(location.protocol !== 'https:') {reject(new Error('Abra o painel pelo endereço publicado do seu site.'));return;}
  const id=Array.from(crypto.getRandomValues(new Uint8Array(20)),v=>v.toString(16).padStart(2,'0')).join('');
  const frame=document.createElement('iframe');frame.hidden=true;frame.name='dg_admin_'+id;frame.title='Conexão de dados';
  const transport=document.createElement('form');transport.hidden=true;transport.method='POST';transport.action=GOOGLE_URL;transport.target=frame.name;
  const input=document.createElement('input');input.name='payload';input.value=JSON.stringify({acao:method,args,requestId:id,origin:location.origin});transport.append(input);
  let timer;
  function finish(err,result){clearTimeout(timer);window.removeEventListener('message',receive);transport.remove();frame.remove();if(err)reject(err);else resolve(result);}
  function receive(event){
   if(event.origin!=='https://script.google.com' && event.origin!=='null' && !/^https:\/\/[a-z0-9.-]*script\.googleusercontent\.com$/.test(event.origin))return;
   const result=event.data;if(!result||result.channel!=='dg-admin'||result.id!==id)return;
   finish(result.ok?null:new Error(result.error||'Não foi possível completar a solicitação.'),result.data);
  }
  window.addEventListener('message',receive);
  timer=setTimeout(()=>finish(new Error('O Google demorou a responder. Tente novamente.')),30000);
  document.body.append(frame,transport);transport.submit();
 });
}
function error(err, target='#panelMsg') {$(target).textContent=err.message;if(/Sessão expirada/.test(err.message)){store('');$('#app').hidden=true;$('#login').hidden=false;$('#loginMsg').textContent='Sua sessão expirou. Entre novamente.';contacts=[];}}
function show() {$('#login').hidden=true;$('#app').hidden=false;}
function node(tag,cls,text) {const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=text;return el;}
function phoneUrl(c) {let phone=c.telefone.replace(/\D/g,'');if(phone.length===10||phone.length===11)phone='55'+phone;return /^\d{10,15}$/.test(phone)?'https://wa.me/'+phone+'?text='+encodeURIComponent('Olá, '+c.nome+'! Sou da Agência DG. Recebemos sua solicitação sobre '+c.tipo+'. Podemos conversar sobre seu projeto?'):null;}
function date(value) {const d=new Date(value);return Number.isNaN(d.getTime())?value:d.toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo',dateStyle:'short',timeStyle:'short'});}
function render() {
 const waiting=contacts.filter(c=>c.status!=='Atendido').length,done=contacts.length-waiting;
 $('#total').textContent=contacts.length;$('#waiting').textContent=waiting;$('#done').textContent=done;$('#waitingBadge').textContent=waiting;$('#doneBadge').textContent=done;
 $('#sync').textContent=contacts.length+' de '+total+' contatos · Atualização a cada 30 s';
 $('#viewTitle').textContent=tab==='done'?'Atendidos':'Aguardando contato';$('#viewDescription').textContent=tab==='done'?'Histórico dos contatos que você já atendeu.':'Pessoas que enviaram uma solicitação pelo site.';
 const query=$('#search').value.trim().toLocaleLowerCase('pt-BR');const items=contacts.filter(c=>(tab==='done'?c.status==='Atendido':c.status!=='Atendido')&&[c.nome,c.telefone,c.tipo].some(v=>v.toLocaleLowerCase('pt-BR').includes(query)));
 const list=$('#list');list.replaceChildren();
 if(!items.length)list.append(node('div','empty',query?'Nenhum contato encontrado.':tab==='done'?'Nenhum contato atendido ainda.':'Nenhum contato aguardando atendimento.'));
 items.forEach(c=>{
  const card=node('article','contact');const head=node('div','contact-head');const info=node('div');info.append(node('h3','',c.nome),node('div','details',c.telefone+' · '+c.tipo+' · '+date(c.data)));head.append(info,node('span','badge'+(c.status==='Atendido'?' done':''),c.status==='Atendido'?'✓ Atendido':'◎ Aguardando'));card.append(head,node('p','message',c.mensagem||'Sem mensagem adicional.'));
  const actions=node('div','actions');const url=phoneUrl(c);if(url){const a=node('a','btn wa','Conversar no WhatsApp ↗');a.href=url;a.target='_blank';a.rel='noopener noreferrer';actions.append(a);}
  const mark=node('button','btn',c.status==='Atendido'?'↶ Voltar para aguardando':'✓ Pessoa atendida');const localMessage=node('p','feedback');
  mark.addEventListener('click',async()=>{mark.disabled=true;try{await call('atualizarContato',token,c.id,c.status==='Atendido'?'Novo':'Atendido',c.observacoes);c.status=c.status==='Atendido'?'Novo':'Atendido';render();}catch(err){localMessage.textContent=err.message;error(err);}finally{mark.disabled=false;}});actions.append(mark);
  const details=node('details','notes');details.append(node('summary','','Observações do atendimento'));const text=node('textarea');text.maxLength=2000;text.rows=3;text.value=c.observacoes;text.setAttribute('aria-label','Observações sobre '+c.nome);const save=node('button','btn secondary','Salvar observação');save.type='button';save.addEventListener('click',async()=>{save.disabled=true;try{await call('atualizarContato',token,c.id,c.status,text.value);c.observacoes=text.value;localMessage.textContent='Observação salva.';}catch(err){localMessage.textContent=err.message;error(err);}finally{save.disabled=false;}});details.append(text,save);card.append(actions,details,localMessage);list.append(card);
 });$('#more').hidden=next===null;
}
async function refresh(more=false,silent=false){if(loading||!token)return;loading=true;$('#refresh').disabled=true;$('#more').disabled=true;if(!silent)$('#panelMsg').textContent='Carregando contatos…';try{const data=await call('listarContatos',token,more?next:0);if(silent){const fresh=new Map(data.contatos.map(c=>[c.id,c]));contacts=data.contatos.concat(contacts.filter(c=>!fresh.has(c.id)));total=data.total;next=contacts.length<total?contacts.length:null;}else{contacts=more?contacts.concat(data.contatos):data.contatos;next=data.proximo;total=data.total;}render();$('#panelMsg').textContent='';}catch(err){error(err);}finally{loading=false;$('#refresh').disabled=false;$('#more').disabled=false;}}
$('#loginForm').addEventListener('submit',async e=>{e.preventDefault();const form=e.currentTarget,b=form.querySelector('button'),data=new FormData(form);b.disabled=true;$('#loginMsg').textContent='Entrando…';try{const result=await call('loginAdmin',data.get('usuario'),data.get('senha'));store(result.token);form.reset();show();await refresh();}catch(err){error(err,'#loginMsg');}finally{b.disabled=false;}});
$('#logout').addEventListener('click',()=>{const old=token;store('');contacts=[];$('#list').replaceChildren();$('#app').hidden=true;$('#login').hidden=false;$('#loginMsg').textContent='';call('sairAdmin',old).catch(()=>{});});
document.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>{tab=b.dataset.tab;document.querySelectorAll('[data-tab]').forEach(x=>x.classList.toggle('active',x===b));$('#contactsView').hidden=tab==='security';$('#securityView').hidden=tab!=='security';if(tab!=='security')render();}));
$('#search').addEventListener('input',render);$('#refresh').addEventListener('click',()=>refresh());$('#more').addEventListener('click',()=>refresh(true));
$('#passwordForm').addEventListener('submit',async e=>{e.preventDefault();const f=e.currentTarget,d=new FormData(f),b=f.querySelector('button');if(d.get('nova')!==d.get('confirmar')){$('#passwordMsg').textContent='As senhas novas não são iguais.';return;}b.disabled=true;try{await call('alterarSenhaAdmin',token,d.get('atual'),d.get('nova'));store('');contacts=[];f.reset();$('#app').hidden=true;$('#login').hidden=false;$('#loginMsg').textContent='Senha alterada. Entre com a nova senha.';}catch(err){error(err,'#passwordMsg');}finally{b.disabled=false;}});
setInterval(()=>{if(token&&!document.hidden&&tab!=='security'&&!document.querySelector('details[open]'))refresh(false,true);},30000);
if(token){show();refresh();}
})();
