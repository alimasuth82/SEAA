// ===== slideshow.js — hero background crossfade =====
(function(){
  function heroSlideshow(){
    const heroImages = [
      'images/hero-1.jpg','images/hero-2.jpg','images/hero-3.jpg','images/hero-4.jpg','images/hero-5.jpg',
      'images/hero-6.jpg','images/hero-7.jpg','images/hero-8.jpg','images/hero-9.jpg','images/hero-10.jpg'
    ];

    function shuffle(arr){
      for(let i = arr.length - 1; i > 0; i--){
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    }

    heroImages.forEach(src => { const img = new Image(); img.src = src; });

    const a = document.querySelector('.hero-bg-a');
    const b = document.querySelector('.hero-bg-b');
    if(!a || !b) return;

    let order = shuffle(heroImages.slice());
    let idx = 0;
    let showingA = true;

    a.style.backgroundImage = `url("${order[idx]}")`;
    a.classList.add('is-active');

    function nextImage(){
      idx++;
      if(idx >= order.length){
        order = shuffle(heroImages.slice());
        idx = 0;
      }
      const nextSrc = order[idx];

      if(showingA){
        b.style.backgroundImage = `url("${nextSrc}")`;
        b.classList.add('is-active');
        a.classList.remove('is-active');
      }else{
        a.style.backgroundImage = `url("${nextSrc}")`;
        a.classList.add('is-active');
        b.classList.remove('is-active');
      }
      showingA = !showingA;
    }

    setInterval(nextImage, 5000);
  }
  heroSlideshow();
})();
