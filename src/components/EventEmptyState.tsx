import sadIcon from "@/assets/sad.svg";

interface EventEmptyStateProps {
  variant?: "upcoming" | "past" | "drafts";
  noAnimation?: boolean;
}

const EventEmptyState = ({ variant = "upcoming", noAnimation = false }: EventEmptyStateProps) => {
  const config = {
    upcoming: {
      text: (
        <>
          Vous n'avez pas encore
          <br />
          créé d'évènement
        </>
      ),
    },
    past: {
      text: "Aucun évènement passé",
    },
    drafts: {
      text: "Aucun brouillon",
    },
  };

  const { text } = config[variant];

  return (
    <div className={`border-2 border-dashed border-primary rounded-xl p-6 flex flex-col items-center justify-center text-center ${noAnimation ? "" : "animate-fade-in"}`}>
      <img src={sadIcon} alt="" className="w-6 h-6 mb-3" aria-hidden />
      <p className="text-primary text-sm font-medium">{text}</p>
    </div>
  );
};

export default EventEmptyState;
