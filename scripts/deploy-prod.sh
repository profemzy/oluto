#!/usr/bin/env bash
set -euo pipefail

# deploy-prod.sh — Promote Oluto web frontend from DEV ACR to PROD ACR, deploy to PROD AKS
#
# Usage: ./scripts/deploy-prod.sh <tag>
#        e.g. ./scripts/deploy-prod.sh 343

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

DEV_ACR_NAME="wackopscoachdevacr"
DEV_ACR_HOST="${DEV_ACR_NAME}.azurecr.io"
PROD_ACR_NAME="wackopscoachprodacr"
PROD_ACR_HOST="${PROD_ACR_NAME}.azurecr.io"
K8S_CONTEXT="wackopscoach-prod-aks"
NAMESPACE="oluto"
HEALTH_URL="https://oluto.app"

DEPLOY_NAME="oluto-frontend"
CONTAINER_NAME="oluto-frontend"
IMAGE_REPO="oluto-frontend"

ORIGINAL_CONTEXT=""

cleanup() {
    if [[ -n "$ORIGINAL_CONTEXT" ]]; then
        echo "Restoring kubectl context to: $ORIGINAL_CONTEXT"
        kubectl config use-context "$ORIGINAL_CONTEXT" >/dev/null 2>&1 || true
    fi
}
trap cleanup EXIT

usage() {
    echo "Usage: $0 <tag>"
    echo ""
    echo "Promotes the Oluto web frontend from DEV to PROD."
    echo "Does NOT build — uses the image already in DEV ACR."
    echo ""
    echo "Arguments:"
    echo "  <tag>         Image tag to promote (e.g. 343)"
    echo ""
    echo "Options:"
    echo "  -h, --help    Show this help message"
    exit 0
}

TAG=""

while [[ $# -gt 0 ]]; do
    case "$1" in
        -h|--help)
            usage
            ;;
        -*)
            echo "Error: Unknown option '$1'"
            usage
            ;;
        *)
            TAG="$1"
            shift
            ;;
    esac
done

if [[ -z "$TAG" ]]; then
    echo "Error: Tag argument is required."
    echo ""
    usage
fi

DEV_IMAGE="${DEV_ACR_HOST}/${IMAGE_REPO}:${TAG}"
PROD_IMAGE="${PROD_ACR_HOST}/${IMAGE_REPO}:${TAG}"

# Confirmation prompt
echo "=== Oluto Frontend — PROD Deployment ==="
echo ""
echo "Promoting from DEV to PROD:"
echo "  $DEV_IMAGE → $PROD_IMAGE"
echo ""
read -r -p "Deploy frontend:$TAG to PROD? [y/N] " confirm
if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 0
fi
echo ""

# Save kubectl context
ORIGINAL_CONTEXT=$(kubectl config current-context 2>/dev/null || echo "")

# ACR login to both registries
echo "Logging into DEV ACR: $DEV_ACR_NAME"
az acr login --name "$DEV_ACR_NAME"
echo "Logging into PROD ACR: $PROD_ACR_NAME"
az acr login --name "$PROD_ACR_NAME"
echo ""

# Pull from DEV, tag for PROD, push to PROD
echo "Pulling from DEV: $DEV_IMAGE"
docker pull "$DEV_IMAGE"
echo "Tagging for PROD: $PROD_IMAGE"
docker tag "$DEV_IMAGE" "$PROD_IMAGE"
echo "Pushing to PROD..."
docker push "$PROD_IMAGE"
echo ""

# Deploy to PROD AKS
echo "Switching kubectl context to: $K8S_CONTEXT"
kubectl config use-context "$K8S_CONTEXT"
echo ""

echo "Setting image on deployment/$DEPLOY_NAME"
kubectl set image deployment/"$DEPLOY_NAME" \
    "$CONTAINER_NAME=$PROD_IMAGE" \
    -n "$NAMESPACE"
echo ""

echo "Waiting for rollout..."
kubectl rollout status deployment/"$DEPLOY_NAME" -n "$NAMESPACE" --timeout=300s
echo ""

# Health check
echo "Running health check: $HEALTH_URL"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL" --max-time 10 || echo "000")
if [[ "$HTTP_STATUS" == "200" ]]; then
    echo "Health check passed (HTTP $HTTP_STATUS)"
else
    echo "WARNING: Health check returned HTTP $HTTP_STATUS (expected 200)"
fi

# Summary
echo ""
echo "=== PROD Deployment Summary ==="
echo "Image:     $PROD_IMAGE"
echo "Cluster:   $K8S_CONTEXT"
echo "Namespace: $NAMESPACE"
echo "Health:    $HEALTH_URL → HTTP $HTTP_STATUS"
echo "================================"
