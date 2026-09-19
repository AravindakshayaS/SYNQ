# API contract — first milestone

Base: `http://127.0.0.1:4000/api`. Requests and responses use JSON, except successful deletes/logout (204). Protected endpoints require `Authorization: Bearer <token>`. Keep access tokens in memory in the future browser client.

Errors use `{ "error": "message" }`; input errors also contain `issues` with field/message pairs. Statuses: 400 invalid input, 401 authentication, 403 admin permission, 404 missing owned resource, 409 uniqueness conflict, 413 oversized body, 429 rate limit, 502 invalid/unavailable AI provider, 503 unconfigured AI or unhealthy database, 504 AI timeout. Rate-limit middleware currently uses its default text response.

| Method | Path | Input / result |
| --- | --- | --- |
| GET | `/health` | Public readiness, 200 or 503 |
| POST | `/auth/register` | Public `{name,email,password}`; 201 `{user,token,expiresIn}` |
| POST | `/auth/login` | Public `{email,password}`; `{user,token,expiresIn}` |
| GET | `/auth/me` | `{user}` |
| POST | `/auth/logout` | Revoke all account tokens; 204 |
| GET | `/tasks` | Optional `date`, `page`, `limit`; `{data,page,hasMore}` |
| POST | `/tasks` | `{date,title,status?,tag?}`; 201 `{data}` |
| PATCH | `/tasks/:id` | Any subset of task fields; `{data}` |
| DELETE | `/tasks/:id` | Delete owned record; 204 |
| GET | `/journals` | Optional `date`, `page`, `limit`; `{data,page,hasMore}` |
| PUT | `/journals` | Upsert `{date,text,mood}`; `{data}` |
| DELETE | `/journals/:id` | Delete owned record; 204 |
| GET | `/schedules` | Optional `date`, `page`, `limit`; `{data,page,hasMore}` |
| PUT | `/schedules` | Upsert `{date,mode?,blocks}`; `{data}` |
| DELETE | `/schedules/:id` | Delete owned record; 204 |
| POST | `/schedules/generate` | `{input}`; `{data:{blocks,saved:false}}` |
| GET | `/admin/overview` | Superadmin only; `{data:{users,tasks,schedules,journals}}` counts |
| GET | `/admin/users` | Superadmin; optional `page`, `limit`; safe accounts |
| PATCH | `/admin/users/:id` | Superadmin; `{disabled:boolean}` for regular users only |

All lists default to 30 records and allow at most 100 per page. Pagination is sorted by descending date and ID (accounts by ID). Concurrent inserts can shift offset pages; cursor pagination is a later enhancement.

Dates are real `YYYY-MM-DD` local calendar days. Task states: `pending`, `completed`, `skipped`. Tags: `study`, `work`, `health`, `meal`, `break`, `sleep`, `other`. Moods: `great`, `good`, `okay`, `low`, `difficult`. Schedule modes: `weekday`, `weekend`.

Example schedule save:

```json
{
  "date": "2026-09-08",
  "mode": "weekday",
  "blocks": [
    { "time": "09:00", "endTime": "10:30", "label": "DSA practice", "tag": "study" },
    { "time": "10:30", "endTime": "10:45", "label": "Take a break", "tag": "break" }
  ]
}
```

Blocks must be ordered and non-overlapping, with 1–100 blocks and valid 24-hour times. Overnight intervals are not accepted; save the following day's plan separately. Saving a schedule does not create tasks in this milestone.

Passwords require at least 12 characters and at most 72 UTF-8 bytes. Registration rejects extra fields (including role, disabled and ownership). Daily upserts are unique per user/date; a simultaneous first insert can produce 409 and should be retried after refreshing.
