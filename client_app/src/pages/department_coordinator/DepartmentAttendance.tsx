import React, { useState } from "react";
import Sidebar from "./components/SideBar";
const DepartmentAttendance = () => {
  const [attendanceFile, setAttendanceFile] = useState<File | null>(null);
  const [marksFile, setMarksFile] = useState<File | null>(null);
  const [messages, setMessages] = useState<string[]>([]);

  const handleAttendanceSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    // Here you would typically send the file to your backend
    // For now, we'll just simulate a response
    setMessages(["Attendance file uploaded successfully"]);
  };

  const handleMarksSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Here you would typically send the file to your backend
    // For now, we'll just simulate a response
    setMessages(["Marks file uploaded successfully"]);
  };

  return (
    <Sidebar>
      <div className="relative">
        <div className="h-[80%] grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="flex flex-col justify-center items-center bg-[#153F74] text-white p-6 rounded-xl shadow-lg">
            <h3 className="text-2xl mb-4 font-bold">Academic Attendance</h3>
            <form onSubmit={handleAttendanceSubmit} className="space-y-6">
              <div>
                <label htmlFor="attendanceFile" className="block mb-2 text-sm">
                  Importing Data
                </label>
                <select
                  id="attendanceFile"
                  name="attendanceFile"
                  className="w-full p-2 bg-gray-700 text-white rounded"
                  disabled
                >
                  <option value="excel">CSV</option>
                </select>
              </div>
              <input type="hidden" value="attendanceForm" name="formType" />
              <div>
                <label className="block mb-2 text-sm">File Import</label>
                <input
                  type="file"
                  className="w-full px-4 py-3 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300 ease-in-out placeholder-gray-400"
                  required
                  name="file_attendance"
                  onChange={(e) =>
                    setAttendanceFile(e.target.files ? e.target.files[0] : null)
                  }
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-[#D48525] text-white rounded-full"
              >
                SUBMIT
              </button>
            </form>
          </div>
          <div className="flex flex-col justify-center items-center bg-[#153F74] text-white p-6 rounded-xl shadow-lg">
            <h3 className="text-2xl mb-4 font-bold">Academic Marks</h3>
            <form onSubmit={handleMarksSubmit} className="space-y-6">
              <div>
                <label htmlFor="marksFile" className="block mb-2 text-sm">
                  Importing Data
                </label>
                <select
                  id="marksFile"
                  className="w-full p-2 bg-gray-700 text-white rounded"
                  name="marksFile"
                  disabled
                >
                  <option value="excel">CSV</option>
                </select>
              </div>
              <input type="hidden" value="marksForm" name="formType" />
              <div>
                <label className="block mb-2 text-sm">File Import</label>
                <input
                  type="file"
                  className="w-full px-4 py-3 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300 ease-in-out placeholder-gray-400"
                  name="file_performance"
                  required
                  onChange={(e) =>
                    setMarksFile(e.target.files ? e.target.files[0] : null)
                  }
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-[#D48525] text-white rounded-full"
              >
                SUBMIT
              </button>
            </form>
          </div>
        </div>
        {messages.length > 0 && (
          <ul className="list-none bg-orange-600 text-white p-3 mt-10">
            {messages.map((message, index) => (
              <li key={index}>{message}</li>
            ))}
          </ul>
        )}
      </div>
    </Sidebar>
  );
};

export default DepartmentAttendance;
