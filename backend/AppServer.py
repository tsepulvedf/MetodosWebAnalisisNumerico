from flask import Flask, request, jsonify
from flask_cors import CORS
import sympy as sp
import numpy as np

# Configuración de Flask y CORS (para permitir que React se comunique)
app = Flask(__name__)
# Permitir solicitudes desde 'http://localhost:3000' (donde usualmente corre React en desarrollo)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

# Símbolo para los cálculos (x)
x = sp.symbols('x')


# --- Helper para formatear números ---
def format_num(num):
    """ Formatea números para la tabla, evitando notación científica si es posible."""
    if num == 0 or (abs(num) > 1e-4 and abs(num) < 1e6):
        return float(f"{num:.7f}")
    return float(f"{num:.4e}")


# ======================================================
# =================== API CAPÍTULO 1 ===================
# ======================================================

@app.route('/api/biseccion', methods=['POST'])
def api_biseccion():
    data = request.json
    try:
        fn_str = data['fnString']
        a = float(data['a'])
        b = float(data['b'])
        tol = float(data['tol'])
        max_iter = int(data['maxIter'])

        f = sp.sympify(fn_str)
        fa = f.subs(x, a).evalf()
        fb = f.subs(x, b).evalf()

        if fa * fb >= 0:
            return jsonify({"error": "La función debe tener signos opuestos en los intervalos a y b."}), 400

        tabla = []
        c_anterior = a
        for i in range(1, max_iter + 1):
            c = (a + b) / 2
            fc = f.subs(x, c).evalf()
            error = abs((c - c_anterior) / c) if c != 0 else 0

            tabla.append({
                "iter": i,
                "a": format_num(a),
                "b": format_num(b),
                "c": format_num(c),
                "fc": format_num(fc),
                "error": format_num(error)
            })

            if abs(fc) < tol or error < tol:
                return jsonify({"raiz": float(c), "tabla": tabla})

            if fa * fc < 0:
                b = c
            else:
                a = c
                fa = fc
            c_anterior = c

        return jsonify({"error": "Método falló tras N iteraciones", "tabla": tabla}), 400

    except Exception as e:
        return jsonify({"error": f"Error en el servidor: {str(e)}"}), 500


@app.route('/api/regla_falsa', methods=['POST'])
def api_regla_falsa():
    data = request.json
    try:
        fn_str = data['fnString']
        a = float(data['a'])
        b = float(data['b'])
        tol = float(data['tol'])
        max_iter = int(data['maxIter'])

        f = sp.sympify(fn_str)
        fa = f.subs(x, a).evalf()
        fb = f.subs(x, b).evalf()

        if fa * fb >= 0:
            return jsonify({"error": "La función debe tener signos opuestos en los intervalos a y b."}), 400

        tabla = []
        c_anterior = a
        for i in range(1, max_iter + 1):
            # Fórmula de Regla Falsa
            c = b - (fb * (b - a)) / (fb - fa)
            fc = f.subs(x, c).evalf()
            error = abs((c - c_anterior) / c) if c != 0 else 0

            tabla.append({
                "iter": i,
                "a": format_num(a),
                "b": format_num(b),
                "c": format_num(c),
                "fc": format_num(fc),
                "error": format_num(error)
            })

            if abs(fc) < tol or error < tol:
                return jsonify({"raiz": float(c), "tabla": tabla})

            if fa * fc < 0:
                b = c
                fb = fc  # Importante actualizar fb
            else:
                a = c
                fa = fc  # Importante actualizar fa
            c_anterior = c

        return jsonify({"error": "Método falló tras N iteraciones", "tabla": tabla}), 400
    except Exception as e:
        return jsonify({"error": f"Error en el servidor: {str(e)}"}), 500


@app.route('/api/secante', methods=['POST'])
def api_secante():
    data = request.json
    try:
        fn_str = data['fnString']
        x0 = float(data['x0'])
        x1 = float(data['x1'])
        tol = float(data['tol'])
        max_iter = int(data['maxIter'])

        f = sp.sympify(fn_str)
        tabla = []

        for i in range(1, max_iter + 1):
            fx0 = f.subs(x, x0).evalf()
            fx1 = f.subs(x, x1).evalf()

            if abs(fx1 - fx0) < 1e-10:
                return jsonify(
                    {"error": "Diferencia f(xi) - f(xi-1) muy pequeña. El método falla.", "tabla": tabla}), 400

            x_nuevo = x1 - (fx1 * (x1 - x0)) / (fx1 - fx0)
            error = abs((x_nuevo - x1) / x_nuevo) if x_nuevo != 0 else 0

            tabla.append({
                "iter": i,
                "x_i-1": format_num(x0),
                "x_i": format_num(x1),
                "f(x_i)": format_num(fx1),
                "error": format_num(error)
            })

            if abs(fx1) < tol or error < tol:
                return jsonify({"raiz": float(x_nuevo), "tabla": tabla})

            x0 = x1
            x1 = x_nuevo

        return jsonify({"error": "Método falló tras N iteraciones", "tabla": tabla}), 400
    except Exception as e:
        return jsonify({"error": f"Error en el servidor: {str(e)}"}), 500


@app.route('/api/punto_fijo', methods=['POST'])
def api_punto_fijo():
    data = request.json
    try:
        g_str = data['gString']
        xn = float(data['x0'])
        tol = float(data['tol'])
        max_iter = int(data['maxIter'])

        g = sp.sympify(g_str)
        tabla = []

        for i in range(1, max_iter + 1):
            x_nuevo = g.subs(x, xn).evalf()
            error = abs((x_nuevo - xn) / x_nuevo) if x_nuevo != 0 else 0

            tabla.append({
                "iter": i,
                "x_n": format_num(xn),
                "g(x_n)": format_num(x_nuevo),
                "error": format_num(error)
            })

            if error < tol:
                return jsonify({"raiz": float(x_nuevo), "tabla": tabla})

            xn = x_nuevo

        return jsonify({"error": "Método falló tras N iteraciones (o no converge)", "tabla": tabla}), 400
    except Exception as e:
        return jsonify({"error": f"Error en el servidor: {str(e)}"}), 500


@app.route('/api/newton', methods=['POST'])
def api_newton():
    data = request.json
    try:
        fn_str = data['fnString']
        xn = float(data['x0'])
        tol = float(data['tol'])
        max_iter = int(data['maxIter'])

        f = sp.sympify(fn_str)
        df = sp.diff(f, x)

        tabla = []
        for i in range(1, max_iter + 1):
            fxn = f.subs(x, xn).evalf()
            dfxn = df.subs(x, xn).evalf()

            if abs(dfxn) < 1e-10:
                return jsonify({"error": "Derivada cercana a cero. El método falla.", "tabla": tabla}), 400

            x_nuevo = xn - (fxn / dfxn)
            error = abs((x_nuevo - xn) / x_nuevo) if x_nuevo != 0 else 0

            tabla.append({
                "iter": i,
                "xn": format_num(xn),
                "fxn": format_num(fxn),
                "dfxn": format_num(dfxn),
                "error": format_num(error)
            })

            if abs(fxn) < tol or error < tol:
                # Devolver también la derivada en texto
                return jsonify({"raiz": float(x_nuevo), "tabla": tabla, "derivada": str(df)})

            xn = x_nuevo

        return jsonify({"error": "Método falló tras N iteraciones", "tabla": tabla, "derivada": str(df)}), 400

    except Exception as e:
        return jsonify({"error": f"Error en el servidor: {str(e)}"}), 500


# ======================================================
# =================== API CAPÍTULO 2 ===================
# ======================================================

@app.route('/api/jacobi', methods=['POST'])
def api_jacobi():
    data = request.json
    try:
        A = np.array(data['A'], dtype=float)
        b = np.array(data['b'], dtype=float)
        tol = float(data['tol'])
        max_iter = int(data['maxIter'])
        N = len(b)

        x_old = np.zeros(N)
        x_new = np.zeros(N)
        tabla = []

        for i in range(1, max_iter + 1):
            for j in range(N):
                sum_val = 0
                for k in range(N):
                    if j != k:
                        sum_val += A[j, k] * x_old[k]

                if A[j, j] == 0:
                    return jsonify({"error": f"Elemento diagonal A[{j}][{j}] es cero."}), 400

                x_new[j] = (b[j] - sum_val) / A[j, j]

            # Error (Norma Infinita)
            error = np.linalg.norm(x_new - x_old, np.inf)

            row = {"iter": i}
            for idx in range(N):
                row[f'x{idx + 1}'] = format_num(x_new[idx])
            row['error'] = format_num(error)
            tabla.append(row)

            x_old = np.copy(x_new)

            if error < tol:
                return jsonify({"solucion": x_new.tolist(), "tabla": tabla})

        return jsonify({"error": "Método falló tras N iteraciones", "tabla": tabla}), 400

    except Exception as e:
        return jsonify({"error": f"Error en el servidor: {str(e)}"}), 500


@app.route('/api/gauss_seidel', methods=['POST'])
def api_gauss_seidel():
    data = request.json
    try:
        A = np.array(data['A'], dtype=float)
        b = np.array(data['b'], dtype=float)
        tol = float(data['tol'])
        max_iter = int(data['maxIter'])
        N = len(b)

        x = np.zeros(N)
        tabla = []

        for i in range(1, max_iter + 1):
            x_old = np.copy(x)

            for j in range(N):
                sum_j_lt_i = np.dot(A[j, :j], x[:j])  # Usa valores nuevos (actualizados en este loop)
                sum_j_gt_i = np.dot(A[j, j + 1:], x_old[j + 1:])  # Usa valores viejos

                if A[j, j] == 0:
                    return jsonify({"error": f"Elemento diagonal A[{j}][{j}] es cero."}), 400

                x[j] = (b[j] - sum_j_lt_i - sum_j_gt_i) / A[j, j]

            error = np.linalg.norm(x - x_old, np.inf)

            row = {"iter": i}
            for idx in range(N):
                row[f'x{idx + 1}'] = format_num(x[idx])
            row['error'] = format_num(error)
            tabla.append(row)

            if error < tol:
                return jsonify({"solucion": x.tolist(), "tabla": tabla})

        return jsonify({"error": "Método falló tras N iteraciones", "tabla": tabla}), 400
    except Exception as e:
        return jsonify({"error": f"Error en el servidor: {str(e)}"}), 500


@app.route('/api/sor', methods=['POST'])
def api_sor():
    data = request.json
    try:
        A = np.array(data['A'], dtype=float)
        b = np.array(data['b'], dtype=float)
        tol = float(data['tol'])
        max_iter = int(data['maxIter'])
        omega = float(data['omega'])
        N = len(b)

        if not (0 < omega < 2):
            return jsonify({"error": "Omega (ω) debe estar en el intervalo (0, 2)."}), 400

        x = np.zeros(N)
        tabla = []

        for i in range(1, max_iter + 1):
            x_old = np.copy(x)

            for j in range(N):
                sum_j_lt_i = np.dot(A[j, :j], x[:j])
                sum_j_gt_i = np.dot(A[j, j + 1:], x_old[j + 1:])

                if A[j, j] == 0:
                    return jsonify({"error": f"Elemento diagonal A[{j}][{j}] es cero."}), 400

                # Calcula el valor de Gauss-Seidel
                x_gs = (b[j] - sum_j_lt_i - sum_j_gt_i) / A[j, j]

                # Aplica relajación
                x[j] = (1 - omega) * x_old[j] + omega * x_gs

            error = np.linalg.norm(x - x_old, np.inf)

            row = {"iter": i}
            for idx in range(N):
                row[f'x{idx + 1}'] = format_num(x[idx])
            row['error'] = format_num(error)
            tabla.append(row)

            if error < tol:
                return jsonify({"solucion": x.tolist(), "tabla": tabla})

        return jsonify({"error": "Método falló tras N iteraciones", "tabla": tabla}), 400
    except Exception as e:
        return jsonify({"error": f"Error en el servidor: {str(e)}"}), 500


# ======================================================
# =================== API CAPÍTULO 3 ===================
# ======================================================

@app.route('/api/vandermonde', methods=['POST'])
def api_vandermonde():
    data = request.json
    try:
        puntos = data['puntos']
        x_vals = np.array([p['x'] for p in puntos])
        y_vals = np.array([p['y'] for p in puntos])
        N = len(puntos)

        # Crear matriz de Vandermonde
        V = np.vander(x_vals, N, increasing=True)

        # Resolver V * c = y para los coeficientes c
        c = np.linalg.solve(V, y_vals)

        # Construir el string del polinomio
        poly_str = "P(x) = "
        for i in range(N - 1, -1, -1):
            term = f"{c[i]:.4f}"
            if i > 0:
                term += f"*x^{i} + "
            poly_str += term

        poly_str = poly_str.replace("+-", "-")

        return jsonify({"polinomioStr": poly_str, "coeficientes": c.tolist()})

    except Exception as e:
        return jsonify({"error": f"Error en el servidor: {str(e)}"}), 500


@app.route('/api/lagrange', methods=['POST'])
def api_lagrange():
    data = request.json
    try:
        puntos = data['puntos']
        # FORZAR a que todos los números sean floats para SymPy
        x_vals = [float(p['x']) for p in puntos]
        y_vals = [float(p['y']) for p in puntos]
        N = len(puntos)

        P = 0  # Polinomio simbólico

        for j in range(N):
            L_j = 1  # Polinomio de Lagrange L_j
            for i in range(N):
                if i != j:
                    # Al ser floats, SymPy mantendrá la precisión de float
                    L_j = L_j * (x - x_vals[i]) / (x_vals[j] - x_vals[i])
            P = P + y_vals[j] * L_j

        # Simplificar y expandir el polinomio
        poly_str = str(sp.expand(P))

        return jsonify({"polinomioStr": f"P(x) = {poly_str}"})

    except Exception as e:
        return jsonify({"error": f"Error en el servidor: {str(e)}"}), 500


@app.route('/api/newton_interp', methods=['POST'])
def api_newton_interp():
    data = request.json
    try:
        puntos = data['puntos']
        # FORZAR a que todos los números sean floats para SymPy
        x_vals = [float(p['x']) for p in puntos]
        y_vals = [float(p['y']) for p in puntos]
        N = len(puntos)

        # Crear tabla de diferencias divididas
        dd = np.zeros((N, N))
        dd[:, 0] = y_vals

        for j in range(1, N):
            for i in range(N - j):
                dd[i, j] = (dd[i + 1, j - 1] - dd[i, j - 1]) / (x_vals[i + j] - x_vals[i])

        # Coeficientes son la diagonal superior dd[0, k]
        c = dd[0, :]

        P = 0
        term = 1
        for k in range(N):
            P = P + c[k] * term
            term = term * (x - x_vals[k])

        poly_str = str(sp.expand(P))

        return jsonify({"polinomioStr": f"P(x) = {poly_str}"})

    except Exception as e:
        return jsonify({"error": f"Error en el servidor: {str(e)}"}), 500


@app.route('/api/spline_lineal', methods=['POST'])
def api_spline_lineal():
    data = request.json
    try:
        puntos = data['puntos']
        # Ordenar puntos por x
        puntos.sort(key=lambda p: p['x'])

        splines = []
        for i in range(len(puntos) - 1):
            p1 = puntos[i]
            p2 = puntos[i + 1]
            x1, y1 = p1['x'], p1['y']
            x2, y2 = p2['x'], p2['y']

            if x2 == x1:  # Evitar división por cero
                continue

            m = (y2 - y1) / (x2 - x1)
            b = y1 - m * x1

            spline_str = f"S_{i}(x) = {m:.4f}*x + {b:+.4f} \t (para x en [{x1}, {x2}])"
            splines.append(spline_str)

        return jsonify({"splines": splines})

    except Exception as e:
        return jsonify({"error": f"Error en el servidor: {str(e)}"}), 500


# --- Ejecutar el servidor ---
if __name__ == '__main__':
    app.run(debug=True, port=5000)
