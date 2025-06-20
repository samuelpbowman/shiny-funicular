import { prisma } from "@/lib/prisma";
import { Todo } from "@prisma/client";


export async function listTodos() {
  return prisma.todo.findMany({ orderBy: { createdAt: "asc" } });
}

export async function getTodo(id: string) {
  return prisma.todo.findUnique({ where: { id } });
}

export async function createTodo(text: string, task?: string) {
  return prisma.todo.create({ data: { text, task } });
}

export async function createManyTodos(texts: string[], task?: string) {
  return prisma.todo.createMany({
    data: texts.map((text) => ({ text, task })),
  });
}

export async function updateTodo(
  id: string,
  updates: Partial<Omit<Todo, "id">>
) {
  try {
    return await prisma.todo.update({ where: { id }, data: updates });
  } catch {
    return undefined;
  }
}

export async function deleteTodo(id: string) {
  try {
    return await prisma.todo.delete({ where: { id } });
  } catch {
    return undefined;
  }
}
