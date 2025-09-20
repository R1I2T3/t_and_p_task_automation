import { forwardRef } from "react";
import "./notice.css";
import noticeHeader from "@/assets/tcet header.jpg";
import { BASE_URL } from "@/constant";
import { FormDataType } from "@/pages/staff/placement_company";

const Notice = forwardRef<
  HTMLDivElement,
  { formData: FormDataType; isPlacement?: boolean }
>(({ formData, isPlacement = true }, ref) => {
  const hasMultipleJobs = formData.jobOffers.length > 1;
  const singleJob = !hasMultipleJobs ? formData.jobOffers[0] : null;

  return (
    <div className="notice-body">
      <div className="notice-container" ref={ref}>
        {/* Header */}
        <img src={noticeHeader} alt="Header" className="header-image" />

        <h2 className="notice-title">NOTICE</h2>

        <div className="notice-meta">
          <p>
            <strong>Sr. No:</strong> TCET/T&P/PMT {formData.name} of{" "}
            {new Date().getFullYear()}
          </p>
          <p>
            <strong>Date:</strong> {formData.Notice.date}
          </p>
        </div>

        {/* Body */}
        <div className="notice-content">
          <p>
            <strong>To:</strong> All concerned Students of {formData.batch}{" "}
            Batch
          </p>

          <p>
            <strong>Sub:</strong> {formData.Notice.subject}
          </p>

          <ol>
            <li>{formData.Notice.intro}</li>

            <li>
              <strong>Eligibility Criteria:</strong>
              <ul>
                <li>10th Marks ≥ {formData.min_tenth_marks}%</li>
                <li>12th Marks ≥ {formData.min_higher_secondary_marks}%</li>
                <li>CGPA ≥ {formData.min_cgpa}</li>
                <li>
                  Backlogs Accepted: {formData.accepted_kt ? "Yes" : "No"}
                </li>
                <li>
                  Eligible Departments:{" "}
                  {formData.selectedDepartments.join(", ")}
                </li>
              </ul>
            </li>

            {!hasMultipleJobs && singleJob && (
              <>
                <li>
                  <strong>Designation:</strong> {singleJob.role}
                </li>

                <li>
                  <strong>Key Responsibilities:</strong>
                  <ul>
                    {singleJob.skills.split("\n").map((line, idx) => (
                      <li key={idx}>{line}</li>
                    ))}
                  </ul>
                </li>

                <li>
                  <strong>Emoluments (CTC):</strong> {singleJob.salary}
                </li>
              </>
            )}

            {hasMultipleJobs && (
              <li>
                <strong>Job Roles:</strong>
                <table className="notice-table">
                  <thead>
                    <tr>
                      <th>Role</th>
                      <th>Salary (CTC)</th>
                      <th>Skills / Responsibilities</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.jobOffers.map((job, index) => (
                      <tr key={index}>
                        <td>{job.role}</td>
                        <td>{job.salary}</td>
                        <td style={{ textAlign: "left" }}>{job.skills}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </li>
            )}

            <li>
              <strong>About Company:</strong> {formData.Notice.about}
            </li>

            <li>
              <strong>Job Location:</strong> {formData.Notice.location}
            </li>

            <li>
              All the eligible and interested students are required to register
              online before the deadline.
              <br />
              <strong>Company Registration Link:</strong>{" "}
              <a href={formData.Notice.Company_registration_Link}>
                {formData.Notice.Company_registration_Link}
              </a>
              <br />
              <strong>College Registration Link:</strong>{" "}
              {`${BASE_URL}/student/${
                isPlacement ? "placement" : "internship"
              }/registration/${formData.name}`}
            </li>

            <li>
              <strong>Note:</strong> {formData.Notice.Note}
            </li>
          </ol>
        </div>

        <div className="notice-bottom">
          <div className="notice-copyto">
            <p>
              <strong>Copy to:</strong>
            </p>
            <ul>
              <li>Principal</li>
              <li>Vice-Principal</li>
              <li>All Deans</li>
              <li>All HODs</li>
              <li>Website</li>
              <li>Notice Board of TCET</li>
            </ul>
          </div>

          <div className="notice-signature">
            <p>Sd/-</p>
            <p>({formData.Notice.From})</p>
            <p>{formData.Notice.From_designation}</p>
          </div>
        </div>
      </div>
    </div>
  );
});

export default Notice;
