import {
  useDesvanecidoScroll,
  useScrollY,
  estilosDesvanecido,
  estiloFrase,
} from '../../hooks/useDesvanecidoScroll';
import HeroFacetas from './HeroFacetas';

// ── Editá acá las frases de la secuencia (aparecen una tras otra al hacer scroll) ──
const FRASES = [
  'Cochabamba, la ciudad inteligente',
  'Obras que se ven, gestión que se siente',
];

const FRASE_INICIO = 340; // px de scroll antes de la primera frase (arranca apenas se va el hero)
const FRASE_DURACION = 430; // px de scroll por frase (más corto = se llega antes al contenido)
// El espaciador en HeroManfred.astro debe dar tiempo a que la última frase termine ANTES
// de que #contenido llegue a su zona: ≈ FRASE_INICIO + FRASES.length * FRASE_DURACION + ~200.

export default function HeroManfredAnimado() {
  const progreso = useDesvanecidoScroll(750);
  const scrollY = useScrollY();
  const sLetra = estilosDesvanecido('letra', progreso);
  const sAlcalde = estilosDesvanecido('alcalde', progreso);
  const sBotones = estilosDesvanecido('botones', progreso);
  const sFondo = estilosDesvanecido('fondo', progreso);

  return (
    <>
      {/* MANFRED grande atrás */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[22%] z-[8] flex justify-center overflow-hidden lg:top-[18%]"
        style={sLetra}
      >
        <p
          className="whitespace-nowrap font-black leading-none tracking-[-0.07em] text-purple-800"
          style={{ fontSize: 'clamp(64px, 15vw, 200px)' }}
        >
          MANFRED
        </p>
      </div>

      {/* Tarjetas de facetas — flanquean al alcalde, detrás de él (se desvanecen con él) */}
      <div
        className="pointer-events-none absolute inset-0 z-[9] overflow-hidden"
        style={sAlcalde}
      >
        <HeroFacetas />
      </div>

      {/* Alcalde al medio — NO TOCAR posición. pointer-events-none: deja pasar el click a las tarjetas de atrás */}
      <div
        className="pointer-events-none relative z-10 flex w-full flex-1 justify-center overflow-hidden translate-y-24"
        style={sAlcalde}
      >
        <figure aria-labelledby="alcalde-caption" className="relative flex w-full justify-center">
          <img
            src="/images/alcalde_hero.png"
            alt="Manfred Reyes Villa"
            width={900}
            height={1100}
            className="h-[58vh] w-auto max-w-[100vw] object-cover object-top scale-[1.14] origin-top lg:h-[70vh] xl:h-[74vh] lg:scale-[1.18] drop-shadow-[0_16px_36px_rgba(26,22,37,0.22)]"
            style={{ objectPosition: 'center 12%', clipPath: 'inset(0 0 14% 0)' } as any}
          />
          <figcaption id="alcalde-caption" className="sr-only">
            Manfred Reyes Villa
          </figcaption>
        </figure>
      </div>

      {/* Fondo claro que cubre la imagen antes de que aparezcan las frases */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[3] bg-[#F3F0F7]"
        style={sFondo}
      />

      {/* Eslogan + botones */}
      <div
        className="absolute bottom-[11%] left-1/2 z-20 flex w-full max-w-[94vw] -translate-x-1/2 flex-col items-center gap-4 px-6 lg:bottom-[13%]"
        style={sBotones}
      >
        <p className="text-center text-[13px] font-semibold uppercase tracking-[0.16em] text-[#454ca5] lg:text-[15px] bg-purple-100/80 p-2 rounded-full">
          La ciudad inteligente que Cochabamba merece
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 rounded-full bg-white/80 px-3 py-2 shadow-[0_8px_28px_rgba(26,22,37,0.14)] backdrop-blur border border-white/50">
          <a
            href="#contenido"
            className="inline-flex items-center justify-center rounded-full bg-[#454ca5] px-7 py-2.5 text-[11px] font-bold tracking-[0.14em] uppercase text-white shadow-md"
          >
            Sobre Mí
          </a>
          <a
            href="#gestion"
            className="inline-flex items-center justify-center rounded-full border border-[#454ca5]/20 bg-white px-7 py-2.5 text-[11px] font-bold tracking-[0.14em] uppercase text-[#454ca5]"
          >
            Prensa
          </a>
        </div>
      </div>

      {/* Secuencia de frases al hacer scroll. Van dentro del hero (z-30): cuando #contenido
          sube, lo tapa entero. La ÚLTIMA frase NO se desvanece: se mantiene fija hasta que
          la sección de abajo la cubre al subir. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-[30] overflow-hidden">
        {FRASES.map((frase, i) => {
          const s = estiloFrase(i, scrollY, {
            inicio: FRASE_INICIO,
            duracion: FRASE_DURACION,
            mantener: i === FRASES.length - 1,
          });
          return (
            <div
              key={i}
              className="absolute inset-x-0 top-[20%] flex flex-col items-center px-6 text-center will-change-transform"
              style={{ ...s, transition: 'opacity 120ms linear' }}
            >
              <span className="mb-6 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.42em] text-[#454ca5]/70">
                <span className="h-px w-8 bg-[#454ca5]/40" />
                {String(i + 1).padStart(2, '0')} / {String(FRASES.length).padStart(2, '0')}
                <span className="h-px w-8 bg-[#454ca5]/40" />
              </span>
              <p
                className="font-black uppercase leading-[0.92] tracking-[-0.02em] text-[#581c87] drop-shadow-[0_2px_0_rgba(243,240,247,0.9)]"
                style={{ fontSize: 'clamp(40px, 8vw, 112px)', maxWidth: '15ch' }}
              >
                {frase}
              </p>
            </div>
          );
        })}
      </div>
    </>
  );
}
