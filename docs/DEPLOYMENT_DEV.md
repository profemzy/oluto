# Manual Deployment Guide — DEV Cluster

**Branch:** `feature/code-quality-week1-2`  
**Date:** March 11, 2026  
**Target:** DEV AKS Cluster (`wackopscoach-dev-aks`)  
**Image:** AMD64 architecture required

---

## Prerequisites

Ensure you have the following installed and configured:

```bash
# Docker with buildx
docker --version
docker buildx version

# Azure CLI
az --version

# kubectl configured for DEV cluster
kubectl config current-context  # Should show wackopscoach-dev-aks
```

---

## Step 1: Push Branch to Remote

```bash
cd /Users/profemzy/projects/oluto-agent/oluto

# Push the branch to origin
git push -u origin feature/code-quality-week1-2
```

---

## Step 2: Login to Azure and ACR

```bash
# Login to Azure
az login

# Set subscription (if you have multiple)
az account set --subscription "<your-subscription-id>"

# Login to ACR (DEV)
az acr login --name wackopscoachdevacr
```

---

## Step 3: Build Docker Image with Buildx

```bash
cd /Users/profemzy/projects/oluto-agent/oluto

# Generate build ID (use Azure DevOps Build ID or timestamp)
BUILD_ID=$(date +%Y%m%d-%H%M%S)
echo "Build ID: $BUILD_ID"

# Create/buildx builder instance (if not exists)
docker buildx create --name oluto-builder --use --bootstrap 2>/dev/null || docker buildx use oluto-builder

# Build AMD64 image for DEV cluster
docker buildx build \
  --platform linux/amd64 \
  --build-arg NEXT_PUBLIC_API_URL=/api/v1 \
  --build-arg NEXT_PUBLIC_KEYCLOAK_URL=https://auth.dev.oluto.app \
  --build-arg NEXT_PUBLIC_KEYCLOAK_REALM=oluto \
  --build-arg NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=oluto-web \
  --build-arg NEXT_PUBLIC_SITE_URL=https://dev.oluto.app \
  --build-arg NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION="" \
  -t wackopscoachdevacr.azurecr.io/oluto-frontend:$BUILD_ID \
  -t wackopscoachdevacr.azurecr.io/oluto-frontend:latest-dev \
  -f apps/web/Dockerfile \
  --load \
  .
```

---

## Step 4: Push Image to ACR

```bash
# Push to DEV ACR
docker push wackopscoachdevacr.azurecr.io/oluto-frontend:$BUILD_ID
docker push wackopscoachdevacr.azurecr.io/oluto-frontend:latest-dev

# Verify image in ACR
az acr repository show-tags \
  --name wackopscoachdevacr \
  --repository oluto-frontend \
  --orderby time_desc \
  --top 5
```

---

## Step 5: Update Kubernetes Deployment

### Option A: Manual kubectl Update

```bash
# Update deployment image tag
kubectl set image deployment/oluto-frontend \
  frontend=wackopscoachdevacr.azurecr.io/oluto-frontend:$BUILD_ID \
  -n oluto

# Watch rollout status
kubectl rollout status deployment/oluto-frontend -n oluto --timeout=300s

# Verify pods are running
kubectl get pods -n oluto -l app=oluto-frontend
```

### Option B: Update Manifest and Apply

```bash
# Edit the deployment manifest
cd /Users/profemzy/projects/oluto-agent/oluto/k8s/dev

# Update image tag in frontend-deployment.yaml
# Find the line: image: wackopscoachdevacr.azurecr.io/oluto-frontend:xxx
# Replace with: image: wackopscoachdevacr.azurecr.io/oluto-frontend:$BUILD_ID

# Apply the updated manifest
kubectl apply -f k8s/dev/frontend-deployment.yaml

# Watch rollout
kubectl rollout status deployment/oluto-frontend -n oluto
```

---

## Step 6: Verify Deployment

```bash
# Check pod status
kubectl get pods -n oluto

# Check pod logs
kubectl logs -n oluto -l app=oluto-frontend --tail=50

# Check service
kubectl get svc -n oluto oluto-frontend

# Check ingress
kubectl get ingress -n oluto

# Test health endpoint
curl https://dev.oluto.app/api/v1/health

# Test frontend
curl -I https://dev.oluto.app
```

---

## Step 7: Rollback (If Needed)

```bash
# Rollback to previous version
kubectl rollout undo deployment/oluto-frontend -n oluto

# Or rollback to specific revision
kubectl rollout undo deployment/oluto-frontend -n oluto --to-revision=<revision-number>

# Watch rollback status
kubectl rollout status deployment/oluto-frontend -n oluto
```

---

## Quick Reference

### Environment Variables (Build Time)

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `/api/v1` |
| `NEXT_PUBLIC_KEYCLOAK_URL` | `https://auth.dev.oluto.app` |
| `NEXT_PUBLIC_KEYCLOAK_REALM` | `oluto` |
| `NEXT_PUBLIC_KEYCLOAK_CLIENT_ID` | `oluto-web` |
| `NEXT_PUBLIC_SITE_URL` | `https://dev.oluto.app` |

### ACR Details

| Property | Value |
|----------|-------|
| **Registry** | `wackopscoachdevacr.azurecr.io` |
| **Repository** | `oluto-frontend` |
| **Platform** | `linux/amd64` |
| **Tag Format** | `<BUILD_ID>` (e.g., `20260311-143022`) |

### Kubernetes Details

| Property | Value |
|----------|-------|
| **Cluster** | `wackopscoach-dev-aks` |
| **Namespace** | `oluto` |
| **Deployment** | `oluto-frontend` |
| **Container** | `frontend` |
| **Service** | `oluto-frontend:80` |
| **Ingress** | `oluto-frontend` |

---

## Troubleshooting

### Build Fails

```bash
# Clean buildx cache
docker buildx prune

# Rebuild builder
docker buildx rm oluto-builder
docker buildx create --name oluto-builder --use --bootstrap
```

### Image Pull Errors

```bash
# Check image exists in ACR
az acr repository show-tags --name wackopscoachdevacr --repository oluto-frontend

# Check pod events
kubectl describe pod -n oluto -l app=oluto-frontend

# Check image pull secrets
kubectl get secrets -n oluto
```

### Deployment Fails

```bash
# Check deployment status
kubectl get deployment oluto-frontend -n oluto

# Check events
kubectl get events -n oluto --sort-by='.lastTimestamp'

# Check resource quotas
kubectl describe quota -n oluto
```

---

## Post-Deployment Checklist

- [ ] Frontend loads at https://dev.oluto.app
- [ ] Keycloak login works (https://auth.dev.oluto.app)
- [ ] API calls route correctly to backend
- [ ] No console errors in browser dev tools
- [ ] Theme toggle works (dark/light mode)
- [ ] Mobile menu works with keyboard navigation
- [ ] Test with demo credentials:
  - Email: `oluto@oluto.ca`
  - Password: `OlutoAgent2026`

---

## Notes

- **Build ID:** Use Azure DevOps `$(Build.BuildId)` or timestamp format `YYYYMMDD-HHMMSS`
- **Platform:** Must be `linux/amd64` for AKS compatibility
- **Build Context:** Root of repository (Dockerfile copies from `apps/web`)
- **Standalone Mode:** Next.js build uses output: 'standalone' for smaller image

---

**Last Updated:** March 11, 2026  
**Branch:** `feature/code-quality-week1-2`  
**Build:** Manual (to be automated via Azure Pipelines)
