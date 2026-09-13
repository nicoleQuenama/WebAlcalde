/**
 * Filtro de lenguaje para el Buzón Ciudadano.
 *
 * Lista local (español > inglés) con normalización de tildes y leet-speak
 * ("p3nd3j0" → "pendejo"). Además de la coincidencia exacta con límite de
 * palabra, el filtro detecta:
 *   - errores de tipeo ("pendeji" → "pendejo", por distancia de edición);
 *   - letras separadas a propósito ("p e n d e j o").
 *
 * La validación real ocurre en el servidor (src/pages/api/buzon.ts); el
 * navegador usa la misma función solo para avisar antes de enviar. Ampliá
 * PALABRAS_INAPROPIADAS cuando detectes términos nuevos: con que sumes la
 * palabra en texto plano alcanza.
 */

const LEET: Record<string, string> = {
  '4': 'a',
  '@': 'a',
  '3': 'e',
  '1': 'i',
  '!': 'i',
  '0': 'o',
  '5': 's',
  '$': 's',
  '7': 't',
};

const ACENTOS: Record<string, string> = {
  á: 'a', à: 'a', ä: 'a', â: 'a', ã: 'a',
  é: 'e', è: 'e', ë: 'e', ê: 'e',
  í: 'i', ì: 'i', ï: 'i', î: 'i',
  ó: 'o', ò: 'o', ö: 'o', ô: 'o', õ: 'o',
  ú: 'u', ù: 'u', ü: 'u', û: 'u',
  ñ: 'n',
};

const ACENTO_RE = /[áàäâãéèëêíìïîóòöôõúùüûñ]/g;

function quitarAcentos(texto: string): string {
  return texto.replace(ACENTO_RE, (c) => ACENTOS[c] ?? c);
}

/**
 * Normaliza un texto para compararlo contra la lista:
 * minúsculas, sin tildes, leet → letras y signos → espacios (conserva los
 * espacios para que el límite de palabra funcione), y colapsa letras
 * repetidas ("pendejoooo" → "pendejo").
 */
export function normalizar(texto: string): string {
  return quitarAcentos(texto.toLowerCase())
    .replace(/[^a-z0-9]+/g, ' ')  // todo lo que no es letra/número pasa a ser un espacio
    .replace(/[a-z0-9]/g, (c) => LEET[c] ?? c)
    .replace(/(.)\1+/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

export const PALABRAS_INAPROPIADAS: string[] = [
  // ── Español (incluye modismos bolivianos y latinoamericanos) ──
  'mierda', 'mrda', 'mierdas',
  'pendejo', 'pendeja', 'pendejos', 'pendejas',
  'puta', 'puto', 'putas', 'putos', 'putazo', 'putear', 'putero', 'putita',
  'hijueputa', 'hijuep', 'hpta',
  'verga', 'vergado', 'pija', 'pijas', 'pijazo',
  'carajo', 'coño', 'cojones', 'cojudo', 'cojuda',
  'culo', 'culero', 'culera',
  'joder', 'jodido', 'jodida', 'jodidos', 'jodidas',
  'cabron', 'cabrona', 'cabrones',
  'maricon', 'maricona', 'maricones',
  'huevon', 'huevona', 'huevones',
  'zorra', 'zorras',
  'imbecil', 'imbeciles', 'estupido', 'estupida', 'estupidos', 'estupidas',
  'idiota', 'idiotas', 'tarado', 'tarada',
  'gilipollas',
  'sorete',
  'pajero', 'pajera',
  'conchetumare', 'conchesumare',
  'malparido', 'malparida', 'malparidos',
  'weon', 'weona', 'weones', 'webon', 'webona',
  'cagada', 'cagado', 'cagaste', 'cagar',
  'chingada', 'chingado', 'chingar', 'chinga',
  'chupapija', 'chupaverga', 'mamapichas', 'comemierda',
  // ── Inglés ──
  'fuck', 'fucker', 'fucking',
  'shit', 'bullshit',
  'bitch', 'motherfucker',
  'bastard',
  'asshole', 'dick', 'dickhead', 'cock', 'pussy',
  'faggot',
];

const PALABRAS_NORMALIZADAS: { palabra: string; re: RegExp }[] = PALABRAS_INAPROPIADAS
  .map(normalizar)
  .filter((p) => p.length >= 3)
  .map((palabra) => ({ palabra, re: new RegExp(`\\b${escapeRegExp(palabra)}\\b`) }));

function escapeRegExp(texto: string): string {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Distancia de edición entre `a` y `b` (Damerau–Levenshtein), con corto
 * cálculo si la distancia mínima supera `umbral`. Devuelve true si la
 * distancia real es ≤ `umbral`.
 */
function distanciaEdicion(a: string, b: string, umbral: number): boolean {
  if (Math.abs(a.length - b.length) > umbral) return false;
  if (a.length > b.length) [a, b] = [b, a];
  const m = a.length;
  const n = b.length;
  let filaPrevia = Array.from({ length: m + 1 }, (_, i) => i);
  for (let j = 1; j <= n; j++) {
    const fila = new Array<number>(m + 1);
    fila[0] = j;
    let minimo = fila[0];
    for (let i = 1; i <= m; i++) {
      const costo = a[i - 1] === b[j - 1] ? 0 : 1;
      fila[i] = Math.min(
        fila[i - 1] + 1,             // borrar
        filaPrevia[i] + 1,           // insertar
        filaPrevia[i - 1] + costo,   // sustituir
      );
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        fila[i] = Math.min(fila[i], filaPrevia[i - 2] + 1); // transposición
      }
      if (fila[i] < minimo) minimo = fila[i];
    }
    if (minimo > umbral) return false;
    filaPrevia = fila;
  }
  return filaPrevia[m] <= umbral;
}

/**
 * Devuelve la palabra prohibida encontrada (en forma normalizada), o `null`
 * si el texto pasa el filtro. Rechaza por límite de palabra ("puta" dentro
 * de "computadora" NO se cuenta, "p e n d e j o" SÍ). Tolerante a errores de
 * tipeo: "pendeji" cuenta como "pendejo".
 */
export function detectarPalabraInapropiada(texto: string): string | null {
  const t = normalizar(texto);
  if (t.length < 3) return null;

  // 1) Coincidencia exacta con límite de palabra.
  for (const { palabra, re } of PALABRAS_NORMALIZADAS) {
    if (re.test(t)) return palabra;
  }

  // 2) Errores de tipeo: un token del texto "se parece" a una prohibida.
  //    Umbral proporcional (máx. 2) para no marcar palabras legítimas.
  for (const token of t.split(' ')) {
    if (token.length < 3) continue;
    for (const { palabra } of PALABRAS_NORMALIZADAS) {
      const umbral = Math.max(1, Math.min(2, Math.floor(palabra.length / 3)));
      if (distanciaEdicion(token, palabra, umbral)) return palabra;
    }
  }

  // 3) Letras separadas a propósito ("p e n d e j o" → compactado "pendejo").
  const compacto = t.replace(/\s+/g, '');
  for (const { palabra } of PALABRAS_NORMALIZADAS) {
    if (palabra.length >= 5 && compacto.includes(palabra)) return palabra;
  }

  return null;
}