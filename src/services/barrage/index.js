const API_URL = 'https://app-sis-out-srh-backend-01-h3hkbcf5f8dubbdy.brazilsouth-01.azurewebsites.net';
//const API_URL = 'http://localhost:3001';

export const calculateReservoirBalance = async (payload) => {

  console.log("Calculating reservoir balance with payload:", payload);
  try {
    const response = await fetch(`${API_URL}/barrage/calculate-reservoir-balance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error calculating reservoir balance:", error);
    throw error;
  }
};