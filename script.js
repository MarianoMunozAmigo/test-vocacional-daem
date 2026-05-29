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
  "LICEO MARTA DONOSO ESPEJO",
  "LICEO CARLOS CONDELL",
  "LICEO ABATE MOLINA",
  "LICEO EL SAUCE",
  "LICEO COMPLEJO EDUCACIONAL JAVIERA CARRERA",
  "LICEO BICENTENARIO ORIENTE DE TALCA",
  "LICEO INDUSTRIAL",
  "LICEO AMELIA COURBIS",
  "INSTITUTO SUPERIOR DE COMERCIO",
  "LICEO BICENTENARIO DIEGO PORTALES",
  "LICEO HECTOR PEREZ BIOTT"
];

let resultadoPendiente = null;

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
  return /^[0-9]{7,8}-[0-9K]$/.test(rut);
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
  const establecimiento = document.getElementById("establecimiento").value;
  const preview = document.getElementById("establecimientoPreview");

  if (!establecimiento) {
    preview.classList.add("oculto");
    preview.innerHTML = "";
    return;
  }

  preview.innerHTML = `
    ${crearImagenInsignia(establecimiento, "insignia-liceo")}
    <div>
      <span>Establecimiento seleccionado</span><br>
      <strong>${establecimiento}</strong>
    </div>
  `;

  preview.classList.remove("oculto");
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
      <input type="checkbox" name="liceosPreferencia" value="${liceo}">
      ${crearImagenInsignia(liceo, "insignia-liceo")}
      <span>${liceo}</span>
    `;

    contenedor.appendChild(label);
  });

  document.querySelectorAll('input[name="liceosPreferencia"]').forEach(check => {
    check.addEventListener("change", validarSeleccionLiceos);
  });
}

function validarSeleccionLiceos() {
  const seleccionados = document.querySelectorAll('input[name="liceosPreferencia"]:checked');
  const mensaje = document.getElementById("mensajeLiceos");

  if (seleccionados.length > 3) {
    this.checked = false;
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
  return Array.from(
    document.querySelectorAll('input[name="liceosPreferencia"]:checked')
  ).map(input => input.value);
}

async function generarPDFResultado(
  nombre,
  rut,
  establecimiento,
  porcentajeCH,
  porcentajeTP,
  tendencia,
  preferencias = []
) {
  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const fecha = new Date().toLocaleDateString("es-CL");

    const logoBase64 = await obtenerLogoBase64();
    const insigniaEstablecimiento = await obtenerImagenBase64(
      obtenerRutaInsignia(establecimiento)
    );

    if (logoBase64) {
      try {
        doc.addImage(logoBase64, "PNG", 15, 10, 36, 20);
      } catch (logoError) {
        console.error("Error agregando logo al PDF:", logoError);
      }
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("Resultado Test Vocacional", 20, 42);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text("Enseñanza Media - DAEM Talca", 20, 51);

    doc.line(20, 60, 190, 60);

    if (insigniaEstablecimiento) {
      try {
        doc.addImage(insigniaEstablecimiento, "JPEG", 155, 70, 24, 24);
      } catch (errorInsigniaEst) {
        console.error("Error agregando insignia del establecimiento:", errorInsigniaEst);
      }
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Datos del estudiante", 20, 75);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Nombre: ${nombre}`, 20, 87);
    doc.text(`RUT: ${rut}`, 20, 97);

    const establecimientoLineas = doc.splitTextToSize(
      `Establecimiento: ${establecimiento}`,
      125
    );

    doc.text(establecimientoLineas, 20, 107);
    doc.text(`Fecha: ${fecha}`, 20, 123);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Resultados", 20, 142);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Científico Humanista: ${porcentajeCH}%`, 20, 156);
    doc.text(`Técnico Profesional: ${porcentajeTP}%`, 20, 166);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text(`Tendencia predominante: ${tendencia}`, 20, 186);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Liceos de preferencia", 20, 204);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);

    let yPreferencias = 218;

    for (let i = 0; i < preferencias.length; i++) {
      const liceo = preferencias[i];
      const insigniaLiceo = await obtenerImagenBase64(obtenerRutaInsignia(liceo));

      if (insigniaLiceo) {
        try {
          doc.addImage(insigniaLiceo, "JPEG", 20, yPreferencias - 7, 12, 12);
        } catch (errorInsigniaLiceo) {
          console.error("Error agregando insignia del liceo:", errorInsigniaLiceo);
        }
      }

      const lineasLiceo = doc.splitTextToSize(`${i + 1}. ${liceo}`, 145);
      doc.text(lineasLiceo, 36, yPreferencias);

      yPreferencias += 14;
    }

    const textoOrientacion =
      "Este resultado es referencial y tiene como finalidad apoyar el proceso de orientación vocacional del estudiante. No constituye una decisión definitiva, sino una herramienta de apoyo para conversar con la familia, el establecimiento y los equipos de orientación.";

    const lineas = doc.splitTextToSize(textoOrientacion, 170);
    doc.text(lineas, 20, 250);

    doc.line(20, 268, 190, 268);

    doc.setFontSize(10);
    doc.text(
      "Departamento de Administración de Educación Municipal - Talca",
      20,
      278
    );

    const nombreArchivo = `resultado-test-vocacional-${rut}.pdf`;

    doc.save(nombreArchivo);
  } catch (error) {
    console.error("Error generando PDF:", error);
    alert("El resultado fue guardado, pero no se pudo generar el PDF.");
  }
}

function mostrarResumenTemporal(datos) {
  const resultado = document.getElementById("resultado");

  resultado.innerHTML = `
    <h2>Resultado del Test Vocacional</h2>

    <p><strong>Estudiante:</strong> ${datos.nombre}</p>
    <p><strong>RUT:</strong> ${datos.rut}</p>

    <div class="establecimiento-preview">
      ${crearImagenInsignia(datos.establecimiento, "insignia-liceo")}
      <div>
        <span>Establecimiento</span><br>
        <strong>${datos.establecimiento}</strong>
      </div>
    </div>

    <h3>Científico Humanista</h3>
    <div class="barra">
      <div class="progreso" style="width: ${datos.porcentajeCH}%;">
        ${datos.porcentajeCH}%
      </div>
    </div>

    <h3>Técnico Profesional</h3>
    <div class="barra">
      <div class="progreso" style="width: ${datos.porcentajeTP}%;">
        ${datos.porcentajeTP}%
      </div>
    </div>

    <p class="tendencia">
      Tendencia predominante: ${datos.tendencia}
    </p>

    <p>
      Ahora selecciona hasta 3 liceos de tu preferencia para guardar tu respuesta y descargar el PDF.
    </p>
  `;

  resultado.classList.remove("oculto");
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
      "El RUT debe ingresarse sin puntos y con guion. Ejemplo: 12345678-9";

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
  const establecimiento = document.getElementById("establecimiento").value;

  if (!validarRutFormato(rut)) {
    mensajeRut.textContent =
      "El RUT debe ingresarse sin puntos y con guion. Ejemplo: 12345678-9";

    rutInput.classList.add("input-error");
    rutInput.focus();
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
    puntajeCH,
    puntajeTP,
    porcentajeCH,
    porcentajeTP,
    tendencia
  };

  mostrarResumenTemporal(resultadoPendiente);

  document.getElementById("seleccionLiceos").classList.remove("oculto");

  document.getElementById("seleccionLiceos").scrollIntoView({
    behavior: "smooth"
  });
});

document.getElementById("btnGuardarPreferencias").addEventListener("click", async function() {
  const mensaje = document.getElementById("mensajeLiceos");
  const preferencias = obtenerLiceosSeleccionados();

  if (!resultadoPendiente) {
    mensaje.textContent = "Primero debes responder el test.";
    return;
  }

  if (preferencias.length === 0) {
    mensaje.textContent = "Debes seleccionar al menos 1 liceo.";
    return;
  }

  if (preferencias.length > 3) {
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

  const resultado = document.getElementById("resultado");

  resultado.innerHTML += `
    <div class="liceos-elegidos">
      <h3>Liceos seleccionados</h3>
      <ol>
        ${preferencias.map(liceo => `
          <li>
            <div class="establecimiento-preview">
              ${crearImagenInsignia(liceo, "insignia-liceo")}
              <strong>${liceo}</strong>
            </div>
          </li>
        `).join("")}
      </ol>
    </div>

    <button
      type="button"
      onclick="generarPDFResultado(
        '${resultadoPendiente.nombre.replace(/'/g, "\\'")}',
        '${resultadoPendiente.rut}',
        '${resultadoPendiente.establecimiento.replace(/'/g, "\\'")}',
        ${resultadoPendiente.porcentajeCH},
        ${resultadoPendiente.porcentajeTP},
        '${resultadoPendiente.tendencia}',
        ${JSON.stringify(preferencias).replace(/"/g, "&quot;")}
      )"
    >
      Descargar resultado en PDF
    </button>
  `;

  await generarPDFResultado(
    resultadoPendiente.nombre,
    resultadoPendiente.rut,
    resultadoPendiente.establecimiento,
    resultadoPendiente.porcentajeCH,
    resultadoPendiente.porcentajeTP,
    resultadoPendiente.tendencia,
    preferencias
  );

  document.getElementById("formTest").reset();
  document.getElementById("seleccionLiceos").classList.add("oculto");
  document.getElementById("establecimientoPreview").classList.add("oculto");
  document.getElementById("establecimientoPreview").innerHTML = "";

  document.querySelectorAll('input[name="liceosPreferencia"]').forEach(check => {
    check.checked = false;
  });

  document.querySelectorAll(".liceo-opcion").forEach(label => {
    label.classList.remove("seleccionado");
  });

  mensaje.textContent = "";
  mensajeRut.textContent = "";
  rutInput.classList.remove("input-error");

  resultadoPendiente = null;

  actualizarAvance();

  resultado.scrollIntoView({
    behavior: "smooth"
  });
});