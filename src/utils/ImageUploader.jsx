import { useState, useRef, useEffect } from 'react';
import { FilePond, registerPlugin } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import { useTranslation } from 'react-i18next';

// Registrar el plugin
registerPlugin(FilePondPluginImagePreview);

const ImageUploader = ({ onFilesUpdate, amount = 1, triggerRef = null, classForLabel }) => {
  const { t } = useTranslation("ui");
  const [files, setFiles] = useState([]);
  const pondRef = useRef();

  // Manejo de cambios en los archivos
  const handleUpdateFiles = (fileItems) => {
    const newFiles = fileItems.map((fileItem) => fileItem.file);
    setFiles(newFiles);
    onFilesUpdate(newFiles);
  };

  // Si amount es 1 y se recibe un triggerRef, lo usamos para disparar el input
  useEffect(() => {
    if (amount === 1 && triggerRef && triggerRef.current && pondRef.current) {
      const openDialog = () => {
        pondRef.current.browse();
      }
      const triggerEl = triggerRef.current;
      triggerEl.addEventListener('click', openDialog);
      return () => triggerEl.removeEventListener('click', openDialog);
    }
  }, [amount, triggerRef?.current]);

  return (
    <div className={amount === 1 ? 'hidden' : ''}>
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
        labelIdle={amount > 1 ? `${t("imageUploader.drag")} (max ${amount})` : ''}
        style={{
          backgroundColor: '#1a202c',
          border: '2px dashed #4a5568',
          borderRadius: '8px',
          color: '#cbd5e0',
        }}
      />
    </div>
  );
};

export default ImageUploader;
