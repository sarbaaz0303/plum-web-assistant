from fastapi import FastAPI, HTTPException, Request, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from pydantic import BaseModel, Field, AnyHttpUrl, validator, field_validator
from typing import Literal, List, Optional, Dict, Any
import logging
import time
import uvicorn
from contextlib import asynccontextmanager
from rag import Rag
import traceback

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger("api_service")

# Track request metrics
request_count = 0
error_count = 0

# Application startup and shutdown events
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting RAG API service")
    global rag_object
    try:
        rag_object = Rag()
        logger.info("RAG system initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize RAG system: {str(e)}")
        raise
    
    yield
    
    # Shutdown
    logger.info("Shutting down RAG API service")
    logger.info(f"Processed {request_count} requests with {error_count} errors")

# Initialize FastAPI with lifespan manager
app = FastAPI(
    title="RAG API Service",
    description="API for Retrieval-Augmented Generation with web content",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data models
class Message(BaseModel):
    role: Literal["user", "assistant", "error"] = Field(..., description="Role of the message sender")
    content: str = Field(..., description="Content of the message")

class Payload(BaseModel):
    messages: List[Message] = Field(..., description="List of conversation messages")
    url: str = Field(..., description="URL of the web page to extract context from")
    
    @field_validator('url')
    def url_must_be_valid(cls, v):
        # Basic URL validation
        if not v.startswith(('http://', 'https://')):
            raise ValueError('URL must start with http:// or https://')
        return v
    
    @field_validator('messages')
    def messages_not_empty(cls, v):
        if not v:
            raise ValueError('Messages list cannot be empty')
        if len(v) > 20:  # Limit conversation history
            raise ValueError('Too many messages in conversation history (max: 20)')
        return v

class ErrorResponse(BaseModel):
    detail: str
    type: Optional[str] = None
    location: Optional[str] = None

class SuccessResponse(BaseModel):
    answer: str
    metadata: Optional[Dict[str, Any]] = None
    
# Rate limiting middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    global request_count
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    request_count += 1
    
    # For excessive processing time, log a warning
    if process_time > 5.0:
        logger.warning(f"Slow request: {request.url.path} took {process_time:.2f}s")
        
    return response

# Custom exception handlers
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    global error_count
    error_count += 1
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": str(exc)},
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    global error_count
    error_count += 1
    logger.error(f"Unhandled exception: {str(exc)}\n{traceback.format_exc()}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An unexpected error occurred", "type": str(type(exc).__name__)},
    )

# API endpoints
@app.get("/", tags=["Health"])
async def root():
    """Health check endpoint."""
    return {"status": "healthy", "service": "RAG API"}

@app.post("/response/", response_model=SuccessResponse, tags=["RAG"])
async def get_response(payload: Payload):
    """
    Generate a response using RAG with the provided conversation and URL.
    
    - **messages**: List of conversation messages
    - **url**: URL to extract context from
    """
    try:
        logger.info(f"Processing request for URL: {payload.url}")
        
        # Format payload for RAG system
        message_dict = {
            "message": [
                {"role": msg.role, "content": msg.content} 
                for msg in payload.messages
            ]
        }
        
        rag_payload = {
            "messages": message_dict, 
            "url": payload.url
        }
        
        # Call RAG system
        start_time = time.time()
        response = rag_object.response(rag_payload)
        process_time = time.time() - start_time
        
        # Log processing time
        logger.info(f"Generated response in {process_time:.2f}s")
        
        # Process result
        if not response or "answer" not in response:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to generate a response"
            )
            
        # Return successful response
        return {
            "answer": response["answer"],
            "metadata": {
                "process_time": process_time,
                "url": payload.url
            }
        }
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Log the full exception with traceback
        logger.error(f"Error processing request: {str(e)}\n{traceback.format_exc()}")
        
        # Return a friendly error message
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing request: {str(e)}"
        )

if __name__ == "__main__":
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=8000, 
        reload=False,  # Disable in production
        log_level="info"
    )