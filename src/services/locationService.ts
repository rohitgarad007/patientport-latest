import Cookies from "js-cookie";
import { configService } from "./configService";

const getAuthConfig = async () => {
  const token = Cookies.get("token");
  const apiUrl = await configService.getApiUrl();

  if (!token) throw new Error("No auth token found");

  return {
    apiUrl,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };
};

export const locationService = {
  async getStates() {
    const { apiUrl, headers } = await getAuthConfig();

    const res = await fetch(`${apiUrl}/ms_statesList`, {
      method: "POST",
      headers,
      body: JSON.stringify({}), // empty body
    });

    if (!res.ok) throw new Error("Failed to fetch states");
    return res.json();
  },

  async getCitiesByState(stateId: string) {
    const { apiUrl, headers } = await getAuthConfig();

    const res = await fetch(`${apiUrl}/ms_citiesList`, {
      method: "POST",
      headers,
      body: JSON.stringify({ state_id: stateId }),
    });

    if (!res.ok) throw new Error("Failed to fetch cities");
    return res.json();
  },
};
