import React, { useState, useEffect } from 'react';
// Importar Chart.js y react-chartjs-2
import { Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
// Importar math.js
// --- NOTA DE CORRECCIÓN ---
// El error "Could not resolve 'mathjs'" significa que la librería no está instalada.
// Por favor, ejecuta "npm install mathjs" en tu terminal para solucionarlo.
import * as math from 'mathjs';
// --- FIN DE CORRECCIÓN ---

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// URL de la API de Python (Flask)
// Asegúrate de que tu servidor Python esté corriendo en este puerto
const API_URL = 'http://127.0.0.1:5000/api';

// --- Componente de Tabla Genérico ---
const ResultsTable = ({ data }) => {
  if (!data || data.length === 0) {
    return <p className="text-gray-500 italic">No hay datos en la tabla.</p>;
  }
  
  const headers = Object.keys(data[0]);
  
  return (
    <div className="max-h-60 overflow-y-auto mt-4 border rounded shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead className="bg-gray-100 sticky top-0">
          <tr>
            {headers.map(h => <th key={h} className="border p-3 text-sm font-bold text-gray-700">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="hover:bg-blue-50 transition-colors">
              {headers.map(h => <td key={`${i}-${h}`} className="border p-2 text-sm font-mono text-gray-700">{row[h]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// --- Componente de Gráfica Cap. 1 ---
const Cap1Chart = ({ fnString, root }) => {
  const [chartData, setChartData] = useState({ datasets: [] });

  useEffect(() => {
    if (!fnString) return;

    let fn;
    try {
      fn = math.parse(fnString).compile();
    } catch (e) {
      // Error silencioso mientras se escribe
      return;
    }

    const data = [];
    // Definir un rango alrededor de la raíz o el origen
    const rangeCenter = (root !== null && root !== undefined) ? root : 0;
    const rangeMin = rangeCenter - 5;
    const rangeMax = rangeCenter + 5;
    const step = 0.2; // Paso para la gráfica

    for (let x = rangeMin; x <= rangeMax; x += step) {
      try {
        const y = fn.evaluate({ x: x });
        // Verificar que sea un número real finito
        if (typeof y === 'number' && isFinite(y)) {
             data.push({ x: x, y: y });
        }
      } catch (e) {}
    }

    const rootData = [];
    if (root !== null && root !== undefined) {
        try {
            const y = fn.evaluate({ x: root });
             if (typeof y === 'number') {
                rootData.push({ x: root, y: y });
             }
        } catch(e) {}
    }

    setChartData({
      datasets: [
        {
          label: 'f(x)',
          data: data,
          borderColor: '#3b82f6', // Azul
          borderWidth: 2,
          tension: 0.4, // Curvatura suave
          showLine: true,
          type: 'line',
          pointRadius: 0, // Ocultar puntos de la línea
          pointHoverRadius: 0
        },
        {
          label: 'Raíz',
          data: rootData,
          backgroundColor: '#ef4444', // Rojo
          borderColor: '#ef4444',
          type: 'scatter',
          pointRadius: 6,
          pointHoverRadius: 8
        },
      ],
    });
  }, [fnString, root]);

  return (
    <div className="bg-white p-4 rounded-md shadow-inner border border-gray-200" style={{ height: '350px' }}>
      <Scatter data={chartData} options={{ 
          responsive: true, 
          maintainAspectRatio: false,
          plugins: {
              legend: { position: 'top' },
              tooltip: { enabled: true }
          },
          scales: {
              x: { grid: { color: '#f3f4f6' } },
              y: { grid: { color: '#f3f4f6' } }
          }
      }} />
    </div>
  );
};

// --- Componente Principal ---
export default function App() {
  const [activeTab, setActiveTab] = useState('cap1');
  const [loading, setLoading] = useState(false);
  
  // --- Estados Cap 1 ---
  const [c1Fn, setC1Fn] = useState('x^3 - x - 2');
  const [c1a, setC1a] = useState('1');
  const [c1b, setC1b] = useState('2');
  const [c1x0, setC1x0] = useState('1');
  const [c1x1, setC1x1] = useState('1.1'); // Para Secante
  const [c1gFn, setC1gFn] = useState('pow(x+2, 1/3)'); // Para Punto Fijo
  const [c1Tol, setC1Tol] = useState('0.00001');
  const [c1Iter, setC1Iter] = useState('100');
  const [c1Result, setC1Result] = useState(null);
  const [c1Error, setC1Error] = useState(null);
  const [c1Derivada, setC1Derivada] = useState('');

  // --- Estados Cap 2 ---
  const [c2Tamano, setC2Tamano] = useState(3);
  // Inicializar matriz 3x3 por defecto
  const [c2Matrix, setC2Matrix] = useState([['4', '1', '-1'], ['2', '7', '1'], ['1', '-3', '12']]);
  const [c2Vector, setC2Vector] = useState(['3', '19', '31']);
  const [c2Tol, setC2Tol] = useState('0.00001');
  const [c2Iter, setC2Iter] = useState('100');
  const [c2Omega, setC2Omega] = useState('1.1'); // Para SOR
  const [c2Result, setC2Result] = useState(null);
  const [c2Error, setC2Error] = useState(null);
  
  // --- Estados Cap 3 ---
  const [c3Puntos, setC3Puntos] = useState([{x: '0', y: '1'}, {x: '1', y: '3'}, {x: '2', y: '2'}]);
  const [c3Result, setC3Result] = useState(null);
  const [c3Error, setC3Error] = useState(null);

  // --- Componente de Botón de Pestaña ---
  const TabButton = ({ id, label }) => (
    <button
      className={`py-2 px-5 font-semibold text-sm rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300 ${
        activeTab === id
          ? 'bg-blue-600 text-white shadow'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
      }`}
      onClick={() => setActiveTab(id)}
    >
      {label}
    </button>
  );

  // --- Lógica para Cap 2 (Matrices) ---
  const handleMatrixSizeChange = (e) => {
    const val = e.target.value;
    const N = parseInt(val, 10);
    
    if (isNaN(N) || N < 2 || N > 7) return;
    
    setC2Tamano(N);
    // Crear nueva matriz vacía del tamaño seleccionado
    const newMatrix = Array(N).fill(0).map(() => Array(N).fill('0'));
    const newVector = Array(N).fill('0');
    setC2Matrix(newMatrix);
    setC2Vector(newVector);
  };
  
  const handleMatrixChange = (val, i, j) => {
    const newMatrix = c2Matrix.map(row => [...row]); // Copia profunda simple
    newMatrix[i][j] = val;
    setC2Matrix(newMatrix);
  };
  
  const handleVectorChange = (val, i) => {
    const newVector = [...c2Vector];
    newVector[i] = val;
    setC2Vector(newVector);
  };
  
  // --- Lógica para Cap 3 (Puntos) ---
    const handlePointChange = (val, i, field) => {
        const newPuntos = c3Puntos.map((p, idx) => {
            if (idx === i) return { ...p, [field]: val };
            return p;
        });
        setC3Puntos(newPuntos);
    };
    const addPunto = () => {
        if(c3Puntos.length < 8) setC3Puntos([...c3Puntos, {x: '0', y: '0'}]);
    };
    const remPunto = () => {
        if(c3Puntos.length > 2) setC3Puntos(c3Puntos.slice(0, -1));
    };

  // --- Manejador Central de API ---
  const handleApiCall = async (endpoint, body, setResult, setError) => {
    setLoading(true);
    // Limpiar resultados y errores específicos del capítulo
    if (setError === setC1Error) { setC1Result(null); setC1Error(null); }
    if (setError === setC2Error) { setC2Result(null); setC2Error(null); }
    if (setError === setC3Error) { setC3Result(null); setC3Error(null); }
    
    try {
      const response = await fetch(`${API_URL}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error desconocido del servidor Python.');
      }
      
      setResult(data);
      // Si es Newton, guardar la derivada que devuelve el backend
      if(endpoint === 'newton') setC1Derivada(data.derivada || '');

    } catch (err) {
      console.error(err);
      setError(err.message || "Error de conexión. Asegúrate de ejecutar 'python app.py'.");
    } finally {
      setLoading(false);
    }
  };

  // --- Wrappers para las llamadas ---
  const runBiseccion = () => {
    handleApiCall('biseccion', 
      { fnString: c1Fn, a: c1a, b: c1b, tol: c1Tol, maxIter: c1Iter },
      setC1Result, setC1Error
    );
  };
  
  const runNewton = () => {
    handleApiCall('newton', 
      { fnString: c1Fn, x0: c1x0, tol: c1Tol, maxIter: c1Iter },
      setC1Result, setC1Error
    );
  };

  const runReglaFalsa = () => {
    handleApiCall('regla_falsa', 
      { fnString: c1Fn, a: c1a, b: c1b, tol: c1Tol, maxIter: c1Iter },
      setC1Result, setC1Error
    );
  };

  const runSecante = () => {
    handleApiCall('secante', 
      { fnString: c1Fn, x0: c1x0, x1: c1x1, tol: c1Tol, maxIter: c1Iter },
      setC1Result, setC1Error
    );
  };
  
  const runPuntoFijo = () => {
    handleApiCall('punto_fijo', 
      { gString: c1gFn, x0: c1x0, tol: c1Tol, maxIter: c1Iter },
      setC1Result, setC1Error
    );
  };
  
  const runJacobi = () => {
    // Convertir strings a números para enviar
    const A = c2Matrix.map(row => row.map(val => parseFloat(val)));
    const b = c2Vector.map(val => parseFloat(val));
    
    // Validación simple
    if (A.flat().some(isNaN) || b.some(isNaN)) {
        setC2Error("Por favor, asegúrate de que todos los campos de la matriz y el vector sean números.");
        return;
    }
    handleApiCall('jacobi',
      { A, b, tol: c2Tol, maxIter: c2Iter },
      setC2Result, setC2Error
    );
  };

  const runGaussSeidel = () => {
    const A = c2Matrix.map(row => row.map(val => parseFloat(val)));
    const b = c2Vector.map(val => parseFloat(val));
    if (A.flat().some(isNaN) || b.some(isNaN)) {
        setC2Error("Matriz A y Vector B deben contener solo números.");
        return;
    }
    handleApiCall('gauss_seidel',
      { A, b, tol: c2Tol, maxIter: c2Iter },
      setC2Result, setC2Error
    );
  };

  const runSOR = () => {
    const A = c2Matrix.map(row => row.map(val => parseFloat(val)));
    const b = c2Vector.map(val => parseFloat(val));
    if (A.flat().some(isNaN) || b.some(isNaN)) {
        setC2Error("Matriz A y Vector B deben contener solo números.");
        return;
    }
    handleApiCall('sor',
      { A, b, tol: c2Tol, maxIter: c2Iter, omega: c2Omega },
      setC2Result, setC2Error
    );
  };
  
   const runVandermonde = () => {
    const puntos = c3Puntos.map(p => ({ x: parseFloat(p.x), y: parseFloat(p.y) }));
    if (puntos.some(p => isNaN(p.x) || isNaN(p.y))) {
        setC3Error("Todos los puntos (x, y) deben ser números válidos.");
        return;
    }
    handleApiCall('vandermonde', { puntos }, setC3Result, setC3Error);
  };

  const runLagrange = () => {
    const puntos = c3Puntos.map(p => ({ x: parseFloat(p.x), y: parseFloat(p.y) }));
    if (puntos.some(p => isNaN(p.x) || isNaN(p.y))) {
        setC3Error("Todos los puntos (x, y) deben ser números válidos.");
        return;
    }
    handleApiCall('lagrange', { puntos }, setC3Result, setC3Error);
  };

  const runNewtonInterp = () => {
    const puntos = c3Puntos.map(p => ({ x: parseFloat(p.x), y: parseFloat(p.y) }));
    if (puntos.some(p => isNaN(p.x) || isNaN(p.y))) {
        setC3Error("Todos los puntos (x, y) deben ser números válidos.");
        return;
    }
    handleApiCall('newton_interp', { puntos }, setC3Result, setC3Error);
  };

  const runSplineLineal = () => {
    const puntos = c3Puntos.map(p => ({ x: parseFloat(p.x), y: parseFloat(p.y) }));
    if (puntos.some(p => isNaN(p.x) || isNaN(p.y))) {
        setC3Error("Todos los puntos (x, y) deben ser números válidos.");
        return;
    }
    handleApiCall('spline_lineal', { puntos }, setC3Result, setC3Error);
  };

  // --- Botón de Acción Genérico ---
  const ActionButton = ({ onClick, loading, children, className }) => (
    <button
      onClick={onClick}
      disabled={loading}
      className={`w-full py-2.5 px-4 font-semibold text-white rounded-md shadow-sm transition-all duration-150
                  ${className}
                  disabled:opacity-60 disabled:cursor-not-allowed
                  active:transform active:scale-[0.98]
                  hover:shadow-md hover:scale-[1.02]`}
    >
      {children}
    </button>
  );


  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-800 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-600 shadow-md border-b-4 border-blue-800 mb-8">
        <div className="container mx-auto p-5 md:px-8">
            <h1 className="text-3xl font-bold text-white text-center md:text-left">Análisis Numérico</h1>
            <p className="text-blue-100 text-center md:text-left mt-1">Proyecto Final - React & Python</p>
        </div>
      </div>

      <div className="container mx-auto p-4 md:px-8 max-w-7xl">
        
        {/* Navegación */}
        <div className="bg-white rounded-lg shadow-sm p-2 mb-8 flex flex-wrap gap-2 border border-gray-200">
          <TabButton id="cap1" label="Capítulo 1: Raíces" />
          <TabButton id="cap2" label="Capítulo 2: Sistemas" />
          <TabButton id="cap3" label="Capítulo 3: Interpolación" />
        </div>

        {/* Indicador de Carga */}
        {loading && (
          <div className="fixed bottom-6 right-6 bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg z-50 animate-pulse flex items-center gap-3">
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="font-semibold">Procesando...</span>
          </div>
        )}

        {/* =================== CAPÍTULO 1: RAÍCES =================== */}
        {activeTab === 'cap1' && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">Búsqueda de Raíces</h2>
                <p className="text-sm text-gray-500">Métodos de Bisección, Regla Falsa, Newton, Secante y Punto Fijo</p>
            </div>
            
            <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Columna Izquierda: Inputs y Gráfica */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-blue-50 p-5 rounded-lg border border-blue-100 shadow-sm">
                    <div className="mb-4">
                        <label className="block text-sm font-bold text-blue-800 mb-2">Función f(x)</label>
                        <input 
                        type="text" 
                        value={c1Fn} 
                        onChange={e => setC1Fn(e.target.value)} 
                        className="w-full p-3 border border-blue-200 rounded-md focus:ring-2 focus:ring-blue-500 outline-none bg-white" 
                        placeholder="Ej: x^2 - 4"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-blue-800 mb-2">Derivada f'(x)</label>
                        <input 
                        type="text" 
                        value={c1Derivada} 
                        readOnly 
                        className="w-full p-3 border border-blue-200 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed" 
                        placeholder="Se calculará automáticamente..."
                        />
                    </div>
                </div>
                <Cap1Chart fnString={c1Fn} root={c1Result?.raiz} />
              </div>
              
              {/* Columna Derecha: Parámetros y Botones */}
              <div className="space-y-6">
                <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                  <h3 className="font-semibold text-gray-700 mb-3 uppercase text-xs tracking-wider">Parámetros Globales</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Tolerancia</label>
                      <input type="text" value={c1Tol} onChange={e => setC1Tol(e.target.value)} className="w-full p-2 border rounded focus:ring-1 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Iteraciones</label>
                      <input type="number" value={c1Iter} onChange={e => setC1Iter(e.target.value)} className="w-full p-2 border rounded focus:ring-1 focus:ring-blue-500" />
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                    <h3 className="font-semibold text-gray-800 mb-3">Método Cerrado (Bisección)</h3>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                        <input type="number" value={c1a} onChange={e => setC1a(e.target.value)} className="p-2 border rounded text-center" placeholder="a" />
                        <input type="number" value={c1b} onChange={e => setC1b(e.target.value)} className="p-2 border rounded text-center" placeholder="b" />
                    </div>
                    <ActionButton onClick={runBiseccion} loading={loading} className="bg-gray-800 hover:bg-gray-900">
                        Calcular Bisección
                    </ActionButton>
                    <ActionButton onClick={runReglaFalsa} loading={loading} className="bg-gray-700 hover:bg-gray-800 mt-2">
                        Calcular Regla Falsa
                    </ActionButton>
                </div>

                <div className="border-t border-gray-200 pt-4">
                    <h3 className="font-semibold text-gray-800 mb-3">Métodos Abiertos</h3>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                        <input type="number" value={c1x0} onChange={e => setC1x0(e.target.value)} className="p-2 border rounded" placeholder="x₀" />
                        <input type="number" value={c1x1} onChange={e => setC1x1(e.target.value)} className="p-2 border rounded" placeholder="x₁ (Secante)" />
                    </div>
                    <ActionButton onClick={runNewton} loading={loading} className="bg-blue-600 hover:bg-blue-700">
                        Calcular Newton
                    </ActionButton>
                    <ActionButton onClick={runSecante} loading={loading} className="bg-blue-500 hover:bg-blue-600 mt-2">
                        Calcular Secante
                    </ActionButton>
                </div>

                <div className="border-t border-gray-200 pt-4">
                    <h3 className="font-semibold text-gray-800 mb-3">Punto Fijo</h3>
                    <div className="mb-3">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Función g(x)</label>
                        <input type="text" value={c1gFn} onChange={e => setC1gFn(e.target.value)} className="w-full p-2 border rounded" placeholder="Ej: (x+2)^(1/3)" />
                    </div>
                    <ActionButton onClick={runPuntoFijo} loading={loading} className="bg-purple-600 hover:bg-purple-700">
                        Calcular Punto Fijo
                    </ActionButton>
                </div>
              </div>
            </div>
            
            {/* Resultados Cap 1 */}
            <div className="bg-gray-50 p-6 border-t border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Resultados</h3>
                {c1Error && <div className="p-4 bg-red-100 text-red-700 rounded border border-red-200">{c1Error}</div>}
                {c1Result && (
                <div className="bg-white p-4 rounded border border-gray-200 shadow-sm">
                    {c1Result.raiz !== undefined && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <span className="text-green-800 font-semibold">Raíz Encontrada: </span>
                            <span className="font-mono text-xl font-bold text-green-700">{c1Result.raiz}</span>
                        </div>
                    )}
                    {c1Result.tabla && <ResultsTable data={c1Result.tabla} />}
                </div>
                )}
            </div>
          </div>
        )}

        {/* =================== CAPÍTULO 2: SISTEMAS =================== */}
        {activeTab === 'cap2' && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
             <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">Sistemas de Ecuaciones</h2>
                <p className="text-sm text-gray-500">Métodos Iterativos: Jacobi, Gauss-Seidel y SOR</p>
            </div>
            
            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
               {/* Configuración Matriz */}
               <div>
                  <div className="flex items-center gap-4 mb-6">
                      <label className="font-semibold text-gray-700">Tamaño de Matriz (N):</label>
                      <input 
                        type="number" min="2" max="7" 
                        value={c2Tamano} 
                        onChange={handleMatrixSizeChange} 
                        className="w-20 p-2 border rounded text-center font-bold text-lg" 
                      />
                  </div>
                  
                  <div className="space-y-6">
                      <div>
                        <h4 className="text-sm font-bold text-gray-500 uppercase mb-2">Matriz A (Coeficientes)</h4>
                        <div className="inline-block p-3 bg-gray-100 rounded-lg border border-gray-300">
                            {c2Matrix.map((row, i) => (
                                <div key={i} className="flex gap-2 mb-2 last:mb-0">
                                    {row.map((val, j) => (
                                        <input 
                                            key={`${i}-${j}`} 
                                            type="number" 
                                            value={val} 
                                            onChange={e => handleMatrixChange(e.target.value, i, j)} 
                                            className="w-20 text-lg p-2 border rounded text-center focus:ring-2 focus:ring-blue-400 outline-none"
                                        />
                                    ))}
                                </div>
                            ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-gray-500 uppercase mb-2">Vector b (Términos Indep.)</h4>
                        <div className="inline-block p-3 bg-gray-100 rounded-lg border border-gray-300">
                            <div className="flex flex-col gap-2">
                                {c2Vector.map((val, i) => (
                                    <input 
                                        key={i} 
                                        type="number" 
                                        value={val} 
                                        onChange={e => handleVectorChange(e.target.value, i)} 
                                        className="w-20 text-lg p-2 border rounded text-center focus:ring-2 focus:ring-green-400 outline-none"
                                    />
                                ))}
                            </div>
                        </div>
                      </div>
                  </div>
               </div>

               {/* Control y Resultados */}
               <div className="space-y-6">
                    <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                        <h3 className="font-semibold text-gray-700 mb-3 uppercase text-xs tracking-wider">Configuración</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Tolerancia</label>
                            <input type="text" value={c2Tol} onChange={e => setC2Tol(e.target.value)} className="w-full p-2 border rounded bg-white" />
                            </div>
                            <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Max. Iter.</label>
                            <input type="number" value={c2Iter} onChange={e => setC2Iter(e.target.value)} className="w-full p-2 border rounded bg-white" />
                            </div>
                        </div>
                        <div className="mt-3">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Omega (ω) <span className="font-normal">(para SOR)</span></label>
                            <input type="number" step="0.1" value={c2Omega} onChange={e => setC2Omega(e.target.value)} className="w-full p-2 border rounded bg-white" />
                        </div>
                        
                        <div className="mt-4 space-y-2">
                            <ActionButton onClick={runJacobi} loading={loading} className="bg-indigo-600 hover:bg-indigo-700">
                                Resolver con Jacobi
                            </ActionButton>
                            <ActionButton onClick={runGaussSeidel} loading={loading} className="bg-indigo-500 hover:bg-indigo-600">
                                Resolver con Gauss-Seidel
                            </ActionButton>
                            <ActionButton onClick={runSOR} loading={loading} className="bg-indigo-400 hover:bg-indigo-500">
                                Resolver con SOR
                            </ActionButton>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-3">Resultados</h3>
                        {c2Error && <div className="p-3 bg-red-100 text-red-700 text-sm rounded border border-red-200">{c2Error}</div>}
                        
                        {c2Result && (
                            <div className="bg-white p-4 rounded border border-gray-200 shadow-sm">
                                {c2Result.solucion && (
                                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                        <span className="text-green-800 font-semibold block mb-1">Solución (x):</span>
                                        {c2Result.solucion.map((val, i) => (
                                            <span key={i} className="font-mono text-xl font-bold text-green-700 block">{`x${i+1} = ${val.toFixed(6)}`}</span>
                                        ))}
                                    </div>
                                )}
                                {c2Result.tabla && <ResultsTable data={c2Result.tabla} />}
                            </div>
                        )}
                    </div>
               </div>
            </div>
          </div>
        )}
        
        {/* =================== CAPÍTULO 3: INTERPOLACIÓN =================== */}
        {activeTab === 'cap3' && (
           <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">Interpolación Polinómica</h2>
                <p className="text-sm text-gray-500">Vandermonde, Lagrange, Newton y Splines</p>
              </div>
              
              <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                      <div className="flex justify-between items-center mb-4">
                          <h3 className="font-bold text-gray-700">Puntos de Datos (Máx. 8)</h3>
                          <div className="space-x-2">
                            <button onClick={addPunto} className="px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 text-sm font-semibold">+ Agregar</button>
                            <button onClick={remPunto} className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm font-semibold">- Quitar</button>
                          </div>
                      </div>
                      
                      <div className="space-y-2 mb-4 max-h-72 overflow-y-auto pr-2 border p-3 bg-gray-50 rounded-lg">
                        {c3Puntos.map((p, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <span className="font-mono text-sm font-semibold text-gray-600">{`P${i}:`}</span>
                                <div className="relative flex-1">
                                    <span className="absolute left-2.5 top-2.5 text-gray-400 text-xs font-bold">x</span>
                                    <input 
                                        type="number" 
                                        value={p.x} 
                                        onChange={e => handlePointChange(e.target.value, i, 'x')} 
                                        className="w-full p-2 pl-7 border rounded focus:ring-2 focus:ring-blue-500 outline-none text-lg"
                                    />
                                </div>
                                <div className="relative flex-1">
                                    <span className="absolute left-2.5 top-2.5 text-gray-400 text-xs font-bold">y</span>
                                    <input 
                                        type="number" 
                                        value={p.y} 
                                        onChange={e => handlePointChange(e.target.value, i, 'y')} 
                                        className="w-full p-2 pl-7 border rounded focus:ring-2 focus:ring-blue-500 outline-none text-lg"
                                    />
                                </div>
                            </div>
                        ))}
                      </div>

                      <div className="mt-6 space-y-3">
                        <ActionButton onClick={runVandermonde} loading={loading} className="bg-teal-600 hover:bg-teal-700">
                            Vandermonde
                        </ActionButton>
                        <ActionButton onClick={runLagrange} loading={loading} className="bg-teal-500 hover:bg-teal-600">
                            Lagrange
                        </ActionButton>
                        <ActionButton onClick={runNewtonInterp} loading={loading} className="bg-teal-400 hover:bg-teal-500">
                            Newton (Dif. Divididas)
                        </ActionButton>
                        <ActionButton onClick={runSplineLineal} loading={loading} className="bg-cyan-600 hover:bg-cyan-700">
                            Spline Lineal
                        </ActionButton>
                      </div>
                  </div>
                  
                   <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-4">Resultados</h3>
                      {c3Error && <div className="p-4 bg-red-50 text-red-700 rounded border border-red-100 mb-4">{c3Error}</div>}
                      
                      {/* --- LÓGICA DE RESULTADOS CORREGIDA --- */}
                      
                      {/* Primero, chequear si el resultado es de Splines */}
                      {c3Result && c3Result.splines ? (
                        <div className="bg-white border border-cyan-100 rounded-lg shadow-sm overflow-hidden">
                            <div className="bg-cyan-50 p-4">
                                <h4 className="text-cyan-800 font-bold mb-2">Splines Lineales</h4>
                                <div className="p-4 bg-white rounded border border-cyan-200 overflow-x-auto space-y-1">
                                    {c3Result.splines.map((spline, i) => (
                                        <code key={i} className="text-cyan-900 font-mono text-sm whitespace-nowrap block">
                                            {spline}
                                        </code>
                                    ))}
                                </div>
                            </div>
                        </div>
                      
                      /* Si no, chequear si es un Polinomio */
                      ) : c3Result && c3Result.polinomioStr ? (
                        <div className="bg-white border border-teal-100 rounded-lg shadow-sm overflow-hidden">
                            <div className="bg-teal-50 p-4 border-b border-teal-100">
                                <h4 className="text-teal-800 font-bold mb-2">Polinomio Interpolante P(x)</h4>
                                <div className="p-4 bg-white rounded border border-teal-200 overflow-x-auto">
                                    <code className="text-teal-900 font-mono text-sm whitespace-nowrap">
                                        {c3Result.polinomioStr}
                                    </code>
                                </div>
                            </div>
                            {c3Result.coeficientes && (
                                <div className="p-4 bg-gray-50">
                                    <p className="text-xs text-gray-500 uppercase font-bold mb-2">Coeficientes (de menor a mayor grado)</p>
                                    <p className="font-mono text-xs text-gray-700 break-all bg-white p-2 rounded border">
                                        [ {c3Result.coeficientes.map(c => c.toFixed(6)).join(', ')} ]
                                    </p>
                                </div>
                            )}
                        </div>

                      /* Si no hay ningún resultado, mostrar el placeholder */
                      ) : (
                          !c3Error && ( // Ocultar si hay un error
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-lg p-10">
                                <p className="text-center text-lg">Ingresa puntos y calcula para ver el resultado</p>
                            </div>
                          )
                      )}
                      {/* --- FIN DE LA LÓGICA CORREGIDA --- */}
                   </div>
              </div>
           </div>
        )}

      </div>
    </div>
  );
}