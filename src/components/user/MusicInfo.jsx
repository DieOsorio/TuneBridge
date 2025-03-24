
const MusicInfo = ({ instrument, is_singer, is_composer }) => {
  // Verificar si hay alguna información de música disponible
  if (!instrument && !is_singer && !is_composer) {
    return null; // Si no hay datos, no renderiza nada
  }

  return (
    <div className="music-info">
      <h2>Información Musical</h2>
      
      {instrument && (
        <p><strong>Instrumento: </strong>{instrument}</p>
      )}
      
      {is_singer && (
        <p><strong>Cantante: </strong>Sí</p>
      )}
      
      {is_composer && (
        <p><strong>Compositor: </strong>Sí</p>
      )}
    </div>
  );
};

export default MusicInfo