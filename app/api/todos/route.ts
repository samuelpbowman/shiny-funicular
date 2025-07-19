import { NextRequest, NextResponse } from "next/server";
import { createTodo, listTodos } from "@/lib/todoStore";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const all = await listTodos(user.id);
    return NextResponse.json(all);
  } catch (error) {
    console.error("[API_TODOS_GET]", error);
    return NextResponse.json({ error: "Failed to fetch todos." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { text, task, isPublic } = await req.json();
    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "`text` is required" }, { status: 400 });
    }
    const todo = await createTodo(text, user.id, task, isPublic || false);
    return NextResponse.json(todo, { status: 201 });
  } catch (error) {
    console.error("[API_TODOS_POST]", error);
    return NextResponse.json({ error: "Failed to create todo." }, { status: 500 });
  }
}
