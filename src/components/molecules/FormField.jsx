import { forwardRef } from 'react';
import Label from '@/components/atoms/Label';
import Input from '@/components/atoms/Input';
import { cn } from '@/utils/cn';

const FormField = forwardRef(({ 
  label,
  error,
  required = false,
  className,
  children,
  ...props 
}, ref) => {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label required={required} error={!!error}>
          {label}
        </Label>
      )}
      {children || <Input ref={ref} error={!!error} {...props} />}
      {error && (
        <p className="text-sm text-error">{error}</p>
      )}
    </div>
  );
});

FormField.displayName = "FormField";

export default FormField;