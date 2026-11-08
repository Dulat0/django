# CLAUDE.md

Учебный репозиторий: отдельные фрагменты кода Django / Django REST Framework,
по одному заданию на файл. Это не исходники Django и не запускаемый проект:
нет `manage.py`, `settings.py`, тестов и зависимостей.

## Файлы
- `1.1` — модели: Category, Product, Review, Comment, Like (models.py)
- `1.2` — функции-представления для товаров: список с сортировкой и поиском, детали, создание (views.py)
- `1.3` — urls для `1.2`
- `pr2,1.py` — views.py: регистрация и JWT (simplejwt): UserSerializer, CustomTokenObtainPairSerializer, UserCreate, ObtainTokenPairWithInfo
- `2,2.py` — urls для `pr2,1.py`
- `2,3.py` — шаблон ModelSerializer (`YourModel`)
- `2,4.py` — ListAPIView с SearchFilter
- `2,5.py` — ListAPIView с OrderingFilter

## Как работать
- Файлы маленькие (до 35 строк), их можно читать целиком; исследовать репозиторий не нужно.
- Проверка синтаксиса: `python -m py_compile <файл>` (у файлов `1.x` нет расширения `.py`).
- Запустить код нельзя: файлы ссылаются на приложения (`.models`, `.forms`), которых здесь нет.
