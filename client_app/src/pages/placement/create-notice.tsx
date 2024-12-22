import React, { useState, useRef } from "react";
import JoditEditor from "jodit-react";
import headerImage from "../../assets/tcet header.jpg";
import copytoimage from "../../assets/pmt-placement_drive_copytoImage.png";
import NavBar from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { useParams } from "react-router";
import { getCookie } from "@/utils";
const CreatePlacementNotice = () => {
  const editor = useRef(null);
  const [content, setContent] = useState("");
  const [formData, setFormData] = useState({
    srNo: "",
    to: "",
    subject: "",
    date: "",
    intro: "",
    eligibility_criteria: "",
    roles: "",
    about: "",
    skill_required: "",
    Location: "",
    Documents_to_Carry: "",
    Walk_in_interview: "",
    Company_registration_Link: "",
    Note: "",
    From: "",
    From_designation: "",
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const { id } = useParams();
  console.log(id);
  const printContent = async () => {
    const previewContent = editor.current?.value || content;
    const newWindow = window.open("", "_blank", "width=800,height=600");
    const csrfToken = getCookie("csrftoken");
    const res = await fetch(`/api/placement/notice/create/${id}`, {
      method: "POST",
      credentials: "include",
      headers: {
        "X-CSRFToken": csrfToken || "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ notice: formData }),
    });
    if (res.status !== 201) {
      console.log("some server side error taken place");
    }
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
                    ${
                      headerImage
                        ? `<img src="${headerImage}" alt="Header" />`
                        : ""
                    }
                    <h2 class="content-header">NOTICE</h2>
                    <div class="flex-container">
                        <p><strong>Serial No:</strong> ${formData.srNo}</p>
                        <p><strong>Date:</strong> ${formData.date}</p>
                    </div>
                    <div class="main_body">

                        <p><strong>To:</strong> ${formData.to}</p>
                        <p><strong>Subject:</strong> ${formData.subject}</p>
                        <p>Intro here${formData.intro}</p>
                        <p><strong>Eligibility Criteria:</strong> ${
                          formData.eligibility_criteria
                        }</p>
                        <p><strong>Role:</strong> ${formData.roles}</p>
                        <p><strong>About Company:</strong> ${formData.about}</p>
                        <p><strong>Skill Required:</strong> ${
                          formData.skill_required
                        }</p>
                        <p><strong>Location:</strong> ${formData.Location}</p>
                        <p><strong>Documents to Carry:</strong> ${
                          formData.Documents_to_Carry
                        }</p>
                        <p><strong>Walk-in Interview:</strong> ${
                          formData.Walk_in_interview
                        }</p>
                        <p><strong>Company Registration Link:</strong> <a> ${
                          formData.Company_registration_Link
                        }</a></p>
                        <p><strong>College Registration Link:</strong> <a>${
                          "/notice/" + 1
                        }</a></p>
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
    <>
      <NavBar title="Placement Notice" />
      <div className="p-8 md:px-48">
        <h2 className="text-2xl font-bold mb-4">NOTICE DETAILS : PLACEMENTS</h2>
        <div className="flex flex-col gap-5">
          {Object.keys(formData).map((key) => (
            <input
              key={key}
              type={key === "date" ? "date" : "text"}
              name={key}
              value={formData[key]}
              onChange={handleInputChange}
              placeholder={key.replace(/_/g, " ").toUpperCase()}
              className="border border-black p-2 rounded"
            />
          ))}
        </div>
        {/* <div className="mt-5">
          <JoditEditor
            ref={editor}
            value={content}
            config={{
              height: 300,
              readonly: false,
            }}
            onBlur={(newContent) => setContent(newContent)}
          />
        </div> */}
        <div className="flex justify-end">
          <Button
            onClick={printContent}
            className="py-2 rounded-md bg-[#d17a00] hover:bg-[#d17a00]/80 text-lg font-bold w-full mt-5"
          >
            Print Content
          </Button>
        </div>
      </div>
    </>
  );
};

export default CreatePlacementNotice;
