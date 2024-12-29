/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import "../DutyChart.css";
import headerImage from "@/assets/tcet header.jpg";
import copytoimage from "@/assets/pmt-placement_drive_copytoImage.png";

const TrainingNotice = () => {
  const [formData, setFormData] = useState({
    srNo: "",
    to: "",
    subject: "",
    date: new Date().toISOString().split("T")[0],
    Intro: "",
    Note: "",
    From: "",
    From_designation: "",
  });

  const [tableData, setTableData] = useState([
    {
      BatchNo: "",
      Date: "",
      Time: "",
      Program: "",
      TopicsToRevise: "",
    },
  ]);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const addRow = () => {
    setTableData([
      ...tableData,
      {
        BatchNo: "",
        Date: "",
        Time: "",
        Program: "",
        TopicsToRevise: "",
      },
    ]);
  };

  const handleTableChange = (index: number, field: string, value: string) => {
    const updatedTableData = [...tableData];
    // @ts-expect-error: Object is possibly 'null'.
    updatedTableData[index][field] = value;
    setTableData(updatedTableData);
  };

  const removeRow = (index: any) => {
    const updatedTableData = tableData.filter((_, i) => i !== index);
    setTableData(updatedTableData);
  };

  const printContent = () => {
    const newWindow = window.open("", "_blank", "width=800,height=600");
    newWindow?.document.write(`
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              margin: 0;
            }
            .flex-container {
              display: flex;
              justify-content: space-between;
              align-items: center;
              gap: 20px;
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
            .content-header {
              margin-bottom: 5px;
              text-align: center;
            }
            .fromto {
              float: right;
              margin-right: 20px;
            }

            .footerImage {
              max-width: 100%;
              height: auto;
              object-fit: contain;
              margin-top: 30px;
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
          <p><strong>To:</strong> ${formData.to}</p>
          <p><strong>Subject:</strong> ${formData.subject}</p>
          <p><strong>Intro:</strong> ${formData.Intro}</p>
           <p><strong>Note:</strong> ${formData.Note}</p>
          <table>
            <thead>
              <tr>
                <th>Batch No</th>
                <th>Date</th>
                <th>Time</th>
                <th>Program</th>
                <th>Topics to Revise</th>
              </tr>
            </thead>
            <tbody>
              ${tableData
                .map(
                  (row) => `
                <tr>
                  <td>${row.BatchNo}</td>
                  <td>${row.Date}</td>
                  <td>${row.Time}</td>
                  <td>${row.Program}</td>
                  <td>${row.TopicsToRevise}</td>
                </tr>`
                )
                .join("")}
            </tbody>
          </table>
         
          <div class="fromto">
            <p>${formData.From}</p>
            <p>${formData.From_designation}</p>
          </div>
           ${
             copytoimage
               ? `<img src="${copytoimage}" alt="Footer" class="footerImage" />`
               : ""
           }
        </body>
      </html>
    `);
    newWindow?.document.close();
    newWindow?.print();
  };

  return (
    <div className="duty-chart-container">
      <h2 className="duty-chart-title">NOTICE DETAILS : Training</h2>
      <form className="form-grid">
        {Object.entries(formData).map(([key, value]) => (
          <div key={key} className="form-group">
            <label htmlFor={key} className="form-label">
              {key.replace(/_/g, " ").toUpperCase()}
            </label>
            <input
              id={key}
              type={key === "date" ? "date" : "text"}
              name={key}
              value={value}
              onChange={handleInputChange}
              placeholder={key.replace(/_/g, " ").toUpperCase()}
              className="form-input"
            />
          </div>
        ))}
      </form>

      <div className="table-container">
        <h3>Table Data</h3>
        <table className="duty-table">
          <thead>
            <tr>
              <th>Batch No</th>
              <th>Date</th>
              <th>Time</th>
              <th>Program</th>
              <th>Topics to Revise</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, index) => (
              <tr key={index}>
                {Object.keys(row).map((field) => (
                  <td key={field}>
                    <input
                      type="text"
                      style={{ marginRight: 10 }}
                      //   @ts-expect-error: Object is possibly 'null'.
                      value={row[field]}
                      onChange={(e) =>
                        handleTableChange(index, field, e.target.value)
                      }
                    />
                  </td>
                ))}
                <td>
                  <button
                    className="button remove-button"
                    onClick={() => removeRow(index)}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="button-container">
        <button className="button" onClick={addRow}>
          Add Row
        </button>
        <button className="button" onClick={printContent}>
          Print Content
        </button>
      </div>
    </div>
  );
};

export default TrainingNotice;
