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

/*
  Fixed-header anchor navigation.
  Every internal link lands with the START of the target section immediately
  below the fixed navigation bar. This avoids the browser combining
  scroll-padding + scroll-margin and leaving part of the previous section visible.
*/
function scrollToHash(hash,{smooth=true,updateHistory=false}={}){
  if(!hash || hash==='#') return;
  const target=hash==='#top' ? document.documentElement : document.querySelector(hash);
  if(!target) return;

  const headerHeight=siteHeader?.offsetHeight || 0;
  const targetTop=hash==='#top'
    ? 0
    : target.getBoundingClientRect().top + window.scrollY - headerHeight;

  window.scrollTo({
    top:Math.max(0,Math.round(targetTop)),
    behavior:smooth?'smooth':'auto'
  });

  if(updateHistory && window.location.hash!==hash){
    history.pushState(null,'',hash);
  }
}

document.querySelectorAll('a[href^="#"]').forEach(link=>{
  link.addEventListener('click',event=>{
    const hash=link.getAttribute('href');
    if(!hash || hash==='#') return;
    if(!document.querySelector(hash) && hash!=='#top') return;
    event.preventDefault();
    scrollToHash(hash,{smooth:true,updateHistory:true});
  });
});

// Correct direct visits such as /#contacto after layout and images are ready.
function correctInitialHash(){
  if(window.location.hash){
    requestAnimationFrame(()=>scrollToHash(window.location.hash,{smooth:false,updateHistory:false}));
  }
}
window.addEventListener('load',correctInitialHash);
window.addEventListener('popstate',()=>{
  if(window.location.hash) scrollToHash(window.location.hash,{smooth:false,updateHistory:false});
  else window.scrollTo({top:0,behavior:'auto'});
});

document.querySelectorAll('.segment').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.segment').forEach(b=>{
      b.classList.remove('active');
      b.setAttribute('aria-selected','false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-selected','true');
    const team=btn.dataset.team;
    document.getElementById('adult-panel').classList.toggle('hidden',team!=='adult');
    document.getElementById('youth-panel').classList.toggle('hidden',team!=='youth');
    document.querySelectorAll('.team-story').forEach(x=>x.classList.toggle('hidden',x.dataset.copy!==team));
  });
});

const CONTACT_ENDPOINT='https://huowtpkjdoeduzrmisky.supabase.co/functions/v1/website-contact';

document.getElementById('contact-form')?.addEventListener('submit',async e=>{
  e.preventDefault();
  const form=e.currentTarget;
  const button=form.querySelector('button[type="submit"]');
  const status=document.getElementById('form-status');
  const fd=new FormData(form);

  const payload={
    name:fd.get('name'),
    email:fd.get('email'),
    team:fd.get('team'),
    sport:fd.get('sport'),
    message:fd.get('message'),
    company_website:fd.get('company_website'),
    source:window.location.hostname || 'local-preview'
  };

  const originalText=button?.textContent || 'Quiero probar MonEquip';
  if(button){ button.disabled=true; button.textContent='Enviando…'; }
  if(status){ status.textContent=''; status.className='form-status'; }

  try{
    const response=await fetch(CONTACT_ENDPOINT,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(payload)
    });
    const result=await response.json().catch(()=>({}));

    if(!response.ok || !result.ok){
      if(response.status===429) throw new Error('rate_limited');
      throw new Error(result.error || 'send_failed');
    }

    form.reset();
    if(status){
      status.textContent='Gracias. Hemos recibido tu solicitud y te contactaremos personalmente.';
      status.classList.add('success');
    }
    if(button) button.textContent='Solicitud enviada';
    setTimeout(()=>{ if(button){ button.disabled=false; button.textContent=originalText; } },3500);
  }catch(error){
    if(status){
      status.textContent=error?.message==='rate_limited'
        ? 'Ya hemos recibido varias solicitudes desde esta conexión. Espera un poco y vuelve a intentarlo.'
        : 'No hemos podido enviar la solicitud. Comprueba tu conexión y vuelve a intentarlo.';
      status.classList.add('error');
    }
    if(button){ button.disabled=false; button.textContent=originalText; }
  }
});
