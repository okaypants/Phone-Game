"""Rebuild ../index.html from the template and the voice/engine modules.
Run:  python3 src/build.py   (from the project root)"""
from pathlib import Path
here = Path(__file__).parent
t = (here / 'index.template.html').read_text()
parts = {'/*AUDIO*/': 'audio.js', '/*KAL*/': 'kalimba-voices.js', '/*SYN*/': 'synth-voices.js', '/*UNLOCK*/': 'ios-audio-unlock.js'}
for marker, f in parts.items():
    assert marker in t, marker
    t = t.replace(marker, (here / f).read_text())
(here.parent / 'index.html').write_text(t)
print('built index.html')
