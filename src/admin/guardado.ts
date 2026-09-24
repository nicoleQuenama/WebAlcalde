import type { EditorContexto } from '@type/cms/editorContext';
import { construirOriginales } from './helpers';

/**
 * Persistencia del editor CMS: guarda el estado completo (layouts, secciones
 * `single` y listas) vía `/api/admin/contenido/<dominio>`. Todos los dominios
 * cambian al mismo tiempo; si algo falla se reporta en la barra de estado y no
 * se recarga el iframe, para no perder el trabajo ya hecho.
 * Extraído de `editorApp` para que la orquestación quede como composición.
 */

async function llamarApi(secreto: string, metodo: 'POST' | 'DELETE', dominio: string, body: Record<string, unknown>): Promise<boolean> {
  try {
    const res = await fetch(`/api/admin/contenido/${dominio}`, {
      method: metodo,
      headers: { 'Content-Type': 'application/json', 'X-Admin-Secret': secreto },
      body: JSON.stringify(body),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function guardarTodo(ctx: EditorContexto): Promise<void> {
  const { cache, estadoEl, iframe, secreto } = ctx;
  estadoEl.textContent = 'Guardando…';
  estadoEl.className = 'cms-estado';
  const tareas: Promise<boolean>[] = [];

  for (const estado of cache.values()) {
    const { datos, originales } = estado;
    datos.ordenLayout.forEach((key, i) => {
      tareas.push(llamarApi(secreto, 'POST', datos.pagina.layoutDominio, { clave: key, data: {}, orden: i }));
    });
    for (const sec of datos.secciones) {
      if (sec.tipo === 'single' && sec.dominio) {
        tareas.push(llamarApi(secreto, 'POST', sec.dominio, { clave: 'principal', data: sec.valor ?? {}, orden: 0 }));
      } else if (sec.tipo === 'lista' && sec.dominio) {
        const items = sec.items ?? [];
        items.forEach((it, i) => tareas.push(llamarApi(secreto, 'POST', sec.dominio!, { clave: it.clave, data: it.data, orden: i })));
        const actuales = new Set(items.map((i) => i.clave));
        for (const claveVieja of originales.get(sec.dominio) ?? []) {
          if (!actuales.has(claveVieja)) tareas.push(llamarApi(secreto, 'DELETE', sec.dominio, { clave: claveVieja }));
        }
      }
    }
  }

  const resultados = await Promise.all(tareas);
  const huboError = resultados.some((ok) => !ok);
  for (const estado of cache.values()) estado.originales = construirOriginales(estado.datos);

  if (huboError) {
    estadoEl.textContent = 'Error al guardar — reintentá';
    estadoEl.className = 'cms-estado cms-estado--error';
    return;
  }
  ctx.hayCambiosSinGuardar = false;
  estadoEl.textContent = 'Todo guardado';
  estadoEl.className = 'cms-estado';
  iframe.contentWindow?.location.reload();
}