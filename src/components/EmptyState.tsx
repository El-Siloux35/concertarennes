import { Frown } from "lucide-react";

const EmptyState = () => {
  return (
    <div className="border-2 border-dashed border-primary rounded-2xl p-8 flex flex-col items-center justify-center text-center animate-fade-in">
      <Frown size={48} strokeWidth={1} className="text-primary mb-4" />
      <p className="font-mono text-primary text-sm">
        Il n'y a pas plus de
        <br />
        concerts à afficher :(
      </p>
    </div>
  );
};

export default EmptyState;
