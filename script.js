const SUPABASE_URL = "https://jxsgfytqlrhsodaoaogk.supabase.co";

const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4c2dmeXRxbHJoc29kYW9hb2drIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5NTM4MTQsImV4cCI6MjA5NTUyOTgxNH0.TuTdhInCKECsj0gHyUo1a2HEzwJK0OCJrlX5_EBlOP0";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const preguntasCH = [
  "¿Disfrutas leer libros y analizar textos en profundidad?",
  "¿Te interesa aprender sobre el funcionamiento del universo y la naturaleza?",
  "¿Te gusta reflexionar sobre problemas éticos o sociales?",
  "¿Prefieres materias teóricas como matematicas, historia o biología?",
  "¿Te interesa el estudio de idiomas o aprender otras culturas?",
  "¿Disfrutas debatir ideas y compartir tus opiniones en clases?",
  "¿Te sientes motivado por las ciencias exactas como física o química?",
  "¿Te gusta investigar y buscar soluciones a preguntas complejas?",
  "¿Te interesa comprender cómo funciona la mente humana?",
  "¿Disfrutas estudiar temas relacionados con filosofía y literatura?",
  "¿Prefieres un enfoque más académico en tu educación?",
  "¿Te gustaría contribuir al desarrollo científico de la sociedad?",
  "¿Disfrutas escribir ensayos o realizar análisis críticos?",
  "¿Te sientes cómodo estudiando temas abstractos o conceptuales?",
  "¿Consideras importante profundizar en el conocimiento general?"
];

const preguntasTP = [
  "¿Te gustaría aprender sobre procesos técnicos y prácticos en el trabajo?",
  "¿Te interesa desarrollar habilidades que puedas aplicar directamente en una profesión?",
  "¿Prefieres materias que combinen teoría con actividades prácticas?",
  "¿Te gustaría trabajar con máquinas, herramientas o tecnología específica?",
  "¿Consideras importante aprender algo que tenga una salida laboral inmediata?",
  "¿Te interesa el funcionamiento interno de sistemas como motores, redes o computadoras?",
  "¿Prefieres actividades donde puedas trabajar con tus manos o construir cosas?",
  "¿Te interesan los negocios y la administración de recursos?",
  "¿Te gustaría aprender a gestionar proyectos o empresas?",
  "¿Consideras útil aprender técnicas de primeros auxilios o cuidado de personas?",
  "¿Te gustaría trabajar en áreas como gastronomía, salud o atención al cliente?",
  "¿Te atraen las actividades que requieran organización y planificación?",
  "¿Te sientes cómodo resolviendo problemas técnicos?",
  "¿Disfrutas de las tareas que impliquen trabajar con tecnología avanzada?",
  "¿Te gustaría participar en proyectos que requieran resultados concretos y medibles?"
];

const liceosDisponibles = [
  {
    nombre: "LICEO MARTA DONOSO ESPEJO",
    detalle: "Científico Humanista"
  },
  {
    nombre: "LICEO CARLOS CONDELL",
    detalle: "Científico Humanista - Técnico Profesional"
  },
  {
    nombre: "LICEO ABATE MOLINA",
    detalle: "Científico Humanista"
  },
  {
    nombre: "LICEO EL SAUCE",
    detalle: "Técnico Profesional"
  },
  {
    nombre: "LICEO COMPLEJO EDUCACIONAL JAVIERA CARRERA",
    detalle: "Técnico Profesional"
  },
  {
    nombre: "LICEO BICENTENARIO ORIENTE DE TALCA",
    detalle: "Científico Humanista"
  },
  {
    nombre: "LICEO INDUSTRIAL",
    detalle: "Técnico Profesional"
  },
  {
    nombre: "LICEO AMELIA COURBIS",
    detalle: "Técnico Profesional"
  },
  {
    nombre: "INSTITUTO SUPERIOR DE COMERCIO",
    detalle: "Científico Humanista - Técnico Profesional"
  },
  {
    nombre: "LICEO HECTOR PEREZ BIOTT",
    detalle: "Científico Humanista"
  },
  {
    nombre: "LICEO BICENTENARIO DIEGO PORTALES",
    detalle: "Científico Humanista - Técnico Profesional"
  }
];
const OPCION_SIN_PREFERENCIA = "SIN PREFERENCIA DEFINIDA";

let resultadoPendiente = null;
let ordenPreferencias = [];

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

function crearImagenInsignia(nombre, clase = "insignia-liceo") {
  return `
    <img
      class="${clase}"
      src="${obtenerRutaInsignia(nombre)}"
      alt="Insignia ${nombre}"
      onerror="this.style.display='none'"
    >
  `;
}

function crearPreguntas(lista, contenedorId, prefijo) {
  const contenedor = document.getElementById(contenedorId);

  lista.forEach((texto, index) => {
    const numero = index + 1;
    const nombrePregunta = `${prefijo}${numero}`;

    const div = document.createElement("div");
    div.className = "pregunta";

    div.innerHTML = `
      <p>${numero}. ${texto}</p>

      <div class="opciones">
        <label class="opcion-respuesta">
          <input type="radio" name="${nombrePregunta}" value="2" required>
          <span>Sí</span>
        </label>

        <label class="opcion-respuesta">
          <input type="radio" name="${nombrePregunta}" value="1">
          <span>No lo sé</span>
        </label>

        <label class="opcion-respuesta">
          <input type="radio" name="${nombrePregunta}" value="0">
          <span>No</span>
        </label>
      </div>
    `;

    contenedor.appendChild(div);
  });
}

function validarRutFormato(rut) {
  return /^[0-9]{7,9}-[0-9K]$/i.test(rut);
}

async function verificarRutYaRespondio(rut) {
  const { data, error } = await supabaseClient
    .from("respuestas_test_vocacional")
    .select("rut")
    .eq("rut", rut)
    .maybeSingle();

  if (error) {
    console.error("Error verificando RUT:", error);
    return false;
  }

  return data !== null;
}

function actualizarAvance() {
  const respondidas = document.querySelectorAll('input[type="radio"]:checked').length;
  const total = 30;
  const porcentaje = Math.round((respondidas / total) * 100);

  document.getElementById("textoAvance").textContent =
    `${respondidas} de ${total} respondidas`;

  document.getElementById("progresoAvance").style.width = porcentaje + "%";
}

function actualizarPreviewEstablecimiento() {
  const establecimientoSelect = document.getElementById("establecimiento").value;
  const preview = document.getElementById("establecimientoPreview");
  const campoOtro = document.getElementById("campoOtroEstablecimiento");
  const inputOtro = document.getElementById("establecimientoOtro");

  if (!establecimientoSelect) {
    campoOtro.classList.add("oculto");
    inputOtro.required = false;
    preview.classList.add("oculto");
    preview.innerHTML = "";
    return;
  }

  if (establecimientoSelect === "OTROS") {
    campoOtro.classList.remove("oculto");
    inputOtro.required = true;

    preview.innerHTML = `
      <div>
        <span>Establecimiento seleccionado</span><br>
        <strong>OTROS</strong>
      </div>
    `;

    preview.classList.remove("oculto");
    return;
  }

  campoOtro.classList.add("oculto");
  inputOtro.required = false;
  inputOtro.value = "";

  preview.innerHTML = `
    ${crearImagenInsignia(establecimientoSelect, "insignia-liceo")}
    <div>
      <span>Establecimiento seleccionado</span><br>
      <strong>${establecimientoSelect}</strong>
    </div>
  `;

  preview.classList.remove("oculto");
}

function obtenerDatosEstablecimiento() {
  const seleccion = document.getElementById("establecimiento").value;
  const otro = document.getElementById("establecimientoOtro").value.trim().toUpperCase();

  if (seleccion === "OTROS") {
    return {
      establecimiento: otro,
      tipoEstablecimiento: "OTRO"
    };
  }

  return {
    establecimiento: seleccion,
    tipoEstablecimiento: "DAEM"
  };
}

async function obtenerImagenBase64(ruta) {
  try {
    const response = await fetch(ruta);

    if (!response.ok) {
      throw new Error("No se encontró la imagen: " + ruta);
    }

    const blob = await response.blob();

    return await new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;

      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error cargando imagen:", error);
    return null;
  }
}

async function obtenerLogoBase64() {
  return await obtenerImagenBase64("/images/logo-daem.png");
}

function crearListaLiceos() {
  const contenedor = document.getElementById("listaLiceos");

  contenedor.innerHTML = "";

  liceosDisponibles.forEach((liceo) => {
    const label = document.createElement("label");
    label.className = "liceo-opcion";

    label.innerHTML = `
      <input type="checkbox" name="liceosPreferencia" value="${liceo.nombre}">
      ${crearImagenInsignia(liceo.nombre, "insignia-liceo")}
      <span>
        <strong>${liceo.nombre}</strong><br>
        <small>${liceo.detalle}</small>
      </span>
    `;

    contenedor.appendChild(label);
  });

  const labelSinPreferencia = document.createElement("label");
  labelSinPreferencia.className = "liceo-opcion opcion-sin-preferencia";

  labelSinPreferencia.innerHTML = `
    <input type="checkbox" id="sinPreferenciaLiceos" value="${OPCION_SIN_PREFERENCIA}">
    <span>No tengo interés en estos liceos / Aún no estoy seguro</span>
  `;

  contenedor.appendChild(labelSinPreferencia);

  document.querySelectorAll('input[name="liceosPreferencia"]').forEach(check => {
    check.addEventListener("change", function () {
      const sinPreferencia = document.getElementById("sinPreferenciaLiceos");

      if (sinPreferencia && this.checked) {
        sinPreferencia.checked = false;
      }

      if (this.checked) {
        if (!ordenPreferencias.includes(this.value)) {
          ordenPreferencias.push(this.value);
        }
      } else {
        ordenPreferencias = ordenPreferencias.filter(liceo => liceo !== this.value);
      }

      validarSeleccionLiceos.call(this);
    });
  });

  document.getElementById("sinPreferenciaLiceos").addEventListener("change", function () {
    const checksLiceos = document.querySelectorAll('input[name="liceosPreferencia"]');

    if (this.checked) {
      checksLiceos.forEach(check => {
        check.checked = false;
      });

      ordenPreferencias = [];
    }

    validarSeleccionLiceos.call(this);
  });
}

function validarSeleccionLiceos() {
  const seleccionados = document.querySelectorAll('input[name="liceosPreferencia"]:checked');
  const sinPreferencia = document.getElementById("sinPreferenciaLiceos");
  const mensaje = document.getElementById("mensajeLiceos");

  if (sinPreferencia && sinPreferencia.checked) {
    mensaje.textContent = "";

    document.querySelectorAll(".liceo-opcion").forEach(label => {
      const input = label.querySelector("input");
      label.classList.toggle("seleccionado", input.checked);
    });

    return;
  }

  if (seleccionados.length > 3) {
    if (this && this.type === "checkbox") {
      this.checked = false;
      ordenPreferencias = ordenPreferencias.filter(liceo => liceo !== this.value);
    }

    mensaje.textContent = "Puedes seleccionar un máximo de 3 liceos.";
  } else {
    mensaje.textContent = "";
  }

  document.querySelectorAll(".liceo-opcion").forEach(label => {
    const input = label.querySelector("input");
    label.classList.toggle("seleccionado", input.checked);
  });
}

function obtenerLiceosSeleccionados() {
  const sinPreferencia = document.getElementById("sinPreferenciaLiceos");

  if (sinPreferencia && sinPreferencia.checked) {
    return [OPCION_SIN_PREFERENCIA];
  }

  return ordenPreferencias.slice(0, 3);
}

function cerrarModalResultado() {
  document.getElementById("modalResultado").classList.add("oculto");
}

async function generarPDFResultado(
  nombre,
  rut,
  establecimiento,
  porcentajeCH,
  porcentajeTP,
  tendencia,
  preferencias = [],
  tipoEstablecimiento = "DAEM"
) {
  try {
    const { jsPDF } = window.jspdf;

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "letter"
    });

    const fecha = new Date().toLocaleDateString("es-CL");
    const logoBase64 = await obtenerLogoBase64();

    let insigniaEstablecimiento = null;

    if (tipoEstablecimiento !== "OTRO") {
      insigniaEstablecimiento = await obtenerImagenBase64(
        obtenerRutaInsignia(establecimiento)
      );
    }

    function encabezadoPDF() {
      if (logoBase64) {
        try {
          doc.addImage(logoBase64, "PNG", 15, 10, 26, 14);
        } catch (logoError) {
          console.error("Error agregando logo al PDF:", logoError);
        }
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(17);
      doc.text("Resultado Test Vocacional", 15, 34);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text("Enseñanza Media - DAEM Talca", 15, 41);

      doc.line(15, 48, 200, 48);
    }

    encabezadoPDF();

    if (insigniaEstablecimiento) {
      try {
        doc.addImage(insigniaEstablecimiento, "JPEG", 172, 58, 22, 22);
      } catch (errorInsigniaEst) {
        console.error("Error agregando insignia del establecimiento:", errorInsigniaEst);
      }
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("Datos del estudiante", 15, 62);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);

    doc.text(`Nombre: ${nombre}`, 15, 74);
    doc.text(`RUT: ${rut}`, 15, 82);

    const textoEstablecimiento =
      tipoEstablecimiento === "OTRO"
        ? `Establecimiento externo: ${establecimiento}`
        : `Establecimiento: ${establecimiento}`;

    const establecimientoLineas = doc.splitTextToSize(textoEstablecimiento, 145);
    doc.text(establecimientoLineas, 15, 90);

    doc.text(`Fecha: ${fecha}`, 15, 106);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("Resultados", 15, 124);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);

    doc.text(`Científico Humanista: ${porcentajeCH}%`, 15, 137);
    doc.text(`Técnico Profesional: ${porcentajeTP}%`, 15, 147);

    doc.setDrawColor(179, 0, 0);
    doc.setFillColor(255, 240, 240);
    doc.roundedRect(15, 160, 185, 22, 4, 4, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(179, 0, 0);
    doc.text(`Tendencia predominante: ${tendencia}`, 22, 174);

    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);

    const textoBreve =
      "Este resultado permite orientar la conversación familiar y escolar sobre las alternativas de continuidad en enseñanza media.";

    const textoBreveLineas = doc.splitTextToSize(textoBreve, 180);
    doc.text(textoBreveLineas, 15, 198);

    doc.setFontSize(9);
    doc.setTextColor(90, 90, 90);
    doc.text("Página 1 de 2", 170, 255);
    doc.setTextColor(0, 0, 0);

    doc.addPage();

    encabezadoPDF();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("Liceos de preferencia seleccionados", 15, 62);

    let yPreferencias = 76;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);

    for (let i = 0; i < preferencias.length; i++) {
      const liceo = preferencias[i];

      if (liceo !== OPCION_SIN_PREFERENCIA) {
        const insigniaLiceo = await obtenerImagenBase64(obtenerRutaInsignia(liceo));

        if (insigniaLiceo) {
          try {
            doc.addImage(insigniaLiceo, "JPEG", 15, yPreferencias - 7, 12, 12);
          } catch (errorInsigniaLiceo) {
            console.error("Error agregando insignia del liceo:", errorInsigniaLiceo);
          }
        }
      }

      const textoPreferencia =
        liceo === OPCION_SIN_PREFERENCIA
          ? "El estudiante indicó que no tiene interés en estos liceos o aún no está seguro."
          : `${i + 1}. ${liceo}`;

      doc.setFont("helvetica", liceo === OPCION_SIN_PREFERENCIA ? "bold" : "normal");

      const xTexto = liceo === OPCION_SIN_PREFERENCIA ? 15 : 40;
      const anchoTexto = liceo === OPCION_SIN_PREFERENCIA ? 180 : 155;

      const lineas = doc.splitTextToSize(textoPreferencia, anchoTexto);
      doc.text(lineas, xTexto, yPreferencias);

      yPreferencias += Math.max(18, lineas.length * 6 + 10);
    }

    doc.setDrawColor(230, 230, 230);
    doc.line(15, yPreferencias + 4, 200, yPreferencias + 4);

    let yTexto = yPreferencias + 20;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Orientación del resultado", 15, yTexto);

    yTexto += 10;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);

    const textoOrientacion =
      "Este resultado es referencial y tiene como finalidad apoyar el proceso de orientación vocacional del estudiante. No constituye una decisión definitiva, sino una herramienta de apoyo para conversar con la familia, el establecimiento y los equipos de orientación.";

    const lineasOrientacion = doc.splitTextToSize(textoOrientacion, 180);
    doc.text(lineasOrientacion, 15, yTexto);

    yTexto += lineasOrientacion.length * 5 + 12;

    const textoCierre =
      "Se recomienda revisar este resultado considerando los intereses personales, habilidades, trayectoria escolar y oferta educativa disponible.";

    const lineasCierre = doc.splitTextToSize(textoCierre, 180);
    doc.text(lineasCierre, 15, yTexto);

    doc.line(15, 242, 200, 242);

    doc.setFontSize(9);
    doc.setTextColor(90, 90, 90);
    doc.text(
      "Departamento de Administración de Educación Municipal - Talca",
      15,
      250
    );
    doc.text("Página 2 de 2", 170, 255);

    doc.setTextColor(0, 0, 0);

    const nombreArchivo = `resultado-test-vocacional-${rut}.pdf`;

    doc.save(nombreArchivo);
  } catch (error) {
    console.error("Error generando PDF:", error);
    alert("El resultado fue guardado, pero no se pudo generar el PDF.");
  }
}

function abrirModalResultado(datos) {
  const modal = document.getElementById("modalResultado");
  const resumen = document.getElementById("modalResumenResultado");

  const bloqueEstablecimiento =
    datos.tipoEstablecimiento === "OTRO"
      ? `
        <div class="modal-resumen-header">
          <div>
            <h2>Resultado del Test Vocacional</h2>
            <p><strong>Estudiante:</strong> ${datos.nombre}</p>
            <p><strong>RUT:</strong> ${datos.rut}</p>
            <p><strong>Establecimiento externo:</strong> ${datos.establecimiento}</p>
          </div>
        </div>
      `
      : `
        <div class="modal-resumen-header">
          ${crearImagenInsignia(datos.establecimiento, "insignia-liceo")}
          <div>
            <h2>Resultado del Test Vocacional</h2>
            <p><strong>Estudiante:</strong> ${datos.nombre}</p>
            <p><strong>RUT:</strong> ${datos.rut}</p>
            <p><strong>Establecimiento:</strong> ${datos.establecimiento}</p>
          </div>
        </div>
      `;

  resumen.innerHTML = `
    ${bloqueEstablecimiento}

    <div class="modal-resultados-grid">
      <div class="modal-resultado-card">
        <span>Científico Humanista</span>
        <strong>${datos.porcentajeCH}%</strong>
      </div>

      <div class="modal-resultado-card">
        <span>Técnico Profesional</span>
        <strong>${datos.porcentajeTP}%</strong>
      </div>
    </div>

    <p class="tendencia">
      Tendencia predominante: ${datos.tendencia}
    </p>
  `;

  modal.classList.remove("oculto");
}

crearPreguntas(preguntasCH, "preguntasCH", "ch");
crearPreguntas(preguntasTP, "preguntasTP", "tp");
crearListaLiceos();

document.querySelectorAll('input[type="radio"]').forEach(radio => {
  radio.addEventListener("change", actualizarAvance);
});

document.getElementById("establecimiento").addEventListener("change", actualizarPreviewEstablecimiento);

const rutInput = document.getElementById("rut");
const mensajeRut = document.getElementById("mensajeRut");

rutInput.addEventListener("blur", async function () {
  const rut = rutInput.value.trim().toUpperCase();

  if (rut === "") {
    mensajeRut.textContent = "";
    rutInput.classList.remove("input-error");
    return;
  }

  if (!validarRutFormato(rut)) {
    mensajeRut.textContent =
      "El RUT debe ingresarse sin puntos y con guion. Ejemplo: 12345678-9 o 100512993-8";

    rutInput.classList.add("input-error");
    return;
  }

  rutInput.value = rut;
  mensajeRut.textContent = "";
  rutInput.classList.remove("input-error");

  const yaRespondio = await verificarRutYaRespondio(rut);

  if (yaRespondio) {
    mensajeRut.textContent =
      "Este RUT ya registró una respuesta. Cada estudiante puede responder solo una vez.";

    rutInput.classList.add("input-error");
  }
});

document.getElementById("formTest").addEventListener("submit", async function(event) {
  event.preventDefault();

  const nombre = document.getElementById("nombre").value.trim();
  const rut = rutInput.value.trim().toUpperCase();

  const datosEstablecimiento = obtenerDatosEstablecimiento();
  const establecimiento = datosEstablecimiento.establecimiento;
  const tipoEstablecimiento = datosEstablecimiento.tipoEstablecimiento;

  if (!validarRutFormato(rut)) {
    mensajeRut.textContent =
      "El RUT debe ingresarse sin puntos y con guion. Ejemplo: 12345678-9";

    rutInput.classList.add("input-error");
    rutInput.focus();
    return;
  }

  if (!establecimiento) {
    alert("Debes ingresar el establecimiento al que perteneces.");
    return;
  }

  const yaRespondio = await verificarRutYaRespondio(rut);

  if (yaRespondio) {
    mensajeRut.textContent =
      "Este RUT ya registró una respuesta. Cada estudiante puede responder solo una vez.";

    rutInput.classList.add("input-error");
    rutInput.focus();
    return;
  }

  let puntajeCH = 0;
  let puntajeTP = 0;

  for (let i = 1; i <= 15; i++) {
    puntajeCH += parseInt(
      document.querySelector(`input[name="ch${i}"]:checked`).value
    );

    puntajeTP += parseInt(
      document.querySelector(`input[name="tp${i}"]:checked`).value
    );
  }

  const porcentajeCH = Math.round((puntajeCH / 30) * 100);
  const porcentajeTP = Math.round((puntajeTP / 30) * 100);

  let tendencia = "";

  if (porcentajeCH > porcentajeTP) {
    tendencia = "Científico Humanista";
  } else if (porcentajeTP > porcentajeCH) {
    tendencia = "Técnico Profesional";
  } else {
    tendencia = "Tendencia Equilibrada";
  }

  resultadoPendiente = {
    nombre,
    rut,
    establecimiento,
    tipoEstablecimiento,
    puntajeCH,
    puntajeTP,
    porcentajeCH,
    porcentajeTP,
    tendencia
  };

  abrirModalResultado(resultadoPendiente);
});

document.getElementById("btnGuardarPreferencias").addEventListener("click", async function() {
  const mensaje = document.getElementById("mensajeLiceos");
  const preferencias = obtenerLiceosSeleccionados();

  if (!resultadoPendiente) {
    mensaje.textContent = "Primero debes responder el test.";
    return;
  }

  if (preferencias.length === 0) {
    mensaje.textContent =
      "Debes seleccionar al menos 1 liceo o marcar la opción 'No tengo interés en estos liceos / Aún no estoy seguro'.";
    return;
  }

  if (preferencias.length > 3 && preferencias[0] !== OPCION_SIN_PREFERENCIA) {
    mensaje.textContent = "Puedes seleccionar un máximo de 3 liceos.";
    return;
  }

  const yaRespondio = await verificarRutYaRespondio(resultadoPendiente.rut);

  if (yaRespondio) {
    mensaje.textContent =
      "Este RUT ya registró una respuesta. Cada estudiante puede responder solo una vez.";
    return;
  }

  const { error } = await supabaseClient
    .from("respuestas_test_vocacional")
    .insert({
      nombre: resultadoPendiente.nombre,
      rut: resultadoPendiente.rut,
      establecimiento: resultadoPendiente.establecimiento,
      tipo_establecimiento: resultadoPendiente.tipoEstablecimiento,
      puntaje_ch: resultadoPendiente.puntajeCH,
      puntaje_tp: resultadoPendiente.puntajeTP,
      porcentaje_ch: resultadoPendiente.porcentajeCH,
      porcentaje_tp: resultadoPendiente.porcentajeTP,
      tendencia: resultadoPendiente.tendencia,
      preferencia_1: preferencias[0] || null,
      preferencia_2: preferencias[1] || null,
      preferencia_3: preferencias[2] || null
    });

  if (error) {
    console.error("ERROR SUPABASE:", error);

    if (error.code === "23505") {
      alert("Este RUT ya registró una respuesta. Cada estudiante puede responder solo una vez.");
    } else {
      alert("Error al guardar: " + error.message);
    }

    return;
  }

  await generarPDFResultado(
    resultadoPendiente.nombre,
    resultadoPendiente.rut,
    resultadoPendiente.establecimiento,
    resultadoPendiente.porcentajeCH,
    resultadoPendiente.porcentajeTP,
    resultadoPendiente.tendencia,
    preferencias,
    resultadoPendiente.tipoEstablecimiento
  );

  document.getElementById("formTest").reset();
  document.getElementById("campoOtroEstablecimiento").classList.add("oculto");
  document.getElementById("establecimientoOtro").required = false;
  document.getElementById("establecimientoOtro").value = "";
  document.getElementById("establecimientoPreview").classList.add("oculto");
  document.getElementById("establecimientoPreview").innerHTML = "";

  document.querySelectorAll('input[name="liceosPreferencia"]').forEach(check => {
    check.checked = false;
  });

  const sinPreferencia = document.getElementById("sinPreferenciaLiceos");

  if (sinPreferencia) {
    sinPreferencia.checked = false;
  }

  document.querySelectorAll(".liceo-opcion").forEach(label => {
    label.classList.remove("seleccionado");
  });

  mensaje.textContent = "";
  mensajeRut.textContent = "";
  rutInput.classList.remove("input-error");

  resultadoPendiente = null;
ordenPreferencias = [];
  actualizarAvance();
  cerrarModalResultado();

  alert("Tu respuesta fue guardada correctamente. Se descargó tu PDF de resultado.");
});

document.getElementById("btnCerrarModal").addEventListener("click", cerrarModalResultado);

document.getElementById("modalResultado").addEventListener("click", function(event) {
  if (event.target.id === "modalResultado") {
    cerrarModalResultado();
  }
});