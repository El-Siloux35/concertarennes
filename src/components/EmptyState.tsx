import { Frown } from "lucide-react";

interface EmptyStateProps {
  message?: string;
}

const EmptyState = ({ message = "Pas de concert à afficher :(" }: EmptyStateProps) => {
  return (
    <div className="mx-6 border-2 border-dashed border-primary rounded-2xl p-8 flex flex-col items-center justify-center text-center animate-fade-in">
      <Frown size={40} strokeWidth={1.5} className="text-primary mb-4" />
      <p className="text-primary text-sm">{message}</p>
    </div>
  );
};

export default EmptyState;
