import React from "react";
import { Settings, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const ProfileSidebar = () => {
  const { user } = useAuth();

  // Generate user initials
  const getUserInitials = (name: string) => {
    if (!name) return "U";
    const names = name.trim().split(" ");
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (
      names[0].charAt(0) + names[names.length - 1].charAt(0)
    ).toUpperCase();
  };

  return (
    <div className="w-full md:w-1/4">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[var(--dark)]">Profile</h2>
          <Button variant="ghost" className="hover:bg-gray-100 p-2 h-auto">
            <Settings className="h-5 w-5 text-gray-500" />
          </Button>
        </div>

        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-primary-blue flex items-center justify-center text-white text-3xl mb-4">
            {getUserInitials(user?.name || "")}
          </div>
          <h3 className="text-xl font-semibold">{user?.name || "User"}</h3>
          <p className="text-gray-500 mb-4">Patient ID: P123456</p>

          <div className="grid grid-cols-2 gap-3 w-full text-sm">
            <div className="bg-gray-100 rounded-md p-3">
              <p className="text-gray-500">Age</p>
              <p className="font-semibold">35 years</p>
            </div>
            <div className="bg-gray-100 rounded-md p-3">
              <p className="text-gray-500">Blood Type</p>
              <p className="font-semibold">O+</p>
            </div>
            <div className="bg-gray-100 rounded-md p-3">
              <p className="text-gray-500">Height</p>
              <p className="font-semibold">5'10"</p>
            </div>
            <div className="bg-gray-100 rounded-md p-3">
              <p className="text-gray-500">Weight</p>
              <p className="font-semibold">75 kg</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[var(--dark)]">
            Medical History
          </h2>
          <Button variant="ghost" className="hover:bg-gray-100 p-2 h-auto">
            <FileText className="h-5 w-5 text-gray-500" />
          </Button>
        </div>

        <div className="space-y-3">
          <div className="border-l-4 border-primary-blue pl-3 py-1">
            <h4 className="font-medium">Hypertension</h4>
            <p className="text-sm text-gray-500">Diagnosed: Jan 2021</p>
          </div>
          <div className="border-l-4 border-primary-blue pl-3 py-1">
            <h4 className="font-medium">Asthma</h4>
            <p className="text-sm text-gray-500">Diagnosed: May 2015</p>
          </div>
          <div className="border-l-4 border-red-500 pl-3 py-1">
            <h4 className="font-medium">Allergy - Penicillin</h4>
            <p className="text-sm text-gray-500">Severe reaction</p>
          </div>
        </div>

        <Button variant="outline" className="w-full mt-4">
          View Complete History
        </Button>
      </div>
    </div>
  );
};

export default ProfileSidebar;
