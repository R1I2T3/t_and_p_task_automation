import React, { useEffect, useState } from "react";
import headerImage from "../../assets/tcet header.jpg";
import copytoimage from "../../assets/pmt-placement_drive_copytoImage.png";
import "./notice-style.css";
const Notice = () => {
  const [formData, setFormData] = useState(null);
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(
        "/api/placement/notice/get/d1fd1f38a7d34aa5940ab300a9ba6bcd"
      );
      if (res.status !== 200) {
        console.log("some server side error taken place");
      }
      const data = await res.json();
      console.log(data);
      setFormData(data.notice);
    };
    fetchData();
  }, []);
  return (
    <div className="w-full md:w-[60dvw] mx-auto border-black border-2 px-3 py-3">
      {headerImage ? <img src={headerImage} alt="Header" /> : ""}
      <h2 className="content-header">NOTICE</h2>
      <div className="flex-container">
        <p>
          <strong>Serial No:</strong> {formData?.srNo}
        </p>
        <p>
          <strong>Date:</strong> {formData?.date}
        </p>
      </div>
      <div className="main_body">
        <p>
          <strong>To:</strong> {formData?.to}
        </p>
        <p>
          <strong>Subject:</strong> {formData?.subject}
        </p>
        <p>Intro here {formData?.intro}</p>
        <p>
          <strong>Eligibility Criteria:</strong>
          {formData?.eligibility_criteria}
        </p>
        <p>
          <strong>Role:</strong> {formData?.roles}
        </p>
        <p>
          <strong>About Company:</strong> {formData?.about}
        </p>
        <p>
          <strong>Skill Required:</strong> {formData?.skill_required}
        </p>
        <p>
          <strong>Location:</strong> {formData?.Location}
        </p>
        <p>
          <strong>Documents to Carry:</strong> {formData?.Documents_to_Carry}
        </p>
        <p>
          <strong>Walk-in Interview:</strong> {formData?.Walk_in_interview}
        </p>
        <p>
          <strong>Company Registration Link:</strong>{" "}
          <a> {formData?.Company_registration_Link}</a>
        </p>
        <p>
          <strong>College Registration Link:</strong> <a>{"/notice/" + 1}</a>
        </p>
        <p>
          <strong>Note:</strong> {formData?.Note}
        </p>
      </div>
      {/* <div className="notice-content">
        <div className="content-body">${previewContent}</div>
      </div> */}
      <div className="fromto">
        <p>{formData?.From}</p>
        <p> {formData?.From_designation}</p>
      </div>
      {copytoimage ? (
        <img src={copytoimage} alt="Header" className="footerImage" />
      ) : (
        ""
      )}
    </div>
  );
};

export default Notice;
