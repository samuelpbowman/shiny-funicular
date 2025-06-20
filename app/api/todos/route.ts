import { NextRequest, NextResponse } from "next/server";
import { createTodo, listTodos } from "@/lib/todoStore";

export async function GET() {
  try {
    const all = await listTodos();
    return NextResponse.json(all);
  } catch (error) {
    console.error("[API_TODOS_GET]", error);
    return NextResponse.json({ error: "Failed to fetch todos." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { text, task } = await req.json();
    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "`text` is required" }, { status: 400 });
    }
    const todo = await createTodo(text, task);
    return NextResponse.json(todo, { status: 201 });
  } catch (error) {
    console.error("[API_TODOS_POST]", error);
    return NextResponse.json({ error: "Failed to create todo." }, { status: 500 });
  }
}
