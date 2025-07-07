import { forwardRef } from 'react';
import { cn } from '@/utils/cn';

const Label = forwardRef(({ 
  className,
  required = false,
  error = false,
  children,
  ...props 
}, ref) => {
  return (
    <label
      ref={ref}
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        error ? "text-error" : "text-gray-700",
        className
      )}
      {...props}
    >
      {children}
      {required && (
        <span className="ml-1 text-error">*</span>
      )}
    </label>
  );
});

Label.displayName = "Label";

export default Label;