import { useState, useEffect, useCallback } from "react";
import nursingService, { NursingService } from "@/services/nursingService";
import { toast } from "@/hooks/use-toast";

// Convert NursingService to match Appointment interface for calendar compatibility
export interface NursingCalendarAppointment {
  id: number;
  patient_id: number;
  doctor_id: number; // Will use nursing_provider_id but map to doctor_id for compatibility
  appointment_datetime: string;
  status:
    | "scheduled"
    | "confirmed"
    | "completed"
    | "cancelled"
    | "rescheduled"
    | "no_show";
  type: "in_person" | "virtual";
  reason_for_visit?: string;
  symptoms?: string;
  doctor_notes?: string;
  prescription?: string;
  meeting_link?: string;
  fee: number;
  is_paid: boolean;
  patient?: {
    id: number;
    user_id: number;
    user: {
      name: string;
      email: string;
      phone_number: string;
    };
  };
}

export const useNursingCalendar = () => {
  const [appointments, setAppointments] = useState<
    NursingCalendarAppointment[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [occupiedDates, setOccupiedDates] = useState<string[]>([]);
  const [occupiedTimes, setOccupiedTimes] = useState<Record<string, string[]>>(
    {},
  );

  // Convert NursingService to calendar-compatible format
  const convertNursingServiceToAppointment = (
    service: NursingService,
  ): NursingCalendarAppointment => {
    return {
      id: service.id,
      patient_id: service.patient_id,
      doctor_id: service.nursing_provider_id, // Map nursing_provider_id to doctor_id for compatibility
      appointment_datetime: service.start_date,
      status: service.status as
        | "scheduled"
        | "confirmed"
        | "completed"
        | "cancelled"
        | "rescheduled"
        | "no_show",
      type: "in_person", // Nursing services are typically in-person
      reason_for_visit: service.service_type || "Nursing care",
      symptoms: service.notes || "",
      doctor_notes: service.notes || "",
      prescription: "",
      meeting_link: "",
      fee: 0, // Fee would need to be calculated based on service
      is_paid: false,
      patient: service.patient
        ? {
            id: service.patient.id,
            user_id: service.patient.user_id,
            user: service.patient.user,
          }
        : undefined,
    };
  };

  // Load nursing services and convert to calendar format
  const loadAppointments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const nursingServices =
        await nursingService.getNursingServices("nursing-provider");
      const calendarAppointments = nursingServices.map(
        convertNursingServiceToAppointment,
      );

      setAppointments(calendarAppointments);
    } catch (err) {
      console.error("Failed to load nursing appointments:", err);
      setError("Failed to load appointments");
      toast({
        title: "Error",
        description: "Failed to load nursing appointments",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load occupied dates for current nursing provider
  const loadOccupiedDates = useCallback(async (providerId: number) => {
    try {
      const dates = await nursingService.getOccupiedDates(providerId);
      setOccupiedDates(dates);
    } catch (err) {
      console.error("Failed to load occupied dates:", err);
    }
  }, []);

  // Load occupied times for a specific date
  const loadOccupiedTimes = useCallback(
    async (providerId: number, date: string) => {
      try {
        const times = await nursingService.getOccupiedTimes(providerId, date);
        setOccupiedTimes((prev) => ({
          ...prev,
          [date]: times,
        }));
      } catch (err) {
        console.error("Failed to load occupied times:", err);
      }
    },
    [],
  );

  // Accept a nursing service request
  const acceptRequest = useCallback(async (serviceId: number) => {
    try {
      const updatedService =
        await nursingService.acceptNursingService(serviceId);
      const updatedAppointment =
        convertNursingServiceToAppointment(updatedService);

      setAppointments((prev) =>
        prev.map((apt) => (apt.id === serviceId ? updatedAppointment : apt)),
      );

      toast({
        title: "Request Accepted",
        description: "Nursing service request has been accepted successfully.",
      });

      return updatedAppointment;
    } catch (err) {
      console.error("Failed to accept request:", err);
      toast({
        title: "Error",
        description: "Failed to accept the request. Please try again.",
        variant: "destructive",
      });
      throw err;
    }
  }, []);

  // Reject a nursing service request
  const rejectRequest = useCallback(
    async (serviceId: number, reason?: string) => {
      try {
        const updatedService = await nursingService.rejectNursingService(
          serviceId,
          reason,
        );
        const updatedAppointment =
          convertNursingServiceToAppointment(updatedService);

        setAppointments((prev) =>
          prev.map((apt) => (apt.id === serviceId ? updatedAppointment : apt)),
        );

        toast({
          title: "Request Rejected",
          description: "Nursing service request has been rejected.",
        });

        return updatedAppointment;
      } catch (err) {
        console.error("Failed to reject request:", err);
        toast({
          title: "Error",
          description: "Failed to reject the request. Please try again.",
          variant: "destructive",
        });
        throw err;
      }
    },
    [],
  );

  // Complete a nursing service
  const completeService = useCallback(
    async (serviceId: number, notes?: string) => {
      try {
        const updatedService = await nursingService.completeNursingService(
          serviceId,
          notes,
        );
        const updatedAppointment =
          convertNursingServiceToAppointment(updatedService);

        setAppointments((prev) =>
          prev.map((apt) => (apt.id === serviceId ? updatedAppointment : apt)),
        );

        toast({
          title: "Service Completed",
          description: "Nursing service has been marked as completed.",
        });

        return updatedAppointment;
      } catch (err) {
        console.error("Failed to complete service:", err);
        toast({
          title: "Error",
          description: "Failed to complete the service. Please try again.",
          variant: "destructive",
        });
        throw err;
      }
    },
    [],
  );

  // Check if a date/time is occupied
  const isTimeSlotOccupied = useCallback(
    (date: string, time?: string) => {
      // Check if the date is occupied
      if (occupiedDates.includes(date)) {
        // If no specific time provided, just check date
        if (!time) return true;

        // Check if the specific time is occupied
        const timesForDate = occupiedTimes[date] || [];
        return timesForDate.includes(time);
      }

      return false;
    },
    [occupiedDates, occupiedTimes],
  );

  // Get available time slots for a date
  const getAvailableTimeSlots = useCallback(
    (date: string) => {
      const allTimeSlots = [
        "08:00 AM",
        "09:00 AM",
        "10:00 AM",
        "11:00 AM",
        "12:00 PM",
        "01:00 PM",
        "02:00 PM",
        "03:00 PM",
        "04:00 PM",
        "05:00 PM",
        "06:00 PM",
        "07:00 PM",
        "08:00 PM",
      ];

      const occupiedTimesForDate = occupiedTimes[date] || [];
      return allTimeSlots.filter(
        (time) => !occupiedTimesForDate.includes(time),
      );
    },
    [occupiedTimes],
  );

  // Filter appointments by status
  const getAppointmentsByStatus = useCallback(
    (status: string) => {
      return appointments.filter((apt) => apt.status === status);
    },
    [appointments],
  );

  // Get appointments for today
  const getTodaysAppointments = useCallback(() => {
    const today = new Date().toISOString().split("T")[0];
    return appointments.filter(
      (apt) => apt.appointment_datetime.split("T")[0] === today,
    );
  }, [appointments]);

  // Get upcoming appointments
  const getUpcomingAppointments = useCallback(
    (days: number = 7) => {
      const now = new Date();
      const futureDate = new Date();
      futureDate.setDate(now.getDate() + days);

      return appointments
        .filter((apt) => {
          const aptDate = new Date(apt.appointment_datetime);
          return aptDate >= now && aptDate <= futureDate;
        })
        .sort(
          (a, b) =>
            new Date(a.appointment_datetime).getTime() -
            new Date(b.appointment_datetime).getTime(),
        );
    },
    [appointments],
  );

  // Initialize data loading
  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  return {
    // Data
    appointments,
    occupiedDates,
    occupiedTimes,
    isLoading,
    error,

    // Actions
    loadAppointments,
    loadOccupiedDates,
    loadOccupiedTimes,
    acceptRequest,
    rejectRequest,
    completeService,

    // Utilities
    isTimeSlotOccupied,
    getAvailableTimeSlots,
    getAppointmentsByStatus,
    getTodaysAppointments,
    getUpcomingAppointments,
  };
};

export default useNursingCalendar;
