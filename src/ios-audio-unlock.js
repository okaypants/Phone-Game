// iOS: let Web Audio play even with the silent switch on, by holding a looping silent <audio> in "playback" mode
let unlockEl=null;
function silentWavURL(){const sr=8000,n=sr/2,b=new ArrayBuffer(44+n*2),v=new DataView(b);
  const w=(o,s)=>{for(let i=0;i<s.length;i++)v.setUint8(o+i,s.charCodeAt(i))};
  w(0,'RIFF');v.setUint32(4,36+n*2,true);w(8,'WAVE');w(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);
  v.setUint32(24,sr,true);v.setUint32(28,sr*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);w(36,'data');v.setUint32(40,n*2,true);
  return URL.createObjectURL(new Blob([b],{type:'audio/wav'}))}
function unlockAudio(){
  try{if(navigator.audioSession)navigator.audioSession.type='playback'}catch(e){}
  try{if(!unlockEl){unlockEl=document.createElement('audio');unlockEl.src=silentWavURL();unlockEl.loop=true;unlockEl.setAttribute('playsinline','');unlockEl.volume=.01}
    const pr=unlockEl.play();pr&&pr.catch(()=>{})}catch(e){}
  try{if(!AC)initAudio();if(AC.state!=='running')AC.resume()}catch(e){}
  // tiny blip so the context really starts on iOS
  try{const o=AC.createOscillator(),g=AC.createGain();g.gain.value=.0001;o.connect(g);g.connect(AC.destination);o.start();o.stop(AC.currentTime+.05)}catch(e){}}
// phones only count pointerup/touchend/click as a real gesture for sound, so re-unlock on those
