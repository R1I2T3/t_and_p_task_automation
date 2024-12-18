import React, { useEffect } from "react";
import { useParams } from "react-router";
const StudentJobApplication = () => {
  const { uid } = useParams();
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`/api/placement/job_application/get/${uid}`);
    };
    fetchData();
  }, []);
  return <div>StudentJobApplication</div>;
};

export default StudentJobApplication;
