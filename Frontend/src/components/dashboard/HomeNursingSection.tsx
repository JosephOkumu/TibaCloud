
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Star, Clock, Award, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const HomeNursingSection = () => {
  const nursingProviders = [
    {
      id: 1,
      name: "Elite Home Care",
      image: "https://randomuser.me/api/portraits/women/44.jpg",
      rating: 4.9,
      specialties: ["Elderly Care", "Post-Surgery"],
      experience: "15+ years",
      address: "123 Care Avenue, Central District",
      availability: "Available 24/7"
    },
    {
      id: 2,
      name: "Comfort Nursing Services",
      image: "https://randomuser.me/api/portraits/men/22.jpg",
      rating: 4.7,
      specialties: ["Pediatric Care", "Chronic Disease"],
      experience: "10+ years",
      address: "456 Wellness Lane, East Side",
      availability: "Available weekdays"
    },
    {
      id: 3,
      name: "Healing Hands Nursing",
      image: "https://randomuser.me/api/portraits/women/55.jpg",
      rating: 4.8,
      specialties: ["Rehabilitation", "Palliative Care"],
      experience: "12+ years",
      address: "789 Health Blvd, North District",
      availability: "Available on short notice"
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-[var(--dark)]">Home Nursing Providers</h2>
        <Link to="/patient-dashboard/nursing">
          <Button variant="link" className="text-primary-blue p-0">View All</Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {nursingProviders.map((provider) => (
          <Card key={provider.id} className="overflow-hidden hover:shadow-md transition-all duration-300 border border-gray-100">
            <CardContent className="p-0">
              <div className="p-5">
                <div className="flex items-center gap-4 mb-3">
                  <Avatar className="h-12 w-12 border-2 border-secondary-green/10">
                    <AvatarImage src={provider.image} alt={provider.name} />
                    <AvatarFallback>{provider.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium text-[var(--dark)]">{provider.name}</h3>
                    <div className="flex items-center mt-1">
                      <Star className="h-4 w-4 text-yellow-400 mr-1 fill-yellow-400" />
                      <span className="text-sm text-gray-600">{provider.rating}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mb-3 flex flex-wrap gap-1">
                  {provider.specialties.map((specialty, index) => (
                    <Badge key={index} variant="secondary" className="bg-green-50 text-secondary-green hover:bg-green-100">
                      {specialty}
                    </Badge>
                  ))}
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-gray-400" />
                    <p>{provider.experience}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                    <p>{provider.address}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <p>{provider.availability}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-2 flex border-t border-gray-100">
                <Link to={`/patient-dashboard/nursing/${provider.id}`} className="flex-1">
                  <Button variant="ghost" className="w-full rounded-none text-primary-blue hover:text-primary-blue/80 hover:bg-blue-50 py-3 h-auto">
                    View Details
                  </Button>
                </Link>
                <Link to={`/patient-dashboard/nursing/${provider.id}`} className="flex-1">
                  <Button variant="ghost" className="w-full rounded-none text-secondary-green hover:text-secondary-green/80 hover:bg-green-50 py-3 h-auto border-l border-gray-100">
                    Book Service
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default HomeNursingSection;
