import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { getCookie } from "@/utils";
const Home = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const onAuthenticate = async () => {
      const res = await fetch("/api/", {
        method: "GET",
        credentials: "include",
        headers: {
          "X-CSRF-Token": getCookie("csrftoken") || "",
        },
      });
      if (res.ok) {
        setIsAuthenticated(true);
      } else {
        window.open("http://localhost:8000/auth/login", "_self");
      }
    };
    onAuthenticate();
  }, [navigate]);
  return <div>Home</div>;
};

export default Home;
