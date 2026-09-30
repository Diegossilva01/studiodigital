(() => {
  'use strict';
  const ads = window.DG_CONFIG?.googleAds || {};
  const id = String(ads.id || '').trim();
  const formLabel = String(ads.formConversionLabel || '').trim();
  const whatsappLabel = String(ads.whatsappConversionLabel || ads.conversionLabel || '').trim();
  const configured = /^AW-\d+$/.test(id);
  const validLabel = value => /^[A-Za-z0-9_-]+$/.test(value);
  const consentKey = 'dg_ads_consent_v1';
  const banner = document.getElementById('cookie-banner');
  let state;
  try {state = localStorage.getItem(consentKey);} catch {state = null;}
  let loaded = false;
  const recorded = new Set();
  function enableTag() {
    if (loaded || !configured) return;
    loaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(){window.dataLayer.push(arguments);};
    // A tag só é carregada depois de uma escolha afirmativa no aviso de medição.
    window.gtag('consent','default',{ad_storage:'granted',analytics_storage:'granted',ad_user_data:'granted',ad_personalization:'granted'});
    window.gtag('js',new Date());
    window.gtag('config',id);
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
    document.head.append(script);
  }
  if (configured && state === 'granted') enableTag();
  if (configured && state !== 'granted' && state !== 'denied' && banner) banner.hidden = false;
  banner?.addEventListener('click',event => {
    const button = event.target.closest('[data-consent]');
    if (!button) return;
    state = button.dataset.consent;
    try {localStorage.setItem(consentKey,state);} catch {}
    banner.hidden = true;
    if (state === 'granted') {
      if (loaded) window.gtag?.('consent','update',{ad_storage:'granted',analytics_storage:'granted',ad_user_data:'granted',ad_personalization:'granted'});
      else enableTag();
    } else if (loaded) window.gtag?.('consent','update',{ad_storage:'denied',analytics_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
  });
  document.querySelectorAll('.cookie-settings').forEach(button => button.addEventListener('click',()=>{if(configured && banner)banner.hidden=false;}));
  function conversion(label, transactionId) {
    if (!configured || !validLabel(label) || state !== 'granted' || !loaded) return false;
    const params={send_to:`${id}/${label}`};
    if(transactionId)params.transaction_id=transactionId;
    window.gtag('event','conversion',params);
    return true;
  }
  window.DGAds = {
    trackForm(requestId) {
      if(recorded.has(requestId) || !configured || !validLabel(formLabel) || state !== 'granted' || !loaded) return Promise.resolve(false);
      recorded.add(requestId);
      return new Promise(resolve => {
        const timer = setTimeout(() => resolve(true), 1500);
        window.gtag('event','conversion',{send_to:`${id}/${formLabel}`,transaction_id:requestId,event_timeout:1500,event_callback:()=>{clearTimeout(timer);resolve(true);}});
      });
    },
    trackWhatsapp(){return conversion(whatsappLabel);},
    trackLead(){return conversion(whatsappLabel);}
  };
})();
