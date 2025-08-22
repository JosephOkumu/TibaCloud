import React, { useState, useEffect, useCallback } from "react";
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
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useForm } from "react-hook-form";
import {
  Save,
  Search,
  TestTube,
  Microscope,
  Activity,
  ChevronDown,
  Plus,
  Calendar,
  Bell,
  Settings,
  User,
  X,
  Clock,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { LocationAutocomplete } from "@/components/LocationInput";
import AvailabilityScheduler, {
  WeeklySchedule,
} from "@/components/AvailabilityScheduler";
import labService, {
  LabProvider,
  LabProfileUpdateData,
  LabTestService,
  LabTestServiceCreateData,
} from "@/services/labService";

// Interfaces
interface LabTest {
  id: number;
  name: string;
  description: string;
  price: number;
  turnaroundTime: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
}

interface LaboratoryProfile {
  lab_name: string;
  license_number: string;
  website: string;
  address: string;
  operating_hours: string;
  description: string;
  contact_person_name: string;
  contact_person_role: string;
  profile_image: string;
  certifications: string[];
}

interface Appointment {
  id: number;
  patientName: string;
  patientImage: string;
  testName: string;
  date: string;
  time: string;
  status: "pending" | "completed" | "In progress";
  paymentStatus: "paid" | "unpaid" | "partial";
  amount: number;
  location: string;
  assignedStaff: string;
  notes: string;
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

const LabDashboard = () => {
  // State variables
  const [activeTab, setActiveTab] = useState<string>("tests");
  const [selectedTest, setSelectedTest] = useState<LabTestService | null>(null);
  const [showTestForm, setShowTestForm] = useState<boolean>(false);
  const [showProfileDialog, setShowProfileDialog] = useState<boolean>(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [showAppointmentDetails, setShowAppointmentDetails] =
    useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [showRescheduleDialog, setShowRescheduleDialog] =
    useState<boolean>(false);
  const { toast } = useToast();

  // Laboratory profile state
  const [laboratoryProfile, setLaboratoryProfile] = useState<LaboratoryProfile>(
    {
      lab_name: "",
      license_number: "",
      website: "",
      address: "",
      operating_hours: "",
      description: "",
      contact_person_name: "",
      contact_person_role: "",
      profile_image: "",
      certifications: [],
    },
  );

  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [newCertification, setNewCertification] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [testServices, setTestServices] = useState<LabTestService[]>([]);
  const [isTestServicesLoading, setIsTestServicesLoading] = useState(true);

  // Profile form setup
  const profileForm = useForm<LaboratoryProfile>({
    defaultValues: laboratoryProfile,
  });

  // Test form
  const testForm = useForm<LabTestServiceCreateData>({
    defaultValues: {
      test_name: "",
      description: "",
      price: 0,
      turnaround_time: "",
    },
  });

  // Load test services
  const loadTestServices = useCallback(async () => {
    try {
      setIsTestServicesLoading(true);
      const services = await labService.getTestServices();
      setTestServices(services);
    } catch (error) {
      console.error("Failed to load test services:", error);
      toast({
        title: "Error",
        description: "Failed to load test services.",
        variant: "destructive",
      });
    } finally {
      setIsTestServicesLoading(false);
    }
  }, [toast]);

  // Load profile data on component mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsProfileLoading(true);

        // Debug authentication
        console.log("=== DEBUG AUTHENTICATION ===");
        console.log("Token in localStorage:", localStorage.getItem("token"));
        console.log("User in localStorage:", localStorage.getItem("user"));
        console.log("Is authenticated:", !!localStorage.getItem("token"));

        const profile = await labService.getProfile();

        // Map API response to form format
        const mappedProfile: LaboratoryProfile = {
          lab_name: profile.lab_name || "",
          license_number: profile.license_number || "",
          website: profile.website || "",
          address: profile.address || "",
          operating_hours:
            typeof profile.operating_hours === "string"
              ? profile.operating_hours
              : JSON.stringify(profile.operating_hours) || "",
          description: profile.description || "",
          contact_person_name: profile.contact_person_name || "",
          contact_person_role: profile.contact_person_role || "",
          profile_image: profile.profile_image || "",
          certifications: Array.isArray(profile.certifications)
            ? profile.certifications
            : profile.certifications
              ? JSON.parse(profile.certifications)
              : [],
        };

        setLaboratoryProfile(mappedProfile);
        profileForm.reset(mappedProfile);
      } catch (error: unknown) {
        console.error("Failed to update profile:", error);
        const errorMessage =
          "Failed to load laboratory profile. Using default values.";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsProfileLoading(false);
      }
    };

    loadProfile();
    loadTestServices();
  }, [loadTestServices, profileForm, toast]);

  const appointments: Appointment[] = [
    {
      id: 1,
      patientName: "John Doe",
      patientImage: "https://randomuser.me/api/portraits/men/32.jpg",
      testName: "Complete Blood Count",
      date: "2023-06-15",
      time: "10:00 AM",
      status: "pending",
      paymentStatus: "paid",
      amount: 1200,
      location: "Lab Room 3, East Wing",
      assignedStaff: "Dr. Elizabeth Johnson",
      notes:
        "Patient should fast for 8 hours before the test. Bring previous lab results if available.",
    },
    {
      id: 2,
      patientName: "Jane Smith",
      patientImage: "https://randomuser.me/api/portraits/women/44.jpg",
      testName: "Blood Glucose Test",
      date: "2023-06-15",
      time: "11:30 AM",
      status: "completed",
      paymentStatus: "paid",
      amount: 800,
      location: "Lab Room 1, Main Floor",
      assignedStaff: "Dr. Robert Chen",
      notes:
        "The patient is diabetic. Special care should be taken during sample collection.",
    },
    {
      id: 3,
      patientName: "Michael Johnson",
      patientImage: "https://randomuser.me/api/portraits/men/45.jpg",
      testName: "Lipid Profile",
      date: "2023-06-16",
      time: "09:15 AM",
      status: "pending",
      paymentStatus: "unpaid",
      amount: 1500,
      location: "Lab Room 5, Second Floor",
      assignedStaff: "Dr. Lisa Wong",
      notes:
        "Patient must fast for 12 hours prior to the test. Water is allowed.",
    },
    {
      id: 4,
      patientName: "Samantha Williams",
      patientImage: "https://randomuser.me/api/portraits/women/67.jpg",
      testName: "COVID-19 PCR Test",
      date: "2023-06-16",
      time: "02:00 PM",
      status: "In progress",
      paymentStatus: "partial",
      amount: 3500,
      location: "Isolation Room 2, West Wing",
      assignedStaff: "Dr. Michael Omondi",
      notes:
        "Patient has reported COVID-19 exposure. Follow strict isolation protocols during testing.",
    },
  ];

  // Event handlers
  const onTestSubmit = async (data: LabTestServiceCreateData) => {
    try {
      if (selectedTest) {
        // Update existing test service
        const updatedService = await labService.updateTestService(
          selectedTest.id!,
          data,
        );
        setTestServices(
          testServices.map((service) =>
            service.id === selectedTest.id ? updatedService : service,
          ),
        );
        toast({
          title: "Test Updated",
          description: `${data.test_name} has been updated successfully.`,
        });
      } else {
        // Create new test service
        const newService = await labService.createTestService(data);
        setTestServices([...testServices, newService]);
        toast({
          title: "Test Added",
          description: `${data.test_name} has been added successfully.`,
        });
      }
      setShowTestForm(false);
      setSelectedTest(null);
      testForm.reset();
    } catch (error: unknown) {
      console.error("Failed to save test service:", error);
      toast({
        title: "Error",
        description: "Failed to save test service.",
        variant: "destructive",
      });
    }
  };

  const handleEditTest = (test: LabTestService) => {
    setSelectedTest(test);
    testForm.reset({
      test_name: test.test_name,
      description: test.description,
      price: test.price,
      turnaround_time: test.turnaround_time,
    });
    setShowTestForm(true);
  };

  const handleAddNewTest = () => {
    setSelectedTest(null);
    testForm.reset({
      test_name: "",
      description: "",
      price: 0,
      turnaround_time: "",
    });
    setShowTestForm(!showTestForm);
  };

  const handleToggleTestStatus = async (id: number) => {
    try {
      const updatedService = await labService.toggleTestServiceStatus(id);
      setTestServices(
        testServices.map((service) =>
          service.id === id ? updatedService : service,
        ),
      );
      toast({
        title: updatedService.is_active ? "Test Activated" : "Test Deactivated",
        description: `${updatedService.test_name} has been ${updatedService.is_active ? "activated" : "deactivated"}.`,
      });
    } catch (error: unknown) {
      console.error("Failed to toggle test status:", error);
      toast({
        title: "Error",
        description: "Failed to update test status.",
        variant: "destructive",
      });
    }
  };

  // Profile form handler
  const onProfileSubmit = async (data: LaboratoryProfile) => {
    try {
      console.log("=== PROFILE SUBMIT DEBUG ===");
      console.log("Form data received:", data);

      // Map form data to API format with proper data types
      const apiData: LabProfileUpdateData = {
        lab_name: data.lab_name || "",
        license_number: data.license_number || "",
        website: data.website
          ? data.website.startsWith("http://") ||
            data.website.startsWith("https://")
            ? data.website
            : `https://${data.website}`
          : "",
        address: data.address || "",
        operating_hours: data.operating_hours || "",
        description: data.description || "",
        contact_person_name: data.contact_person_name || "",
        contact_person_role: data.contact_person_role || "",
        profile_image: data.profile_image || "",
        certifications: Array.isArray(data.certifications)
          ? data.certifications
          : [],
        is_available: true,
      };

      console.log("API data being sent:", apiData);
      console.log("API data stringified:", JSON.stringify(apiData, null, 2));

      const updatedProfile = await labService.updateProfile(apiData);

      // Update local state
      setLaboratoryProfile(data);

      toast({
        title: "Profile Updated",
        description: "Your laboratory profile has been successfully updated.",
      });

      setShowProfileDialog(false);
    } catch (error: unknown) {
      console.error("Failed to update profile:", error);

      toast({
        title: "Error",
        description: "Failed to update laboratory profile. Please try again.",
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

    console.log("=== IMAGE UPLOAD DEBUG ===");
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
        ...laboratoryProfile,
        profile_image: previewUrl,
      };
      setLaboratoryProfile(updatedProfile);
      profileForm.setValue("profile_image", previewUrl);

      console.log("Image preview updated, starting upload...");

      // Upload the actual file to server
      const imageUrl = await labService.uploadProfileImage(file);
      console.log("Server upload complete. New URL:", imageUrl);

      // Clean up the blob URL
      URL.revokeObjectURL(previewUrl);

      // Update with the actual server URL
      const finalProfile = {
        ...laboratoryProfile,
        profile_image: imageUrl,
      };
      setLaboratoryProfile(finalProfile);
      profileForm.setValue("profile_image", imageUrl);

      toast({
        title: "Image Uploaded",
        description: "Profile image has been updated successfully.",
      });
    } catch (error: unknown) {
      console.error("Failed to upload image:", error);

      // Revert to previous image on error
      setLaboratoryProfile(laboratoryProfile);

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

  // Certification management functions
  const addCertification = () => {
    if (newCertification.trim()) {
      const updatedCertifications = [
        ...laboratoryProfile.certifications,
        newCertification.trim(),
      ];
      const updatedProfile = {
        ...laboratoryProfile,
        certifications: updatedCertifications,
      };
      setLaboratoryProfile(updatedProfile);
      profileForm.setValue("certifications", updatedCertifications);
      setNewCertification("");
      toast({
        title: "Certification Added",
        description: "New certification has been added to your profile.",
      });
    }
  };

  const removeCertification = (index: number) => {
    const updatedCertifications = laboratoryProfile.certifications.filter(
      (_, i) => i !== index,
    );
    const updatedProfile = {
      ...laboratoryProfile,
      certifications: updatedCertifications,
    };
    setLaboratoryProfile(updatedProfile);
    profileForm.setValue("certifications", updatedCertifications);
    toast({
      title: "Certification Removed",
      description: "Certification has been removed from your profile.",
    });
  };

  const getStatusColor = (status: Appointment["status"]) => {
    switch (status) {
      case "pending":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "In progress":
        return "bg-amber-100 text-amber-800";
      default:
        return "";
    }
  };

  const getPaymentStatusColor = (status: Appointment["paymentStatus"]) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "unpaid":
        return "bg-red-100 text-red-800";
      case "partial":
        return "bg-blue-100 text-blue-800";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              <span className="text-primary-blue">AFYA</span>
              <span className="text-secondary-green"> MAWINGUNI</span>
            </h1>
            <p className="text-gray-600 mt-2">
              Laboratory Service Provider Dashboard
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex items-center space-x-3">
            <div className="flex items-center bg-white rounded-full px-3 py-1.5 border border-gray-200 shadow-sm">
              <span className="text-sm font-medium mr-2">
                {laboratoryProfile.lab_name || "Laboratory Dashboard"}
              </span>
              <Avatar className="h-8 w-8 border border-secondary-green/20">
                <AvatarImage
                  src={laboratoryProfile.profile_image}
                  alt="Lab Admin"
                />
                <AvatarFallback>
                  {laboratoryProfile.lab_name
                    ? laboratoryProfile.lab_name.substring(0, 2).toUpperCase()
                    : "LAB"}
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
                    Laboratory Profile Settings
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
                      onSubmit={(e) => {
                        e.preventDefault();
                        profileForm.handleSubmit(onProfileSubmit)(e);
                      }}
                      className="space-y-6"
                    >
                      <div className="flex flex-col lg:flex-row gap-8">
                        {/* Profile Image Section */}
                        <div className="lg:w-1/3 flex flex-col items-center">
                          <div className="w-48 h-48 rounded-full mb-6 overflow-hidden border-4 border-primary-blue/20 relative bg-gray-100">
                            {laboratoryProfile.profile_image ? (
                              <img
                                src={laboratoryProfile.profile_image}
                                alt="Laboratory Profile"
                                className="w-full h-full object-cover"
                                key={laboratoryProfile.profile_image}
                                onError={(e) => {
                                  console.error(
                                    "Image failed to load:",
                                    laboratoryProfile.profile_image,
                                  );
                                  e.currentTarget.style.display = "none";
                                }}
                                onLoad={() => {
                                  console.log(
                                    "Image loaded successfully:",
                                    laboratoryProfile.profile_image,
                                  );
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                <User className="h-20 w-20 text-gray-400" />
                              </div>
                            )}
                            {isUploadingImage && (
                              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                <div className="text-white text-sm font-medium">
                                  Uploading...
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="relative">
                            <input
                              type="file"
                              className="hidden"
                              id="profile-image"
                              accept="image/*"
                              onChange={handleImageUpload}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              className="gap-2 w-full md:w-auto mb-4"
                              disabled={isUploadingImage}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                document
                                  .getElementById("profile-image")
                                  ?.click();
                              }}
                            >
                              <Plus className="h-4 w-4" />
                              {isUploadingImage
                                ? "Uploading..."
                                : "Change Profile Image"}
                            </Button>
                          </div>

                          {/* Certifications */}
                          <div className="w-full bg-blue-50 rounded-md p-4 mt-4">
                            <h3 className="font-semibold mb-2">
                              Certifications & Accreditations
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {laboratoryProfile.certifications.map(
                                (cert, index) => (
                                  <Badge
                                    key={index}
                                    className="bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer group relative"
                                    onClick={() => removeCertification(index)}
                                  >
                                    {cert}
                                    <X className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </Badge>
                                ),
                              )}
                            </div>
                            <div className="mt-4">
                              <div className="flex gap-2">
                                <Input
                                  placeholder="Add certification"
                                  className="flex-1"
                                  value={newCertification}
                                  onChange={(e) =>
                                    setNewCertification(e.target.value)
                                  }
                                  onKeyPress={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      addCertification();
                                    }
                                  }}
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  type="button"
                                  onClick={addCertification}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Profile Details Form */}
                        <div className="lg:w-2/3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={profileForm.control}
                              name="lab_name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Laboratory Name</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Laboratory name"
                                      {...field}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={profileForm.control}
                              name="license_number"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>License Number</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="LAB-XXXX-XXX"
                                      {...field}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={profileForm.control}
                            name="website"
                            render={({ field }) => (
                              <FormItem className="mt-4">
                                <FormLabel>Website</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="www.example.com"
                                    {...field}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={profileForm.control}
                            name="address"
                            render={({ field }) => (
                              <FormItem className="mt-4">
                                <FormLabel>Address</FormLabel>
                                <FormControl>
                                  <LocationAutocomplete
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder="Enter your laboratory address"
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={profileForm.control}
                            name="operating_hours"
                            render={({ field }) => (
                              <FormItem className="mt-4">
                                <FormLabel>Operating Hours</FormLabel>
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
                                        Set Operating Hours
                                      </Button>
                                    }
                                  />
                                </div>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={profileForm.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem className="mt-4">
                                <FormLabel>Laboratory Description</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Describe your laboratory and services..."
                                    className="min-h-[120px]"
                                    {...field}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <FormField
                              control={profileForm.control}
                              name="contact_person_name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Contact Person</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Full name" {...field} />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={profileForm.control}
                              name="contact_person_role"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Role/Position</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="e.g., Laboratory Director"
                                      {...field}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-4 pt-4 border-t">
                        <Button
                          variant="outline"
                          type="button"
                          onClick={() => profileForm.reset()}
                        >
                          Reset Changes
                        </Button>
                        <Button
                          type="submit"
                          className="gap-2"
                          disabled={isProfileLoading || isUploadingImage}
                        >
                          <Save className="h-4 w-4" />
                          {isProfileLoading
                            ? "Saving..."
                            : isUploadingImage
                              ? "Processing..."
                              : "Save Profile"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Tests</p>
                <h3 className="text-2xl font-bold">
                  {testServices.filter((t) => t.is_active).length}
                </h3>
              </div>
              <div className="h-10 w-10 bg-blue-200 rounded-full flex items-center justify-center">
                <TestTube className="h-5 w-5 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed Tests</p>
                <h3 className="text-2xl font-bold">123</h3>
              </div>
              <div className="h-10 w-10 bg-green-200 rounded-full flex items-center justify-center">
                <Activity className="h-5 w-5 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-amber-100">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Appointments</p>
                <h3 className="text-2xl font-bold">
                  {appointments.filter((a) => a.status === "pending").length}
                </h3>
              </div>
              <div className="h-10 w-10 bg-amber-200 rounded-full flex items-center justify-center">
                <Calendar className="h-5 w-5 text-amber-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <h3 className="text-2xl font-bold">KES 78,500</h3>
              </div>
              <div className="h-10 w-10 bg-purple-200 rounded-full flex items-center justify-center">
                <ChevronDown className="h-5 w-5 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 w-full justify-start overflow-x-auto space-x-2">
            <TabsTrigger value="tests" className="gap-2">
              <TestTube className="h-4 w-4" />
              <span>Lab Tests</span>
            </TabsTrigger>
            <TabsTrigger value="appointments" className="gap-2">
              <Calendar className="h-4 w-4" />
              <span>Appointments</span>
            </TabsTrigger>
          </TabsList>

          {/* Tests Tab */}
          <TabsContent value="tests">
            <Card>
              <CardHeader className="border-b pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-semibold">Manage Tests</h2>
                  <p className="text-gray-600 text-sm">
                    Add, modify, or deactivate laboratory tests
                  </p>
                </div>
                <Button onClick={handleAddNewTest} className="gap-2">
                  <Plus className="h-4 w-4" />
                  {showTestForm ? "Hide Form" : "Add New Test"}
                </Button>
              </CardHeader>
              <CardContent className="pt-6">
                {showTestForm && (
                  <Card className="mb-6 border border-primary-blue/20 bg-blue-50/30">
                    <CardContent className="pt-6">
                      <Form {...testForm}>
                        <form
                          onSubmit={testForm.handleSubmit(onTestSubmit)}
                          className="space-y-6"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={testForm.control}
                              name="test_name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Test Name</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="e.g., Complete Blood Count"
                                      {...field}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={testForm.control}
                              name="price"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Price (KES)</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      placeholder="e.g., 1500"
                                      {...field}
                                      onChange={(e) =>
                                        field.onChange(Number(e.target.value))
                                      }
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                          <FormField
                            control={testForm.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Describe the test..."
                                    className="min-h-[100px]"
                                    {...field}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={testForm.control}
                            name="turnaround_time"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Turnaround Time</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="e.g., 2 hours"
                                    {...field}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <div className="flex justify-end gap-4">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setShowTestForm(false);
                                setSelectedTest(null);
                              }}
                            >
                              Cancel
                            </Button>
                            <Button type="submit" className="gap-2">
                              <Save className="h-4 w-4" />
                              {selectedTest ? "Update Test" : "Add Test"}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                )}

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Test Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Price (KES)</TableHead>
                        <TableHead>Turnaround Time</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isTestServicesLoading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            Loading test services...
                          </TableCell>
                        </TableRow>
                      ) : testServices.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            No test services found. Add your first test service!
                          </TableCell>
                        </TableRow>
                      ) : (
                        testServices.map((test) => (
                          <TableRow key={test.id}>
                            <TableCell className="flex items-center gap-2">
                              <TestTube className="h-4 w-4 text-primary-blue" />
                              {test.test_name}
                            </TableCell>
                            <TableCell className="max-w-xs truncate">
                              {test.description}
                            </TableCell>
                            <TableCell>
                              KES {test.price.toLocaleString()}
                            </TableCell>
                            <TableCell>{test.turnaround_time}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  test.is_active ? "default" : "secondary"
                                }
                                className={
                                  test.is_active
                                    ? "bg-green-100 text-green-800 hover:bg-green-200"
                                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                                }
                              >
                                {test.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditTest(test)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant={
                                    test.is_active ? "destructive" : "outline"
                                  }
                                  size="sm"
                                  onClick={() =>
                                    handleToggleTestStatus(test.id!)
                                  }
                                >
                                  {test.is_active ? "Deactivate" : "Activate"}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments">
            <Card>
              <CardHeader className="border-b pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-semibold">
                    Appointments History
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Manage patient test appointments
                  </p>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <Input
                    className="pl-10 w-full md:w-64"
                    placeholder="Search appointments..."
                  />
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Patient</TableHead>
                        <TableHead>Test</TableHead>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {appointments.map((appointment) => (
                        <TableRow key={appointment.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage
                                  src={appointment.patientImage}
                                  alt={appointment.patientName}
                                />
                                <AvatarFallback>
                                  {appointment.patientName.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">
                                {appointment.patientName}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{appointment.testName}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span>
                                {new Date(appointment.date).toLocaleDateString(
                                  "en-US",
                                  {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  },
                                )}
                              </span>
                              <span className="text-gray-500 text-xs">
                                {appointment.time}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={getStatusColor(appointment.status)}
                            >
                              {appointment.status.charAt(0).toUpperCase() +
                                appointment.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            KES {appointment.amount.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedAppointment(appointment);
                                  setShowAppointmentDetails(true);
                                }}
                              >
                                View
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Appointment Details Dialog */}
      <Dialog
        open={showAppointmentDetails}
        onOpenChange={(open) => {
          setShowAppointmentDetails(open);
          if (!open) {
            setIsEditing(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle>Appointment Details</DialogTitle>
              {selectedAppointment &&
                selectedAppointment.status === "pending" && (
                  <div className="flex gap-2">
                    {!isEditing ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mr-2"
                        >
                          <path d="M12 20h9"></path>
                          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                        </svg>
                        Edit Details
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel Editing
                      </Button>
                    )}
                  </div>
                )}
            </div>
          </DialogHeader>

          {selectedAppointment && (
            <div className="space-y-6">
              {/* Patient Information - Always Read-Only */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">
                  Patient Information
                </h3>
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={selectedAppointment.patientImage}
                      alt={selectedAppointment.patientName}
                    />
                    <AvatarFallback>
                      {selectedAppointment.patientName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">
                      {selectedAppointment.patientName}
                    </p>
                    <p className="text-sm text-gray-500">
                      Patient ID: PT-{1000 + selectedAppointment.id}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Test Type:
                    </p>
                    <p>{selectedAppointment.testName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Amount:</p>
                    <p>KES {selectedAppointment.amount.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Appointment Specifics Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">
                  Appointment Specifics
                </h3>

                {/* Date and Time Details */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-gray-500">
                    Date and Time
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Date:</p>
                      <p>
                        {new Date(selectedAppointment.date).toLocaleDateString(
                          "en-US",
                          {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          },
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Time:</p>
                      <p>{selectedAppointment.time}</p>
                    </div>
                  </div>
                </div>

                {/* Location - Editable */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-gray-500">
                    Location
                  </h4>
                  {isEditing ? (
                    <Input
                      value={selectedAppointment.location}
                      onChange={(e) => {
                        setSelectedAppointment({
                          ...selectedAppointment,
                          location: e.target.value,
                        });
                      }}
                    />
                  ) : (
                    <p>{selectedAppointment.location}</p>
                  )}
                </div>

                {/* Assigned Staff - Editable */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-gray-500">
                    Assigned Staff
                  </h4>
                  {isEditing ? (
                    <Input
                      value={selectedAppointment.assignedStaff}
                      onChange={(e) => {
                        setSelectedAppointment({
                          ...selectedAppointment,
                          assignedStaff: e.target.value,
                        });
                      }}
                    />
                  ) : (
                    <p>{selectedAppointment.assignedStaff}</p>
                  )}
                </div>

                {/* Notes & Instructions - Editable */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-gray-500">
                    Notes & Special Instructions
                  </h4>
                  {isEditing ? (
                    <Textarea
                      value={selectedAppointment.notes}
                      onChange={(e) => {
                        setSelectedAppointment({
                          ...selectedAppointment,
                          notes: e.target.value,
                        });
                      }}
                      className="min-h-[100px]"
                    />
                  ) : (
                    <p className="text-sm">{selectedAppointment.notes}</p>
                  )}
                </div>
              </div>

              {/* Status Information */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-gray-500">
                  Current Status
                </h4>
                <div className="flex gap-2 items-center">
                  <Badge className={getStatusColor(selectedAppointment.status)}>
                    {selectedAppointment.status.charAt(0).toUpperCase() +
                      selectedAppointment.status.slice(1)}
                  </Badge>

                  <Badge className={getStatusColor("completed")}>
                    Completed
                  </Badge>
                  <Badge className={getStatusColor("In progress")}>
                    In progress
                  </Badge>
                </div>
              </div>
              {/* Upload Report Section */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-gray-500">
                  Upload Report
                </h4>
                <div className="flex items-center gap-2">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Plus className="h-4 w-4 text-green-500" />
                    <label htmlFor="upload-report" className="cursor-pointer">
                      Choose File
                    </label>
                  </Button>
                  <span className="text-sm text-gray-500">No file chosen</span>
                </div>
                <input
                  id="upload-report"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      toast({
                        title: "File Uploaded",
                        description: `You have uploaded: ${file.name}`,
                      });
                    }
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-4 border-t">
                <div className="flex gap-2">
                  {selectedAppointment.status === "pending" && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        // Update appointment status locally for demo
                        const updatedAppointments = appointments.map(
                          (appointment) =>
                            appointment.id === selectedAppointment.id
                              ? { ...appointment, status: "cancelled" as const }
                              : appointment,
                        );
                        // In a real app, you would call an API here
                        toast({
                          title: "Appointment Cancelled",
                          description: `Appointment for ${selectedAppointment.patientName} has been cancelled.`,
                        });
                        setShowAppointmentDetails(false);
                      }}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel Appointment
                    </Button>
                  )}

                  {selectedAppointment.status === "pending" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowRescheduleDialog(true)}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Reschedule
                    </Button>
                  )}
                </div>

                <div className="flex gap-2">
                  {isEditing && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        // Save changes in a real app would call API
                        toast({
                          title: "Details Updated",
                          description: `Appointment details for ${selectedAppointment.patientName} have been updated.`,
                        });
                        setIsEditing(false);
                      }}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  )}

                  {selectedAppointment.status === "pending" && !isEditing && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => {
                        // Update appointment status locally for demo
                        const updatedAppointments = appointments.map(
                          (appointment) =>
                            appointment.id === selectedAppointment.id
                              ? { ...appointment, status: "completed" as const }
                              : appointment,
                        );
                        // In a real app, you would call an API here
                        toast({
                          title: "Test Completed",
                          description: `The ${selectedAppointment.testName} for ${selectedAppointment.patientName} has been marked as completed.`,
                        });
                        setShowAppointmentDetails(false);
                      }}
                    >
                      Complete Test
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    onClick={() => setShowAppointmentDetails(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reschedule Dialog */}
      <Dialog
        open={showRescheduleDialog}
        onOpenChange={setShowRescheduleDialog}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Reschedule Appointment</DialogTitle>
          </DialogHeader>

          {selectedAppointment && (
            <div className="space-y-6">
              <div>
                <FormLabel>New Date</FormLabel>
                <Input
                  type="date"
                  defaultValue={selectedAppointment.date}
                  className="mt-1"
                />
              </div>

              <div>
                <FormLabel>New Time</FormLabel>
                <Input
                  type="time"
                  defaultValue={selectedAppointment.time.split(" ")[0]}
                  className="mt-1"
                />
              </div>

              <div>
                <FormLabel>Reason for Rescheduling</FormLabel>
                <Textarea
                  placeholder="Provide a reason for rescheduling..."
                  className="mt-1"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowRescheduleDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    toast({
                      title: "Appointment Rescheduled",
                      description: `Appointment for ${selectedAppointment.patientName} has been rescheduled.`,
                    });
                    setShowRescheduleDialog(false);
                  }}
                >
                  Confirm Reschedule
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LabDashboard;
