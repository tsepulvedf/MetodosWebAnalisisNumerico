Proyecto Final - Análisis Numérico (React + Python)Este es un proyecto de aplicación web que implementa varios métodos de análisis numérico. La aplicación utiliza una arquitectura cliente-servidor:Frontend (Cliente): Construido con React. Se encarga de la interfaz de usuario, la entrada de datos y la visualización de gráficas (usando Chart.js).Backend (Servidor): Construido con Python (Flask). Expone una API REST que realiza todos los cálculos matemáticos complejos usando librerías como SymPy y NumPy.Estructura del Repositorio/appan/: Contiene todo el código fuente de la aplicación React./backend/: Contiene el servidor API de Flask.Cómo Ejecutar1. Backend (Servidor Python)Asegúrate de tener Python 3 y pip instalados.# 1. Navega a la carpeta del backend
cd backend

# 2. Instala las dependencias
pip install flask flask-cors sympy numpy

# 3. Inicia el servidor
python app.py
El servidor estará corriendo en http://127.0.0.1:5000.2. Frontend (Aplicación React)Asegúrate de tener Node.js y npm instalados.# 1. Navega a la carpeta del frontend
cd appan

# 2. Instala las dependencias
npm install

# 3. Inicia la aplicación de desarrollo
npm start
La aplicación se abrirá en http://localhost:3000 y se conectará automáticamente al backend.