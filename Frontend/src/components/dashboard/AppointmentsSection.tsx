import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Activity,
  Plus,
  FileText,
  Home,
  TestTube,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import appointmentService, {
  Appointment,
  LabAppointment,
  NursingAppointment,
} from "@/services/appointmentService";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

const AppointmentsSection = () => {
  const { user } = useAuth();
  const [doctorAppointments, setDoctorAppointments] = useState<Appointment[]>(
    [],
  );
  const [labAppointments, setLabAppointments] = useState<LabAppointment[]>([]);
  const [nursingAppointments, setNursingAppointments] = useState<
    NursingAppointment[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user) return;

      setLoading(true);
      setError(null);
      try {
        // Fetch doctor, lab, and nursing appointments
        const [doctorAppts, labAppts, nursingAppts] = await Promise.all([
          appointmentService.getAppointments("patient"),
          appointmentService.getLabAppointments(),
          appointmentService.getNursingAppointments(),
        ]);

        setDoctorAppointments(doctorAppts);
        setLabAppointments(labAppts);
        setNursingAppointments(nursingAppts);
      } catch (error) {
        console.error("Error fetching appointments:", error);
        setError("Failed to load appointments. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [user]);

  const getUpcomingAppointments = () => {
    const now = new Date();

    const upcomingDoctor = doctorAppointments.filter(
      (appt) =>
        new Date(appt.appointment_datetime) > now &&
        appt.status !== "cancelled",
    );

    const upcomingLab = labAppointments.filter(
      (appt) =>
        new Date(appt.appointment_datetime) > now &&
        appt.status !== "cancelled",
    );

    const upcomingNursing = nursingAppointments.filter(
      (appt) =>
        new Date(appt.scheduled_datetime) > now && appt.status !== "cancelled",
    );

    return [...upcomingDoctor, ...upcomingLab, ...upcomingNursing].sort(
      (a, b) => {
        const dateA = new Date(
          "scheduled_datetime" in a
            ? a.scheduled_datetime
            : a.appointment_datetime,
        );
        const dateB = new Date(
          "scheduled_datetime" in b
            ? b.scheduled_datetime
            : b.appointment_datetime,
        );
        return dateA.getTime() - dateB.getTime();
      },
    );
  };

  const getPastAppointments = () => {
    const now = new Date();

    const pastDoctor = doctorAppointments.filter(
      (appt) =>
        new Date(appt.appointment_datetime) <= now ||
        appt.status === "completed",
    );

    const pastLab = labAppointments.filter(
      (appt) =>
        new Date(appt.appointment_datetime) <= now ||
        appt.status === "completed",
    );

    const pastNursing = nursingAppointments.filter(
      (appt) =>
        new Date(appt.scheduled_datetime) <= now || appt.status === "completed",
    );

    return [...pastDoctor, ...pastLab, ...pastNursing].sort((a, b) => {
      const dateA = new Date(
        "scheduled_datetime" in a
          ? a.scheduled_datetime
          : a.appointment_datetime,
      );
      const dateB = new Date(
        "scheduled_datetime" in b
          ? b.scheduled_datetime
          : b.appointment_datetime,
      );
      return dateB.getTime() - dateA.getTime();
    });
  };

  const getAppointmentIcon = (
    appointment: Appointment | LabAppointment | NursingAppointment,
  ) => {
    if ("doctor_id" in appointment) {
      return <Activity className="h-6 w-6" />;
    } else if ("lab_provider_id" in appointment) {
      return <TestTube className="h-6 w-6" />;
    } else {
      return <Home className="h-6 w-6" />;
    }
  };

  const getAppointmentTitle = (
    appointment: Appointment | LabAppointment | NursingAppointment,
  ) => {
    if ("doctor_id" in appointment) {
      return appointment.reason_for_visit || "Doctor Consultation";
    } else if ("lab_provider_id" in appointment) {
      const labTests = appointment.labTests || appointment.lab_tests;
      const testCount = labTests?.length || appointment.test_ids?.length || 0;
      return `Lab Tests (${testCount} test${testCount !== 1 ? "s" : ""})`;
    } else {
      return appointment.service_name || "Home Nursing Service";
    }
  };

  const getAppointmentProvider = (
    appointment: Appointment | LabAppointment | NursingAppointment,
  ) => {
    if ("doctor_id" in appointment) {
      return {
        name: appointment.doctor?.user?.name || "Doctor",
        specialty: appointment.doctor?.specialty || "Doctor",
        image:
          appointment.doctor?.profile_image ||
          "https://randomuser.me/api/portraits/men/36.jpg",
      };
    } else if ("lab_provider_id" in appointment) {
      // Handle both camelCase and snake_case from Laravel
      const labProvider = appointment.labProvider || appointment.lab_provider;
      return {
        name:
          labProvider?.lab_name || labProvider?.user?.name || "Lab Provider",
        specialty: "Laboratory",
        image:
          labProvider?.profile_image ||
          "https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?w=100&h=100&fit=crop&crop=center",
      };
    } else {
      // Handle nursing appointments
      const nursingProvider =
        appointment.nursingProvider || appointment.nursing_provider;
      return {
        name:
          nursingProvider?.provider_name ||
          nursingProvider?.user?.name ||
          "Nursing Provider",
        specialty: "Home Nursing",
        image:
          nursingProvider?.logo ||
          "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=center",
      };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "text-green-600 bg-green-100";
      case "scheduled":
      case "pending":
        return "text-blue-600 bg-blue-100";
      case "completed":
        return "text-gray-600 bg-gray-100";
      case "cancelled":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getDisplayStatus = (status: string) => {
    const displayStatus = status === "scheduled" ? "pending" : status;
    return displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1);
  };

  const renderAppointmentCard = (
    appointment: Appointment | LabAppointment | NursingAppointment,
    isUpcoming: boolean = true,
  ) => {
    const provider = getAppointmentProvider(appointment);
    const appointmentDate = new Date(
      "scheduled_datetime" in appointment
        ? appointment.scheduled_datetime
        : appointment.appointment_datetime,
    );

    return (
      <div
        key={`${appointment.id}-${
          "doctor_id" in appointment
            ? "doctor"
            : "lab_provider_id" in appointment
              ? "lab"
              : "nursing"
        }`}
        className="border border-gray-200 rounded-lg p-4 flex items-start space-x-4"
      >
        <div className="flex-shrink-0 w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
          {getAppointmentIcon(appointment)}
        </div>
        <div className="flex-1">
          <div className="flex justify-between">
            <h4 className="font-semibold">
              {getAppointmentTitle(appointment)}
            </h4>
            <span
              className={`text-sm font-medium px-2 py-0.5 rounded-full ${getStatusColor(appointment.status)}`}
            >
              {getDisplayStatus(appointment.status)}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1 flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            {format(appointmentDate, "MMMM dd, yyyy")}
          </p>
          <p className="text-sm text-gray-600 flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            {format(appointmentDate, "h:mm a")}
          </p>
          <div className="mt-3 flex items-center">
            <div className="h-8 w-8 rounded-full bg-gray-100 mr-2 flex items-center justify-center text-white text-xs overflow-hidden">
              <img
                src={provider.image}
                alt={provider.name}
                className="rounded-full w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-sm font-medium">{provider.name}</p>
              <p className="text-xs text-gray-500">{provider.specialty}</p>
            </div>
          </div>
        </div>
        <div className="flex-shrink-0 flex space-x-2">
          {isUpcoming ? (
            <>
              <Button variant="outline" size="sm" className="text-xs">
                Reschedule
              </Button>
              <Button variant="destructive" size="sm" className="text-xs">
                Cancel
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" className="text-xs">
              {"doctor_id" in appointment
                ? "View Report"
                : "lab_provider_id" in appointment
                  ? "View Results"
                  : "View Care Notes"}
            </Button>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin h-8 w-8 border border-gray-300 border-t-transparent rounded-full"></div>
          <span className="ml-2 text-gray-500">Loading appointments...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center py-8">
          <div className="text-red-500 mb-4">
            <Activity className="h-12 w-12 mx-auto mb-2" />
            <p className="text-lg font-medium">Error Loading Appointments</p>
            <p className="text-sm text-gray-600 mt-1">{error}</p>
          </div>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const upcomingAppointments = getUpcomingAppointments();
  const pastAppointments = getPastAppointments();

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <Tabs defaultValue="upcoming">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-[var(--dark)]">
            My Appointments
          </h2>
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingAppointments.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No upcoming appointments
              </h3>
              <p className="text-gray-500">
                You don't have any upcoming appointments scheduled.
              </p>
            </div>
          ) : (
            upcomingAppointments.map((appointment) =>
              renderAppointmentCard(appointment, true),
            )
          )}

          <div className="flex justify-center">
            <Link to="/patient-dashboard">
              <Button className="bg-primary-blue hover:bg-primary-blue/90">
                <Home className="h-4 w-4 mr-2" /> Go back to Home
              </Button>
            </Link>
          </div>
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {pastAppointments.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No past appointments
              </h3>
              <p className="text-gray-500">
                You don't have any past appointments to view.
              </p>
            </div>
          ) : (
            pastAppointments.map((appointment) =>
              renderAppointmentCard(appointment, false),
            )
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AppointmentsSection;
