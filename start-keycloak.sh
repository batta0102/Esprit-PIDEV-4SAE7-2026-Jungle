#!/bin/bash

# Script pour démarrer Keycloak rapidement
echo "🔐 Démarrage de Keycloak avec Java 17..."

# Exporter Java 17
export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-17.jdk/Contents/Home

# Démarrer Keycloak en mode dev avec optimisations
cd /Users/achkinez/Downloads/keycloak

./bin/kc.sh start-dev \
  --http-port=8180 \
  --hostname=localhost \
  --cache=local \
  --db=dev-file \
  --features=preview,token-exchange
