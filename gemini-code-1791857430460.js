import * as THREE from 'three';

// 1. Configuración del escenario 3D
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xdcdcdc);

const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.set(12, 10, 18);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

// Iluminación de la escena
const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
dirLight.position.set(10, 20, 15);
scene.add(dirLight);
scene.add(new THREE.AmbientLight(0x606060));

// Malla visual de la Vía y Representación del Socavón
const roadGeometry = new THREE.BoxGeometry(8, 0.4, 20);
const roadMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
const roadMesh = new THREE.Mesh(roadGeometry, roadMaterial);
roadMesh.position.y = -0.2;
scene.add(roadMesh);

// Malla 3D para la zona afectada (Visualización dinámica)
const holeGeometry = new THREE.CylinderGeometry(1, 1, 1, 32);
const holeMaterial = new THREE.MeshPhongMaterial({ color: 0xc93b2b, wireframe: false });
const holeMesh = new THREE.Mesh(holeGeometry, holeMaterial);
scene.add(holeMesh);

// Guía de plano / cuadrícula
const gridHelper = new THREE.GridHelper(30, 30);
gridHelper.position.y = -0.4;
scene.add(gridHelper);

// 2. Núcleo Matemático y Actualización de Interfaz
function calcularModeloVial() {
  const anchoTotal = parseFloat(document.getElementById('ancho').value); // m
  const x_borde = anchoTotal / 2;                                          // Semiancho
  const c = parseFloat(document.getElementById('profundidad').value);     // m
  const tramo = parseFloat(document.getElementById('tramo').value);       // m

  // --- REQUISITO MATEMÁTICO 1: Ecuación Cuadrática ---
  // Perfil parabólico y área de la sección transversal: A = (4/3) * x_borde * c
  const areaSeccion = (4 / 3) * x_borde * c;

  // --- REQUISITO MATEMÁTICO 2: Operaciones con Decimales Exactos ---
  // Volumen de asfalto V = Área * Longitud y Masa M = V * Densidad (2.35 t/m³)
  const volumen = areaSeccion * tramo;
  const masa = volumen * 2.35;

  // --- REQUISITO MATEMÁTICO 3: Ecuación Lineal ---
  // Costo C(V) = V * Valor_M3 + Costos_Fijos
  const valorM3 = 450000;
  const costosFijos = 1200000;
  const costoTotal = (volumen * valorM3) + costosFijos;

  // Modificar escala 3D en la escena
  holeMesh.scale.set(anchoTotal / 2, c * 2, tramo / 4);
  holeMesh.position.set(0, 0, 0);

  // Actualizar etiquetas en la interfaz gráfica
  document.getElementById('val-ancho').innerText = anchoTotal.toFixed(2);
  document.getElementById('val-profundidad').innerText = c.toFixed(2);
  document.getElementById('val-tramo').innerText = tramo.toFixed(2);

  document.getElementById('m-area').innerText = areaSeccion.toFixed(3);
  document.getElementById('m-volumen').innerText = volumen.toFixed(3);
  document.getElementById('m-masa').innerText = masa.toFixed(2);
  document.getElementById('m-costo').innerText = costoTotal.toLocaleString('es-CO', { minimumFractionDigits: 2 });
}

// 3. Escuchadores de eventos para los rangos de entrada
['ancho', 'profundidad', 'tramo'].forEach(id => {
  document.getElementById(id).addEventListener('input', calcularModeloVial);
});

// Ajustar cuando cambia el tamaño de la ventana
window.addEventListener('resize', () => {
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
});

// Bucle de animación de Three.js
function animate() {
  requestAnimationFrame(animate);
  roadMesh.rotation.y += 0.001;
  holeMesh.rotation.y += 0.001;
  renderer.render(scene, camera);
}

// Inicialización
calcularModeloVial();
animate();