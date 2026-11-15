function kal(type,f,bright,v,pn){if(!AC)return;const t=now(),o=outNode(pn,v);
  const tone=AC.createBiquadFilter();tone.type='lowpass';tone.Q.value=.5;tone.frequency.value=type==='felt'?600+bright*1800:1200+bright*7000;tone.connect(o);
  const part=(ratio,gain,dec,wave='sine',det=0,dest=tone,a=.002)=>{const x=AC.createOscillator();x.type=wave;
    x.frequency.setValueAtTime(f*ratio*1.008,t);x.frequency.exponentialRampToValueAtTime(f*ratio,t+.03);x.detune.value=det;
    const g=AC.createGain();x.connect(g);g.connect(dest);adsr(g.gain,t,a,Math.max(gain,.0003),dec);x.start(t);x.stop(t+a+dec+.05);return x};
  const click=(fr,q,gain,dec)=>{const n=noiseSrc(),bp=AC.createBiquadFilter();bp.type='bandpass';bp.frequency.value=fr;bp.Q.value=q;
    const g=AC.createGain();n.connect(bp);bp.connect(g);g.connect(o);adsr(g.gain,t,.001,Math.max(gain,.0003),dec);n.start(t,Math.random()*.5);n.stop(t+dec+.05)};
  if(type==='wood'){part(1,.7,2.4);part(6.27,.22*bright,.28);part(17.5,.06*bright,.07);click(2800,1.2,.35*bright+.08,.012)}
  else if(type==='glass'){const c=AC.createOscillator();c.frequency.value=f;const m=AC.createOscillator();m.frequency.value=f*3.5;const mg=AC.createGain();
    mg.gain.setValueAtTime(f*(1+bright*2.5),t);mg.gain.exponentialRampToValueAtTime(f*.05,t+.5);m.connect(mg);mg.connect(c.frequency);
    const g=AC.createGain();c.connect(g);g.connect(tone);adsr(g.gain,t,.002,.5,2.8);c.start(t);m.start(t);c.stop(t+3);m.stop(t+3);part(2,.1,1.2)}
  else if(type==='felt'){part(1,.6,1.5,'triangle',0,tone,.008);part(2,.12,.6);click(400,.8,.25,.03)}
  else if(type==='box'){part(2,.5,1.3);part(4,.18*bright+.05,.5);part(6,.08*bright,.2);click(6000,2,.2*bright,.006)}
  else if(type==='metal'){[1,2.76,5.4,8.93].forEach((r,i)=>part(r,[.5,.22,.13,.06][i]*(i?bright+.3:1),[3.6,2,1.1,.5][i]));part(1,.22,3.6,'sine',-5)}
  else{const lp=AC.createBiquadFilter();lp.type='lowpass';lp.Q.value=5;lp.frequency.setValueAtTime(600+bright*5000,t);lp.frequency.exponentialRampToValueAtTime(220,t+.35);lp.connect(tone);
    part(1,.3,1.1,'sawtooth',-6,lp);part(1,.2,1.1,'square',6,lp);part(.5,.35,.9)}}

