
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface AccountCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconBgClass: string;
}

const AccountCard = ({ title, description, icon: Icon, iconBgClass }: AccountCardProps) => {
  return (
    <Card className="text-center shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
      <CardContent className="p-6">
        <div className={iconBgClass}>
          <Icon className="h-8 w-8 text-custom-white" />
        </div>
        <h3 className="text-xl font-semibold text-primary-blue mb-3">{title}</h3>
        <p className="text-sm">{description}</p>
      </CardContent>
    </Card>
  );
};

export default AccountCard;
