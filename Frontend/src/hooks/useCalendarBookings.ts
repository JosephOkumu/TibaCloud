import { useState, useEffect } from "react";
import appointmentService from "@/services/appointmentService";
import api from "@/services/api";

interface UseCalendarBookingsProps {
  providerId: number;
  providerType: "doctor" | "nursing" | "lab";
}

interface UseCalendarBookingsReturn {
  occupiedDates: string[];
  occupiedTimes: string[];
  selectedDate: Date | undefined;
  isLoading: boolean;
  error: string | null;
  getOccupiedTimesForDate: (date: Date) => Promise<void>;
  isDateOccupied: (date: Date) => boolean;
  isTimeOccupied: (time: string) => boolean;
}

// All available time slots for providers
const ALL_TIME_SLOTS = [
  "7:00 AM",
  "7:30 AM",
  "8:00 AM",
  "8:30 AM",
  "9:00 AM",
  "9:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "1:00 PM",
  "1:30 PM",
  "2:00 PM",
  "2:30 PM",
  "3:00 PM",
  "3:30 PM",
  "4:00 PM",
  "4:30 PM",
];

// Dummy occupied dates for demonstration (will be removed when payment features are implemented)
const getDummyOccupiedDates = (): string[] => {
  const dates = [];
  const today = new Date();

  // Check each date in the next 30 days to see if it should be fully booked
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dateString = date.toISOString().split("T")[0];

    // Get occupied times for this date
    const occupiedTimes = getDummyOccupiedTimes(dateString);

    // Only mark as fully booked if ALL time slots are occupied
    if (occupiedTimes.length >= ALL_TIME_SLOTS.length) {
      dates.push(dateString);
    }
  }

  return dates;
};

// Dummy occupied times for demonstration
const getDummyOccupiedTimes = (dateString: string): string[] => {
  const occupiedTimes = [];
  const date = new Date(dateString);
  const dayOfWeek = date.getDay();

  // Different patterns for different days
  if (dayOfWeek === 1) {
    // Monday - busy morning
    occupiedTimes.push("8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM", "10:00 AM");
  } else if (dayOfWeek === 2) {
    // Tuesday - afternoon busy
    occupiedTimes.push("1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", "3:00 PM");
  } else if (dayOfWeek === 3) {
    // Wednesday - scattered
    occupiedTimes.push("8:00 AM", "10:30 AM", "12:30 PM", "3:30 PM", "5:00 PM");
  } else if (dayOfWeek === 4) {
    // Thursday - evening busy
    occupiedTimes.push(
      "3:00 PM",
      "3:30 PM",
      "4:00 PM",
      "4:30 PM",
      "5:00 PM",
      "5:30 PM",
    );
  } else if (dayOfWeek === 5) {
    // Friday - very busy but not fully booked
    occupiedTimes.push(
      "8:00 AM",
      "9:00 AM",
      "10:00 AM",
      "11:00 AM",
      "1:00 PM",
      "2:00 PM",
      "3:00 PM",
      "4:00 PM",
    );
  } else if (dayOfWeek === 6) {
    // Saturday - half day
    occupiedTimes.push("8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM");
  }
  // Sunday - mostly available

  // Only make one specific date fully booked for demonstration
  // Let's make the 15th of each month fully booked
  const dayOfMonth = date.getDate();
  if (dayOfMonth === 15) {
    // Fully booked - all time slots occupied
    return [...ALL_TIME_SLOTS];
  }

  return occupiedTimes;
};

export const useCalendarBookings = ({
  providerId,
  providerType,
}: UseCalendarBookingsProps): UseCalendarBookingsReturn => {
  const [occupiedDates, setOccupiedDates] = useState<string[]>([]);
  const [occupiedTimes, setOccupiedTimes] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch occupied dates when provider changes
  useEffect(() => {
    const fetchOccupiedDates = async () => {
      if (!providerId) return;

      setIsLoading(true);
      setError(null);

      try {
        let fullyBookedDates: string[] = [];

        // For demonstration purposes, use dummy data
        // This will be replaced with real API calls when payment features are implemented
        fullyBookedDates = getDummyOccupiedDates();

        /* Real API calls (commented out for demo):
        if (providerType === "doctor") {
          // Get dates where all time slots are booked
          fullyBookedDates = await appointmentService.getDoctorFullyBookedDates(providerId);
        } else if (providerType === "nursing") {
          fullyBookedDates = await appointmentService.getNursingProviderFullyBookedDates(providerId);
        } else if (providerType === "lab") {
          // Lab provider fully booked dates - check when all time slots are occupied
          const response = await api.get(`/lab-providers/${providerId}/fully-booked-dates`);
          fullyBookedDates = response.data.data;
        }
        */

        setOccupiedDates(fullyBookedDates);
      } catch (err) {
        console.error("Error fetching fully booked dates:", err);
        setError("Failed to load availability");
        setOccupiedDates([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOccupiedDates();
  }, [providerId, providerType]);

  // Function to get occupied times for a specific date
  const getOccupiedTimesForDate = async (date: Date) => {
    if (!providerId || !date) return;

    setIsLoading(true);
    setError(null);
    setSelectedDate(date);

    try {
      const dateString = date.toISOString().split("T")[0]; // YYYY-MM-DD format
      let times: string[] = [];

      // For demonstration purposes, use dummy data
      // This will be replaced with real API calls when payment features are implemented
      times = getDummyOccupiedTimes(dateString);

      /* Real API calls (commented out for demo):
      if (providerType === "doctor") {
        times = await appointmentService.getDoctorOccupiedTimes(providerId, dateString);
      } else if (providerType === "nursing") {
        times = await appointmentService.getNursingProviderOccupiedTimes(providerId, dateString);
      } else if (providerType === "lab") {
        // Lab provider occupied times - API endpoint exists
        const response = await api.get(`/lab-providers/${providerId}/occupied-times?date=${dateString}`);
        times = response.data.data;
      }
      */

      setOccupiedTimes(times);
    } catch (err) {
      console.error("Error fetching occupied times:", err);
      setError("Failed to load occupied times");
      setOccupiedTimes([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to check if a date is fully booked (all time slots occupied)
  const isDateOccupied = (date: Date): boolean => {
    const dateString = date.toISOString().split("T")[0];
    return occupiedDates.includes(dateString);
  };

  // Helper function to check if a time is occupied
  const isTimeOccupied = (time: string): boolean => {
    return occupiedTimes.includes(time);
  };

  return {
    occupiedDates,
    occupiedTimes,
    selectedDate,
    isLoading,
    error,
    getOccupiedTimesForDate,
    isDateOccupied,
    isTimeOccupied,
  };
};

export default useCalendarBookings;
