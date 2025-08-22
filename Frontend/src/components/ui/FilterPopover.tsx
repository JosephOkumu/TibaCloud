import React from "react";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { X, Filter as FilterIcon, Check } from "lucide-react";

interface FilterPopoverProps {
  onLocationChange: (location: string) => void;
  onRatingChange: (rating: number) => void;
  selectedLocation: string;
  ratingFilter: number;
  locations?: string[];
}

const FilterPopover: React.FC<FilterPopoverProps> = ({
  onLocationChange,
  onRatingChange,
  selectedLocation,
  ratingFilter,
  locations = [],
}) => {
  const [open, setOpen] = React.useState(false);
  const [localLocation, setLocalLocation] = React.useState(selectedLocation);
  const [localRating, setLocalRating] = React.useState(ratingFilter);

  // Apply filters and close popover
  const applyFilters = () => {
    onLocationChange(localLocation);
    onRatingChange(localRating);
    setOpen(false);
  };

  // Reset filters
  const resetFilters = () => {
    setLocalLocation("");
    setLocalRating(0);

    onLocationChange("");
    onRatingChange(0);
    setOpen(false);
  };

  // Update local state when props change
  React.useEffect(() => {
    setLocalLocation(selectedLocation);
    setLocalRating(ratingFilter);
  }, [selectedLocation, ratingFilter]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 bg-white border-gray-200"
        >
          <FilterIcon className="h-4 w-4 text-teal-400" />
          Filter
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="p-0 border-gray-200 shadow-lg w-96"
        align="start"
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <FilterIcon className="h-4 w-4 text-teal-400" />
            <span className="font-medium">Filter</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-gray-400 hover:text-gray-600"
            onClick={() => setOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex">
          {/* Left side filter categories */}
          <div className="w-1/2 border-r border-gray-100">
            <div className="p-3 hover:bg-gray-50 cursor-pointer">
              <p className="text-sm text-teal-500">Filter by Location</p>
            </div>
            <div className="p-3 hover:bg-gray-50 cursor-pointer">
              <p className="text-sm font-medium">Filter by Ratings</p>
            </div>
          </div>

          {/* Right side filter options */}
          <div className="w-1/2 p-4 space-y-4">
            <div>
              <Input
                placeholder="Enter Your Location"
                value={localLocation}
                onChange={(e) => setLocalLocation(e.target.value)}
                className="text-sm"
              />

              {locations.length > 0 && (
                <div className="mt-2 max-h-24 overflow-y-auto">
                  {locations.map((location, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded cursor-pointer"
                      onClick={() => setLocalLocation(location)}
                    >
                      {localLocation === location && (
                        <Check className="h-4 w-4 text-teal-500" />
                      )}
                      <span
                        className={`text-sm ${localLocation === location ? "text-teal-500" : "text-gray-600"}`}
                      >
                        {location}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="mb-2 flex justify-between text-xs">
                <span>0 stars</span>
                <span>5 stars</span>
              </div>
              <Slider
                min={0}
                max={5}
                step={0.5}
                value={[localRating]}
                onValueChange={(values) => setLocalRating(values[0])}
                className="py-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum rating: {localRating} stars
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-between p-4 border-t border-gray-100">
          <Button
            variant="outline"
            size="sm"
            onClick={resetFilters}
            className="text-gray-600"
          >
            Reset
          </Button>
          <Button
            size="sm"
            onClick={applyFilters}
            className="bg-teal-500 hover:bg-teal-600"
          >
            Apply Filters
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default FilterPopover;
