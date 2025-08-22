import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Heart,
  Microscope,
  Video,
  MapPin,
  CheckCircle,
  X,
  AlertCircle,
  Info,
  Star,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

// Mock occupied slots data for demonstration
const getMockOccupiedTimes = (providerType: string, date: Date) => {
  const dayOfWeek = date.getDay();

  if (providerType === "doctor") {
    // Different patterns for doctors
    if (dayOfWeek === 1) return ["8:00 AM", "9:00 AM", "2:00 PM", "3:00 PM"];
    if (dayOfWeek === 2) return ["10:00 AM", "11:00 AM", "4:00 PM"];
    if (dayOfWeek === 3) return ["8:30 AM", "1:00 PM", "2:30 PM", "5:00 PM"];
    if (dayOfWeek === 4) return ["9:30 AM", "3:30 PM", "4:30 PM"];
    if (dayOfWeek === 5) return ["8:00 AM", "11:30 AM", "1:30 PM", "2:00 PM", "4:00 PM"];
    return [];
  } else if (providerType === "nursing") {
    // Different patterns for nursing
    if (dayOfWeek === 1) return ["8:00 AM", "8:30 AM", "9:00 AM", "5:00 PM"];
    if (dayOfWeek === 2) return ["1:00 PM", "2:00 PM", "3:00 PM"];
    if (dayOfWeek === 3) return ["10:00 AM", "11:00 AM", "4:30 PM"];
    if (dayOfWeek === 4) return ["2:30 PM", "3:30 PM", "4:00 PM", "5:30 PM"];
    if (dayOfWeek === 5) return ["8:30 AM", "9:30 AM", "1:30 PM", "2:30 PM"];
    return [];
  } else if (providerType === "lab") {
    // Different patterns for lab
    if (dayOfWeek === 1) return ["7:00 AM", "7:30 AM", "8:00 AM"];
    if (dayOfWeek === 2) return ["9:00 AM", "10:00 AM", "2:00 PM"];
    if (dayOfWeek === 3) return ["8:30 AM", "11:30 AM", "3:00 PM"];
    if (dayOfWeek === 4) return ["7:30 AM", "9:30 AM", "1:30 PM"];
    if (dayOfWeek === 5) return ["8:00 AM", "10:30 AM", "11:00 AM", "2:30 PM"];
    return [];
  }
  return [];
};

const timeSlots = [
  "7:00 AM", "7:30 AM", "8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM",
  "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
  "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM",
  "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM"
];

const BookingDemo = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTimes, setSelectedTimes] = useState<{
    doctor: string | null;
    nursing: string | null;
    lab: string | null;
  }>({
    doctor: null,
    nursing: null,
    lab: null,
  });

  const [consultationType, setConsultationType] = useState("physical");

  const handleTimeSelection = (providerType: string, time: string) => {
    setSelectedTimes(prev => ({
      ...prev,
      [providerType]: prev[providerType] === time ? null : time
    }));
  };

  const isTimeOccupied = (providerType: string, time: string) => {
    if (!selectedDate) return false;
    const occupiedTimes = getMockOccupiedTimes(providerType, selectedDate);
    return occupiedTimes.includes(time);
  };

  const getAvailableSlots = (providerType: string) => {
    if (!selectedDate) return 0;
    const occupiedTimes = getMockOccupiedTimes(providerType, selectedDate);
    return timeSlots.length - occupiedTimes.length;
  };

  const getOccupiedSlots = (providerType: string) => {
    if (!selectedDate) return 0;
    const occupiedTimes = getMockOccupiedTimes(providerType, selectedDate);
    return occupiedTimes.length;
  };

  const handleBookDemo = (providerType: string) => {
    const selectedTime = selectedTimes[providerType];
    if (selectedTime && selectedDate) {
      toast({
        title: "Demo Booking Successful!",
        description: `${providerType.charAt(0).toUpperCase() + providerType.slice(1)} appointment booked for ${selectedDate.toLocaleDateString()} at ${selectedTime}`,
      });
    }
  };

  const TimeSlotGrid = ({ providerType, title, icon, color }: {
    providerType: string;
    title: string;
    icon: React.ReactNode;
    color: string;
  }) => (
    <Card className="h-full">
      <CardHeader className={`${color} text-white`}>
        <CardTitle className="flex items-center gap-2 text-lg">
          {icon}
          {title}
        </CardTitle>
        <p className="text-sm opacity-90">Select your preferred time slot</p>
      </CardHeader>
      <CardContent className="p-4">
        {!selectedDate ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <Clock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-gray-500">Please select a date first</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
              {timeSlots.map((slot) => {
                const isOccupied = isTimeOccupied(providerType, slot);
                const isSelected = selectedTimes[providerType] === slot;

                return (
                  <div
                    key={slot}
                    className={`py-2 px-1 text-center text-xs rounded-md border transition-all duration-200 ${
                      isOccupied
                        ? "bg-red-100 text-red-700 border-red-300 cursor-not-allowed opacity-75"
                        : isSelected
                          ? `${color.replace('bg-', 'bg-').replace('500', '500')} text-white border-transparent shadow-md transform scale-105 cursor-pointer`
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 cursor-pointer hover:shadow-sm"
                    }`}
                    onClick={() => !isOccupied && handleTimeSelection(providerType, slot)}
                    title={
                      isOccupied
                        ? `This time slot is already booked for ${providerType} services`
                        : isSelected
                          ? "Selected time slot"
                          : "Click to select this time slot"
                    }
                  >
                    <div className="font-medium">{slot}</div>
                    {isOccupied && (
                      <div className="text-xs mt-0.5 flex items-center justify-center gap-1">
                        <X className="h-2 w-2" />
                        Booked
                      </div>
                    )}
                    {!isOccupied && !isSelected && (
                      <div className="text-xs mt-0.5 text-green-600">
                        Available
                      </div>
                    )}
                    {isSelected && (
                      <div className="text-xs mt-0.5 flex items-center justify-center gap-1">
                        <CheckCircle className="h-2 w-2" />
                        Selected
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Statistics */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center text-xs text-gray-600 mb-2">
                <span>Available: {getAvailableSlots(providerType)}</span>
                <span>Booked: {getOccupiedSlots(providerType)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(getOccupiedSlots(providerType) / timeSlots.length) * 100}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Book Button */}
            <Button
              className={`w-full mt-4 ${color} hover:opacity-90`}
              onClick={() => handleBookDemo(providerType)}
              disabled={!selectedTimes[providerType]}
            >
              Book {title} (Demo)
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-blue-600">AFYA</span>
            <span className="text-green-600"> MAWINGUNI</span>
          </h1>
          <p className="text-gray-600 text-lg">
            Booking Interface Demo - Occupied Slots Visualization
          </p>
          <p className="text-sm text-gray-500 mt-2">
            This demo shows how fully booked dates and times appear across different provider types
          </p>
        </div>

        {/* Demo Information */}
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-blue-900 mb-1">Demo Information</h3>
                <p className="text-sm text-blue-800">
                  This is a demonstration with dummy data showing occupied time slots.
                  When payment features are implemented, these dummy examples will be replaced with real booking data.
                  Different provider types show different booking patterns and availability.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Calendar Selection */}
          <Card className="lg:col-span-1">
            <CardHeader className="bg-gray-800 text-white">
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Select Date
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  setSelectedDate(date);
                  // Reset all time selections when date changes
                  setSelectedTimes({
                    doctor: null,
                    nursing: null,
                    lab: null,
                  });
                }}
                disabled={(date) => {
                  // Disable past dates and some future dates as "fully booked"
                  const isPastDate = date < new Date(new Date().setHours(0, 0, 0, 0));
                  const dayOfWeek = date.getDay();
                  const isFullyBooked = dayOfWeek === 0; // Sundays fully booked
                  return isPastDate || isFullyBooked;
                }}
                modifiers={{
                  fullyBooked: (date) => date.getDay() === 0 && date >= new Date(),
                }}
                modifiersStyles={{
                  fullyBooked: {
                    backgroundColor: "#ef4444",
                    color: "white",
                    fontWeight: "bold",
                  },
                }}
                className="rounded-md"
              />

              {/* Legend */}
              <div className="mt-4 space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span>Fully Booked / Closed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span>Selected Date</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span>Available</span>
                </div>
              </div>

              {selectedDate && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <p className="text-sm font-medium text-green-800">
                    Selected Date
                  </p>
                  <p className="text-sm text-green-700">
                    {selectedDate.toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Doctor Booking */}
          <div className="lg:col-span-1">
            <TimeSlotGrid
              providerType="doctor"
              title="Doctor Consultation"
              icon={<User className="h-5 w-5" />}
              color="bg-blue-500"
            />
          </div>

          {/* Nursing Booking */}
          <div className="lg:col-span-1">
            <TimeSlotGrid
              providerType="nursing"
              title="Home Nursing"
              icon={<Heart className="h-5 w-5" />}
              color="bg-green-500"
            />
          </div>

          {/* Lab Booking */}
          <div className="lg:col-span-1">
            <TimeSlotGrid
              providerType="lab"
              title="Lab Tests"
              icon={<Microscope className="h-5 w-5" />}
              color="bg-purple-500"
            />
          </div>
        </div>

        {/* Summary Section */}
        {selectedDate && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Booking Summary for {selectedDate.toLocaleDateString()}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Doctor Summary */}
                <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-900">Doctor Consultation</span>
                  </div>
                  <div className="text-sm space-y-1">
                    <p>Available slots: {getAvailableSlots("doctor")}</p>
                    <p>Booked slots: {getOccupiedSlots("doctor")}</p>
                    {selectedTimes.doctor && (
                      <p className="font-medium text-blue-700">
                        Selected: {selectedTimes.doctor}
                      </p>
                    )}
                  </div>
                </div>

                {/* Nursing Summary */}
                <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-900">Home Nursing</span>
                  </div>
                  <div className="text-sm space-y-1">
                    <p>Available slots: {getAvailableSlots("nursing")}</p>
                    <p>Booked slots: {getOccupiedSlots("nursing")}</p>
                    {selectedTimes.nursing && (
                      <p className="font-medium text-green-700">
                        Selected: {selectedTimes.nursing}
                      </p>
                    )}
                  </div>
                </div>

                {/* Lab Summary */}
                <div className="p-4 border border-purple-200 rounded-lg bg-purple-50">
                  <div className="flex items-center gap-2 mb-2">
                    <Microscope className="h-4 w-4 text-purple-600" />
                    <span className="font-medium text-purple-900">Lab Tests</span>
                  </div>
                  <div className="text-sm space-y-1">
                    <p>Available slots: {getAvailableSlots("lab")}</p>
                    <p>Booked slots: {getOccupiedSlots("lab")}</p>
                    {selectedTimes.lab && (
                      <p className="font-medium text-purple-700">
                        Selected: {selectedTimes.lab}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center mt-8 p-4 bg-gray-100 rounded-lg">
          <p className="text-sm text-gray-600">
            🚀 This demo shows the occupied slots functionality across all provider types.
            The dummy data will be replaced with real booking information when payment integration is complete.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BookingDemo;
