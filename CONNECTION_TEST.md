# 🔗 ARCÉ Connection Test Guide

## Frontend Status
- **Frontend URL:** http://localhost:3000
- **Frontend API Proxy:** http://localhost:3000/api

## Backend Configuration
- **Backend Service:** ACRE (running at http://localhost:3001)
- **Configured in:** `.env.local` → `ACRE_BACKEND_URL=http://localhost:3001`

## API Endpoints (Frontend Proxy → Backend)

```
Frontend API Proxy              Backend Service
======================          ===============
POST /api/generate-scenarios    → POST http://localhost:3001/api/generate-scenarios
POST /api/generate-battle-scenarios → POST http://localhost:3001/api/generate-battle-scenarios
POST /api/evaluate              → POST http://localhost:3001/api/evaluate
POST /api/generate-variation    → POST http://localhost:3001/api/generate-variation
```

## Quick Start

### Terminal 1: Frontend
```powershell
cd c:\Users\mmatt\ACRE_FE\ARCE-FE
npm run dev
```
✅ Frontend running on: http://localhost:3000

### Terminal 2: Backend
```powershell
cd c:\Users\mmatt\ACRE\ARCE
npm run dev
```
✅ Backend running on: http://localhost:3001

## Test Links

| Service | URL | Expected |
|---------|-----|----------|
| **Home** | http://localhost:3000 | ARCÉ landing page |
| **Sign In** | http://localhost:3000/signin | Sign in form |
| **Sign Up** | http://localhost:3000/signup | Sign up form |
| **Dashboard** | http://localhost:3000/dashboard | User dashboard (needs auth) |
| **Learn** | http://localhost:3000/learn | Learning input phase |
| **Heatmap** | http://localhost:3000/heatmap | Thermal heatmap view |
| **Battle** | http://localhost:3000/battle | Battle arena (needs quiz session) |

## API Health Checks

### Frontend API Proxy Health
```bash
curl -X GET http://localhost:3000/api
# Should return error or health status
```

### Backend Connection Test
```bash
# From frontend .env.local
ACRE_BACKEND_URL=http://localhost:3001

# This is what frontend calls
curl -X POST http://localhost:3001/api/generate-scenarios \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

## Environment Variables

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
ACRE_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_SUPABASE_URL=https://apeavxqededjsgpzdajp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

**Backend (.env.local):**
- Should have Supabase credentials
- Should have Gemini API key
- Should have Upstash Redis URL

## Connection Flow

```
User Browser
    ↓
http://localhost:3000 (Frontend)
    ↓
POST /api/generate-scenarios
    ↓
Frontend API Proxy (next/route.ts)
    ↓
fetch("http://localhost:3001/api/generate-scenarios")
    ↓
Backend Service (ACRE)
    ↓
Process with Gemini AI
    ↓
Response back to Frontend
    ↓
User sees results
```

## Troubleshooting

❌ **"Backend error" when starting learning session?**
- Check if backend is running on port 3001
- Verify `ACRE_BACKEND_URL=http://localhost:3001` in .env.local
- Check backend console for errors

❌ **"Module not found: better-auth" error?**
- Run: `npm install better-auth`
- Restart frontend with: `npm run dev`

❌ **Port already in use?**
- Frontend: `npx kill-port 3000`
- Backend: `npx kill-port 3001`

✅ **All working?**
Visit http://localhost:3000 and test the full learning flow!
