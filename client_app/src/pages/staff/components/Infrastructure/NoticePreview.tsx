// NoticePreview.tsx
import React from "react";
import headerImage from "@/assets/tcet header.jpg";
import copytoimage from "@/assets/pmt-placement_drive_copytoImage.png";

interface FormData {
  srNo: string;
  sender: string;
  senderAddLine1: string;
  senderAddLine2: string;
  senderAddLine3: string;
  senderAddLine4: string;
  receiver: string;
  receiverAddLine1: string;
  receiverAddLine2: string;
  receiverAddLine3: string;
  receiverAddLine4: string;
  subject: string;
  date: string;
  Note: string;
  From: string;
  From_designation: string;
  content?: string;
}

const NoticePreview = React.forwardRef<HTMLDivElement, { formData: FormData }>(
  ({ formData }, ref) => {
    return (
      <div ref={ref} className="bg-white p-8 text-black">
        <img src={headerImage} alt="Header" className="w-full mb-6" />

        <h2 className="text-center text-2xl font-bold mb-6">NOTICE</h2>

        <div className="flex justify-between mb-6">
          <p>
            <strong>Serial No:</strong> {formData.srNo}
          </p>
          <p>
            <strong>Date:</strong> {formData.date}
          </p>
        </div>

        <div className="flex justify-between mb-8">
          <div className="w-1/2">
            <div className="mb-4">
              <strong>From:</strong>
              <p>{formData.sender}</p>
              <p>{formData.senderAddLine1}</p>
              <p>{formData.senderAddLine2}</p>
              <p>{formData.senderAddLine3}</p>
              <p>{formData.senderAddLine4}</p>
            </div>
          </div>

          <div className="w-1/2">
            <div className="mb-4">
              <strong>To:</strong>
              <p>{formData.receiver}</p>
              <p>{formData.receiverAddLine1}</p>
              <p>{formData.receiverAddLine2}</p>
              <p>{formData.receiverAddLine3}</p>
              <p>{formData.receiverAddLine4}</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <p>
            <strong>Subject:</strong> {formData.subject}
          </p>
        </div>

        <div
          className="min-h-[100px]"
          dangerouslySetInnerHTML={{ __html: formData.content || "" }}
        />

        <div>
          <p>
            <strong>Note:</strong> {formData.Note}
          </p>
        </div>

        <div className="text-right ">
          <p>{formData.From}</p>
          <p>{formData.From_designation}</p>
        </div>

        <img
          src={copytoimage}
          alt="Footer"
          className="max-w-[100%] object-contain h-auto"
        />
      </div>
    );
  }
);

export default NoticePreview;
