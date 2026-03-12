# Quick Deploy Commands — DEV Cluster

**Branch:** `feature/code-quality-week1-2`  
**Copy-paste ready commands for manual deployment**

---

## 1. Build and Push (Local Machine)

```bash
# Set variables
BUILD_ID=$(date +%Y%m%d-%H%M%S)
ACR_NAME="wackopscoachdevacr"
IMAGE_NAME="oluto-frontend"

# Login to Azure ACR
az acr login --name $ACR_NAME

# Build AMD64 image
cd /Users/profemzy/projects/oluto-agent/oluto
docker buildx build \
  --platform linux/amd64 \
  --build-arg NEXT_PUBLIC_API_URL=/api/v1 \
  --build-arg NEXT_PUBLIC_KEYCLOAK_URL=https://auth.dev.oluto.app \
  --build-arg NEXT_PUBLIC_KEYCLOAK_REALM=oluto \
  --build-arg NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=oluto-web \
  -t $ACR_NAME.azurecr.io/$IMAGE_NAME:$BUILD_ID \
  -t $ACR_NAME.azurecr.io/$IMAGE_NAME:latest-dev \
  -f apps/web/Dockerfile \
  --load \
  .

# Push to ACR
docker push $ACR_NAME.azurecr.io/$IMAGE_NAME:$BUILD_ID
docker push $ACR_NAME.azurecr.io/$IMAGE_NAME:latest-dev

echo "✅ Image pushed: $ACR_NAME.azurecr.io/$IMAGE_NAME:$BUILD_ID"
```

---

## 2. Deploy to DEV Kubernetes

```bash
# Set image in deployment
kubectl set image deployment/oluto-frontend \
  frontend=wackopscoachdevacr.azurecr.io/oluto-frontend:$BUILD_ID \
  -n oluto

# Watch rollout
kubectl rollout status deployment/oluto-frontend -n oluto --timeout=300s

# Verify pods
kubectl get pods -n oluto -l app=oluto-frontend

echo "✅ Deployed to DEV cluster"
```

---

## 3. Verify Deployment

```bash
# Check health
curl https://dev.oluto.app/api/v1/health

# Check frontend
curl -I https://dev.oluto.app

# View logs
kubectl logs -n oluto -l app=oluto-frontend --tail=50
```

---

## 4. Rollback (If Needed)

```bash
# Rollback to previous version
kubectl rollout undo deployment/oluto-frontend -n oluto

# Watch rollback
kubectl rollout status deployment/oluto-frontend -n oluto
```

---

## Full Script (Copy-Paste)

```bash
#!/bin/bash
set -e

# Variables
BUILD_ID=$(date +%Y%m%d-%H%M%S)
ACR_NAME="wackopscoachdevacr"
IMAGE_NAME="oluto-frontend"
REPO_ROOT="/Users/profemzy/projects/oluto-agent/oluto"

echo "🚀 Starting deployment to DEV..."
echo "📦 Build ID: $BUILD_ID"

# Build
cd $REPO_ROOT
echo "🔨 Building Docker image..."
docker buildx build \
  --platform linux/amd64 \
  --build-arg NEXT_PUBLIC_API_URL=/api/v1 \
  --build-arg NEXT_PUBLIC_KEYCLOAK_URL=https://auth.dev.oluto.app \
  --build-arg NEXT_PUBLIC_KEYCLOAK_REALM=oluto \
  --build-arg NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=oluto-web \
  -t $ACR_NAME.azurecr.io/$IMAGE_NAME:$BUILD_ID \
  -t $ACR_NAME.azurecr.io/$IMAGE_NAME:latest-dev \
  -f apps/web/Dockerfile \
  --load \
  .

# Push
echo "📤 Pushing to ACR..."
docker push $ACR_NAME.azurecr.io/$IMAGE_NAME:$BUILD_ID
docker push $ACR_NAME.azurecr.io/$IMAGE_NAME:latest-dev

# Deploy
echo "🚀 Deploying to DEV cluster..."
kubectl set image deployment/oluto-frontend \
  frontend=$ACR_NAME.azurecr.io/$IMAGE_NAME:$BUILD_ID \
  -n oluto

# Wait for rollout
echo "⏳ Waiting for rollout..."
kubectl rollout status deployment/oluto-frontend -n oluto --timeout=300s

# Verify
echo "✅ Deployment complete!"
echo "🌐 Test at: https://dev.oluto.app"
echo "📝 Build ID: $BUILD_ID"
```

---

## Environment Reference

| Env | Value |
|-----|-------|
| **ACR** | `wackopscoachdevacr.azurecr.io` |
| **Cluster** | `wackopscoach-dev-aks` |
| **Namespace** | `oluto` |
| **Deployment** | `oluto-frontend` |
| **Container** | `frontend` |
| **Platform** | `linux/amd64` |
| **Keycloak URL** | `https://auth.dev.oluto.app` |

---

**Generated:** March 11, 2026  
**Branch:** `feature/code-quality-week1-2`
