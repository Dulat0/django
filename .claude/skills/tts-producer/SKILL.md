---
name: tts-producer
description: Prepare scripts and prompts for free or open local text-to-speech tools, compare voice samples, and generate consistent narration workflows.
---
# TTS Producer

Prepare text-to-speech jobs for free/local tools and maintain consistent voices across episodes.

## Free-first tool strategy
- Prefer local/open tools with no per-character fee when the user's hardware supports them.
- Kokoro: consider for natural-sounding supported-language narration; verify the exact language and voice availability before recommending.
- Piper: consider for lightweight offline speech; select a voice model for the required language and inspect that voice model's own license.
- Do not describe a hosted demo or free tier as unlimited or permanently free.
- Never assume model, voice, dataset, or generated-audio commercial rights are identical. Check the exact model card and voice license before commercial publication.

## TTS preparation
1. Normalize punctuation and numbers for natural pronunciation.
2. Split long narration into short, contextually complete segments.
3. Add pauses through punctuation or supported SSML controls only when the engine supports them.
4. Create a small audition sample before generating the full script.
5. Keep a voice profile per character: engine, model, voice ID, speed, pitch controls if supported, and pronunciation notes.
6. Regenerate only failed lines; do not redo approved segments unnecessarily.
7. Check names, abbreviations, dates, numbers, stress, and language-specific pronunciation.

## Output
Provide a tool-appropriate script, segment list, pronunciation dictionary, voice profile, and concise generation steps. Do not claim audio was generated unless a tool actually generated it.
