# CLAUDE.md

Учебный репозиторий: отдельные фрагменты кода Django / Django REST Framework,
по одному заданию на файл. Это не исходники Django и не запускаемый проект:
нет `manage.py`, `settings.py`, тестов и зависимостей.

## Файлы
- `1.1` — модели: Category, Product, Review, Comment, Like (models.py)
- `1.2` — функции-представления для товаров: список с сортировкой и поиском, детали, создание (views.py)
- `1.3` — urls для `1.2`
- `pr2,1.py` — регистрация и JWT (simplejwt): UserCreate, ObtainTokenPairWithInfo, UserSerializer
- `2,2.py` — urls для `pr2,1.py`
- `2,3.py` — шаблон ModelSerializer (`YourModel`)
- `2,4.py` — ListAPIView с SearchFilter
- `2,5.py` — ListAPIView с OrderingFilter

## Известные проблемы
- `pr2,1.py`: импорты перепутаны, есть синтаксические ошибки, не определён `CustomTokenObtainPairSerializer`
- `1.1`: в конце лишний класс `ObtainTokenPairWithInfo` без `:`
- `1.3`: маршрут `token/` ссылается на неимпортированный `ObtainTokenPairWithInfo`

## Как работать
- Файлы маленькие (до 35 строк), их можно читать целиком; исследовать репозиторий не нужно.
- Проверка синтаксиса: `python -m py_compile <файл>` (у файлов `1.x` нет расширения `.py`).
- Запустить код нельзя: файлы ссылаются на приложения (`.models`, `.forms`), которых здесь нет.


# Animation Studio (2D/3D мультфильмы)

Набор навыков в `.claude/skills/` (7 для 2D, 8 для 3D) используется для задач по созданию мультфильмов. Он не относится к Django-заданиям выше. Ниже правила из пакета Claude Animation Studio.


### Purpose
Create polished animated cartoons using either 2D hand-drawn workflows or 3D production workflows. Choose the workflow that matches the user's request; do not mix them unless asked.

### Choose the pipeline

#### 2D pipeline
Story/script → storyboard/shot list → visual direction → character and environment references → scene images → image-to-video/motion → voice and sound → continuity review → final edit.

#### 3D pipeline
Story/script → storyboard/shot list → visual direction → character/environment design → modeling → rigging → blocking → animation polish → lighting/materials → preview render → continuity review → final render and sound.

### Shared production principles
- Confirm the deliverable and acceptance criteria before expanding scope.
- Keep characters, environments, props, style, and visual continuity consistent.
- Reuse approved references and assets; do not regenerate unchanged work.
- Prefer clear silhouettes, readable staging, expressive acting, and simple production-friendly designs.
- Use the minimum number of scenes, assets, tools, and iterations that achieve the requested quality.
- Use previews and representative tests before scaling up or rendering final quality.
- Keep explanations concise and outputs production-ready.
- Ask only questions that block progress; otherwise use sensible defaults and state them briefly.
- Do not claim to have generated, edited, rigged, animated, or rendered an asset unless a tool actually performed that action.
- Be explicit when a step requires an external tool such as Blender, Maya, Cinema 4D, Unreal Engine, or an image/video generation service.

### 2D skills
- `story-director`
- `art-director`
- `character-designer`
- `animation-director`
- `continuity-manager`
- `voice-director`
- `efficiency-manager`

### 3D skills
- `3d-art-director`
- `3d-character-modeler`
- `3d-modeling-supervisor`
- `3d-rigging-director`
- `3d-animation-director`
- `3d-lighting-render-supervisor`
- `3d-continuity-manager`
- `3d-pipeline-optimizer`

### Default shot handoff
For each shot, provide only what is needed:
1. Shot number, duration, and framing/camera
2. Narration/dialogue
3. Character action and emotion
4. Required visual assets/models/props/environment
5. Image prompt (2D) or modeling/scene notes (3D)
6. Motion/animation instructions
7. Essential sound cues
8. Continuity constraints

Only produce the stage the user asked for. Do not output every production stage unless requested.


### Voice and audio skills
- `voiceover-writer`
- `voice-acting-director`
- `tts-producer`
- `audio-post-production`
- `soundscape-designer`

### Voice production workflow
Script for speech → performance direction → short TTS/actor audition → approved voice profile → line-by-line recording/generation → audio cleanup → dialogue mix → soundscape → final listening check.

### Free-first voice policy
Prefer local/open-source tools when practical. Suggested starting points:
- Kokoro TTS: https://github.com/hexgrad/kokoro
- Piper TTS: https://github.com/OHF-Voice/piper1-gpl
- Audacity: https://www.audacityteam.org/
- FFmpeg: https://ffmpeg.org/

Check language support, hardware needs, exact model/voice license, and commercial-use conditions before production. Free software does not automatically make every voice model or sound asset free for commercial use. Never promise a free cloud service is unlimited.
