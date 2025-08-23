import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { LocationAutocomplete } from "@/components/LocationInput";
import AppointmentCalendar from "@/components/calendar/AppointmentCalendar";
import appointmentService, { Appointment } from "@/services/appointmentService";
import doctorService, {
  Doctor,
  DoctorProfileUpdateData,
} from "@/services/doctorService";
import {
  Upload,
  Save,
  Image as ImageIcon,
  MapPin,
  Clock,
  Star,
  FileText,
  Stethoscope,
  Edit,
  Trash2,
  Plus,
  Calendar,
  Heart,
  Shield,
  CreditCard,
  Activity,
  Users,
  User,
  Bell,
  CheckCircle,
  Settings,
  X,
} from "lucide-react";
import AvailabilityScheduler, {
  WeeklySchedule,
} from "@/components/AvailabilityScheduler";

interface DoctorProfileForm {
  name: string;
  specialty: string;
  description: string;
  hospital: string;
  location: string;
  availability: string;
  experience: string;
  physicalPrice: string;
  onlinePrice: string;
  image: File | null;

  languages: string;
  acceptsInsurance: boolean;
  consultationModes: string[];
}

interface DoctorProfile {
  specialty: string;
  description: string;
  professional_summary: string;
  years_of_experience: string;
  hospital: string;
  location: string;
  license_number: string;

  experience: string;
  default_consultation_fee: number;
  physical_consultation_fee: number;
  online_consultation_fee: number;
  profile_image: string;
  bio: string;
  languages: string;
  accepts_insurance: boolean;
  consultation_modes: string[];
  availability: string;
  is_available_for_consultation: boolean;
  user?: {
    id: number;
    name: string;
    email: string;
    phone_number: string;
  };
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  isActive: boolean;
}

interface ServiceItem {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
}

// Helper functions for schedule parsing
const parseScheduleFromString = (scheduleString: string): WeeklySchedule => {
  try {
    if (!scheduleString) return getDefaultSchedule();
    const parsed = JSON.parse(scheduleString);
    return parsed;
  } catch {
    return getDefaultSchedule();
  }
};

const formatScheduleToString = (schedule: WeeklySchedule): string => {
  return JSON.stringify(schedule);
};

const getDefaultSchedule = (): WeeklySchedule => ({
  Sun: { available: false, times: [] },
  Mon: { available: true, times: [{ start: "9:00am", end: "5:00pm" }] },
  Tue: { available: true, times: [{ start: "9:00am", end: "5:00pm" }] },
  Wed: { available: true, times: [{ start: "9:00am", end: "5:00pm" }] },
  Thu: { available: true, times: [{ start: "9:00am", end: "5:00pm" }] },
  Fri: { available: true, times: [{ start: "9:00am", end: "5:00pm" }] },
  Sat: { available: false, times: [] },
});

const DoctorDashboard = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("schedule");
  const [isAddingService, setIsAddingService] = useState(false);
  const [isEditingService, setIsEditingService] = useState(false);
  const [currentServiceId, setCurrentServiceId] = useState<string | null>(null);
  const [showSubscriptionForm, setShowSubscriptionForm] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(true);

  // Doctor profile state
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile>({
    specialty: "",
    description: "",
    professional_summary: "",
    years_of_experience: "",
    hospital: "",
    location: "",
    license_number: "",
    experience: "",
    default_consultation_fee: 0,
    physical_consultation_fee: 0,
    online_consultation_fee: 0,
    profile_image: "",
    bio: "",
    languages: "",
    accepts_insurance: false,
    consultation_modes: [],
    availability: "",
    is_available_for_consultation: true,
    user: undefined,
  });

  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Sample services
  const [services, setServices] = useState<ServiceItem[]>([
    {
      id: "1",
      name: "General Consultation",
      description: "Standard medical consultation for general health concerns.",
      price: 2500,
      duration: "30 minutes",
    },
    {
      id: "2",
      name: "Specialized Consultation",
      description: "In-depth consultation for specific medical conditions.",
      price: 4500,
      duration: "45 minutes",
    },
  ]);

  // Load appointments
  useEffect(() => {
    const loadAppointments = async () => {
      try {
        setIsLoadingAppointments(true);

        // TODO: Remove this line when backend appointments API is ready
        throw new Error("Using dummy data for UI development");

        const doctorAppointments =
          await appointmentService.getAppointments("doctor");
        setAppointments(doctorAppointments);
      } catch (error) {
        console.error("Failed to load appointments:", error);
        toast({
          title: "Demo Mode",
          description:
            "Showing demo appointments for UI development and testing.",
          variant: "default",
        });
        // For demo purposes, set some sample appointments
        // Demo appointments data - always loaded until backend API is implemented
        setAppointments([
          {
            id: 1,
            patient_id: 1,
            doctor_id: 1,
            appointment_datetime: new Date().toISOString(),
            status: "confirmed",
            type: "in_person",
            reason_for_visit: "Regular checkup",
            symptoms: "General wellness check",
            fee: 2500,
            is_paid: true,
            patient: {
              id: 1,
              user_id: 1,
              user: {
                name: "John Doe",
                email: "john@example.com",
                phone_number: "+254712345678",
              },
            },
          },
          {
            id: 2,
            patient_id: 2,
            doctor_id: 1,
            appointment_datetime: new Date(Date.now() + 86400000).toISOString(),
            status: "confirmed",
            type: "virtual",
            reason_for_visit: "Follow-up consultation",
            symptoms: "Medication review",
            meeting_link: "https://meet.example.com/abc123",
            fee: 2000,
            is_paid: true,
            patient: {
              id: 2,
              user_id: 2,
              user: {
                name: "Jane Smith",
                email: "jane@example.com",
                phone_number: "+254787654321",
              },
            },
          },
          {
            id: 3,
            patient_id: 3,
            doctor_id: 1,
            appointment_datetime: new Date(
              Date.now() + 172800000,
            ).toISOString(),
            status: "scheduled",
            type: "in_person",
            reason_for_visit: "Consultation for chronic condition",
            symptoms: "Persistent headaches and fatigue",
            fee: 3000,
            is_paid: false,
            patient: {
              id: 3,
              user_id: 3,
              user: {
                name: "Mike Johnson",
                email: "mike@example.com",
                phone_number: "+254798765432",
              },
            },
          },
          {
            id: 4,
            patient_id: 4,
            doctor_id: 1,
            appointment_datetime: new Date(
              Date.now() + 259200000,
            ).toISOString(),
            status: "confirmed",
            type: "virtual",
            reason_for_visit: "Specialist consultation",
            symptoms: "Cardiac assessment",
            meeting_link: "https://meet.example.com/def456",
            fee: 4500,
            is_paid: true,
            patient: {
              id: 4,
              user_id: 4,
              user: {
                name: "Sarah Wilson",
                email: "sarah@example.com",
                phone_number: "+254701234567",
              },
            },
          },
          {
            id: 5,
            patient_id: 5,
            doctor_id: 1,
            appointment_datetime: new Date(
              Date.now() + 604800000,
            ).toISOString(),
            status: "scheduled",
            type: "in_person",
            reason_for_visit: "Routine examination",
            symptoms: "Annual physical",
            fee: 2500,
            is_paid: false,
            patient: {
              id: 5,
              user_id: 5,
              user: {
                name: "David Brown",
                email: "david@example.com",
                phone_number: "+254789012345",
              },
            },
          },
          // Past appointments for history
          {
            id: 6,
            patient_id: 6,
            doctor_id: 1,
            appointment_datetime: new Date(Date.now() - 86400000).toISOString(), // Yesterday
            status: "completed",
            type: "in_person",
            reason_for_visit: "General consultation",
            symptoms: "Stomach pain and nausea",
            fee: 2500,
            is_paid: true,
            patient: {
              id: 6,
              user_id: 6,
              user: {
                name: "Alice Johnson",
                email: "alice@example.com",
                phone_number: "+254701234568",
              },
            },
          },
          {
            id: 7,
            patient_id: 7,
            doctor_id: 1,
            appointment_datetime: new Date(
              Date.now() - 172800000,
            ).toISOString(), // 2 days ago
            status: "completed",
            type: "virtual",
            reason_for_visit: "Follow-up consultation",
            symptoms: "Blood pressure monitoring",
            meeting_link: "https://meet.example.com/ghi789",
            fee: 2000,
            is_paid: true,
            patient: {
              id: 7,
              user_id: 7,
              user: {
                name: "Robert Wilson",
                email: "robert@example.com",
                phone_number: "+254712345679",
              },
            },
          },
          {
            id: 8,
            patient_id: 8,
            doctor_id: 1,
            appointment_datetime: new Date(
              Date.now() - 259200000,
            ).toISOString(), // 3 days ago
            status: "cancelled",
            type: "in_person",
            reason_for_visit: "Dental examination",
            symptoms: "Tooth pain",
            fee: 3000,
            is_paid: false,
            patient: {
              id: 8,
              user_id: 8,
              user: {
                name: "Emma Davis",
                email: "emma@example.com",
                phone_number: "+254787654322",
              },
            },
          },
          {
            id: 9,
            patient_id: 9,
            doctor_id: 1,
            appointment_datetime: new Date(
              Date.now() - 604800000,
            ).toISOString(), // 1 week ago
            status: "completed",
            type: "virtual",
            reason_for_visit: "Specialist consultation",
            symptoms: "Skin condition assessment",
            meeting_link: "https://meet.example.com/jkl012",
            fee: 4000,
            is_paid: true,
            patient: {
              id: 9,
              user_id: 9,
              user: {
                name: "Michael Chen",
                email: "michael@example.com",
                phone_number: "+254798765433",
              },
            },
          },
          {
            id: 10,
            patient_id: 10,
            doctor_id: 1,
            appointment_datetime: new Date(
              Date.now() - 1209600000,
            ).toISOString(), // 2 weeks ago
            status: "completed",
            type: "in_person",
            reason_for_visit: "Routine check-up",
            symptoms: "General health assessment",
            fee: 2500,
            is_paid: true,
            patient: {
              id: 10,
              user_id: 10,
              user: {
                name: "Lisa Anderson",
                email: "lisa@example.com",
                phone_number: "+254701234569",
              },
            },
          },
          {
            id: 11,
            patient_id: 11,
            doctor_id: 1,
            appointment_datetime: new Date(
              Date.now() - 1814400000,
            ).toISOString(), // 3 weeks ago
            status: "cancelled",
            type: "virtual",
            reason_for_visit: "Mental health consultation",
            symptoms: "Anxiety and stress management",
            meeting_link: "https://meet.example.com/mno345",
            fee: 3500,
            is_paid: false,
            patient: {
              id: 11,
              user_id: 11,
              user: {
                name: "James Martinez",
                email: "james@example.com",
                phone_number: "+254712345680",
              },
            },
          },
        ]);
      } finally {
        setIsLoadingAppointments(false);
      }
    };

    loadAppointments();
  }, [toast]);

  const handleAppointmentClick = (appointment: Appointment) => {
    toast({
      title: "Appointment Selected",
      description: `Appointment with ${appointment.patient?.user?.name} at ${appointment.time}`,
      variant: "default",
    });
  };

  // Sample subscription plans
  const [subscriptionPlans, setSubscriptionPlans] = useState<
    SubscriptionPlan[]
  >([
    {
      id: "1",
      name: "Basic Care",
      price: 1500,
      description: "Monthly subscription for basic healthcare needs",
      features: [
        "10% discount on all consultations",
        "Priority scheduling",
        "24/7 chat support",
      ],
      isActive: true,
    },
    {
      id: "2",
      name: "Premium Care",
      price: 4500,
      description:
        "Comprehensive healthcare subscription with maximum benefits",
      features: [
        "25% discount on all consultations",
        "Same-day appointments",
        "Free medication delivery",
        "Unlimited video consultations",
      ],
      isActive: true,
    },
  ]);

  // Form for doctor profile
  const profileForm = useForm<DoctorProfileForm>({
    defaultValues: {
      name: "Dr. John Doe",
      specialty: "Cardiologist",
      description:
        "Experienced cardiologist specializing in preventive cardiac care and heart disease management.",
      hospital: "Nairobi Medical Center",
      location: "Nairobi Medical Center, 3rd Floor",
      availability: "Mon-Fri, 9AM-5PM",
      experience: "15 years",
      physicalPrice: "2500",
      onlinePrice: "2000",
      image: null,

      languages: "English, Swahili",
      acceptsInsurance: true,
      consultationModes: ["In-person", "Video", "Chat"],
    },
  });

  // Form for service management
  const serviceForm = useForm<ServiceItem>({
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      duration: "",
    },
  });

  // Form for subscription plan
  const subscriptionForm = useForm<SubscriptionPlan>({
    defaultValues: {
      id: "",
      name: "",
      price: 0,
      description: "",
      features: [],
      isActive: true,
    },
  });

  // Load profile data on component mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsProfileLoading(true);

        const profile = await doctorService.getProfile();

        // Map API response to form format
        const mappedProfile: DoctorProfile = {
          specialty: profile.specialty || "",
          description: profile.description || "",
          professional_summary: profile.professional_summary || "",
          years_of_experience: profile.years_of_experience || "",
          hospital: profile.hospital || "",
          location: profile.location || "",
          license_number: profile.license_number || "",

          experience: profile.experience || "",
          default_consultation_fee: profile.default_consultation_fee || 0,
          physical_consultation_fee: profile.physical_consultation_fee || 0,
          online_consultation_fee: profile.online_consultation_fee || 0,
          profile_image: profile.profile_image || "",
          bio: profile.bio || "",
          languages: profile.languages || "",
          accepts_insurance: profile.accepts_insurance || false,
          consultation_modes: Array.isArray(profile.consultation_modes)
            ? profile.consultation_modes
            : profile.consultation_modes
              ? JSON.parse(profile.consultation_modes)
              : [],
          availability:
            typeof profile.availability === "string"
              ? profile.availability
              : JSON.stringify(profile.availability) || "",
          is_available_for_consultation:
            profile.is_available_for_consultation || true,
        };

        // Include user data in the mapped profile
        mappedProfile.user = profile.user;
        setDoctorProfile(mappedProfile);

        // Map to form format
        const formData: DoctorProfileForm = {
          name: profile.user?.name || "Dr. " + profile.specialty,
          specialty: profile.specialty || "",
          description:
            profile.description || profile.professional_summary || "",
          hospital: profile.hospital || "",
          location: profile.location || "",
          availability: profile.availability || "",
          experience: profile.years_of_experience || profile.experience || "",
          physicalPrice: profile.physical_consultation_fee?.toString() || "0",
          onlinePrice: profile.online_consultation_fee?.toString() || "0",
          image: null,

          languages: profile.languages || "",
          acceptsInsurance: profile.accepts_insurance || false,
          consultationModes: Array.isArray(profile.consultation_modes)
            ? profile.consultation_modes
            : profile.consultation_modes
              ? JSON.parse(profile.consultation_modes)
              : [],
        };

        profileForm.reset(formData);
      } catch (error) {
        console.error("Failed to load profile:", error);
        toast({
          title: "Error",
          description: "Failed to load doctor profile. Using default values.",
          variant: "destructive",
        });
      } finally {
        setIsProfileLoading(false);
      }
    };

    loadProfile();
  }, [profileForm, toast]);

  const onProfileSubmit = async (data: DoctorProfileForm) => {
    try {
      console.log("=== PROFILE SUBMIT DEBUG ===");
      console.log("Form data received:", data);
      console.log("Form data types:", {
        name: typeof data.name,
        specialty: typeof data.specialty,
        description: typeof data.description,
        location: typeof data.location,
        availability: typeof data.availability,
        experience: typeof data.experience,
        physicalPrice: typeof data.physicalPrice,
        onlinePrice: typeof data.onlinePrice,

        languages: typeof data.languages,
        acceptsInsurance: typeof data.acceptsInsurance,
        consultationModes: typeof data.consultationModes,
      });

      // Map form data to API format
      const apiData: DoctorProfileUpdateData = {
        name: data.name || "",
        specialty: data.specialty || "",
        description: data.description || "",
        hospital: data.hospital || "",
        location: data.location || "",
        availability: data.availability || "",
        experience: data.experience || "",
        physicalPrice: data.physicalPrice
          ? parseFloat(data.physicalPrice.toString())
          : 0,
        onlinePrice: data.onlinePrice
          ? parseFloat(data.onlinePrice.toString())
          : 0,
        languages: data.languages || "",
        acceptsInsurance: Boolean(data.acceptsInsurance),
        consultationModes: Array.isArray(data.consultationModes)
          ? data.consultationModes
          : [],
      };

      console.log("API data being sent:", apiData);
      console.log("API data stringified:", JSON.stringify(apiData, null, 2));

      const updatedProfile = await doctorService.updateProfile(apiData);

      // Update local state
      setDoctorProfile({
        ...doctorProfile,
        ...apiData,
      });

      toast({
        title: "Profile Updated",
        description: "Your doctor profile has been successfully updated.",
      });

      setShowProfileDialog(false);
    } catch (error: unknown) {
      console.error("Failed to update profile:", error);

      let errorMessage = "Failed to update doctor profile. Please try again.";
      if (error && typeof error === "object" && "response" in error) {
        const errorResponse = error as {
          response?: {
            data?: {
              errors?: Record<string, unknown>;
              debug_request_data?: unknown;
            };
          };
        };
        console.error("Error response:", errorResponse.response);
        console.error(
          "Debug request data:",
          errorResponse.response?.data?.debug_request_data,
        );
        if (errorResponse.response?.data?.errors) {
          const validationErrors = errorResponse.response.data.errors;
          const errorFields = Object.keys(validationErrors);
          console.error("Validation errors:", validationErrors);
          errorMessage = `Validation errors in: ${errorFields.join(", ")}. Check console for details.`;
        }
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Image upload handler
  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    const file = event.target.files?.[0];
    if (!file) return;

    console.log("=== DOCTOR IMAGE UPLOAD DEBUG ===");
    console.log("File selected:", file.name, file.type, file.size);

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File",
        description: "Please select an image file (PNG, JPG, JPEG, GIF).",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 2MB.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploadingImage(true);

      // Create immediate preview using blob URL
      const previewUrl = URL.createObjectURL(file);
      console.log("Preview URL created:", previewUrl);

      // Update the preview immediately with the blob URL
      const updatedProfile = {
        ...doctorProfile,
        profile_image: previewUrl,
      };
      setDoctorProfile(updatedProfile);

      console.log("Image preview updated, starting upload...");

      // Upload the actual file to server
      const imageUrl = await doctorService.uploadProfileImage(file);
      console.log("Server upload complete. New URL:", imageUrl);

      // Clean up the blob URL
      URL.revokeObjectURL(previewUrl);

      // Update with the actual server URL
      const finalProfile = {
        ...doctorProfile,
        profile_image: imageUrl,
      };
      setDoctorProfile(finalProfile);

      toast({
        title: "Image Uploaded",
        description: "Profile image has been updated successfully.",
      });
    } catch (error: unknown) {
      console.error("Failed to upload image:", error);

      // Revert to previous image on error
      setDoctorProfile(doctorProfile);

      toast({
        title: "Upload Failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingImage(false);
      // Reset the file input
      if (event.target) {
        event.target.value = "";
      }
    }
  };

  const onAddService = (data: ServiceItem) => {
    if (isEditingService && currentServiceId) {
      // Update existing service
      setServices(
        services.map((service) =>
          service.id === currentServiceId
            ? { ...data, id: currentServiceId }
            : service,
        ),
      );
      toast({
        title: "Service updated",
        description: "The service has been updated successfully.",
      });
    } else {
      // Add new service
      const newService = {
        ...data,
        id: Math.random().toString(36).substring(2, 9),
      };
      setServices([...services, newService]);
      toast({
        title: "Service added",
        description: "New service has been added successfully.",
      });
    }
    serviceForm.reset();
    setIsAddingService(false);
    setIsEditingService(false);
    setCurrentServiceId(null);
  };

  const editService = (serviceId: string) => {
    const service = services.find((s) => s.id === serviceId);
    if (service) {
      serviceForm.reset(service);
      setCurrentServiceId(serviceId);
      setIsEditingService(true);
      setIsAddingService(true);
    }
  };

  const deleteService = (serviceId: string) => {
    setServices(services.filter((service) => service.id !== serviceId));
    toast({
      title: "Service deleted",
      description: "The service has been removed.",
    });
  };

  const onAddSubscriptionPlan = (data: SubscriptionPlan) => {
    const newPlan = {
      ...data,
      id: Math.random().toString(36).substring(2, 9),
      features: data.description
        .split("\n")
        .filter((item) => item.trim() !== ""),
    };
    setSubscriptionPlans([...subscriptionPlans, newPlan]);
    toast({
      title: "Subscription plan added",
      description: "New subscription plan has been added successfully.",
    });
    subscriptionForm.reset();
    setShowSubscriptionForm(false);
  };

  const toggleSubscriptionStatus = (planId: string) => {
    setSubscriptionPlans(
      subscriptionPlans.map((plan) =>
        plan.id === planId ? { ...plan, isActive: !plan.isActive } : plan,
      ),
    );
    toast({
      title: "Plan status updated",
      description: `The plan has been ${subscriptionPlans.find((p) => p.id === planId)?.isActive ? "deactivated" : "activated"}.`,
    });
  };

  const deleteSubscriptionPlan = (planId: string) => {
    setSubscriptionPlans(
      subscriptionPlans.filter((plan) => plan.id !== planId),
    );
    toast({
      title: "Subscription plan deleted",
      description: "The subscription plan has been removed.",
    });
  };

  // Helper function to get past appointments
  const getPastAppointments = () => {
    const now = new Date();
    return appointments
      .filter((appointment) => {
        const appointmentDate = new Date(appointment.appointment_datetime);
        return (
          appointmentDate < now &&
          (appointment.status === "completed" ||
            appointment.status === "cancelled")
        );
      })
      .sort(
        (a, b) =>
          new Date(b.appointment_datetime).getTime() -
          new Date(a.appointment_datetime).getTime(),
      );
  };

  // Helper function to get confirmed appointments
  const getConfirmedAppointments = () => {
    return appointments.filter(
      (appointment) => appointment.status === "confirmed",
    );
  };

  // Helper function to format appointment date and time
  const getAppointmentDateTime = (appointment: Appointment) => {
    const date = new Date(appointment.appointment_datetime);
    return {
      date: format(date, "MMM dd, yyyy"),
      time: format(date, "h:mm a"),
    };
  };

  // Handler to confirm an appointment
  const handleAppointmentConfirm = async (appointmentId: number) => {
    try {
      // Update appointment status in backend
      await appointmentService.confirmAppointment(appointmentId);

      // Update local state
      setAppointments((prevAppointments) =>
        prevAppointments.map((appointment) =>
          appointment.id === appointmentId
            ? { ...appointment, status: "confirmed" as const }
            : appointment,
        ),
      );

      toast({
        title: "Appointment Confirmed",
        description:
          "The appointment has been successfully confirmed and will now show as booked on your calendar.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error confirming appointment:", error);
      toast({
        title: "Error",
        description: "Failed to confirm appointment. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handler to reject an appointment
  const handleAppointmentReject = (appointmentId: number) => {
    setAppointments((prevAppointments) =>
      prevAppointments.map((appointment) =>
        appointment.id === appointmentId
          ? { ...appointment, status: "cancelled" as const }
          : appointment,
      ),
    );
    toast({
      title: "Appointment Rejected",
      description: "The appointment has been rejected and cancelled.",
      variant: "destructive",
    });
  };

  // Helper function to get pending appointments
  const getPendingAppointments = () => {
    return appointments
      .filter((appointment) => appointment.status === "scheduled")
      .sort(
        (a, b) =>
          new Date(a.appointment_datetime).getTime() -
          new Date(b.appointment_datetime).getTime(),
      );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              <span className="text-primary-blue">TIBA</span>
              <span className="text-secondary-green"> CLOUD</span>
            </h1>
            <p className="text-gray-600 mt-2">Doctor's Dashboard</p>
          </div>

          <div className="mt-4 md:mt-0 flex items-center space-x-3">
            <div className="flex items-center bg-white rounded-full px-3 py-1.5 border border-gray-200 shadow-sm">
              <span className="text-sm font-medium mr-2">
                {"Dr." + doctorProfile.user?.name}
              </span>
              <Avatar className="h-8 w-8 border border-secondary-green/20">
                <AvatarImage
                  src={
                    doctorProfile.profile_image ||
                    "https://randomuser.me/api/portraits/men/45.jpg"
                  }
                  alt="Doctor Profile"
                />
                <AvatarFallback>
                  {doctorProfile.user?.name
                    ? doctorProfile.user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .substring(0, 2)
                        .toUpperCase()
                    : "DR"}
                </AvatarFallback>
              </Avatar>
            </div>
            <Button variant="outline" size="icon">
              <Bell className="h-4 w-4" />
            </Button>
            <Dialog
              open={showProfileDialog}
              onOpenChange={setShowProfileDialog}
            >
              <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl p-0 max-h-[90vh] overflow-y-auto">
                <DialogHeader className="sticky top-0 z-10 bg-white px-6 py-4 border-b flex flex-row justify-between items-center">
                  <DialogTitle className="text-xl font-semibold">
                    Doctor Profile Settings
                  </DialogTitle>
                  <DialogClose asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </DialogClose>
                </DialogHeader>
                <div className="px-6 py-4">
                  <Form {...profileForm}>
                    <form
                      onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={profileForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Dr. John Doe" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={profileForm.control}
                          name="specialty"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Specialty</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Stethoscope className="absolute left-3 top-3 h-4 w-4 text-gray-500 z-10" />
                                  <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                  >
                                    <SelectTrigger className="pl-10">
                                      <SelectValue placeholder="Select your specialty" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="family-medicine">
                                        Family Medicine
                                      </SelectItem>
                                      <SelectItem value="pediatrics">
                                        Pediatrics
                                      </SelectItem>
                                      <SelectItem value="orthopedics">
                                        Orthopedics
                                      </SelectItem>
                                      <SelectItem value="cardiology">
                                        Cardiology
                                      </SelectItem>
                                      <SelectItem value="gastroenterology">
                                        Gastroenterology
                                      </SelectItem>
                                      <SelectItem value="oncology">
                                        Oncology
                                      </SelectItem>
                                      <SelectItem value="counselling">
                                        Counselling
                                      </SelectItem>
                                      <SelectItem value="nutrition-dietetics">
                                        Nutrition & Dietetics
                                      </SelectItem>
                                      <SelectItem value="internal-medicine">
                                        Internal Medicine
                                      </SelectItem>
                                      <SelectItem value="general-practitioner">
                                        General Practitioner
                                      </SelectItem>
                                      <SelectItem value="otolaryngology">
                                        Otolaryngology
                                      </SelectItem>
                                      <SelectItem value="endocrinology">
                                        Endocrinology
                                      </SelectItem>
                                      <SelectItem value="urology">
                                        Urology
                                      </SelectItem>
                                      <SelectItem value="obstetrics-gynecology">
                                        Obstetrics & Gynecology
                                      </SelectItem>
                                      <SelectItem value="speech-therapy">
                                        Speech Therapy
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={profileForm.control}
                          name="hospital"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Hospital</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g., Kenyatta National Hospital"
                                  {...field}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={profileForm.control}
                          name="location"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Location</FormLabel>
                              <FormControl>
                                <LocationAutocomplete
                                  value={field.value}
                                  onChange={field.onChange}
                                  placeholder="Enter your practice location"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={profileForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Professional Summary</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Brief description of your medical practice..."
                                className="min-h-[120px]"
                                {...field}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={profileForm.control}
                        name="experience"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Years of Experience</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="e.g., 15 years"
                                {...field}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={profileForm.control}
                          name="physicalPrice"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Physical Consultation Fee (KES)
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="e.g., 2500"
                                  {...field}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={profileForm.control}
                          name="onlinePrice"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Online Consultation Fee (KES)
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="e.g., 2000"
                                  {...field}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          name="availability"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Availability</FormLabel>
                              <div className="mt-2">
                                <AvailabilityScheduler
                                  currentSchedule={parseScheduleFromString(
                                    field.value,
                                  )}
                                  onSave={(schedule) => {
                                    const scheduleString =
                                      formatScheduleToString(schedule);
                                    field.onChange(scheduleString);
                                  }}
                                  trigger={
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      type="button"
                                    >
                                      <Clock className="h-4 w-4 mr-2" />
                                      Set Availability
                                    </Button>
                                  }
                                />
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={profileForm.control}
                        name="languages"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Languages Spoken</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., English, Swahili"
                                {...field}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="acceptsInsurance"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Accept Insurance
                              </FormLabel>
                              <p className="text-sm text-muted-foreground">
                                Enable this if you accept health insurance
                                payments.
                              </p>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="image"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Profile Photo</FormLabel>
                            <FormControl>
                              <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary-blue transition-colors">
                                <Input
                                  type="file"
                                  className="hidden"
                                  accept="image/*"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      field.onChange(file);
                                      try {
                                        const imageUrl =
                                          await doctorService.uploadProfileImage(
                                            file,
                                          );
                                        setDoctorProfile({
                                          ...doctorProfile,
                                          profile_image: imageUrl,
                                        });
                                        toast({
                                          title: "Image Uploaded",
                                          description:
                                            "Profile image has been updated successfully.",
                                        });
                                      } catch (error) {
                                        console.error(
                                          "Failed to upload image:",
                                          error,
                                        );
                                        toast({
                                          title: "Upload Failed",
                                          description:
                                            "Failed to upload image. Please try again.",
                                          variant: "destructive",
                                        });
                                      }
                                    }
                                  }}
                                  id="profile-photo-modal"
                                />
                                <label
                                  htmlFor="profile-photo-modal"
                                  className="cursor-pointer block"
                                >
                                  <div className="flex flex-col items-center gap-2">
                                    {doctorProfile.profile_image ? (
                                      <Avatar className="h-16 w-16 mb-2">
                                        <AvatarImage
                                          src={doctorProfile.profile_image}
                                          alt="Profile preview"
                                        />
                                        <AvatarFallback>DR</AvatarFallback>
                                      </Avatar>
                                    ) : (
                                      <ImageIcon className="h-8 w-8 text-gray-400" />
                                    )}
                                    <span className="text-sm text-gray-500">
                                      {doctorProfile.profile_image
                                        ? "Click to change profile image"
                                        : "Drop an image here or click to upload"}
                                    </span>
                                  </div>
                                </label>
                              </div>
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end gap-4">
                        <Button type="submit" className="gap-2">
                          <Save className="h-4 w-4" />
                          Save Profile
                        </Button>
                      </div>
                    </form>
                  </Form>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        {/* Service Statistics Section */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Pending Appointments Card */}
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white shadow-lg">
              <div className="flex items-center">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Calendar className="h-5 w-5" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-semibold text-white/80">Pending</p>
                  <p className="text-2xl font-bold">24</p>
                </div>
              </div>
            </div>

            {/* Completed Appointments Card */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white shadow-lg">
              <div className="flex items-center">
                <div className="bg-white/20 p-2 rounded-lg">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-semibold text-white/80">
                    Completed
                  </p>
                  <p className="text-2xl font-bold">15</p>
                </div>
              </div>
            </div>

            {/* Active Services Card */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white shadow-lg">
              <div className="flex items-center">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Activity className="h-5 w-5" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-semibold text-white/80">
                    Active Services
                  </p>
                  <p className="text-2xl font-bold">{services.length}</p>
                </div>
              </div>
            </div>

            {/* Total Revenue Card */}
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg p-4 text-white shadow-lg">
              <div className="flex items-center">
                <div className="bg-white/20 p-2 rounded-lg">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-semibold text-white/80">
                    Total Revenue (KES)
                  </p>
                  <p className="text-2xl font-bold">125,000</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Tabs
          defaultValue="pending"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Pending Requests
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              My Schedule
            </TabsTrigger>
            <TabsTrigger
              value="appointments"
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Appointments History
            </TabsTrigger>
          </TabsList>

          {/* Pending Requests Tab */}
          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">
                  Pending Appointment Requests
                </h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getPendingAppointments().length === 0 ? (
                    <div className="p-8 text-center">
                      <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No pending requests
                      </h3>
                      <p className="text-gray-500">
                        All appointment requests have been processed.
                      </p>
                    </div>
                  ) : (
                    getPendingAppointments().map((appointment) => {
                      const { date, time } =
                        getAppointmentDateTime(appointment);
                      return (
                        <Card
                          key={appointment.id}
                          className="border-l-4 border-l-orange-500 hover:shadow-md transition-all duration-200"
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="flex flex-col">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Clock className="h-4 w-4 text-gray-500" />
                                    <span className="font-medium text-orange-600">
                                      {date} at {time}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-gray-500" />
                                    <span className="text-gray-700">
                                      {appointment.patient?.user?.name ||
                                        "Unknown Patient"}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Stethoscope className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm text-gray-600">
                                      {appointment.reason_for_visit ||
                                        "General Consultation"}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center space-x-2">
                                <Badge
                                  variant="outline"
                                  className={
                                    appointment.type === "virtual"
                                      ? "border-purple-200 text-purple-700 bg-purple-50"
                                      : "border-green-200 text-green-700 bg-green-50"
                                  }
                                >
                                  <div className="flex items-center gap-1">
                                    {appointment.type === "virtual" ? (
                                      <Activity className="h-3 w-3" />
                                    ) : (
                                      <MapPin className="h-3 w-3" />
                                    )}
                                    <span>
                                      {appointment.type === "virtual"
                                        ? "Virtual"
                                        : "In Person"}
                                    </span>
                                  </div>
                                </Badge>

                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() =>
                                    handleAppointmentConfirm(appointment.id)
                                  }
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Confirm
                                </Button>

                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() =>
                                    handleAppointmentReject(appointment.id)
                                  }
                                >
                                  <X className="h-4 w-4 mr-2" />
                                  Reject
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule">
            {isLoadingAppointments ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="text-gray-600">
                      Loading appointments...
                    </span>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <AppointmentCalendar
                appointments={getConfirmedAppointments()}
                onAppointmentClick={handleAppointmentClick}
                onAppointmentConfirm={handleAppointmentConfirm}
                onAppointmentReject={handleAppointmentReject}
              />
            )}
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments">
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Appointment History</h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getPastAppointments().length === 0 ? (
                    <div className="p-8 text-center">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No appointment history found
                      </h3>
                      <p className="text-gray-500">
                        You don't have any past appointments yet.
                      </p>
                    </div>
                  ) : (
                    getPastAppointments().map((appointment) => {
                      const { date, time } =
                        getAppointmentDateTime(appointment);
                      return (
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
                                      {date} at {time}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-gray-500" />
                                    <span className="text-gray-700">
                                      {appointment.patient?.user?.name ||
                                        "Unknown Patient"}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Stethoscope className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm text-gray-600">
                                      {appointment.reason_for_visit ||
                                        "General Consultation"}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center space-x-2">
                                <Badge
                                  variant="outline"
                                  className={
                                    appointment.type === "virtual"
                                      ? "border-purple-200 text-purple-700 bg-purple-50"
                                      : "border-green-200 text-green-700 bg-green-50"
                                  }
                                >
                                  <div className="flex items-center gap-1">
                                    {appointment.type === "virtual" ? (
                                      <Activity className="h-3 w-3" />
                                    ) : (
                                      <MapPin className="h-3 w-3" />
                                    )}
                                    <span>
                                      {appointment.type === "virtual"
                                        ? "Virtual"
                                        : "In Person"}
                                    </span>
                                  </div>
                                </Badge>

                                <Badge
                                  variant={
                                    appointment.status === "completed"
                                      ? "default"
                                      : "secondary"
                                  }
                                  className={
                                    appointment.status === "completed"
                                      ? "bg-green-100 text-green-800 border-green-200"
                                      : "bg-red-100 text-red-800 border-red-200"
                                  }
                                >
                                  {appointment.status === "completed"
                                    ? "Completed"
                                    : "Cancelled"}
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DoctorDashboard;
