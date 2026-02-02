import * as SheetPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

const SWIPE_CLOSE_THRESHOLD = 55;
const SWIPE_HANDLE_ZONE_HEIGHT = 56;

const Sheet = SheetPrimitive.Root;

const SheetTrigger = SheetPrimitive.Trigger;

const SheetClose = SheetPrimitive.Close;

const SheetPortal = SheetPrimitive.Portal;

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-[200] bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
    ref={ref}
  />
));
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;

const sheetVariants = cva(
  "fixed z-[201] gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500 pb-[max(1.5rem,env(safe-area-inset-bottom))]",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b rounded-b-2xl data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom:
          "inset-x-0 bottom-0 border-t rounded-t-[24px] pt-14 data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right:
          "inset-y-0 right-0 h-full w-3/4  border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
      },
    },
    defaultVariants: {
      side: "right",
    },
  },
);

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {
  hideCloseButton?: boolean;
  /** Callback when user swipes down (mobile, bottom sheet). Call onOpenChange(false) from parent. */
  onSwipeDown?: () => void;
}

const SheetContent = React.forwardRef<React.ElementRef<typeof SheetPrimitive.Content>, SheetContentProps>(
  ({ side = "right", className, children, hideCloseButton, onSwipeDown, ...props }, ref) => {
    const contentRef = React.useRef<HTMLDivElement>(null);
    const touchStartY = React.useRef(0);
    const touchStartInHandleZone = React.useRef(false);

    const handleTouchStart = React.useCallback(
      (e: React.TouchEvent) => {
        if (side !== "bottom" || !onSwipeDown || !contentRef.current) return;
        const rect = contentRef.current.getBoundingClientRect();
        const y = e.touches[0].clientY;
        touchStartY.current = y;
        touchStartInHandleZone.current = y - rect.top < SWIPE_HANDLE_ZONE_HEIGHT;
      },
      [side, onSwipeDown],
    );

    const handleTouchMove = React.useCallback(
      (e: React.TouchEvent) => {
        if (side !== "bottom" || !onSwipeDown || !touchStartInHandleZone.current) return;
        const deltaY = e.touches[0].clientY - touchStartY.current;
        if (deltaY > SWIPE_CLOSE_THRESHOLD) {
          touchStartInHandleZone.current = false;
          onSwipeDown();
        }
      },
      [side, onSwipeDown],
    );

    const mergedRef = (node: HTMLDivElement | null) => {
      (contentRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    };

    return (
      <SheetPortal>
        <SheetOverlay />
        <SheetPrimitive.Content
          ref={mergedRef}
          className={cn(sheetVariants({ side }), className)}
          onTouchStart={side === "bottom" && onSwipeDown ? handleTouchStart : undefined}
          onTouchMove={side === "bottom" && onSwipeDown ? handleTouchMove : undefined}
          {...props}
        >
          {side === "bottom" && (
            <div className="absolute left-1/2 -translate-x-1/2 top-[10px] w-12 h-1 rounded-full bg-muted flex-shrink-0" aria-hidden />
          )}
          {children}
          {!hideCloseButton && (
            <SheetPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity data-[state=open]:bg-secondary hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </SheetPrimitive.Close>
          )}
        </SheetPrimitive.Content>
      </SheetPortal>
    );
  },
);
SheetContent.displayName = SheetPrimitive.Content.displayName;

const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)} {...props} />
);
SheetHeader.displayName = "SheetHeader";

const SheetFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
);
SheetFooter.displayName = "SheetFooter";

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title ref={ref} className={cn("text-lg font-semibold text-foreground", className)} {...props} />
));
SheetTitle.displayName = SheetPrimitive.Title.displayName;

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
));
SheetDescription.displayName = SheetPrimitive.Description.displayName;

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetOverlay,
  SheetPortal,
  SheetTitle,
  SheetTrigger,
};
