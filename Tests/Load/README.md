# Tests de Cobertura para k6 Load Tests

Este directorio contiene tests de cobertura para validar la estructura, configuración y lógica de los scripts de carga de k6.

## Instalación

```bash
npm install
```

## Ejecutar Tests

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch
npm run test:watch

# Ejecutar tests con reporte de cobertura
npm run test:coverage
```

## Estructura de Tests

Los tests validan:

### 1. Estructura del Script
- Sintaxis JavaScript válida
- Imports requeridos de k6
- Exportación de configuración (options)
- Función default exportada
- Uso de variables de entorno

### 2. Configuración (Options)
- Thresholds configurados correctamente
- Valores de VUs y duración
- Validación de umbrales de rendimiento

### 3. Lógica del Test
- Variables definidas correctamente
- Construcción de URLs
- Métodos HTTP utilizados
- Checks y validaciones
- Sleep calls

### 4. Calidad de Código
- Uso correcto de const/let
- Template strings apropiados
- Estructura del código

### 5. Casos Edge y Manejo de Errores
- Manejo de variables de entorno faltantes
- Validación de errores en checks

### 6. Validación de Cobertura
- Endpoints testeados
- Métodos HTTP utilizados
- Estructura de respuesta validada

## Tests Disponibles

- `test_api-gateway-inventory-product-test.js` - Tests de cobertura para el test de inventario de productos

## Notas

- Los tests validan la estructura y configuración de los scripts k6, no ejecutan k6 directamente
- Si k6 está instalado en el PATH, se intentará validar la sintaxis del script
- Los tests usan Jest como framework de testing
- El reporte de cobertura muestra la estructura del código, no la ejecución real de k6

