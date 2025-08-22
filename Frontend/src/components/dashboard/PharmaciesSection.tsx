
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Star, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const PharmaciesSection = () => {
  const pharmacies = [
    {
      id: 1,
      name: "MediCare Pharmacy",
      image: "https://randomuser.me/api/portraits/men/41.jpg",
      rating: 4.8,
      address: "123 Health Street, Medical District",
      distance: "0.8 miles away",
      openHours: "Open 24 hours"
    },
    {
      id: 2,
      name: "City Drugs & Wellness",
      image: "https://randomuser.me/api/portraits/women/67.jpg",
      rating: 4.7,
      address: "456 Main Avenue, Downtown",
      distance: "1.2 miles away",
      openHours: "Open until 9 PM"
    },
    {
      id: 3,
      name: "HealthFirst Pharmacy",
      image: "https://randomuser.me/api/portraits/men/33.jpg",
      rating: 4.5,
      address: "789 Wellness Blvd, Uptown",
      distance: "2.1 miles away",
      openHours: "Open until 10 PM"
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-[var(--dark)]">Pharmacies Near You</h2>
        <Button variant="link" className="text-primary-blue p-0">View All</Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pharmacies.map((pharmacy) => (
          <Card key={pharmacy.id} className="overflow-hidden hover:shadow-md transition-all duration-300 border border-gray-100">
            <CardContent className="p-0">
              <div className="p-5">
                <div className="flex items-center gap-4 mb-3">
                  <Avatar className="h-12 w-12 border-2 border-primary-blue/10">
                    <AvatarImage src={pharmacy.image} alt={pharmacy.name} />
                    <AvatarFallback>{pharmacy.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium text-[var(--dark)]">{pharmacy.name}</h3>
                    <div className="flex items-center mt-1">
                      <Star className="h-4 w-4 text-yellow-400 mr-1 fill-yellow-400" />
                      <span className="text-sm text-gray-600">{pharmacy.rating}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div>
                      <p>{pharmacy.address}</p>
                      <p className="text-primary-blue">{pharmacy.distance}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <p>{pharmacy.openHours}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-2 flex border-t border-gray-100">
                <Button variant="ghost" className="flex-1 rounded-none text-primary-blue hover:text-primary-blue/80 hover:bg-blue-50 py-3 h-auto">
                  View Details
                </Button>
                <Button variant="ghost" className="flex-1 rounded-none text-secondary-green hover:text-secondary-green/80 hover:bg-green-50 py-3 h-auto border-l border-gray-100">
                  Order Medicine
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PharmaciesSection;
