import { useId, useRef } from 'react';

interface FileUploadProps {
  children: React.ReactNode;
  accept?: string;
  multiple?: boolean;
  onChange?: (file: FileList) => void;
}

export default function FileUpload(props: FileUploadProps) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const inputId = `file-upload-${useId()}`;
  const { children, onChange, ...inputProps } = props;

  function onFileSelect() {
    const { current } = fileRef;
    if (current && onChange) {
      onChange(current.files as FileList);
    }
  }

  return (
    <>
      <input
        style={{ display: 'none' }}
        {...inputProps}
        type="file"
        id={inputId}
        onChange={onFileSelect}
        ref={fileRef}
      />
      <label htmlFor={inputId}>{children}</label>
    </>
  );
}
