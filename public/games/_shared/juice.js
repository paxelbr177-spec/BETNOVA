/* BetNova "juice" — efectos visuales reutilizables. Expone window.Juice.
   Incluir ANTES del script del juego:  <script src="../_shared/juice.js"></script>

   API principal (usar SIEMPRE que haya premio, chico o grande):
     Juice.win(amount, { mult, x, y, el })   celebración que ESCALA con el premio
   Helpers:
     Juice.burst({count,x,y,colors,power,shapes})  ráfaga de partículas
     Juice.coins({count,x,y})                       lluvia de monedas
     Juice.confetti(opts)                           (alias retro-compatible de burst)
     Juice.ring(x,y,color)                          anillo de energía que se expande
     Juice.rays(x,y,ms)                             rayos de luz girando
     Juice.flash(color,ms)                          destello de pantalla
     Juice.float(text,x,y,color)                    texto flotante
     Juice.countUp(el,from,to,dur)                  anima un número
     Juice.shake(el,ms)                             screen shake
     Juice.bigWin(amount,{label,sub,duration})      banner de gran premio (lo usa win())
*/
(function(){
  const Juice = {};
  let cvs, ctx, parts = [], raf = 0;

  // ===== NovaSound: motor de sonido "casino elegante" (campanas + reverb) =====
  // window.NovaSound.play('win'|'bigwin'|'jackpot'|'coin'|'lose') · .chip() (apuesta)
  // Soporta archivos reales: NovaSound.useFiles({ win:'../_shared/sounds/win.mp3', ... })
  const NovaSound = (function(){
    let actx, master, conv, convWet; const FILES = {};
    function ac(){
      if(!actx){ try{
        actx = new (window.AudioContext||window.webkitAudioContext)();
        master = actx.createGain(); master.gain.value = 0.42;
        const comp = actx.createDynamicsCompressor(); master.connect(comp); comp.connect(actx.destination);
        const len = Math.floor(actx.sampleRate*1.4), buf = actx.createBuffer(2, len, actx.sampleRate);
        for(let ch=0; ch<2; ch++){ const d=buf.getChannelData(ch); for(let i=0;i<len;i++) d[i]=(Math.random()*2-1)*Math.pow(1-i/len, 3.2); }
        conv = actx.createConvolver(); conv.buffer = buf;
        convWet = actx.createGain(); convWet.gain.value = 0.22; conv.connect(convWet); convWet.connect(master);
      }catch(e){} }
      if(actx && actx.state==='suspended') actx.resume();
      return actx;
    }
    function bell(freq, when, dur, vel){
      const c = ac(); if(!c) return; const t = c.currentTime + when;
      const out = c.createGain(); out.gain.value = vel; out.connect(master); if(conv) out.connect(conv);
      [[1,1],[2,0.5],[3,0.25],[4.2,0.12]].forEach(([mul,amp])=>{
        const o=c.createOscillator(), g=c.createGain(); o.type='sine'; o.frequency.value=freq*mul;
        g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(amp,t+0.012);
        g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
        o.connect(g); g.connect(out); o.start(t); o.stop(t+dur+0.05);
      });
    }
    function noise(when, dur, vel, hp){
      const c = ac(); if(!c) return; const t=c.currentTime+when;
      const n=Math.floor(c.sampleRate*dur), buf=c.createBuffer(1,n,c.sampleRate), d=buf.getChannelData(0);
      for(let i=0;i<n;i++) d[i]=(Math.random()*2-1)*(1-i/n);
      const src=c.createBufferSource(); src.buffer=buf;
      const f=c.createBiquadFilter(); f.type='highpass'; f.frequency.value=hp||4500;
      const g=c.createGain(); g.gain.value=vel; src.connect(f); f.connect(g); g.connect(master); if(conv) g.connect(conv);
      src.start(t);
    }
    const C5=523.25,E5=659.25,G5=783.99,A4=440,E4=329.63,C6=1046.5,E6=1318.5,G6=1568;
    const SEQ = {
      win:    [[E5,0,.9,.5],[G5,.08,.9,.5],[C6,.16,1.1,.55]],
      bigwin: [[C5,0,.8,.5],[E5,.07,.8,.5],[G5,.14,.9,.5],[C6,.21,1.1,.6],[E6,.30,1.2,.5]],
      jackpot:[[C5,0,.7,.5],[E5,.08,.7,.5],[G5,.16,.7,.5],[C6,.24,.8,.55],[E6,.32,.9,.55],[G6,.40,1.4,.6]],
      coin:   [[G5,0,.4,.4],[C6,.05,.5,.38]],
      lose:   [[A4,0,.5,.32],[E4,.12,.7,.28]],
    };
    function play(name){
      const f = FILES[name];
      if(f && !f.error){ try{ const a=f.cloneNode(); a.volume=0.6; a.play().catch(()=>{}); return; }catch(e){} }
      (SEQ[name]||SEQ.win).forEach(([fr,w,d,v])=> bell(fr,w,d,v));
      if(name==='jackpot'){ noise(.42,.5,.06,5000); noise(0,.25,.04,7000); }
      else if(name==='bigwin'){ noise(0,.2,.035,7000); }
      else if(name==='coin'){ noise(0,.05,.05,6000); }
    }
    return {
      play, resume: ac,
      chip(){ const f=FILES.chip; if(f && !f.error){ try{ const a=f.cloneNode(); a.volume=0.6; a.play().catch(()=>{}); return; }catch(e){} } const c=ac(); if(!c) return; bell(1200,0,.12,.28); noise(0,.03,.05,5000); },
      useFiles(map){ Object.keys(map||{}).forEach(k=>{ try{ const a=new Audio(map[k]); a.preload='auto'; FILES[k]=a; }catch(e){} }); },
    };
  })();
  window.NovaSound = NovaSound;
  // Sonidos reales (mp3 con licencia, en _shared/sounds/). Si alguno falla, cae al sintetizado.
  NovaSound.useFiles({
    win:     '../_shared/sounds/win.mp3',
    bigwin:  '../_shared/sounds/bigwin.mp3',
    jackpot: '../_shared/sounds/jackpot.mp3',
    coin:    '../_shared/sounds/coin.mp3',
    chip:    '../_shared/sounds/chip.mp3',
    lose:    '../_shared/sounds/lose.mp3',
  });

  const PALETTE = ['#19e57f','#3fe0ff','#ffc83d','#ff5b8c','#a45bff','#ffffff','#ff8c3d','#5bffb0'];
  const GOLD = ['#ffc83d','#ffe89a','#e0a90c','#fff7dd','#ffb43d'];

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

  function star(c, r){
    c.beginPath();
    for(let i=0;i<5;i++){
      const a = -Math.PI/2 + i*2*Math.PI/5;
      c.lineTo(Math.cos(a)*r, Math.sin(a)*r);
      const a2 = a + Math.PI/5;
      c.lineTo(Math.cos(a2)*r*0.45, Math.sin(a2)*r*0.45);
    }
    c.closePath();
  }

  function tick(){
    ctx.clearRect(0,0,cvs.width,cvs.height);
    parts = parts.filter(p => p.life > 0);
    for(const p of parts){
      p.vy += p.g; p.vx *= 0.992; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life--;
      const alpha = Math.min(1, p.life / 26);
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.globalAlpha = alpha;
      ctx.shadowBlur = p.glow ? 12 : 0; ctx.shadowColor = p.color;
      ctx.fillStyle = p.color;
      if(p.shape === 'coin'){
        ctx.beginPath(); ctx.ellipse(0,0,p.s,p.s*0.72,0,0,7); ctx.fill();
        ctx.shadowBlur = 0; ctx.fillStyle='rgba(255,255,255,.5)';
        ctx.beginPath(); ctx.ellipse(-p.s*0.3,-p.s*0.2,p.s*0.25,p.s*0.18,0,0,7); ctx.fill();
      } else if(p.shape === 'star'){
        star(ctx, p.s*1.2); ctx.fill();
      } else if(p.shape === 'circle'){
        ctx.beginPath(); ctx.arc(0,0,p.s*0.7,0,7); ctx.fill();
      } else if(p.shape === 'streamer'){
        ctx.fillRect(-p.s*0.22, -p.s*1.6, p.s*0.44, p.s*3.2);
      } else {
        ctx.fillRect(-p.s/2, -p.s/2, p.s, p.s*1.7);
      }
      ctx.restore();
    }
    ctx.shadowBlur = 0;
    raf = parts.length ? requestAnimationFrame(tick) : 0;
  }

  // Ráfaga de partículas configurable
  Juice.burst = function(opts){
    ensureCanvas(); opts = opts || {};
    const n = opts.count || 80;
    const cx = opts.x != null ? opts.x : innerWidth/2;
    const cy = opts.y != null ? opts.y : innerHeight/2;
    const colors = opts.colors || PALETTE;
    const power = opts.power || 1;
    const shapes = opts.shapes || ['rect','rect','star','circle','streamer'];
    for(let i=0;i<n;i++){
      const a = Math.random()*Math.PI*2, sp = (2 + Math.random()*7.5)*power;
      const shape = opts.coins ? ((Math.random()<0.6)?'coin':'rect') : shapes[(Math.random()*shapes.length)|0];
      parts.push({
        x:cx, y:cy, vx:Math.cos(a)*sp, vy:Math.sin(a)*sp - 4*power,
        rot:Math.random()*7, vr:(Math.random()-.5)*0.5, s:5+Math.random()*6,
        color: colors[(Math.random()*colors.length)|0],
        shape, glow: Math.random()<0.5, g: shape==='streamer'?0.16:0.25,
        life: 60 + Math.random()*55,
      });
    }
    if(!raf) raf = requestAnimationFrame(tick);
  };
  // Alias retro-compatible
  Juice.confetti = function(opts){ Juice.burst(opts); };
  Juice.coins = function(opts){
    Juice.burst(Object.assign({ coins:true, count:90, colors:GOLD, power:1.1 }, opts||{}));
  };

  // Anillo de energía que se expande desde (x,y)
  Juice.ring = function(x, y, color){
    const d = document.createElement('div'); d.className = 'juice-ring';
    d.style.left = (x!=null?x:innerWidth/2)+'px'; d.style.top = (y!=null?y:innerHeight/2)+'px';
    if(color) d.style.borderColor = color;
    document.body.appendChild(d);
    setTimeout(()=>d.remove(), 750);
  };

  // Rayos de luz girando detrás de un premio grande
  Juice.rays = function(x, y, ms){
    const d = document.createElement('div'); d.className = 'juice-rays';
    d.style.left = (x!=null?x:innerWidth/2)+'px'; d.style.top = (y!=null?y:innerHeight/2)+'px';
    document.body.appendChild(d);
    setTimeout(()=>{ d.classList.add('out'); setTimeout(()=>d.remove(), 400); }, ms || 1600);
  };

  // Destello de pantalla
  Juice.flash = function(color, ms){
    const d = document.createElement('div'); d.className = 'juice-flash';
    if(color) d.style.background = color;
    document.body.appendChild(d);
    setTimeout(()=>d.remove(), ms || 380);
  };

  Juice.shake = function(el, ms){
    el = el || document.body; el.classList.remove('juice-shake');
    void el.offsetWidth; el.classList.add('juice-shake');
    setTimeout(() => el.classList.remove('juice-shake'), ms || 450);
  };

  Juice.float = function(text, x, y, color){
    const d = document.createElement('div'); d.className = 'juice-float'; d.textContent = text;
    d.style.left = (x!=null?x:innerWidth/2)+'px'; d.style.top = (y!=null?y:innerHeight*0.45)+'px';
    if(color) d.style.color = color;
    document.body.appendChild(d);
    setTimeout(() => d.remove(), 1300);
  };

  Juice.countUp = function(el, from, to, dur){
    if(typeof el === 'string') el = document.getElementById(el);
    if(!el) return;
    dur = dur || 700; const t0 = performance.now();
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
    const amt = (typeof amount === 'number')
      ? amount.toLocaleString('es-ES',{minimumFractionDigits:2,maximumFractionDigits:2}) : amount;
    const b = document.createElement('div');
    b.className = 'juice-banner';
    b.innerHTML = '<div class="juice-banner-card">'
      + '<div class="juice-banner-label">'+label+'</div>'
      + '<div class="juice-banner-amt">+'+amt+'</div>'
      + (opts.sub ? '<div class="juice-banner-sub">'+opts.sub+'</div>' : '')
      + '</div>';
    document.body.appendChild(b);
    Juice.rays(innerWidth/2, innerHeight*0.42, (opts.duration||2200)-200);
    Juice.coins({ count:140, y: innerHeight*0.35, power:1.2 });
    setTimeout(() => Juice.burst({ count:70, x:innerWidth*0.2, y:innerHeight*0.45, power:1.2 }), 160);
    setTimeout(() => Juice.burst({ count:70, x:innerWidth*0.8, y:innerHeight*0.45, power:1.2 }), 320);
    Juice.flash('rgba(255,200,61,.18)');
    Juice.shake(document.body, 520);
    setTimeout(() => { b.classList.add('out'); setTimeout(() => b.remove(), 480); }, opts.duration || 2200);
  };

  // ====== ENTRADA PRINCIPAL: celebra CUALQUIER premio, escalando con su tamaño ======
  // amount: monto ganado · opts.mult: multiplicador (preferido para decidir el nivel)
  // opts.x/opts.y: ancla en viewport · opts.el: elemento de "ganancia" para countUp
  Juice.win = function(amount, opts){
    ensureCanvas(); opts = opts || {};
    const amt = Number(amount) || 0;
    const x = opts.x != null ? opts.x : innerWidth/2;
    const y = opts.y != null ? opts.y : innerHeight*0.42;
    // nivel por multiplicador si está, si no por monto
    const m = (opts.mult != null) ? opts.mult : (amt >= 8000 ? 12 : amt >= 2500 ? 5 : amt >= 800 ? 2.5 : amt >= 200 ? 1.5 : 1.05);
    const fmt = amt.toLocaleString('es-ES',{minimumFractionDigits:2,maximumFractionDigits:2});

    // Sonido elegante de premio, escalado por nivel.
    try { NovaSound.play(m >= 10 ? 'jackpot' : m >= 3 ? 'bigwin' : 'win'); } catch (e) {}

    // SIEMPRE (hasta el premio más chico): texto flotante + anillo + chispas + countUp
    Juice.float('+'+fmt, x, y, '#19e57f');
    Juice.ring(x, y, m>=3 ? '#ffc83d' : '#19e57f');
    if(opts.el) Juice.countUp(opts.el, 0, amt, 600);

    if(m >= 10){            // MEGA
      Juice.bigWin(amt, { label: m>=25 ? '¡MEGA WIN!' : '¡GRAN PREMIO!', sub: opts.mult? m.toFixed(2)+'x' : '' });
    } else if(m >= 3){      // GRANDE
      Juice.coins({ count:90, x, y, power:1.15 });
      Juice.burst({ count:55, x, y, power:1.1 });
      Juice.rays(x, y, 1100);
      Juice.flash('rgba(25,229,127,.12)');
      Juice.shake(document.body, 380);
    } else if(m >= 1.3){    // MEDIO
      Juice.coins({ count:42, x, y });
      Juice.burst({ count:30, x, y });
    } else {                // CHICO (igual festeja)
      Juice.burst({ count:18, x, y, power:0.85, colors:['#19e57f','#5bffb0','#ffc83d','#ffffff'] });
    }
  };

  window.Juice = Juice;
})();
