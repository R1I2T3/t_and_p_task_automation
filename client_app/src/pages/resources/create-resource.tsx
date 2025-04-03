import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import { getCookie } from "@/utils"; 

const CreateResource = () => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [year, setYear] = useState(""); 
  const [branch, setBranch] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null); // Add ref for file input
  const navigate = useNavigate();
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const years = ["FE", "SE", "TE", "BE"];
  const branches = ["COMP", "IT", "CSE", "MECH", "AIDS", "AIML", "EXTC", "IOT", "MME"];

  const yearMapping: { [key: string]: string } = {
    "FE": "2428",
    "SE": "2327",
    "TE": "2226",
    "BE": "2125",
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!title || !message || !year || !branch || !file) {
      alert("Please fill in all fields and upload a file.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("message", message);
    formData.append("academic_year", yearMapping[year]); 
    formData.append("department", branch);
    formData.append("file", file);

    try {
      const authToken = localStorage.getItem("authToken");
      const csrfToken = getCookie("csrftoken"); 
      const response = await axios.post("/api/resources/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "X-CSRFToken": csrfToken || "",
          "Authorization": `Token ${authToken}`,
        },
        withCredentials: true,
      });

      console.log("API Response:", response.data);

      if (response.data) {
        setShowSuccessPopup(true);
        setTitle("");
        setMessage("");
        setYear("");
        setBranch("");
        setFile(null);
        
        // ✅ Reset file input field using ref
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        alert("Error: " + response.data.message);
      }
    } catch (error) {
      alert("Something went wrong!");
      console.error("Error creating resource:", error);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <button
        onClick={() => navigate("/faculty_coordinator")}
        className="mb-4 px-4 py-2 bg-orange-400 text-black rounded hover:bg-orange-600"
      >
        Home
      </button>
      <h1 className="text-3xl font-bold mb-6 text-center">Create Resource</h1>
      <form onSubmit={handleSubmit} className="max-w-lg mx-auto bg-white p-6 shadow-md rounded-lg">
        <label className="block mb-2 font-semibold">Title</label>
        <input
          type="text"
          className="w-full border p-2 rounded mb-4"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter resource title"
        />

        <label className="block mb-2 font-semibold">Message</label>
        <textarea
          className="w-full border p-2 rounded mb-4"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter your message"
          rows={4}
        />

        <label className="block mb-2 font-semibold">Select Year</label>
        <select
          className="w-full border p-2 rounded mb-4"
          value={year}
          onChange={(e) => setYear(e.target.value)}
        >
          <option value="">Select Year</option>
          {years.map((yr) => (
            <option key={yr} value={yr}>
              {yr}
            </option>
          ))}
        </select>

        <label className="block mb-2 font-semibold">Select Branch</label>
        <select className="w-full border p-2 rounded mb-4" value={branch} onChange={(e) => setBranch(e.target.value)}>
          <option value="">Select Branch</option>
          {branches.map((br) => (
            <option key={br} value={br}>
              {br}
            </option>
          ))}
        </select>

        {/* ✅ File Upload with ref */}
        <label className="block mb-2 font-semibold">Upload File</label>
        <input type="file" ref={fileInputRef} className="w-full border p-2 rounded mb-4" onChange={handleFileChange} />

        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Create
        </button>
      </form>

      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h2 className="text-xl font-semibold text-center mb-4">Success</h2>
            <p className="text-center mb-4">The resource has been created successfully!</p>
            <div className="flex justify-center">
              <button
                onClick={() => setShowSuccessPopup(false)}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateResource;
