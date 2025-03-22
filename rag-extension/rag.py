from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq
from langchain_community.vectorstores import FAISS
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnableBranch, RunnablePassthrough
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import MessagesPlaceholder
import requests
import os
import json
from bs4 import BeautifulSoup
import faiss
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.docstore.in_memory import InMemoryDocstore
from uuid import uuid4
import logging
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv
import httpx
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger("rag_service")

# Load environment variables
load_dotenv()

# System prompt template
SYSTEM_TEMPLATE = """
Answer the user's questions based on the below context.
If the context doesn't contain any relevant information to the question, don't make something up and just only respond back with "I don't know":

<context>
{context}
</context>
"""

class Rag:
    def __init__(self):
        """Initialize the RAG system with embeddings model and configuration."""
        self.system_template = SYSTEM_TEMPLATE
        self.docs = []
        self.vector_store = None
        
        # Ensure API keys are available
        self.groq_api_key = os.getenv("groq_api_key")
        self.hf_api_key = os.getenv("huggingface_api_key")
        
        if not self.groq_api_key:
            logger.warning("GROQ_API_KEY not found in environment variables")
            
        if not self.hf_api_key:
            logger.warning("HuggingFace_API_KEY not found in environment variables")
            os.environ["HuggingFace_API_KEY"] = self.hf_api_key
        
        # Initialize embeddings model
        try:
            self.embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-mpnet-base-v2")
            logger.info("Embeddings model loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load embeddings model: {str(e)}")
            raise
            
        # Create data directory if it doesn't exist
        self.data_dir = Path("data")
        self.data_dir.mkdir(exist_ok=True)
        self.url_file = self.data_dir / "url_mapping.json"

    def web_parsing(self, url: str, timeout: int = 10) -> List[Document]:
        """
        Parse web content and extract text with metadata.
        
        Args:
            url: The URL to parse
            timeout: Request timeout in seconds
            
        Returns:
            List of Document objects with content and metadata
        """
        self.docs = []  # Reset docs for new request
        
        try:
            logger.info(f"Fetching content from: {url}")
            
            # Use httpx with timeout and verification disabled for problematic sites
            async_client = httpx.AsyncClient(timeout=timeout, verify=False)
            with httpx.Client(timeout=timeout, verify=False) as client:
                response = client.get(url, follow_redirects=True)
                response.raise_for_status()
                
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Extract main text content
            # Remove script and style elements that might contain code
            for script in soup(["script", "style", "nav", "footer", "header"]):
                script.extract()
                
            text = soup.get_text(separator='\n', strip=True)
            
            # Extract metadata
            metadata = {"source": url}
            
            if title := soup.find("title"):
                metadata["title"] = title.get_text(strip=True)
                
            if description := soup.find("meta", attrs={"name": "description"}):
                metadata["description"] = description.get("content", "No description found.")
                
            if html := soup.find("html"):
                metadata["language"] = html.get("lang", "en")
                
            # Add domain to metadata
            from urllib.parse import urlparse
            domain = urlparse(url).netloc
            metadata["domain"] = domain
            
            self.docs.append(Document(page_content=text, metadata=metadata))
            logger.info(f"Successfully parsed {url}, extracted {len(text)} characters")
            
            return self.docs
            
        except (requests.RequestException, httpx.HTTPError) as e:
            logger.error(f"Error fetching URL {url}: {str(e)}")
            # Return an empty document with error information
            self.docs.append(Document(
                page_content="Failed to retrieve content from this URL.",
                metadata={"source": url, "error": str(e)}
            ))
            return self.docs

    def create_embeddings(self, documents: List[Document], uuid: str) -> FAISS:
        """
        Create and store embeddings for documents.
        
        Args:
            documents: List of documents to embed
            uuid: Unique identifier for storage
            
        Returns:
            FAISS vector store with embeddings
        """
        try:
            logger.info(f"Creating embeddings for {len(documents)} documents")
            
            # Split documents into chunks
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=1000, 
                chunk_overlap=200, 
                add_start_index=True
            )
            all_splits = text_splitter.split_documents(documents)
            logger.info(f"Created {len(all_splits)} text chunks from documents")
            
            # Initialize FAISS index
            embedding_dim = len(self.embeddings.embed_query("hello world"))
            index = faiss.IndexFlatL2(embedding_dim)
            
            self.vector_store = FAISS(
                embedding_function=self.embeddings, 
                index=index,
                docstore=InMemoryDocstore(),
                index_to_docstore_id={}
            )
            
            # Generate unique IDs for documents
            uuids = [str(uuid4()) for _ in all_splits]
            
            # Add documents to vector store
            self.vector_store.add_documents(all_splits, document_ids=uuids)
            
            # Save vector store
            storage_path = self.data_dir / uuid
            self.vector_store.save_local(str(storage_path))
            logger.info(f"Vector store saved to {storage_path}")
            
            return self.vector_store
            
        except Exception as e:
            logger.error(f"Error creating embeddings: {str(e)}")
            raise

    def get_or_create_uuid(self, url: str) -> str:
        """
        Get existing UUID for URL or create a new one.
        
        Args:
            url: The URL to map
            
        Returns:
            UUID string for the URL
        """
        # Load existing mappings if available
        if self.url_file.exists():
            try:
                with open(self.url_file, "r") as f:
                    url_dict = json.load(f)
            except json.JSONDecodeError:
                logger.warning(f"Invalid JSON in {self.url_file}, creating new mapping")
                url_dict = {}
        else:
            url_dict = {}
            
        # Create reverse mapping
        url_dict_reversed = {v: k for k, v in url_dict.items()}
        
        # Use existing UUID or create new one
        if url in url_dict_reversed:
            uuid = url_dict_reversed[url]
            logger.info(f"Using existing UUID {uuid} for {url}")
        else:
            uuid = str(uuid4())
            url_dict[uuid] = url
            logger.info(f"Created new UUID {uuid} for {url}")
            
            # Save updated mappings
            with open(self.url_file, "w") as f:
                json.dump(url_dict, f, indent=4)
                
        return uuid

    def response(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process user query and generate response using RAG.
        
        Args:
            payload: Dictionary containing messages and URL
            
        Returns:
            Dictionary with the answer and context
        """
        try:
            # Extract messages and URL
            messages = payload.get('messages', {}).get('message', [])
            url = payload.get('url', '')
            
            if not url:
                logger.error("No URL provided in payload")
                return {"answer": "Error: No URL was provided for context."}
                
            if not messages:
                logger.error("No messages provided in payload")
                return {"answer": "Error: No messages were provided in the request."}
                
            # Get documents from URL
            documents = self.web_parsing(url)
            if not documents or len(documents[0].page_content) < 100:
                logger.warning(f"Insufficient content from {url}")
                return {"answer": "I couldn't extract enough information from the provided URL."}
                
            # Get or create UUID for URL
            uuid = self.get_or_create_uuid(url)
            
            # Load or create vector store
            vector_store_path = self.data_dir / uuid
            if vector_store_path.exists():
                logger.info(f"Loading existing vector store from {vector_store_path}")
                self.vector_store = FAISS.load_local(
                    str(vector_store_path), 
                    embeddings=self.embeddings, 
                    allow_dangerous_deserialization=True
                )
            else:
                logger.info(f"Creating new vector store for {url}")
                self.vector_store = self.create_embeddings(documents, uuid)
                
            # Create retriever
            retriever = self.vector_store.as_retriever(search_kwargs={"k": 3})
            
            # Initialize LLM
            if not self.groq_api_key:
                return {"answer": "Error: GROQ API key is not configured."}
                
            llm = ChatGroq(
                model='llama-3.1-8b-instant', 
                api_key=self.groq_api_key,
                temperature=0.1  # Lower temperature for more factual responses
            )
            
            # Create QA chain
            question_answering_prompt = ChatPromptTemplate.from_messages([
                ("system", self.system_template),
                MessagesPlaceholder(variable_name="message"),
            ])
            
            document_chain = create_stuff_documents_chain(llm, question_answering_prompt)
            
            # Query transformation chain
            query_transform_prompt = ChatPromptTemplate.from_messages([
                MessagesPlaceholder(variable_name="message"),
                (
                    "user",
                    "Given the above conversation, generate a search query to look up information relevant to the conversation. Only respond with the query, nothing else.",
                ),
            ])
            
            # Retrieval chain with branching logic
            query_transforming_retriever_chain = RunnableBranch(
                (
                    lambda x: len(x.get("message", [])) == 1,
                    (lambda x: x["message"][-1]['content']) | retriever,
                ),
                query_transform_prompt | llm | StrOutputParser() | retriever,
            ).with_config(run_name="chat_retriever_chain")
            
            # Complete RAG chain
            conversational_retrieval_chain = (
                RunnablePassthrough.assign(context=query_transforming_retriever_chain)
                .assign(answer=document_chain)
            )
            
            # Generate response
            logger.info(f"Generating response for query from {url}")
            response = conversational_retrieval_chain.invoke({"message": messages})
            
            return response
            
        except Exception as e:
            logger.error(f"Error generating response: {str(e)}")
            return {"answer": f"I encountered an error while processing your request: {str(e)}"}