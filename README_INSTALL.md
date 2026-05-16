# Smart Admin Rebuild v6 — Organizer OS UX

Что добавлено:

- mobile-first адаптив: preview уходит в кнопку, action bar снизу, секции становятся карточками;
- название кабинета с именем организатора: `NEXT_PUBLIC_ORGANIZER_NAME` или Smart Kazakhstan;
- верхние действия переосмыслены: Черновики / Мои события / save-state;
- localStorage autosave при вводе и закрытии вкладки;
- страница `/dashboard/organizer/events` с табами статусов;
- улучшенный preview, progress score и validation panel;
- дополнительные CSS-фиксы отступов, чтобы тексты не прилипали к рамкам.

После замены:

```bash
npx prisma generate
npx prisma db push
npm run dev
```

Опционально в `.env.local`:

```bash
NEXT_PUBLIC_ORGANIZER_NAME="Smart Kazakhstan"
```

Важно: autosave в v6 локальный, чтобы не плодить дубликаты событий в базе. Серверный autosave лучше делать следующим шагом через `draftId + PATCH /api/dashboard/events/[id]`.
