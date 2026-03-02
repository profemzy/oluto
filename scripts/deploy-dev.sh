#!/usr/bin/env bash
set -euo pipefail

# deploy-dev.sh — Build Oluto web frontend, push to DEV ACR, deploy to DEV AKS
#
# Usage: ./scripts/deploy-dev.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

ACR_NAME="wackopscoachdevacr"
ACR_HOST="${ACR_NAME}.azurecr.io"
K8S_CONTEXT="wackopscoach-dev-aks"
NAMESPACE="oluto"
HEALTH_URL="https://dev.oluto.app"

DEPLOY_NAME="oluto-frontend"
CONTAINER_NAME="oluto-frontend"
IMAGE_REPO="oluto-frontend"
DOCKERFILE="apps/web/Dockerfile"

ORIGINAL_CONTEXT=""

cleanup() {
    if [[ -n "$ORIGINAL_CONTEXT" ]]; then
        echo "Restoring kubectl context to: $ORIGINAL_CONTEXT"
        kubectl config use-context "$ORIGINAL_CONTEXT" >/dev/null 2>&1 || true
    fi
}
trap cleanup EXIT

usage() {
    echo "Usage: $0"
    echo ""
    echo "Builds and deploys the Oluto web frontend to DEV environment."
    echo ""
    echo "Options:"
    echo "  -h, --help    Show this help message"
    exit 0
}

while [[ $# -gt 0 ]]; do
    case "$1" in
        -h|--help)
            usage
            ;;
        *)
            echo "Error: Unknown option '$1'"
            usage
            ;;
    esac
done

get_current_tag() {
    local image
    image=$(kubectl get deployment "$DEPLOY_NAME" -n "$NAMESPACE" \
        -o jsonpath="{.spec.template.spec.containers[?(@.name=='$CONTAINER_NAME')].image}" 2>/dev/null || echo "")

    if [[ -n "$image" && "$image" == *:* ]]; then
        local tag="${image##*:}"
        if [[ "$tag" =~ ^[0-9]+$ ]]; then
            echo "$tag"
            return
        fi
    fi
    echo "0"
}

echo "=== Oluto Frontend — DEV Deployment ==="
echo ""

# Save and switch kubectl context
ORIGINAL_CONTEXT=$(kubectl config current-context 2>/dev/null || echo "")
echo "Switching kubectl context to: $K8S_CONTEXT"
kubectl config use-context "$K8S_CONTEXT"
echo ""

# Auto-increment tag
CURRENT_TAG=$(get_current_tag)
NEW_TAG=$((CURRENT_TAG + 1))
FULL_IMAGE="${ACR_HOST}/${IMAGE_REPO}:${NEW_TAG}"
echo "Current tag: $CURRENT_TAG"
echo "New tag:     $NEW_TAG"
echo "Image:       $FULL_IMAGE"
echo ""

# ACR login
echo "Logging into ACR: $ACR_NAME"
az acr login --name "$ACR_NAME"
echo ""

# Build
echo "Building frontend image: $FULL_IMAGE"
docker buildx build --platform linux/amd64 \
    -f "$REPO_ROOT/$DOCKERFILE" \
    --build-arg NEXT_PUBLIC_KEYCLOAK_URL=https://auth.dev.oluto.app \
    --build-arg NEXT_PUBLIC_KEYCLOAK_REALM=oluto \
    --build-arg NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=oluto-web \
    -t "$FULL_IMAGE" \
    --load \
    "$REPO_ROOT"
echo ""

# Push
echo "Pushing frontend image..."
docker push "$FULL_IMAGE"
echo ""

# Apply K8s manifest (picks up env var changes)
echo "Applying deployment manifest..."
kubectl apply -f "$REPO_ROOT/k8s/dev/frontend-deployment.yaml"

# Deploy
echo "Setting image on deployment/$DEPLOY_NAME"
kubectl set image deployment/"$DEPLOY_NAME" \
    "$CONTAINER_NAME=$FULL_IMAGE" \
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
echo "=== DEV Deployment Summary ==="
echo "Image:     $FULL_IMAGE"
echo "Cluster:   $K8S_CONTEXT"
echo "Namespace: $NAMESPACE"
echo "Health:    $HEALTH_URL → HTTP $HTTP_STATUS"
echo "=============================="
