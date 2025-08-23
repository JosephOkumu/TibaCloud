import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import {
  Search,
  Bell,
  MessageSquare,
  Calendar,
  Package,
  LogOut,
  Star,
  MapPin,
  CheckCircle,
  ArrowRight,
  FileText,
  Microscope,
  TestTube,
  Activity,
  Thermometer,
} from "lucide-react";
import AIChat from "@/components/AIChat";
import labService, { LabProvider } from "@/services/labService";

interface LabTestType {
  id: number;
  name: string;
  description: string;
  price: number;
  popular: boolean;
  icon: React.ElementType;
}

interface LabProviderType {
  id: number;
  name: string;
  logo: string;
  initials: string;
  rating: number;
  patientsServed: number;
  location: string;
  distance: string;
  tests: number;
}

const labTests: LabTestType[] = [
  {
    id: 1,
    name: "Blood Check Up",
    description:
      "Measures different components of blood including red blood cells, white blood cells, and platelets.",
    price: 1200,
    popular: true,
    icon: Activity,
  },
  {
    id: 2,
    name: "BP Checkup",
    description:
      "Assesses blood pressure levels to detect hypertension or hypotension.",
    price: 800,
    popular: false,
    icon: Thermometer,
  },
  {
    id: 3,
    name: "Full Body Checkup",
    description:
      "Comprehensive set of tests to evaluate overall health status.",
    price: 12000,
    popular: true,
    icon: Microscope,
  },
  {
    id: 4,
    name: "Urine Test",
    description:
      "Examines urine to detect various disorders such as diabetes and kidney disease.",
    price: 1000,
    popular: false,
    icon: TestTube,
  },
  {
    id: 5,
    name: "Book Lab From Prescription",
    description: "Book lab tests based on your doctor's prescription.",
    price: 0,
    popular: false,
    icon: FileText,
  },
  {
    id: 6,
    name: "COVID-19 Test",
    description: "Detects active coronavirus infection.",
    price: 3500,
    popular: false,
    icon: TestTube, // Changed from Flask to TestTube
  },
];

const PatientLabTests = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [labProviders, setLabProviders] = useState<LabProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Navigation items for the horizontal navbar
  const navItems = [
    {
      icon: Calendar,
      label: "Appointments",
      path: "/patient-dashboard/appointments",
    },
    { icon: Package, label: "Orders", path: "/patient-dashboard/orders" },
  ];

  // Generate user initials
  const getUserInitials = (name: string) => {
    if (!name) return "U";
    const names = name.trim().split(" ");
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (
      names[0].charAt(0) + names[names.length - 1].charAt(0)
    ).toUpperCase();
  };

  const filteredTests = labTests.filter(
    (test) =>
      test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.description.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Fetch lab providers from backend
  useEffect(() => {
    const fetchLabProviders = async () => {
      try {
        setLoading(true);
        const providers = await labService.getAllLabProviders();
        setLabProviders(providers);
      } catch (error) {
        console.error("Error fetching lab providers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLabProviders();
  }, []);

  const filteredProviders = labProviders.filter(
    (provider) =>
      provider.lab_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.address.toLowerCase().includes(searchTerm.toLowerCase()),
  );

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

          {/* Search Bar - Hidden on mobile */}
          <div className="relative hidden md:block max-w-md w-full mx-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="search"
              placeholder="Search for lab tests or providers..."
              className="pl-10 w-full border-gray-200 focus-visible:ring-secondary-green"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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

      {/* Mobile Search - Visible only on mobile */}
      <div className="md:hidden p-4 bg-white border-t border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="search"
            placeholder="Search lab tests or providers..."
            className="pl-10 w-full border-gray-200 focus-visible:ring-secondary-green"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Dashboard Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Header Card */}
        <Card className="mb-6 bg-gradient-to-r from-green-500/90 to-teal-600/90 text-white border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold font-playfair">Lab Tests</h1>
                <p className="opacity-90 mt-1">
                  Book diagnostic tests and health check-ups
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {navItems.map((item, index) => (
                  <Link key={index} to={item.path}>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="bg-white/20 hover:bg-white/30 border-none backdrop-blur-sm text-white"
                    >
                      <item.icon className="h-4 w-4 mr-2" />
                      {item.label}
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lab Tests Section with Icons - Now 3 per row */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold font-playfair">Lab Tests</h2>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {filteredTests.map((test) => (
              <Link
                key={test.id}
                to={`/patient-dashboard/lab-provider/1?test=${test.id}`}
              >
                <Card className="hover:shadow-md transition-all duration-300 hover:-translate-y-1 border border-green-100 overflow-hidden group">
                  <div className="flex flex-col items-center justify-center p-6">
                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-3 group-hover:bg-green-100 transition-colors">
                      <test.icon className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="font-medium text-center text-sm">
                      {test.name}
                    </h3>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Lab Providers Section */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold font-playfair">
              Lab Providers
            </h2>
            <Button
              variant="outline"
              className="text-primary-blue hover:text-white hover:bg-primary-blue transition-colors"
            >
              View More
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading lab providers...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProviders.slice(0, 4).map((provider) => (
                <Link
                  key={provider.id}
                  to={`/patient-dashboard/lab-provider/${provider.id}`}
                >
                  <Card className="hover:shadow-md transition-all duration-300 hover:-translate-y-1 overflow-hidden border border-green-100">
                    <CardContent className="p-5">
                      <div className="flex gap-4">
                        <Avatar className="h-16 w-16">
                          {provider.profile_image ? (
                            <AvatarImage
                              src={provider.profile_image}
                              alt={provider.lab_name}
                            />
                          ) : null}
                          <AvatarFallback className="bg-primary-blue/10 text-primary-blue">
                            {provider.lab_name
                              .split(" ")
                              .map((word) => word[0])
                              .join("")
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium text-lg">
                              {provider.lab_name}
                            </h3>
                            <div className="flex items-center">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm ml-1 font-medium">
                                {provider.average_rating || 0}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center text-gray-600 text-sm mt-1">
                            <MapPin className="h-3 w-3 mr-1" />
                            {provider.address}
                          </div>

                          <div className="grid grid-cols-1 gap-2 mt-3">
                            <div>
                              <div className="text-gray-500">
                                Patients served
                              </div>
                              <div className="font-medium">
                                {Math.floor(Math.random() * 10000) + 1000}
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2 text-primary-blue border-primary-blue hover:bg-primary-blue hover:text-white"
                            >
                              View More
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer - Using the one from landing page for consistency */}
      <footer className="bg-custom-dark text-custom-white mt-auto">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div>
              <h3 className="font-bold text-lg mb-4">Tiba Cloud</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/features" className="hover:text-gray-300">
                    Features
                  </Link>
                </li>
                <li>
                  <Link to="/accounts" className="hover:text-gray-300">
                    Accounts
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-gray-300">
                    Login
                  </Link>
                </li>
              </ul>
            </div>

            {/* For Patients */}
            <div>
              <h3 className="font-bold text-lg mb-4">For Patients</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/find-doctor" className="hover:text-gray-300">
                    Find a Doctor
                  </Link>
                </li>
                <li>
                  <Link to="/book-appointment" className="hover:text-gray-300">
                    Book Appointment
                  </Link>
                </li>
                <li>
                  <Link to="/medical-records" className="hover:text-gray-300">
                    Medical Records
                  </Link>
                </li>
                <li>
                  <Link to="/telemedicine" className="hover:text-gray-300">
                    Telemedicine
                  </Link>
                </li>
              </ul>
            </div>

            {/* For Providers */}
            <div>
              <h3 className="font-bold text-lg mb-4">For Providers</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/provider-registration"
                    className="hover:text-gray-300"
                  >
                    Provider Registration
                  </Link>
                </li>
                <li>
                  <Link
                    to="/practice-management"
                    className="hover:text-gray-300"
                  >
                    Practice Management
                  </Link>
                </li>
                <li>
                  <Link
                    to="/patient-coordination"
                    className="hover:text-gray-300"
                  >
                    Patient Coordination
                  </Link>
                </li>
                <li>
                  <Link to="/billing" className="hover:text-gray-300">
                    Billing
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Us */}
            <div>
              <h3 className="font-bold text-lg mb-4">Contact Us</h3>
              <ul className="space-y-2">
                <li>info@tibacloud.com</li>
                <li>+254 712 345 678</li>
                <li>Support Center</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-sm">
            <p>
              © {new Date().getFullYear()} Tiba Cloud. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
      {/* Place AI floating chat at the root level */}
      <AIChat />
    </div>
  );
};

export default PatientLabTests;
