import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { loginRequest } from "../services/authService";

const useAuthLogic = (
  setAuthenticated: (value: boolean) => void,
  login: (token: string, user: any, userReview: any) => void,
  toast: any
) => {
  const navigate = useNavigate();
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const { mutate } = useMutation({
    mutationFn: loginRequest,
    onSuccess: (response, data) => {
      const { token, user, userReview } = response;

      if (token && user) {
        const expirationTime = new Date();
        expirationTime.setHours(expirationTime.getHours() + 24);

        if (data.rememberMe) {
          localStorage.setItem("token", token);
          localStorage.setItem("tokenExpiration", expirationTime.toISOString());
        } else {
          sessionStorage.setItem("token", token);
        }
        localStorage.setItem("user", JSON.stringify(user));

        if (userReview) {
          localStorage.setItem("userReview", JSON.stringify(userReview));
        } else {
          localStorage.setItem("userReview", "false");
        }

        toast.success("Logged in successfully!");
        setAuthenticated(true);
        login(token, user, userReview || false);
        setIsLoggedIn(true);
      } else {
        toast.error("Invalid login credentials!");
        setIsFormSubmitted(false);
      }
    },
    onError: () => {
      toast.error("An error occurred during login. Please try again.");
      setIsFormSubmitted(false);
    },
  });

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/dashboard");
    }
  }, [isLoggedIn, navigate]);

  return {
    isFormSubmitted,
    setIsFormSubmitted,
    mutate,
  };
};

export default useAuthLogic;
