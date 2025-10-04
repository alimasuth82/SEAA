const data = {
    japan:  { capital: "Tokyo", currency: "JPY (Yen)", best: "Mar–May, Oct–Nov", highlight: "Cherry blossoms & temples", food: "Sushi & ramen",
      tasks: ["Check passport (6+ months valid)", "Visa requirements for Japan", "Top 5 attractions in Tokyo/Kyoto", "Learn basic greetings (こんにちは)"] },
    italy:  { capital: "Rome",  currency: "EUR (Euro)", best: "Apr–Jun, Sep–Oct", highlight: "History, art, and food", food: "Pizza & pasta",
      tasks: ["Check passport (6+ months valid)", "Schengen visa (if needed)", "Top 5 attractions in Rome/Florence", "Learn basic phrases (Ciao, Grazie)"] },
    canada: { capital: "Ottawa", currency: "CAD (Dollar)", best: "Jun–Sep", highlight: "Nature & national parks", food: "Poutine & maple treats",
      tasks: ["Check passport (6+ months valid)", "eTA/visa (if needed)", "Top 5 attractions in Banff/Toronto", "Check weather & pack layers"] },
    brazil: { capital: "Brasília", currency: "BRL (Real)", best: "May–Sep", highlight: "Beaches & festivals", food: "Feijoada & churrasco",
      tasks: ["Check passport (6+ months valid)", "Visa policy for Brazil", "Top 5 attractions in Rio/Iguaçu", "Basic Portuguese phrases (Olá, Obrigado)"] },
    spain:  { capital: "Madrid", currency: "EUR (Euro)", best: "Apr–Jun, Sep–Oct", highlight: "Art, beaches, festivals", food: "Paella & tapas",
      tasks: ["Flight & lodging search", "Top 5 attractions in Barcelona/Madrid", "Learn basic Spanish phrases", "Buy metro/transport cards"] },
    australia: { capital: "Canberra", currency: "AUD (Dollar)", best: "Sep–Nov, Mar–May", highlight: "Beaches & the Outback", food: "BBQ & meat pies",
      tasks: ["Check ETA visa", "Top 5 attractions in Sydney/Melbourne", "Sun protection & hat", "Check driving rules (left side)"] },
    turkey: { capital: "Ankara", currency: "TRY (Lira)", best: "Apr–Jun, Sep–Oct", highlight: "History & Cappadocia", food: "Kebabs & baklava",
      tasks: ["E-visa (if needed)", "Top 5 attractions in Istanbul/Cappadocia", "Learn basic Turkish phrases", "Check dress code for mosques"] },
    mexico: { capital: "Mexico City", currency: "MXN (Peso)", best: "Nov–Apr", highlight: "Beaches & ruins", food: "Tacos & mole",
      tasks: ["Travel insurance", "Top 5 attractions in CDMX/Cancún", "Learn basic Spanish phrases", "Check health & water safety tips"] },
    egypt:  { capital: "Cairo", currency: "EGP (Pound)", best: "Oct–Apr", highlight: "Pyramids & Nile cruises", food: "Koshari & falafel",
      tasks: ["Visa-on-arrival info", "Top 5 attractions in Cairo/Luxor", "Sun & heat precautions", "Check tipping customs"] }
  };

  const countrySel = document.getElementById('country');
  const showInfoBtn = document.getElementById('showInfoBtn');
  const genBtn = document.getElementById('genBtn');
  const infoBox = document.getElementById('info');
  const tasksWrap = document.getElementById('tasksWrap');
  const capital = document.getElementById('capital');
  const currency = document.getElementById('currency');
  const besttime = document.getElementById('besttime');
  const highlight = document.getElementById('highlight');
  const food = document.getElementById('food');
  const tasksUl = document.getElementById('tasks');
  const bar = document.getElementById('bar');
  const ptext = document.getElementById('ptext');
  const resetBtn = document.getElementById('resetBtn');
  const addTaskBtn = document.getElementById('addTaskBtn');
  const newTaskInput = document.getElementById('newTaskInput');

  showInfoBtn.addEventListener('click', () => {
    const key = countrySel.value;
    if (!key) return;
    const c = data[key];
    capital.textContent = c.capital;
    currency.textContent = c.currency;
    besttime.textContent = c.best;
    highlight.textContent = c.highlight;
    food.textContent = c.food;
    infoBox.style.display = 'block';
    genBtn.disabled = false;
  });

  genBtn.addEventListener('click', () => {
    const key = countrySel.value;
    if (!key) return;
    const items = data[key].tasks;
    tasksUl.innerHTML = '';
    items.forEach((t, idx) => addTaskToList(t, 't' + idx));
    tasksWrap.style.display = 'block';
    updateProgress();
  });

  resetBtn.addEventListener('click', () => {
    tasksUl.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
    updateProgress();
  });

  addTaskBtn.addEventListener('click', () => {
    const txt = (newTaskInput.value || '').trim();
    if (!txt) return;
    addTaskToList(txt, 'tCustom' + Date.now());
    newTaskInput.value = '';
    updateProgress();
  });

  function addTaskToList(text, id){
    const li = document.createElement('li');
    const cb = document.createElement('input');
    cb.type = 'checkbox'; cb.id = id;
    const label = document.createElement('label');
    label.htmlFor = cb.id; label.textContent = text;
    cb.addEventListener('change', updateProgress);
    li.appendChild(cb); li.appendChild(label);
    tasksUl.appendChild(li);
  }
  function updateProgress(){
    const boxes = Array.from(tasksUl.querySelectorAll('input[type="checkbox"]'));
    const total = boxes.length;
    const done = boxes.filter(b=>b.checked).length;
    const pct = total ? Math.round((done/total)*100) : 0;
    bar.style.width = pct + '%';
    ptext.textContent = `${done}/${total} complete`;
  }