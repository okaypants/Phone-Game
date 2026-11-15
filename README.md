# Tine

A thumb-friendly, kalimba-style instrument for your phone. The kalimba is the interface, but the sounds go well past it: five plucked voices (wood, felt, music box, metal, glow) and seven synth voices (dream pad, 808, Moog-style ladder bass, ARP-style lead, electro square, string machine, formant vox). It has a recorder built in.

It's a single static web page with no build step, server or dependencies. All sound is synthesized live with the Web Audio API, so it uses no samples.

## Features

- **Keys:** chunky keys in rows, about thumb width. Portrait: 1×5, 2×5, 1×7, 2×7, 3×7, 2×8 or 3×8. Landscape: 1×7, 1×9, 2×9, 2×11, 2×13 or 2×15. The bottom row is the lowest.
- **Playing:** tap to play, slide to strum or glide. Multi-touch works.
- **Key and scale:** all 12 keys × 16 scales (major, natural minor and the other modes, harmonic and melodic minor, pentatonics, blues, in-sen, hirajoshi, whole tone, chromatic).
- **Octave:** −3 to +2.
- **Synths behave like the real instruments:**
  - The 808, Moog, ARP and vox are mono with legato glide (off, short or long), and fall back to the note still held when you let go.
  - Electro and strings play chords.
  - Each synth has its own echo and reverb amount. The 808 and electro are dry.
- **Dream:** a dark, slow string pad that blooms open while you hold a key, with a low octave under it, a soft electric-piano tine at the start of each note and a long, reverberant tail.
- **Glow:** a chime built only from whole-number harmonics (so it has almost no roughness), with a slow shimmer and a soft sparkle that rises up the harmonic series after each note.
- **Click:** an optional metronome (60–160 bpm, three volume levels, accent every fourth beat). You hear it and see it (the CLICK button flashes and four beat dots step along the display), but it isn't recorded. The echo time follows its tempo.
- **Motes:** a little dust lifts off each key you play, and the keys either side shiver. Play with a steady pulse (or in time with the click) and the dust lasts longer, warms in colour, drifts into a slow swirl and links up; lose the pulse and it sinks and fades. It's off if your phone is set to reduce motion.
- **Hold:** with HOLD on, the sustaining synths (everything but the 808) keep ringing after you lift your finger. Tap a lit key again to stop it, or turn HOLD off to stop them all. Poly voices stack into chords; mono voices keep the last note.
- **Recorder:** records the instrument's own output, not the mic. Takes are kept in the browser (IndexedDB), and you can play, save or share, and delete them.
- **App:** installable to the home screen (PWA) and works offline once loaded.

## Run it locally

Open `index.html` in a browser. To test installing and offline mode, serve it over HTTPS or localhost:

```bash
python3 -m http.server 8000
# then open http://localhost:8000 (or your machine's LAN IP on your phone)
```

## Publish it (all free)

- **GitHub Pages:** push this folder to a repo, then go to Settings → Pages → deploy from branch `main` / root.
- **Netlify:** drag the folder onto app.netlify.com/drop.
- **itch.io:** zip the folder contents (with `index.html` at the top level), create a new project, set Kind to "HTML", upload the zip and tick "This file will be played in the browser". Tick "Mobile friendly" too.
- **Cloudflare Pages / Vercel:** import the repo. No build command is needed, and the output directory is `/`.

Once it's hosted, phone users can use "Add to Home Screen" to get a full-screen app with an icon.

## Project layout

```
index.html               ← the whole app (this is what you deploy)
manifest.webmanifest     ← home-screen install info
sw.js                    ← offline cache
icon-*.png               ← app icons
src/                     ← editable pieces that build into index.html
  index.template.html    ← UI, layout, input, recorder
  audio.js               ← master chain: saturation, room reverb, tape delay
  kalimba-voices.js      ← the six acoustic voices
  synth-voices.js        ← the six synth voices, per-instrument fx, mono/glide
  ios-audio-unlock.js    ← gets sound working on iPhones, including with the silent switch on
  build.py               ← python3 src/build.py → rebuilds index.html
```

Edit in `src/`, then run `python3 src/build.py`. You can also edit `index.html` directly if you'd rather keep it to one file.

## Notes

- **iPhone sound:** the first tap unlocks audio. The page uses a workaround to play with the silent switch on, but if a phone stays silent, check the volume.
- **Recordings** save as `.webm` on Android and desktop Chrome, and `.mp4` (AAC) on iPhone and Safari.
- **Haptics** only work on Android. iOS browsers don't expose vibration.
- **Fonts:** IBM Plex Mono (the instrument) and Fredoka (the opening page) load from Google Fonts. Offline, they fall back to system fonts.
- **Before a public or commercial release:** "Moog" and "ARP" are trademarks. The voice names are fine for personal use, but generic names are safer for a public launch (for example "ladder" and "lead"). "808" is widely used generically.

## Ideas for next

An arpeggiator, a drive control, a filter you sweep by sliding along a key, MIDI out (Web MIDI on Android and desktop), a count-in for the recorder, and a Nintendo DS homebrew port (the two-row layout maps naturally onto the touchscreen).
