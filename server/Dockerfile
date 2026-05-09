# ─── STAGE 1: Base Image ─────────────────────────────────────────────────────
FROM node:20-alpine

# ─── STAGE 2: Set Working Directory ──────────────────────────────────────────
WORKDIR /app


# ─── STAGE 3: Copy Package Files First ───────────────────────────────────────
COPY package*.json ./


# ─── STAGE 4: Install Dependencies ───────────────────────────────────────────
RUN npm ci --only=production


# ─── STAGE 5: Copy Application Code ──────────────────────────────────────────
COPY . .


# ─── STAGE 6: Expose Port ────────────────────────────────────────────────────
EXPOSE 5000


# ─── STAGE 7: Start Command ───────────────────────────────────────────────────
CMD ["node", "src/server.js"]
