import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./contexts/AuthContext";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Header from "./components/Header";
import PatientDashboard from "./pages/PatientDashboard";
import PatientOrders from "./pages/PatientOrders";
import PatientAppointments from "./pages/PatientAppointments";
import PatientMedicines from "./pages/PatientMedicines";
import MedicineDetails from "./pages/MedicineDetails";
import PatientLabTests from "./pages/PatientLabTests";
import LabProviderDetails from "./pages/LabProviderDetails";
import DoctorConsultation from "./pages/DoctorConsultation";
import DoctorDetails from "./pages/DoctorDetails";
import HomeNursingProviders from "./pages/HomeNursingProviders";
import HomeNursingDetails from "./pages/HomeNursingDetails";
import HomeNursingDashboard from "./pages/ProviderDashboard/HomeNursingDashboard";
import DoctorDashboard from "./pages/ProviderDashboard/DoctorDashboard";
import LabDashboard from "./pages/ProviderDashboard/LabDashboard";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancelled from "./pages/PaymentCancelled";
import AboutUs from "./components/AboutUs"; // Correcting the import path for AboutUs component

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="flex flex-col min-h-screen">
            <Routes>
              <Route
                path="/"
                element={
                  <>
                    <Header />
                    <main className="flex-grow">
                      <Index />
                    </main>
                  </>
                }
              />
              {/* Dashboard Routes */}
              <Route path="/patient-dashboard" element={<PatientDashboard />} />
              <Route
                path="/patient-dashboard/orders"
                element={<PatientOrders />}
              />
              <Route
                path="/patient-dashboard/appointments"
                element={<PatientAppointments />}
              />

              {/* Medicine Routes */}
              <Route
                path="/patient-dashboard/medicines"
                element={<PatientMedicines />}
              />
              <Route
                path="/patient-dashboard/medicines/:id"
                element={<MedicineDetails />}
              />

              {/* Lab Test Routes */}
              <Route
                path="/patient-dashboard/lab-tests"
                element={<PatientLabTests />}
              />
              <Route
                path="/patient-dashboard/lab-provider/:id"
                element={<LabProviderDetails />}
              />

              {/* Doctor Consultation Routes */}
              <Route
                path="/patient-dashboard/consultation"
                element={<DoctorConsultation />}
              />
              <Route
                path="/patient-dashboard/doctor/:id"
                element={<DoctorDetails />}
              />

              {/* Home Nursing Routes */}
              <Route
                path="/patient-dashboard/nursing"
                element={<HomeNursingProviders />}
              />
              <Route
                path="/patient-dashboard/nursing/:id"
                element={<HomeNursingDetails />}
              />

              {/* Provider Dashboard Routes */}
              <Route
                path="/provider/home-nursing"
                element={<HomeNursingDashboard />}
              />
              <Route path="/provider/doctor" element={<DoctorDashboard />} />
              <Route path="/provider/laboratory" element={<LabDashboard />} />

              {/* Payment Routes */}
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/payment-cancelled" element={<PaymentCancelled />} />

              {/* About Us Route */}
              <Route
                path="/about-us"
                element={
                  <>
                    <Header />
                    <main className="flex-grow">
                      <AboutUs />
                    </main>
                  </>
                }
              />

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
