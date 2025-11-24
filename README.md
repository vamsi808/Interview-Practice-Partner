
# 🎤 Interview Practice Partner  
### AI-Powered Mock Interview & Performance Analysis System  
Built with **Next.js 14**, **Genkit**, **Google Gemini 2.5 Flash**, **Tailwind**, and **ShadCN UI**

---

## 🚀 Overview
**Interview Practice Partner** is an intelligent AI-driven platform designed to simulate real interview experiences. It dynamically generates interview questions, evaluates user responses, provides follow-up prompts, and delivers structured performance analysis. Built using **Google Genkit + Gemini**, the system behaves like a real interviewer capable of understanding context, evaluating strengths and weaknesses, and giving improvement-focused guidance.

This system supports:
- AI Interviewer Agent  
- Voice Output (Text-to-Speech)  
- Scoring & Feedback  
- Intelligent Question Flow  
- Modern UI with ShadCN  

---

## ✨ Key Features
### 🧠 AI Interview Agent  
- Powered by **Gemini 2.5 Flash**
- Understands user responses  
- Generates human-like follow-up questions  
- Provides detailed improvement feedback  

### 📊 Performance Assessment  
- Rates communication skills  
- Evaluates technical correctness  
- Measures clarity & structure  
- Generates personalized performance summary  

### 🔄 Dynamic Follow-Up Questions  
- Questions adapt to user responses  
- Ensures contextual continuity  
- Encourages deeper thought  

### 🗣️ Voice Output (Google TTS)  
- Converts AI responses into natural-sounding speech  
- Enables realistic mock interview sessions  

### 🎨 Modern UI  
- Next.js App Router  
- Tailwind CSS  
- ShadCN UI components  

---

# 🛠️ Installation & Setup

## 1️⃣ Clone the Repository
```
git clone https://github.com/yourusername/interview-practice-partner.git
cd interview-practice-partner
```

## 2️⃣ Install Dependencies
```
npm install
```

## 3️⃣ Setup Environment Variables
Create `.env.local`:
```
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json
NEXT_PUBLIC_PROJECT_ID=your-gcp-project-id
```

## 4️⃣ Enable Required Google APIs
Enable in Google Cloud Console:
- Vertex AI API  
- Generative Language API  
- Text-to-Speech API  
- IAM Service Account Token Creator  

## 5️⃣ Start the Development Server
```
npm run dev
```

---

# 🧩 Project Structure

```
Interview-Practice-Partner/
│
├── src/
│   ├── ai/
│   │   ├── dev.ts
│   │   ├── genkit.ts
│   │   └── flows/
│   │       ├── assess-interview-performance.ts
│   │       ├── generate-dynamic-follow-up-questions.ts
│   │       ├── provide-personalized-feedback.ts
│   │       └── text-to-speech.ts
│
├── app/               
├── components/        
├── lib/               
├── styles/            
├── public/
└── package.json
```

---

# 🧠 AI Architecture & Flow Design

### 🟦 Genkit Initialization
```ts
import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/google-genai";

export const ai = genkit({
  plugins: [googleAI()],
  model: "googleai/gemini-2.5-flash",
});
```

### 🟪 AI Flows
| File | Purpose |
|------|---------|
| assess-interview-performance.ts | Scores user responses |
| generate-dynamic-follow-up-questions.ts | Generates next question |
| provide-personalized-feedback.ts | Gives feedback |
| text-to-speech.ts | Converts text → audio |

---

# 🧱 Architecture Diagram (ASCII)



# 🔁 Sequence Flow Diagram (ASCII)



# 🎨 Design Decisions

### 🟩 Next.js  
- App Router simplifies structure  
- Flexible server-client boundaries  
- Great for modern AI apps  

### 🟦 Genkit  
- Easy LLM orchestration  
- Flow-based architecture  
- Native Google AI support  

### 🟪 Gemini  
- Fast inference  
- Strong contextual abilities  
- Cost-efficient  

### 🟥 ShadCN  
- Provides modular, modern UI  
- Tailwind-based styling  

---

# 📦 Deployment Guide

## Deploy on Vercel
1. Push repo → GitHub  
2. Import into Vercel  
3. Add environment variables  
4. Upload service account JSON  
5. Deploy  

---

# 🧪 Future Enhancements
- Add voice input (Speech-to-Text)  
- Add multi-round interviews  
- Add analytics dashboard  
- User login + history tracking  
- Resume evaluator  

---

# ❤️ Credits
Built using:
- Next.js  
- ShadCN  
- Tailwind CSS  
- Google Genkit  
- Gemini 2.5 Flash  
- Google TTS  

---

# 📜 License  
MIT License
