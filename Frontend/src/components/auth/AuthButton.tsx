import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import AuthModal from "./AuthModal";

interface AuthButtonProps {
  defaultTab?: "signin" | "signup";
  className?: string;
  children?: React.ReactNode;
}

const AuthButton = ({ defaultTab = "signin", className, children }: AuthButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button 
        onClick={() => setIsModalOpen(true)}
        className={className || "bg-gradient-to-r from-primary-blue to-secondary-green hover:brightness-110 hover:scale-[1.02] text-white shadow-sm hover:shadow-md transition-all duration-300"}
        size={defaultTab === "signup" ? "lg" : "default"}
      >
        {children || (
          <>
            <LogIn className="mr-2 h-4 w-4" /> Sign In
          </>
        )}
      </Button>
      
      <AuthModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        defaultTab={defaultTab}
      />
    </>
  );
};

export default AuthButton;
