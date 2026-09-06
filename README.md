# ✍️ TipTap Studio — Real-Time Collaborative Notion-Style Document Workspace & AI Legal Engine

<p align=center>
  <img src=https://img.shields.io/badge/Next.js_15-000000?style=for-the-badge&logo=nextdotjs&logoColor=white alt=Next.js 15 />
  <img src=https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB alt=React 19 />
  <img src=https://img.shields.io/badge/TypeScript_5-007ACC?style=for-the-badge&logo=typescript&logoColor=white alt=TypeScript 5 />
  <img src=https://img.shields.io/badge/TipTap_v3_Suite-000000?style=for-the-badge&logo=tiptap&logoColor=white alt=TipTap v3 />
  <img src=https://img.shields.io/badge/Yjs_CRDT_Collab-845EEE?style=for-the-badge&logo=yjs&logoColor=white alt=Yjs CRDT />
  <img src=https://img.shields.io/badge/Hocuspocus-3B82F6?style=for-the-badge&logo=websocket&logoColor=white alt=Hocuspocus />
  <img src=https://img.shields.io/badge/Supabase_Auth_%26_DB-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white alt=Supabase />
  <img src=https://img.shields.io/badge/Dexie_IndexedDB-FFA000?style=for-the-badge&logo=indexeddb&logoColor=white alt=Dexie.js />
  <img src=https://img.shields.io/badge/Groq_Llama_3.3-F55036?style=for-the-badge&logo=openai&logoColor=white alt=Groq AI />
</p>

---

## 📌 Executive Overview

**TipTap Studio** is a real-time collaborative, Notion-inspired document workspace and contract automation suite built with modern web technologies. Engineered on top of **TipTap v3** and **ProseMirror**, it delivers high-fidelity block editing with draggable node handles, slash commands (/), KaTeX mathematics, and multi-user cursor tracking.

The architecture pairs conflict-free replicated data types (**Yjs CRDT**) with **Hocuspocus WebSocket synchronization** and an offline-first storage engine driven by **Dexie.js (IndexedDB)**. When online, state is persisted to **Supabase** while **Groq (Llama-3.3-70b)** provides sub-second streaming AI contract drafting, legal clause suggestions, and tone adjustments.

---

## 🏗️ System Architecture

`mermaid
flowchart TD
    UserA([Editor A]) <-->|Local Input / Keyboard / Pointer| ProseMirrorA[ProseMirror State & TipTap v3]
    UserB([Editor B]) <-->|Local Input / Keyboard / Pointer| ProseMirrorB[ProseMirror State & TipTap v3]
    
    subgraph Collaborative Synchronization Layer
        ProseMirrorA <-->|Doc Updates & Awareness Cursor| YjsA[Y.Doc Client A]
        ProseMirrorB <-->|Doc Updates & Awareness Cursor| YjsB[Y.Doc Client B]
        YjsA <-->|WebSocket CRDT Protocol| Hocuspocus[Hocuspocus Provider / Server]
        YjsB <-->|WebSocket CRDT Protocol| Hocuspocus
    end

    subgraph Offline-First & Cloud Persistence
        YjsA -->|Snapshot Cache| DexieDB[(Dexie.js: IndexedDB Local)]
        Hocuspocus -->|Debounced Sync| SupabaseDB[(Supabase PostgreSQL)]
        UserA -->|Session Tokens| SupabaseAuth[Supabase Auth Guard]
    end

    subgraph Streaming AI Engine
        UserA -->|Slash Command /ai prompt| GroqClient[Groq AI Client SDK]
        GroqClient -->|Llama-3.3-70b Ultra Low Latency Stream| AIStream[Token Delta Streamer]
        AIStream -->|Incremental ProseMirror Insert| ProseMirrorA
    end
`

---

## ✨ Key Features & Capabilities

- 📝 **Modular Block-Based Typography Studio:** Custom paragraph drag-handles, floating bubble menus, multi-level checklists, nested bullet trees, and KaTeX mathematical formula rendering.
- 👥 **Real-Time Multi-Cursor Collaboration:** Sub-millisecond peer synchronization using Yjs CRDTs and Hocuspocus with remote colored cursor names and live presence tags.
- ⚡ **Instant AI Generation & Rewriting:** Integrated Groq API running Llama 3.3 70B for instant contract clause generation, tone shifting, grammar refinement, and legal summarization.
- 💾 **Offline-First Resilience:** Instant local loading and offline editing via Dexie.js (IndexedDB), with background re-syncing once network connection is restored.
- ⌨️ **Command Palette & Slash Menu:** Intuitive CMDK palette triggered by / or keyboard shortcuts (⌘+K) to insert headers, dividers, callout banners, tables, and AI completions.
- 🔐 **Enterprise Multi-Tenant Auth:** Supabase Auth integration supporting social OAuth, email magic links, and team document permissions.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Framework & Engine** | Next.js 15.4.4 (App Router, Turbopack), React 19.1.0 |
| **Rich Text Editor** | TipTap v3 (@tiptap/core, @tiptap/pm, @tiptap/react, @tiptap/starter-kit) |
| **CRDT & Realtime** | Yjs (yjs, y-prosemirror, @tiptap/y-tiptap), Hocuspocus Provider (@hocuspocus/provider) |
| **Styling & Components** | Tailwind CSS v4, Radix UI, CMDK, Floating UI, Lucide Icons, SCSS |
| **Artificial Intelligence** | Groq SDK (llama-3.3-70b-versatile), Streaming AI Context |
| **Storage & Persistence** | Dexie.js 4 (IndexedDB), Supabase Client (@supabase/supabase-js, Auth UI) |

---

## 📂 Project Structure

`
tiptap/
├── app/                        # Next.js App Router root layout & page
├── components/
│   ├── tiptap-templates/       # Document layouts (legal agreements, memos, articles)
│   ├── tiptap-ui/              # Context menus, floating toolbars, font pickers
│   ├── tiptap-ui-primitive/    # Low-level buttons, dropdowns, popovers
│   ├── tiptap-ui-utils/        # Floating element positioning and slash suggestion menu
│   └── ui/                     # Radix atomic UI primitives
├── contexts/
│   ├── ai-context.tsx          # Groq streaming completion state
│   ├── collab-context.tsx      # Hocuspocus WebSocket connection lifecycle
│   └── editor-context.tsx      # Active TipTap editor instance & selection hooks
├── hooks/
│   ├── use-tiptap-editor.ts    # Custom editor initialization with full extension suite
│   ├── use-cursor-visibility.ts# Multi-user caret awareness
│   └── use-floating-element.ts # Floating balloon and context toolbar manager
├── lib/
│   ├── ai-service.ts           # Groq streaming client
│   ├── database.ts             # Dexie.js IndexedDB table schemas
│   ├── supabase.ts             # Supabase cloud client & Auth
│   ├── sync-service.ts         # Hybrid Dexie-Supabase synchronizer
│   └── tiptap-collab-utils.ts  # Yjs document provider bindings
├── package.json
└── tsconfig.json
`

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.18+ or v20+
- **Supabase Project** (optional for local offline testing)
- **Groq API Key** (for AI features)

### 1. Clone the Repository

`ash
git clone https://github.com/felipedutrag/tiptap.git
cd tiptap
`

### 2. Configure Environment Variables

Create a .env.local file:

`env
# AI Service
NEXT_PUBLIC_GROQ_API_KEY=your_groq_api_key

# Supabase Auth & Cloud Database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Collaborative Websocket Server (Optional / Hocuspocus)
NEXT_PUBLIC_HOCUSPOCUS_URL=ws://localhost:1234
`

### 3. Install & Start Development Server

`ash
# Install dependencies
npm install

# Start development server with Turbopack
npm run dev

# Open in browser: http://localhost:3000
`

---

## 👤 Author

**Felipe Dutra**  
- **GitHub:** [@felipedutrag](https://github.com/felipedutrag)  
- **Email:** [felipedutra@outlook.com](mailto:felipedutra@outlook.com)
