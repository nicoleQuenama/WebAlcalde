/**
 * Filtro de lenguaje para el Buzón Ciudadano.
 *
 * Lista local (español > inglés) con normalización de tildes y leet-speak
 * ("p3nd3j0" → "pendejo"). La validación real ocurre en el servidor
 * (src/pages/api/buzon.ts); el navegador usa la misma función solo para
 * avisar antes de enviar. Ampliá PALABRAS_INAPROPIADAS cuando detectes
 * términos nuevos: con que sumes la palabra en texto plano alcanza.
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
  'puta', 'puto', 'putas', 'putos', 'putazo', 'putazo', 'putear', 'putero', 'putita',
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
 * Devuelve la palabra prohibida encontrada (en forma normalizada), o `null`
 * si el texto pasa el filtro. Rechaza por límite de palabra ("puta" dentro
 * de "computadora" NO se cuenta, "p e n d e j o" SÍ).
 */
export function detectarPalabraInapropiada(texto: string): string | null {
  const t = normalizar(texto);
  if (t.length < 3) return null;
  for (const { palabra, re } of PALABRAS_NORMALIZADAS) {
    if (re.test(t)) return palabra;
  }
  return null;
}