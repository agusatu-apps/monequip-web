const menuButton=document.querySelector('.menu-button');
const mobileMenu=document.querySelector('.mobile-menu');
const siteHeader=document.querySelector('.site-header');

menuButton?.addEventListener('click',()=>{
  const open=mobileMenu.classList.toggle('open');
  menuButton.setAttribute('aria-expanded',String(open));
});
document.querySelectorAll('.mobile-menu a').forEach(a=>a.addEventListener('click',()=>{
  mobileMenu.classList.remove('open');
  menuButton?.setAttribute('aria-expanded','false');
}));

function scrollToHash(hash,{smooth=true,updateHistory=false}={}){
  if(!hash || hash==='#') return;
  const target=hash==='#top'?document.documentElement:document.querySelector(hash);
  if(!target) return;
  const headerHeight=siteHeader?.offsetHeight||0;
  const targetTop=hash==='#top'?0:target.getBoundingClientRect().top+window.scrollY-headerHeight;
  window.scrollTo({top:Math.max(0,Math.round(targetTop)),behavior:smooth?'smooth':'auto'});
  if(updateHistory&&window.location.hash!==hash) history.pushState(null,'',hash);
}
document.querySelectorAll('a[href^="#"]').forEach(link=>link.addEventListener('click',event=>{
  const hash=link.getAttribute('href');
  if(!hash||hash==='#'||!document.querySelector(hash)) return;
  event.preventDefault();
  scrollToHash(hash,{smooth:true,updateHistory:true});
}));
window.addEventListener('load',()=>{if(location.hash) requestAnimationFrame(()=>scrollToHash(location.hash,{smooth:false}))});

document.querySelectorAll('.install-tab').forEach(btn=>{
  btn.addEventListener('click',()=>{
    const mode=btn.dataset.install;
    document.querySelectorAll('.install-tab').forEach(x=>{x.classList.toggle('active',x===btn);x.setAttribute('aria-selected',String(x===btn))});
    document.querySelectorAll('[data-install-panel]').forEach(panel=>panel.classList.toggle('hidden',panel.dataset.installPanel!==mode));
  });
});

document.querySelectorAll('.guide-mode').forEach(btn=>{
  btn.addEventListener('click',()=>{
    const youth=btn.dataset.teamMode==='youth';
    document.querySelectorAll('.guide-mode').forEach(x=>{x.classList.toggle('active',x===btn);x.setAttribute('aria-selected',String(x===btn))});
    document.querySelectorAll('.youth-only,.youth-index,.youth-step').forEach(el=>el.classList.toggle('hidden',!youth));
    document.querySelectorAll('.adult-step').forEach(el=>el.classList.toggle('hidden',youth));
  });
});

const CONTACT_ENDPOINT='https://huowtpkjdoeduzrmisky.supabase.co/functions/v1/website-contact';
document.getElementById('signup-form')?.addEventListener('submit',async e=>{
  e.preventDefault();
  const form=e.currentTarget;
  const button=form.querySelector('button[type="submit"]');
  const status=document.getElementById('signup-status');
  const fd=new FormData(form);
  const payload={
    name:fd.get('name'),
    email:fd.get('email'),
    team:fd.get('team'),
    sport:fd.get('sport'),
    message:fd.get('message'),
    company_website:fd.get('company_website'),
    source:'monequip.com/primeros-pasos-alta'
  };
  const original=button.textContent;
  button.disabled=true;button.textContent='Enviando…';
  status.textContent='';status.className='form-status';
  try{
    const response=await fetch(CONTACT_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    const result=await response.json().catch(()=>({}));
    if(!response.ok||!result.ok) throw new Error(response.status===429?'rate_limited':'send_failed');
    form.reset();
    status.textContent='Solicitud recibida. Te contactaremos para preparar el alta de tu equipo.';
    status.classList.add('success');
    button.textContent='Solicitud enviada';
    setTimeout(()=>{button.disabled=false;button.textContent=original},3500);
  }catch(error){
    status.textContent=error.message==='rate_limited'?'Ya hemos recibido varias solicitudes desde esta conexión. Inténtalo de nuevo más tarde.':'No hemos podido enviar la solicitud. Comprueba tu conexión y vuelve a intentarlo.';
    status.classList.add('error');
    button.disabled=false;button.textContent=original;
  }
});
