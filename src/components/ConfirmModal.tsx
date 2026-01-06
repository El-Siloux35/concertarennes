import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();

  const buttons = (
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
  );

  // Mobile: Drawer from bottom
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="p-6">
          <DrawerHeader className="text-center p-0">
            <DrawerTitle className="text-primary text-xl font-semibold text-center">
              {title}
            </DrawerTitle>
            <DrawerDescription className="text-primary/70 text-center mt-2">
              {description}
            </DrawerDescription>
          </DrawerHeader>
          {buttons}
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop: Centered dialog
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] p-6 pt-12">
        <DialogHeader className="text-center">
          <DialogTitle className="text-primary text-xl font-semibold text-center">
            {title}
          </DialogTitle>
          <DialogDescription className="text-primary/70 text-center mt-2">
            {description}
          </DialogDescription>
        </DialogHeader>
        {buttons}
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmModal;
