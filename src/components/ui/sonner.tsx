import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="bottom-center"
      duration={3000}
      style={{ bottom: "24px" }}
      toastOptions={{
        classNames: {
          toast:
            "group toast bg-toast-bg text-toast-fg border-none shadow-none rounded-lg",
          description: "text-toast-fg/80",
          actionButton: "bg-toast-fg text-toast-bg",
          cancelButton: "bg-toast-fg/20 text-toast-fg",
        },
        style: {
          transition: "none",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
