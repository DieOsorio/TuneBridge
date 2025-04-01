
const MusicInfo = ({ instrument, is_singer, is_composer }) => {
  // Verificar si hay alguna información de música disponible
  if (!instrument && !is_singer && !is_composer) {
    return null; // Si no hay datos, no renderiza nada
  }
  return (
    <div className="p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-center">Información Musical</h2>
      
      {instrument && (
        <p className="text-lg"><strong>Instrumento: </strong>{instrument}</p>
      )}
      
      {is_singer && (
        <p className="text-lg"><strong>Cantante: </strong>Sí</p>
      )}
      
      {is_composer && (
        <p className="text-lg"><strong>Compositor: </strong>Sí</p>
      )}
    </div>
  );
};

export default MusicInfo;
