// ───────── audio ─────────
let AC=null,bus,NOISE;
function satCurve(k){const n=1024,c=new Float32Array(n);for(let i=0;i<n;i++){const x=i/(n-1)*2-1;c[i]=Math.tanh(k*x)/Math.tanh(k)}return c}
function makeIR(sec){const sr=AC.sampleRate,len=Math.floor(sr*sec),b=AC.createBuffer(2,len,sr);
  for(let c=0;c<2;c++){const d=b.getChannelData(c);let lp=0;for(let i=0;i<len;i++){const t=i/sr;lp+=((Math.random()*2-1)-lp)*.35;d[i]=lp*Math.exp(-t*3.2/sec)*(t<.012?t/.012:1)}}return b}
function initAudio(){
  AC=new (window.AudioContext||window.webkitAudioContext)();
  NOISE=AC.createBuffer(1,AC.sampleRate,AC.sampleRate);{const d=NOISE.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1}
  bus=AC.createGain();bus.gain.value=.7;
  const sat=AC.createWaveShaper();sat.curve=satCurve(2.2);
  const hp=AC.createBiquadFilter();hp.type='highpass';hp.frequency.value=32;
  const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=16000;lp.Q.value=.3;
  const comp=AC.createDynamicsCompressor();comp.threshold.value=-16;comp.knee.value=12;comp.ratio.value=3.5;comp.attack.value=.006;comp.release.value=.22;
  const mg=AC.createGain();mg.gain.value=.9;
  bus.connect(sat);dryBus=AC.createGain();dryBus.gain.value=.7;dryBus.connect(sat);sat.connect(hp);hp.connect(lp);lp.connect(comp);comp.connect(mg);mg.connect(AC.destination);masterOut=mg;
  // room
  const conv=AC.createConvolver();conv.buffer=makeIR(3.4);rs=AC.createGain();rs.gain.value=.32;
  bus.connect(rs);rs.connect(conv);conv.connect(hp);
  // tape delay w/ wow
  const d=AC.createDelay(3);d.delayTime.value=BEAT*.75;const fb=AC.createGain();fb.gain.value=.4;
  const dlp=AC.createBiquadFilter();dlp.type='lowpass';dlp.frequency.value=1800;
  const dhp=AC.createBiquadFilter();dhp.type='highpass';dhp.frequency.value=250;
  ds=AC.createGain();ds.gain.value=.24;
  bus.connect(ds);ds.connect(d);d.connect(dlp);dlp.connect(dhp);dhp.connect(fb);fb.connect(d);dhp.connect(hp);
  const lfo=AC.createOscillator();lfo.frequency.value=.35;const lg=AC.createGain();lg.gain.value=.0025;lfo.connect(lg);lg.connect(d.delayTime);lfo.start();dIn=d;rIn=conv;
}
const now=()=>AC.currentTime;
function outNode(pn,g){const n=AC.createGain();n.gain.value=g;if(AC.createStereoPanner){const p=AC.createStereoPanner();p.pan.value=clamp(pn,-1,1);n.connect(p);p.connect(bus)}else n.connect(bus);return n}
function adsr(prm,t,a,peak,d){prm.cancelScheduledValues(t);prm.setValueAtTime(.0001,t);prm.exponentialRampToValueAtTime(Math.max(peak,.0002),t+a);prm.exponentialRampToValueAtTime(.0001,t+a+d)}
function noiseSrc(){const s=AC.createBufferSource();s.buffer=NOISE;s.loop=true;s.playbackRate.value=.8+Math.random()*.4;return s}

function squish(f,v,pn){if(!AC)return;const t=now(),o=outNode(pn,v),env=AC.createGain();env.connect(o);
  const lp=AC.createBiquadFilter();lp.type='lowpass';lp.Q.value=6;lp.frequency.setValueAtTime(2400,t);lp.frequency.exponentialRampToValueAtTime(300,t+.25);lp.connect(env);
  const a=AC.createOscillator();a.type='triangle';a.frequency.setValueAtTime(f*1.5,t);a.frequency.exponentialRampToValueAtTime(f,t+.09);
  const b=AC.createOscillator();b.frequency.setValueAtTime(f*.7,t);b.frequency.exponentialRampToValueAtTime(f*.5,t+.12);
  a.connect(lp);b.connect(lp);adsr(env.gain,t,.006,.5,.55);
  const n=noiseSrc(),bp=AC.createBiquadFilter();bp.type='bandpass';bp.Q.value=2.5;bp.frequency.setValueAtTime(1400,t);bp.frequency.exponentialRampToValueAtTime(500,t+.12);
  const ng=AC.createGain();n.connect(bp);bp.connect(ng);ng.connect(o);adsr(ng.gain,t,.003,.25,.12);
  a.start(t);b.start(t);n.start(t,Math.random()*.5);a.stop(t+.7);b.stop(t+.7);n.stop(t+.2)}
function plink(f,v,pn){if(!AC)return;const t=now(),o=outNode(pn,v),env=AC.createGain();env.connect(o);
  const c=AC.createOscillator();c.frequency.value=f;const m=AC.createOscillator();m.frequency.value=f*3.01;
  const mg=AC.createGain();mg.gain.setValueAtTime(f*2.2,t);mg.gain.exponentialRampToValueAtTime(f*.05,t+.35);
  m.connect(mg);mg.connect(c.frequency);c.connect(env);adsr(env.gain,t,.003,.35,1.4);c.start(t);m.start(t);c.stop(t+1.6);m.stop(t+1.6)}
function pop(f,pn,v){if(!AC)return;const t=now(),o=outNode(pn,v);
  const n=noiseSrc(),hp=AC.createBiquadFilter();hp.type='highpass';hp.frequency.value=1800;const ng=AC.createGain();
  n.connect(hp);hp.connect(ng);ng.connect(o);adsr(ng.gain,t,.001,.6,.025);n.start(t);n.stop(t+.06);
  const s=AC.createOscillator();s.frequency.setValueAtTime(f*2.5,t);s.frequency.exponentialRampToValueAtTime(f,t+.03);
  const sg=AC.createGain();s.connect(sg);sg.connect(o);adsr(sg.gain,t,.002,.45,.28);s.start(t);s.stop(t+.35)}
function tinkle(t,f,pn,v){if(!AC)return;v=Math.max(.01,v);const o=outNode(pn,v);
  const s=AC.createOscillator();s.frequency.value=f;const g=AC.createGain();s.connect(g);g.connect(o);adsr(g.gain,t,.002,.5,.22+Math.random()*.2);s.start(t);s.stop(t+.5);
  const n=noiseSrc(),bp=AC.createBiquadFilter();bp.type='bandpass';bp.frequency.value=4000+Math.random()*3000;bp.Q.value=3;
  const ng=AC.createGain();n.connect(bp);bp.connect(ng);ng.connect(o);adsr(ng.gain,t,.001,.6,.02);n.start(t);n.stop(t+.05)}
function crack(pn,v){if(!AC)return;const t=now(),o=outNode(pn,v);
  [3400,1300,6000].forEach((fr,i)=>{const n=noiseSrc(),bp=AC.createBiquadFilter();bp.type='bandpass';bp.frequency.value=fr*(.85+Math.random()*.3);bp.Q.value=5;
    const g=AC.createGain();n.connect(bp);bp.connect(g);g.connect(o);const tt=t+i*.012+Math.random()*.01;adsr(g.gain,tt,.001,1.4,.07+i*.03);n.start(tt);n.stop(tt+.2)});
  const s=AC.createOscillator();s.frequency.setValueAtTime(110,t);s.frequency.exponentialRampToValueAtTime(48,t+.12);
  const sg=AC.createGain();s.connect(sg);sg.connect(o);adsr(sg.gain,t,.002,.5,.2);s.start(t);s.stop(t+.3)}
function shatter(pn,v){if(!AC)return;crack(pn,v);const t=now();
  for(let i=0;i<18;i++){const dt=Math.pow(Math.random(),1.8)*.9;tinkle(t+.02+dt,note(10+Math.floor(Math.random()*8)),pn+(Math.random()-.5)*.6,v*.22*(1-dt))}
  const o=outNode(pn,v*.3),n=noiseSrc(),lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.setValueAtTime(5000,t);lp.frequency.exponentialRampToValueAtTime(250,t+.8);
  const g=AC.createGain();n.connect(lp);lp.connect(g);g.connect(o);adsr(g.gain,t,.005,.8,.7);n.start(t);n.stop(t+.9)}
function thump(v,pn){if(!AC)return;const t=now(),o=outNode(pn,v);
  const s=AC.createOscillator();s.frequency.setValueAtTime(150,t);s.frequency.exponentialRampToValueAtTime(40,t+.2);
  const sg=AC.createGain();s.connect(sg);sg.connect(o);adsr(sg.gain,t,.003,.9,.6);s.start(t);s.stop(t+.7);
  const n=noiseSrc(),lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=900;const ng=AC.createGain();
  n.connect(lp);lp.connect(ng);ng.connect(o);adsr(ng.gain,t,.001,.5,.03);n.start(t);n.stop(t+.06)}
function makeDrone(f,pn){if(!AC)return null;const t=now(),o=outNode(pn,1),env=AC.createGain();env.gain.value=.0001;env.connect(o);
  const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=400;lp.Q.value=4;lp.connect(env);
  const a=AC.createOscillator();a.type='sawtooth';a.frequency.value=f;const b=AC.createOscillator();b.type='sawtooth';b.frequency.value=f;b.detune.value=9;
  const c=AC.createOscillator();c.frequency.value=f/2;const cg=AC.createGain();cg.gain.value=.6;
  a.connect(lp);b.connect(lp);c.connect(cg);cg.connect(lp);a.start();b.start();c.start();env.gain.setTargetAtTime(.12,t,.08);
  return{set(f2,open,amp){const t=now();a.frequency.setTargetAtTime(f2,t,.04);b.frequency.setTargetAtTime(f2,t,.04);c.frequency.setTargetAtTime(f2/2,t,.04);
      lp.frequency.setTargetAtTime(300+open*3200,t,.05);if(amp!=null)env.gain.setTargetAtTime(amp,t,.06)},
    stop(){const t=now();env.gain.cancelScheduledValues(t);env.gain.setTargetAtTime(.0001,t,.06);[a,b,c].forEach(x=>x.stop(t+.6))}}}

