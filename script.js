const preguntasCH = [
  "¿Te interesa continuar estudios superiores en una universidad?",
  "¿Te gusta leer, investigar y analizar información?",
  "¿Te interesa prepararte para rendir pruebas de admisión a la educación superior?",
  "¿Te acomoda estudiar asignaturas como Lenguaje, Matemática, Historia o Ciencias?",
  "¿Te gustaría profundizar conocimientos teóricos antes de elegir una carrera?",
  "¿Te interesa desarrollar habilidades de análisis, argumentación y pensamiento crítico?",
  "¿Te ves estudiando una carrera profesional en el futuro?",
  "¿Te gusta resolver problemas desde la reflexión y el estudio?",
  "¿Te interesa participar en debates, exposiciones o trabajos de investigación?",
  "¿Te gustaría tener una formación amplia antes de decidir tu especialidad?",
  "¿Te interesa prepararte para carreras del área de salud, educación, derecho, ingeniería u otras similares?",
  "¿Te sientes cómodo estudiando contenidos académicos durante varios años?",
  "¿Te gustaría ingresar a una universidad, instituto profesional o centro de formación técnica después de egresar?",
  "¿Te interesa desarrollar habilidades de comprensión lectora, escritura y análisis?",
  "¿Crees que una formación Científico Humanista se ajusta a tus intereses?"
];

const preguntasTP = [
  "¿Te interesa aprender una especialidad técnica durante la enseñanza media?",
  "¿Te gustaría egresar con un título técnico de nivel medio?",
  "¿Te interesa realizar actividades prácticas y aprender haciendo?",
  "¿Te gustaría prepararte para ingresar al mundo laboral al egresar del liceo?",
  "¿Te interesan áreas como administración, electricidad, mecánica, gastronomía, salud, informática u otras especialidades?",
  "¿Te acomoda trabajar en talleres, laboratorios o espacios prácticos?",
  "¿Te gustaría realizar una práctica profesional antes de terminar tu formación?",
  "¿Te interesa aprender habilidades útiles para trabajar o emprender?",
  "¿Te gustaría combinar estudios generales con formación técnica?",
  "¿Te ves trabajando en un área técnica en el futuro?",
  "¿Te interesa adquirir herramientas concretas para desempeñarte en un oficio o especialidad?",
  "¿Te gustaría continuar estudiando después, pero con una base técnica previa?",
  "¿Te motiva aprender usando herramientas, equipos, software o maquinaria?",
  "¿Crees que una formación Técnico Profesional puede ayudarte a cumplir tus metas?",
  "¿Te interesa una educación más vinculada al trabajo y la práctica?"
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
        <label>
          <input type="radio" name="${nombrePregunta}" value="2" required>
          Sí
        </label>

        <label>
          <input type="radio" name="${nombrePregunta}" value="1">
          No lo sé
        </label>

        <label>
          <input type="radio" name="${nombrePregunta}" value="0">
          No
        </label>
      </div>
    `;

    contenedor.appendChild(div);
  });
}

crearPreguntas(preguntasCH, "preguntasCH", "ch");
crearPreguntas(preguntasTP, "preguntasTP", "tp");

document.getElementById("formTest").addEventListener("submit", function(event) {
  event.preventDefault();

  const nombre = document.getElementById("nombre").value;
  const rut = document.getElementById("rut").value;
  const establecimiento = document.getElementById("establecimiento").value;

  let puntajeCH = 0;
  let puntajeTP = 0;

  for (let i = 1; i <= 15; i++) {
    puntajeCH += parseInt(document.querySelector(`input[name="ch${i}"]:checked`).value);
    puntajeTP += parseInt(document.querySelector(`input[name="tp${i}"]:checked`).value);
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

    <p class="tendencia">Tendencia predominante: ${tendencia}</p>
  `;

  resultado.classList.remove("oculto");
  resultado.scrollIntoView({ behavior: "smooth" });
});