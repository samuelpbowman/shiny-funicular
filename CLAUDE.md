# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 TODO application with AI chat functionality. It combines a traditional web dashboard with an AI-powered chat interface for managing todos. The application uses Prisma with MySQL for data persistence and OpenAI's GPT-4o-mini for the chat assistant.

## Development Commands

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production application
- `npm run start` - Start production server  
- `npm run lint` - Run ESLint

## Architecture

### Frontend Structure
- **App Router**: Uses Next.js 15 App Router with TypeScript
- **Pages**: 
  - `/` - Landing page with navigation to dashboard and chat
  - `/dashboard` - Direct TODO management interface
  - `/chat` - AI-powered chat interface for TODO management
- **Components**: Shared components in `app/components/`
- **Styling**: CSS Modules with global styles, uses Inter and Lora fonts

### Backend Structure
- **API Routes**: 
  - `/api/chat` - OpenAI chat completion with function calling for TODO operations
  - `/api/todos` - RESTful CRUD operations for todos
- **Database**: 
  - Prisma ORM with MySQL
  - Schema: `Todo` model with id, text, completed, createdAt fields
- **Data Layer**: `lib/todoStore.ts` provides abstraction over Prisma operations

### AI Integration
The chat interface uses OpenAI function calling to execute TODO operations. The AI assistant can:
- Create single todos (`createTodo`)
- Create multiple todos at once (`createManyTodos`) 
- List all todos (`listTodos`)
- Update todo text/completion (`updateTodo`)
- Delete todos (`deleteTodo`)

## Database Setup

Requires `DATABASE_URL` environment variable for MySQL connection. Run `npx prisma migrate dev` to apply migrations and `npx prisma generate` to update the client after schema changes.

## Environment Variables

- `DATABASE_URL` - MySQL connection string
- `OPENAI_API_KEY` - OpenAI API key for chat functionality