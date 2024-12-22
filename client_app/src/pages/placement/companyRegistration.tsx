import React, { useState } from "react";
import { getCookie } from "@/utils"; // Ensure this function correctly retrieves the CSRF token
import NavBar from "@/components/NavBar";
const CompanyRegistrationForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    min_tenth_marks: "",
    min_higher_secondary_marks: "",
    min_cgpa: "",
    min_attendance: "",
    is_kt: false,
    is_backLog: false,
    domain: "core",
    Departments: "all",
    selectedDepartments: [],
    jobOffers: [{ type: "", salary: "", position: "" }],
  });

  const departmentOptions = [
    "CS",
    "IT",
    "AI & DS",
    "AL & ML",
    "CIVIL",
    "E & TC",
    "ELEX",
    "IOT",
    "MECH",
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleDepartmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    // @ts-expect-error: This function is not a part of the app, so TypeScript typechecking is disabled
    setFormData((prevData) => ({
      ...prevData,
      selectedDepartments: checked
        ? [...prevData.selectedDepartments, value]
        : prevData.selectedDepartments.filter((dept) => dept !== value),
    }));
  };
  const handleJobOfferChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    const updatedJobOffers = [...formData.jobOffers];
    // @ts-expect-error: This function is not a part of the app, so TypeScript typechecking is disabled
    updatedJobOffers[index][name] = value;
    setFormData({ ...formData, jobOffers: updatedJobOffers });
  };

  const addJobOffer = () => {
    setFormData((prevData) => ({
      ...prevData,
      jobOffers: [
        ...prevData.jobOffers,
        { type: "", salary: "", position: "" },
      ],
    }));
  };
  const removeJobOffer = (index: number) => {
    setFormData((prevData) => ({
      ...prevData,
      jobOffers:
        prevData.jobOffers.length > 1
          ? prevData.jobOffers.filter((_, i) => i !== index)
          : prevData.jobOffers,
    }));
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const payload = {
      company: {
        name: formData.name,
        min_tenth_marks: parseFloat(formData.min_tenth_marks),
        min_higher_secondary_marks: parseFloat(
          formData.min_higher_secondary_marks
        ),
        min_cgpa: parseFloat(formData.min_cgpa),
        min_attendance: parseFloat(formData.min_attendance),
        is_kt: formData.is_kt,
        is_backLog: formData.is_backLog,
        domain: formData.domain,
        departments: formData.selectedDepartments,
      },
      offers: formData.jobOffers.map((offer) => ({
        type: offer.type,
        salary: parseFloat(offer.salary),
        position: offer.position,
      })),
    };

    try {
      const csrfToken = getCookie("csrftoken");
      const response = await fetch("/api/placement/company/register", {
        method: "POST",
        headers: {
          "X-CSRFToken": csrfToken || "",
          "Content-Type": "application/json",
        },
        credentials: "include",
        mode: "cors",
        body: JSON.stringify(payload),
      });
      alert("Company registered successfully!");
    } catch (error) {
      console.error("Error registering company:", error);
      alert("Error registering company. Check console for details.");
    }
  };

  return (
    <>
      <NavBar title="Company Registration" />
      <form
        onSubmit={handleSubmit}
        className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-md space-y-4 mt-[10dvh]"
      >
        <h2 className="text-2xl font-semibold text-black">
          Company Registration
        </h2>

        <div>
          <label className="block text-sm font-medium text-black">Name</label>
          <input
            type="text"
            name="name"
            onChange={(e) =>
              setFormData({ ...formData, Departments: e.target.value })
            }
            required
            className="w-full mt-1 p-2 border border-gray-500 rounded-md focus:ring focus:ring-blue-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-black">
            Minimum required 10th Marks
          </label>
          <input
            type="number"
            name="min_tenth_marks"
            step="0.01"
            onChange={handleChange}
            required
            className="w-full mt-1 p-2 border  border-gray-500 rounded-md focus:ring focus:ring-blue-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-black">
            Minimum required 12th Marks
          </label>
          <input
            type="number"
            name="min_higher_secondary_marks"
            step="0.01"
            onChange={handleChange}
            required
            className="w-full mt-1 p-2 border border-gray-500 rounded-md focus:ring focus:ring-blue-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-black">
            Minimum required CGPA
          </label>
          <input
            type="number"
            name="min_cgpa"
            step="0.01"
            onChange={handleChange}
            required
            className="w-full mt-1 p-2 border-gray-500 border rounded-md focus:ring focus:ring-blue-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-black">
            Minimum required Attendance
          </label>
          <input
            type="number"
            name="min_attendance"
            step="0.01"
            onChange={handleChange}
            required
            className="w-full mt-1 p-2 border-gray-500 border rounded-md focus:ring focus:ring-blue-200"
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="is_kt"
            onChange={handleChange}
            className="text-blue-600 border-gray-500 focus:ring focus:ring-blue-200"
          />
          <label className="text-sm font-medium text-black">
            Accepting Active KT
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="is_backLog"
            onChange={handleChange}
            className="text-blue-600 border-gray-500 focus:ring focus:ring-blue-200"
          />
          <label className="text-sm font-medium text-black">
            Accepting Backlogs
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-black">Domain</label>
          <select
            name="domain"
            // @ts-expect-error: This function is not a part of the app, so TypeScript typechecking is disabled
            onChange={handleChange}
            className="w-full mt-1 p-2 border border-gray-500 rounded-md focus:ring focus:ring-blue-200"
          >
            <option value="core">Core</option>
            <option value="it">IT</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-black">
            Departments
          </label>
          <select
            name="Departments"
            onChange={(e) =>
              setFormData({ ...formData, Departments: e.target.value })
            }
            className="w-full mt-1 p-2 border border-gray-500 rounded-md focus:ring focus:ring-blue-200"
          >
            <option value="all">All</option>
            <option value="select">Select Departments</option>
          </select>
        </div>

        {formData.Departments === "select" && (
          <div className="grid grid-cols-2 gap-2">
            {departmentOptions.map((dept) => (
              <div key={dept} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  value={dept}
                  onChange={handleDepartmentChange}
                  className="text-blue-600  border-gray-500 focus:ring focus:ring-blue-200"
                />
                <label className="text-sm font-medium text-black">{dept}</label>
              </div>
            ))}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-black">
            Job Offers
          </label>
          {formData.jobOffers.map((offer, index) => (
            <div key={index} className="space-y-2">
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  name="type"
                  placeholder="Type"
                  value={offer.type}
                  onChange={(e) => handleJobOfferChange(index, e)}
                  className="p-2 border rounded-md border-gray-500 focus:ring focus:ring-blue-200"
                />
                <input
                  type="number"
                  name="salary"
                  placeholder="Salary"
                  value={offer.salary}
                  onChange={(e) => handleJobOfferChange(index, e)}
                  className="p-2 border border-gray-500 rounded-md focus:ring focus:ring-blue-200"
                />
                <input
                  type="text"
                  name="position"
                  placeholder="Position"
                  value={offer.position}
                  onChange={(e) => handleJobOfferChange(index, e)}
                  className="p-2 border rounded-md border-gray-500 focus:ring focus:ring-blue-200"
                />
              </div>
              <button
                type="button"
                onClick={() => removeJobOffer(index)}
                disabled={formData.jobOffers.length === 1}
                className="text-red-600 hover:underline text-sm"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addJobOffer}
          className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-700"
        >
          Add Job Offer
        </button>

        <button
          type="submit"
          className="w-full mt-4 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-green-700"
        >
          Submit
        </button>
      </form>
    </>
  );
};

export default CompanyRegistrationForm;
