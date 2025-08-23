import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User,
  Lock,
  Mail,
  UserRound,
  Stethoscope,
  Building2,
  FlaskConical,
} from "lucide-react";

type UserType = "patient" | "doctor" | "nursing" | "laboratory";

// Map frontend user types to backend user_type_id
const userTypeMapping: Record<UserType, number> = {
  patient: 1,
  doctor: 2,
  nursing: 3,
  laboratory: 4,
};

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "signin" | "signup";
}

const AuthModal = ({
  isOpen,
  onClose,
  defaultTab = "signin",
}: AuthModalProps) => {
  const [activeTab, setActiveTab] = useState<"signin" | "signup">(defaultTab);
  const [userType, setUserType] = useState<UserType>("patient");
  const [loading, setLoading] = useState(false);

  // Form field states
  const [signinEmail, setSigninEmail] = useState("");
  const [signinPassword, setSigninPassword] = useState("");

  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [signupLicense, setSignupLicense] = useState("");
  const [signupNationalId, setSignupNationalId] = useState("");

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(signinEmail, signinPassword);
      toast({
        title: "Success",
        description: "You have successfully signed in",
        variant: "default",
      });
      onClose();

      // Redirect based on user type
      setTimeout(() => {
        const user = localStorage.getItem("user");
        if (user) {
          const userData = JSON.parse(user);
          console.log("User data after login:", userData); // Debug user data

          // Get user type - handle both object format (registration) and string format (login)
          const userType =
            typeof userData.user_type === "object"
              ? userData.user_type.name
              : userData.user_type;

          console.log("User type for redirection:", userType);

          switch (userType) {
            case "patient":
              navigate("/patient-dashboard");
              break;
            case "doctor":
              navigate("/provider/doctor");
              break;
            case "laboratory": // Laboratory user type
              navigate("/provider/laboratory");
              break;
            case "nursing":
              navigate("/provider/home-nursing");
              break;
            default:
              console.log("Unknown user type:", userType);
              navigate("/");
          }
        }
      }, 500);
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description: error.response?.data?.message || "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validate passwords match
    if (signupPassword !== signupConfirmPassword) {
      toast({
        title: "Registration Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Prepare registration data
    const registrationData = {
      name: signupName,
      email: signupEmail,
      password: signupPassword,
      password_confirmation: signupConfirmPassword,
      phone_number: signupPhone,
      user_type: userType, // Send user_type as string instead of user_type_id
    };

    // Add verification fields for healthcare providers
    if (userType !== "patient") {
      Object.assign(registrationData, {
        license_number: signupLicense,
        national_id: signupNationalId,
      });
    }

    try {
      console.log(
        "Sending registration data:",
        JSON.stringify(registrationData, null, 2),
      );
      await register(registrationData);
      toast({
        title: "Success",
        description: "You have successfully registered. Welcome to Tiba Cloud!",
        variant: "default",
      });
      onClose();

      // Redirect based on user type
      setTimeout(() => {
        switch (userType) {
          case "patient":
            navigate("/patient-dashboard");
            break;
          case "doctor":
            navigate("/provider/doctor");
            break;
          case "laboratory":
            navigate("/provider/laboratory");
            break;
          case "nursing":
            navigate("/provider/home-nursing");
            break;
          default:
            navigate("/");
        }
      }, 500);
    } catch (error: any) {
      console.error("Registration error:", error);

      // Handle validation errors more specifically
      if (error.response && error.response.status === 422) {
        const validationErrors = error.response.data.errors;
        console.log("Validation errors:", validationErrors);

        // Display the first validation error message
        const firstError = Object.values(validationErrors)[0];
        const errorMessage = Array.isArray(firstError)
          ? firstError[0]
          : String(firstError);

        toast({
          title: "Validation Error",
          description:
            errorMessage || "Please check your form inputs and try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Registration Failed",
          description:
            error.response?.data?.message ||
            "Unable to register. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="bg-gradient-to-r from-primary-blue to-secondary-green p-6 text-white">
          <DialogTitle className="text-2xl font-bold text-center">
            Welcome to Tiba Cloud
          </DialogTitle>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "signin" | "signup")}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-6 p-3 gap-3 bg-transparent">
            <TabsTrigger
              value="signin"
              className="text-lg py-3 bg-gradient-to-r from-primary-blue to-secondary-green text-white font-medium hover:brightness-110 rounded-md"
            >
              Sign In
            </TabsTrigger>
            <TabsTrigger
              value="signup"
              className="text-lg py-3 bg-gradient-to-r from-secondary-green to-primary-blue text-white font-medium hover:brightness-110 rounded-md"
            >
              Sign Up
            </TabsTrigger>
          </TabsList>

          <div className="px-6 pb-6">
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-400">
                      <Mail className="h-5 w-5" />
                    </span>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      className="pl-10"
                      value={signinEmail}
                      onChange={(e) => setSigninEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-400">
                      <Lock className="h-5 w-5" />
                    </span>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      className="pl-10"
                      value={signinPassword}
                      onChange={(e) => setSigninPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="remember"
                      className="rounded border-gray-300"
                    />
                    <label htmlFor="remember">Remember me</label>
                  </div>
                  <a href="#" className="text-primary-blue hover:underline">
                    Forgot password?
                  </a>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary-blue to-secondary-green text-white py-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 font-medium text-lg hover:scale-[1.02] hover:brightness-105"
                  size="lg"
                  disabled={loading}
                >
                  {loading ? "Signing In..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <div className="mb-6">
                <Label className="mb-2 block">I am a:</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  {(
                    ["patient", "doctor", "nursing", "laboratory"] as UserType[]
                  ).map((type) => (
                    <div
                      key={type}
                      onClick={() => setUserType(type)}
                      className={`
                        relative p-4 rounded-lg cursor-pointer transition-all duration-200
                        ${
                          userType === type
                            ? "bg-gradient-to-br from-primary-blue/10 to-secondary-green/10 border-2 border-primary-blue"
                            : "bg-gray-50 border-2 border-gray-200 hover:bg-gray-100"
                        }
                      `}
                    >
                      <div
                        className={`
                        w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-2
                        ${
                          userType === type
                            ? type === "patient" || type === "nursing"
                              ? "bg-primary-blue text-white"
                              : "bg-secondary-green text-white"
                            : "bg-gray-200 text-gray-500"
                        }
                      `}
                      >
                        {type === "patient" && (
                          <UserRound className="h-6 w-6" />
                        )}
                        {type === "doctor" && (
                          <Stethoscope className="h-6 w-6" />
                        )}
                        {type === "nursing" && (
                          <Building2 className="h-6 w-6" />
                        )}
                        {type === "laboratory" && (
                          <FlaskConical className="h-6 w-6" />
                        )}
                      </div>
                      <p
                        className={`text-center font-medium capitalize ${userType === type ? "text-primary-blue" : "text-gray-700"}`}
                      >
                        {type}
                      </p>
                      {userType === type && (
                        <div className="absolute top-2 right-2 w-4 h-4 bg-primary-blue rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-400">
                      <User className="h-5 w-5" />
                    </span>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Enter your full name"
                      className="pl-10"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-400">
                      <Mail className="h-5 w-5" />
                    </span>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      className="pl-10"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-phone">Phone Number</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-5 w-5"
                      >
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                      </svg>
                    </span>
                    <Input
                      id="signup-phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      className="pl-10"
                      value={signupPhone}
                      onChange={(e) => setSignupPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-400">
                      <Lock className="h-5 w-5" />
                    </span>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Create a password"
                      className="pl-10"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-confirm-password">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-400">
                      <Lock className="h-5 w-5" />
                    </span>
                    <Input
                      id="signup-confirm-password"
                      type="password"
                      placeholder="Confirm your password"
                      className="pl-10"
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Conditional fields for healthcare providers */}
                {(userType === "laboratory" ||
                  userType === "doctor" ||
                  userType === "nursing") && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="signup-license">
                        {userType === "doctor"
                          ? "Medical License Number"
                          : userType === "laboratory"
                            ? "Laboratory License Number"
                            : "Nursing License Number"}
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-gray-400">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-5 w-5"
                          >
                            <rect
                              width="18"
                              height="11"
                              x="3"
                              y="11"
                              rx="2"
                              ry="2"
                            ></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                          </svg>
                        </span>
                        <Input
                          id="signup-license"
                          type="text"
                          placeholder={`Enter your ${userType === "doctor" ? "medical" : userType === "laboratory" ? "laboratory" : "nursing"} license number`}
                          className="pl-10"
                          value={signupLicense}
                          onChange={(e) => setSignupLicense(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    {userType !== "laboratory" && (
                      <div className="space-y-2">
                        <Label htmlFor="signup-national-id">
                          National ID Number
                        </Label>
                        <div className="relative">
                          <span className="absolute left-3 top-3 text-gray-400">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-5 w-5"
                            >
                              <path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z"></path>
                              <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                          </span>
                          <Input
                            id="signup-national-id"
                            type="text"
                            placeholder="Enter your National ID number"
                            className="pl-10"
                            value={signupNationalId}
                            onChange={(e) =>
                              setSignupNationalId(e.target.value)
                            }
                            required
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}

                <div className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    id="terms"
                    className="rounded border-gray-300"
                    required
                  />
                  <label htmlFor="terms">
                    I agree to the{" "}
                    <a href="#" className="text-primary-blue hover:underline">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-primary-blue hover:underline">
                      Privacy Policy
                    </a>
                  </label>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-secondary-green to-primary-blue text-white py-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 font-medium text-lg hover:scale-[1.02] hover:brightness-105"
                  size="lg"
                  disabled={loading}
                >
                  {loading
                    ? "Signing Up..."
                    : `Sign Up as ${userType.charAt(0).toUpperCase() + userType.slice(1)}`}
                </Button>
              </form>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
