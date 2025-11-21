// ===== modals-legal.js — Privacy / Terms / Site Map =====
(function(){
  const legalModal = document.getElementById('legalModal');
  if (!legalModal) return;

  const titleEl = document.getElementById('legalTitle');
  const bodyEl  = document.getElementById('legalBody');
  const closeBtn = legalModal.querySelector('.modal-close');

  const LEGAL = {
    privacy: {
      title: 'Privacy Policy',
      html: `
<p>At SEAA, we value your privacy and are committed to protecting your personal information. 
This demo version currently does not collect or store any personal data on external servers.</p>

<p>In future updates, SEAA may introduce secure database storage to allow users to create accounts, 
save travel checklists, and personalize their experience. Any personal data collected at that stage 
(such as name, email, or saved preferences) will be stored securely and used only for the intended purpose 
of improving user experience.</p>

<p>We do not sell, share, or distribute your personal information to third parties. 
Your data will always be handled in compliance with applicable privacy and data protection laws.</p>

<p>Our website may contain links to third-party travel resources such as official tourism websites, 
government advisories, and booking platforms. These external sites operate under their own privacy policies, 
which we encourage you to review before sharing any personal data.</p>

<p>By using SEAA’s Smart Bucket List platform, you agree to this privacy policy. 
Future versions of SEAA will include a full privacy and cookie statement once user accounts and database features are implemented.</p>
`
    },
    terms: {
      title: 'Terms of Use',
      html: `
<p>Welcome to SEAA. By using this website or application, you agree to comply with the following terms of use. 
These terms are designed to ensure a safe, respectful, and transparent experience for all users.</p>

<ul>
  <li>This site is currently a demo and provided for educational and informational purposes only. 
      Future versions may include features that allow users to register and store personal data securely.</li>

  <li>While we strive to provide accurate and up-to-date travel information, SEAA makes no warranties 
      regarding the completeness, reliability, or accuracy of the content displayed.</li>

  <li>Any travel data, country information, or photos shown are sourced from public APIs and open data providers 
      such as REST Countries, Wikipedia, and Unsplash. We are not responsible for changes or inaccuracies in those sources.</li>

  <li>Users agree not to misuse this website by attempting to harm, disrupt, or gain unauthorized access to its systems or data.</li>

  <li>External links provided on this site lead to third-party websites that are not owned or controlled by SEAA. 
      We are not responsible for the content, policies, or practices of these external sites.</li>
</ul>

<p>By continuing to use SEAA, you acknowledge that you have read, understood, and agree to these terms. 
For production or commercial use, official legal terms and conditions will apply.</p>
`
    },
    sitemap: {
      title: 'Site Map',
      html: `
<ul>
  <li><a href="index.html">Home</a></li>
  <li><a href="destinations.html">Destinations</a></li>
  <li><a href="contact.html">Contact</a></li>
  <li><a href="#about">Hero / About (on Home)</a></li>
  <li><a href="#continents">Continents (on Home)</a></li>
</ul>
`
    }
  };

  function openLegal(kind){
    const data = LEGAL[kind];
    if (!data) return;
    if (titleEl) titleEl.textContent = data.title;
    if (bodyEl)  bodyEl.innerHTML = data.html;

    legalModal.classList.add('show');
    legalModal.setAttribute('aria-hidden','false');
    document.body.style.overflow='hidden';
  }
  function closeLegal(){
    legalModal.classList.remove('show');
    legalModal.setAttribute('aria-hidden','true');
    document.body.style.overflow='';
  }

  document.querySelectorAll('.legal-link').forEach(a=>{
    a.addEventListener('click', (e)=>{
      e.preventDefault();
      openLegal(a.dataset.legal);
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeLegal);
  legalModal.addEventListener('click', (e)=>{ if (e.target === legalModal) closeLegal(); });
  document.addEventListener('keydown', (e)=>{ if (e.key==='Escape' && legalModal.classList.contains('show')) closeLegal(); });
})();
