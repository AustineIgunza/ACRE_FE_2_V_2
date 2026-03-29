# ACRE Backend .env.local Setup

Copy this content to `C:\Users\mmatt\ACRE\.env.local`

```
NEXT_PUBLIC_SUPABASE_URL=https://apeavxqededjsgpzdajp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwZWF2eHFlZGVkanNncHpkYWpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MjA3OTgsImV4cCI6MjA4OTQ5Njc5OH0.TLpsrNsbHOwQbolOOiWeqTi3r94U6fMIrE3TootIlpA
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwZWF2eHFlZGVkanNncHpkYWpwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzkyMDc5OCwiZXhwIjoyMDg5NDk2Nzk4fQ.7Avh5ijBtqp70lM3qcdeAul7u1YP_VYK3fcTNh5DU3E

UPSTASH_REDIS_REST_URL=https://enhanced-ox-77548.upstash.io
UPSTASH_REDIS_REST_TOKEN=gQAAAAAAAS7sAAIncDJmYTRlNDE3ODczNTk0YWRiYWVjYjAxZjI2YTRkOGMzY3AyNzc1NDg

GEMINI_API_KEY=AIzaSyB1Vkin2w02x_-d_jtgU2jKo93iz6_Mzbw
```

## Instructions:
1. Go to `C:\Users\mmatt\ACRE`
2. Create or edit `.env.local` file
3. Paste the above content
4. Save the file
5. Run the backend: `python app.py` or `flask run`

## Testing:
After setting up both frontend and backend:
1. Start backend: `cd C:\Users\mmatt\ACRE && python app.py`
2. Start frontend: `cd C:\Users\mmatt\ACRE_FE\ARCE-FE && npm run dev`
3. Go to http://localhost:3000/heatmap
4. Create nodes, then test battle arena
