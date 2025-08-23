import React, { useState, useEffect } from "react";
import {
  useParams,
  useNavigate,
  useSearchParams,
  Link,
} from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  Bell,
  MessageSquare,
  Calendar as CalendarIcon,
  Package,
  LogOut,
  ChevronLeft,
  Star,
  MapPin,
  Clock,
  Users,
  Microscope,
  ShieldCheck,
  Phone,
  Mail,
  CheckCircle,
  Info,
  AlertCircle,
  Building,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import labService, { LabProvider, LabTestService } from "@/services/labService";
import { useCalendarBookings } from "@/hooks/useCalendarBookings";
import { useMpesaPayment } from "@/hooks/useMpesaPayment";
import { usePesapalPayment } from "@/hooks/usePesapalPayment";
import appointmentService from "@/services/appointmentService";

const LabProviderDetails = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const preselectedTestId = searchParams.get("test");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [provider, setProvider] = useState<LabProvider | null>(null);
  const [testServices, setTestServices] = useState<LabTestService[]>([]);
  const [selectedTests, setSelectedTests] = useState<number[]>(
    preselectedTestId ? [parseInt(preselectedTestId)] : [],
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [timeSlot, setTimeSlot] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("mpesa");
  const [phoneNumber, setPhoneNumber] = useState("+254722549387");
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isPaymentSuccess, setIsPaymentSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Calendar booking hook for occupied slots
  const {
    occupiedDates,
    occupiedTimes,
    isLoading: bookingsLoading,
    getOccupiedTimesForDate,
    isDateOccupied,
    isTimeOccupied,
  } = useCalendarBookings({
    providerId: provider?.id || 0,
    providerType: "lab",
  });

  // M-Pesa payment hook
  const {
    initiatePayment,
    isProcessing: mpesaProcessing,
    paymentStatus,
    resetPayment,
  } = useMpesaPayment({
    onSuccess: async (result) => {
      setIsProcessing(false);

      // Create lab appointment after successful payment
      try {
        if (user && provider && date && timeSlot && selectedTests.length > 0) {
          const appointmentDateTime = new Date(date);
          const [time, period] = timeSlot.split(" ");
          const [hours, minutes] = time.split(":");
          let hour24 = parseInt(hours);

          if (period === "PM" && hour24 !== 12) {
            hour24 += 12;
          } else if (period === "AM" && hour24 === 12) {
            hour24 = 0;
          }

          appointmentDateTime.setHours(hour24, parseInt(minutes), 0, 0);

          await appointmentService.createLabAppointment({
            patient_id: user.id,
            lab_provider_id: provider.id,
            appointment_datetime: appointmentDateTime.toISOString(),
            test_ids: selectedTests,
            total_amount: Number(totalPrice),
            payment_reference:
              result.transactionId || `LAB-${provider.id}-${Date.now()}`,
            notes: `Lab tests booked via M-Pesa payment`,
          });

          console.log("Lab appointment created successfully");
        }
      } catch (error) {
        console.error("Error creating lab appointment:", error);
        // Still show success since payment went through
      }

      setIsPaymentSuccess(true);
      setIsPaymentModalOpen(false);
    },
    onError: (error) => {
      setIsProcessing(false);
      console.error("Payment error:", error);
    },
  });

  // Pesapal payment hook
  const {
    initiatePayment: initiatePesapalPayment,
    isProcessing: pesapalProcessing,
    paymentStatus: pesapalPaymentStatus,
    resetPayment: resetPesapalPayment,
  } = usePesapalPayment({
    onSuccess: async (result) => {
      setIsProcessing(false);

      // Create lab appointment after successful payment
      try {
        if (user && provider && date && timeSlot && selectedTests.length > 0) {
          const appointmentDateTime = new Date(date);
          const [time, period] = timeSlot.split(" ");
          const [hours, minutes] = time.split(":");
          let hour24 = parseInt(hours);

          if (period === "PM" && hour24 !== 12) {
            hour24 += 12;
          } else if (period === "AM" && hour24 === 12) {
            hour24 = 0;
          }

          appointmentDateTime.setHours(hour24, parseInt(minutes), 0, 0);

          await appointmentService.createLabAppointment({
            patient_id: user.id,
            lab_provider_id: provider.id,
            appointment_datetime: appointmentDateTime.toISOString(),
            test_ids: selectedTests,
            total_amount: Number(totalPrice),
            payment_reference:
              result.merchantReference || `LAB-${provider.id}-${Date.now()}`,
            notes: `Lab tests booked via Pesapal payment`,
          });

          console.log("Lab appointment created successfully via Pesapal");
        }
      } catch (error) {
        console.error("Error creating lab appointment:", error);
        // Still show success since payment went through
      }

      setIsPaymentSuccess(true);
      setIsPaymentModalOpen(false);
    },
    onError: (error) => {
      setIsProcessing(false);
      console.error("Pesapal payment error:", error);
    },
  });

  // Helper function to safely parse JSON
  const safeJsonParse = (jsonString: string | null | undefined) => {
    if (!jsonString) return null;
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return null;
    }
  };

  // Helper function to render operating hours
  const renderOperatingHours = (hoursData: string | null | undefined) => {
    if (!hoursData) {
      return (
        <p className="text-gray-500 text-sm">Operating hours not available</p>
      );
    }

    // Try to parse as JSON first
    const hours = safeJsonParse(hoursData);
    if (Array.isArray(hours)) {
      return hours.map(
        (hour: { day: string; hours: string }, index: number) => (
          <div key={index} className="flex justify-between text-sm">
            <span>{hour.day}</span>
            <span>{hour.hours}</span>
          </div>
        ),
      );
    } else if (typeof hours === "object" && hours !== null) {
      return Object.entries(hours).map(([day, time], index) => (
        <div key={index} className="flex justify-between text-sm">
          <span>{day}</span>
          <span>{String(time)}</span>
        </div>
      ));
    } else {
      // If JSON parsing fails, treat as plain text
      return <p className="text-gray-700 text-sm">{hoursData}</p>;
    }
  };

  // Helper function to render certifications
  const renderCertifications = (
    certsData: string[] | string | null | undefined,
  ) => {
    if (!certsData) {
      return <p className="text-gray-500 text-sm">No certifications listed</p>;
    }

    if (Array.isArray(certsData)) {
      return certsData.map((cert: string, index: number) => (
        <Badge key={index} variant="outline" className="mr-2 mb-2">
          {cert}
        </Badge>
      ));
    }

    const certs = safeJsonParse(certsData);
    if (Array.isArray(certs)) {
      return certs.map((cert: string, index: number) => (
        <Badge key={index} variant="outline" className="mr-2 mb-2">
          {cert}
        </Badge>
      ));
    } else {
      return <p className="text-gray-500 text-sm">{certsData}</p>;
    }
  };

  // Fetch lab provider details and test services
  useEffect(() => {
    const fetchProviderDetails = async () => {
      if (!id) return;

      try {
        setLoading(true);
        console.log("Fetching provider details for ID:", id);

        const [providerData, testServicesData] = await Promise.all([
          labService.getLabProvider(parseInt(id)).catch((error) => {
            console.error("Error fetching provider:", error);
            return null;
          }),
          labService.getTestServicesByProvider(parseInt(id)).catch((error) => {
            console.error("Error fetching test services:", error);
            return { testServices: [], labProvider: null };
          }),
        ]);

        console.log("Provider data:", providerData);
        console.log("Test services data:", testServicesData);

        if (!providerData) {
          toast({
            title: "Error",
            description: "Lab provider not found",
            variant: "destructive",
          });
          navigate("/patient-dashboard/lab-tests");
          return;
        }

        setProvider(providerData);
        setTestServices(testServicesData?.testServices || []);
      } catch (error) {
        console.error("Error fetching provider details:", error);
        toast({
          title: "Error",
          description: "Failed to load lab provider details",
          variant: "destructive",
        });
        navigate("/patient-dashboard/lab-tests");
      } finally {
        setLoading(false);
      }
    };

    fetchProviderDetails();
  }, [id, toast, navigate]);

  // Generate user initials
  const getUserInitials = (name: string) => {
    if (!name) return "U";
    const names = name.trim().split(" ");
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (
      names[0].charAt(0) + names[names.length - 1].charAt(0)
    ).toUpperCase();
  };

  // Filter test services based on search term
  const filteredTests = testServices.filter(
    (test) =>
      test.test_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (test.description &&
        test.description.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  // Handle test selection
  const handleTestToggle = (testId: number) => {
    setSelectedTests((prev) =>
      prev.includes(testId)
        ? prev.filter((id) => id !== testId)
        : [...prev, testId],
    );
  };

  // Calculate total price
  const totalPrice = selectedTests.reduce((sum, testId) => {
    const test = testServices.find((t) => t.id === testId);
    return sum + (Number(test?.price) || 0);
  }, 0);

  // Available time slots for lab tests
  const timeSlots = [
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

  const handleBookAppointment = () => {
    if (!date) {
      toast({
        title: "Select a date",
        description: "Please select an appointment date",
        variant: "destructive",
      });
      return;
    }

    if (!timeSlot) {
      toast({
        title: "Select a time slot",
        description: "Please select an appointment time",
        variant: "destructive",
      });
      return;
    }

    if (selectedTests.length === 0) {
      toast({
        title: "Select tests",
        description: "Please select at least one test",
        variant: "destructive",
      });
      return;
    }

    setIsPaymentModalOpen(true);
  };

  const processPayment = async () => {
    if (paymentMethod === "mpesa") {
      // Validate phone number
      if (!phoneNumber.trim()) {
        toast({
          title: "Phone Number Required",
          description: "Please enter your phone number for M-Pesa payment.",
          variant: "destructive",
        });
        return;
      }

      setIsProcessing(true);

      try {
        await initiatePayment({
          amount: Number(totalPrice) || 0,
          phoneNumber: phoneNumber,
          accountReference: `LAB-${provider?.id}-${Date.now()}`,
          transactionDesc: `Lab tests at ${provider?.lab_name}`,
        });
      } catch (error) {
        setIsProcessing(false);
        console.error("Payment initiation failed:", error);
      }
    } else {
      // Handle Pesapal credit card payments
      setIsProcessing(true);

      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to continue with payment.",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      if (!provider) {
        toast({
          title: "Provider Not Found",
          description: "Lab provider information is not available.",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      try {
        // Store booking data temporarily before redirect
        const appointmentDateTime = new Date(date);
        const [time, period] = timeSlot.split(" ");
        const [hours, minutes] = time.split(":");
        let hour24 = parseInt(hours);

        if (period === "PM" && hour24 !== 12) {
          hour24 += 12;
        } else if (period === "AM" && hour24 === 12) {
          hour24 = 0;
        }

        appointmentDateTime.setHours(hour24, parseInt(minutes), 0, 0);

        const bookingData = {
          patient_id: user.id,
          lab_provider_id: provider.id,
          appointment_datetime: appointmentDateTime.toISOString(),
          test_ids: selectedTests,
          total_amount: Number(totalPrice),
        };

        const paymentResponse = await initiatePesapalPayment({
          amount: Number(totalPrice) || 0,
          email: user.email || "",
          phone_number: phoneNumber || "+254722549387",
          first_name: user.name?.split(" ")[0] || "Patient",
          last_name: user.name?.split(" ").slice(1).join(" ") || "User",
          description:
            `Lab tests at ${provider.lab_name}` || "Lab test booking",
          lab_provider_id: provider.id,
          patient_id: user.id,
        });

        // Store booking data with merchant reference
        if (paymentResponse.merchantReference) {
          localStorage.setItem(
            `lab_booking_${paymentResponse.merchantReference}`,
            JSON.stringify(bookingData),
          );
        }
      } catch (error) {
        setIsProcessing(false);
        console.error("Pesapal payment initiation failed:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading lab provider details...</p>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Lab provider not found</p>
          <Button onClick={() => navigate(-1)} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      {/* Top Navigation Bar */}
      <header className="bg-white shadow-sm p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="hover:bg-green-50"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            <div className="flex items-center gap-2">
              <Link to="/patient-dashboard">
                <div className="h-10 w-10 rounded-full bg-secondary-green/80 flex items-center justify-center text-white font-bold">
                  AM
                </div>
              </Link>
              <Link to="/patient-dashboard">
                <span className="font-semibold text-xl font-playfair">
                  <span className="text-primary-blue">TIBA</span>
                  <span className="text-secondary-green"> CLOUD</span>
                </span>
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="relative rounded-full border-none hover:bg-green-50"
            >
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute top-1 right-1 bg-red-500 rounded-full w-2 h-2"></span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="relative rounded-full border-none hover:bg-green-50"
            >
              <MessageSquare className="h-5 w-5 text-gray-600" />
              <span className="absolute top-1 right-1 bg-red-500 rounded-full w-2 h-2"></span>
            </Button>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex flex-col items-end">
                <span className="font-medium text-sm">
                  {user?.name || "User"}
                </span>
                <span className="text-xs text-gray-500">Patient</span>
              </div>
              <Avatar className="h-9 w-9 border-2 border-secondary-green/20">
                <AvatarFallback className="bg-secondary-green/10 text-secondary-green font-semibold">
                  {getUserInitials(user?.name || "")}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Provider Header */}
        <Card className="mb-6 bg-gradient-to-r from-green-500/90 to-teal-600/90 text-white border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <Avatar className="h-24 w-24 border-4 border-white/30">
                {provider.profile_image ? (
                  <AvatarImage
                    src={provider.profile_image}
                    alt={provider.lab_name}
                  />
                ) : null}
                <AvatarFallback className="bg-white/20 text-white text-2xl">
                  {provider.lab_name
                    .split(" ")
                    .map((word) => word[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div>
                  <h1 className="text-3xl font-bold font-playfair">
                    {provider.lab_name}
                  </h1>

                  <p className="mt-3 opacity-90 text-sm leading-relaxed">
                    {provider.description || "No description available."}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                    <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm p-3 rounded-lg">
                      <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="text-sm opacity-80">Location</div>
                        <div className="font-bold text-lg">
                          {provider.address || "Location not specified"}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm p-3 rounded-lg">
                      <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                        <Microscope className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="text-sm opacity-80">
                          Tests Available
                        </div>
                        <div className="font-bold text-lg">
                          {testServices.length}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm p-3 rounded-lg">
                      <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      </div>
                      <div>
                        <div className="text-sm opacity-80">Rating</div>
                        <div className="font-bold text-lg">
                          {provider.average_rating || 0}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="tests" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="tests">Available Tests</TabsTrigger>
            <TabsTrigger value="info">Lab Information</TabsTrigger>
          </TabsList>

          {/* Available Tests Tab */}
          <TabsContent value="tests" className="space-y-6">
            {/* Tests List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Microscope className="h-5 w-5" />
                  Available Tests
                </CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="search"
                    placeholder="Search tests..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredTests.length > 0 ? (
                    filteredTests.map((test) => (
                      <div
                        key={test.id}
                        className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                          selectedTests.includes(test.id!)
                            ? "border-green-500 bg-green-50"
                            : "border-gray-200 hover:border-green-300"
                        }`}
                        onClick={() => handleTestToggle(test.id!)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={selectedTests.includes(test.id!)}
                              onChange={() => handleTestToggle(test.id!)}
                            />
                            <div className="flex-1">
                              <h3 className="font-medium">{test.test_name}</h3>
                              <p className="text-sm text-gray-600 mt-1">
                                {test.description || "No description available"}
                              </p>
                              <div className="flex items-center gap-4 mt-2">
                                <div className="flex items-center text-sm text-gray-500">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {test.turnaround_time || "Same day"}
                                </div>
                                {test.sample_type && (
                                  <Badge variant="outline" className="text-xs">
                                    {test.sample_type}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-green-600">
                              KES {test.price?.toLocaleString() || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Microscope className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No tests available for this lab provider</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Book Tests Section - Now below tests list */}
            <Card className="bg-white shadow-md border-none overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white p-4">
                <h2 className="text-xl font-bold font-playfair">
                  Book Your Tests
                </h2>
                <p className="text-sm opacity-90">
                  Select date and time to schedule your appointment
                </p>
              </div>
              <CardContent className="p-6">
                {/* Selected Tests Summary */}
                <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg">
                  <h3 className="font-medium mb-2">
                    Selected Tests ({selectedTests.length})
                  </h3>
                  {selectedTests.length > 0 ? (
                    <div className="space-y-2">
                      {selectedTests.map((testId) => {
                        const test = testServices.find((t) => t.id === testId);
                        return test ? (
                          <div
                            key={testId}
                            className="flex justify-between text-sm"
                          >
                            <span>{test.test_name}</span>
                            <span>KES {test.price.toLocaleString()}</span>
                          </div>
                        ) : null;
                      })}
                      <div className="border-t pt-2 font-medium">
                        <div className="flex justify-between">
                          <span>Total:</span>
                          <span className="text-green-600">
                            KES {totalPrice.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No tests selected</p>
                  )}
                </div>

                {/* Calendar and Time Selection - Horizontal Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Calendar Section */}
                  <div>
                    <h3 className="text-sm font-medium mb-3 flex items-center">
                      <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-2">
                        1
                      </div>
                      Select Date
                    </h3>
                    <div className="border rounded-md p-1 shadow-sm bg-white">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(selectedDate) => {
                          setDate(selectedDate);
                          setTimeSlot(null); // Reset time slot when date changes
                          if (selectedDate) {
                            getOccupiedTimesForDate(selectedDate);
                          }
                        }}
                        disabled={(date) => {
                          // Disable dates in the past and Sundays
                          const isPastDate =
                            date < new Date(new Date().setHours(0, 0, 0, 0));
                          const isSunday = date.getDay() === 0;
                          return isPastDate || isSunday;
                        }}
                        modifiers={{
                          booked: (date) => isDateOccupied(date),
                        }}
                        modifiersStyles={{
                          booked: {
                            backgroundColor: "#ef4444",
                            color: "white",
                            fontWeight: "bold",
                          },
                        }}
                        className="rounded-md border-none"
                      />
                    </div>
                    {/* Legend */}
                    <div className="flex items-center gap-4 mt-2 text-xs">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-red-500 rounded"></div>
                        <span>Fully Booked</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-green-500 rounded"></div>
                        <span>Available</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-gray-400 rounded"></div>
                        <span>Closed (Sundays)</span>
                      </div>
                    </div>
                    {bookingsLoading && (
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                        <div className="animate-spin h-3 w-3 border border-gray-300 border-t-transparent rounded-full"></div>
                        <span>Loading availability...</span>
                      </div>
                    )}
                  </div>

                  {/* Time Selection */}
                  <div>
                    <h3 className="text-sm font-medium mb-3 flex items-center">
                      <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-2">
                        2
                      </div>
                      Select Time
                    </h3>
                    <div className="border rounded-md p-3 shadow-sm bg-white overflow-y-auto max-h-[350px]">
                      {!date ? (
                        <div className="flex items-center justify-center h-[250px]">
                          <div className="text-center text-gray-500">
                            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">
                              Please select a date first
                            </p>
                          </div>
                        </div>
                      ) : (
                        <>
                          {bookingsLoading ? (
                            <div className="flex items-center justify-center h-full min-h-[200px]">
                              <div className="text-center">
                                <div className="animate-spin h-6 w-6 border-2 border-gray-300 border-t-green-500 rounded-full mx-auto mb-2"></div>
                                <p className="text-sm text-gray-500">
                                  Loading time slots...
                                </p>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {timeSlots.map((slot) => {
                                  const isOccupied = isTimeOccupied(slot);
                                  const isSelected = timeSlot === slot;
                                  return (
                                    <div
                                      key={slot}
                                      className={`py-2 px-3 text-center text-sm rounded-md border transition-all duration-200 ${
                                        isOccupied
                                          ? "bg-red-100 text-red-700 border-red-300 cursor-not-allowed opacity-75"
                                          : isSelected
                                            ? "bg-green-500 text-white border-green-500 shadow-md transform scale-105 cursor-pointer"
                                            : "border-gray-200 hover:border-green-300 hover:bg-green-50 cursor-pointer hover:shadow-sm"
                                      }`}
                                      onClick={() =>
                                        !isOccupied && setTimeSlot(slot)
                                      }
                                      title={
                                        isOccupied
                                          ? "This time slot is already booked for lab tests"
                                          : isSelected
                                            ? "Selected time slot"
                                            : "Click to select this time slot"
                                      }
                                    >
                                      <div className="font-medium">{slot}</div>
                                      {isOccupied && (
                                        <div className="text-xs mt-0.5 flex items-center justify-center gap-1">
                                          <AlertCircle className="h-3 w-3" />
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
                                          <CheckCircle className="h-3 w-3" />
                                          Selected
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Time slots summary for lab tests */}
                              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                <div className="flex justify-between items-center text-xs text-gray-600">
                                  <span>
                                    Available slots:{" "}
                                    {
                                      timeSlots.filter(
                                        (slot) => !isTimeOccupied(slot),
                                      ).length
                                    }
                                  </span>
                                  <span>
                                    Booked slots:{" "}
                                    {
                                      timeSlots.filter((slot) =>
                                        isTimeOccupied(slot),
                                      ).length
                                    }
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                  <div
                                    className="bg-red-500 h-2 rounded-full transition-all duration-300"
                                    style={{
                                      width: `${(timeSlots.filter((slot) => isTimeOccupied(slot)).length / timeSlots.length) * 100}%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                            </>
                          )}
                        </>
                      )}
                    </div>

                    {/* Lab-specific notice */}
                    {date && (
                      <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                        <div className="flex items-start gap-2">
                          <Microscope className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <div className="text-xs text-blue-700">
                            <div className="font-medium">Lab Testing Hours</div>
                            <div>
                              Early morning slots (7-9 AM) are ideal for fasting
                              tests. Sample collection available
                              Monday-Saturday.
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Book Button */}
                <div className="mt-6">
                  <Button
                    className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white shadow-md"
                    onClick={handleBookAppointment}
                    disabled={selectedTests.length === 0 || !date || !timeSlot}
                  >
                    Book Appointment
                  </Button>
                  <p className="text-xs text-gray-500 text-center mt-3">
                    By booking, you agree to our terms and conditions
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Lab Information Tab */}
          <TabsContent value="info" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Lab Description */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    About Lab
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">
                    {provider.description || "No description available."}
                  </p>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{provider.address}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      {provider.user?.phone_number || "Phone not available"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      {provider.user?.email || "Email not available"}
                    </span>
                  </div>
                  {provider.website && (
                    <div className="flex items-center gap-3">
                      <Building className="h-4 w-4 text-gray-500" />
                      <a
                        href={provider.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {provider.website}
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Operating Hours */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Operating Hours
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {renderOperatingHours(provider.operating_hours)}
                  </div>
                </CardContent>
              </Card>

              {/* Certifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5" />
                    Certifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {renderCertifications(provider.certifications)}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Book Tests Section in Lab Information Tab */}
            <Card className="bg-white shadow-md border-none overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white p-4">
                <h2 className="text-xl font-bold font-playfair">
                  Book Your Tests
                </h2>
                <p className="text-sm opacity-90">
                  Select date and time to schedule your appointment
                </p>
              </div>
              <CardContent className="p-6">
                {/* Selected Tests Summary */}
                <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg">
                  <h3 className="font-medium mb-2">
                    Selected Tests ({selectedTests.length})
                  </h3>
                  {selectedTests.length > 0 ? (
                    <div className="space-y-2">
                      {selectedTests.map((testId) => {
                        const test = testServices.find((t) => t.id === testId);
                        return test ? (
                          <div
                            key={testId}
                            className="flex justify-between text-sm"
                          >
                            <span>{test.test_name}</span>
                            <span>KES {test.price.toLocaleString()}</span>
                          </div>
                        ) : null;
                      })}
                      <div className="border-t pt-2 font-medium">
                        <div className="flex justify-between">
                          <span>Total:</span>
                          <span className="text-green-600">
                            KES {totalPrice.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No tests selected</p>
                  )}
                </div>

                {/* Calendar and Time Selection - Horizontal Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Calendar Section */}
                  <div>
                    <h3 className="text-sm font-medium mb-3 flex items-center">
                      <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-2">
                        1
                      </div>
                      Select Date
                    </h3>
                    <div className="border rounded-md p-1 shadow-sm bg-white">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        disabled={(date) => {
                          // Disable dates in the past and Sundays
                          return (
                            date < new Date(new Date().setHours(0, 0, 0, 0)) ||
                            date.getDay() === 0
                          );
                        }}
                        className="rounded-md border-none"
                      />
                    </div>
                  </div>

                  {/* Time Selection */}
                  <div>
                    <h3 className="text-sm font-medium mb-3 flex items-center">
                      <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-2">
                        2
                      </div>
                      Select Time
                    </h3>
                    <div className="border rounded-md p-3 shadow-sm bg-white overflow-y-auto max-h-[350px]">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {timeSlots.map((slot) => (
                          <div
                            key={slot}
                            className={`py-2 px-3 text-center text-sm rounded-md cursor-pointer border transition-all duration-200 ${
                              timeSlot === slot
                                ? "bg-green-500 text-white border-green-500 shadow-sm"
                                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                            }`}
                            onClick={() => setTimeSlot(slot)}
                          >
                            {slot}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Book Button */}
                <div className="mt-6">
                  <Button
                    className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white shadow-md"
                    onClick={handleBookAppointment}
                    disabled={selectedTests.length === 0 || !date || !timeSlot}
                  >
                    Book Appointment
                  </Button>
                  <p className="text-xs text-gray-500 text-center mt-3">
                    By booking, you agree to our terms and conditions
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Payment Modal */}
      {isPaymentModalOpen && !isPaymentSuccess && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md border-0 shadow-xl">
            <div className="bg-gradient-to-r from-blue-500 to-green-500 text-white p-5">
              <h2 className="text-xl font-bold">Complete Your Booking</h2>
              <p className="text-sm opacity-90">
                Make payment to confirm your appointment
              </p>
            </div>
            <CardContent className="p-6">
              <div className="mb-6 border-b pb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Lab:</span>
                  <span className="font-medium">{provider?.lab_name}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Selected Tests:</span>
                  <span className="font-medium">{selectedTests.length}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Date & Time:</span>
                  <span className="font-medium">
                    {date?.toLocaleDateString("en-GB")} at {timeSlot}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-lg mt-4">
                  <span>Total Amount:</span>
                  <span className="text-green-600">KES {totalPrice}</span>
                </div>
              </div>

              <div className="mb-6">
                <Label className="mb-2 block font-medium">
                  Select Payment Method
                </Label>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                  className="space-y-2"
                >
                  <div className="border rounded-lg p-4 flex items-center space-x-2">
                    <RadioGroupItem value="mpesa" id="mpesa" />
                    <Label
                      htmlFor="mpesa"
                      className="flex items-center cursor-pointer"
                    >
                      <div className="bg-green-100 rounded-full p-1 mr-2">
                        <span className="text-green-600 font-bold text-xs">
                          M
                        </span>
                      </div>
                      M-Pesa
                    </Label>
                  </div>
                  <div className="border rounded-lg p-4 flex items-center space-x-2">
                    <RadioGroupItem value="card" id="card" />
                    <Label
                      htmlFor="card"
                      className="flex items-center cursor-pointer"
                    >
                      <div className="bg-blue-100 rounded-full p-1 mr-2">
                        <span className="text-blue-600 font-bold text-xs">
                          C
                        </span>
                      </div>
                      Credit/Debit Card
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {paymentMethod === "mpesa" && (
                <div className="mb-6">
                  <Label htmlFor="phone" className="mb-2 block font-medium">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+254722549387"
                    className="mb-2"
                  />
                  <p className="text-xs text-gray-500">
                    You will receive an M-Pesa prompt to complete the payment.
                  </p>
                  {(paymentStatus || pesapalPaymentStatus) && (
                    <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-blue-700">
                      {paymentStatus || pesapalPaymentStatus}
                    </div>
                  )}
                </div>
              )}

              {paymentMethod === "card" && (
                <div className="mb-6 space-y-4">
                  <div>
                    <Label
                      htmlFor="cardPhone"
                      className="mb-2 block font-medium"
                    >
                      Phone Number
                    </Label>
                    <Input
                      id="cardPhone"
                      type="tel"
                      placeholder="+254722549387"
                      value={phoneNumber || "+254722549387"}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="mb-2"
                    />
                    <p className="text-xs text-gray-500">
                      Required for payment confirmation and notifications.
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <Info className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">
                        Secure Card Payment
                      </span>
                    </div>
                    <p className="text-xs text-blue-700">
                      You will be redirected to a secure payment page to
                      complete your card payment.
                    </p>
                    {pesapalPaymentStatus && (
                      <div className="mt-2 p-2 bg-white rounded text-sm text-blue-700">
                        {pesapalPaymentStatus}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsPaymentModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={processPayment}
                  disabled={
                    isProcessing || mpesaProcessing || pesapalProcessing
                  }
                >
                  {isProcessing || mpesaProcessing || pesapalProcessing
                    ? "Processing..."
                    : "Complete Payment"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Success Modal */}
      {isPaymentSuccess && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md border-0 shadow-xl">
            <CardContent className="p-8 text-center">
              <div className="bg-green-100 rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-green-700 mb-2">
                Booking Successful!
              </h2>
              <p className="text-gray-600 mb-6">
                Your lab appointment at {provider?.lab_name} has been scheduled
                for {date?.toLocaleDateString("en-GB")} at {timeSlot}.
              </p>
              <Button
                className="w-full"
                onClick={() => navigate("/patient-dashboard/appointments")}
              >
                View My Appointments
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default LabProviderDetails;
