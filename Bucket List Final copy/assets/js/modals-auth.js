// ===== modals-auth.js — sign in / sign up popup =====
(function(){
  const authModal = document.getElementById('authModal');
  const openBtn   = document.getElementById('openAuthBtn');
  const closeBtn  = document.getElementById('closeAuthBtn') || document.getElementById('closeAuthBtn');
  const tabIn  = document.getElementById('tabSignIn');
  const tabUp  = document.getElementById('tabSignUp');
  const pIn    = document.getElementById('panelSignIn');
  const pUp    = document.getElementById('panelSignUp');
  const toUp   = document.getElementById('toSignUp');
  const toIn   = document.getElementById('toSignIn');

  function openAuth(){ if(authModal){ authModal.classList.add('show'); document.body.style.overflow='hidden'; } }
  function closeAuth(){ if(authModal){ authModal.classList.remove('show'); document.body.style.overflow=''; } }

  if (openBtn) openBtn.addEventListener('click', openAuth);
  if (authModal) {
    const x = authModal.querySelector('.auth-close');
    if (x) x.addEventListener('click', closeAuth);
    authModal.addEventListener('click', (e)=>{ if(e.target===authModal) closeAuth(); });
    document.addEventListener('keydown', (e)=>{ if(e.key==='Escape' && authModal.classList.contains('show')) closeAuth(); });
  }

  function showIn(){ if(!tabIn||!tabUp||!pIn||!pUp) return;
    tabIn.classList.add('active'); tabIn.setAttribute('aria-selected','true');
    tabUp.classList.remove('active'); tabUp.setAttribute('aria-selected','false');
    pIn.style.display='block'; pUp.style.display='none';
  }
  function showUp(){ if(!tabIn||!tabUp||!pIn||!pUp) return;
    tabUp.classList.add('active'); tabUp.setAttribute('aria-selected','true');
    tabIn.classList.remove('active'); tabIn.setAttribute('aria-selected','false');
    pUp.style.display='block'; pIn.style.display='none';
  }
  if (tabIn && tabUp){ tabIn.onclick = showIn; tabUp.onclick = showUp; }
  if (toUp) toUp.onclick = showUp;
  if (toIn) toIn.onclick = showIn;

  if (pIn) pIn.addEventListener('submit', e => { e.preventDefault(); alert('Signed in (demo)'); closeAuth(); });
  if (pUp) pUp.addEventListener('submit', e => {
    e.preventDefault();
    const [pwd, confirm] = Array.from(pUp.querySelectorAll('input[type="password"]')).map(i=>i.value);
    if (pwd !== confirm) { alert('Passwords do not match.'); return; }
    alert('Account created (demo)'); showIn();
  });
})();
