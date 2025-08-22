import FeatureCard from "@/components/home/FeatureCard";
import {
  UserCog,
  Calendar,
  UserRound,
  Video,
  Pill,
  Beaker,
} from "lucide-react";

const FeaturesSection = () => {
  return (
    <div className="py-16 bg-custom-light-gray">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-primary-blue mb-2">
          Our Services
        </h2>
        <p className="text-center mb-12">
          Comprehensive healthcare solutions for patients and providers
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            title="Alex - AI Health Assistant"
            description="Meet Alex, our intelligent AI assistant who helps you find the right healthcare professional based on your symptoms and preferences, offering personalized recommendations and quick access to medical advice."
            icon={UserCog}
          />

          <FeatureCard
            title="Appointment Scheduling"
            description="Book appointments with doctors, nursing facilities, and laboratories with just a few clicks. Manage your healthcare schedule in one convenient place."
            icon={Calendar}
          />

          <FeatureCard
            title="Secure Medical Records"
            description="Store and access your medical records securely. Share them with healthcare providers as needed, ensuring continuity of care across different facilities."
            icon={UserRound}
          />

          <FeatureCard
            title="Telemedicine Services"
            description="Connect with healthcare professionals remotely through video consultations. Get medical advice from the comfort of your home."
            icon={Video}
          />

          <FeatureCard
            title="Medication Tracking"
            description="Keep track of your medications, dosages, and schedules. Receive reminders to ensure you never miss a dose."
            icon={Pill}
          />

          <FeatureCard
            title="Lab Results & Imaging"
            description="View your laboratory results and medical imaging reports online. Easily share them with your healthcare providers for better coordination."
            icon={Beaker}
          />
        </div>
      </div>
    </div>
  );
};

export default FeaturesSection;
