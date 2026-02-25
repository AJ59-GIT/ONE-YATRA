
import { GoogleGenAI, Type } from "@google/genai";
import { RouteResponse, SearchParams, TravelOption, ChatMessage } from "../types.ts";
import { calculateCabPrice, parseDistanceToKm, parseDurationToMins, predictPriceTrend } from "./pricingService.ts";
import { generateDeepLink } from "./deepLinkService.ts";

// Helper for exponential backoff retry
const withRetry = async <T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> => {
  try {
    return await fn();
  } catch (error: any) {
    if (retries > 0 && (error.status === 429 || error.message?.includes('429') || error.message?.includes('quota'))) {
      console.warn(`Gemini API rate limited. Retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
};

export const fetchTravelOptionsInternal = async (
  params: SearchParams
): Promise<RouteResponse> => {
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    console.warn("No API_KEY found. Returning mock data.");
    return mockTravelData(params);
  }

  const ai = new GoogleGenAI({ apiKey });

  let promptContext = "";
  if (params.tripType === 'MULTI_CITY' && params.segments.length > 0) {
    promptContext = `
      Multi-City Trip Request:
      ${(params.segments || []).map((seg, i) => `Segment ${i+1}: From "${seg.origin}" to "${seg.destination}" on ${seg.date} after ${seg.time}`).join('\n')}
      
      Provide a unified itinerary. 'mode' can be 'MIXED' if different modes are used for segments.
      Include a 'legs' array in the response options detailing each segment.
    `;
  } else if (params.tripType === 'ROUND_TRIP') {
    promptContext = `
      Round Trip Request:
      Outbound: From "${params.origin}" to "${params.destination}" on ${params.date} after ${params.time}.
      Return: From "${params.destination}" to "${params.origin}" on ${params.returnDate} after ${params.returnTime || '09:00'}.
      
      Provide two lists of options: 'options' for outbound and 'returnOptions' for the return journey.
    `;
  } else {
    promptContext = `
      Single Trip Request: From "${params.origin}" to "${params.destination}" on ${params.date} after ${params.time}.
    `;
  }

  const prompt = `
    Act as a Travel Search Engine. Generate realistic travel options for the following request:
    ${promptContext}
    
    Passengers: ${params.passengers} (Prices must be TOTAL for all passengers)
    
    Modes to include: You MUST provide a diverse mix of CAB, BUS, TRAIN, and FLIGHT options. Do not just provide one mode.
    
    For each option:
    1. 'distance': Estimate precise road/track distance.
    2. 'ecoScore': (0-100).
    3. 'carbonEmission': Estimate CO2 in kg.
    4. 'price': Total price in INR.
    5. 'tag': 'Cheapest', 'Fastest', 'Best Value', 'Eco-Choice'.
    
    Provide a short 'aiInsight' comparing the options.
    Limit the response to a maximum of 3-4 high-quality options per journey to ensure a concise and valid JSON response.
  `;

  try {
    const response = await withRetry(() => ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are a world-class travel expert for the Indian market. You provide precise, realistic travel options across Cabs, Buses, Trains, and Flights. You MUST always return a variety of transport modes (at least one of each: CAB, BUS, TRAIN, FLIGHT) whenever possible for the given route. You understand Indian geography, typical travel times, and pricing nuances. Keep the JSON response concise.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            origin: { type: Type.STRING },
            destination: { type: Type.STRING },
            date: { type: Type.STRING },
            returnDate: { type: Type.STRING, nullable: true },
            aiInsight: { type: Type.STRING },
            options: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  mode: { type: Type.STRING, enum: ['CAB', 'BUS', 'TRAIN', 'FLIGHT', 'MIXED'] },
                  provider: { type: Type.STRING },
                  departureTime: { type: Type.STRING },
                  arrivalTime: { type: Type.STRING },
                  duration: { type: Type.STRING },
                  distance: { type: Type.STRING },
                  price: { type: Type.NUMBER },
                  currency: { type: Type.STRING },
                  rating: { type: Type.NUMBER },
                  carbonEmission: { type: Type.STRING },
                  ecoScore: { type: Type.NUMBER },
                  deepLink: { type: Type.STRING },
                  features: { type: Type.ARRAY, items: { type: Type.STRING } },
                  tag: { type: Type.STRING, nullable: true },
                  legs: {
                    type: Type.ARRAY,
                    items: {
                       type: Type.OBJECT,
                       properties: {
                         id: { type: Type.STRING },
                         mode: { type: Type.STRING },
                         provider: { type: Type.STRING },
                         departureTime: { type: Type.STRING },
                         arrivalTime: { type: Type.STRING },
                         duration: { type: Type.STRING },
                         price: { type: Type.NUMBER },
                         distance: { type: Type.STRING },
                         currency: { type: Type.STRING },
                         ecoScore: { type: Type.NUMBER },
                         features: { type: Type.ARRAY, items: { type: Type.STRING } }
                       }
                    }
                  }
                },
                required: ['id', 'mode', 'provider', 'price', 'duration', 'ecoScore'],
              },
            },
            returnOptions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  mode: { type: Type.STRING, enum: ['CAB', 'BUS', 'TRAIN', 'FLIGHT', 'MIXED'] },
                  provider: { type: Type.STRING },
                  departureTime: { type: Type.STRING },
                  arrivalTime: { type: Type.STRING },
                  duration: { type: Type.STRING },
                  distance: { type: Type.STRING },
                  price: { type: Type.NUMBER },
                  currency: { type: Type.STRING },
                  rating: { type: Type.NUMBER },
                  carbonEmission: { type: Type.STRING },
                  ecoScore: { type: Type.NUMBER },
                  deepLink: { type: Type.STRING },
                  features: { type: Type.ARRAY, items: { type: Type.STRING } },
                  tag: { type: Type.STRING, nullable: true },
                  legs: {
                    type: Type.ARRAY,
                    items: {
                       type: Type.OBJECT,
                       properties: {
                         id: { type: Type.STRING },
                         mode: { type: Type.STRING },
                         provider: { type: Type.STRING },
                         departureTime: { type: Type.STRING },
                         arrivalTime: { type: Type.STRING },
                         duration: { type: Type.STRING },
                         price: { type: Type.NUMBER },
                         distance: { type: Type.STRING },
                         currency: { type: Type.STRING },
                         ecoScore: { type: Type.NUMBER },
                         features: { type: Type.ARRAY, items: { type: Type.STRING } }
                       }
                    }
                  }
                },
                required: ['id', 'mode', 'provider', 'price', 'duration', 'ecoScore'],
              }
            }
          },
        },
      },
    }));

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    let result: RouteResponse;
    try {
      result = JSON.parse(text) as RouteResponse;
    } catch (parseError) {
      console.error("Failed to parse AI JSON response:", parseError);
      return mockTravelData(params);
    }

    if (result.options && Array.isArray(result.options)) {
      result.options = result.options.map(opt => processOption(opt, params.origin, params.time, params.destination));
    } else {
      result.options = [];
    }

    if (result.returnOptions && Array.isArray(result.returnOptions)) {
        result.returnOptions = result.returnOptions.map(opt => processOption(opt, params.destination, params.returnTime || '09:00', params.origin));
    }

    return result;

  } catch (error: any) {
    if (error.status === 429 || error.message?.includes('429') || error.message?.includes('quota')) {
      console.error("Gemini API Quota Exhausted. Falling back to mock data.");
    } else {
      console.error("Gemini API Error:", error);
    }
    return mockTravelData(params);
  }
};

export const chatWithAIInternal = async (message: string, history: ChatMessage[] = []): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return "I'm in offline mode right now. How can I help you with your travel plans?";

  const ai = new GoogleGenAI({ apiKey });
  const chat = ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: "You are YatraBot, the AI assistant for OneYatra, India's MaaS Super App. You help users find travel options, explain refund policies, and provide travel tips. Keep responses concise and helpful. If asked for routes, suggest they use the main search bar for precise real-time data, but you can give general advice.",
    }
  });

  try {
    const response = await withRetry(() => chat.sendMessage({ message }));
    return response.text || "I'm sorry, I couldn't process that. Could you try again?";
  } catch (error: any) {
    if (error.status === 429 || error.message?.includes('429') || error.message?.includes('quota')) {
      console.error("Gemini API Quota Exhausted in Chat.");
      return "I'm currently receiving too many requests. Please try again in a minute, or use the search bar for travel options!";
    }
    console.error("Chat AI Error:", error);
    return "I'm having a bit of trouble connecting. Please try again in a moment.";
  }
};

const processOption = (opt: TravelOption, origin: string, time: string, destination: string): TravelOption => {
  let updatedOpt = { ...opt };
  
  if (Array.isArray(updatedOpt.legs) && updatedOpt.legs.length > 0) {
      updatedOpt.legs = updatedOpt.legs.map((leg) => {
         return processOption(leg, origin, time, destination);
      });
  }

  if (updatedOpt.mode === 'CAB' && updatedOpt.distance) {
    const km = parseDistanceToKm(updatedOpt.distance);
    const mins = parseDurationToMins(updatedOpt.duration);
    const estimate = calculateCabPrice(km, mins, origin, time);
    
    updatedOpt = {
      ...updatedOpt,
      price: estimate.price,
      surgeMultiplier: estimate.surge,
      features: [...(opt.features || []), estimate.surge > 1 ? `Surge ${estimate.surge}x` : 'Standard Rate']
    };
  }

  const linkData = generateDeepLink(updatedOpt.provider, updatedOpt.mode, origin, destination);
  updatedOpt.deepLink = linkData.url;
  updatedOpt.deepLinkFallback = linkData.fallbackUrl;
  updatedOpt.androidIntent = linkData.androidIntent;

  updatedOpt.priceTrend = predictPriceTrend(updatedOpt.mode);

  if (updatedOpt.mode === 'CAB') {
    const mins = Math.floor(Math.random() * 10) + 2;
    updatedOpt.realTimeStatus = `Driver arriving in ${mins} mins`;
  } else if (updatedOpt.mode === 'BUS') {
    const status = Math.random() > 0.5 ? 'On Time' : '5 mins delayed';
    updatedOpt.realTimeStatus = `Live: ${status}`;
  } else if (updatedOpt.mode === 'TRAIN') {
    updatedOpt.realTimeStatus = 'Live: Running on time';
  }

  return updatedOpt;
};

const mockTravelData = (params: SearchParams): RouteResponse => {
  const options: TravelOption[] = [
    {
      id: "m1",
      mode: "FLIGHT",
      provider: "IndiGo",
      departureTime: "10:00 AM",
      arrivalTime: "12:00 PM",
      duration: "2h 00m",
      distance: "1100 km",
      price: 4500 * params.passengers,
      currency: "INR",
      rating: 4.2,
      features: ["Non-stop", "Saver"],
      tag: "Fastest",
      carbonEmission: `${80 * params.passengers} kg`,
      ecoScore: 40
    },
    {
      id: "m2",
      mode: "TRAIN",
      provider: "Vande Bharat Express",
      departureTime: "06:00 AM",
      arrivalTime: "02:00 PM",
      duration: "8h 00m",
      distance: "500 km",
      price: 1800 * params.passengers,
      currency: "INR",
      rating: 4.8,
      features: ["AC Chair Car", "Meals Included"],
      tag: "Best Value",
      carbonEmission: `${15 * params.passengers} kg`,
      ecoScore: 85
    },
    {
      id: "m3",
      mode: "BUS",
      provider: "ZingBus",
      departureTime: "09:00 PM",
      arrivalTime: "07:00 AM",
      duration: "10h 00m",
      distance: "500 km",
      price: 1200 * params.passengers,
      currency: "INR",
      rating: 4.0,
      features: ["AC Sleeper", "Water Bottle"],
      tag: "Cheapest",
      carbonEmission: `${25 * params.passengers} kg`,
      ecoScore: 70
    },
    {
      id: "m4",
      mode: "CAB",
      provider: "Uber Intercity",
      departureTime: "Flexible",
      arrivalTime: "Flexible",
      duration: "7h 30m",
      distance: "500 km",
      price: 8500,
      currency: "INR",
      rating: 4.5,
      features: ["Door-to-Door", "Private"],
      tag: "Eco-Choice",
      carbonEmission: `${120 * params.passengers} kg`,
      ecoScore: 30
    }
  ];

  const returnOptions: TravelOption[] = [
     {
      id: "mr1",
      mode: "FLIGHT",
      provider: "Vistara",
      departureTime: "06:00 PM",
      arrivalTime: "08:00 PM",
      duration: "2h 00m",
      distance: "1100 km",
      price: 4800 * params.passengers,
      currency: "INR",
      rating: 4.5,
      features: ["Non-stop", "Flexi"],
      tag: "Best Value",
      carbonEmission: `${80 * params.passengers} kg`,
      ecoScore: 40
    },
    {
      id: "mr2",
      mode: "TRAIN",
      provider: "Shatabdi Express",
      departureTime: "04:00 PM",
      arrivalTime: "10:30 PM",
      duration: "6h 30m",
      distance: "500 km",
      price: 1500 * params.passengers,
      currency: "INR",
      rating: 4.6,
      features: ["Executive Class", "Fastest Train"],
      tag: "Fastest",
      carbonEmission: `${15 * params.passengers} kg`,
      ecoScore: 85
    }
  ];

  return {
    origin: params.origin,
    destination: params.destination,
    date: params.date,
    returnDate: params.returnDate,
    aiInsight: `Mock Data: Traveling with ${params.passengers} people.`,
    options: options.map(opt => processOption(opt, params.origin, params.time, params.destination)),
    returnOptions: params.tripType === 'ROUND_TRIP' ? returnOptions.map(opt => processOption(opt, params.destination, params.returnTime || '09:00', params.origin)) : undefined
  };
};
