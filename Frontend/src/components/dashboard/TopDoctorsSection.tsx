import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Star, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DoctorCardProps {
  name: string;
  specialty: string;
  rating: number;
  location: string;
  imageUrl: string;
  experience: string;
}

const DoctorCard = ({ name, specialty, rating, location, imageUrl, experience }: DoctorCardProps) => (
  <Card className="hover:shadow-md transition-all duration-300 overflow-hidden group">
    <div className="relative">
      <img 
        src={imageUrl} 
        alt={name} 
        className="w-full h-48 object-cover object-center group-hover:scale-105 transition-transform duration-300"
      />
      <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full flex items-center text-xs font-medium">
        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
        {rating.toFixed(1)}
      </div>
    </div>
    <CardContent className="p-4">
      <h3 className="font-semibold text-lg text-primary-blue">{name}</h3>
      <p className="text-sm text-gray-600 mb-2">{specialty}</p>
      
      <div className="flex items-center text-xs text-gray-500 mb-2">
        <MapPin className="h-3 w-3 mr-1" />
        {location}
      </div>
      
      <div className="flex items-center text-xs text-gray-500 mb-3">
        <Calendar className="h-3 w-3 mr-1" />
        {experience} experience
      </div>
      
      <Button variant="outline" size="sm" className="w-full border-primary-blue text-primary-blue hover:bg-primary-blue hover:text-white">
        Book Appointment
      </Button>
    </CardContent>
  </Card>
);

const doctorImage = "/lovable-uploads/a05b3053-380f-4711-b032-bc48d1c082f0.png";
const TopDoctorsSection = () => {
  const doctors = [
    {
      name: "Dr. James Wilson",
      specialty: "General Practitioner",
      rating: 4.9,
      location: "Nairobi Central",
      imageUrl: doctorImage,
      experience: "15 years"
    },
    {
      name: "Dr. Lisa Chen",
      specialty: "Cardiologist",
      rating: 4.8,
      location: "Westlands Medical Center",
      imageUrl: doctorImage,
      experience: "12 years"
    },
    {
      name: "Dr. Robert Brown",
      specialty: "Pediatrician",
      rating: 4.7,
      location: "Parklands Children's Hospital",
      imageUrl: doctorImage,
      experience: "10 years"
    },
    {
      name: "Dr. Amanda Smith",
      specialty: "Dermatologist",
      rating: 4.9,
      location: "Skin Health Clinic, Karen",
      imageUrl: doctorImage,
      experience: "8 years"
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-[var(--dark)]">Top Rated Doctors</h2>
        <Button variant="link" className="text-primary-blue p-0">View All</Button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {doctors.map((doctor, index) => (
          <DoctorCard 
            key={index}
            name={doctor.name}
            specialty={doctor.specialty}
            rating={doctor.rating}
            location={doctor.location}
            imageUrl={doctor.imageUrl}
            experience={doctor.experience}
          />
        ))}
      </div>
    </div>
  );
};

export default TopDoctorsSection;
