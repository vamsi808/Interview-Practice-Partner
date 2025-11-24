# Interview Practice Partner

AI-Powered Mock Interview and Performance Analysis System
Built with Next.js 14, Genkit, Google Gemini 2.5 Flash, Tailwind CSS, and ShadCN UI

## Overview
Interview Practice Partner is an AI-driven platform designed to simulate real interview experiences. It dynamically generates interview questions, evaluates user responses, produces follow-up questions, and delivers structured performance analysis. Built using Google Genkit and Gemini, the system behaves like a real interviewer capable of understanding context, identifying strengths and weaknesses, and providing targeted feedback for improvement.

This system supports:
- AI Interviewer Agent
- Text-to-Speech voice output
- Evaluation and scoring mechanisms
- Intelligent adaptive question flow
- Modern, responsive UI built with ShadCN

## Key Features

### AI Interview Agent
- Powered by Gemini 2.5 Flash
- Understands natural language inputs
- Generates follow-up questions tailored to user responses
- Produces detailed performance feedback

### Performance Assessment
- Evaluates clarity, correctness, and communication
- Provides structured, numeric scoring
- Highlights user strengths and improvement areas

### Dynamic Follow-Up Questions
- Maintains contextual continuity
- Adapts based on conversation flow
- Encourages deeper technical and behavioral reasoning

### Voice Output (Google Text-to-Speech)
- Converts AI-generated responses into audio
- Enables a more interactive mock interview experience

### Modern UI
- Built using Next.js App Router
- Styled using Tailwind CSS
- Components implemented using ShadCN UI

## Installation and Setup

### 1. Clone the Repository
git clone https://github.com/yourusername/interview-practice-partner.git
cd interview-practice-partner

### 2. Install Dependencies
npm install

### 3. Configure Environment Variables
Create a `.env.local` file:
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json
NEXT_PUBLIC_PROJECT_ID=your-gcp-project-id

Place your Google Cloud `service-account.json` in the project root.

### 4. Enable Required Google Cloud APIs
Enable the following:
- Vertex AI API
- Generative Language API
- Text-to-Speech API
- IAM Service Account Token Creator

### 5. Run the Development Server
npm run dev

## Project Structure

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


## AI Architecture and Flow Design

### Genkit Initialization
import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/google-genai";

export const ai = genkit({
  plugins: [googleAI()],
  model: "googleai/gemini-2.5-flash",
});

### AI Flow Descriptions

File | Purpose
-----|---------
assess-interview-performance.ts | Scores user responses
generate-dynamic-follow-up-questions.ts | Generates the next question
provide-personalized-feedback.ts | Produces improvement feedback
text-to-speech.ts | Converts text to audio output

## Architecture Diagram (ASCII Simplified)

User
   |
   v
Next.js Frontend (UI, Audio Handling)
   |
   v
Next.js Server Actions (API Layer)
   |
   v
Genkit AI Layer (Gemini + Flows)
   |
   v
Google Cloud Services (TTS, Vertex AI)
   |
   v
Storage Layer (DB, Logs, Audio Blobs)

![Project Architecture](vamsi808/interview-practice-partner/architecture_images/final_architecture.png)

## Sequence Flow Diagram (ASCII Simplified)

User → Frontend: Submit answer
Frontend → Server: Process request
Server → Genkit: Evaluate and generate next step
Genkit → Gemini: LLM inference
Gemini → Genkit: Scores, feedback, next question
Genkit → TTS: Convert text to audio
Server → Frontend: Return text + audio
Frontend → User: Present results

## Design Decisions and Reasoning

### Choice of Next.js
Next.js App Router offers a modern development model with built-in server-side functionality. This enables clean separation between the UI and backend orchestration while simplifying API design and deployment.

### Choice of Genkit
Genkit provides a structured way to build AI workflows. Unlike ad-hoc prompts, Genkit flows enforce modularity, maintainability, and testability. They also integrate natively with Google Gemini models, ensuring stable and efficient inference.

### Choice of Gemini
Gemini 2.5 Flash provides a balance of speed, cost-efficiency, and contextual accuracy. For real-time interview simulation, latency and response-quality trade-offs are essential. Gemini offers strong reasoning abilities suitable for evaluating interview responses.

### Choice of ShadCN UI
ShadCN components provide a consistent UI design system that integrates with Tailwind CSS. The goal was to create a clean and responsive interface that does not distract from the interview workflow.

### System Goals
The system is designed to:
- Provide a natural interview simulation
- Evaluate performance objectively
- Guide improvement through contextual feedback
- Enable seamless interactions (text and voice)

The architecture emphasizes modularity, maintainability, and the ability to extend the system with new interview flows or additional AI capabilities.

## User Testing Scenarios and Behaviors

### 1. The Confused User
Behavior: Unsure what they want, provides vague or incomplete responses.
System Response:
- Clarifies questions
- Provides guiding prompts
- Asks simpler follow-ups
- Reduces cognitive load

### 2. The Efficient User
Behavior: Wants quick answers, concise interactions, and minimal context.
System Response:
- Provides short and direct questions
- Returns compact feedback
- Avoids unnecessary elaboration

### 3. The Chatty User
Behavior: Goes off-topic frequently, includes unrelated details.
System Response:
- Extracts relevant information
- Redirects conversation back to interview topic
- Maintains professional tone

### 4. Edge Case Users
Behavior: Invalid inputs, nonsensical phrases, extremely long responses, attempts to break the flow.
System Response:
- Detects off-topic or invalid inputs
- Attempts correction through clarifying questions
- Applies safety filters
- Gracefully handles unexpected formats

## Deployment Guide

To deploy on Vercel:
1. Push your repository to GitHub
2. Import the project to Vercel
3. Add environment variables
4. Upload the service account JSON
5. Build and deploy

## Future Enhancements

- Add Speech-to-Text voice input
- Add multi-round interview modes (HR, Technical, System Design)
- Build analytics dashboard for visualizing performance metrics
- Add authentication and user progress tracking
- Incorporate resume analysis and job-fit scoring

## Credits

Built using:
- Next.js
- ShadCN UI
- Tailwind CSS
- Genkit
- Google Gemini
- Google Text-to-Speech
