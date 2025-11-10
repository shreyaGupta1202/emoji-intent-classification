"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import createSupabaseServerActionClient from "@/lib/supabase/actions";
import { AGENT1_SYSTEM_PROMPT } from "@/lib/agents/agent1_system_prompt";
import { AGENT2_SYSTEM_PROMPT } from "@/lib/agents/agent2_system_prompt"; // Import Agent 2 prompt

// Helper function to recursively extract all messages from a conversation thread
function extractAllMessages(
  conversationThread: any[] // eslint-disable-line @typescript-eslint/no-explicit-any
): { id: string; author: string; message: string }[] {
  let allMessages: { id: string; author: string; message: string }[] = []; // eslint-disable-line

  // eslint-disable-next-line
  function traverse(messages: any[]) {
    for (const msg of messages) {
      allMessages.push({
        id: msg.id,
        author: msg.author,
        message: msg.message,
      });
      if (msg.replies && msg.replies.length > 0) {
        traverse(msg.replies);
      }
    }
  }

  traverse(conversationThread);
  return allMessages;
}

// eslint-disable-next-line
export async function classifyConversation(inputConversation: any) {
  const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
  if (!GOOGLE_API_KEY) {
    throw new Error("GOOGLE_API_KEY is not set in environment variables.");
  }

  const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // Using gemini-pro for more complex tasks

  // Agent 1 Chat
  const chatAgent1 = model.startChat({
    history: [
      {
        role: "user",
        parts: [{ text: AGENT1_SYSTEM_PROMPT }],
      },
      {
        role: "model",
        parts: [
          {
            text: "Okay, I understand. I will process the conversation threads and return the keywords in the specified JSON format.",
          },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  // Agent 2 Chat
  const chatAgent2 = model.startChat({
    history: [
      {
        role: "user",
        parts: [{ text: AGENT2_SYSTEM_PROMPT }],
      },
      {
        role: "model",
        parts: [
          {
            text: "Okay, I understand. I will process the list of messages with their keywords and return the severity analysis for each in the specified JSON array format.",
          },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  try {
    // --- Agent 1: Keyword Extraction ---
    console.log("Agent 1: Starting keyword extraction...");
    const promptAgent1 = JSON.stringify(inputConversation, null, 2);
    const resultAgent1 = await chatAgent1.sendMessage(promptAgent1);
    const responseTextAgent1 = resultAgent1.response.text();
    const keywordsOutput = JSON.parse(responseTextAgent1);
    console.log(
      "Agent 1 Output (Keywords):",
      JSON.stringify(keywordsOutput, null, 2)
    );

    // --- Agent 2: Severity Scoring (Batch Processing) ---
    console.log("Agent 2: Starting batch severity scoring...");
    const allMessages = extractAllMessages(inputConversation.conversation);
    // eslint-disable-next-line
    const agent2BatchInput = allMessages.map((msg: any) => {
      const correspondingKeywords = keywordsOutput.find(
        (k: any) => k.id === msg.id // eslint-disable-line
      );
      return {
        id: msg.id,
        author: msg.author,
        message: msg.message,
        keywords: correspondingKeywords ? correspondingKeywords.keywords : [],
      };
    });

    const promptAgent2 = JSON.stringify(agent2BatchInput, null, 2);
    const resultAgent2 = await chatAgent2.sendMessage(promptAgent2);
    const responseTextAgent2 = resultAgent2.response.text();
    // Remove '+' signs before numbers to fix invalid JSON from LLM
    const cleanedResponseTextAgent2 = responseTextAgent2.replace(
      /:\s*\+(\d+)/g,
      ": $1"
    );
    const severityOutput = JSON.parse(cleanedResponseTextAgent2);
    console.log(
      "Agent 2 Output (Severity - Batch):",
      JSON.stringify(severityOutput, null, 2)
    );

    const finalResult = {
      conversation: inputConversation,
      keywords: keywordsOutput,
      severity: severityOutput,
    };

    const supabase = await createSupabaseServerActionClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user || !user.email) {
      console.error("User not authenticated or email not found:", userError);
      // For now, we'll proceed without saving to DB if user is not authenticated
    } else {
      const { error: insertError } = await supabase
        .from("classification_history")
        .insert({
          user_email: user.email,
          input_chat: inputConversation,
          output_analysis: finalResult,
        });

      if (insertError) {
        console.error("Error saving classification history:", insertError);
      }
    }

    return finalResult;
  } catch (e) {
    console.error("Error during LLM call or parsing:", e);
    throw new Error("Failed to classify conversation.");
  }
}
