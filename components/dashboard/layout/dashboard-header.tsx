// components/dashboard/dashboard-header.tsx
import { LucideIcon } from "lucide-react";

interface DashboardHeaderProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

export function DashboardHeader({ title, description, icon: Icon }: DashboardHeaderProps) {
  return (
    <div className="flex justify-between items-start mb-8">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Icon className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        </div>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}