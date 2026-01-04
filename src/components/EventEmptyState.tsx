import { CalendarX } from "lucide-react";

const EventEmptyState = () => {
  return (
    <div className="border-2 border-dashed border-primary rounded-2xl p-8 flex flex-col items-center justify-center text-center animate-fade-in">
      <CalendarX size={40} strokeWidth={1.5} className="text-primary mb-4" />
      <p className="text-primary text-sm">
        Vous n'avez pas encore
        <br />
        créé d'évènement
      </p>
    </div>
  );
};

export default EventEmptyState;
