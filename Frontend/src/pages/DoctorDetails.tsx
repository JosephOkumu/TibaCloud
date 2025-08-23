import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
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
  Video,
  UserRound,
  Clock,
  Stethoscope,
  GraduationCap,
  Languages,
  Heart,
  ThumbsUp,
  CheckCircle,
  X,
  Check,
} from "lucide-react";
import doctorService, { Doctor } from "@/services/doctorService";
import { useCalendarBookings } from "@/hooks/useCalendarBookings";
import { useMpesaPayment } from "@/hooks/useMpesaPayment";
import appointmentService from "@/services/appointmentService";

const defaultDoctorImage =
  "/lovable-uploads/a05b3053-380f-4711-b032-bc48d1c082f0.png";
// Dummy reviews data - will be replaced later
const dummyReviews = [
  {
    id: 1,
    patientName: "Michael O.",
    rating: 5,
    date: "March 15, 2025",
    comment:
      "Excellent doctor! Very thorough in examination and explained everything clearly. Highly recommended.",
  },
  {
    id: 2,
    patientName: "Sarah K.",
    rating: 4,
    date: "February 22, 2025",
    comment:
      "Professional and knowledgeable doctor. The consultation was very helpful.",
  },
];

// Dummy FAQ data - will be replaced later
const dummyFAQ = [
  {
    question: "What should I bring to my appointment?",
    answer:
      "Please bring a valid ID, insurance card (if applicable), and any previous medical records relevant to your condition.",
  },
  {
    question: "How long is a typical consultation?",
    answer:
      "Consultations typically last 30-45 minutes, allowing adequate time for examination and discussion.",
  },
  {
    question: "Do you accept insurance?",
    answer:
      "We accept most major insurance plans. Please contact us to verify coverage for your specific plan.",
  },
];

// Available time slots
const timeSlots = [
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
  "5:00 PM",
  "5:30 PM",
];

const DoctorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [consultationType, setConsultationType] = useState("physical");
  const [date, setDate] = useState(null);
  const [timeSlot, setTimeSlot] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("mpesa");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calendar booking hook
  const {
    occupiedDates,
    occupiedTimes,
    isLoading: bookingsLoading,
    getOccupiedTimesForDate,
    isDateOccupied,
    isTimeOccupied,
  } = useCalendarBookings({
    providerId: doctor?.id || 0,
    providerType: "doctor",
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

      // Create doctor appointment after successful payment
      try {
        if (user && doctor && date && timeSlot) {
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

          await appointmentService.createAppointment({
            doctor_id: doctor.id,
            appointment_datetime: appointmentDateTime.toISOString(),
            type: consultationType === "physical" ? "in_person" : "virtual",
            reason_for_visit: "Doctor consultation",
            symptoms: "",
            fee: Number(consultationFee) || 0,
          });

          console.log("Doctor appointment created successfully");
        }
      } catch (error) {
        console.error("Error creating doctor appointment:", error);
        // Still show success since payment went through
      }

      setIsSuccess(true);
      setIsPaymentModalOpen(false);
    },
    onError: (error) => {
      setIsProcessing(false);
      console.error("Payment error:", error);
    },
  });

  // Fetch doctor by ID when component mounts
  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        setLoading(true);
        const doctorData = await doctorService.getDoctor(parseInt(id!));
        setDoctor(doctorData);
        setError(null);
      } catch (err) {
        console.error("Error fetching doctor:", err);
        setError("Doctor not found");
        // Redirect if doctor not found
        setTimeout(() => {
          navigate("/patient-dashboard/consultation");
        }, 2000);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDoctor();
    }
  }, [id, navigate]);

  // Function to render star ratings
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star
          key={`full-${i}`}
          className="h-4 w-4 fill-yellow-400 text-yellow-400"
        />,
      );
    }

    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative">
          <Star className="h-4 w-4 text-gray-300" />
          <div className="absolute inset-0 overflow-hidden w-1/2">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          </div>
        </div>,
      );
    }

    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />);
    }

    return stars;
  };

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

    // Open payment modal
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

      // Validate phone number format
      const phoneRegex = /^(0|254)[17]\d{8}$/;
      if (!phoneRegex.test(phoneNumber.replace(/\s/g, ""))) {
        toast({
          title: "Invalid Phone Number",
          description:
            "Please enter a valid Safaricom number (e.g., 0712345678).",
          variant: "destructive",
        });
        return;
      }

      setIsProcessing(true);

      try {
        await initiatePayment({
          amount: Number(consultationFee) || 0,
          phoneNumber: phoneNumber,
          accountReference: `DOC-${doctor.id}-${Date.now()}`,
          transactionDesc: `Consultation with ${doctor.user.name}`,
        });
      } catch (error) {
        setIsProcessing(false);
        console.error("Payment initiation failed:", error);
      }
    } else {
      // Handle card payments (simulate for now)
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        setIsSuccess(true);

        toast({
          title: "Appointment Booked!",
          description: "Your appointment has been successfully scheduled.",
          variant: "default",
        });

        // Redirect after a short delay
        setTimeout(() => {
          navigate("/patient-dashboard/appointments");
        }, 2000);
      }, 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-gray-600">Loading doctor details...</div>
        </div>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-red-600">{error}</div>
          <p className="text-sm text-gray-500 mt-2">
            Redirecting to doctors list...
          </p>
        </div>
      </div>
    );
  }

  // Calculate consultation fee based on selected type
  const consultationFee =
    Number(
      consultationType === "physical"
        ? doctor.physical_consultation_fee || doctor.default_consultation_fee
        : doctor.online_consultation_fee || doctor.default_consultation_fee,
    ) || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      {/* Top Navigation Bar */}
      <header className="bg-white shadow-sm p-4">
        <div className="container mx-auto flex justify-between items-center">
          {/* Logo & User Profile */}
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

          {/* Search Bar */}
          <div className="relative hidden md:block max-w-md w-full mx-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="search"
              placeholder="Search for doctors, specialties..."
              className="pl-10 w-full border-gray-200 focus-visible:ring-secondary-green"
            />
          </div>

          {/* User Actions */}
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

            {/* User Profile */}
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
        {/* Back Button */}
        <div className="mb-4">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center text-gray-600"
            onClick={() => navigate("/patient-dashboard/consultation")}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Doctors
          </Button>
        </div>

        {/* Doctor Profile Section */}
        <Card className="mb-6 overflow-hidden border-0 shadow-md">
          <div className="bg-gradient-to-r from-blue-500/90 to-teal-500/90 text-white p-8">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-shrink-0">
                <Avatar className="h-28 w-28 border-4 border-white/30 shadow-lg">
                  <AvatarImage
                    src={doctor.profile_image || defaultDoctorImage}
                    alt={doctor.user.name}
                  />
                  <AvatarFallback>
                    {doctor.user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="flex-1">
                <div className="flex flex-col md:flex-row justify-between md:items-start">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">
                      {doctor.user.name}
                    </h1>
                    <p className="text-lg opacity-90 mb-2">
                      {doctor.specialty}
                    </p>
                  </div>

                  <div className="flex items-center mt-3 md:mt-0">
                    <div className="flex mr-2">
                      {renderStars(doctor.average_rating || 4.5)}
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-white/20 border-white/30 text-white p-1"
                    >
                      {doctor.average_rating || 4.5} / 5
                    </Badge>
                  </div>
                </div>

                <p className="opacity-90 mb-4 max-w-3xl">
                  {doctor.professional_summary ||
                    doctor.bio ||
                    "Professional summary not available"}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                  <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm p-3 rounded-lg">
                    <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="text-sm opacity-80">Location</div>
                      <div className="font-bold text-lg">
                        {doctor.location || "Location not specified"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm p-3 rounded-lg">
                    <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                      <Stethoscope className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="text-sm opacity-80">Experience</div>
                      <div className="font-bold text-lg">
                        {doctor.years_of_experience ||
                          doctor.experience ||
                          "Not specified"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm p-3 rounded-lg">
                    <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                      <Languages className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="text-sm opacity-80">Languages</div>
                      <div className="font-bold text-sm">
                        {doctor.languages || "English"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Doctor Information Tabs */}
        <Card className="border-0 shadow-md overflow-hidden mb-6">
          <CardContent className="p-6">
            <Tabs defaultValue="about">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="faq">FAQ</TabsTrigger>
              </TabsList>

              <TabsContent value="about" className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-green-700 mb-2">
                    Professional Summary
                  </h3>
                  <p className="text-gray-700">
                    {doctor.professional_summary ||
                      doctor.bio ||
                      doctor.description ||
                      "Professional summary not available"}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-green-700 mb-2">
                    Certifications
                  </h3>
                  <p className="text-gray-700">
                    Professional certifications information will be available
                    soon.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-green-700 flex items-center gap-2 mb-2">
                      <Video className="h-5 w-5" />
                      Online Consultation
                    </h4>
                    <p className="text-gray-700 mb-1">
                      {doctor.online_consultation_fee
                        ? "Available"
                        : "Not Available"}
                    </p>
                    {doctor.online_consultation_fee && (
                      <p className="font-bold text-lg text-green-700">
                        KES {doctor.online_consultation_fee}
                      </p>
                    )}
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-700 flex items-center gap-2 mb-2">
                      <UserRound className="h-5 w-5" />
                      Physical Consultation
                    </h4>
                    <p className="text-gray-700 mb-1">Available</p>
                    <p className="font-bold text-lg text-blue-700">
                      KES{" "}
                      {doctor.physical_consultation_fee ||
                        doctor.default_consultation_fee}
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center mb-4">
                    <div className="flex mr-2">
                      {renderStars(doctor.average_rating || 4.5)}
                    </div>
                    <span className="text-lg font-bold">
                      {doctor.average_rating || 4.5}/5
                    </span>
                    <span className="text-gray-500 ml-2">
                      ({dummyReviews.length} reviews)
                    </span>
                  </div>

                  {dummyReviews.map((review) => (
                    <Card key={review.id} className="border-0 shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex justify-between mb-2">
                          <h4 className="font-medium">{review.patientName}</h4>
                          <span className="text-gray-500 text-sm">
                            {review.date}
                          </span>
                        </div>
                        <div className="flex mb-2">
                          {renderStars(review.rating)}
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="faq" className="space-y-4">
                <div className="space-y-4">
                  {dummyFAQ.map((faq, index) => (
                    <div key={index}>
                      <h4 className="font-medium text-green-700 mb-2">
                        {faq.question}
                      </h4>
                      <p className="text-gray-700">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Booking Section - Now vertically aligned */}
        <Card className="border-0 shadow-md overflow-hidden mb-6">
          <div className="bg-green-500 p-4 text-white">
            <h2 className="text-xl font-bold">Book Appointment</h2>
            <p className="text-sm opacity-90">Select type, date, and time</p>
          </div>
          <CardContent className="p-6">
            {/* Select Consultation Type */}
            <div className="mb-6">
              <Label className="mb-2 block font-medium">
                Select Consultation Type
              </Label>
              <RadioGroup
                value={consultationType}
                onValueChange={setConsultationType}
                className="grid grid-cols-2 gap-4"
              >
                {doctor.online_consultation_fee && (
                  <div
                    className={`border rounded-lg p-4 flex items-center space-x-2 ${
                      consultationType === "online"
                        ? "bg-blue-50 border-blue-500"
                        : ""
                    }`}
                  >
                    <RadioGroupItem value="online" id="online" />
                    <Label
                      htmlFor="online"
                      className="flex items-center cursor-pointer"
                    >
                      <Video className="h-5 w-5 mr-2 text-blue-500" />
                      <div>
                        <div>Online Consultation</div>
                        <div className="text-sm text-gray-500">
                          KES {doctor.online_consultation_fee}
                        </div>
                      </div>
                    </Label>
                  </div>
                )}
                <div
                  className={`border rounded-lg p-4 flex items-center space-x-2 ${
                    consultationType === "physical"
                      ? "bg-green-50 border-green-500"
                      : ""
                  }`}
                >
                  <RadioGroupItem value="physical" id="physical" />
                  <Label
                    htmlFor="physical"
                    className="flex items-center cursor-pointer"
                  >
                    <UserRound className="h-5 w-5 mr-2 text-green-500" />
                    <div>
                      <div>Physical Consultation</div>
                      <div className="text-sm text-gray-500">
                        KES{" "}
                        {doctor.physical_consultation_fee ||
                          doctor.default_consultation_fee}
                      </div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Select Date */}
              <div>
                <Label className="mb-2 block font-medium">Select Date</Label>
                <div className="border rounded-md p-1 shadow-sm bg-white max-w-full">
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
                      // Disable dates in the past
                      const isPastDate =
                        date < new Date(new Date().setHours(0, 0, 0, 0));

                      return isPastDate;
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
                    <div className="w-3 h-3 bg-orange-500 rounded"></div>
                    <span>Limited Slots</span>
                  </div>
                </div>
                {bookingsLoading && (
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    <div className="animate-spin h-3 w-3 border border-gray-300 border-t-transparent rounded-full"></div>
                    <span>Loading availability...</span>
                  </div>
                )}
              </div>

              {/* Select Time */}
              <div>
                <Label className="mb-2 block font-medium">Select Time</Label>
                {!date ? (
                  <div className="border rounded-md p-3 shadow-sm bg-gray-50 h-[250px] flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Please select a date first</p>
                    </div>
                  </div>
                ) : (
                  <div className="border rounded-md p-3 shadow-sm bg-white overflow-y-auto h-[250px]">
                    {bookingsLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <div className="animate-spin h-6 w-6 border-2 border-gray-300 border-t-blue-500 rounded-full mx-auto mb-2"></div>
                          <p className="text-sm text-gray-500">
                            Loading time slots...
                          </p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-3 gap-2">
                          {timeSlots.map((slot) => {
                            const isOccupied = isTimeOccupied(slot);
                            const isSelected = timeSlot === slot;
                            return (
                              <div
                                key={slot}
                                className={`py-2 px-1 text-center text-sm rounded-md border transition-all duration-200 ${
                                  isOccupied
                                    ? "bg-red-100 text-red-700 border-red-300 cursor-not-allowed opacity-75"
                                    : isSelected
                                      ? "bg-green-500 text-white border-green-500 cursor-pointer shadow-md transform scale-105"
                                      : "border-gray-200 hover:border-green-300 hover:bg-green-50 cursor-pointer hover:shadow-sm"
                                }`}
                                onClick={() => !isOccupied && setTimeSlot(slot)}
                                title={
                                  isOccupied
                                    ? "This time slot is already booked"
                                    : isSelected
                                      ? "Selected time slot"
                                      : "Click to select this time slot"
                                }
                              >
                                <div className="font-medium">{slot}</div>
                                {isOccupied && (
                                  <div className="text-xs mt-0.5 flex items-center justify-center gap-1">
                                    <X className="h-3 w-3" />
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
                                    <Check className="h-3 w-3" />
                                    Selected
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Time slots summary */}
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
                                timeSlots.filter((slot) => isTimeOccupied(slot))
                                  .length
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
                  </div>
                )}

                {/* Popular times notice */}
                {date && (
                  <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                    <div className="flex items-start gap-2">
                      <Clock className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-blue-700">
                        <div className="font-medium">Popular Times</div>
                        <div>
                          Morning slots (8-11 AM) and evening slots (4-6 PM)
                          tend to fill up quickly.
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Booking Summary */}
            {date && timeSlot && (
              <div className="border rounded-lg p-4 bg-green-50 my-6">
                <h3 className="font-medium mb-2">Booking Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Doctor:</span>
                    <span className="font-medium">{doctor.user.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Consultation Type:</span>
                    <span className="font-medium">
                      {consultationType === "online"
                        ? "Online Consultation"
                        : "Physical Consultation"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">
                      {date.toLocaleDateString("en-GB", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-medium">{timeSlot}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 mt-2 font-bold">
                    <span>Total:</span>
                    <span className="text-green-600">
                      KES {consultationFee}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <Button
              className="w-full"
              onClick={handleBookAppointment}
              disabled={!date || !timeSlot}
            >
              Proceed to Payment
            </Button>
          </CardContent>
        </Card>
      </main>

      {/* Payment Modal */}
      {isPaymentModalOpen && !isSuccess && (
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
                  <span className="text-gray-600">Doctor:</span>
                  <span className="font-medium">{doctor.user.name}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Consultation:</span>
                  <span className="font-medium">
                    {consultationType === "online"
                      ? "Online Consultation"
                      : "Physical Consultation"}
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Date & Time:</span>
                  <span className="font-medium">
                    {date?.toLocaleDateString("en-GB")} at {timeSlot}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-lg mt-4">
                  <span>Total Amount:</span>
                  <span className="text-green-600">KES {consultationFee}</span>
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
                    placeholder="e.g. 0712345678"
                    className="mb-2"
                  />
                  <p className="text-xs text-gray-500">
                    You will receive an M-Pesa prompt to complete the payment.
                  </p>
                  {paymentStatus && (
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                      <div className="flex items-center space-x-2">
                        {isProcessing || mpesaProcessing ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        ) : null}
                        <span>{paymentStatus}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {paymentMethod === "card" && (
                <div className="mb-6 space-y-4">
                  <div>
                    <Label
                      htmlFor="cardNumber"
                      className="mb-2 block font-medium"
                    >
                      Card Number
                    </Label>
                    <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor="expiry"
                        className="mb-2 block font-medium"
                      >
                        Expiry Date
                      </Label>
                      <Input id="expiry" placeholder="MM/YY" />
                    </div>
                    <div>
                      <Label htmlFor="cvv" className="mb-2 block font-medium">
                        CVV
                      </Label>
                      <Input id="cvv" placeholder="123" />
                    </div>
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
                    isProcessing || mpesaProcessing || !phoneNumber.trim()
                  }
                >
                  {isProcessing || mpesaProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    "Complete Payment"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Success Modal */}
      {isSuccess && (
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
                Your appointment with {doctor.user.name} has been scheduled for{" "}
                {date?.toLocaleDateString("en-GB")} at {timeSlot}.
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

export default DoctorDetails;
