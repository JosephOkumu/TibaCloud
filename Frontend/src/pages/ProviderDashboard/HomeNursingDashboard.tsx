import React, { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import {
  Upload,
  Save,
  MapPin,
  Clock,
  Star,
  FileText,
  Edit,
  Trash2,
  Search,
  Plus,
  Home,
  ChevronDown,
  ChevronUp,
  Activity,
  Calendar,
  Users,
  Bell,
  Settings,
  TestTube,
  User,
} from "lucide-react";
import AvailabilityScheduler, {
  WeeklySchedule,
} from "@/components/AvailabilityScheduler";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LocationAutocomplete } from "@/components/LocationInput";
import nursingService, {
  NursingProvider,
  NursingServiceOffering,
  NursingServiceOfferingCreateData,
} from "@/services/nursingService";
import { format } from "date-fns";
import { AppointmentCalendar } from "@/components/calendar";
import useNursingCalendar from "@/hooks/useNursingCalendar";

// Helper function to safely get user data from localStorage
const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : {};
  } catch (error) {
    console.error("Error parsing user data from localStorage:", error);
    return {};
  }
};

interface ProviderProfileForm {
  name: string;
  phoneNumber: string;
  email: string;
  location: string;
  professionalSummary: string;
  licenseNumber: string;
  availability: string;
}

interface NursingAppointment {
  id: number;
  patient_id: number;
  provider_id: number;
  appointment_datetime: string;
  status: "confirmed" | "scheduled" | "completed" | "cancelled";
  type: "in_person" | "virtual";
  reason_for_visit: string;
  symptoms: string;
  fee: number;
  is_paid: boolean;
  location: string;
  patient: {
    id: number;
    user_id: number;
    user: {
      name: string;
      email: string;
      phone_number: string;
    };
  };
  meeting_link?: string;
}

interface NursingServiceForm {
  id?: string;
  name: string;
  description: string;
  experience: string;
  price: string;
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

// Mock data for nursing appointments
const mockAppointments: NursingAppointment[] = [
  {
    id: 1,
    patient_id: 1,
    provider_id: 1,
    appointment_datetime: new Date().toISOString(),
    status: "confirmed",
    type: "in_person",
    reason_for_visit: "Post-surgical home care",
    symptoms: "Recovery from surgery, wound care needed",
    fee: 2500,
    is_paid: true,
    location: "Karen, Nairobi",
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
    provider_id: 1,
    appointment_datetime: new Date(Date.now() + 86400000).toISOString(),
    status: "confirmed",
    type: "in_person",
    reason_for_visit: "Medication administration",
    symptoms: "Chronic diabetes management",
    fee: 2000,
    is_paid: true,
    location: "Westlands, Nairobi",
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
    provider_id: 1,
    appointment_datetime: new Date(Date.now() + 172800000).toISOString(),
    status: "scheduled",
    type: "in_person",
    reason_for_visit: "Elderly care assistance",
    symptoms: "General health monitoring and assistance",
    fee: 3000,
    is_paid: false,
    location: "Kileleshwa, Nairobi",
    patient: {
      id: 3,
      user_id: 3,
      user: {
        name: "Robert Johnson",
        email: "robert@example.com",
        phone_number: "+254798765432",
      },
    },
  },
  {
    id: 4,
    patient_id: 4,
    provider_id: 1,
    appointment_datetime: new Date(Date.now() + 259200000).toISOString(),
    status: "scheduled",
    type: "in_person",
    reason_for_visit: "Physical therapy assistance",
    symptoms: "Post-stroke rehabilitation",
    fee: 2800,
    is_paid: false,
    location: "Lavington, Nairobi",
    patient: {
      id: 4,
      user_id: 4,
      user: {
        name: "Mary Wilson",
        email: "mary@example.com",
        phone_number: "+254723456789",
      },
    },
  },
  {
    id: 5,
    patient_id: 5,
    provider_id: 1,
    appointment_datetime: new Date(Date.now() - 86400000).toISOString(),
    status: "completed",
    type: "in_person",
    reason_for_visit: "Wound care and dressing",
    symptoms: "Post-operative wound management",
    fee: 2200,
    is_paid: true,
    location: "Kilimani, Nairobi",
    patient: {
      id: 5,
      user_id: 5,
      user: {
        name: "David Brown",
        email: "david@example.com",
        phone_number: "+254734567890",
      },
    },
  },
];

// Mock data for existing services
const mockServices = [
  {
    id: "1",
    name: "General Nursing Care",
    description:
      "Basic nursing care including medication administration, wound care, and vital signs monitoring.",
    location: "Nairobi Central",
    availability: "24/7",
    experience: "5+ years",
    price: "1500",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    id: "2",
    name: "Specialized Care for Chronic Conditions",
    description:
      "Customized care for patients with diabetes, hypertension, and other chronic conditions.",
    location: "Westlands",
    availability: "Weekdays, 8AM-6PM",
    experience: "8+ years",
    price: "2500",
    image: "https://randomuser.me/api/portraits/men/22.jpg",
  },
  {
    id: "3",
    name: "Post-Surgical Care",
    description:
      "Specialized nursing care for patients recovering from surgery, including wound care and medication management.",
    location: "Karen",
    availability: "On demand",
    experience: "10+ years",
    price: "2800",
    image: "https://randomuser.me/api/portraits/women/55.jpg",
  },
];

const HomeNursingDashboard = () => {
  const [services, setServices] = useState<NursingServiceOffering[]>([]);
  const [appointments, setAppointments] = useState(mockAppointments);
  const [isEditing, setIsEditing] = useState(false);
  const [currentService, setCurrentService] =
    useState<NursingServiceForm | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("services");
  const [selectedAppointment, setSelectedAppointment] =
    useState<NursingAppointment | null>(null);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [nursingProfile, setNursingProfile] = useState<NursingProvider | null>(
    null,
  );
  const [profileImage, setProfileImage] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calendar functionality
  const {
    appointments: calendarAppointments,
    isLoading: isLoadingCalendar,
    acceptRequest,
    rejectRequest,
    completeService,
  } = useNursingCalendar();

  const profileForm = useForm<ProviderProfileForm>({
    defaultValues: {
      name: getCurrentUser().name || "",
      phoneNumber: getCurrentUser().phone_number || "",
      email: getCurrentUser().email || "",
      location: "Nairobi, Kenya",
      professionalSummary: "",
      licenseNumber: "",
      availability: "",
    },
  });

  const form = useForm<NursingServiceForm>({
    defaultValues: {
      name: "",
      description: "",
      experience: "",
      price: "",
    },
  });

  const resetForm = () => {
    form.reset({
      name: "",
      description: "",
      experience: "",
      price: "",
    });
    setIsEditing(false);
    setCurrentService(null);
    setShowAddForm(false);
  };

  const handleAddNewClick = () => {
    setIsEditing(false);
    setCurrentService(null);
    form.reset({
      name: "",
      description: "",
      experience: "",
      price: "",
    });
    setShowAddForm(!showAddForm);
  };

  const handleEditService = (service: NursingServiceOffering) => {
    setIsEditing(true);
    setCurrentService({
      id: service.id.toString(),
      name: service.name,
      description: service.description,
      experience: service.experience,
      price: service.price.toString(),
    });
    form.reset({
      id: service.id.toString(),
      name: service.name,
      description: service.description,
      experience: service.experience,
      price: service.price.toString(),
    });
    setShowAddForm(true);
  };

  const handleDeleteClick = (serviceId: string) => {
    setServiceToDelete(serviceId);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (serviceToDelete) {
      try {
        await nursingService.deleteServiceOffering(parseInt(serviceToDelete));
        setServices(
          services.filter(
            (service) => service.id.toString() !== serviceToDelete,
          ),
        );
        setShowDeleteDialog(false);
        setServiceToDelete(null);
        toast({
          title: "Service Deleted",
          description: "The service has been successfully deleted.",
        });
      } catch (error) {
        console.error("Failed to delete service:", error);
        toast({
          title: "Error",
          description: "Failed to delete service. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const filteredServices = services.filter(
    (service) =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.location.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Load services from API
  const loadServices = useCallback(async () => {
    try {
      setIsLoadingServices(true);
      const serviceOfferings = await nursingService.getServiceOfferings();
      setServices(serviceOfferings);
    } catch (error) {
      console.error("Failed to load services:", error);
      toast({
        title: "Error",
        description: "Failed to load services",
        variant: "destructive",
      });
    } finally {
      setIsLoadingServices(false);
    }
  }, []);

  const onSubmit = async (data: NursingServiceForm) => {
    try {
      const serviceData: NursingServiceOfferingCreateData = {
        name: data.name,
        description: data.description,
        location: "Nairobi, Kenya", // Default location
        availability: "Available", // Default availability
        experience: data.experience,
        price: parseFloat(data.price),
      };

      if (isEditing && currentService) {
        // Update existing service
        const updatedService = await nursingService.updateServiceOffering(
          parseInt(currentService.id!),
          serviceData,
        );

        setServices(
          services.map((service) =>
            service.id === parseInt(currentService.id!)
              ? updatedService
              : service,
          ),
        );

        toast({
          title: "Service Updated",
          description: "Your service has been successfully updated.",
        });
      } else {
        // Create new service
        const newService =
          await nursingService.createServiceOffering(serviceData);
        setServices([newService, ...services]);

        toast({
          title: "Service Added",
          description: "Your new service has been successfully added.",
        });
      }

      resetForm();
    } catch (error) {
      console.error("Failed to save service:", error);
      toast({
        title: "Error",
        description: "Failed to save service. Please try again.",
        variant: "destructive",
      });
    }
  };

  const loadProfile = useCallback(async () => {
    try {
      const profile = await nursingService.getProfile();
      setNursingProfile(profile);
      setProfileImage(profile.logo || "");

      // Update form with profile data
      profileForm.reset({
        name: profile.user?.name || profile.provider_name || "",
        phoneNumber: profile.user?.phone_number || "",
        email: profile.user?.email || "",
        location: "Nairobi, Kenya",
        professionalSummary: profile.description || "",
        licenseNumber: profile.license_number || "",
        availability: "",
      });
    } catch (error: unknown) {
      console.log("Profile loading error:", error);

      // Type guard for axios error
      interface AxiosErrorType {
        response?: {
          status: number;
        };
      }

      const isAxiosError = (err: unknown): err is AxiosErrorType => {
        return err !== null && typeof err === "object" && "response" in err;
      };

      // If no profile exists (404 error), automatically create one for new users
      if (isAxiosError(error) && error.response?.status === 404) {
        console.log(
          "No nursing provider profile found - creating default profile for new user",
        );

        try {
          // Get current user info safely
          const currentUser = getCurrentUser();
          const userName = currentUser.name || "Nursing Provider";

          // Create a default profile for the new user
          const defaultProfileData = {
            name: userName,
            provider_name: userName,
            description: "Professional nursing care services",
            qualifications: "Professional nursing qualifications",
            services_offered: "Home nursing services",
            base_rate_per_hour: 0,
            license_number: currentUser.license_number || `NP_${Date.now()}`,
          };

          console.log("Creating profile with data:", defaultProfileData);
          const newProfile =
            await nursingService.updateProfile(defaultProfileData);
          setNursingProfile(newProfile);
          setProfileImage(newProfile.logo || "");

          // Update form with new profile data
          profileForm.reset({
            name: newProfile.user?.name || userName,
            phoneNumber:
              newProfile.user?.phone_number || currentUser.phone_number || "",
            email: newProfile.user?.email || currentUser.email || "",
            location: "Nairobi, Kenya",
            professionalSummary: newProfile.description || "",
            licenseNumber: newProfile.license_number || "",
            availability: "",
          });

          console.log("Default nursing provider profile created successfully");

          // Show welcome notification
          toast({
            title: "Welcome to Tiba Cloud!",
            description:
              "Your nursing provider profile has been created. You can update it in settings.",
          });

          // Also try to load services now that profile exists
          try {
            await loadServices();
          } catch (servicesError) {
            console.log(
              "Services will be loaded when user creates their first service",
            );
          }
        } catch (createError) {
          console.error("Failed to create default profile:", createError);
          console.error(
            "Profile creation error details:",
            createError.response?.data,
          );

          // Set fallback profile data so user can still use the dashboard
          const currentUser = getCurrentUser();
          const userName = currentUser.name || "Nursing Provider";

          setNursingProfile(null);
          setProfileImage("");

          // Pre-populate form with user registration data
          profileForm.reset({
            name: userName,
            phoneNumber: currentUser.phone_number || "",
            email: currentUser.email || "",
            location: "Nairobi, Kenya",
            professionalSummary: "Professional nursing care services",
            licenseNumber: currentUser.license_number || "",
          });

          toast({
            title: "Profile Setup Required",
            description:
              "Please complete your provider profile by clicking the settings icon.",
            variant: "default",
          });
        }
      } else {
        // For other errors, show the error message
        console.error("Failed to load profile:", error);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        });
      }
    }
  }, [profileForm, loadServices]);

  // Load profile and services data on component mount
  useEffect(() => {
    loadProfile();
    loadServices();
  }, [loadProfile, loadServices]);

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    try {
      setIsUploading(true);
      const imageUrl = await nursingService.uploadProfileImage(file);
      setProfileImage(imageUrl);

      // Update the nursing profile state to reflect the new image
      if (nursingProfile) {
        setNursingProfile({
          ...nursingProfile,
          logo: imageUrl,
        });
      }

      toast({
        title: "Image Uploaded",
        description: "Profile image updated successfully",
      });

      // Reload profile data to ensure consistency
      await loadProfile();
    } catch (error) {
      console.error("Failed to upload image:", error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload profile image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleProfileSubmit = async (data: ProviderProfileForm) => {
    try {
      console.log("=== NURSING PROFILE SUBMIT DEBUG ===");
      console.log("Form data received:", data);

      const apiData = {
        name: data.name || "",
        phone_number: data.phoneNumber || "",
        email: data.email || "",
        provider_name: data.name || "",
        description: data.professionalSummary || "",
        qualifications: "Professional nursing qualifications",
        services_offered: "Home nursing services",
        base_rate_per_hour: nursingProfile?.base_rate_per_hour || 0,
        license_number: data.licenseNumber || "",
        availability: data.availability || "",
      };

      console.log("API data being sent:", apiData);

      let updatedProfile;

      if (!nursingProfile) {
        // Create new profile if none exists
        console.log("Creating new nursing provider profile...");
        try {
          // Try to create via the standard API endpoint
          const createData = {
            ...apiData,
            license_number: `NP_${Date.now()}`, // Generate temporary license number
          };
          updatedProfile =
            await nursingService.updateNursingProviderProfile(createData);
        } catch (createError) {
          console.log("Standard create failed, trying update endpoint...");
          // If that fails, try the update endpoint which should create if not exists
          updatedProfile = await nursingService.updateProfile(apiData);
        }
      } else {
        // Update existing profile
        console.log("Updating existing nursing provider profile...");
        updatedProfile = await nursingService.updateProfile(apiData);
      }

      setNursingProfile(updatedProfile);

      toast({
        title: nursingProfile ? "Profile Updated" : "Profile Created",
        description: nursingProfile
          ? "Your nursing provider profile has been successfully updated."
          : "Your nursing provider profile has been successfully created.",
      });

      setShowProfileDialog(false);

      // Reload profile data to ensure consistency
      await loadProfile();
    } catch (error: unknown) {
      console.error("Failed to update/create profile:", error);
      toast({
        title: nursingProfile ? "Update Failed" : "Creation Failed",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAppointmentClick = (appointment: NursingAppointment) => {
    setSelectedAppointment(appointment);
    setShowAppointmentModal(true);
  };

  const handleMarkComplete = () => {
    if (selectedAppointment) {
      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === selectedAppointment.id
            ? { ...apt, status: "completed" as const }
            : apt,
        ),
      );
      toast({
        title: "Appointment Completed",
        description: "The appointment has been marked as completed.",
      });
      setShowAppointmentModal(false);
    }
  };

  const handleCancelAppointment = () => {
    if (selectedAppointment) {
      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === selectedAppointment.id
            ? { ...apt, status: "cancelled" as const }
            : apt,
        ),
      );
      toast({
        title: "Appointment Cancelled",
        description: "The appointment has been cancelled.",
      });
      setShowAppointmentModal(false);
    }
  };

  const handleAcceptRequest = async (requestId: number) => {
    try {
      // Accept the nursing service request
      await nursingService.acceptNursingService(requestId);

      // Update the local state to reflect the accepted request
      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === requestId ? { ...apt, status: "confirmed" as const } : apt,
        ),
      );

      toast({
        title: "Request Accepted",
        description:
          "The nursing service request has been accepted successfully.",
      });
    } catch (error) {
      console.error("Failed to accept request:", error);
      toast({
        title: "Error",
        description: "Failed to accept the request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRejectRequest = async (
    requestId: number,
    rejectionReason?: string,
  ) => {
    try {
      // Reject the nursing service request
      await nursingService.rejectNursingService(requestId, rejectionReason);

      // Update the local state to reflect the rejected request
      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === requestId ? { ...apt, status: "cancelled" as const } : apt,
        ),
      );

      toast({
        title: "Request Rejected",
        description: "The nursing service request has been rejected.",
      });
    } catch (error) {
      console.error("Failed to reject request:", error);
      toast({
        title: "Error",
        description: "Failed to reject the request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getAppointmentDate = (appointment: NursingAppointment) => {
    return new Date(appointment.appointment_datetime);
  };

  const getAppointmentTime = (appointment: NursingAppointment) => {
    return new Date(appointment.appointment_datetime).toLocaleTimeString(
      "en-US",
      {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      },
    );
  };

  const getFilteredAppointments = () => {
    return appointments.sort(
      (a, b) =>
        new Date(a.appointment_datetime).getTime() -
        new Date(b.appointment_datetime).getTime(),
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">
              <span className="text-primary-blue">TIBA</span>
              <span className="text-secondary-green"> CLOUD</span>
            </h1>
            <p className="text-gray-600 mt-2">
              Home Nursing Service Provider Dashboard
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-3">
            <div className="flex items-center bg-white rounded-full px-3 py-1.5 border border-gray-200 shadow-sm">
              <span className="text-sm font-medium mr-2">
                {nursingProfile?.provider_name ||
                  nursingProfile?.user?.name ||
                  getCurrentUser().name ||
                  "Nursing Provider"}
              </span>
              <Avatar className="h-8 w-8 border border-secondary-green/20">
                <AvatarImage
                  src={profileImage || nursingProfile?.logo || ""}
                  alt="Provider"
                />
                <AvatarFallback>
                  {(
                    nursingProfile?.provider_name ||
                    nursingProfile?.user?.name ||
                    getCurrentUser().name ||
                    "Nursing Provider"
                  )
                    .charAt(0)
                    .toUpperCase()}
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
                    Provider Profile Settings
                  </DialogTitle>
                </DialogHeader>
                <div className="px-6 py-4">
                  <Form {...profileForm}>
                    <form
                      onSubmit={profileForm.handleSubmit(handleProfileSubmit)}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={profileForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Provider Name</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter provider name"
                                  {...field}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={profileForm.control}
                          name="phoneNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter phone number"
                                  {...field}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={profileForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input
                                  type="email"
                                  placeholder="Enter email address"
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
                                  placeholder="Enter your service location"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={profileForm.control}
                          name="licenseNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>License Number</FormLabel>
                              <FormControl>
                                <Input
                                  type="text"
                                  placeholder="License number"
                                  readOnly
                                  className="bg-gray-50"
                                  {...field}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={profileForm.control}
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
                        name="professionalSummary"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Professional Summary</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Describe your experience, qualifications, and specializations"
                                className="min-h-[120px]"
                                {...field}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      {/* Profile Image Upload Section */}
                      <div className="space-y-4 p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">
                              Profile Image
                            </h3>
                            <p className="text-sm text-gray-500">
                              Upload a professional profile image
                            </p>
                          </div>
                          {profileImage && (
                            <div className="flex-shrink-0">
                              <img
                                src={profileImage}
                                alt="Profile"
                                className="h-16 w-16 rounded-full object-cover border-2 border-white shadow-lg"
                              />
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="flex items-center space-x-2"
                          >
                            {isUploading ? (
                              <>
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                <span>Uploading...</span>
                              </>
                            ) : (
                              <>
                                <Upload className="h-4 w-4" />
                                <span>Choose Image</span>
                              </>
                            )}
                          </Button>

                          <div className="text-sm text-gray-500">
                            <p>JPEG, PNG, JPG, GIF up to 2MB</p>
                          </div>
                        </div>

                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/jpg,image/gif"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                      </div>
                      <DialogFooter className="sticky bottom-0 bg-white pt-4 border-t">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowProfileDialog(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit">Save Profile</Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-4 space-y-6">
            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Services</p>
                    <h3 className="text-2xl font-bold">{services.length}</h3>
                  </div>
                  <div className="h-10 w-10 bg-blue-200 rounded-full flex items-center justify-center">
                    <TestTube className="h-5 w-5 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Appointments</p>
                    <h3 className="text-2xl font-bold">12</h3>
                  </div>
                  <div className="h-10 w-10 bg-green-200 rounded-full flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-amber-50 to-amber-100">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pending Requests</p>
                    <h3 className="text-2xl font-bold">3</h3>
                  </div>
                  <div className="h-10 w-10 bg-amber-200 rounded-full flex items-center justify-center">
                    <Clock className="h-5 w-5 text-amber-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Monthly Revenue</p>
                    <h3 className="text-2xl font-bold">KES 45,000</h3>
                  </div>
                  <div className="h-10 w-10 bg-purple-200 rounded-full flex items-center justify-center">
                    <Activity className="h-5 w-5 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs Navigation */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6 w-full justify-start overflow-x-auto space-x-2">
                <TabsTrigger value="services" className="gap-2">
                  <Home className="h-4 w-4" />
                  <span>My Services</span>
                </TabsTrigger>
                <TabsTrigger value="calendar" className="gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>My Schedule</span>
                </TabsTrigger>
                <TabsTrigger value="requests" className="gap-2">
                  <Bell className="h-4 w-4" />
                  <span>Pending Requests</span>
                </TabsTrigger>

                <TabsTrigger value="history" className="gap-2">
                  <Activity className="h-4 w-4" />
                  <span>Appointment History</span>
                </TabsTrigger>
              </TabsList>

              {/* My Services Tab */}
              <TabsContent value="services">
                <Card className="border-0 shadow-md overflow-hidden">
                  <div className="bg-gradient-to-r from-primary-blue to-secondary-green p-4 text-white">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-bold">My Services</h2>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="bg-white text-primary-blue hover:bg-green-100 hover:text-green-700 flex items-center gap-1"
                        onClick={handleAddNewClick}
                      >
                        <Plus className="h-4 w-4" />
                        Add Service
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-5">
                    {showAddForm && (
                      <div className="mb-6 bg-gray-50 p-4 rounded-md border border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                          {isEditing ? "Edit Service" : "Add New Service"}
                        </h3>
                        <Form {...form}>
                          <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-4"
                          >
                            <FormField
                              control={form.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Service Name</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="e.g., Home Care Package"
                                      {...field}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="description"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Service Description</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      placeholder="Describe your nursing service..."
                                      className="min-h-[100px]"
                                      {...field}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Price (KES)</FormLabel>
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
                                control={form.control}
                                name="experience"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Years of Experience</FormLabel>
                                    <FormControl>
                                      <div className="relative">
                                        <Star className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                                        <Input
                                          className="pl-10"
                                          placeholder="e.g., 5 years"
                                          {...field}
                                        />
                                      </div>
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </div>

                            <div className="flex justify-end gap-4 pt-2">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={resetForm}
                              >
                                Cancel
                              </Button>
                              <Button type="submit" className="gap-2">
                                <Save className="h-4 w-4" />
                                {isEditing ? "Update Service" : "Save Service"}
                              </Button>
                            </div>
                          </form>
                        </Form>
                      </div>
                    )}

                    <div className="flex justify-between items-center mb-4">
                      <p className="text-gray-600">
                        Manage your nursing services
                      </p>
                      <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          type="search"
                          placeholder="Search services..."
                          className="pl-10 w-full border-gray-200 focus-visible:ring-secondary-green"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>

                    {filteredServices.length > 0 ? (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Service</TableHead>
                              <TableHead>Price (KES)</TableHead>
                              <TableHead>Availability</TableHead>
                              <TableHead>Location</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {isLoadingServices ? (
                              <TableRow>
                                <TableCell
                                  colSpan={5}
                                  className="text-center py-8"
                                >
                                  <div className="flex items-center justify-center space-x-2">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                    <span>Loading services...</span>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ) : (
                              filteredServices.map((service) => (
                                <TableRow
                                  key={service.id}
                                  className="hover:bg-gray-50"
                                >
                                  <TableCell>
                                    <div className="flex items-center space-x-3">
                                      <Avatar className="h-10 w-10 border border-gray-200">
                                        <AvatarImage
                                          src={
                                            profileImage ||
                                            nursingProfile?.logo ||
                                            ""
                                          }
                                          alt={
                                            nursingProfile?.provider_name ||
                                            "Provider"
                                          }
                                        />
                                        <AvatarFallback>
                                          {(
                                            nursingProfile?.provider_name ||
                                            nursingProfile?.user?.name ||
                                            getCurrentUser().name ||
                                            "N"
                                          )
                                            .charAt(0)
                                            .toUpperCase()}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <div className="font-medium text-gray-900 max-w-[200px] truncate">
                                          {service.name}
                                        </div>
                                        <div className="text-xs text-gray-500 max-w-[200px] truncate">
                                          {service.description}
                                        </div>
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      variant="outline"
                                      className="bg-green-50 text-green-700 border-green-200"
                                    >
                                      KES {service.price}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>{service.availability}</TableCell>
                                  <TableCell>{service.location}</TableCell>
                                  <TableCell>
                                    <div className="flex items-center space-x-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                                        onClick={() =>
                                          handleEditService(service)
                                        }
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                        onClick={() =>
                                          handleDeleteClick(
                                            service.id.toString(),
                                          )
                                        }
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <p>No services match your search criteria.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Pending Requests Tab */}
              <TabsContent value="requests">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold">
                        Pending Appointment Requests
                      </h2>
                      <Badge
                        variant="secondary"
                        className="bg-orange-100 text-orange-800"
                      >
                        3 Pending
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4 bg-orange-50 border-orange-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src="https://randomuser.me/api/portraits/women/25.jpg" />
                              <AvatarFallback>MK</AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-medium">Mary Kiprotich</h3>
                              <p className="text-sm text-gray-600">
                                Post-surgical care needed
                              </p>
                              <p className="text-xs text-gray-500">
                                Requested: Dec 15, 2024 at 2:30 PM
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 border-green-600"
                              onClick={() => handleAcceptRequest(1)}
                            >
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-600"
                              onClick={() => handleRejectRequest(1)}
                            >
                              Decline
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="border rounded-lg p-4 bg-orange-50 border-orange-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src="https://randomuser.me/api/portraits/men/32.jpg" />
                              <AvatarFallback>JM</AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-medium">John Mwangi</h3>
                              <p className="text-sm text-gray-600">
                                Chronic condition monitoring
                              </p>
                              <p className="text-xs text-gray-500">
                                Requested: Dec 14, 2024 at 10:15 AM
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 border-green-600"
                              onClick={() => handleAcceptRequest(2)}
                            >
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-600"
                              onClick={() => handleRejectRequest(2)}
                            >
                              Decline
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="border rounded-lg p-4 bg-orange-50 border-orange-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src="https://randomuser.me/api/portraits/women/18.jpg" />
                              <AvatarFallback>AN</AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-medium">Alice Njeri</h3>
                              <p className="text-sm text-gray-600">
                                General nursing care
                              </p>
                              <p className="text-xs text-gray-500">
                                Requested: Dec 13, 2024 at 4:45 PM
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 border-green-600"
                              onClick={() => handleAcceptRequest(3)}
                            >
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-600"
                              onClick={() => handleRejectRequest(3)}
                            >
                              Decline
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Calendar Tab */}
              <TabsContent value="calendar">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-semibold">My Schedule</h2>
                        <p className="text-gray-600">
                          View and manage your nursing appointments
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isLoadingCalendar ? (
                      <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-blue mx-auto mb-4"></div>
                          <p className="text-gray-600">
                            Loading your schedule...
                          </p>
                        </div>
                      </div>
                    ) : (
                      <AppointmentCalendar
                        appointments={calendarAppointments}
                        onAppointmentClick={(appointment) => {
                          console.log("Appointment clicked:", appointment);
                          // You can add custom handling here
                        }}
                        onAppointmentConfirm={async (appointmentId) => {
                          try {
                            await acceptRequest(appointmentId);
                          } catch (error) {
                            console.error(
                              "Failed to confirm appointment:",
                              error,
                            );
                          }
                        }}
                        onAppointmentReject={async (appointmentId) => {
                          try {
                            await rejectRequest(appointmentId);
                          } catch (error) {
                            console.error(
                              "Failed to reject appointment:",
                              error,
                            );
                          }
                        }}
                      />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Appointment History Tab */}
              <TabsContent value="history">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold">
                        Appointment History
                      </h2>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="search"
                          placeholder="Search appointments..."
                          className="w-64"
                        />
                        <Button variant="outline" size="sm">
                          <Search className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4 bg-green-50 border-green-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src="https://randomuser.me/api/portraits/women/44.jpg" />
                              <AvatarFallback>SK</AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-medium">Sarah Kimani</h3>
                              <p className="text-sm text-gray-600">
                                Wound care and dressing
                              </p>
                              <p className="text-xs text-gray-500">
                                Completed: Dec 12, 2024 • Duration: 2 hours
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className="bg-green-100 text-green-800 mb-2">
                              Completed
                            </Badge>
                            <p className="text-sm font-medium">KES 2,500</p>
                          </div>
                        </div>
                      </div>

                      <div className="border rounded-lg p-4 bg-green-50 border-green-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src="https://randomuser.me/api/portraits/men/55.jpg" />
                              <AvatarFallback>DM</AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-medium">David Mutua</h3>
                              <p className="text-sm text-gray-600">
                                Medication administration
                              </p>
                              <p className="text-xs text-gray-500">
                                Completed: Dec 10, 2024 • Duration: 1.5 hours
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className="bg-green-100 text-green-800 mb-2">
                              Completed
                            </Badge>
                            <p className="text-sm font-medium">KES 1,800</p>
                          </div>
                        </div>
                      </div>

                      <div className="border rounded-lg p-4 bg-red-50 border-red-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src="https://randomuser.me/api/portraits/women/33.jpg" />
                              <AvatarFallback>GW</AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-medium">Grace Wanjiku</h3>
                              <p className="text-sm text-gray-600">
                                Physical therapy assistance
                              </p>
                              <p className="text-xs text-gray-500">
                                Cancelled: Dec 8, 2024 • Reason: Patient
                                unavailable
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant="destructive" className="mb-2">
                              Cancelled
                            </Badge>
                            <p className="text-sm text-gray-500">KES 2,000</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-6 pt-4 border-t">
                        <p className="text-sm text-gray-600">
                          Showing 1-3 of 15 appointments
                        </p>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" disabled>
                            Previous
                          </Button>
                          <Button variant="outline" size="sm">
                            Next
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this service? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2 justify-end mt-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Appointment Details Modal */}
      <Dialog
        open={showAppointmentModal}
        onOpenChange={setShowAppointmentModal}
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
                    {new Date(
                      selectedAppointment.appointment_datetime,
                    ).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
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
                  Patient Name
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
                  Email
                </label>
                <p className="text-sm text-gray-900">
                  {selectedAppointment.patient?.user?.email || "Not provided"}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">
                  Location
                </label>
                <p className="text-sm text-gray-900">
                  {selectedAppointment.location}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Fee</label>
                <p className="text-sm text-gray-900">
                  KES {selectedAppointment.fee.toLocaleString()}
                </p>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button
                  size="sm"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  onClick={handleMarkComplete}
                >
                  Mark as Complete
                </Button>
                <Button
                  size="sm"
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  onClick={handleCancelAppointment}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HomeNursingDashboard;
