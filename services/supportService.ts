
import { SupportTicket, TicketMessage } from "../types";

const SUPPORT_STORAGE_KEY = 'oneyatra_support_tickets';

export const FAQ_DATA = [
  {
    category: 'Bookings',
    items: [
      { q: 'How do I cancel my booking?', a: 'Go to "My Trips", select the trip, and click "Cancel Booking". Cancellation fees depend on the provider policy.' },
      { q: 'Can I change my seat after booking?', a: 'Seat changes are subject to availability. Please contact the provider directly with your PNR.' },
      { q: 'Where can I find my PNR?', a: 'Your PNR is available on the ticket sent to your email and in the "My Trips" section.' }
    ]
  },
  {
    category: 'Refunds & Payments',
    items: [
      { q: 'When will I get my refund?', a: 'Refunds to OneYatra Wallet are instant. Bank refunds take 5-7 business days.' },
      { q: 'Payment failed but money deducted', a: 'The amount will be auto-refunded to your source account within 48 hours. If not, raise a ticket.' },
      { q: 'Do you accept UPI?', a: 'Yes, we support all major UPI apps including GPay, PhonePe, and Paytm.' }
    ]
  },
  {
    category: 'Account',
    items: [
      { q: 'How do I reset my password?', a: 'Go to Profile > Security > Change Password. If logged out, use "Forgot Password" on the login screen.' },
      { q: 'How do I add a co-traveler?', a: 'You can save traveler details in Profile > Co-Travelers for faster checkout.' }
    ]
  }
];

export const getTickets = (): SupportTicket[] => {
  try {
    const data = localStorage.getItem(SUPPORT_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

// Define internal helper before it is used
const simulateAgentResponse = (ticketId: string, userText: string) => {
    setTimeout(() => {
        let response = "I understand. Could you please provide more details?";
        const lower = userText.toLowerCase();
        
        if (lower.includes("refund")) response = "I've checked the status. The refund has been initiated and should reflect in your wallet within 2 hours.";
        else if (lower.includes("cancel")) response = "To process the cancellation, please confirm the PNR number.";
        else if (lower.includes("urgent")) response = "I see this is urgent. I am escalating this to our priority team immediately.";
        else if (lower.includes("thank")) response = "You're welcome! Is there anything else I can help you with today?";

        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        addMessage(ticketId, 'AGENT', response);
        
    }, 3500); // 3.5s delay
};

export const addMessage = (ticketId: string, sender: 'USER' | 'AGENT' | 'SYSTEM', text: string, attachments: string[] = []) => {
  const tickets = getTickets();
  const ticketIndex = tickets.findIndex(t => t.id === ticketId);
  
  if (ticketIndex === -1) return;

  const newMessage: TicketMessage = {
    id: `msg_${Date.now()}`,
    sender,
    text,
    timestamp: Date.now(),
    attachments
  };

  tickets[ticketIndex].messages.push(newMessage);
  tickets[ticketIndex].lastUpdated = Date.now();
  
  // If user replies, maybe change status back to IN_PROGRESS if it was waiting
  if (sender === 'USER' && tickets[ticketIndex].status === 'RESOLVED') {
      tickets[ticketIndex].status = 'IN_PROGRESS';
  }

  localStorage.setItem(SUPPORT_STORAGE_KEY, JSON.stringify(tickets));

  // Simluated Agent Response Logic
  if (sender === 'USER') {
      simulateAgentResponse(ticketId, text);
  }
};

export const createTicket = (category: SupportTicket['category'], subject: string, description: string, attachments: string[] = []): SupportTicket => {
  const tickets = getTickets();
  const newTicket: SupportTicket = {
    id: `TKT-${Date.now().toString().slice(-6)}`,
    category,
    subject,
    status: 'OPEN',
    priority: 'MEDIUM',
    createdAt: Date.now(),
    lastUpdated: Date.now(),
    messages: [
      {
        id: `msg_${Date.now()}`,
        sender: 'USER',
        text: description,
        timestamp: Date.now(),
        attachments
      }
    ]
  };
  
  localStorage.setItem(SUPPORT_STORAGE_KEY, JSON.stringify([newTicket, ...tickets]));
  
  // Simulate auto-reply
  setTimeout(() => {
    addMessage(newTicket.id, 'AGENT', `Hi! Thank you for contacting OneYatra Support. We have received your query regarding "${category}". An agent will review this shortly.`);
  }, 2000);

  return newTicket;
};

export const escalateTicket = (ticketId: string) => {
    const tickets = getTickets();
    const ticketIndex = tickets.findIndex(t => t.id === ticketId);
    if (ticketIndex === -1) return;

    tickets[ticketIndex].priority = 'HIGH';
    // Add system message
    const sysMsg: TicketMessage = {
        id: `sys_${Date.now()}`,
        sender: 'SYSTEM',
        text: 'This ticket has been ESCALATED to a Senior Support Executive.',
        timestamp: Date.now()
    };
    tickets[ticketIndex].messages.push(sysMsg);
    localStorage.setItem(SUPPORT_STORAGE_KEY, JSON.stringify(tickets));
};
