import React, { useState, useEffect } from "react";
import { Clock, Plus, X, Calendar, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

export interface TimeSlot {
  start: string;
  end: string;
}

export interface DaySchedule {
  available: boolean;
  times: TimeSlot[];
}

export interface WeeklySchedule {
  Sun: DaySchedule;
  Mon: DaySchedule;
  Tue: DaySchedule;
  Wed: DaySchedule;
  Thu: DaySchedule;
  Fri: DaySchedule;
  Sat: DaySchedule;
}

interface AvailabilitySchedulerProps {
  currentSchedule?: WeeklySchedule;
  onSave: (schedule: WeeklySchedule) => void;
  trigger?: React.ReactNode;
}

const AvailabilityScheduler: React.FC<AvailabilitySchedulerProps> = ({
  currentSchedule,
  onSave,
  trigger,
}) => {
  const [schedule, setSchedule] = useState<WeeklySchedule>({
    Sun: { available: false, times: [] },
    Mon: { available: true, times: [{ start: "9:00am", end: "5:00pm" }] },
    Tue: { available: true, times: [{ start: "9:00am", end: "5:00pm" }] },
    Wed: { available: true, times: [{ start: "9:00am", end: "5:00pm" }] },
    Thu: { available: true, times: [{ start: "9:00am", end: "5:00pm" }] },
    Fri: { available: true, times: [{ start: "9:00am", end: "5:00pm" }] },
    Sat: { available: false, times: [] },
  });

  const [repeatWeekly, setRepeatWeekly] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [appointmentDuration, setAppointmentDuration] = useState("30");
  const [customDuration, setCustomDuration] = useState(30);
  const [customTimeUnit, setCustomTimeUnit] = useState<"minutes" | "hours">(
    "minutes",
  );

  // Initialize schedule from props
  useEffect(() => {
    if (currentSchedule) {
      setSchedule(currentSchedule);
    }
  }, [currentSchedule]);

  const toggleDayAvailability = (day: keyof WeeklySchedule) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        available: !prev[day].available,
        times: !prev[day].available ? [{ start: "9:00am", end: "5:00pm" }] : [],
      },
    }));
  };

  const addTimeSlot = (day: keyof WeeklySchedule) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        times: [...prev[day].times, { start: "9:00am", end: "5:00pm" }],
      },
    }));
  };

  const removeTimeSlot = (day: keyof WeeklySchedule, index: number) => {
    setSchedule((prev) => {
      const updatedTimes = prev[day].times.filter((_, i) => i !== index);

      // If no times left, mark day as unavailable
      if (updatedTimes.length === 0) {
        return {
          ...prev,
          [day]: {
            available: false,
            times: [],
          },
        };
      }

      return {
        ...prev,
        [day]: {
          ...prev[day],
          times: updatedTimes,
        },
      };
    });
  };

  const updateTime = (
    day: keyof WeeklySchedule,
    index: number,
    field: "start" | "end",
    value: string,
  ) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        times: prev[day].times.map((time, i) =>
          i === index ? { ...time, [field]: value } : time,
        ),
      },
    }));
  };

  const handleSave = () => {
    onSave(schedule);
    setIsOpen(false);
  };

  const handleCustomDurationChange = (value: number) => {
    if (value >= 1 && value <= 24) {
      setCustomDuration(value);
    }
  };

  const timeOptions = [
    "12:00am",
    "12:30am",
    "1:00am",
    "1:30am",
    "2:00am",
    "2:30am",
    "3:00am",
    "3:30am",
    "4:00am",
    "4:30am",
    "5:00am",
    "5:30am",
    "6:00am",
    "6:30am",
    "7:00am",
    "7:30am",
    "8:00am",
    "8:30am",
    "9:00am",
    "9:30am",
    "10:00am",
    "10:30am",
    "11:00am",
    "11:30am",
    "12:00pm",
    "12:30pm",
    "1:00pm",
    "1:30pm",
    "2:00pm",
    "2:30pm",
    "3:00pm",
    "3:30pm",
    "4:00pm",
    "4:30pm",
    "5:00pm",
    "5:30pm",
    "6:00pm",
    "6:30pm",
    "7:00pm",
    "7:30pm",
    "8:00pm",
    "8:30pm",
    "9:00pm",
    "9:30pm",
    "10:00pm",
    "10:30pm",
    "11:00pm",
    "11:30pm",
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="icon">
            <Clock className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-gray-600" />
            General availability
          </DialogTitle>
        </DialogHeader>

        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4">
            Set when you're regularly available for appointments.
          </p>

          {/* Repeat Weekly Toggle */}
          <div className="mb-6">
            <select
              value={repeatWeekly ? "weekly" : "once"}
              onChange={(e) => setRepeatWeekly(e.target.value === "weekly")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="weekly">Repeat weekly</option>
              <option value="once">One time only</option>
            </select>
          </div>

          {/* Appointment Duration */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Appointment Duration
            </label>
            <select
              value={appointmentDuration}
              onChange={(e) => setAppointmentDuration(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">1 hour</option>
              <option value="90">1.5 hours</option>
              <option value="120">2 hours</option>
              <option value="custom">Custom duration</option>
            </select>

            {/* Custom Duration Input */}
            {appointmentDuration === "custom" && (
              <div className="mt-3 p-3 border border-gray-200 rounded-md bg-gray-50">
                <div className="flex items-center gap-3">
                  {/* Number Input */}
                  <div className="flex-1">
                    <input
                      type="number"
                      min="1"
                      max="24"
                      value={customDuration}
                      onChange={(e) =>
                        handleCustomDurationChange(
                          parseInt(e.target.value) || 1,
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {/* Time Unit Toggle */}
                  <div className="flex-1">
                    <select
                      value={customTimeUnit}
                      onChange={(e) =>
                        setCustomTimeUnit(e.target.value as "minutes" | "hours")
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="minutes">Minutes</option>
                      <option value="hours">Hours</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Days Schedule */}
          <div className="space-y-1 mb-6">
            {Object.entries(schedule).map(([day, config]) => (
              <div key={day} className="py-2">
                {!config.available ? (
                  <div className="flex items-center gap-3">
                    {/* Day name */}
                    <div className="w-10 text-sm font-medium text-gray-700">
                      {day}
                    </div>
                    <div className="flex items-center justify-between flex-1">
                      <span className="text-sm text-gray-500">Unavailable</span>
                      <button
                        onClick={() =>
                          toggleDayAvailability(day as keyof WeeklySchedule)
                        }
                        className="w-6 h-6 flex items-center justify-center rounded-full border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-colors"
                      >
                        <Plus className="w-3 h-3 text-gray-400 hover:text-blue-500" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    {config.times.map((timeSlot, index) => (
                      <div key={index} className="flex items-center gap-3">
                        {/* Day name (only show on first time slot) */}
                        <div className="w-10 text-sm font-medium text-gray-700">
                          {index === 0 ? day : ""}
                        </div>

                        <div className="flex items-center gap-2 flex-1">
                          {/* Start time */}
                          <select
                            value={timeSlot.start}
                            onChange={(e) =>
                              updateTime(
                                day as keyof WeeklySchedule,
                                index,
                                "start",
                                e.target.value,
                              )
                            }
                            className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            {timeOptions.map((time) => (
                              <option key={time} value={time}>
                                {time}
                              </option>
                            ))}
                          </select>

                          <span className="text-gray-400">–</span>

                          {/* End time */}
                          <select
                            value={timeSlot.end}
                            onChange={(e) =>
                              updateTime(
                                day as keyof WeeklySchedule,
                                index,
                                "end",
                                e.target.value,
                              )
                            }
                            className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            {timeOptions.map((time) => (
                              <option key={time} value={time}>
                                {time}
                              </option>
                            ))}
                          </select>

                          {/* Remove time slot button */}
                          <button
                            onClick={() =>
                              removeTimeSlot(day as keyof WeeklySchedule, index)
                            }
                            className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                          >
                            <div className="w-4 h-4 rounded-full border border-gray-400 flex items-center justify-center hover:border-red-500 relative">
                              <div className="w-2 h-0.5 bg-gray-400 hover:bg-red-500"></div>
                            </div>
                          </button>

                          {/* Add time slot button (only show on last item) */}
                          {index === config.times.length - 1 && (
                            <button
                              onClick={() =>
                                addTimeSlot(day as keyof WeeklySchedule)
                              }
                              className="w-6 h-6 flex items-center justify-center rounded-full border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-colors"
                            >
                              <Plus className="w-3 h-3 text-gray-400 hover:text-blue-500" />
                            </button>
                          )}

                          {/* Copy times button */}
                          <button className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 transition-colors">
                            <Calendar className="w-3 h-3 text-gray-400" />
                          </button>
                        </div>

                        {/* Toggle availability button for available days (only show on first time slot) */}
                        {index === 0 && (
                          <button
                            onClick={() =>
                              toggleDayAvailability(day as keyof WeeklySchedule)
                            }
                            className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                            title="Mark as unavailable"
                          >
                            <div className="w-4 h-4 rounded-full border border-gray-400 flex items-center justify-center hover:border-red-500 relative">
                              <div className="w-2 h-0.5 bg-gray-400 hover:bg-red-500"></div>
                            </div>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSave} className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              Save Schedule
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AvailabilityScheduler;
