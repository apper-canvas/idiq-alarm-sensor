import { forwardRef } from 'react';
import { cn } from '@/utils/cn';

const Select = forwardRef(({ 
  className, 
  children,
  error = false,
  disabled = false,
  ...props 
}, ref) => {
  const baseStyles = "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors";
  
  const variants = {
    default: "focus:border-secondary focus:ring-secondary/50",
    error: "border-error focus:border-error focus:ring-error/50"
  };

  return (
    <select
      ref={ref}
      className={cn(
        baseStyles,
        error ? variants.error : variants.default,
        disabled && "bg-gray-50",
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </select>
  );
});

Select.displayName = "Select";

export default Select;