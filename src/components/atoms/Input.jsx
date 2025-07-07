import { forwardRef } from 'react';
import { cn } from '@/utils/cn';

const Input = forwardRef(({ 
  className, 
  type = 'text', 
  error = false,
  disabled = false,
  ...props 
}, ref) => {
const baseStyles = "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors";
  
  const variants = {
    default: "focus:border-secondary focus:ring-secondary/50",
    error: "border-error focus:border-error focus:ring-error/50",
    time: "focus:border-secondary focus:ring-secondary/50 font-mono"
  };

  return (
    <input
      ref={ref}
      type={type}
className={cn(
        baseStyles,
        error ? variants.error : type === 'number' ? variants.time : variants.default,
        disabled && "bg-gray-50",
        className
      )}
      disabled={disabled}
      {...props}
    />
  );
});

Input.displayName = "Input";

export default Input;