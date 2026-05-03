<p align="center">
  <a href="https://devbrief-ai.vercel.app/"><strong>DEVBRIEF</strong></a>
</p>
<p align="center">
  Turn a concise pitch into a developer-ready brief—<strong>Neo-brutalist UI</strong>, <strong>Groq (Llama)</strong> inference on the server.<br/>
  Your <code>GROQ_API_KEY</code> never touches the bundle.
</p>

<p align="center">
  <a href="https://devbrief-ai.vercel.app/"><img src="https://img.shields.io/badge/Live-demonstration-cc000?style=for-the-badge&logo=vercel&logoColor=white&labelColor=000000" alt="Live on Vercel"/></a>
  <a href="https://groq.com/"><img src="https://img.shields.io/badge/Groq-inference-cc0000?style=for-the-badge&labelColor=111111" alt="Groq inference"/></a>
</p>

<p align="center">
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js_14-000?style=flat-square&logo=next.js&logoColor=white" alt="Next.js"/></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-3178c6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript"/></a>
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind-38bdf8?style=flat-square&logo=tailwind-css&logoColor=000&labelColor=0f172a" alt="Tailwind"/></a>
</p>

<p align="center">
  <strong>Creator</strong> · 
  <a href="https://x.com/WebRaizo"><img src="https://img.shields.io/badge/-@WebRaizo-000000?style=flat-square&logo=x&logoColor=white" alt="X @WebRaizo"/></a>
</p>

<p align="center">
  <a href="https://devbrief-ai.vercel.app/">devbrief-ai.vercel.app</a>
</p>

<br/>

<p align="center">
  <kbd>FLOW</kbd> · wizard → validate → infer → preview · copy · download
</p>

```mermaid
%%{init: {
  "theme": "base",
  "themeVariables": {
    "primaryColor": "#cc0000",
    "primaryTextColor": "#ffffff",
    "secondaryColor": "#f4f4f4",
    "tertiaryColor": "#111111",
    "lineColor": "#cc0000",
    "clusterBkg": "#fafafa",
    "clusterBorder": "#000000",
    "edgeLabelBackground": "#ffffff"
  },
  "flowchart": { "curve": "linear", "htmlLabels": true }
}}%%
flowchart TB
    subgraph CLIENT["Client"]
      direction LR
        A["Step wizard\npitch · sections · depth · locale"] --> B["POST /api/brief"]
      C["Brief surface"] --> D["Preview dialog"]
      D --> E["Copy / .txt"]
    end

    subgraph SERVER["Next.js route · Node"]
        direction TB
        B --> R1["Quota + validation"]
        R1 --> R2["Structured prompt"]
        R2 --> R3["Groq · chat/completions"]
    end

    R3 -->|"plain brief"| C

    style CLIENT fill:#ffffff,stroke:#000000,stroke-width:2px
    style SERVER fill:#fff5f5,stroke:#cc0000,stroke-width:2px
    style R3 fill:#cc0000,stroke:#000000,stroke-width:2px,color:#fff
    style B fill:#111111,stroke:#000000,stroke-width:2px,color:#fff
```

<br/>

## Snapshot

| | |
| ---: | :--- |
| **Demo** | [devbrief-ai.vercel.app](https://devbrief-ai.vercel.app/) |
| **Health** | [`GET /api/brief`](https://devbrief-ai.vercel.app/api/brief) |
| **Languages** | EN · DE · FR · IT output |
| **Sections** | Summary, tech stack, milestones, timeline, budget |

<p align="center">
  <img src="app/DevBriefThumbnail.png" alt="DevBrief UI collage — wizard, Groq status, brief preview" width="92%"/>
</p>

---

## Run locally

```bash
npm install
cp .env.example .env.local
# GROQ_API_KEY=…  →  https://console.groq.com/keys
npm run dev
```

→ [http://localhost:3000](http://localhost:3000)

## Deploy on Vercel

Project → **Environment Variables** → `GROQ_API_KEY` (and optional `GROQ_MODEL`) for **Production** & **Preview**, then redeploy.

---

<p align="center">
  <sub>Built by <a href="https://x.com/WebRaizo"><strong>@WebRaizo</strong></a> · MIT-ready (add a <code>LICENSE</code> when you pick one)</sub>
</p>
