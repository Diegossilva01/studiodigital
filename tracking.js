(() => {
  'use strict';
  const ads = window.DG_CONFIG?.googleAds || {};
  const id = String(ads.id || '').trim();
  const label = String(ads.conversionLabel || '').trim();
  const configured = /^AW-\d+$/.test(id) && /^[A-Za-z0-9_-]+$/.test(label);
  const consentKey = 'dg_ads_consent_v1';
  const banner = document.getElementById('cookie-banner');
  let state;
  try {state = localStorage.getItem(consentKey);} catch {state = null;}
  let loaded = false;
  function enableTag() {
    if (loaded || !configured) return;
    loaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(){window.dataLayer.push(arguments);};
    window.gtag('consent','default',{ad_storage:'denied',analytics_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
    window.gtag('consent','update',{ad_storage:'granted',analytics_storage:'granted',ad_user_data:'granted',ad_personalization:'granted'});
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
    }
    else if (loaded) window.gtag?.('consent','update',{ad_storage:'denied',analytics_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
  });
  document.querySelector('.cookie-settings')?.addEventListener('click',() => {if (configured && banner) banner.hidden = false;});
  window.DGAds = {
    trackLead() {
      if (!configured || state !== 'granted' || !loaded) return false;
      // Este evento representa a abertura do WhatsApp, não a venda nem o envio da mensagem.
      window.gtag('event','conversion',{send_to:`${id}/${label}`});
      return true;
    }
  };
})();
