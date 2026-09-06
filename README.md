# ✍️ Numbly (TipTap AI) — Notion-Style Collaborative Editor & Contract Generation Engine

<p align="center">
  <img src="https://img.shields.io/badge/Next.js_15-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js 15" />
  <img src="https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React 19" />
  <img src="https://img.shields.io/badge/TipTap_v3-000000?style=for-the-badge&logo=tiptap&logoColor=white" alt="TipTap v3" />
  <img src="https://img.shields.io/badge/Yjs_CRDT-845EEE?style=for-the-badge&logo=yjs&logoColor=white" alt="Yjs CRDT" />
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase Auth & DB" />
  <img src="https://img.shields.io/badge/Groq_Llama_3.3-F55036?style=for-the-badge&logo=groq&logoColor=white" alt="Groq AI" />
</p>

---

## 📌 Overview

**Numbly (TipTap AI)** is a collaborative, block-based rich text editor inspired by **Notion**, engineered for contract drafting, legal revisions, and multi-user document synthesis.

Featuring **TipTap v3**, real-time conflict-free collaboration via **Yjs / Hocuspocus CRDTs**, offline-first caching with **Dexie.js (IndexedDB)**, and instantaneous AI contract generation via **Groq (Llama 3.3)**, it provides an agile workspace for teams.

---

## ✨ Key Features

- 🤖 **AI Contract Drafting:** Generates rigorous statutory clauses, covenants, and signature blocks from brief natural language descriptions.
- ⚡ **Notion-Style Block UX:** Slash commands (`/`), drag-and-drop row handles, math expressions, inline callouts, and code blocks.
- 👥 **Real-Time Collaboration:** Multi-cursor awareness, colored presence tags, and seamless collaborative editing powered by Yjs.
- 💾 **Offline-First Persistence:** Instant local saving via IndexedDB with automatic background sync to Supabase.
- 🔐 **Supabase Authentication:** Secure workspace isolation, user roles, and team document collections.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 15 (App Router, Turbopack) |
| **UI & Styling** | React 19, Tailwind CSS, Radix UI, CMDK |
| **Rich Text Engine** | TipTap v3 Suite, ProseMirror |
| **Realtime Sync** | Yjs, `@hocuspocus/provider` |
| **Artificial Intelligence** | Groq SDK (Llama 3.3 70B) |
| **Database & Auth** | Supabase, Dexie.js (IndexedDB) |

---

## 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/felipedutrag/tiptap.git
cd tiptap

# Install dependencies
npm install

# Run local development server
npm run dev
```

---

## 👤 Author

Developed by **Felipe Dutra**  
- **GitHub:** [@felipedutrag](https://github.com/felipedutrag)  
- **Email:** [felipedutra@outlook.com](mailto:felipedutra@outlook.com)