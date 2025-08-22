
import AccountCard from "@/components/home/AccountCard";
import { UserRound, UserCog, Building2, FlaskConical } from "lucide-react";

const AccountsSection = () => {
  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-primary-blue mb-2">Accounts</h2>
        <p className="text-center mb-12">Tailored experiences for different healthcare stakeholders</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AccountCard 
            title="Patients"
            description="Find healthcare providers, book appointments, access medical records, and receive personalized health recommendations."
            icon={UserRound}
            iconBgClass="account-icon-bg-blue"
          />
          
          <AccountCard 
            title="Doctors"
            description="Manage patient appointments, access medical histories, prescribe medications, and coordinate with other healthcare providers."
            icon={UserCog}
            iconBgClass="account-icon-bg-green"
          />
          
          <AccountCard 
            title="Nursing Facilities"
            description="Coordinate patient care, manage staff schedules, track medical supplies, and communicate with doctors and laboratories."
            icon={Building2}
            iconBgClass="account-icon-bg-blue"
          />
          
          <AccountCard 
            title="Laboratories"
            description="Process test requests, manage samples, deliver results, and coordinate with doctors and nursing facilities."
            icon={FlaskConical}
            iconBgClass="account-icon-bg-green"
          />
        </div>
      </div>
    </div>
  );
};

export default AccountsSection;
