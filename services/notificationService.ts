
import { Booking, UserProfile, AppNotification, NotificationType } from "../types";

// Mock Email Service (Simulating EmailJS or SendGrid)
// In production, replace `console.log` with actual API calls.

const BRAND_COLOR = '#ea580c'; // OneYatra Orange
const NOTIFICATION_STORAGE_KEY = 'oneyatra_notifications';

// --- PUSH & APP NOTIFICATION SYSTEM ---

// Rate Limiting Store
const smsRateLimit = new Map<string, number>();
const RATE_LIMIT_WINDOW = 30000; // 30 seconds

export type SMSType = 'OTP' | 'TRANSACTIONAL' | 'PROMO' | 'ALERT';

const SMS_TEMPLATES = {
  OTP: (code: string) => `${code} is your OneYatra verification code. Valid for 10 mins. Do not share this with anyone.`,
  BOOKING: (pnr: string, from: string, to: string) => `OneYatra: Booking Confirmed! PNR: ${pnr}. Trip: ${from} to ${to}. View tkt: oneyatra.app/t/${pnr}`,
  CANCEL: (pnr: string, amount: number) => `OneYatra: Booking ${pnr} cancelled. Refund of ₹${amount} initiated to your wallet.`,
  REMINDER: (pnr: string, time: string) => `Reminder: Your trip (PNR ${pnr}) is scheduled for tomorrow at ${time}. Carry valid ID.`,
  GATE_CHANGE: (flight: string, gate: string) => `Alert: Gate change for flight ${flight}. Now boarding from Gate ${gate}.`,
  PROMO: (code: string, offer: string) => `Flash Sale! Use code ${code} to get ${offer}. Book now on OneYatra.`
};

// --- In-App Notification Logic ---

export const getNotifications = (): AppNotification[] => {
  try {
    const stored = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
};

export const getUnreadCount = (): number => {
  const notifs = getNotifications();
  return notifs.filter(n => !n.isRead).length;
};

export const markAllRead = (): AppNotification[] => {
  const notifs = getNotifications().map(n => ({ ...n, isRead: true }));
  localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(notifs));
  // Dispatch event to update UI
  window.dispatchEvent(new Event('oneyatra-notifications-updated'));
  return notifs;
};

export const clearNotifications = () => {
  localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify([]));
  window.dispatchEvent(new Event('oneyatra-notifications-updated'));
};

export const addNotification = (
  title: string, 
  message: string, 
  type: NotificationType = 'UPDATE', 
  link?: string, 
  sendPush = true
) => {
  const newNotif: AppNotification = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    title,
    message,
    type,
    timestamp: Date.now(),
    isRead: false,
    link: link as any
  };

  const current = getNotifications();
  const updated = [newNotif, ...current].slice(0, 50); // Keep last 50
  localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(updated));
  
  // Dispatch internal event for React components
  window.dispatchEvent(new Event('oneyatra-notifications-updated'));

  // Trigger Web Push
  if (sendPush) {
    triggerWebPush(title, message);
  }
};

// --- Web Push Logic ---

export const requestPushPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.warn("This browser does not support desktop notification");
    return false;
  }

  if (Notification.permission === 'granted') return true;

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
};

export const triggerWebPush = (title: string, body: string, icon = 'https://cdn-icons-png.flaticon.com/512/3063/3063822.png') => {
  if (!('Notification' in window)) return;

  if (Notification.permission === 'granted') {
    const options = {
      body,
      icon,
      badge: icon, // Small icon for android
      vibrate: [200, 100, 200],
      tag: 'oneyatra-notification',
      renotify: true
    };
    
    // Check if Service Worker is ready (preferred for mobile)
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then(registration => {
            registration.showNotification(title, options);
        });
    } else {
        // Fallback to main thread notification
        new Notification(title, options);
    }
  }
};

// --- SMS & Event Dispatch ---

// Dispatch Event for SMS UI Notification (Simulating the phone receiving the SMS)
const dispatchSimulatedSMS = (text: string, type: SMSType) => {
  const event = new CustomEvent('oneyatra-sms-received', { 
    detail: { text, type, timestamp: Date.now() } 
  });
  window.dispatchEvent(event);
};

export const sendSMS = async (phone: string, message: string, type: SMSType = 'TRANSACTIONAL'): Promise<{success: boolean, msg?: string}> => {
  const lastSent = smsRateLimit.get(phone) || 0;
  const now = Date.now();

  if (now - lastSent < RATE_LIMIT_WINDOW && type !== 'OTP') {
    console.warn(`[SMS] Rate limit exceeded for ${phone}`);
    return { success: false, msg: 'Please wait before requesting another SMS.' };
  }

  // Simulate Network API Call
  console.group(`📱 [SMS Service] Sending to: ${phone}`);
  console.log(`Type: ${type}`);
  console.log(`Message: "${message}"`);
  console.groupEnd();

  smsRateLimit.set(phone, now);
  
  // Trigger SMS UI Simulation
  setTimeout(() => {
    dispatchSimulatedSMS(message, type);
  }, 1500);

  return { success: true };
};

export const sendOTP = async (phone: string, code: string) => {
  return sendSMS(phone, SMS_TEMPLATES.OTP(code), 'OTP');
};

export const sendBookingSMS = async (booking: Booking, phone: string) => {
  // Also add to Notification Center
  addNotification(
    'Booking Confirmed', 
    `Your trip to ${booking.destination} is confirmed! PNR: ${booking.pnr}`, 
    'BOOKING', 
    'MY_TRIPS'
  );
  return sendSMS(phone, SMS_TEMPLATES.BOOKING(booking.pnr || 'XXX', booking.origin || '', booking.destination || ''), 'TRANSACTIONAL');
};

export const sendCancellationSMS = async (booking: Booking, phone: string) => {
  // Also add to Notification Center
  addNotification(
    'Booking Cancelled', 
    `Refund for ${booking.origin}-${booking.destination} has been initiated.`, 
    'ALERT', 
    'WALLET'
  );
  return sendSMS(phone, SMS_TEMPLATES.CANCEL(booking.pnr || 'XXX', booking.totalAmount), 'TRANSACTIONAL');
};

export const sendGateChangeAlert = async (phone: string, flightNo: string, newGate: string) => {
  // Add to Notification Center
  addNotification(
    'Gate Changed', 
    `Flight ${flightNo} is now boarding from Gate ${newGate}.`, 
    'ALERT', 
    'ALERTS'
  );
  return sendSMS(phone, SMS_TEMPLATES.GATE_CHANGE(flightNo, newGate), 'ALERT');
};

// --- EMAIL SYSTEM (Existing) ---

const getBaseTemplate = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Helvetica', 'Arial', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden; }
    .header { background-color: ${BRAND_COLOR}; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background-color: #fff; }
    .footer { background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #888; }
    .btn { display: inline-block; background-color: ${BRAND_COLOR}; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; }
    .card { background: #f8f9fa; padding: 15px; border-radius: 5px; border: 1px solid #eee; margin: 15px 0; }
    .row { display: flex; justify-content: space-between; margin-bottom: 5px; }
    .label { color: #666; font-size: 12px; text-transform: uppercase; }
    .value { font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>OneYatra</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} OneYatra Technologies Pvt Ltd.<br/>
      Need help? Contact support@oneyatra.app
    </div>
  </div>
</body>
</html>
`;

export const sendEmail = async (to: string, subject: string, htmlBody: string, attachments?: any[]) => {
  console.group(`📧 [Email Service] Sending to: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log('Attachments:', attachments ? attachments.length : 0);
  console.groupEnd();
  
  await new Promise(resolve => setTimeout(resolve, 800));
  return true;
};

export const sendBookingConfirmation = async (booking: Booking, userEmail: string) => {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${booking.pnr}`;
  const travelDate = new Date(booking.travelDate || booking.createdAt).toLocaleDateString();
  
  const paxList = booking.passengers.map(p => `<li>${p.name} (${p.age}, ${p.gender})</li>`).join('');

  const html = getBaseTemplate(`
    <h2>Booking Confirmed! ✅</h2>
    <p>Dear Customer,</p>
    <p>Your ticket for <strong>${booking.origin} to ${booking.destination}</strong> is confirmed.</p>
    
    <div class="card">
      <div style="text-align: center; margin-bottom: 15px;">
        <img src="${qrUrl}" alt="Ticket QR" style="width: 120px; height: 120px;" />
        <p style="font-family: monospace; font-size: 18px; margin: 5px 0;">PNR: ${booking.pnr}</p>
      </div>
      
      <div class="row">
        <div>
          <div class="label">Date</div>
          <div class="value">${travelDate}</div>
        </div>
        <div style="text-align: right;">
          <div class="label">Time</div>
          <div class="value">${booking.option.departureTime}</div>
        </div>
      </div>
      
      <div class="row">
        <div>
          <div class="label">Provider</div>
          <div class="value">${booking.option.provider}</div>
        </div>
        <div style="text-align: right;">
          <div class="label">Mode</div>
          <div class="value">${booking.option.mode}</div>
        </div>
      </div>
    </div>

    <h3>Passengers</h3>
    <ul>${paxList}</ul>

    <div style="text-align: center; margin-top: 20px;">
      <a href="https://oneyatra.app/trips/${booking.id}" class="btn">View Booking</a>
    </div>
    
    <p style="font-size: 12px; color: #666; margin-top: 20px;">
      Invoice attached (PDF). Please arrive 45 mins before departure.
    </p>
  `);

  await sendEmail(
    userEmail, 
    `Booking Confirmed: ${booking.origin} to ${booking.destination} (PNR: ${booking.pnr})`, 
    html,
    [{ filename: 'Invoice.pdf', content: 'mock_pdf_content' }]
  );
};

export const sendCancellation = async (booking: Booking, userEmail: string) => {
  const html = getBaseTemplate(`
    <h2 style="color: #dc2626;">Booking Cancelled ❌</h2>
    <p>Your booking (PNR: <strong>${booking.pnr}</strong>) has been cancelled as requested.</p>
    
    <div class="card">
      <div class="row">
        <div>
          <div class="label">Refund Amount</div>
          <div class="value" style="color: #16a34a;">₹${booking.totalAmount}</div>
        </div>
        <div style="text-align: right;">
          <div class="label">Status</div>
          <div class="value">Processed to Wallet</div>
        </div>
      </div>
    </div>
    
    <p>The refund amount has been credited to your OneYatra Wallet instantly.</p>
  `);

  await sendEmail(userEmail, `Cancellation Confirmed - PNR ${booking.pnr}`, html);
};

export const sendPasswordReset = async (email: string) => {
  const resetLink = `https://oneyatra.app/reset-password?token=${Math.random().toString(36).substr(2)}`;
  
  const html = getBaseTemplate(`
    <h2>Reset Your Password 🔒</h2>
    <p>We received a request to reset your OneYatra password.</p>
    <p>Click the button below to set a new password:</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetLink}" class="btn">Reset Password</a>
    </div>
    
    <p style="font-size: 12px;">If you didn't ask for this, you can safely ignore this email.</p>
  `);

  await sendEmail(email, 'Reset your OneYatra Password', html);
};

export const sendPriceAlert = async (userEmail: string, route: {origin: string, dest: string, oldPrice: number, newPrice: number}) => {
  const html = getBaseTemplate(`
    <h2>Price Drop Alert! 📉</h2>
    <p>Good news! Prices for <strong>${route.origin} to ${route.dest}</strong> have dropped.</p>
    
    <div class="card">
      <div class="row">
        <div><span class="label">Old Price:</span> <span style="text-decoration: line-through;">₹${route.oldPrice}</span></div>
        <div><span class="label">New Price:</span> <span style="color: #16a34a; font-weight: bold;">₹${route.newPrice}</span></div>
      </div>
    </div>
    
    <div style="text-align: center; margin-top: 20px;">
      <a href="#" class="btn">Book Now</a>
    </div>
  `);

  await sendEmail(userEmail, `Price Drop: ${route.origin} to ${route.dest}`, html);
};

export const sendTravelReminder = async (booking: Booking, userEmail: string) => {
    const html = getBaseTemplate(`
      <h2>Ready to go? ✈️</h2>
      <p>This is a reminder for your upcoming trip to <strong>${booking.destination}</strong> tomorrow.</p>
      
      <div class="card">
        <p><strong>Departure:</strong> ${booking.option.departureTime}</p>
        <p><strong>PNR:</strong> ${booking.pnr}</p>
      </div>
      
      <p>Don't forget to carry your ID proof!</p>
    `);
  
    await sendEmail(userEmail, `Reminder: Trip to ${booking.destination} tomorrow`, html);
};
