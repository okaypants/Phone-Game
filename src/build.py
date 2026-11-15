"""Rebuild ../index.html from the template and the voice/engine modules.
Run:  python3 src/build.py   (from the project root)"""
import base64
from pathlib import Path
here = Path(__file__).parent
t = (here / 'index.template.html').read_text()
parts = {'/*AUDIO*/': 'audio.js', '/*KAL*/': 'kalimba-voices.js', '/*SYN*/': 'synth-voices.js', '/*UNLOCK*/': 'ios-audio-unlock.js'}
for marker, f in parts.items():
    assert marker in t, marker
    t = t.replace(marker, (here / f).read_text())
# Embed the home-screen icon in the page itself, so "Add to Home Screen" gets it even where
# the phone can't fetch the separate icon file (it then falls back to a plain letter tile).
tag = '<link rel="apple-touch-icon" href="apple-touch-icon.png">'
assert tag in t
png = base64.b64encode((here.parent / 'apple-touch-icon.png').read_bytes()).decode()
t = t.replace(tag, f'<link rel="apple-touch-icon" sizes="180x180" href="data:image/png;base64,{png}">')
(here.parent / 'index.html').write_text(t)
print('built index.html')
