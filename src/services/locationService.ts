import { configService } from "./configService";

export interface State {
  stateId: string;
  stateName: string;
}

export interface City {
  cityId: string;
  cityName: string;
}

class LocationService {
  async getStates(): Promise<State[]> {
    const API_URL = await configService.getApiUrl();
    try {
      const response = await fetch(`${API_URL}locations/states`);
      if (!response.ok) throw new Error("Failed to fetch states");
      return await response.json();
    } catch (error) {
      console.error("Error fetching states:", error);
      return [];
    }
  }

  async getCities(stateId: string): Promise<City[]> {
    const API_URL = await configService.getApiUrl();
    try {
      const response = await fetch(`${API_URL}locations/cities/${stateId}`);
      if (!response.ok) throw new Error("Failed to fetch cities");
      return await response.json();
    } catch (error) {
      console.error("Error fetching cities:", error);
      return [];
    }
  }
}

export const locationService = new LocationService();
