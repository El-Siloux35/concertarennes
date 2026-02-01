import sadIcon from "@/assets/sad.svg";

interface EmptyStateProps {
  message?: string;
}

const EmptyState = ({ message = "Pas de concert à afficher :(" }: EmptyStateProps) => {
  return (
    <div className="w-full border-2 border-dashed border-primary rounded-xl p-6 flex flex-col items-center justify-center text-center animate-fade-in">
      <img src={sadIcon} alt="" className="w-8 h-8 mb-3" aria-hidden />
      <p className="text-primary text-sm font-medium">{message}</p>
    </div>
  );
};

export default EmptyState;
