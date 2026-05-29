const SUPABASE_URL = "https://jxsgfytqlrhsodaoaogk.supabase.co";

const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4c2dmeXRxbHJoc29kYW9hb2drIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5NTM4MTQsImV4cCI6MjA5NTUyOTgxNH0.TuTdhInCKECsj0gHyUo1a2HEzwJK0OCJrlX5_EBlOP0";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let respuestasGlobales = [];

const establecimientos = [
  "ESCUELA HERMANO GUIDO GOOSSENS",
  "ESCUELA JUAN LUIS SANFUENTES",
  "ESCUELA JOSE M. BALMACEDA Y FERNANDEZ",
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
  "ESCUELA COOPERATIVA LIRCAY MANUEL YAÑEZ OLAVE",
  "ESCUELA COSTANERA",
  "ESCUELA ANTUPEHUEN",
  "ESCUELA ESPERANZA",
  "ESCUELA HUILQUILEMU",
  "ESCUELA VINA PURISIMA",
  "ESCUELA SAN MIGUEL",
  "ESCUELA SANTA MARTA",
  "ESCUELA PANGUILEMO",
  "ESCUELA BASICA PUERTAS NEGRAS",
  "ESCUELA EL ORIENTE",
  "ESCUELA VILLA CULENAR",
  "ESCUELA CARLOS TRUPP WANNER"
];

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

  respuestasGlobales = data;

  const total = data.length;

  const promedioCH = total > 0
    ? Math.round(data.reduce((sum, r) => sum + r.porcentaje_ch, 0) / total)
    : 0;

  const promedioTP = total > 0
    ? Math.round(data.reduce((sum, r) => sum + r.porcentaje_tp, 0) / total)
    : 0;

  const totalOtros = data.filter(esOtroEstablecimiento).length;

  document.getElementById("total").textContent = total;
  document.getElementById("promCH").textContent = promedioCH + "%";
  document.getElementById("promTP").textContent = promedioTP + "%";
  document.getElementById("totalOtros").textContent = totalOtros;

  crearCardsEstablecimientos(data);
  crearTablaPreferenciasLiceos(data);
}

function crearCardsEstablecimientos(data) {
  const contenedor = document.getElementById("cardsEstablecimientos");

  contenedor.innerHTML = "";

  establecimientos.forEach(est => {
    const respuestas = data.filter(
      r => r.establecimiento === est && !esOtroEstablecimiento(r)
    );

    const total = respuestas.length;

    let ch = 0;
    let tp = 0;

    if (total > 0) {
      ch = Math.round(respuestas.reduce((sum, r) => sum + r.porcentaje_ch, 0) / total);
      tp = Math.round(respuestas.reduce((sum, r) => sum + r.porcentaje_tp, 0) / total);
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

  liceos
    .sort((a, b) => resumen[b].total - resumen[a].total)
    .forEach(liceo => {
      const r = resumen[liceo];

      tbody.innerHTML += `
        <tr>
          <td>
            <div class="card-header-establecimiento">
              ${crearImagenInsignia(liceo, "insignia-card")}
              <strong>${liceo}</strong>
            </div>
          </td>
          <td>${r.total}</td>
          <td>${r.primera}</td>
          <td>${r.segunda}</td>
          <td>${r.tercera}</td>
        </tr>
      `;
    });
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
  `;

  return card;
}

function verDetalleEstablecimiento(establecimiento) {
  const respuestas = respuestasGlobales.filter(
    r => r.establecimiento === establecimiento && !esOtroEstablecimiento(r)
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

  document.getElementById("tituloDetalle").innerHTML = `
    <div class="card-header-establecimiento">
      <span>Otros establecimientos</span>
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
  const liceos = Object.keys(resumenPreferencias)
    .sort((a, b) => resumenPreferencias[b].total - resumenPreferencias[a].total);

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