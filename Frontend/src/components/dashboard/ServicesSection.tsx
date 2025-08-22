
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingBag, FileText, Stethoscope, Home, PillBottle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  path: string;
  iconColor?: string;
  bgColor?: string;
}

const ServiceCard = ({ icon, title, path, iconColor = "text-teal-500", bgColor = "bg-teal-50" }: ServiceCardProps) => (
  <Link to={path}>
    <Card className="hover:shadow-md transition-all duration-300 hover:-translate-y-1 border group">
      <CardContent className="p-6 flex items-center gap-4">
        <div className={cn("w-12 h-12 rounded-full flex items-center justify-center mb-0", bgColor)}>
          {icon}
        </div>
        <h3 className="text-base font-medium">{title}</h3>
      </CardContent>
    </Card>
  </Link>
);

const ServicesSection = () => {
  const services = [
    {
      icon: <ShoppingBag className="h-6 w-6 text-teal-500" />,
      title: "Buy Medicine",
      path: "/patient-dashboard/medicines",
      bgColor: "bg-teal-50"
    },
    {
      icon: <FileText className="h-6 w-6 text-teal-500" />,
      title: "Lab Test",
      path: "/patient-dashboard/lab-tests",
      bgColor: "bg-teal-50"
    },
    {
      icon: <Stethoscope className="h-6 w-6 text-teal-500" />,
      title: "Doctor Consultation",
      path: "/patient-dashboard/consultation",
      bgColor: "bg-teal-50"
    },
    {
      icon: <Home className="h-6 w-6 text-teal-500" />,
      title: "Home Nursing",
      path: "/patient-dashboard/nursing",
      bgColor: "bg-teal-50"
    },
    {
      icon: <PillBottle className="h-6 w-6 text-teal-500" />,
      title: "Prescription Refill & Reminders",
      path: "/patient-dashboard/prescriptions",
      bgColor: "bg-teal-50"
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-[var(--dark)]">Our Services</h2>
        <Button variant="link" className="text-primary-blue p-0">View All</Button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service, index) => (
          <ServiceCard 
            key={index}
            icon={service.icon}
            title={service.title}
            path={service.path}
            bgColor={service.bgColor}
          />
        ))}
      </div>
    </div>
  );
};

export default ServicesSection;
