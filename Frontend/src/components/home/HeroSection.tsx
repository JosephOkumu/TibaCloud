import { Button } from "@/components/ui/button";
import AuthButton from "@/components/auth/AuthButton";

const HeroSection = () => {
  return (
    <div className="bg-hero-gradient text-custom-white py-24 text-center">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          End-to-end Healthcare Management
        </h1>
        <p className="max-w-2xl mx-auto mb-8">
          Connect with doctors, nursing services, and laboratories all in one
          place. Our AI assistant Alex helps you find the perfect healthcare
          professional for your needs.
        </p>
        <AuthButton defaultTab="signup">Create Account</AuthButton>
      </div>
    </div>
  );
};

export default HeroSection;
