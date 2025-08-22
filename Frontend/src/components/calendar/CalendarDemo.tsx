import React, { useState, useEffect } from "react";
import { AppointmentCalendar } from "./index";
import { Appointment } from "@/services/appointmentService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Clock, TrendingUp } from "lucide-react";

const CalendarDemo: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Generate sample appointments for demonstration
  useEffect(() => {
    const generateSampleAppointments = (): Appointment[] => {
      const today = new Date();
      const sampleAppointments: Appointment[] = [
        // Today's appointments
        {
          id: 1,
          patient_id: 1,
          doctor_id: 1,
          appointment_datetime: new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate(),
            10,
            0
          ).toISOString(),
          status: "scheduled",
          type: "virtual",
          reason_for_visit: "Regular checkup",
          symptoms: "General wellness examination",
          meeting_link: "https://meet.example.com/room1",
          fee: 2500,
          is_paid: true,
          patient: {
            id: 1,
            user_id: 1,
            user: {
              name: "Alice Johnson",
              email: "alice@example.com",
              phone_number: "+254712345678",
            },
          },
        },
        {
          id: 2,
          patient_id: 2,
          doctor_id: 1,
          appointment_datetime: new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate(),
            14,
            30
          ).toISOString(),
          status: "scheduled",
          type: "in_person",
          reason_for_visit: "Follow-up consultation",
          symptoms: "Blood pressure monitoring",
          fee: 3000,
          is_paid: false,
          patient: {
            id: 2,
            user_id: 2,
            user: {
              name: "Bob Wilson",
              email: "bob@example.com",
              phone_number: "+254787654321",
            },
          },
        },
        // Tomorrow's appointments
        {
          id: 3,
          patient_id: 3,
          doctor_id: 1,
          appointment_datetime: new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate() + 1,
            9,
            0
          ).toISOString(),
          status: "scheduled",
          type: "virtual",
          reason_for_visit: "Consultation for chronic condition",
          symptoms: "Diabetes management review",
          meeting_link: "https://meet.example.com/room2",
          fee: 4000,
          is_paid: true,
          patient: {
            id: 3,
            user_id: 3,
            user: {
              name: "Carol Davis",
              email: "carol@example.com",
              phone_number: "+254798765432",
            },
          },
        },
        // This week's appointments
        {
          id: 4,
          patient_id: 4,
          doctor_id: 1,
          appointment_datetime: new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate() + 3,
            11,
            15
          ).toISOString(),
          status: "scheduled",
          type: "in_person",
          reason_for_visit: "Specialist consultation",
          symptoms: "Cardiac assessment",
          fee: 5000,
          is_paid: true,
          patient: {
            id: 4,
            user_id: 4,
            user: {
              name: "David Brown",
              email: "david@example.com",
              phone_number: "+254701234567",
            },
          },
        },
        {
          id: 5,
          patient_id: 5,
          doctor_id: 1,
          appointment_datetime: new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate() + 5,
            16,
            0
          ).toISOString(),
          status: "scheduled",
          type: "virtual",
          reason_for_visit: "Mental health consultation",
          symptoms: "Anxiety and stress management",
          meeting_link: "https://meet.example.com/room3",
          fee: 3500,
          is_paid: false,
          patient: {
            id: 5,
            user_id: 5,
            user: {
              name: "Emma Garcia",
              email: "emma@example.com",
              phone_number: "+254789012345",
            },
          },
        },
        // Next week's appointments
        {
          id: 6,
          patient_id: 6,
          doctor_id: 1,
          appointment_datetime: new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate() + 8,
            13,
            30
          ).toISOString(),
          status: "scheduled",
          type: "in_person",
          reason_for_visit: "Routine examination",
          symptoms: "Annual physical",
          fee: 2500,
          is_paid: true,
          patient: {
            id: 6,
            user_id: 6,
            user: {
              name: "Frank Miller",
              email: "frank@example.com",
              phone_number: "+254765432109",
            },
          },
        },
        {
          id: 7,
          patient_id: 7,
          doctor_id: 1,
          appointment_datetime: new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate() + 10,
            15,
            45
          ).toISOString(),
          status: "scheduled",
          type: "virtual",
          reason_for_visit: "Prescription renewal",
          symptoms: "Medication review",
          meeting_link: "https://meet.example.com/room4",
          fee: 2000,
          is_paid: true,
          patient: {
            id: 7,
            user_id: 7,
            user: {
              name: "Grace Lee",
              email: "grace@example.com",
              phone_number: "+254743210987",
            },
          },
        },
      ];

      return sampleAppointments;
    };

    // Simulate loading delay
    setTimeout(() => {
      setAppointments(generateSampleAppointments());
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleAppointmentClick = (appointment: Appointment) => {
    console.log("Appointment clicked:", appointment);
    // You can add custom logic here, such as:
    // - Opening a detailed appointment modal
    // - Navigating to patient details
    // - Starting a video call
    // - Updating appointment status
  };

  // Calculate statistics
  const totalAppointments = appointments.length;
  const virtualAppointments = appointments.filter(apt => apt.type === "virtual").length;
  const inPersonAppointments = appointments.filter(apt => apt.type === "in_person").length;
  const paidAppointments = appointments.filter(apt => apt.is_paid).length;

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Loading appointment calendar...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">
          Doctor Appointment Calendar Demo
        </h1>
        <p className="text-gray-600">
          Interactive calendar with filtering, appointment details, and visual indicators
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAppointments}</div>
            <p className="text-xs text-muted-foreground">
              All scheduled appointments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Virtual Consultations</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{virtualAppointments}</div>
            <p className="text-xs text-muted-foreground">
              Video call appointments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In-Person Visits</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{inPersonAppointments}</div>
            <p className="text-xs text-muted-foreground">
              Physical consultations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Appointments</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{paidAppointments}</div>
            <p className="text-xs text-muted-foreground">
              Payment completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Feature Highlights */}
      <Card>
        <CardHeader>
          <CardTitle>Calendar Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Badge variant="outline" className="bg-green-50 text-green-700">
                Virtual Appointments
              </Badge>
              <p className="text-sm text-gray-600">
                Green badges indicate video call appointments with meeting links
              </p>
            </div>
            <div className="space-y-2">
              <Badge variant="outline" className="bg-orange-50 text-orange-700">
                In-Person Visits
              </Badge>
              <p className="text-sm text-gray-600">
                Orange badges show physical consultation appointments
              </p>
            </div>
            <div className="space-y-2">
              <Button variant="outline" size="sm">
                Filter Options
              </Button>
              <p className="text-sm text-gray-600">
                Filter by today, tomorrow, next week, or next month
              </p>
            </div>
            <div className="space-y-2">
              <Button variant="outline" size="sm">
                View Toggle
              </Button>
              <p className="text-sm text-gray-600">
                Switch between calendar grid and list view
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600">
            <p>• <strong>Click on calendar dates</strong> to see appointments for that day</p>
            <p>• <strong>Click on appointment badges</strong> to view detailed information</p>
            <p>• <strong>Use filters</strong> to narrow down appointments by time period</p>
            <p>• <strong>Toggle between views</strong> for calendar grid or list format</p>
            <p>• <strong>Navigate months</strong> using the arrow buttons in calendar view</p>
            <p>• <strong>Appointment details modal</strong> shows patient info, appointment type, and action buttons</p>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Component */}
      <Card>
        <CardHeader>
          <CardTitle>Appointment Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <AppointmentCalendar
            appointments={appointments}
            onAppointmentClick={handleAppointmentClick}
          />
        </CardContent>
      </Card>

      {/* Technical Details */}
      <Card>
        <CardHeader>
          <CardTitle>Technical Implementation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Technologies Used</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• React with TypeScript</li>
                <li>• date-fns for date manipulation</li>
                <li>• Radix UI components</li>
                <li>• Tailwind CSS for styling</li>
                <li>• Lucide React icons</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Key Features</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Responsive design</li>
                <li>• Accessible components</li>
                <li>• Type-safe implementation</li>
                <li>• Optimized performance</li>
                <li>• Extensible architecture</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarDemo;
