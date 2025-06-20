import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import {
  createManyTodos,
  createTodo,
  deleteTodo,
  listTodos,
  updateTodo,
} from "@/lib/todoStore";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const systemPrompt = `
You are a helpful TODO list assistant. Your goal is to help the user manage their TODO list.

When a user asks for something that involves multiple steps, like planning a dinner or a trip, break it down into a list of TODO items and use the 'createManyTodos' tool to add them all at once.

For single tasks, use the 'createTodo' tool.

When you confirm that multiple TODOs have been created, DO NOT list each item individually—just state how many were added.

Always confirm with the user after you have taken an action.

If you are not sure what to do, ask for clarification.

Format your responses using markdown when appropriate:
- Use **bold** for emphasis on important information
- Use *italics* for subtle emphasis
- Use \`code\` formatting for TODO item names or technical terms
- Use bullet points or numbered lists when presenting multiple items
- Use headers (## or ###) to organize longer responses
- Use code blocks for any code examples or structured data
`.trim();

const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "createTodo",
      description: "Create a single new TODO item",
      parameters: {
        type: "object",
        properties: {
          text: { type: "string", description: "The content of the todo item" },
          task: { type: "string", description: "The task group/category for this todo item" },
        },
        required: ["text"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "createManyTodos",
      description: "Create multiple TODO items from a list of strings",
      parameters: {
        type: "object",
        properties: {
          texts: {
            type: "array",
            items: { type: "string" },
            description: "The content of each todo item",
          },
          task: { type: "string", description: "The task group/category for these todo items" },
        },
        required: ["texts"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "listTodos",
      description: "List all TODOs",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "updateTodo",
      description: "Update a TODO's completion state or text",
      parameters: {
        type: "object",
        properties: {
          id: { type: "string" },
          text: { type: "string" },
          completed: { type: "boolean" },
        },
        required: ["id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "deleteTodo",
      description: "Delete a TODO",
      parameters: {
        type: "object",
        properties: {
          id: { type: "string" },
        },
        required: ["id"],
      },
    },
  },
];

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  const initialMessages = [
    { role: "system", content: systemPrompt },
    ...messages,
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: initialMessages,
    tools: tools,
    tool_choice: "auto",
  });

  const responseMessage = response.choices[0].message;
  const toolCalls = responseMessage.tool_calls;

  if (toolCalls) {
    const toolMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];
    for (const toolCall of toolCalls) {
      const functionName = toolCall.function.name;
      const functionArgs = JSON.parse(toolCall.function.arguments);
      let functionResponse;

      console.log("Calling tool:", functionName, functionArgs);

      switch (functionName) {
        case "createTodo":
          functionResponse = await createTodo(functionArgs.text, functionArgs.task);
          break;
        case "createManyTodos":
          functionResponse = await createManyTodos(functionArgs.texts, functionArgs.task);
          break;
        case "listTodos":
          functionResponse = await listTodos();
          break;
        case "updateTodo":
          functionResponse = await updateTodo(functionArgs.id, functionArgs);
          break;
        case "deleteTodo":
          functionResponse = await deleteTodo(functionArgs.id);
          break;
        default:
          functionResponse = { error: `Unknown tool: ${functionName}` };
      }

      toolMessages.push({
        tool_call_id: toolCall.id,
        role: "tool",
        content: JSON.stringify(functionResponse),
      });
    }

    const secondResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [...initialMessages, responseMessage, ...toolMessages],
    });

    return NextResponse.json({ reply: secondResponse.choices[0].message });
  }

  return NextResponse.json({ reply: responseMessage });
}
