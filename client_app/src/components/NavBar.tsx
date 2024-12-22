import React from "react";
import { MoveLeft } from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router";

const NavBar = ({ title }: { title: string }) => {
  const navigate = useNavigate();
  return (
    <div className="flex bg-[#d17a00] w-full justify-between absolute top-0 left-0  mb-10">
      <div className="flex items-center gap-2 p-2">
        <Button
          className="bg-[#d17a00] hover:bg-[#d17a00]/80 text-white text-3xl"
          onClick={() => navigate(-1)}
        >
          <MoveLeft size={100} />
        </Button>
        <span className="text-white font-bold text-xl">{title}</span>
      </div>
      <img src="/tcet_logo_2.png" />
    </div>
  );
};

export default NavBar;
