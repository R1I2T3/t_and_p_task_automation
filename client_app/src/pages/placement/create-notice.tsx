import { MenuItem, Select } from "@mui/material";
import React, { useState } from "react";
import SingleOffer from "./components/SingleOffer";
import MultiOffer from "./components/MutliOffer";
import { Label } from "@/components/ui/label";
const CreateNotice = () => {
  const [type, setType] = useState("single");
  return (
    <div className="mx-auto w-full">
      <h1 className="text-xl font-bold">Choose Notice type</h1>
      <Select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="w-[50%] mb-5"
      >
        <MenuItem value="single">Single</MenuItem>
        <MenuItem value="multiple">Multiple</MenuItem>
      </Select>
      {type === "single" ? <SingleOffer /> : <MultiOffer />}
    </div>
  );
};

export default CreateNotice;
