import { formatarTimeParaExibicao } from '../utils/fixtures';

export const ResultPreview = ({ texto }) => {
  const textoVisual = texto
    .split('\n')
    .map((linha) => formatarTimeParaExibicao(linha))
    .join('\n');

  const copiar = () => {
    navigator.clipboard.writeText(texto);
    alert("Resultado copiado para a área de transferência!");
  };

  return (
    <section className="preview-section">
      <div className="preview-sticky">
        <div className="preview-header">
          <span>Resultado Formatado</span>
          <button className="copy-button" onClick={copiar}>Copiar</button>
        </div>
        <div className="preview-box">
          <pre>{textoVisual}</pre>
        </div>
      </div>
    </section>
  );
};
