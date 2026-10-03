# Catálogo de Actividades Educativas Imprimibles (PDF)

Documento de referencia para la expansión del catálogo de generadores en plataformas web y entornos VPS. Todas las actividades están diseñadas para ejecutarse con algoritmos ligeros y renderizarse mediante HTML/CSS (Print stylesheet) o SVG antes de exportar a PDF (mediante herramientas como Puppeteer, WeasyPrint o librerías nativas del navegador).

---

## 1. Lengua y Vocabulario

### 1.1 Bingo de Palabras / Conceptos
* **Descripción:** Generador de cartones únicos ($3 \times 3$, $4 \times 4$ o $5 \times 5$) a partir de un banco de términos temáticos. Incluye una hoja de control para el docente con las definiciones o pistas de lectura.
* **Público:** Primaria inicial (palabras/imágenes) a Secundaria (definiciones técnicas o literarias).
* **Parámetros configurables:**
  * Tamaño de cuadrícula.
  * Inclusión de casillero libre central ("Free").
  * Cantidad de cartones únicos a exportar (1 a 40 copias).
* **Implementación técnica:** Shuffle de arrays (`Fisher-Yates`), layout mediante CSS Grid con saltos de página controlados (`page-break-after: always`).

### 1.2 Ordenar Textos / Párrafos Desordenados
* **Descripción:** Narraciones breves, procesos científicos o secuencias cronológicas cuyos fragmentos u oraciones se presentan desordenados con casilleros numéricos en blanco para asignar el orden lógico.
* **Público:** Primaria media y Secundaria.
* **Parámetros configurables:**
  * Número de oraciones o párrafos (3 a 8 pasos).
  * Modo de respuesta: números correlativos, letras o recortable.
* **Implementación técnica:** Parsing de texto por líneas/saltos de párrafo, barajado aleatorio y generación de hoja de soluciones con la secuencia correcta.

### 1.3 Cazador de Intrusos (Odd One Out)
* **Descripción:** Filas de 4 o 5 elementos (palabras, imágenes o fórmulas) donde una no pertenece a la misma categoría gramatical, campo semántico o regla ortográfica.
* **Público:** Primaria y primer ciclo de Secundaria.
* **Parámetros configurables:**
  * Cantidad de filas por página (5 a 10).
  * Criterio pedagógico: sinónimos, acentuación, clases de palabras o campos temáticos.
* **Implementación técnica:** Arrays con 1 elemento discordante (`target`) y 3-4 distractores del mismo grupo (`group`).

### 1.4 Mapas Léxicos / Sol Semántico
* **Descripción:** Diagrama central con un término o raíz léxica rodeado de burbujas vacías para completar derivados, familias de palabras, antónimos, sinónimos y oraciones de ejemplo.
* **Público:** Primaria media y Secundaria.
* **Parámetros configurables:**
  * Disposición de nodos (4, 6 u 8 ramas).
  * Tipo de ejercicio: morfología (lexema y morfemas), semántica o uso en contexto.
* **Implementación técnica:** Layout mediante CSS Flexbox/Grid o `<svg>` radial centrado con cajas de texto editables.

---

## 2. Lógica y Matemáticas

### 2.1 Cadenas de Operaciones (Math Chains)
* **Descripción:** Serie de casillas interconectadas donde el resultado de una operación aritmética se convierte automáticamente en el operando inicial del siguiente eslabón:
  $$\text{Inicio: } 12 \xrightarrow{+ 8} [\quad] \xrightarrow{\div 4} [\quad] \xrightarrow{\times 6} [\quad]$$
* **Público:** Primaria y Secundaria inicial.
* **Parámetros configurables:**
  * Longitud de la cadena (4 a 8 eslabones).
  * Operaciones permitidas ($+$, $-$, $\times$, $\div$, potencias).
  * Rango de resultados (control de enteros positivos, decimales o negativos).
* **Implementación técnica:** Generación algorítmica incremental con verificación de números enteros para evitar divisiones inexactas en primaria.

### 2.2 Balanza de Ecuaciones Visuales (Álgebra con Emojis)
* **Descripción:** Sistema de 2 o 3 ecuaciones lineales donde las incógnitas son sustituidas por íconos o ilustraciones temáticas, finalizando con una pregunta o cálculo a resolver.
  $$\text{Ejemplo: } \clubsuit + \clubsuit = 14 \quad;\quad \clubsuit \times \spadesuit = 21 \quad;\quad \spadesuit + ? = 10$$
* **Público:** Primaria avanzada y Secundaria.
* **Parámetros configurables:**
  * Nivel de dificultad: 2 incógnitas (fácil), 3 incógnitas con multiplicación/prioridad de operaciones (medio/difícil).
  * Conjunto visual: iconos SVG temáticos (frutas, material escolar, geometría).
* **Implementación técnica:** Resolución matricial o sustitución reversa simple para asegurar valores enteros no fraccionarios.

### 2.3 Ruedas / Roscos de Cálculo Rápido
* **Descripción:** Círculo concéntrico con una base fija en el núcleo (ejemplo: $\times 7$ o $+ 25$), un anillo intermedio con números aleatorios del 1 al 12, y un anillo exterior vacío para que el estudiante calcule y escriba el resultado.
* **Público:** Primaria.
* **Parámetros configurables:**
  * Operación núcleo: suma, resta, producto o división.
  * Cantidad de segmentos (8, 10 o 12 radios).
  * Distribución: 2 a 4 ruedas por hoja A4.
* **Implementación técnica:** Renderizado de sectores circulares mediante SVG (`path` con arcos o rotaciones de texto CSS).

### 2.4 Secuencias y Patrones Numéricos
* **Descripción:** Filas horizontales que exhiben progresiones aritméticas, geométricas o lógicas con casillas vacías intercaladas que el alumno debe deducir y completar.
* **Público:** Primaria y Secundaria.
* **Parámetros configurables:**
  * Patrón: incremento fijo ($+3$), multiplicativo ($\times 2$), alternante ($+2, -1$) o Fibonacci.
  * Posición de las incógnitas: al final, intercaladas o al inicio.
* **Implementación técnica:** Cálculo de series numéricas con máscara aleatoria sobre ciertos índices de la lista.

---

## 3. Visual, Motricidad y Geometría

### 3.1 Dibujo en Espejo / Simetría en Cuadrícula
* **Descripción:** Grilla ortogonal con un eje central de simetría (vertical u horizontal). La mitad contiene una figura geométrica o ilustración simplificada; la otra mitad permanece en blanco para que el alumno la reproduzca por reflexión.
* **Público:** Primaria inicial y media.
* **Parámetros configurables:**
  * Tamaño de cuadrícula: $8 \times 8$, $12 \times 12$ o $16 \times 16$.
  * Eje: vertical (estándar) u horizontal.
  * Complejidad: polígonos ortogonales (fácil) o diagonales y curvas (difícil).
* **Implementación técnica:** Generación de matrices binarias simétricas y renderizado en SVG o celdas HTML con bordes vectoriales.

### 3.2 Unir Puntos Numerados (Dot-to-Dot)
* **Descripción:** Silueta compuesta por vértices numerados correlativamente que el estudiante conecta con trazos rectos para descubrir la figura final.
* **Público:** Primaria.
* **Parámetros configurables:**
  * Salto de la serie: de 1 en 1, de 2 en 2, de 5 en 5 o números romanos.
  * Cantidad de nodos (20 a 100 puntos).
* **Implementación técnica:** Archivos SVG base de polilíneas o rutas vectoriales cuyos nodos se extraen y se reemplazan por círculos y etiquetas de texto secuenciales.

### 3.3 Colorear por Código / Operaciones (Color by Code)
* **Descripción:** Ilustración dividida en regiones cerradas numeradas. Cada número corresponde a una clave de color o al resultado de una pequeña operación matemática ($3 + 4 = 7 \rightarrow \text{Azul}$).
* **Público:** Primaria inicial y media.
* **Parámetros configurables:**
  * Clave directa: número = color.
  * Clave con cálculo: sumas, restas o multiplicaciones básicas.
  * Paleta: 4 a 8 colores primarios y secundarios.
* **Implementación técnica:** SVG con áreas etiquetadas por identificadores únicos y cálculo de centroides para posicionar los textos centrados en cada polígono.

### 3.4 Copia y Escalado en Cuadrícula
* **Descripción:** Hoja dividida en dos paneles: el izquierdo contiene un dibujo de referencia sobre una cuadrícula numerada (filas A-E, columnas 1-5); el derecho ofrece una cuadrícula vacía (al mismo tamaño o con escala $1.5\times$) para reproducción guiada.
* **Público:** Primaria.
* **Parámetros configurables:**
  * Resolución de cuadrícula: $4 \times 4$ hasta $10 \times 10$.
  * Escala del lienzo destino: 1:1 o ampliado.
* **Implementación técnica:** Superposición de grillas CSS/SVG sobre gráficos vectoriales optimizados para trazo lineal.

---

## 4. Ciencias, Historia y Geografía

### 4.1 Líneas de Tiempo Ilustradas
* **Descripción:** Eje horizontal o vertical graduado con hitos vacíos vinculados a un banco de eventos, fechas o nombres que deben asociarse en el orden cronológico adecuado.
* **Público:** Primaria superior y Secundaria.
* **Parámetros configurables:**
  * Número de eventos (4 a 10 hitos).
  * Modo de resolución: relacionar con flechas, escribir texto o recortar y pegar.
* **Implementación técnica:** SVG lineal con coordenadas calculadas proporcionalmente según los años o espaciadas equidistantemente.

### 4.2 Mapas Mudos y Esquemas Anatómicos Etiquetables
* **Descripción:** Siluetas de regiones geográficas (continentes, países, provincias) o esquemas biológicos (aparato circulatorio, célula, flor) con líneas indicadoras apuntando a cajas de texto en blanco.
* **Público:** Primaria media a Secundaria.
* **Parámetros configurables:**
  * Inclusión de banco de respuestas (para nivel fácil/medio) o espacio abierto.
  * Densidad de etiquetas: de 5 a 15 elementos a identificar.
* **Implementación técnica:** Repositorio de SVGs limpios con metadatos en los `paths` para calcular automáticamente la posición del puntero y la caja receptora.

### 4.3 Diagramas de Venn Conceptuales
* **Descripción:** Dos o tres circunferencias superpuestas que definen zonas exclusivas y de intersección para comparar dos conceptos, periodos históricos o reinos biológicos a partir de un listado de características.
* **Público:** Primaria avanzada y Secundaria.
* **Parámetros configurables:**
  * Configuración de 2 conjuntos (clásico) o 3 conjuntos.
  * Lista de afirmaciones a clasificar (8 a 16 ítems).
* **Implementación técnica:** Formas vectoriales transparentes con bordes oscuros e inclusión de cajas de texto multilínea distribuidas por cuadrantes.

---

## 5. Resumen Comparativo de Implementación Técnica

| Actividad | Dependencia de Datos | Complejidad de Render | Formato Recomendado | Hoja de Soluciones Automática |
| :--- | :--- | :--- | :--- | :--- |
| **Bingo** | Lista de strings | Muy baja | HTML + CSS Grid | Sí (lista de llamada) |
| **Ordenar Textos** | Párrafos de entrada | Muy baja | HTML puro | Sí (secuencia numérica) |
| **Cazador de Intrusos** | Diccionario semántico | Baja | Tablas HTML / Flexbox | Sí (clave marcada) |
| **Cadenas de Operaciones** | Algoritmo numérico | Baja | HTML / Inline SVG | Sí (cadena completa) |
| **Balanza de Ecuaciones** | Sistema 2-3 variables | Media | Flexbox + SVG icons | Sí (valores de incógnitas) |
| **Ruedas Numéricas** | Array radial | Media | SVG vectorial | Sí (anillo exterior completo) |
| **Dibujo en Espejo** | Matriz simétrica | Media | SVG / Canvas estático | Sí (figura reflejada) |
| **Unir Puntos** | Polilínea SVG | Media | SVG vectorial | Sí (trazo continuo visible) |
| **Color by Code** | SVG particionado | Media-Alta | SVG interactivo | Sí (versión a color) |
| **Líneas de Tiempo** | Tuplas (fecha, evento)| Media | SVG estructurado | Sí (eje resuelto) |
| **Mapas Mudos** | SVG geográfico/médico | Media | SVG con labels | Sí (etiquetas asignadas) |