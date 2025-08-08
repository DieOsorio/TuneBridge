import { XMarkIcon } from "@heroicons/react/24/solid";

const Modal = ({ children, onClose }: { children: React.ReactNode; onClose: () => void }) => (
  <div 
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
    role="dialog"
    aria-modal="true"
  >
    <div className="p-8 rounded-xl shadow-lg relative w-full max-w-xl min-h-[360px]">
      <button onClick={onClose} className="absolute cursor-pointer top-0 right-0 text-white hover:text-rose-200">
        <XMarkIcon className="w-8" />
      </button>
      {children}
    </div>
  </div>
);

export default Modal;
