from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from datetime import datetime
import traceback
import logging
from app.gemini_service import get_ai_suggestions, get_ai_testcases

from .auth import router as auth_router
from .routes_srs import router as srs_router
from .testcases import router as testcases_router
from .database import get_database_stats, cleanup_old_sessions
from .config import settings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('stcg_backend.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="STCG Backend API",
    description="Automated Test Case Generator from SRS Documents",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Handle all unhandled exceptions"""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    
    # Don't expose internal details in production
    error_detail = str(exc)
    
    return JSONResponse(
        status_code=500,
        content={
            "ok": False,
            "error": "Internal server error",
            "detail": error_detail,
            "timestamp": datetime.utcnow().isoformat(),
            "path": request.url.path
        }
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation errors"""
    logger.warning(f"Validation error: {exc}")
    
    errors = []
    for error in exc.errors():
        errors.append({
            "field": ".".join(error["loc"]),
            "message": error["msg"],
            "type": error["type"]
        })
    
    return JSONResponse(
        status_code=422,
        content={
            "ok": False,
            "error": "Validation failed",
            "details": errors,
            "timestamp": datetime.utcnow().isoformat()
        }
    )

# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all incoming requests"""
    start_time = datetime.utcnow()
    
    # Skip logging for health check and favicon
    if request.url.path in ["/health", "/favicon.ico"]:
        response = await call_next(request)
        return response
    
    # Log request
    logger.info(f"Request: {request.method} {request.url.path}")
    
    try:
        response = await call_next(request)
        process_time = (datetime.utcnow() - start_time).total_seconds() * 1000
        
        # Log response
        logger.info(f"Response: {response.status_code} - {process_time:.2f}ms")
        
        # Add performance header
        response.headers["X-Process-Time"] = f"{process_time:.2f}ms"
        
        return response
    except Exception as e:
        process_time = (datetime.utcnow() - start_time).total_seconds() * 1000
        logger.error(f"Error processing request: {e} - {process_time:.2f}ms")
        raise

# Include routers
app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(srs_router, prefix="/api/srs", tags=["SRS Processing"])
app.include_router(testcases_router, prefix="/api/testcases", tags=["Test Cases"])

# Startup event
@app.on_event("startup")
async def startup_event():
    """Run on application startup"""
    logger.info("STCG Backend starting up...")
    
    # Cleanup old sessions
    cleaned = cleanup_old_sessions()
    if cleaned > 0:
        logger.info(f"Cleaned up {cleaned} expired sessions")
    
    logger.info("STCG Backend started successfully")

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Run on application shutdown"""
    logger.info("STCG Backend shutting down...")

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    try:
        # Check database connection
        from .database import client
        client.server_info()
        db_status = "healthy"
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"
        logger.error(f"Database health check failed: {e}")
    
    # Get system info
    import psutil
    import platform
    
    system_info = {
        "system": platform.system(),
        "release": platform.release(),
        "python_version": platform.python_version(),
        "cpu_usage": psutil.cpu_percent(),
        "memory_usage": psutil.virtual_memory().percent,
        "disk_usage": psutil.disk_usage('/').percent if platform.system() != 'Windows' else psutil.disk_usage('C:').percent
    }
    
    # Get database stats
    try:
        db_stats = get_database_stats()
    except Exception as e:
        db_stats = {"error": str(e)}
    
    return {
        "ok": True,
        "status": "healthy",
        "database": db_status,
        "system": system_info,
        "database_stats": db_stats,
        "timestamp": datetime.utcnow().isoformat(),
        "version": "2.0.0"
    }
# 🔥 ADD THESE ENDPOINTS AT THE END (before or after /health)

@app.post("/api/ai/suggestions")
async def ai_suggestions(data: dict):
    """
    AI Suggestions for improving SRS
    """
    try:
        prompt = data.get("prompt", "")
        
        if not prompt:
            return {
                "ok": False,
                "error": "Prompt is required"
            }

        result = get_ai_suggestions(prompt)

        return {
            "ok": True,
            "ai_suggestions": result,
            "timestamp": datetime.utcnow().isoformat()
        }

    except Exception as e:
        logger.error(f"AI Suggestions Error: {e}")
        return {
            "ok": False,
            "error": str(e)
        }


# 🔥 AI SUGGESTIONS
@app.post("/api/ai/suggestions")
async def ai_suggestions(data: dict):
    try:
        prompt = data.get("prompt", "")

        if not prompt:
            return {
                "ok": False,
                "error": "Prompt is required"
            }

        result = get_ai_suggestions(prompt)

        if "Error:" in result:
            return {
                "ok": False,
                "error": result
            }

        return {
            "ok": True,
            "ai_suggestions": result,
            "timestamp": datetime.utcnow().isoformat()
        }

    except Exception as e:
        logger.error(f"AI Suggestions Error: {e}")
        return {
            "ok": False,
            "error": str(e)
        }


# 🔥 AI TESTCASES
@app.post("/api/ai/testcases")
async def ai_testcases(data: dict):
    try:
        prompt = data.get("prompt", "")

        if not prompt:
            return {
                "ok": False,
                "error": "Prompt is required"
            }

        result = get_ai_testcases(prompt)

        if "Error:" in result:
            return {
                "ok": False,
                "error": result
            }

        return {
            "ok": True,
            "ai_testcases": result,
            "timestamp": datetime.utcnow().isoformat()
        }

    except Exception as e:
        logger.error(f"AI Testcases Error: {e}")
        return {
            "ok": False,
            "error": str(e)
        }