import { Button, CircularProgress, Typography } from '@material-ui/core';
import UploadIcon from '@material-ui/icons/CloudUpload';
import * as React from 'react';
import { useState } from 'react';
import FileUpload from './FileUpload';

interface FileUploadButtonProps {
  children: React.ReactNode;
  accept?: string;
  multiple?: boolean;
  onUpload: (file: FileList) => Promise<void>;
}

export default function FileUploadButton(props: FileUploadButtonProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { children, onUpload, ...uploadProps } = props;

  async function onChange(files: FileList) {
    const upload = onUpload(files);
    setIsUploading(true);
    try {
      await upload;
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <FileUpload onChange={onChange} {...uploadProps}>
      <Button size="small" component="span" variant="outlined" disabled={isUploading}>
        {isUploading ? <CircularProgress color="inherit" size={16} /> : <UploadIcon color="inherit" />}
        <Typography>{children}</Typography>
      </Button>
    </FileUpload>
  );
}
