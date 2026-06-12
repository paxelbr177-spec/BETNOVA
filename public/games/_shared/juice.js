/* BetNova "juice" — efectos visuales reutilizables. Expone window.Juice.
   Incluir ANTES del script del juego:  <script src="../_shared/juice.js"></script>
   API:
     Juice.confetti({count,x,y,colors,coins})  ráfaga de partículas
     Juice.coins({count,x,y})                  lluvia de monedas doradas
     Juice.bigWin(amount,{label,sub,duration})  banner de gran premio + confeti + shake
     Juice.shake(el,ms)                         screen shake
     Juice.float(text,x,y,color)                texto flotante en coords de viewport
     Juice.countUp(el,from,to,dur)              anima un número
*/
(function(){
  const Juice = {};
  let cvs, ctx, parts = [], raf = 0;

  function ensureCanvas(){
    if(cvs) return;
    cvs = document.createElement('canvas');
    cvs.className = 'juice-canvas';
    document.body.appendChild(cvs);
    ctx = cvs.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
  }
  function resize(){ if(!cvs) return; cvs.width = innerWidth; cvs.height = innerHeight; }

  function tick(){
    ctx.clearRect(0,0,cvs.width,cvs.height);
    parts = parts.filter(p => p.life > 0);
    for(const p of parts){
      p.vy += 0.25; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life--;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.globalAlpha = Math.min(1, p.life / 22);
      ctx.fillStyle = p.color;
      if(p.shape === 'coin'){
        ctx.beginPath(); ctx.ellipse(0,0,p.s,p.s*0.72,0,0,7); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.45)';
        ctx.beginPath(); ctx.ellipse(-p.s*0.3,-p.s*0.2,p.s*0.25,p.s*0.18,0,0,7); ctx.fill();
      } else {
        ctx.fillRect(-p.s/2, -p.s/2, p.s, p.s*1.7);
      }
      ctx.restore();
    }
    raf = parts.length ? requestAnimationFrame(tick) : 0;
  }

  Juice.confetti = function(opts){
    ensureCanvas(); opts = opts || {};
    const n = opts.count || 80;
    const cx = opts.x != null ? opts.x : innerWidth/2;
    const cy = opts.y != null ? opts.y : innerHeight/2;
    const colors = opts.colors || ['#19e57f','#ffc83d','#36d0ff','#ff5b8c','#a45bff','#ffffff'];
    for(let i=0;i<n;i++){
      const a = Math.random()*Math.PI*2, sp = 2 + Math.random()*7.5;
      parts.push({
        x:cx, y:cy, vx:Math.cos(a)*sp, vy:Math.sin(a)*sp - 4,
        rot:Math.random()*7, vr:(Math.random()-.5)*0.4, s:5+Math.random()*6,
        color: colors[(Math.random()*colors.length)|0],
        shape: (opts.coins && Math.random()<0.6) ? 'coin' : 'rect',
        life: 60 + Math.random()*45,
      });
    }
    if(!raf) raf = requestAnimationFrame(tick);
  };

  Juice.coins = function(opts){
    Juice.confetti(Object.assign({ coins:true, count:90, colors:['#ffc83d','#ffe89a','#e0a90c','#fff7dd'] }, opts||{}));
  };

  Juice.shake = function(el, ms){
    el = el || document.body; el.classList.add('juice-shake');
    setTimeout(() => el.classList.remove('juice-shake'), ms || 450);
  };

  Juice.float = function(text, x, y, color){
    const d = document.createElement('div'); d.className = 'juice-float'; d.textContent = text;
    d.style.left = x+'px'; d.style.top = y+'px'; if(color) d.style.color = color;
    document.body.appendChild(d);
    setTimeout(() => d.remove(), 1200);
  };

  Juice.countUp = function(el, from, to, dur){
    if(typeof el === 'string') el = document.getElementById(el);
    if(!el) return;
    dur = dur || 650; const t0 = performance.now();
    function step(now){
      const k = Math.min(1, (now - t0)/dur);
      const v = from + (to - from)*(1 - Math.pow(1-k, 3));
      el.textContent = v.toLocaleString('es-ES', {minimumFractionDigits:2, maximumFractionDigits:2});
      if(k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  };

  Juice.bigWin = function(amount, opts){
    ensureCanvas(); opts = opts || {};
    const label = opts.label || '¡GRAN PREMIO!';
    const amt = (typeof amount === 'number') ? amount.toFixed(2) : amount;
    const b = document.createElement('div');
    b.className = 'juice-banner';
    b.innerHTML = '<div class="juice-banner-card">'
      + '<div class="juice-banner-label">'+label+'</div>'
      + '<div class="juice-banner-amt">+'+amt+'</div>'
      + (opts.sub ? '<div class="juice-banner-sub">'+opts.sub+'</div>' : '')
      + '</div>';
    document.body.appendChild(b);
    Juice.coins({ count:130, y: innerHeight*0.35 });
    setTimeout(() => Juice.confetti({ count:60, x:innerWidth*0.22, y:innerHeight*0.42 }), 180);
    setTimeout(() => Juice.confetti({ count:60, x:innerWidth*0.78, y:innerHeight*0.42 }), 340);
    Juice.shake(document.body, 500);
    setTimeout(() => { b.classList.add('out'); setTimeout(() => b.remove(), 480); }, opts.duration || 2200);
  };

  window.Juice = Juice;
})();
