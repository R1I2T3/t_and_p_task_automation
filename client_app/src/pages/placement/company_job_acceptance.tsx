import React, { useState } from "react";
import { objectToFormData } from "@/utils";
import { getCookie } from "@/utils";
const CompanyJobAcceptance = () => {
  const [file, setFile] = useState(null);
  console.log(getCookie("csrftoken"));
  const onFormSubmit = async () => {
    const formData = objectToFormData({
      offer_letter: file,
      company_name: "company_name",
      type: "outhouse",
      salary: 10000,
      position: "position",
    });
    const res = await fetch("/api/placement/job_acceptance/create", {
      method: "POST",
      body: formData,
      headers: {
        "X-CSRFToken": getCookie("csrftoken") || "",
      },
      credentials: "include",
      mode: "cors",
    });
    console.log(res);
  };
  return (
    <div>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={onFormSubmit}>Submit</button>
    </div>
  );
};

export default CompanyJobAcceptance;
