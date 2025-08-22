
import React from "react";
import { Button } from "@/components/ui/button";

const HealthStatsSection = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-[var(--dark)] mb-4">Medications</h2>
        <div className="space-y-4">
          <div className="border-l-4 border-secondary-green p-3 bg-gray-50 rounded-r-lg">
            <div className="flex justify-between">
              <h4 className="font-medium">Amlodipine 5mg</h4>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Active</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">1 tablet daily</p>
            <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
              <span>Started: Jan 15, 2025</span>
              <span>Refill: May 15, 2025</span>
            </div>
          </div>
          
          <div className="border-l-4 border-secondary-green p-3 bg-gray-50 rounded-r-lg">
            <div className="flex justify-between">
              <h4 className="font-medium">Ventolin Inhaler</h4>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Active</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">2 puffs as needed</p>
            <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
              <span>Started: May 20, 2021</span>
              <span>Refill: June 01, 2025</span>
            </div>
          </div>
        </div>
        
        <Button variant="outline" className="w-full mt-4">
          View All Medications
        </Button>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-[var(--dark)] mb-4">Recent Test Results</h2>
        <div className="space-y-4">
          <div className="border border-gray-200 p-3 rounded-lg">
            <div className="flex justify-between">
              <h4 className="font-medium">Blood Pressure</h4>
              <span className="text-xs text-gray-500">April 5, 2025</span>
            </div>
            <div className="mt-2 flex items-end">
              <span className="text-2xl font-semibold text-primary-blue">135/85</span>
              <span className="text-sm text-gray-500 ml-2 mb-1">mmHg</span>
            </div>
            <p className="text-xs text-orange-600 mt-1">Slightly elevated</p>
          </div>
          
          <div className="border border-gray-200 p-3 rounded-lg">
            <div className="flex justify-between">
              <h4 className="font-medium">Blood Glucose</h4>
              <span className="text-xs text-gray-500">April 5, 2025</span>
            </div>
            <div className="mt-2 flex items-end">
              <span className="text-2xl font-semibold text-green-600">98</span>
              <span className="text-sm text-gray-500 ml-2 mb-1">mg/dL</span>
            </div>
            <p className="text-xs text-green-600 mt-1">Normal range</p>
          </div>
        </div>
        
        <Button variant="outline" className="w-full mt-4">
          View All Test Results
        </Button>
      </div>
    </div>
  );
};

export default HealthStatsSection;
