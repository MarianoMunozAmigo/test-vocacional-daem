const SUPABASE_URL = "https://jxsgfytqlrhsodaoaogk.supabase.co";

const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4c2dmeXRxbHJoc29kYW9hb2drIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5NTM4MTQsImV4cCI6MjA5NTUyOTgxNH0.TuTdhInCKECsj0gHyUo1a2HEzwJK0OCJrlX5_EBlOP0";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let respuestasGlobales = [];
let vistaDetalleActual = null;

const OPCION_SIN_PREFERENCIA = "SIN PREFERENCIA DEFINIDA";

const tipoOfertaLiceos = {
  "LICEO MARTA DONOSO ESPEJO": "CH",
  "LICEO CARLOS CONDELL": "MIXTO",
  "LICEO ABATE MOLINA": "CH",
  "LICEO EL SAUCE": "TP",
  "LICEO COMPLEJO EDUCACIONAL JAVIERA CARRERA": "TP",
  "LICEO BICENTENARIO ORIENTE DE TALCA": "CH",
  "LICEO INDUSTRIAL": "TP",
  "LICEO AMELIA COURBIS": "TP",
  "INSTITUTO SUPERIOR DE COMERCIO": "MIXTO",
  "LICEO HECTOR PEREZ BIOTT": "CH",
  "LICEO BICENTENARIO DIEGO PORTALES": "MIXTO"
};

const establecimientos = [
  "ESCUELA HERMANO GUIDO GOOSSENS",
  "ESCUELA JUAN LUIS SANFUENTES",
  "ESCUELA JOSE MANUEL BALMACEDA Y FERNANDEZ",
  "ESCUELA PROSPERIDAD",
  "ESCUELA CARLOS SPANO",
  "ESCUELA LAS ARAUCARIAS",
  "ESCUELA CARLOS SALINAS LAGOS",
  "ESCUELA BASICA",
  "ESCUELA EL EDEN",
  "ESCUELA LA FLORIDA",
  "ESCUELA VILLA LA PAZ",
  "ESCUELA FELIPE CUBILLOS BRILLA EL SOL",
  "ESCUELA AURORA DE CHILE",
  "ESCUELA UNO SAN AGUSTIN",
  "ESCUELA JOSE ABELARDO NUNEZ",
  "LORENZO VAROLI GHERARDI",
  "ESCUELA LAS AMERICAS",
  "ESCUELA COOPERATIVA LIRCAY",
  "ESCUELA COSTANERA",
  "ESCUELA ANTUPEHUEN",
  "ESCUELA ESPERANZA",
  "ESCUELA HUILQUILEMU",
  "ESCUELA VINA PURISIMA",
  "ESCUELA SAN MIGUEL",
  "ESCUELA SANTA MARTA",
  "ESCUELA PANGUILEMO",
  "ESCUELA PUERTAS NEGRAS",
  "ESCUELA EL ORIENTE",
  "ESCUELA VILLA CULENAR",
  "ESCUELA CARLOS TRUPP WANNER"
];

function normalizarTexto(texto) {
  return String(texto || "")
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/Ñ/g, "N")
    .replace(/\s+/g, " ");
}

function obtenerRutaInsignia(nombre) {
  return "/images/insignias/" +
    nombre
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/ñ/g, "n")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") +
    ".jpg";
}

function crearImagenInsignia(nombre, clase = "insignia-card") {
  if (!nombre || nombre === OPCION_SIN_PREFERENCIA) {
    return "";
  }

  return `
    <img
      class="${clase}"
      src="${obtenerRutaInsignia(nombre)}"
      alt="Insignia ${nombre}"
      onerror="this.style.display='none'"
    >
  `;
}

function esOtroEstablecimiento(r) {
  return r.tipo_establecimiento === "OTRO";
}

function obtenerTotalEstablecimiento(establecimiento) {
  return respuestasGlobales.filter(r =>
    normalizarTexto(r.establecimiento) === normalizarTexto(establecimiento)
  ).length;
}

function obtenerEtiquetaOferta(tipo) {
  if (tipo === "CH") return "Científico Humanista";
  if (tipo === "TP") return "Técnico Profesional";
  if (tipo === "MIXTO") return "Científico Humanista - Técnico Profesional";
  return "Sin clasificación";
}

function obtenerTipoTendencia(tendencia) {
  const texto = normalizarTexto(tendencia);

  if (texto.includes("CIENTIFICO")) return "CH";
  if (texto.includes("TECNICO")) return "TP";

  return "EQUILIBRADA";
}

function esConcordante(tendencia, liceo) {
  if (!liceo || liceo === OPCION_SIN_PREFERENCIA) return null;

  const tipoTendencia = obtenerTipoTendencia(tendencia);
  const tipoLiceo = tipoOfertaLiceos[liceo];

  if (!tipoLiceo) return null;

  if (tipoTendencia === "EQUILIBRADA") return true;
  if (tipoLiceo === "MIXTO") return true;

  return tipoTendencia === tipoLiceo;
}

function ordenarLiceosRanking(liceos, resumen) {
  return liceos.sort((a, b) => {
    const esSinPrefA = a === OPCION_SIN_PREFERENCIA;
    const esSinPrefB = b === OPCION_SIN_PREFERENCIA;

    if (esSinPrefA && !esSinPrefB) return 1;
    if (!esSinPrefA && esSinPrefB) return -1;

    return resumen[b].total - resumen[a].total;
  });
}

async function login() {
  const email = document.getElementById("correo").value;
  const password = document.getElementById("password").value;

  const { error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    alert("Error: " + error.message);
    console.error(error);
    return;
  }

  document.getElementById("login").classList.add("oculto");
  document.getElementById("panel").classList.remove("oculto");

  cargarResultados();
}

async function cargarResultados() {
  const { data, error } = await supabaseClient
    .from("respuestas_test_vocacional")
    .select("*")
    .order("fecha", { ascending: false });

  if (error) {
    alert("No se pudieron cargar los resultados");
    console.error(error);
    return;
  }

  respuestasGlobales = data || [];

  const total = respuestasGlobales.length;

  const promedioCH = total > 0
    ? Math.round(respuestasGlobales.reduce((sum, r) => sum + r.porcentaje_ch, 0) / total)
    : 0;

  const promedioTP = total > 0
    ? Math.round(respuestasGlobales.reduce((sum, r) => sum + r.porcentaje_tp, 0) / total)
    : 0;

  const totalOtros = respuestasGlobales.filter(esOtroEstablecimiento).length;

  document.getElementById("total").textContent = total;
  document.getElementById("promCH").textContent = promedioCH + "%";
  document.getElementById("promTP").textContent = promedioTP + "%";
  document.getElementById("totalOtros").textContent = totalOtros;

  crearCardsEstablecimientos(respuestasGlobales);
  crearAnalisisConcordancia(respuestasGlobales);
  crearCardSinPreferencia(respuestasGlobales);
  crearTablaPreferenciasLiceos(respuestasGlobales);
}

function crearCardsEstablecimientos(data) {
  const contenedor = document.getElementById("cardsEstablecimientos");

  contenedor.innerHTML = "";

  establecimientos.forEach(est => {
    const respuestas = data.filter(
      r =>
        normalizarTexto(r.establecimiento) === normalizarTexto(est) &&
        !esOtroEstablecimiento(r)
    );

    const total = respuestas.length;

    let ch = 0;
    let tp = 0;

    if (total > 0) {
      ch = Math.round(
        respuestas.reduce((sum, r) => sum + r.porcentaje_ch, 0) / total
      );

      tp = Math.round(
        respuestas.reduce((sum, r) => sum + r.porcentaje_tp, 0) / total
      );
    }

    let tendencia = "Sin respuestas";
    let claseTendencia = "equilibrada";

    if (total > 0) {
      if (ch > tp) {
        tendencia = "Científico Humanista";
        claseTendencia = "ch";
      } else if (tp > ch) {
        tendencia = "Técnico Profesional";
        claseTendencia = "tp";
      } else {
        tendencia = "Equilibrada";
        claseTendencia = "equilibrada";
      }
    }

    const card = document.createElement("div");
    card.className = "establecimiento-card";
    card.onclick = () => verDetalleEstablecimiento(est);

    card.innerHTML = `
      <div class="card-header-establecimiento">
        ${crearImagenInsignia(est, "insignia-card")}
        <h3>${est}</h3>
      </div>

      <p class="cantidad-respuestas">${total} respuestas</p>

      <div class="mini-barra-label">
        <span>Científico Humanista</span>
        <strong>${ch}%</strong>
      </div>

      <div class="mini-barra">
        <div class="mini-progreso ch-barra" style="width:${ch}%"></div>
      </div>

      <div class="mini-barra-label">
        <span>Técnico Profesional</span>
        <strong>${tp}%</strong>
      </div>

      <div class="mini-barra">
        <div class="mini-progreso tp-barra" style="width:${tp}%"></div>
      </div>

      <p class="badge ${claseTendencia}">${tendencia}</p>
    `;

    contenedor.appendChild(card);
  });

  const respuestasOtros = data.filter(esOtroEstablecimiento);
  const totalOtros = respuestasOtros.length;

  let chOtros = 0;
  let tpOtros = 0;

  if (totalOtros > 0) {
    chOtros = Math.round(
      respuestasOtros.reduce((sum, r) => sum + r.porcentaje_ch, 0) / totalOtros
    );

    tpOtros = Math.round(
      respuestasOtros.reduce((sum, r) => sum + r.porcentaje_tp, 0) / totalOtros
    );
  }

  let tendenciaOtros = "Sin respuestas";
  let claseOtros = "equilibrada";

  if (totalOtros > 0) {
    if (chOtros > tpOtros) {
      tendenciaOtros = "Científico Humanista";
      claseOtros = "ch";
    } else if (tpOtros > chOtros) {
      tendenciaOtros = "Técnico Profesional";
      claseOtros = "tp";
    } else {
      tendenciaOtros = "Equilibrada";
      claseOtros = "equilibrada";
    }
  }

  const cardOtros = document.createElement("div");
  cardOtros.className = "establecimiento-card";
  cardOtros.onclick = () => verOtrosEstablecimientos();

  cardOtros.innerHTML = `
    <div class="card-header-establecimiento">
      <h3>OTROS ESTABLECIMIENTOS</h3>
    </div>

    <p class="cantidad-respuestas">${totalOtros} respuestas</p>

    <div class="mini-barra-label">
      <span>Científico Humanista</span>
      <strong>${chOtros}%</strong>
    </div>

    <div class="mini-barra">
      <div class="mini-progreso ch-barra" style="width:${chOtros}%"></div>
    </div>

    <div class="mini-barra-label">
      <span>Técnico Profesional</span>
      <strong>${tpOtros}%</strong>
    </div>

    <div class="mini-barra">
      <div class="mini-progreso tp-barra" style="width:${tpOtros}%"></div>
    </div>

    <p class="badge ${claseOtros}">${tendenciaOtros}</p>
  `;

  contenedor.appendChild(cardOtros);
}

function crearCardSinPreferencia(data) {
  const total = data.filter(r =>
    r.preferencia_1 === OPCION_SIN_PREFERENCIA
  ).length;

  const card = document.getElementById("cardSinPreferenciaTotal");

  if (card) {
    card.textContent = total;
  }
}

function verSinPreferenciaPorEstablecimiento() {
  vistaDetalleActual = "SIN_PREFERENCIA";

  const respuestas = respuestasGlobales.filter(r =>
    r.preferencia_1 === OPCION_SIN_PREFERENCIA
  );

  const resumen = {};

  respuestas.forEach(r => {
    const establecimiento = r.establecimiento || "SIN ESTABLECIMIENTO";

    if (!resumen[establecimiento]) {
      resumen[establecimiento] = {
        total: 0,
        estudiantes: []
      };
    }

    resumen[establecimiento].total++;
    resumen[establecimiento].estudiantes.push(r);
  });

  document.getElementById("panel").classList.add("oculto");
  document.getElementById("detalleEstablecimiento").classList.remove("oculto");
  document.getElementById("btnDescargarDetalle").classList.add("oculto");

  document.getElementById("tituloDetalle").innerHTML = `
    <div class="card-header-establecimiento">
      <span>ESTUDIANTES SIN PREFERENCIA DEFINIDA</span>
    </div>
  `;

  document.getElementById("detalleTotal").textContent = respuestas.length;
  document.getElementById("detalleCH").textContent = "-";
  document.getElementById("detalleTP").textContent = "-";

  const contenedor = document.getElementById("cardsEstudiantes");
  contenedor.innerHTML = "";

  const establecimientosOrdenados = Object.keys(resumen).sort((a, b) => {
    return resumen[b].total - resumen[a].total;
  });

  if (establecimientosOrdenados.length === 0) {
    contenedor.innerHTML = `
      <div class="estudiante-card">
        <p>No existen estudiantes con "Sin preferencia definida".</p>
      </div>
    `;
    return;
  }

  establecimientosOrdenados.forEach((est, index) => {
    const bloque = document.createElement("div");
    bloque.className = "estudiante-card bloque-sin-preferencia";

    const idDetalle = `detalle-sin-preferencia-${index}`;

    const estudiantesHtml = resumen[est].estudiantes.map(r => {
      const fecha = r.fecha
        ? new Date(r.fecha).toLocaleDateString("es-CL")
        : "-";

      return `
        <div class="estudiante-sin-preferencia-item">
          <strong>${r.nombre}</strong>
          <span>RUT: ${r.rut}</span>
          <span>Tendencia: ${r.tendencia}</span>
          <span>CH: ${r.porcentaje_ch}% | TP: ${r.porcentaje_tp}%</span>
          <span>Fecha: ${fecha}</span>
        </div>
      `;
    }).join("");

    bloque.innerHTML = `
      <div
        class="sin-preferencia-encabezado"
        onclick="toggleDetalleSinPreferencia('${idDetalle}', this)"
      >
        <div class="card-header-establecimiento">
          ${crearImagenInsignia(est, "insignia-card-grande")}
          <div>
            <h3>${est}</h3>

            <div class="resumen-sin-preferencia">
              <div class="dato-resumen">
                <span>Total respuestas</span>
                <strong>${obtenerTotalEstablecimiento(est)}</strong>
              </div>

              <div class="dato-resumen alerta">
                <span>Sin preferencia definida</span>
                <strong>${resumen[est].total}</strong>
              </div>
            </div>
          </div>
        </div>

        <span class="flecha-acordeon">▼</span>
      </div>

      <div id="${idDetalle}" class="lista-estudiantes-sin-preferencia oculto">
        ${estudiantesHtml}
      </div>
    `;

    contenedor.appendChild(bloque);
  });

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

function toggleDetalleSinPreferencia(idDetalle, encabezado) {
  const detalle = document.getElementById(idDetalle);

  if (!detalle) return;

  detalle.classList.toggle("oculto");

  const flecha = encabezado.querySelector(".flecha-acordeon");

  if (flecha) {
    flecha.textContent = detalle.classList.contains("oculto") ? "▼" : "▲";
  }
}

function crearAnalisisConcordancia(data) {
  const tbody = document.getElementById("tablaConcordancia");

  if (!tbody) return;

  tbody.innerHTML = "";

  let totalEvaluables = 0;
  let totalConcordantes = 0;
  let totalNoConcordantes = 0;
  let totalSinPreferencia = 0;

  const resumenPorLiceo = {};

  data.forEach(r => {
    const primeraPreferencia = r.preferencia_1;

    if (!primeraPreferencia || primeraPreferencia === OPCION_SIN_PREFERENCIA) {
      totalSinPreferencia++;
      return;
    }

    const resultado = esConcordante(r.tendencia, primeraPreferencia);

    if (resultado === null) return;

    totalEvaluables++;

    if (!resumenPorLiceo[primeraPreferencia]) {
      resumenPorLiceo[primeraPreferencia] = {
        total: 0,
        concordantes: 0,
        noConcordantes: 0
      };
    }

    resumenPorLiceo[primeraPreferencia].total++;

    if (resultado) {
      totalConcordantes++;
      resumenPorLiceo[primeraPreferencia].concordantes++;
    } else {
      totalNoConcordantes++;
      resumenPorLiceo[primeraPreferencia].noConcordantes++;
    }
  });

  const porcentajeGeneral = totalEvaluables > 0
    ? Math.round((totalConcordantes / totalEvaluables) * 100)
    : 0;

  document.getElementById("concordanciaGeneral").textContent = porcentajeGeneral + "%";
  document.getElementById("totalConcordantes").textContent = totalConcordantes;
  document.getElementById("totalNoConcordantes").textContent = totalNoConcordantes;
  document.getElementById("totalSinPreferencia").textContent = totalSinPreferencia;

  const liceos = Object.keys(resumenPorLiceo).sort((a, b) => {
    return resumenPorLiceo[b].total - resumenPorLiceo[a].total;
  });

  if (liceos.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6">Aún no existen datos suficientes para calcular concordancia.</td>
      </tr>
    `;
    return;
  }

  liceos.forEach(liceo => {
    const r = resumenPorLiceo[liceo];
    const tipoOferta = tipoOfertaLiceos[liceo] || "SIN CLASIFICAR";

    const porcentaje = r.total > 0
      ? Math.round((r.concordantes / r.total) * 100)
      : 0;

    const claseFila = porcentaje >= 70
      ? "fila-concordancia-alta"
      : porcentaje >= 50
        ? "fila-concordancia-media"
        : "fila-concordancia-baja";

    tbody.innerHTML += `
      <tr class="${claseFila}">
        <td>
          <div class="card-header-establecimiento">
            ${crearImagenInsignia(liceo, "insignia-card")}
            <strong>${liceo}</strong>
          </div>
        </td>
        <td>${obtenerEtiquetaOferta(tipoOferta)}</td>
        <td>${r.total}</td>
        <td>${r.concordantes}</td>
        <td>${r.noConcordantes}</td>
        <td><strong>${porcentaje}%</strong></td>
      </tr>
    `;
  });
}

function obtenerResumenPreferencias(data) {
  const resumen = {};

  data.forEach(r => {
    const preferencias = [
      { liceo: r.preferencia_1, orden: 1 },
      { liceo: r.preferencia_2, orden: 2 },
      { liceo: r.preferencia_3, orden: 3 }
    ];

    preferencias.forEach(pref => {
      if (!pref.liceo) return;

      if (!resumen[pref.liceo]) {
        resumen[pref.liceo] = {
          total: 0,
          primera: 0,
          segunda: 0,
          tercera: 0
        };
      }

      resumen[pref.liceo].total++;

      if (pref.orden === 1) resumen[pref.liceo].primera++;
      if (pref.orden === 2) resumen[pref.liceo].segunda++;
      if (pref.orden === 3) resumen[pref.liceo].tercera++;
    });
  });

  return resumen;
}

function crearTablaPreferenciasLiceos(data) {
  const resumen = obtenerResumenPreferencias(data);
  const tbody = document.getElementById("tablaPreferenciasLiceos");

  tbody.innerHTML = "";

  const liceos = Object.keys(resumen);

  if (liceos.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5">Aún no existen preferencias registradas.</td>
      </tr>
    `;
    return;
  }

  ordenarLiceosRanking(liceos, resumen).forEach(liceo => {
    const r = resumen[liceo];

    const etiquetaLiceo =
      liceo === OPCION_SIN_PREFERENCIA
        ? `<strong>${liceo}</strong>`
        : `
          <div class="card-header-establecimiento">
            ${crearImagenInsignia(liceo, "insignia-card")}
            <strong>${liceo}</strong>
          </div>
        `;

    tbody.innerHTML += `
      <tr>
        <td>${etiquetaLiceo}</td>
        <td>${r.total}</td>
        <td>${r.primera}</td>
        <td>${r.segunda}</td>
        <td>${r.tercera}</td>
      </tr>
    `;
  });
}

function crearOpcionesTraslado(establecimientoActual) {
  return establecimientos.map(est => {
    const seleccionado =
      normalizarTexto(est) === normalizarTexto(establecimientoActual)
        ? "selected"
        : "";

    return `<option value="${est}" ${seleccionado}>${est}</option>`;
  }).join("");
}

function crearBotonTraslado(r) {
  return `
    <div class="traslado-admin">
      <button
        type="button"
        class="btn-trasladar"
        onclick="mostrarTrasladoRespuesta('${r.id}')"
      >
        Trasladar respuesta
      </button>

      <div id="traslado-${r.id}" class="traslado-panel oculto">
        <label>Trasladar a establecimiento DAEM</label>

        <select id="selectTraslado-${r.id}">
          <option value="">Seleccione establecimiento</option>
          ${crearOpcionesTraslado(r.establecimiento)}
        </select>

        <button
          type="button"
          class="btn-guardar-traslado"
          onclick="guardarTrasladoRespuesta('${r.id}')"
        >
          Guardar traslado
        </button>
      </div>
    </div>
  `;
}

function crearCardEstudiante(r) {
  const fecha = r.fecha
    ? new Date(r.fecha).toLocaleDateString("es-CL")
    : "";

  const bloqueInsignia = esOtroEstablecimiento(r)
    ? ""
    : crearImagenInsignia(r.establecimiento, "insignia-card");

  const etiquetaEstablecimiento = esOtroEstablecimiento(r)
    ? "Establecimiento externo"
    : "Establecimiento DAEM";

  const card = document.createElement("div");
  card.className = "estudiante-card";

  card.innerHTML = `
    <div class="estudiante-header">
      ${bloqueInsignia}
      <div>
        <h3>${r.nombre}</h3>
        <p>${r.rut}</p>
      </div>
    </div>

    <div class="estudiante-datos">
      <div>
        <span>${etiquetaEstablecimiento}</span>
        <strong>${r.establecimiento}</strong>
      </div>

      <div>
        <span>Científico Humanista</span>
        <strong>${r.porcentaje_ch}%</strong>
      </div>

      <div>
        <span>Técnico Profesional</span>
        <strong>${r.porcentaje_tp}%</strong>
      </div>

      <div>
        <span>Tendencia</span>
        <strong>${r.tendencia}</strong>
      </div>

      <div>
        <span>Fecha</span>
        <strong>${fecha}</strong>
      </div>
    </div>

    <div class="preferencias-admin">
      <h4>Liceos de preferencia</h4>
      ${crearPreferenciaAdmin(r.preferencia_1, "1ª preferencia")}
      ${crearPreferenciaAdmin(r.preferencia_2, "2ª preferencia")}
      ${crearPreferenciaAdmin(r.preferencia_3, "3ª preferencia")}
    </div>

    ${crearBotonTraslado(r)}
  `;

  return card;
}

function mostrarTrasladoRespuesta(id) {
  const panel = document.getElementById(`traslado-${id}`);

  if (!panel) return;

  panel.classList.toggle("oculto");
}

async function guardarTrasladoRespuesta(id) {
  const select = document.getElementById(`selectTraslado-${id}`);

  if (!select || !select.value) {
    alert("Debes seleccionar un establecimiento.");
    return;
  }

  const nuevoEstablecimiento = select.value;

  const confirmar = confirm(
    `¿Confirmas que deseas trasladar esta respuesta a:\n\n${nuevoEstablecimiento}?`
  );

  if (!confirmar) return;

  const { error } = await supabaseClient
    .from("respuestas_test_vocacional")
    .update({
      establecimiento: nuevoEstablecimiento,
      tipo_establecimiento: "DAEM"
    })
    .eq("id", id);

  if (error) {
    console.error("Error trasladando respuesta:", error);
    alert("No se pudo trasladar la respuesta. Revisa la política UPDATE en Supabase.");
    return;
  }

  alert("Respuesta trasladada correctamente.");

  await cargarResultados();

  if (vistaDetalleActual === "OTROS") {
    verOtrosEstablecimientos();
  } else if (vistaDetalleActual === "SIN_PREFERENCIA") {
    verSinPreferenciaPorEstablecimiento();
  } else if (vistaDetalleActual) {
    verDetalleEstablecimiento(vistaDetalleActual);
  }
}

function verDetalleEstablecimiento(establecimiento) {
  vistaDetalleActual = establecimiento;

  const respuestas = respuestasGlobales.filter(
    r =>
      normalizarTexto(r.establecimiento) === normalizarTexto(establecimiento) &&
      !esOtroEstablecimiento(r)
  );

  const total = respuestas.length;

  const promedioCH = total > 0
    ? Math.round(respuestas.reduce((sum, r) => sum + r.porcentaje_ch, 0) / total)
    : 0;

  const promedioTP = total > 0
    ? Math.round(respuestas.reduce((sum, r) => sum + r.porcentaje_tp, 0) / total)
    : 0;

  document.getElementById("panel").classList.add("oculto");
  document.getElementById("detalleEstablecimiento").classList.remove("oculto");
  document.getElementById("btnDescargarDetalle").classList.remove("oculto");

  document.getElementById("tituloDetalle").innerHTML = `
    <div class="card-header-establecimiento">
      ${crearImagenInsignia(establecimiento, "insignia-card")}
      <span>${establecimiento}</span>
    </div>
  `;

  document.getElementById("detalleTotal").textContent = total;
  document.getElementById("detalleCH").textContent = promedioCH + "%";
  document.getElementById("detalleTP").textContent = promedioTP + "%";

  const contenedor = document.getElementById("cardsEstudiantes");
  contenedor.innerHTML = "";

  if (respuestas.length === 0) {
    contenedor.innerHTML = `
      <div class="estudiante-card">
        <p>Este establecimiento aún no tiene respuestas registradas.</p>
      </div>
    `;
    return;
  }

  respuestas.forEach(r => {
    contenedor.appendChild(crearCardEstudiante(r));
  });

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

function verOtrosEstablecimientos() {
  vistaDetalleActual = "OTROS";

  const respuestas = respuestasGlobales.filter(esOtroEstablecimiento);

  const total = respuestas.length;

  const promedioCH = total > 0
    ? Math.round(respuestas.reduce((sum, r) => sum + r.porcentaje_ch, 0) / total)
    : 0;

  const promedioTP = total > 0
    ? Math.round(respuestas.reduce((sum, r) => sum + r.porcentaje_tp, 0) / total)
    : 0;

  document.getElementById("panel").classList.add("oculto");
  document.getElementById("detalleEstablecimiento").classList.remove("oculto");
  document.getElementById("btnDescargarDetalle").classList.add("oculto");

  document.getElementById("tituloDetalle").innerHTML = `
    <div class="card-header-establecimiento">
      <span>OTROS ESTABLECIMIENTOS</span>
    </div>
  `;

  document.getElementById("detalleTotal").textContent = total;
  document.getElementById("detalleCH").textContent = promedioCH + "%";
  document.getElementById("detalleTP").textContent = promedioTP + "%";

  const contenedor = document.getElementById("cardsEstudiantes");
  contenedor.innerHTML = "";

  if (respuestas.length === 0) {
    contenedor.innerHTML = `
      <div class="estudiante-card">
        <p>Aún no existen respuestas de otros establecimientos.</p>
      </div>
    `;
    return;
  }

  respuestas.forEach(r => {
    contenedor.appendChild(crearCardEstudiante(r));
  });

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

function crearPreferenciaAdmin(liceo, etiqueta) {
  if (!liceo) {
    return `
      <div class="preferencia-admin-item">
        <span>${etiqueta}</span>
        <strong>-</strong>
      </div>
    `;
  }

  if (liceo === OPCION_SIN_PREFERENCIA) {
    return `
      <div class="preferencia-admin-item">
        <div>
          <span>${etiqueta}</span>
          <strong>${OPCION_SIN_PREFERENCIA}</strong>
        </div>
      </div>
    `;
  }

  return `
    <div class="preferencia-admin-item">
      ${crearImagenInsignia(liceo, "insignia-card")}
      <div>
        <span>${etiqueta}</span>
        <strong>${liceo}</strong>
      </div>
    </div>
  `;
}

function volverPanel() {
  vistaDetalleActual = null;

  document.getElementById("detalleEstablecimiento").classList.add("oculto");
  document.getElementById("panel").classList.remove("oculto");

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

function agregarPaginaSiNecesita(doc, y, margenInferior = 275) {
  if (y > margenInferior) {
    doc.addPage();
    return 20;
  }

  return y;
}

function escribirTextoLargo(doc, texto, x, y, ancho, salto = 6) {
  const lineas = doc.splitTextToSize(texto, ancho);
  doc.text(lineas, x, y);
  return y + (lineas.length * salto);
}
function descargarPDFDetalleEstablecimiento() {
  if (!vistaDetalleActual || vistaDetalleActual === "OTROS" || vistaDetalleActual === "SIN_PREFERENCIA") {
    alert("Debes ingresar al detalle de un establecimiento DAEM para descargar este reporte.");
    return;
  }

  const establecimiento = vistaDetalleActual;

  const respuestas = respuestasGlobales
    .filter(r =>
      normalizarTexto(r.establecimiento) === normalizarTexto(establecimiento) &&
      !esOtroEstablecimiento(r)
    )
    .sort((a, b) => {
      const aSinPreferencia = a.preferencia_1 === OPCION_SIN_PREFERENCIA ? 1 : 0;
      const bSinPreferencia = b.preferencia_1 === OPCION_SIN_PREFERENCIA ? 1 : 0;

      if (aSinPreferencia !== bSinPreferencia) {
        return aSinPreferencia - bSinPreferencia;
      }

      return String(a.nombre || "").localeCompare(String(b.nombre || ""));
    });

  if (respuestas.length === 0) {
    alert("Este establecimiento no tiene respuestas para descargar.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const fecha = new Date().toLocaleDateString("es-CL");

  const total = respuestas.length;
  const totalConPreferencia = respuestas.filter(r =>
    r.preferencia_1 && r.preferencia_1 !== OPCION_SIN_PREFERENCIA
  ).length;

  const totalSinPreferencia = respuestas.filter(r =>
    r.preferencia_1 === OPCION_SIN_PREFERENCIA
  ).length;

  const promedioCH = Math.round(
    respuestas.reduce((sum, r) => sum + r.porcentaje_ch, 0) / total
  );

  const promedioTP = Math.round(
    respuestas.reduce((sum, r) => sum + r.porcentaje_tp, 0) / total
  );

  let y = 20;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Reporte por establecimiento", 20, y);

  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(`DAEM Talca - Fecha de descarga: ${fecha}`, 20, y);

  y += 10;

  doc.line(20, y, 190, y);

  y += 12;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(establecimiento, 20, y);

  y += 10;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Total respuestas: ${total}`, 20, y);
  y += 6;
  doc.text(`Con preferencia definida: ${totalConPreferencia}`, 20, y);
  y += 6;
  doc.text(`Sin preferencia definida: ${totalSinPreferencia}`, 20, y);
  y += 6;
  doc.text(`Promedio Científico Humanista: ${promedioCH}%`, 20, y);
  y += 6;
  doc.text(`Promedio Técnico Profesional: ${promedioTP}%`, 20, y);

  y += 12;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Detalle de estudiantes", 20, y);

  y += 8;

  respuestas.forEach((r, index) => {
    y = agregarPaginaSiNecesita(doc, y, 255);

    const sinPreferencia = r.preferencia_1 === OPCION_SIN_PREFERENCIA;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);

    const titulo = `${index + 1}. ${r.nombre || "-"} | RUT: ${r.rut || "-"}`;
    y = escribirTextoLargo(doc, titulo, 20, y, 170, 5);

    y += 2;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);

    y = escribirTextoLargo(
      doc,
      `Tendencia: ${r.tendencia || "-"} | CH: ${r.porcentaje_ch}% | TP: ${r.porcentaje_tp}%`,
      24,
      y,
      160,
      5
    );

    if (sinPreferencia) {
      doc.setFont("helvetica", "bold");
      y = escribirTextoLargo(
        doc,
        "Preferencia: SIN PREFERENCIA DEFINIDA",
        24,
        y,
        160,
        5
      );
      doc.setFont("helvetica", "normal");
    } else {
      y = escribirTextoLargo(
        doc,
        `Preferencias: 1) ${r.preferencia_1 || "-"} | 2) ${r.preferencia_2 || "-"} | 3) ${r.preferencia_3 || "-"}`,
        24,
        y,
        160,
        5
      );
    }

    y += 4;

    doc.setDrawColor(220);
    doc.line(20, y, 190, y);
    y += 7;
  });

  const nombreArchivo = `reporte-${establecimiento
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ñ/g, "n")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}.pdf`;

  doc.save(nombreArchivo);
}
function descargarPDFComunal() {
  if (!respuestasGlobales || respuestasGlobales.length === 0) {
    alert("Aún no hay respuestas para descargar.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const fecha = new Date().toLocaleDateString("es-CL");
  const total = respuestasGlobales.length;
  const totalOtros = respuestasGlobales.filter(esOtroEstablecimiento).length;
  const totalDaem = total - totalOtros;

  const promedioCH = Math.round(
    respuestasGlobales.reduce((sum, r) => sum + r.porcentaje_ch, 0) / total
  );

  const promedioTP = Math.round(
    respuestasGlobales.reduce((sum, r) => sum + r.porcentaje_tp, 0) / total
  );

  let y = 20;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Informe Comunal Test Vocacional", 20, y);

  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(`DAEM Talca - Fecha de descarga: ${fecha}`, 20, y);

  y += 12;

  doc.line(20, y, 190, y);

  y += 14;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Resumen comunal", 20, y);

  y += 10;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(`Total de respuestas: ${total}`, 20, y);
  y += 7;
  doc.text(`Respuestas establecimientos DAEM: ${totalDaem}`, 20, y);
  y += 7;
  doc.text(`Respuestas otros establecimientos: ${totalOtros}`, 20, y);
  y += 7;
  doc.text(`Promedio Científico Humanista: ${promedioCH}%`, 20, y);
  y += 7;
  doc.text(`Promedio Técnico Profesional: ${promedioTP}%`, 20, y);

  y += 14;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Ranking de liceos preferidos", 20, y);

  y += 9;

  const resumenPreferencias = obtenerResumenPreferencias(respuestasGlobales);
  const liceos = ordenarLiceosRanking(Object.keys(resumenPreferencias), resumenPreferencias);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Liceo", 20, y);
  doc.text("Total", 125, y);
  doc.text("1ª", 145, y);
  doc.text("2ª", 160, y);
  doc.text("3ª", 175, y);

  y += 6;

  doc.setFont("helvetica", "normal");

  liceos.forEach(liceo => {
    y = agregarPaginaSiNecesita(doc, y);

    const r = resumenPreferencias[liceo];
    const nombreLineas = doc.splitTextToSize(liceo, 95);

    doc.text(nombreLineas, 20, y);
    doc.text(String(r.total), 128, y);
    doc.text(String(r.primera), 148, y);
    doc.text(String(r.segunda), 163, y);
    doc.text(String(r.tercera), 178, y);

    y += Math.max(7, nombreLineas.length * 5);
  });

  y += 10;
  y = agregarPaginaSiNecesita(doc, y);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Detalle de estudiantes", 20, y);

  y += 10;

  respuestasGlobales.forEach((r, index) => {
    y = agregarPaginaSiNecesita(doc, y, 250);

    const fechaRespuesta = r.fecha
      ? new Date(r.fecha).toLocaleDateString("es-CL")
      : "-";

    const tipo = esOtroEstablecimiento(r)
      ? "OTRO ESTABLECIMIENTO"
      : "DAEM";

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    y = escribirTextoLargo(
      doc,
      `${index + 1}. ${r.nombre} | RUT: ${r.rut}`,
      20,
      y,
      170,
      5
    );

    y += 2;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    y = escribirTextoLargo(doc, `Tipo: ${tipo}`, 24, y, 160, 5);
    y = escribirTextoLargo(doc, `Establecimiento: ${r.establecimiento}`, 24, y, 160, 5);
    y = escribirTextoLargo(
      doc,
      `Resultado: CH ${r.porcentaje_ch}% | TP ${r.porcentaje_tp}% | Tendencia: ${r.tendencia}`,
      24,
      y,
      160,
      5
    );

    y = escribirTextoLargo(
      doc,
      `Preferencias: 1) ${r.preferencia_1 || "-"} | 2) ${r.preferencia_2 || "-"} | 3) ${r.preferencia_3 || "-"}`,
      24,
      y,
      160,
      5
    );

    doc.text(`Fecha: ${fechaRespuesta}`, 24, y);
    y += 9;

    doc.setDrawColor(220);
    doc.line(20, y, 190, y);
    y += 7;
  });

  doc.save(`informe-comunal-test-vocacional-${fecha.replaceAll("/", "-")}.pdf`);
}

function limpiarTextoExcel(valor) {
  if (valor === null || valor === undefined) return "";
  return String(valor).replace(/"/g, '""');
}

function descargarExcelRespuestas() {
  if (!respuestasGlobales || respuestasGlobales.length === 0) {
    alert("Aún no hay respuestas para descargar.");
    return;
  }

  const encabezados = [
    "Nombre estudiante",
    "RUT",
    "Establecimiento",
    "Tendencia",
    "Preferencia 1",
    "Preferencia 2",
    "Preferencia 3"
  ];

  const filas = respuestasGlobales.map(r => [
    r.nombre || "",
    r.rut || "",
    r.establecimiento || "",
    r.tendencia || "",
    r.preferencia_1 || "",
    r.preferencia_2 || "",
    r.preferencia_3 || ""
  ]);

  const contenidoCSV = [
    encabezados,
    ...filas
  ]
    .map(fila =>
      fila
        .map(celda => `"${limpiarTextoExcel(celda)}"`)
        .join(";")
    )
    .join("\n");

  const blob = new Blob(
    ["\uFEFF" + contenidoCSV],
    {
      type: "text/csv;charset=utf-8;"
    }
  );

  const fecha = new Date()
    .toLocaleDateString("es-CL")
    .replaceAll("/", "-");

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `respuestas-test-vocacional-${fecha}.csv`;
  link.click();

  URL.revokeObjectURL(link.href);
}