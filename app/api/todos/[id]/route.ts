import { NextRequest, NextResponse } from "next/server";
import { deleteTodo, getTodo, updateTodo } from "@/lib/todoStore";
import { createClient } from "@/lib/supabase/server";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const todo = await getTodo(id, user.id);
    if (!todo) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(todo);
  } catch (error) {
    console.error(`[API_TODOS_GET] ${id}`, error);
    return NextResponse.json({ error: "Failed to fetch todo." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const updates = await req.json();
    const todo = await updateTodo(id, user.id, updates);
    if (!todo) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(todo);
  } catch (error) {
    console.error(`[API_TODOS_PUT] ${id}`, error);
    return NextResponse.json({ error: "Failed to update todo." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const todo = await deleteTodo(id, user.id);
    if (!todo) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(todo);
  } catch (error) {
    console.error(`[API_TODOS_DELETE] ${id}`, error);
    return NextResponse.json({ error: "Failed to delete todo." }, { status: 500 });
  }
}
