# Biblia — App de lectura y estudio (PWA para iPad Safari)

## Qué es esto
Un lector bíblico con **varias versiones en español** (RVR1960, RVR1909, y todas las que existan en la API en el momento), navegación completa por libro/capítulo, comparación de versiones lado a lado, búsqueda global, favoritos, y modo sin conexión — pensado para que en el iPad se agregue a la pantalla de inicio y se sienta como app nativa, aunque solo se abra un link en Safari.

## Por qué no incluí el texto bíblico "hardcodeado"
El texto de versiones como RVR1960 o NVI tiene derechos de autor vigentes (Sociedades Bíblicas Unidas, Biblica, etc.). En vez de copiar el texto dentro del código, la app **consulta en vivo la API pública de Bolls Bible** (`bolls.life/api`, sin necesidad de API key) y cachea cada capítulo que el usuario visita para que quede disponible sin conexión después. Así el proyecto es 100% legal para publicar y no depende de que yo reproduzca el contenido de la Biblia.

Si prefieres una versión 100% de dominio público sin depender de ninguna API externa (por ejemplo Reina-Valera 1909 completa), puedo generar esa variante como siguiente paso: implicaría un archivo de datos más grande (~4-5 MB de texto) pero cero dependencia de internet.

## Archivos
```
biblia-app/
├── index.html        ← la app completa (UI + lógica)
├── manifest.json      ← metadata para "Agregar a inicio" en iPad
├── sw.js               ← service worker (caché offline)
└── icons/
    ├── apple-touch-icon.png
    ├── icon-192.png
    └── icon-512.png
```

## Cómo publicarlo (ideal con Firebase Hosting, ya que lo usas en Yabi Store)
```bash
firebase init hosting     # elige esta carpeta como "public"
firebase deploy --only hosting
```
También funciona igual de bien en GitHub Pages, Netlify o cualquier hosting estático — son solo archivos planos servidos por HTTPS (el Service Worker y "Agregar a inicio" en Safari **requieren HTTPS**, no funcionan sobre `http://` salvo `localhost`).

## Cómo instalarlo en el iPad
1. Abre el link en Safari (no en Chrome — Safari es el único navegador en iOS que permite instalar PWAs).
2. Toca el ícono de Compartir → **"Agregar a pantalla de inicio"**.
3. Ábrelo desde el ícono nuevo: se ve a pantalla completa, sin barra de Safari, como una app nativa.

## Funciones incluidas
- **Versiones dinámicas**: el selector se llena automáticamente con lo que la API tenga disponible en español (y otros idiomas como respaldo), sin necesidad de tocar el código si la API agrega versiones nuevas.
- **Comparar versiones**: dos columnas lado a lado del mismo capítulo.
- **Búsqueda**: dentro del capítulo actual (instantánea) y búsqueda global en toda la Biblia (vía API).
- **Favoritos**: guarda versículos localmente (localStorage), con acceso rápido desde el menú.
- **Compartir/copiar versículo**: usa el share sheet nativo de iOS cuando está disponible.
- **Modo sin conexión**: cada capítulo leído se guarda en caché (Cache Storage) y sigue disponible sin internet; se muestra un aviso cuando estás offline.
- **Gestos táctiles**: desliza izquierda/derecha sobre el texto para cambiar de capítulo — pensado para uso con el dedo en iPad.
- **3 temas** (oscuro / sepia / claro) y control de tamaño de letra, con persistencia entre sesiones.
- **Diseño responsive**: se adapta a iPad en horizontal, vertical, y también a iPhone/desktop.

## Posibles siguientes pasos
- Plan de lectura anual con seguimiento de progreso.
- Notas personales por versículo (ya tienes el patrón de localStorage listo para extenderlo).
- Sincronizar favoritos/notas entre dispositivos usando Firebase (Firestore), aprovechando lo que ya tienes en Yabi Store.
- Versión 100% offline desde el primer uso (sin depender de la API) empaquetando una traducción de dominio público completa.
