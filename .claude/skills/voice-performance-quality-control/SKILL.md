---
name: voice-performance-quality-control
description: Audit generated or recorded narration for emotional realism, prosody, intelligibility, consistency, timing, and robotic or monotonous delivery.
---
# Voice Performance Quality Control

Evaluate whether the performance sounds intentional, human, and emotionally connected to the scene.

## Listen for
- Same pitch contour and rhythm on every sentence.
- Emotion labels that do not affect the actual performance.
- Incorrect emphasis or unnatural stress.
- Missing breaths, pauses, reactions, or emotional transitions.
- Overdone gasps, whispers, crying, shouting, or artificial tremble.
- Robotic pacing, clipped consonants, strange pronunciation, or inconsistent volume.
- Character voices changing unintentionally between scenes.
- Effects or music masking speech.

## Score each dimension from 1 to 5
- Emotional truth
- Intonation and word stress
- Natural rhythm and pauses
- Character distinction
- Intelligibility
- Scene synchronization
- Sound mix clarity

## Fix workflow
1. Identify the exact line and time range.
2. Describe what sounds wrong (not just "make it better").
3. Give a revised performance direction or text segmentation.
4. Regenerate or rerecord only the affected line.
5. Compare it in context with the lines before and after.

## Acceptance standard
A line passes only when its intention is understandable, emotional changes are audible, words remain intelligible, and the delivery fits the character and scene. Do not treat a TTS engine's inability to perform an emotion as a prompt-writing problem forever; recommend a different engine, voice, human performance, or post-production method when needed.
