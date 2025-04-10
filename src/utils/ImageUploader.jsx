import { useState, useRef, useEffect } from 'react';
import { FilePond, registerPlugin } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';

// Registrar el plugin
registerPlugin(FilePondPluginImagePreview);

const ImageUploader = ({ onFilesUpdate, amount = 1, triggerRef = null }) => {
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
      const openDialog = () => pondRef.current.browse();
      const triggerEl = triggerRef.current;
      triggerEl.addEventListener('click', openDialog);
      return () => triggerEl.removeEventListener('click', openDialog);
    }
  }, [amount, triggerRef]);

  return (
    <div className={amount === 1 ? 'hidden' : ''}>
      <FilePond
        ref={pondRef}
        files={files}
        onupdatefiles={handleUpdateFiles}
        allowMultiple={amount > 1}
        maxFiles={amount}
        name="images"
        labelIdle={amount > 1 ? 'Arrastrá las imágenes o hacé click para seleccionar' : ''}
      />
    </div>
  );
};

export default ImageUploader;
