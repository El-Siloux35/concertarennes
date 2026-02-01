import { CalendarX } from "lucide-react";

const EventEmptyState = () => {
  return (
    <div className="border-2 border-dashed border-primary rounded-xl p-6 flex flex-col items-center justify-center text-center animate-fade-in">
      <CalendarX size={32} strokeWidth={1.5} className="text-primary mb-3" />
      <p className="text-primary text-sm font-medium">
        Vous n'avez pas encore
        <br />
        créé d'évènement
      </p>
    </div>
  );
};

export default EventEmptyState;
