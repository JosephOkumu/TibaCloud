
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

const FeatureCard = ({ title, description, icon: Icon }: FeatureCardProps) => {
  return (
    <Card className="feature-card border-t-4 border-t-primary-blue shadow-sm hover:shadow-md transition-all duration-300">
      <CardContent className="p-6">
        <h3 className="text-xl font-semibold text-primary-blue mb-3 flex items-center gap-2 relative inline-block">
          <Icon className="h-5 w-5" /> {title}
        </h3>
        <p>{description}</p>
      </CardContent>
    </Card>
  );
};

export default FeatureCard;
