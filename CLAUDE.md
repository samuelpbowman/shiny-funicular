# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 social TODO application with AI chat functionality. It combines a traditional web dashboard with an AI-powered chat interface and social features for managing and sharing todos. Users can follow each other and see public todos in a Twitter-like feed. The application uses Supabase for data persistence and authentication, and OpenAI's GPT-4o-mini for the chat assistant.

## Development Commands

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production application
- `npm run start` - Start production server  
- `npm run lint` - Run ESLint

## Architecture

### Frontend Structure
- **App Router**: Uses Next.js 15 App Router with TypeScript
- **Pages**: 
  - `/` - Landing page with navigation to dashboard, feed, and chat
  - `/dashboard` - Direct TODO management interface with public/private toggle
  - `/feed` - Social feed showing public todos from followed users and discover tab
  - `/chat` - AI-powered chat interface for TODO management with social awareness
  - `/profile/[username]` - User profile pages showing public todos and follow/unfollow
  - `/search` - Search for users by username or display name
- **Components**: Shared components in `app/components/`
- **Styling**: CSS Modules with global styles, uses Inter and Lora fonts

### Backend Structure
- **API Routes**: 
  - `/api/chat` - OpenAI chat completion with function calling for TODO operations and social awareness
  - `/api/todos` - RESTful CRUD operations for todos with public/private support
  - `/api/profiles` - User profile management and search
  - `/api/follow` - Follow/unfollow functionality 
  - `/api/feed` - Social feed for public todos from followed users
- **Database**: 
  - Supabase PostgreSQL database
  - Schema: 
    - `todos` table with id, text, task, completed, created_at, user_id, is_public fields
    - `profiles` table with id, username, display_name, bio, avatar_url, created_at, updated_at fields
    - `follows` table with id, follower_id, following_id, created_at fields
  - Authentication: Supabase Auth for user management
- **Data Layer**: 
  - `lib/todoStore.ts` provides abstraction over Supabase todo operations
  - `lib/profileStore.ts` provides abstraction over Supabase profile and social operations

### AI Integration
The chat interface uses OpenAI function calling to execute TODO operations with social awareness. The AI assistant can:
- Create single todos (`createTodo`) with optional public visibility
- Create multiple todos at once (`createManyTodos`) with optional public visibility
- List all todos (`listTodos`)
- Update todo text/completion (`updateTodo`)
- Delete todos (`deleteTodo`)
- Provide guidance on social features like following users and viewing feeds

### Social Features
- **User Profiles**: Users have profiles with username, display name, bio, and avatar
- **Following System**: Users can follow/unfollow each other
- **Public Todos**: Todos can be marked as public to share with followers
- **Social Feed**: Twitter-like feed showing public todos from followed users
- **Discovery**: Public timeline to discover new users and their todos
- **Search**: Find users by username or display name

## Database Setup

Uses Supabase for database and authentication. The application connects to Supabase using the JavaScript client library.

## Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `OPENAI_API_KEY` - OpenAI API key for chat functionality