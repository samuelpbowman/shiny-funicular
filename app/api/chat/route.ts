import { NextRequest } from "next/server";
import OpenAI from "openai";
import {
  createManyTodos,
  createTodo,
  deleteTodo,
  listTodos,
  updateTodo,
} from "@/lib/todoStore";
import { createClient } from "@/lib/supabase/server";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const systemPrompt = `
You are a helpful TODO list assistant for a social todo platform. Your goal is to help the user manage their TODO list and understand social features.

**Social Features Available:**
- Users can make todos public to share with followers
- Users can follow other users to see their public todos in their feed
- Users have profiles with usernames, display names, and bios

**Creating Todos:**
- When a user asks for something that involves multiple steps, like planning a dinner or a trip, break it down into a list of TODO items and use the 'createManyTodos' tool to add them all at once.
- For single tasks, use the 'createTodo' tool.
- Ask if they want to make todos public when appropriate
- When you confirm that multiple TODOs have been created, DO NOT list each item individually—just state how many were added.

**Social Commands:**
- When users ask about following someone, direct them to search for users or visit profiles
- When users ask about their feed, explain they can see public todos from people they follow
- Suggest making todos public when they might want to share progress or inspiration

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
          isPublic: { type: "boolean", description: "Whether this todo should be public (visible to followers)" },
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
          isPublic: { type: "boolean", description: "Whether these todos should be public (visible to followers)" },
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

  // Get user from session
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { 
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }

  const initialMessages = [
    { role: "system", content: systemPrompt },
    ...messages,
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: initialMessages,
    tools: tools,
    tool_choice: "auto",
    stream: true,
  }, {
    signal: req.signal,
  });

  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      const responseMessage: { role: string; content: string; tool_calls?: OpenAI.Chat.Completions.ChatCompletionMessageToolCall[] } = { role: "assistant", content: "" };
      const toolCalls: OpenAI.Chat.Completions.ChatCompletionMessageToolCall[] = [];
      
      // Check if request was aborted
      const checkAborted = () => {
        if (req.signal?.aborted) {
          controller.close();
          return true;
        }
        return false;
      };
      
      try {
        for await (const chunk of response) {
          if (checkAborted()) break;
          
          const delta = chunk.choices[0]?.delta;
          
          if (delta?.content) {
            responseMessage.content += delta.content;
            if (!checkAborted()) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: delta.content })}\n\n`));
            }
          }
          
          if (delta?.tool_calls) {
            for (const toolCall of delta.tool_calls) {
              if (toolCall.index !== undefined && !toolCalls[toolCall.index]) {
                toolCalls[toolCall.index] = {
                  id: toolCall.id || "",
                  type: "function",
                  function: { name: toolCall.function?.name || "", arguments: "" }
                };
              }
              if (toolCall.index !== undefined && toolCall.function?.arguments) {
                toolCalls[toolCall.index].function.arguments += toolCall.function.arguments;
              }
            }
          }
          
          if (chunk.choices[0]?.finish_reason === "tool_calls") {
            responseMessage.tool_calls = toolCalls.filter(Boolean);
            
            // Process tool calls
            const toolMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];
            for (const toolCall of responseMessage.tool_calls) {
              const functionName = toolCall.function.name;
              const functionArgs = JSON.parse(toolCall.function.arguments);
              let functionResponse;

              console.log("Calling tool:", functionName, functionArgs);

              switch (functionName) {
                case "createTodo":
                  functionResponse = await createTodo(functionArgs.text, user.id, functionArgs.task, functionArgs.isPublic);
                  break;
                case "createManyTodos":
                  functionResponse = await createManyTodos(functionArgs.texts, user.id, functionArgs.task, functionArgs.isPublic);
                  break;
                case "listTodos":
                  functionResponse = await listTodos(user.id);
                  break;
                case "updateTodo":
                  functionResponse = await updateTodo(functionArgs.id, user.id, functionArgs);
                  break;
                case "deleteTodo":
                  functionResponse = await deleteTodo(functionArgs.id, user.id);
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

            // Get final response after tool calls
            const secondResponse = await openai.chat.completions.create({
              model: "gpt-4o-mini",
              messages: [...initialMessages, responseMessage, ...toolMessages],
              stream: true,
            }, {
              signal: req.signal,
            });

            const finalResponse = { role: "assistant", content: "" };
            for await (const chunk of secondResponse) {
              if (checkAborted()) break;
              
              const delta = chunk.choices[0]?.delta;
              if (delta?.content) {
                finalResponse.content += delta.content;
                if (!checkAborted()) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: delta.content })}\n\n`));
                }
              }
            }

          }
        }
        
        
      } catch (error) {
        console.error("Streaming error:", error);
        if (!checkAborted()) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: "Stream failed" })}\n\n`));
        }
      } finally {
        if (!checkAborted()) {
          controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
          controller.close();
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
