from fastapi import APIRouter
from app.api.v1.endpoints import auth, businesses, transactions, import_transactions, jobs

api_router = APIRouter()

# Include authentication routes
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])

# Include business management routes
api_router.include_router(businesses.router, prefix="/businesses", tags=["businesses"])

# Include transaction routes (nested under businesses for tenant scoping)
api_router.include_router(
    transactions.router,
    prefix="/businesses/{business_id}/transactions",
    tags=["transactions"],
)

# Include transaction import routes
api_router.include_router(
    import_transactions.router,
    prefix="/businesses/{business_id}/transactions",
    tags=["transaction-import"],
)

# Include background job status routes
api_router.include_router(
    jobs.router,
    prefix="/businesses/{business_id}/transactions",
    tags=["jobs"],
)
