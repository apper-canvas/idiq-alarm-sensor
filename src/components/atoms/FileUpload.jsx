import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';

const FileUpload = ({ 
  onFileSelect, 
  accept = ".pdf,.doc,.docx,.jpg,.jpeg,.png",
  maxSize = 10 * 1024 * 1024, // 10MB
  multiple = false,
  className,
  children,
  disabled = false
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    if (file.size > maxSize) {
      return `File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`;
    }

    const acceptedTypes = accept.split(',').map(type => type.trim());
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!acceptedTypes.includes(fileExtension)) {
      return `File type not supported. Accepted types: ${accept}`;
    }

    return null;
  };

  const handleFiles = async (selectedFiles) => {
    const fileArray = Array.from(selectedFiles);
    const validFiles = [];
    const errors = [];

    fileArray.forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push({ file: file.name, error });
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      // In a real app, you'd show these errors via toast
      console.warn('File validation errors:', errors);
    }

    if (validFiles.length > 0) {
      setFiles(prev => multiple ? [...prev, ...validFiles] : validFiles);
      setUploading(true);
      
      try {
        const uploadPromises = validFiles.map(file => 
          onFileSelect(file).then(result => ({ file, result }))
        );
        
        await Promise.all(uploadPromises);
      } catch (error) {
        console.error('Upload error:', error);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(false);
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e) => {
    if (!disabled) {
      handleFiles(e.target.files);
    }
  };

  const openFileDialog = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn("space-y-4", className)}>
      <motion.div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer",
          isDragOver ? "border-secondary bg-secondary/5" : "border-gray-300",
          disabled && "opacity-50 cursor-not-allowed",
          "hover:border-secondary hover:bg-secondary/5"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
        whileHover={!disabled ? { scale: 1.01 } : {}}
        whileTap={!disabled ? { scale: 0.99 } : {}}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled}
        />

        <div className="text-center">
          <motion.div
            animate={uploading ? { rotate: 360 } : { rotate: 0 }}
            transition={{ duration: 1, repeat: uploading ? Infinity : 0 }}
          >
            <ApperIcon 
              name={uploading ? "Loader2" : "Upload"} 
              className="w-8 h-8 text-gray-400 mx-auto mb-2" 
            />
          </motion.div>
          
          {children || (
            <>
              <p className="text-sm text-gray-600 mb-2">
                {uploading ? "Uploading files..." : "Drop files here or click to browse"}
              </p>
              <p className="text-xs text-gray-400">
                Accepted formats: {accept}
                <br />
                Max size: {Math.round(maxSize / (1024 * 1024))}MB
              </p>
            </>
          )}
        </div>

        {isDragOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-secondary/10 rounded-lg flex items-center justify-center"
          >
            <p className="text-secondary font-medium">Drop files here</p>
          </motion.div>
        )}
      </motion.div>

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            {files.map((file, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <ApperIcon name="File" className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  disabled={uploading}
                >
                  <ApperIcon name="X" className="w-4 h-4" />
                </Button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FileUpload;