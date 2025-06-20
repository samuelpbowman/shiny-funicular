import { NextRequest, NextResponse } from "next/server";
import { deleteTodo, getTodo, updateTodo } from "@/lib/todoStore";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  try {
    const todo = await getTodo(id);
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
    const updates = await req.json();
    const todo = await updateTodo(id, updates);
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
    const todo = await deleteTodo(id);
    if (!todo) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(todo);
  } catch (error) {
    console.error(`[API_TODOS_DELETE] ${id}`, error);
    return NextResponse.json({ error: "Failed to delete todo." }, { status: 500 });
  }
}
