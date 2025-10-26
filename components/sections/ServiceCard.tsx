import { LucideIcon } from 'lucide-react';

interface ServiceCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  id?: string;
}

export default function ServiceCard({ icon: Icon, title, description, id }: ServiceCardProps) {
  return (
    <div
      id={id}
      className="relative rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
    >
      <div className="mb-4 inline-flex rounded-lg bg-blue-100 p-3 text-blue-700">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}
