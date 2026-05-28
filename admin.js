const SUPABASE_URL = "https://jxsgfytqlrhsodaoaogk.supabase.co";

const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4c2dmeXRxbHJoc29kYW9hb2drIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5NTM4MTQsImV4cCI6MjA5NTUyOTgxNH0.TuTdhInCKECsj0gHyUo1a2HEzwJK0OCJrlX5_EBlOP0";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let respuestasGlobales = [];

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

  document.getElementById("total").textContent = total;
  document.getElementById("promCH").textContent = promedioCH + "%";
  document.getElementById("promTP").textContent = promedioTP + "%";

  crearCardsEstablecimientos(data);
}

function crearCardsEstablecimientos(data) {

  const establecimientos = [
    "LICEO MARTA DONOSO ESPEJO",
    "LICEO CARLOS CONDELL",
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
    "LICEO ABATE MOLINA",
    "ESCUELA HUILQUILEMU",
    "ESCUELA VINA PURISIMA",
    "ESCUELA SAN MIGUEL",
    "LICEO TECNICO-PROFESIONAL EL SAUCE",
    "ESCUELA SANTA MARTA",
    "ESCUELA PANGUILEMO",
    "ESCUELA BASICA PUERTAS NEGRAS",
    "ESCUELA EL ORIENTE",
    "ESCUELA VILLA CULENAR",
    "ESCUELA CARLOS TRUPP WANNER",
    "LICEO COMPLEJO EDUCACIONAL JAVIERA CARRERA",
    "LICEO BICENTENARIO ORIENTE DE TALCA"
  ];

  const contenedor = document.getElementById("cardsEstablecimientos");

  contenedor.innerHTML = "";

  establecimientos.forEach(est => {

    const respuestas = data.filter(
      r => r.establecimiento === est
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
      }

      if (tp > ch) {
        tendencia = "Técnico Profesional";
        claseTendencia = "tp";
      }

      if (ch === tp) {
        tendencia = "Equilibrada";
      }
    }

    const card = document.createElement("div");

    card.className = "establecimiento-card";

    card.onclick = () => verDetalleEstablecimiento(est);

    card.innerHTML = `
      <h3>${est}</h3>

      <p class="cantidad-respuestas">
        ${total} respuestas
      </p>

      <div class="mini-barra-label">
        <span>Científico Humanista</span>
        <strong>${ch}%</strong>
      </div>

      <div class="mini-barra">
        <div
          class="mini-progreso ch-barra"
          style="width:${ch}%"
        ></div>
      </div>

      <div class="mini-barra-label">
        <span>Técnico Profesional</span>
        <strong>${tp}%</strong>
      </div>

      <div class="mini-barra">
        <div
          class="mini-progreso tp-barra"
          style="width:${tp}%"
        ></div>
      </div>

      <p class="badge ${claseTendencia}">
        ${tendencia}
      </p>
    `;

    contenedor.appendChild(card);

  });
}

function verDetalleEstablecimiento(establecimiento) {
  const respuestas = respuestasGlobales.filter(
    r => r.establecimiento === establecimiento
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

  document.getElementById("tituloDetalle").textContent = establecimiento;
  document.getElementById("detalleTotal").textContent = total;
  document.getElementById("detalleCH").textContent = promedioCH + "%";
  document.getElementById("detalleTP").textContent = promedioTP + "%";

  const tbody = document.getElementById("tablaEstudiantes");
  tbody.innerHTML = "";

  respuestas.forEach(r => {
    const fecha = r.fecha
      ? new Date(r.fecha).toLocaleDateString("es-CL")
      : "";

    tbody.innerHTML += `
      <tr>
        <td>${r.nombre}</td>
        <td>${r.rut}</td>
        <td>${r.porcentaje_ch}%</td>
        <td>${r.porcentaje_tp}%</td>
        <td>${r.tendencia}</td>
        <td>${fecha}</td>
      </tr>
    `;
  });

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

function volverPanel() {
  document.getElementById("detalleEstablecimiento").classList.add("oculto");
  document.getElementById("panel").classList.remove("oculto");

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}