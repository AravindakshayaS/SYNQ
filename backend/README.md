# SYNQ backend

The backend is an Express application using Mongoose. Database startup is handled by `src/db.js`; the HTTP server starts only after MongoDB connects and model indexes initialize.

## Install

From VS Code, open a terminal in the project root and run:

```powershell
cd backend
npm install
```

Mongoose is already declared in `package.json`. For a new standalone project, the database package command is:

```powershell
npm install mongoose
```

This project requires Node.js 22 and uses Node's built-in `--env-file-if-exists=.env`, so `dotenv` is not required. In an older Node project, install it with `npm install dotenv` and add `import 'dotenv/config'` before reading `process.env`.

## Configure MongoDB Atlas

1. In Atlas, create a database user with a strong unique password.
2. Add the development machine's IP address under Network Access.
3. Copy `backend/.env.example` to `backend/.env`.
4. Set `MONGO_URI` to the Atlas driver connection string and replace its placeholders.
5. Set a random `JWT_SECRET` containing at least 48 characters.

```text
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-host>/synq?retryWrites=true&w=majority
```

For local development, the default `mongodb://127.0.0.1:27017/synq` value first uses an installed MongoDB service. If no local service is available, `npm start` automatically launches an embedded development database and stores its data in `backend/.data/mongodb`. Atlas and production connections never use this fallback.

Do not commit `.env`. Percent-encode reserved characters in the database username or password.

## Connection structure

- `src/db.js` owns `connectDB`, `disconnectDB`, connection pooling and lifecycle logs.
- `src/config.js` validates `process.env.MONGO_URI` without printing secrets.
- `src/server.js` connects, initializes indexes, and then starts Express.
- `src/models.js` contains the User, Task, Journal and Schedule schemas.

Start the API:

```powershell
npm run dev
```

Expected startup output:

```text
[database] connected to synq
SYNQ API listening at http://127.0.0.1:4000
```

Check database readiness:

```powershell
Invoke-RestMethod http://127.0.0.1:4000/api/health
```

## Verify User writes and reads

`src/models.js` includes the User schema used by registration and login. Registration writes a User document; login and `/api/auth/me` read it back.

```powershell
$body = @{
  name = "Atlas Test"
  email = "atlas-test@example.com"
  password = "replace-with-a-long-test-password"
} | ConvertTo-Json

$registration = Invoke-RestMethod `
  -Method Post `
  -Uri http://127.0.0.1:4000/api/auth/register `
  -ContentType "application/json" `
  -Body $body

Invoke-RestMethod `
  -Uri http://127.0.0.1:4000/api/auth/me `
  -Headers @{ Authorization = "Bearer $($registration.token)" }
```

Delete the test account from Atlas after verification if it is not needed.

## Verify code

```powershell
npm run check
npm test
```
