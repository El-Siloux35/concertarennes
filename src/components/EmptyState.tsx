import { SadIcon } from "@/components/icons/SadIcon";

interface EmptyStateProps {
  message?: string;
}

const EmptyState = ({ message = "Pas de concert à afficher :(" }: EmptyStateProps) => {
  return (
    <div className="w-full border-2 border-dashed border-primary rounded-xl p-6 flex flex-col items-center justify-center text-center animate-fade-in">
      <SadIcon size={32} className="mb-3 text-primary" aria-hidden />
      <p className="text-primary text-sm font-medium">{message}</p>
    </div>
  );
};

export default EmptyState;
