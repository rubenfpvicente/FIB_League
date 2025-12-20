export const ResultPreview = ({ texto }) => {
  const copiar = () => {
    navigator.clipboard.writeText(texto);
    alert("Copiado para o WhatsApp!");
  };

  return (
    <section className="preview-section">
      <div className="preview-sticky">
        <div className="preview-header">
          <span>Resultado Formatado</span>
          <button className="copy-button" onClick={copiar}>Copiar</button>
        </div>
        <div className="preview-box">
          <pre>{texto}</pre>
        </div>
      </div>
    </section>
  );
};