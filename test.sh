#!/bin/bash

# Variables
API_URL="http://localhost:8080/api/v1"
ADMIN_EMAIL="admin@test.com"
ADMIN_PASSWORD="123456"

echo "🚀 Iniciando pruebas de API..."

# 1. Registro de admin
echo "\n1. Registrando admin..."
ADMIN_RESPONSE=$(curl -s -X POST "$API_URL/usuarios/register" \
-H "Content-Type: application/json" \
-d "{
  \"nombre\": \"Admin Test\",
  \"email\": \"$ADMIN_EMAIL\",
  \"password\": \"$ADMIN_PASSWORD\",
  \"permisos\": [\"crear_libros\", \"modificar_libros\", \"inhabilitar_libros\"]
}")
echo $ADMIN_RESPONSE

# 2. Login de admin
echo "\n2. Login de admin..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/usuarios/login" \
-H "Content-Type: application/json" \
-d "{
  \"email\": \"$ADMIN_EMAIL\",
  \"password\": \"$ADMIN_PASSWORD\"
}")
echo $LOGIN_RESPONSE

# Extraer token (requiere jq)
TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token')

# 3. Crear un libro
echo "\n3. Creando libro..."
LIBRO_RESPONSE=$(curl -s -X POST "$API_URL/libros" \
-H "Authorization: Bearer $TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "titulo": "El Quijote",
  "autor": "Miguel de Cervantes",
  "genero": "Novela",
  "editorial": "Editorial Test",
  "fechaPublicacion": "1605-01-01"
}')
echo $LIBRO_RESPONSE

# Extraer ID del libro
LIBRO_ID=$(echo $LIBRO_RESPONSE | jq -r '._id')

# 4. Obtener libros
echo "\n4. Obteniendo lista de libros..."
curl -s "$API_URL/libros" | jq

# 5. Crear una reserva
echo "\n5. Creando reserva..."
curl -s -X POST "$API_URL/reservas" \
-H "Authorization: Bearer $TOKEN" \
-H "Content-Type: application/json" \
-d "{
  \"libroId\": \"$LIBRO_ID\"
}" | jq

echo "\n✅ Pruebas completadas!"