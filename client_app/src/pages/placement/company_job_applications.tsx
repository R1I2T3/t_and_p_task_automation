import { useEffect } from "react";
import { useParams } from "react-router";

const CompanyJobApplications = () => {
  const { id } = useParams();
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(
        `/api/placement/job_application/company/get/${id}`
      );
    };
    fetchData();
  }, []);
  return <div>CompanyJobApplications</div>;
};

export default CompanyJobApplications;
