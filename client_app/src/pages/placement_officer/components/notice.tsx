import { forwardRef } from "react";
import "./notice.css";
import noticeHeader from "@/assets/tcet header.jpg";
import copytoimage from "@/assets/pmt-placement_drive_copytoImage.png";
import { BASE_URL } from "@/constant";
export type NoticeData = {
  srNo: string;
  to: string;
  subject: string;
  date: string;
  intro: string;
  eligibility_criteria: string;
  about: string;
  Documents_to_Carry: string;
  Walk_in_interview: string;
  Company_registration_Link: string;
  College_registration_Link: string;
  Note: string;
  From: string;
  CompanyId: string;
  From_designation: string;
  tableData: Array<{
    type: string;
    salary: string;
    position: string;
  }>;
  location: string;
};

const Notice = forwardRef<
  HTMLDivElement,
  { formData: NoticeData; isPlacement: boolean }
>(({ formData, isPlacement = true }, ref) => {
  console.log(formData.tableData);
  console.log("Form Data:", formData);
console.log("Documents to Carry:", formData.Documents_to_Carry);
  return (
    <div className="body">
      <div className="main-notice" ref={ref}>
        <img src={noticeHeader} alt="Header" className="header-image" />
        <h2 className="content-header">NOTICE</h2>
        <div className="flex-container">
          <p>
            <strong>Serial No:</strong> {formData.srNo}
          </p>
          <p>
            <strong>Date:</strong> {formData.date}
          </p>
        </div>
        <div className="main-body text-black">
          <p>
            <strong>To:</strong> {formData.to}
          </p>
          <p>
            <strong>Subject:</strong> {formData.subject}
          </p>
          <p>
            <strong>Intro:</strong> {formData.intro}
          </p>
          <p>
            <strong>Eligibility Criteria:</strong>
            {formData.eligibility_criteria}
          </p>
          <p>
            <strong>About Company:</strong> {formData.about}
          </p>
          <p>
            <strong>Location:</strong> {formData.location}
          </p>
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>CTC</th>
                <th>Position</th>
              </tr>
            </thead>
            <tbody>
              {formData.tableData.map((row) => (
                <tr>
                  <td>{row.type}</td>
                  <td>{row.salary}</td>
                  <td>{row.position}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p>
  <strong>Documents to Carry:</strong> {formData.Documents_to_Carry || "N/A"}
</p>
          <p>
            <strong>Walk-in Interview:</strong> {formData.Walk_in_interview}
          </p>
          <p>
            <strong>Company Registration Link:</strong>{" "}
            {formData.Company_registration_Link}
          </p>
          <p>
            <strong>College Registration Link:</strong>
            {`${BASE_URL}/student/${
              isPlacement ? "placement" : "internship"
            }/registration/${formData.CompanyId}`}
          </p>
          <p>
            <strong>Note:</strong> {formData.Note}
          </p>
        </div>

        <div className="fromto">
          <p>{formData.From}</p>
          <p>{formData.From_designation}</p>
        </div>
        <img src={copytoimage} alt="Footer" className="footer-image" />
      </div>
    </div>
  );
});

export default Notice;
