#!/bin/bash

# ============================================
# DEPLOY FIREBASE RULES SCRIPT
# ============================================

echo "🚀 Desplegando reglas de seguridad de Firebase..."

# Check if firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI no está instalado."
    echo "Instala con: npm install -g firebase-tools"
    exit 1
fi

# Check if firebase.json exists
if [ ! -f "firebase.json" ]; then
    echo "📝 Creando firebase.json..."
    cat > firebase.json << EOF
{
  "database": {
    "rules": "firebase-rules.json"
  }
}
EOF
fi

# Deploy rules
echo "📤 Subiendo reglas a Firebase..."
firebase deploy --only database

if [ $? -eq 0 ]; then
    echo "✅ Reglas desplegadas exitosamente!"
else
    echo "❌ Error al desplegar reglas"
    exit 1
fi

