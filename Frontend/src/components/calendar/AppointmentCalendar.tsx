import React, { useState, useEffect } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Video,
  MapPin,
  Filter,
  Check,
  X,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isToday,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isWithinInterval,
  addDays,
  startOfDay,
  endOfDay,
} from "date-fns";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Appointment } from "@/services/appointmentService";

interface AppointmentCalendarProps {
  appointments: Appointment[];
  onAppointmentClick?: (appointment: Appointment) => void;
  onAppointmentConfirm?: (appointmentId: number) => void;
  onAppointmentReject?: (appointmentId: number) => void;
}

type FilterType = "all" | "today" | "tomorrow" | "week" | "month";

const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({
  appointments,
  onAppointmentClick,
  onAppointmentConfirm,
  onAppointmentReject,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [showAppointmentDetails, setShowAppointmentDetails] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");
  const [view, setView] = useState<"calendar" | "list">("calendar");

  // Get appointments for a specific date
  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter((appointment) => {
      const appointmentDate = appointment.appointment_datetime
        ? new Date(appointment.appointment_datetime)
        : new Date(appointment.date || "");
      return isSameDay(appointmentDate, date);
    });
  };

  // Get filtered appointments based on filter type
  const getFilteredAppointments = () => {
    const now = new Date();
    const today = startOfDay(now);
    const tomorrow = startOfDay(addDays(now, 1));
    const weekEnd = endOfDay(addDays(now, 7));
    const monthEnd = endOfMonth(now);

    switch (filter) {
      case "today":
        return appointments.filter((appointment) => {
          const appointmentDate = appointment.appointment_datetime
            ? new Date(appointment.appointment_datetime)
            : new Date(appointment.date || "");
          return isWithinInterval(appointmentDate, {
            start: today,
            end: endOfDay(today),
          });
        });
      case "tomorrow":
        return appointments.filter((appointment) => {
          const appointmentDate = appointment.appointment_datetime
            ? new Date(appointment.appointment_datetime)
            : new Date(appointment.date || "");
          return isWithinInterval(appointmentDate, {
            start: tomorrow,
            end: endOfDay(tomorrow),
          });
        });
      case "week":
        return appointments.filter((appointment) => {
          const appointmentDate = appointment.appointment_datetime
            ? new Date(appointment.appointment_datetime)
            : new Date(appointment.date || "");
          return isWithinInterval(appointmentDate, {
            start: today,
            end: weekEnd,
          });
        });
      case "month":
        return appointments.filter((appointment) => {
          const appointmentDate = appointment.appointment_datetime
            ? new Date(appointment.appointment_datetime)
            : new Date(appointment.date || "");
          return isWithinInterval(appointmentDate, {
            start: today,
            end: monthEnd,
          });
        });
      default:
        return appointments;
    }
  };

  // Calendar grid setup
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    const dayAppointments = getAppointmentsForDate(date);
    if (dayAppointments.length === 1) {
      setSelectedAppointment(dayAppointments[0]);
      setShowAppointmentDetails(true);
    }
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowAppointmentDetails(true);
    if (onAppointmentClick) {
      onAppointmentClick(appointment);
    }
  };

  const getAppointmentModeIcon = (appointment: Appointment) => {
    const isVirtual = appointment.type === "virtual";
    return isVirtual ? (
      <Video className="h-3 w-3" />
    ) : (
      <MapPin className="h-3 w-3" />
    );
  };

  const getAppointmentModeColor = (appointment: Appointment) => {
    const isVirtual = appointment.type === "virtual";
    return isVirtual
      ? "bg-green-100 text-green-800"
      : "bg-orange-100 text-orange-800";
  };

  const getAppointmentModeText = (appointment: Appointment) => {
    const isVirtual = appointment.type === "virtual";
    return isVirtual ? "Video Call" : "Physical Visit";
  };

  const getAppointmentTime = (appointment: Appointment) => {
    if (appointment.time) return appointment.time;
    if (appointment.appointment_datetime) {
      return format(new Date(appointment.appointment_datetime), "h:mm a");
    }
    return "Time TBD";
  };

  const getAppointmentDate = (appointment: Appointment) => {
    if (appointment.appointment_datetime) {
      return new Date(appointment.appointment_datetime);
    }
    if (appointment.date) {
      return new Date(appointment.date);
    }
    return new Date();
  };

  const renderCalendarView = () => (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          {format(currentDate, "MMMM yyyy")}
        </h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-4">
          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="p-2 text-center text-sm font-medium text-gray-500"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day) => {
              const dayAppointments = getAppointmentsForDate(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isCurrentDay = isToday(day);
              const hasAppointments = dayAppointments.length > 0;

              return (
                <div
                  key={day.toISOString()}
                  className={`
                    relative p-2 min-h-[100px] border border-gray-200 cursor-pointer
                    transition-all duration-200 hover:bg-gray-50 hover:shadow-sm
                    ${!isCurrentMonth ? "text-gray-400 bg-gray-50/50" : "bg-white"}
                    ${isCurrentDay ? "bg-blue-50 border-blue-300 shadow-sm" : ""}
                    ${selectedDate && isSameDay(day, selectedDate) ? "bg-blue-100 border-blue-400 shadow-md" : ""}
                    ${hasAppointments ? "border-l-4 border-l-blue-500" : ""}
                  `}
                  onClick={() => handleDateClick(day)}
                >
                  <div
                    className={`text-sm font-medium mb-1 ${isCurrentDay ? "text-blue-700 font-bold" : ""}`}
                  >
                    {format(day, "d")}
                  </div>

                  {hasAppointments && (
                    <div className="space-y-1">
                      {dayAppointments.slice(0, 2).map((appointment, index) => (
                        <div
                          key={appointment.id}
                          className={`
                            text-xs px-2 py-1 rounded-md truncate cursor-pointer
                            transition-all duration-150 hover:shadow-sm
                            ${getAppointmentModeColor(appointment)}
                          `}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAppointmentClick(appointment);
                          }}
                        >
                          <div className="flex items-center gap-1">
                            {getAppointmentModeIcon(appointment)}
                            <span>{getAppointmentTime(appointment)}</span>
                          </div>
                        </div>
                      ))}

                      {dayAppointments.length > 2 && (
                        <div className="text-xs text-blue-600 px-2 py-1 bg-blue-50 rounded-md font-medium">
                          +{dayAppointments.length - 2} more
                        </div>
                      )}
                    </div>
                  )}

                  {hasAppointments && (
                    <div className="absolute top-2 right-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderListView = () => {
    const filteredAppointments = getFilteredAppointments();

    return (
      <div className="space-y-6">
        {filteredAppointments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No appointments found
              </h3>
              <p className="text-gray-500">
                No appointments match your current filter.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredAppointments.map((appointment) => (
            <Card
              key={appointment.id}
              className="cursor-pointer hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500"
            >
              <CardContent
                className="p-4"
                onClick={() => handleAppointmentClick(appointment)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="font-medium text-blue-600">
                          {format(
                            getAppointmentDate(appointment),
                            "MMM dd, yyyy",
                          )}{" "}
                          at {getAppointmentTime(appointment)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-700">
                          {appointment.patient?.user?.name || "Unknown Patient"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Badge
                      variant="outline"
                      className={getAppointmentModeColor(appointment)}
                    >
                      <div className="flex items-center gap-1">
                        {getAppointmentModeIcon(appointment)}
                        <span>{getAppointmentModeText(appointment)}</span>
                      </div>
                    </Badge>

                    <Badge variant="secondary">{appointment.status}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-4 p-4 bg-gray-50 rounded-lg border">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select
              value={filter}
              onValueChange={(value: FilterType) => setFilter(value)}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Appointments</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="tomorrow">Tomorrow</SelectItem>
                <SelectItem value="week">Next Week</SelectItem>
                <SelectItem value="month">Next Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant={view === "calendar" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("calendar")}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Calendar
          </Button>
          <Button
            variant={view === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("list")}
          >
            List View
          </Button>
        </div>
      </div>

      {/* Content */}
      {view === "calendar" ? renderCalendarView() : renderListView()}

      {/* Appointment Details Dialog */}
      <Dialog
        open={showAppointmentDetails}
        onOpenChange={setShowAppointmentDetails}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
          </DialogHeader>

          {selectedAppointment && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Date
                  </label>
                  <p className="text-sm text-gray-900">
                    {format(
                      getAppointmentDate(selectedAppointment),
                      "MMMM dd, yyyy",
                    )}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Time
                  </label>
                  <p className="text-sm text-gray-900">
                    {getAppointmentTime(selectedAppointment)}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">
                  Patient
                </label>
                <p className="text-sm text-gray-900">
                  {selectedAppointment.patient?.user?.name || "Unknown Patient"}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">
                  Contact
                </label>
                <p className="text-sm text-gray-900">
                  {selectedAppointment.patient?.user?.phone_number ||
                    "Not provided"}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">
                  Mode
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant="outline"
                    className={getAppointmentModeColor(selectedAppointment)}
                  >
                    <div className="flex items-center gap-1">
                      {getAppointmentModeIcon(selectedAppointment)}
                      <span>{getAppointmentModeText(selectedAppointment)}</span>
                    </div>
                  </Badge>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">
                  Status
                </label>
                <div className="mt-1">
                  <Badge variant="secondary">
                    {selectedAppointment.status}
                  </Badge>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                {selectedAppointment.status === "completed" ? (
                  // Only reschedule button for completed appointments
                  <Button variant="outline" size="sm" className="flex-1">
                    Reschedule
                  </Button>
                ) : selectedAppointment.status === "scheduled" ? (
                  // Actions for scheduled appointments (need confirmation)
                  <>
                    <Button
                      size="sm"
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        if (onAppointmentConfirm) {
                          onAppointmentConfirm(selectedAppointment.id);
                          setShowAppointmentDetails(false);
                        }
                      }}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Confirm
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="flex-1"
                      onClick={() => {
                        if (onAppointmentReject) {
                          onAppointmentReject(selectedAppointment.id);
                          setShowAppointmentDetails(false);
                        }
                      }}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </>
                ) : (
                  // Actions for confirmed appointments
                  <>
                    {selectedAppointment.type === "virtual" ? (
                      // Virtual appointment: Start Call, Reschedule, Cancel
                      <>
                        <Button
                          size="sm"
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                        >
                          <Video className="h-4 w-4 mr-2" />
                          Start Video Call
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          Reschedule
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex-1"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </>
                    ) : (
                      // Physical appointment: Mark Complete, Reschedule, Cancel
                      <>
                        <Button
                          size="sm"
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Mark as Complete
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          Reschedule
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex-1"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppointmentCalendar;
