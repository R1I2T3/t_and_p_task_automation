import React from "react";
import { useParams } from "react-router";
import { getCookie } from "@/utils";
const PlacementJobApplications = () => {
  const { id } = useParams();
  const sendPostRequest = async () => {
    const res = await fetch(`/api/placement/job_application/create/${id}`, {
      credentials: "include",
      headers: {
        "X-CSRF-Token": getCookie("csrftoken") || "",
      },
    });
  };
  return <button onClick={sendPostRequest}>PlacementJobApplications</button>;
};

export default PlacementJobApplications;
