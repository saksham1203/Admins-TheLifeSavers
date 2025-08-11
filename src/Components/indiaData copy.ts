// indiaData.ts

export const stateDistrictCityData: Record<string, Record<string, { serialNumber: number; name: string; pincode: string }[]>> = {
  Andaman_and_Nicobar_Islands: {
    Nicobars: [
      { serialNumber: 1, name: "Car Nicobar", pincode: "744301" },
      { serialNumber: 2, name: "Great Nicobar", pincode: "744302" },
      { serialNumber: 3, name: "Nancowry", pincode: "744303" },
    ],
    North_And_MiddleAndaman: [
      { serialNumber: 1, name: "Diglipur", pincode: "744401" },
      { serialNumber: 2, name: "Mayabunder", pincode: "744402" },
      { serialNumber: 3, name: "Rangat", pincode: "744403" },
    ],
    South_Andamans: [
      { serialNumber: 1, name: "Ferrargunj", pincode: "744501" },
      { serialNumber: 2, name: "Little Andaman", pincode: "744502" },
      { serialNumber: 3, name: "Port Blair", pincode: "744503" },
    ],
  },
};

export const getStates = (): string[] => Object.keys(stateDistrictCityData);

export const getDistricts = (state: string): string[] =>
  stateDistrictCityData[state] ? Object.keys(stateDistrictCityData[state]) : [];

export const getCities = (
  state: string,
  district: string
): { serialNumber: number; name: string; pincode: string }[] =>
  stateDistrictCityData[state]?.[district] || [];
