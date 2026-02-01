import { Frown } from "lucide-react";

interface EmptyStateProps {
  message?: string;
}

const EmptyState = ({ message = "Pas de concert à afficher :(" }: EmptyStateProps) => {
  return (
    <div className="mx-6 border-2 border-dashed border-primary rounded-xl p-6 flex flex-col items-center justify-center text-center animate-fade-in">
      <Frown size={32} strokeWidth={1.5} className="text-primary mb-3" />
      <p className="text-primary text-sm font-medium">{message}</p>
    </div>
  );
};

export default EmptyState;
