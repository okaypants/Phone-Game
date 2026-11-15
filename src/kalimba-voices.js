function kal(type,f,bright,v,pn){if(!AC)return;const t=now(),o=outNode(pn,v);
  const wet=(r,d)=>{if(!space)return;[[r,rIn],[d,dIn]].forEach(([amt,dest])=>{const x=AC.createGain();x.gain.value=amt;o.connect(x);x.connect(dest)})}; // extra room/echo for the dreamy voices
  const tone=AC.createBiquadFilter();tone.type='lowpass';tone.Q.value=.5;tone.frequency.value=type==='felt'?600+bright*1800:1200+bright*7000;tone.connect(o);
  const part=(ratio,gain,dec,wave='sine',det=0,dest=tone,a=.002)=>{const x=AC.createOscillator();x.type=wave;
    x.frequency.setValueAtTime(f*ratio*1.008,t);x.frequency.exponentialRampToValueAtTime(f*ratio,t+.03);x.detune.value=det;
    const g=AC.createGain();x.connect(g);g.connect(dest);adsr(g.gain,t,a,Math.max(gain,.0003),dec);x.start(t);x.stop(t+a+dec+.05);return x};
  const click=(fr,q,gain,dec)=>{const n=noiseSrc(),bp=AC.createBiquadFilter();bp.type='bandpass';bp.frequency.value=fr;bp.Q.value=q;
    const g=AC.createGain();n.connect(bp);bp.connect(g);g.connect(o);adsr(g.gain,t,.001,Math.max(gain,.0003),dec);n.start(t,Math.random()*.5);n.stop(t+dec+.05)};
  if(type==='wood'){part(1,.7,2.4);part(6.27,.22*bright,.28);part(17.5,.06*bright,.07);click(2800,1.2,.35*bright+.08,.012)}
  else if(type==='dream'){ // slow, dark FM electric piano over a swelling pad, drenched in room
    const fl=AC.createBiquadFilter();fl.type='lowpass';fl.Q.value=.6;fl.frequency.value=900+bright*2600;fl.connect(o);
    const trem=AC.createGain();trem.gain.value=.88;trem.connect(fl);
    const lfo=AC.createOscillator();lfo.frequency.value=4.6;const lg=AC.createGain();lg.gain.value=.12;lfo.connect(lg);lg.connect(trem.gain);
    const m=AC.createOscillator();m.frequency.value=f;const mg=AC.createGain();mg.gain.setValueAtTime(f*(.5+bright*1.3),t);mg.gain.exponentialRampToValueAtTime(f*.08,t+.9);m.connect(mg);
    const eg=AC.createGain();eg.connect(trem);adsr(eg.gain,t,.012,.42,5);
    const all=[lfo,m];[-5,5].forEach(d=>{const c=AC.createOscillator();c.frequency.value=f;c.detune.value=d;mg.connect(c.frequency);c.connect(eg);all.push(c)});
    const pl=AC.createBiquadFilter();pl.type='lowpass';pl.Q.value=.7;pl.frequency.value=420+bright*800;pl.connect(o);
    const pg=AC.createGain();pg.connect(pl);pg.gain.setValueAtTime(0,t);pg.gain.linearRampToValueAtTime(.085,t+.8);pg.gain.setTargetAtTime(0,t+.8,1.3);
    [-9,8].forEach(d=>{const x=AC.createOscillator();x.type='sawtooth';x.frequency.value=f;x.detune.value=d;x.connect(pg);all.push(x)});
    all.forEach(x=>{x.start(t);x.stop(t+5.6)});wet(.55,.06)}
  else if(type==='felt'){part(1,.6,1.5,'triangle',0,tone,.008);part(2,.12,.6);click(400,.8,.25,.03)}
  else if(type==='box'){part(2,.5,1.3);part(4,.18*bright+.05,.5);part(6,.08*bright,.2);click(6000,2,.2*bright,.006)}
  else if(type==='metal'){[1,2.76,5.4,8.93].forEach((r,i)=>part(r,[.5,.22,.13,.06][i]*(i?bright+.3:1),[3.6,2,1.1,.5][i]));part(1,.22,3.6,'sine',-5)}
  else{ // glow: pure harmonic chime — slow shimmer from a detuned pair, then a soft rising sparkle up the harmonic series
    part(1,.5,3.4,'sine',0,tone,.008);part(1,.28,3.4,'sine',5,tone,.008);part(2,.2,2.4,'sine',-3);part(3,.07+.07*bright,1.5);
    [4,6,8,12].forEach((r,i)=>{if(f*r>11000)return;const tt=t+.05*(i+1),x=AC.createOscillator();x.frequency.value=f*r;
      const g=AC.createGain();x.connect(g);g.connect(tone);adsr(g.gain,tt,.004,.06*(.5+bright)/(1+i*.3),.9-i*.12);x.start(tt);x.stop(tt+1)});
    wet(.35,.16)}}
