
// ───────── synth voices (gated: ring while held) ─────────
const SYN_TYPES=['dream','haze','deep','moog','arp','electro','strings','vox'];
// fixed character per instrument (no kalimba-style position/velocity response)
const SYN_TONE={dream:.5,haze:.5,deep:.5,moog:.55,arp:.6,electro:.5,strings:.5,vox:.5};
// [delay send, reverb send] per instrument — electro stays nearly dry
const SYN_FX={dream:[.05,.6],haze:[.12,.45],deep:[0,.14],moog:[0,.04],arp:[.1,.14],electro:[0,.05],strings:[0,.32],vox:[.06,.16]};
// monophonic instruments glide (portamento) between held notes
const MONO={deep:.12,moog:.06,arp:.09,vox:.08};
let masterOut=null,driveCurve=null,dryBus=null,dIn=null,rIn=null;
function synthOut(type,pn,v){const n=AC.createGain();noteGain(n,v);let tail=n;
  if(AC.createStereoPanner){const p=AC.createStereoPanner();p.pan.value=clamp(pn,-1,1);n.connect(p);tail=p}
  tail.connect(dryBus);const dS=fxAmt(SYN_FX[type][0],SHAPE.echo,.28),rS=fxAmt(SYN_FX[type][1],SHAPE.verb,.4);
  if(dS>.002){const s=AC.createGain();s.gain.value=dS;tail.connect(s);s.connect(dIn)}
  if(rS>.002){const s=AC.createGain();s.gain.value=rS;tail.connect(s);s.connect(rIn)}
  return n}
function synth(type,f,pn){if(!AC)return null;const bright=SYN_TONE[type],v=.8,t=now(),o=synthOut(type,pn,v);
  if(!driveCurve)driveCurve=satCurve(3.5);
  const amp=AC.createGain();amp.gain.value=.0001;amp.connect(o);
  const nodes=[],pitched=[],osc=(wave,fr,det=0,dest)=>{const x=AC.createOscillator();x.type=wave;x.frequency.value=fr;x.detune.value=det;x.connect(dest);x.start(t);nodes.push(x);pitched.push([x,fr/f]);return x};
  const g=(val,dest)=>{const n=AC.createGain();n.gain.value=val;n.connect(dest);return n};
  const lp=(fr,q,dest)=>{const n=AC.createBiquadFilter();n.type='lowpass';n.frequency.value=fr;n.Q.value=q;n.connect(dest);return n};
  const down=(fr,lim)=>{lim*=Math.pow(2,octave);while(fr>lim)fr/=2;return fr};
  let rel=.2,sus=true;
  if(type==='deep'){ // sustained sub: sine with an octave below and a triangle above, driven so small speakers still hear it, with a dark slow-moving saw on top
    const fb=down(f,98),ws=AC.createWaveShaper();ws.curve=driveCurve;ws.connect(lp(900,.5,amp));const pre=g(.9,ws);
    osc('sine',fb,0,g(.8,pre));osc('sine',fb/2,0,g(.3,pre));osc('triangle',fb*2,0,g(.3,pre));
    const fl=lp(320,1.2,amp);fl.frequency.setTargetAtTime(620,t,.6);const top=osc('sawtooth',fb,5,g(.34,fl));osc('sawtooth',fb,-6,g(.26,fl));
    const ch=AC.createOscillator();ch.frequency.value=.3;const cg=AC.createGain();cg.gain.value=5;ch.connect(cg);cg.connect(top.detune);ch.start(t);nodes.push(ch);
    amp.gain.setValueAtTime(.0001,t);amp.gain.setTargetAtTime(.62,t,.035);rel=1.1}
  else if(type==='moog'){const fb=down(f,165),f2=lp(300,1,amp),f1=lp(300,9,f2),mix=g(.5,f1);
    osc('sawtooth',fb,0,mix);osc('square',fb,-5,g(.6,mix));osc('sawtooth',fb/2,3,g(.5,mix));
    [f1,f2].forEach(fl=>{fl.frequency.setValueAtTime(220+bright*4200,t);fl.frequency.setTargetAtTime(160+bright*700,t+.01,.12)});
    amp.gain.setValueAtTime(.0001,t);amp.gain.exponentialRampToValueAtTime(.8,t+.005);amp.gain.setTargetAtTime(.6,t+.05,.2);rel=.16}
  else if(type==='arp'){const hp=AC.createBiquadFilter();hp.type='highpass';hp.frequency.value=140;hp.connect(amp);const fl=lp(900,11,hp),mix=g(.45,fl);
    const a=osc('sawtooth',f*.985,0,mix),b=osc('square',f*.985,7,g(.7,mix));[a,b].forEach(x=>{x.frequency.setValueAtTime(f*.985,t);x.frequency.exponentialRampToValueAtTime(f,t+.05)});
    fl.frequency.setValueAtTime(700+bright*6500,t);fl.frequency.setTargetAtTime(500+bright*1800,t+.02,.25);
    const lfo=AC.createOscillator();lfo.frequency.value=5.6;const lg=AC.createGain();lg.gain.setValueAtTime(0,t);lg.gain.linearRampToValueAtTime(14,t+.6);lfo.connect(lg);lg.connect(a.detune);lg.connect(b.detune);lfo.start(t);nodes.push(lfo);
    amp.gain.setValueAtTime(.0001,t);amp.gain.exponentialRampToValueAtTime(.7,t+.008);amp.gain.setTargetAtTime(.5,t+.05,.3);rel=.28}
  else if(type==='electro'){const fl=lp(1800+bright*4000,2.5,amp);osc('square',f,0,g(.4,fl));osc('triangle',f/2,0,g(.5,fl));
    fl.frequency.setValueAtTime(2500+bright*5000,t);fl.frequency.setTargetAtTime(700+bright*1600,t+.005,.06);
    amp.gain.setValueAtTime(.0001,t);amp.gain.exponentialRampToValueAtTime(.75,t+.002);amp.gain.setTargetAtTime(.38,t+.01,.06);rel=.07}
  else if(type==='strings'){const fl=lp(1500+bright*3200,.6,amp),mix=g(.16,fl),ch=AC.createOscillator();ch.frequency.value=.55;const cg=AC.createGain();cg.gain.value=7;ch.connect(cg);ch.start(t);nodes.push(ch);
    [-13,-5,4,12].forEach(d=>{const x=osc('sawtooth',f,d,mix);cg.connect(x.detune)});osc('sawtooth',f*2,2,g(.35,mix));
    amp.gain.setValueAtTime(.0001,t);amp.gain.exponentialRampToValueAtTime(.55,t+.28);rel=1.1}
  else if(type==='vox'){const sum=g(1,amp),src=g(1,sum);const s=osc('sawtooth',f,0,AC.createGain());s.disconnect();
    const A=[800,1150,2900],O=[450,800,2830],gs=[1,.55,.3];
    A.forEach((fa,i)=>{const bp=AC.createBiquadFilter();bp.type='bandpass';bp.frequency.value=O[i]+(fa-O[i])*bright;bp.Q.value=9;s.connect(bp);bp.connect(g(gs[i]*2.2,sum))});
    const lfo=AC.createOscillator();lfo.frequency.value=5;const lg=AC.createGain();lg.gain.setValueAtTime(0,t);lg.gain.linearRampToValueAtTime(10,t+.5);lfo.connect(lg);lg.connect(s.detune);lfo.start(t);nodes.push(lfo);
    amp.gain.setValueAtTime(.0001,t);amp.gain.exponentialRampToValueAtTime(.8,t+.03);amp.gain.setTargetAtTime(.6,t+.06,.2);rel=.22}
  else if(type==='dream'){ // dark, slow string pad that blooms open, a low octave under it, a soft tine at the start of each note, long tail
    const fl=lp(380,.8,amp);fl.frequency.setTargetAtTime(750+bright*1300,t,.55);const mix=g(.17,fl);
    const ch=AC.createOscillator();ch.frequency.value=.42;const cg=AC.createGain();cg.gain.value=7;ch.connect(cg);ch.start(t);nodes.push(ch);
    [-11,0,10].forEach(d=>{const x=osc('sawtooth',f,d,mix);cg.connect(x.detune)});const sub=osc('sawtooth',f/2,4,g(.55,mix));cg.connect(sub.detune);
    const air=osc('sine',f*2,3,g(.05,amp));cg.connect(air.detune);
    const tg=AC.createGain();tg.connect(o);adsr(tg.gain,t,.006,.2,2.2);const car=osc('sine',f,0,tg),mg=AC.createGain();
    mg.gain.setValueAtTime(f*1.1,t);mg.gain.exponentialRampToValueAtTime(f*.06,t+.7);mg.connect(car.frequency);osc('sine',f,0,mg);
    amp.gain.setValueAtTime(.0001,t);amp.gain.setTargetAtTime(.55,t,.11);rel=2.6}
  else if(type==='haze'){ // airy tape-choir pad: soft saws through "ah" formants, a flute-like body and a little breath, with the lows cut so it floats above dream
    const hp=AC.createBiquadFilter(),hp2=AC.createBiquadFilter();[hp,hp2].forEach(h=>{h.type='highpass';h.frequency.value=Math.max(400,f*.9);h.Q.value=.6});hp.connect(hp2);hp2.connect(amp);
    const lfo=AC.createOscillator();lfo.frequency.value=4.4;const lg=AC.createGain();lg.gain.setValueAtTime(0,t);lg.gain.linearRampToValueAtTime(6,t+.9);lfo.connect(lg);lfo.start(t);nodes.push(lfo);
    const src=AC.createGain();[-8,7].forEach(d=>{const x=osc('sawtooth',f,d,src);lg.connect(x.detune)});
    [[620,1],[1080,.5],[2400,.22]].forEach(([fr,gn])=>{const bp=AC.createBiquadFilter();bp.type='bandpass';bp.frequency.value=fr;bp.Q.value=5;src.connect(bp);bp.connect(g(gn*.7,hp))});
    const body=osc('triangle',f,0,g(.2,hp));lg.connect(body.detune);osc('sine',f*2,4,g(.06,hp));
    const n=noiseSrc(),nb=AC.createBiquadFilter();nb.type='bandpass';nb.frequency.value=Math.min(6000,f*3);nb.Q.value=1.2;n.connect(nb);nb.connect(g(.035,hp));n.start(t);nodes.push(n);
    amp.gain.setValueAtTime(.0001,t);amp.gain.setTargetAtTime(.5,t,.13);rel=1.9}
  let done=false;const self={dead:false};
  const kill=r=>{if(done)return;done=true;self.dead=true;const tt=now();amp.gain.cancelScheduledValues(tt);amp.gain.setValueAtTime(Math.max(amp.gain.value,.0001),tt);amp.gain.setTargetAtTime(.0001,tt,r/3);nodes.forEach(n=>{try{n.stop(tt+r*1.7+.3)}catch(e){}})};
  if(!sus)setTimeout(()=>kill(.05),3500);
  self.safety=setTimeout(()=>kill(.4),20000); // safety: no stuck notes (cancelled when HOLD latches the note)
  self.release=()=>kill(rel*tailMul());
  self.glide=(fn,time)=>{if(done)return;const tt=now();for(const[x,ratio]of pitched){const fq=x.frequency;fq.cancelScheduledValues(tt);fq.setValueAtTime(fq.value,tt);fq.exponentialRampToValueAtTime(Math.max(20,fn*ratio),tt+time)}};
  return self}

// mono voice manager: last-note priority, legato glide, falls back to the still-held note on release
let mono=null;
function monoOn(id,type,f,pn){
  if(mono&&mono.type===type&&!mono.voice.dead){mono.stack=mono.stack.filter(s=>s.id!==id);mono.stack.push({id,f});mono.voice.glide(f,Math.max(.004,MONO[type]*GLIDES[glideI][1]));return}
  if(mono)mono.voice.release();mono={type,voice:synth(type,f,pn),stack:[{id,f}]};if(!mono.voice)mono=null}
function monoOff(id){if(!mono)return;mono.stack=mono.stack.filter(s=>s.id!==id);
  if(mono.stack.length)mono.voice.glide(mono.stack[mono.stack.length-1].f,Math.max(.004,MONO[mono.type]*GLIDES[glideI][1]));else{mono.voice.release();mono=null}}
