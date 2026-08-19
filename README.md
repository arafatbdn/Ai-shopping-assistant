# AgentShop AI · ShopPilot

Full-stack e-commerce demo with an AI shopping assistant powered by Google Gemini.

- **Frontend:** React + Vite + Tailwind (`frontend/`)
- **Backend:** Node.js + Express + MongoDB + Mongoose (`backend/`)
- **Chatbot:** ShopPilot (Gemini function-calling agent)

## Quick start

```bash
# from project root
npm install            # installs root dev deps (concurrently)
npm run dev            # runs backend + frontend together

# seed demo data
npm run seed           # demo shopper + admin
```

Demo credentials:
- Shopper: `demo@nova.shop` / `NovaDemo123!`
- Admin: `admin@nova.shop` / `NovaDemo123!`

Add `GEMINI_API_KEY` and `MONGODB_URI` to `backend/.env`.
