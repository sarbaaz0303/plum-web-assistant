import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { SendIcon } from "lucide-react";

interface TextareaProps extends React.ComponentProps<"textarea"> {
 maxLength?: number;
 showCount?: boolean;
 onSend?: (value: string) => void;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
 ({ className, maxLength, showCount = false, onSend, ...props }, ref) => {
  const value = String(props.value) || "";
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const combinedRef = useCombinedRefs(ref, textareaRef);

  // Auto-resize functionality
  const handleResize = React.useCallback(() => {
   const textarea = textareaRef.current;
   if (!textarea) return;

   textarea.style.height = "auto";
   textarea.style.height = `${textarea.scrollHeight}px`;
  }, []);

  React.useEffect(() => {
   handleResize();
   window.addEventListener("resize", handleResize);
   return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
   if (props.onChange) {
    props.onChange(e);
   }
   handleResize();
  };

  const handleSend = () => {
   if (value.trim() && onSend) {
    onSend(value);
    if (textareaRef.current) {
     textareaRef.current.style.height = "auto";
    }
   }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
   if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    handleSend();
   }
   props.onKeyDown?.(e);
  };

  return (
   <div className="relative w-full">
    <textarea
     className={cn(
      "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
      maxLength && "pr-16",
      className
     )}
     ref={combinedRef}
     maxLength={maxLength}
     aria-label={props["aria-label"] || "Message input"}
     onKeyDown={handleKeyDown}
     {...props}
    />

    {showCount && maxLength && (
     <div className="absolute bottom-2 left-2 text-xs text-muted-foreground">
      {textareaRef.current?.value.length || 0}/{maxLength}
     </div>
    )}

    <Button
     type="submit"
     variant="ghost"
     aria-label="Send message"
     disabled={props.disabled}
     className="absolute right-0 bottom-0 transform text-muted-foreground hover:text-foreground hover:bg-accent cursor-pointer px-1 py-1">
     <SendIcon size={16} />
    </Button>
   </div>
  );
 }
);

// Utility function to combine refs
function useCombinedRefs<T>(...refs: (React.Ref<T> | null | undefined)[]) {
 const targetRef = React.useRef<T>(null);

 React.useEffect(() => {
  refs.forEach((ref) => {
   if (!ref) return;

   if (typeof ref === "function") {
    ref(targetRef.current);
   } else {
    (ref as React.MutableRefObject<T | null>).current = targetRef.current;
   }
  });
 }, [refs]);

 return targetRef;
}

Textarea.displayName = "Textarea";

export { Textarea };
