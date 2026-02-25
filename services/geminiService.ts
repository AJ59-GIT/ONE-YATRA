
import { RouteResponse, SearchParams, ChatMessage } from "../types";

export const fetchTravelOptions = async (
  params: SearchParams
): Promise<RouteResponse> => {
  try {
    const response = await fetch('/api/travel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch travel options');
    }
    
    return await response.json();
  } catch (error) {
    console.error("Client fetchTravelOptions Error:", error);
    throw error;
  }
};

export const chatWithAI = async (message: string, history: ChatMessage[] = []): Promise<string> => {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to chat with AI');
    }
    
    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error("Client chatWithAI Error:", error);
    return "I'm having a bit of trouble connecting to the server. Please try again.";
  }
};
