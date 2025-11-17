Proyecto final Análisis Numérico. Este proyecto consta de una aplicación web que implementa varios métodos de análisis numérico. La aplicación utiliza una arquitectura cliente-servidor, frontend (cliente): Construido con React, este se encarga de la interfaz de usuario, la entrada de datos y la visualización de gráficas (usando Chart.js). Backend (servidor): Construido con Python (Flask). Utiliza una API REST que realiza todos los cálculos matemáticos complejos usando librerías como SymPy y NumPy. Estructura del Repositorio, /appan/: Contiene todo el código fuente de la aplicación React. /backend/: Contiene el servidor API de Flask. Cómo Ejecutar. Backend (Servidor Python) Tener Python 3 y pip instalados.

Instalar las dependencias
pip install flask flask-cors sympy numpy

Iniciar el servidor
python app.py
El servidor estará corriendo en http://127.0.0.1:5000. Frontend (aplicación React) Tener Node.js y npm instalados.

Navegar a la carpeta del frontend
cd appan

Iniciar el ambiente web
npm start
