import React, { useState, useRef } from "react";
import headerImage from "@/assets/tcet header.jpg";
import copytoimage from "@/assets/pmt-placement_drive_copytoImage.png";
import { useParams } from "react-router";

const SingleOffer = () => {
  const editor = useRef(null);
  const [content, setContent] = useState("");
  const [formData, setFormData] = useState({
    srNo: "",
    to: "",
    subject: "",
    date: "",
    Intro: "",
    Eligibility_Criteria: "",
    Role: "",
    About_Company: "",
    Skill_Required: "",
    Location: "",
    Documents_to_Carry: "",
    Walk_in_interview: "",
    Company_registration_Link: "",
    Note: "",
    From: "",
    From_designation: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const { id } = useParams();
  const printContent = () => {
    const previewContent = editor.current?.value || content;
    const newWindow = window.open("", "_blank", "width=800,height=600");
    if (!newWindow) return;
    newWindow.document.write(`
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              margin: 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            table, th, td {
              border: 1px solid black;
            }
            th, td {
              padding: 8px;
              text-align: left;
            }
            .form-section {
              margin-bottom: 20px;
            }
            .form-section label {
              display: block;
              margin-bottom: 5px;
            }
            .content-header {
              margin-bottom: 5px;
              text-align:center;
            }
            .content-body {
              margin-top: 10px;
            }
            .notice-content {
              margin-top: 10px;
              margin-bottom:10px;
            }
            .flex-container {
              display: flex;
              justify-content: space-between;
              align-items: center;
              gap: 20px;
            }
            .header-image {
              width: 100%;
              height: 80px;
              margin-bottom: 10px;
            }
            .fromto{
              float:right;
              margin-rigth:20px;
            }
            .main_body{
              display:flex;
              flex-direction:column;
              gap:10px;
            }
            .footerImage{
              margin-top:80px;
            }
          </style>
        </head>
        <body>
          ${headerImage ? `<img src="${headerImage}" alt="Header" />` : ""}
          <h2 class="content-header">NOTICE</h2>
          <div class="flex-container">
            <p><strong>Serial No:</strong> ${formData.srNo}</p>
            <p><strong>Date:</strong> ${formData.date}</p>
          </div>
          <div class="main_body">
            <p><strong>To:</strong> ${formData.to}</p>
            <p><strong>Subject:</strong> ${formData.subject}</p>
            <p>Intro here${formData.Intro}</p>
            <p><strong>Eligibility Criteria:</strong> ${
              formData.Eligibility_Criteria
            }</p>
            <p><strong>Role:</strong> ${formData.Role}</p>
            <p><strong>About Company:</strong> ${formData.About_Company}</p>
            <p><strong>Skill Required:</strong> ${formData.Skill_Required}</p>
            <p><strong>Location:</strong> ${formData.Location}</p>
            <p><strong>Documents to Carry:</strong> ${
              formData.Documents_to_Carry
            }</p>
            <p><strong>Walk-in Interview:</strong> ${
              formData.Walk_in_interview
            }</p>
            <p><strong>Company Registration Link:</strong> ${
              formData.Company_registration_Link
            }</p>
            <p><strong>College Registration Link:</strong> ${
              "/placement/job/application/company" + id
            }</p>
            <p><strong>Note:</strong> ${formData.Note}</p>
          </div>
          <div class="notice-content">
            <div class="content-body">${previewContent}</div>
          </div>
          <div class="fromto">
            <p>${formData.From}</p>
            <p> ${formData.From_designation}</p>
          </div>
          ${
            copytoimage
              ? `<img src="${copytoimage}" alt="Header" class="footerImage" />`
              : ""
          }
        </body>
      </html>
    `);
    newWindow?.document.close();
    newWindow?.print();
  };

  return (
    <div
      style={{
        padding: "30px",
        maxWidth: "800px",
        margin: "0 auto",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#fff",
        borderRadius: "8px",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          color: "#333",
          marginBottom: "20px",
        }}
      >
        NOTICE DETAILS : PLACEMENTS
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
          gap: "20px",
        }}
      >
        {Object.keys(formData).map((key) => (
          <div
            key={key}
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            <label
              htmlFor={key}
              style={{
                marginBottom: "5px",
                fontWeight: "bold",
                color: "#555",
              }}
            >
              {key.replace(/_/g, " ").toUpperCase()}:
            </label>
            <input
              type={key === "date" ? "date" : "text"}
              id={key}
              name={key}
              value={formData[key as keyof typeof formData]}
              onChange={handleInputChange}
              style={{
                borderWidth: 1,
                borderColor: "#ccc",
                borderStyle: "solid",
                padding: "10px",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            />
          </div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={printContent}
          style={{
            marginTop: "20px",
            padding: "10px 25px",
            border: "none",
            borderRadius: "5px",
            backgroundColor: "#4CAF50",
            color: "white",
            fontSize: "16px",
            cursor: "pointer",
            transition: "background-color 0.3s",
          }}
          onMouseOver={(e) =>
            ((e.target as HTMLButtonElement).style.backgroundColor = "#45a049")
          }
          onMouseOut={(e) =>
            ((e.target as HTMLButtonElement).style.backgroundColor = "#4CAF50")
          }
        >
          Print Content
        </button>
      </div>
    </div>
  );
};

export default SingleOffer;
