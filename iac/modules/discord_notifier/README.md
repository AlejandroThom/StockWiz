# Discord Notifier Lambda Function

Lambda function para enviar notificaciones de deployment a Discord.

## Estructura

- `lambda_function.py` - Función Lambda principal
- `test_lambda_function.py` - Tests unitarios con cobertura completa
- `requirements-test.txt` - Dependencias para testing

## Ejecutar Tests

### Con coverage (recomendado para SonarQube)

```bash
# Instalar dependencias
pip install -r requirements-test.txt

# Ejecutar tests con coverage
coverage run -m unittest test_lambda_function.py

# Generar reporte XML para SonarQube
coverage xml -o coverage.xml

# Ver reporte en consola
coverage report

# Ver reporte HTML (opcional)
coverage html -d htmlcov
```

### Sin coverage

```bash
python -m unittest test_lambda_function.py -v
```

## Code Coverage

El proyecto está configurado para generar reportes de coverage que SonarQube puede leer:

- **Formato XML**: `coverage.xml` (usado por SonarQube)
- **Formato HTML**: `htmlcov/index.html` (para visualización local)

El workflow de CI/CD ejecuta automáticamente los tests con coverage y genera el reporte XML.

## Tests

Los tests cubren:
- ✅ Deployment exitoso con todos los campos
- ✅ Deployment fallido
- ✅ Eventos mínimos
- ✅ Variables de entorno personalizadas
- ✅ Manejo de errores HTTP
- ✅ Excepciones generales
- ✅ Validación de headers
- ✅ Formato de URLs y commits
- ✅ Timestamps

**Total: 13 tests, 100% de cobertura**

