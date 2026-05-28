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
  "¿Te gustaría participar en proyectos que requieran resultados concretos y medibles"
];

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
  const regex = /^[0-9]{7,8}-[0-9K]$/;
  return regex.test(rut);
}

function actualizarAvance() {
  const respondidas = document.querySelectorAll('input[type="radio"]:checked').length;
  const total = 30;
  const porcentaje = Math.round((respondidas / total) * 100);

  document.getElementById("textoAvance").textContent =
    `${respondidas} de ${total} respondidas`;

  document.getElementById("progresoAvance").style.width =
    porcentaje + "%";
}

function generarPDFResultado(nombre, rut, establecimiento, porcentajeCH, porcentajeTP, tendencia) {
  const { jsPDF } = window.jspdf;

  const doc = new jsPDF();

  const fecha = new Date().toLocaleDateString("es-CL");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Resultado Test Vocacional", 20, 25);

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Enseñanza Media - DAEM Talca", 20, 34);

  doc.line(20, 40, 190, 40);

  doc.setFont("helvetica", "bold");
  doc.text("Datos del estudiante", 20, 52);

  doc.setFont("helvetica", "normal");
  doc.text(`Nombre: ${nombre}`, 20, 62);
  doc.text(`RUT: ${rut}`, 20, 70);
  doc.text(`Establecimiento: ${establecimiento}`, 20, 78);
  doc.text(`Fecha: ${fecha}`, 20, 86);

  doc.setFont("helvetica", "bold");
  doc.text("Resultados", 20, 102);

  doc.setFont("helvetica", "normal");
  doc.text(`Científico Humanista: ${porcentajeCH}%`, 20, 114);
  doc.text(`Técnico Profesional: ${porcentajeTP}%`, 20, 124);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(`Tendencia predominante: ${tendencia}`, 20, 142);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");

  const textoOrientacion =
    "Este resultado es referencial y tiene como finalidad apoyar el proceso de orientación vocacional del estudiante. No constituye una decisión definitiva, sino una herramienta de apoyo para conversar con la familia, el establecimiento y los equipos de orientación.";

  const lineas = doc.splitTextToSize(textoOrientacion, 170);
  doc.text(lineas, 20, 160);

  doc.setFontSize(10);
  doc.text("Departamento de Administración de Educación Municipal - Talca", 20, 280);

  const nombreArchivo = `resultado-test-vocacional-${rut}.pdf`;

  doc.save(nombreArchivo);
}

crearPreguntas(preguntasCH, "preguntasCH", "ch");
crearPreguntas(preguntasTP, "preguntasTP", "tp");

document.querySelectorAll('input[type="radio"]').forEach(radio => {
  radio.addEventListener("change", actualizarAvance);
});

const rutInput = document.getElementById("rut");
const mensajeRut = document.getElementById("mensajeRut");

rutInput.addEventListener("blur", function () {
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
  } else {
    mensajeRut.textContent = "";
    rutInput.classList.remove("input-error");
    rutInput.value = rut;
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

  const { error } = await supabaseClient
    .from("respuestas_test_vocacional")
    .insert({
      nombre,
      rut,
      establecimiento,
      puntaje_ch: puntajeCH,
      puntaje_tp: puntajeTP,
      porcentaje_ch: porcentajeCH,
      porcentaje_tp: porcentajeTP,
      tendencia
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

  resultado.innerHTML = `
    <h2>Resultado del Test Vocacional</h2>

    <p><strong>Estudiante:</strong> ${nombre}</p>
    <p><strong>RUT:</strong> ${rut}</p>
    <p><strong>Establecimiento:</strong> ${establecimiento}</p>

    <h3>Científico Humanista</h3>
    <div class="barra">
      <div class="progreso" style="width: ${porcentajeCH}%;">
        ${porcentajeCH}%
      </div>
    </div>

    <h3>Técnico Profesional</h3>
    <div class="barra">
      <div class="progreso" style="width: ${porcentajeTP}%;">
        ${porcentajeTP}%
      </div>
    </div>

    <p class="tendencia">
      Tendencia predominante: ${tendencia}
    </p>

    <button
      type="button"
      onclick="generarPDFResultado('${nombre.replace(/'/g, "\\'")}', '${rut}', '${establecimiento.replace(/'/g, "\\'")}', ${porcentajeCH}, ${porcentajeTP}, '${tendencia}')"
    >
      Descargar resultado en PDF
    </button>
  `;

  resultado.classList.remove("oculto");

  resultado.scrollIntoView({
    behavior: "smooth"
  });

  generarPDFResultado(
    nombre,
    rut,
    establecimiento,
    porcentajeCH,
    porcentajeTP,
    tendencia
  );

  document.getElementById("formTest").reset();

  mensajeRut.textContent = "";
  rutInput.classList.remove("input-error");

  actualizarAvance();
});