import { SearchParams, TravelOption } from "../types";

// ==========================================
// 1. ADAPTER INTERFACE (The Strategy)
// ==========================================
export interface IProviderAdapter {
  readonly providerName: string;
  readonly supportedModes: string[];
  
  /**
   * Main entry point for searching availability.
   * Must return normalized data matching the Unified Schema.
   */
  search(params: SearchParams): Promise<TravelOption[]>;

  /**
   * Health check for Circuit Breaker
   */
  healthCheck(): Promise<boolean>;
}

// ==========================================
// 2. CONCRETE STRATEGIES (The Adapters)
// ==========================================

/**
 * UBER ADAPTER
 * Handles Cabs. Uses Webhooks for real-time status.
 */
export class UberAdapter implements IProviderAdapter {
  providerName = 'Uber';
  supportedModes = ['CAB'];

  async search(params: SearchParams): Promise<TravelOption[]> {
    try {
      // 1. Call External API (Simulated)
      // const rawResponse = await axios.get('https://api.uber.com/v1/estimates/price', ...);
      const rawResponse = {
        prices: [
            { display_name: 'UberGo', estimate: '₹450', duration: 1800, distance: 12.5, surge_multiplier: 1.0 },
            { display_name: 'UberPremier', estimate: '₹650', duration: 1800, distance: 12.5, surge_multiplier: 1.2 }
        ]
      };

      // 2. Normalize Data
      return rawResponse.prices.map(item => this.normalize(item, params));
    } catch (error) {
        console.error("Uber API Failed", error);
        throw new Error("Provider_Connection_Error"); // Triggers Retry
    }
  }

  // Normalization Logic: Transform Provider JSON -> OneYatra Schema
  private normalize(item: any, params: SearchParams): TravelOption {
    const price = parseInt(item.estimate.replace(/[^0-9]/g, ''));
    return {
      id: `uber-${Math.random()}`,
      mode: 'CAB',
      provider: `Uber ${item.display_name}`,
      departureTime: params.time,
      arrivalTime: "Flexible", // Calculated based on duration
      duration: `${Math.round(item.duration / 60)} mins`,
      distance: `${item.distance} km`,
      price: price,
      currency: 'INR',
      ecoScore: item.display_name === 'UberGreen' ? 80 : 30,
      deepLink: `https://m.uber.com/...`,
      features: ['AC', 'Private'],
      surgeMultiplier: item.surge_multiplier
    };
  }

  async healthCheck(): Promise<boolean> {
    return true; // Pings /health endpoint
  }
}

/**
 * REDBUS ADAPTER
 * Handles Buses. Needs SOAP to JSON conversion in real life.
 */
export class RedBusAdapter implements IProviderAdapter {
  providerName = 'RedBus';
  supportedModes = ['BUS'];

  async search(params: SearchParams): Promise<TravelOption[]> {
    // 1. Simulate SOAP XML Response parsed to JSON
    const rawResponse = {
      availableTrips: [
        { busOperator: 'ZingBus', fare: 800, departure: '2023-10-10T22:00:00', arrival: '2023-10-11T06:00:00', type: 'Volvo AC' }
      ]
    };

    return rawResponse.availableTrips.map(trip => ({
      id: `rb-${Math.random()}`,
      mode: 'BUS',
      provider: trip.busOperator,
      departureTime: trip.departure.split('T')[1].substring(0, 5),
      arrivalTime: trip.arrival.split('T')[1].substring(0, 5),
      duration: '8h 00m', // Calculated
      price: trip.fare,
      currency: 'INR',
      ecoScore: 75, // Buses are generally greener
      features: [trip.type, 'WiFi', 'Blanket'],
      deepLink: `redbus://...`
    }));
  }

  async healthCheck(): Promise<boolean> {
    return true; 
  }
}

// ==========================================
// 3. FACTORY (The Context)
// ==========================================
export class ProviderFactory {
  private adapters: IProviderAdapter[] = [];

  constructor() {
    this.adapters.push(new UberAdapter());
    this.adapters.push(new RedBusAdapter());
    // Add Ola, Rapido, ConfirmTkt...
  }

  async searchAll(params: SearchParams): Promise<TravelOption[]> {
    // 1. Execute all strategies in parallel
    const promises = this.adapters.map(async adapter => {
        try {
            // 2. Retry Logic (Simple simulation)
            return await this.withRetry(() => adapter.search(params));
        } catch (e) {
            console.warn(`${adapter.providerName} failed after retries.`);
            return []; // Fail gracefully (Fallback)
        }
    });

    const results = await Promise.all(promises);
    return results.flat();
  }

  private async withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
     try {
         return await fn();
     } catch(e) {
         if (retries > 0) {
             const delay = (4 - retries) * 200; // Exponential Backoff
             await new Promise(r => setTimeout(r, delay));
             return this.withRetry(fn, retries - 1);
         }
         throw e;
     }
  }
}
