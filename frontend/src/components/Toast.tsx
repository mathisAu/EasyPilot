import { FileCheck2 } from 'lucide-react';

interface ToastProps {
  message: string;
}

export function Toast({ message }: ToastProps) {
  return (
    <div className="toast" role="status">
      <FileCheck2 size={17} />
      {message}
    </div>
  );
}
