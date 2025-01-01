import React from "react";
import PlacementNotice from "../placement_officer/NoticeCreation";
import InternshipNotice from "../internship_officer/InternShipNotice";
import TrainingNotice from "../training_officer/TrainingNotice";
import InfrastructureBooking from "./components/Infrastructure/InfraNotice";
const StaffNotice = () => {
  const [noticeType, setNoticeType] = React.useState("placement");
  const noticeTypes = ["placement", "internship", "training", "Infrastructure"];
  return (
    <div>
      {noticeTypes.map((type) => {
        return (
          <button
            onClick={() => setNoticeType(type)}
            className="border-white border-[2px] bg-orange-500"
          >
            {type}
          </button>
        );
      })}
      {noticeType === "placement" && <PlacementNotice />}
      {noticeType === "internship" && <InternshipNotice />}
      {noticeType === "training" && <TrainingNotice />}
      {noticeType === "Infrastructure" && <InfrastructureBooking />}
    </div>
  );
};

export default StaffNotice;
