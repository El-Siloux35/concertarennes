import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  variant?: "default" | "destructive";
}

const ConfirmModal = ({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirmer",
  cancelText = "Annuler",
  onConfirm,
  variant = "default",
}: ConfirmModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="fixed bottom-0 left-0 right-0 top-auto translate-y-0 translate-x-0 rounded-t-3xl rounded-b-none border-none bg-background p-6 data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom data-[state=closed]:animate-out data-[state=open]:animate-in duration-300 max-w-none mx-0 sm:mx-0">
        <DialogHeader className="text-center">
          <DialogTitle className="text-primary text-xl font-semibold text-center">
            {title}
          </DialogTitle>
          <DialogDescription className="text-primary/70 text-center mt-2">
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 mt-6">
          <Button
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className={`w-full rounded-full h-14 font-medium ${
              variant === "destructive" 
                ? "bg-destructive text-destructive-foreground" 
                : "bg-primary text-primary-foreground"
            }`}
          >
            {confirmText}
          </Button>
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="w-full rounded-full h-14 font-medium border-2 border-primary text-primary bg-transparent"
          >
            {cancelText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmModal;
