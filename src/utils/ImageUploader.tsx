import { useState, useRef, useEffect, RefObject  } from "react";
import { FilePond, registerPlugin } from "react-filepond";
import type { FilePondFile, ActualFileObject  } from "filepond";

import "filepond/dist/filepond.min.css";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import { useTranslation } from "react-i18next";

registerPlugin(FilePondPluginImagePreview);

export interface ImageUploaderProps {
  onFilesUpdate: (files: ActualFileObject []) => void;
  amount?: number;
  triggerRef?: RefObject<HTMLButtonElement | HTMLElement | null> | null;
  classForLabel?: string;
  className?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onFilesUpdate,
  amount = 1,
  triggerRef = null,
  classForLabel = "",
  className = "",
}) => {
  const { t } = useTranslation("ui");
  const [files, setFiles] = useState<Blob[]>([]);
  const pondRef = useRef<any>(null);

  const handleUpdateFiles = (fileItems: FilePondFile[]) => {
    const newFiles = fileItems.map((item) => item.file as ActualFileObject);
    setFiles(newFiles);
    onFilesUpdate(newFiles);
  };
  useEffect(() => {
    if (amount === 1 && triggerRef?.current && pondRef.current) {
      const openDialog = () => pondRef.current.browse();
      const triggerEl = triggerRef.current;
      triggerEl.addEventListener("click", openDialog);
      return () => triggerEl.removeEventListener("click", openDialog);
    }
  }, [amount, triggerRef?.current]);

  return (
    <div className={amount === 1 ? "hidden" : ""}>
      <label className={`block font-medium text-sm mb-2 ${classForLabel}`}>
        {t("imageUploader.upload")}
      </label>
      <FilePond
        ref={pondRef}
        files={files}
        onupdatefiles={handleUpdateFiles}
        allowMultiple={amount > 1}
        maxFiles={amount}
        name="images"
        labelIdle={
          amount > 1 ? `${t("imageUploader.drag")} (max ${amount})` : ""
        }
        className={`bg-gray-900 border-2 border-dashed border-gray-600 rounded-lg text-gray-300 ${className}`}
      />
    </div>
  );
};

export default ImageUploader;
