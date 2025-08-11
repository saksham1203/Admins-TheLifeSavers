import { useQuery, useMutation } from "@tanstack/react-query";
import { getDonors, verifyPassword } from "../services/dashboardService";
// import { FindDonor, VerifyPasswordResponse, Donor } from "../../pages/Dashboard";
import { VerifyPasswordResponse, Donor } from "../pages/Dashboard/Dashboard";

// Query to fetch donors
export const useDonorsQuery = (watch: any) => {
  return useQuery<Donor[]>({
    queryKey: [
      "donors",
      watch("country"),
      watch("state"),
      watch("district"),
      watch("city"),
      watch("bloodGroup"),
    ],
    queryFn: async () => {
      const country = encodeURIComponent(watch("country"));
      const state = encodeURIComponent(watch("state"));
      const district = encodeURIComponent(watch("district"));
      const city = encodeURIComponent(watch("city"));
      const bloodGroup = encodeURIComponent(watch("bloodGroup"));

      return await getDonors(country, state, district, city, bloodGroup);
    },
    enabled: false,
  });
};

// Mutation to verify the password
export const useVerifyPasswordMutation = () => {
  return useMutation<VerifyPasswordResponse, Error, string>({
    mutationFn: async (password: string) => {
      return await verifyPassword(password);
    },
  });
};
