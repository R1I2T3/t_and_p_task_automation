import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import axios from "axios";

const ResourceDetail = () => {
  const { id } = useParams();
  interface Resource {
    title: string;
    description: string;
    created_at: string;
    file?: string;
  }

  const [resource, setResource] = useState<Resource | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResource = async () => {
      try {
        const accessToken = localStorage.getItem("access_token");
        const response = await axios.get(`/api/resources/${id}/`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        console.log("Resource data:", response.data); // Log the response data
        setResource(response.data);
      } catch (error) {
        console.error("Error fetching resource:", error);
      }
    };
    fetchResource();
  }, [id]);

  const handleBack = () => {
    navigate("/student/resources");
  };

  if (!resource) {
    return <p>Loading...</p>;
  }

  const renderFile = (fileUrl: string) => {
    if (!fileUrl) return <p>No file available</p>;
  
    const fileExtension = fileUrl?.split(".").pop()?.toLowerCase() || "";
  
    if (["jpg", "jpeg", "png", "gif"].includes(fileExtension)) {
      return <img src={fileUrl} alt={resource?.title} style={{ width: "100%" }} />;
    } else if (fileExtension === "pdf") {
      return (
        <a href={fileUrl} target="_blank" rel="noopener noreferrer">
          View PDF
        </a>
      );
    } else {
      return <p>Unsupported file type</p>;
    }
  };
  

  return (
    <div
      style={{
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginTop: "90px",
      }}
    >
      <div
        style={{
          maxWidth: "600px",
          border: "1px solid #ccc",
          padding: "20px",
          borderRadius: "8px",
        }}
      >
        {resource.file && renderFile(resource.file)}
        <h2>{resource.title}</h2>
        <p>{resource.description}</p>
        <p>
          <small>
            Created at: {new Date(resource.created_at).toLocaleString()}
          </small>
        </p>
      </div>
      <button
        onClick={handleBack}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Back to Resources
      </button>
    </div>
  );
};

export default ResourceDetail;
