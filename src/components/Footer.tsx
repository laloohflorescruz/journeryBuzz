import { useTranslation } from 'react-i18next';

// Pie del panel: discreto y del mismo lenguaje visual que el resto (slate).
// Antes era un pie de sitio público (4 columnas, redes sociales, estrellas) que
// repetía la navegación del menú lateral; aquí solo hace falta la firma.
// El layout lo empuja al fondo con mt-auto, así que también queda bien en
// pantallas con poco contenido.

function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="mt-auto border-t border-slate-200 bg-white px-4 py-4 md:px-6">
      <div className="flex flex-col items-center justify-between gap-1 text-xs text-slate-400 sm:flex-row">
        <p>
          © {new Date().getFullYear()} Backpacking Buzz. {t('footer.rights')}
        </p>
        <p>Panel de administración</p>
      </div>
    </footer>
  );
}

export default Footer;
