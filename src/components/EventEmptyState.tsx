import catPng from "@/assets/cat.png";
import catWebp from "@/assets/cat.webp?url";

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
      <picture className="flex justify-center mb-4">
        <source srcSet={catWebp} type="image/webp" />
        <img src={catPng} alt="" className="h-[200px] w-auto object-contain mx-auto" aria-hidden />
      </picture>
      <p className="text-primary text-sm font-medium">{text}</p>
    </div>
  );
};

export default EventEmptyState;
