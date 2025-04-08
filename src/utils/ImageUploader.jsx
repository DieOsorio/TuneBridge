import { useState } from 'react';
import { FilePond, registerPlugin } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';

// Registrar el plugin
registerPlugin(FilePondPluginImagePreview);

const ImageUploader = ({ onFilesUpdate, amount }) => {
  const [files, setFiles] = useState([]);

  // Esta función se ejecuta cuando las imágenes son actualizadas (subidas, eliminadas, etc)
  const handleUpdateFiles = (fileItems) => {
    // Convertir los elementos en un arreglo de archivos
    const newFiles = fileItems.map(fileItem => fileItem.file);
    setFiles(newFiles);
    onFilesUpdate(newFiles); // Llamar a la prop para pasar los archivos al componente padre
  };

  return (
    <div>
      <FilePond
        files={files}
        onupdatefiles={handleUpdateFiles}
        allowMultiple={true}    // Permite múltiples archivos
        maxFiles={amount}            // Limita a 3 archivos
        name="images"           // Nombre del campo para el envío del formulario
        labelIdle='Arrastrá las imágenes o hacé click para seleccionar'
      />
    </div>
  );
};

export default ImageUploader;
