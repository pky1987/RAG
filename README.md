# RAG

**RAG** is a lightweight, fast Retrieval-Augmented Generation (RAG) toolkit and API with a bundled web UI. It provides components to ingest documents, build vector indices and knowledge graphs, and query them using an LLM-backed pipeline.

[![Version](https://img.shields.io/badge/Version-0.1.0-blue.svg)](https://github.com/pky1987/RAG)
[![API Version](https://img.shields.io/badge/API-0260-green.svg)](https://github.com/pky1987/RAG)
[![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)](https://www.python.org/)
[![License](https://img.shields.io/badge/License-MIT-red.svg)]([https://github.com/pky1987/RAG](https://github.com/pky1987/RAG/blob/main/LICENSE))

## ✨ Features

- **Multi-Provider LLM Support**: OpenAI, Azure OpenAI, Google Gemini, Ollama, AWS Bedrock, LoLLMs
- **Flexible Embedding Providers**: OpenAI, Azure OpenAI, Google Gemini, Ollama, AWS Bedrock, Jina AI, LoLLMs
- **Multiple Storage Backends**: JSON, Nano Vector DB, NetworkX, Neo4j, PostgreSQL, Qdrant, Redis, and more
- **Knowledge Graph Construction**: Automatic entity and relationship extraction
- **Vector Search**: Efficient similarity search with configurable thresholds
- **Web UI**: Modern React-based interface with graph visualization
- **REST API**: FastAPI-based API with OpenAPI documentation
- **Multi-Workspace Support**: Data isolation for different projects
- **Reranking Support**: Optional document reranking with Cohere, Jina, or Alibaba providers
- **Multi-Language Support**: Web UI available in multiple languages
- **Development Tools**: Pre-commit hooks, comprehensive logging, and testing framework

## 📋 Requirements

- **Python**: 3.10 or higher
- **Node.js Runtime**: Bun (recommended) or npm/yarn for frontend
- **LLM Provider**: API access to supported LLM providers
- **Embedding Provider**: API access to supported embedding providers

## 🚀 Quick Start

### Backend Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/pky1987/RAG.git
   cd RAG
   ```

2. **Create virtual environment**:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install --upgrade pip
   pip install fastapi uvicorn python-dotenv pipmaster gunicorn
   ```

4. **Configure environment**:
   Create a `.env` file in the project root with your API keys:

   **Example configuration for OpenAI:**
   ```bash
   LLM_BINDING=openai
   LLM_MODEL=gpt-4o-mini
   OPENAI_API_KEY=your_openai_api_key

   EMBEDDING_BINDING=openai
   EMBEDDING_MODEL=text-embedding-3-small
   OPENAI_API_KEY=your_openai_api_key

   # Optional: Workspace isolation
   WORKSPACE=my_project

   # Optional: Server configuration
   HOST=0.0.0.0
   PORT=9621
   ```

   **Other supported LLM providers:**
   ```bash
   # LLM Configuration (choose one provider)
   LLM_BINDING=openai          # or azure_openai, gemini, ollama, aws_bedrock, lollms
   LLM_MODEL=gpt-4o-mini       # Model name varies by provider
   LLM_BINDING_API_KEY=your_api_key  # API key for authentication

   # Embedding Configuration (choose one provider)
   EMBEDDING_BINDING=openai    # or azure_openai, gemini, ollama, jina, aws_bedrock, lollms
   EMBEDDING_MODEL=text-embedding-3-small  # Model name varies by provider
   EMBEDDING_BINDING_API_KEY=your_api_key  # API key for authentication
   ```

5. **Start the development server**:
   ```bash
   python -m lightrag.api.lightrag_server
   ```

The API will be available at `http://localhost:9621` with documentation at `http://localhost:9621/docs`.

### Frontend Setup (Optional)

1. **Install Bun** (recommended):
   ```bash
   curl -fsSL https://bun.sh/install | bash
   ```

2. **Build the frontend**:
   ```bash
   cd lightrag_webui
   bun install --frozen-lockfile
   bun run build
   cd ..
   ```

3. **Access the Web UI**:
   Visit `http://localhost:9621/webui` in your browser.

## 🏗️ Architecture

```
lightrag/
├── api/                    # FastAPI application and routes
│   ├── routers/           # API endpoint definitions
│   ├── static/            # Static assets (Swagger UI)
│   └── webui/             # Built frontend assets
├── kg/                    # Knowledge graph and vector storage implementations
├── llm/                   # LLM provider bindings
├── tools/                 # Utility scripts and tools
└── *.py                   # Core RAG implementation

lightrag_webui/            # React/Vite frontend application
├── src/
│   ├── components/        # Reusable UI components
│   ├── features/          # Feature-specific components
│   ├── api/              # Frontend API client
│   └── locales/          # Internationalization files
└── package.json
```

## ⚙️ Configuration

### Environment Variables

#### Core Configuration
- `WORKSPACE`: Workspace name for data isolation (default: empty string)
- `HOST`: Server bind address (default: 127.0.0.1)
- `PORT`: Server port (default: 9621)

#### LLM Configuration
- `LLM_BINDING`: LLM provider (`openai`, `azure_openai`, `gemini`, `ollama`, `aws_bedrock`, `lollms`)
- `LLM_MODEL`: Model name (provider-specific)
- `LLM_BINDING_HOST`: API endpoint URL (for Ollama, etc.)
- `LLM_BINDING_API_KEY`: API key for authentication

#### Embedding Configuration
- `EMBEDDING_BINDING`: Embedding provider (`openai`, `azure_openai`, `gemini`, `ollama`, `jina`, `aws_bedrock`, `lollms`)
- `EMBEDDING_MODEL`: Model name (provider-specific)
- `EMBEDDING_BINDING_HOST`: API endpoint URL
- `EMBEDDING_BINDING_API_KEY`: API key for authentication

#### Advanced Configuration
- `CHUNK_SIZE`: Token size per text chunk (default: 1200)
- `CHUNK_OVERLAP_SIZE`: Overlapping tokens between chunks (default: 100)
- `TOP_K`: Number of entities/relations to retrieve (default: 60)
- `COSINE_THRESHOLD`: Similarity threshold for vector search (default: 0.2)
- `MAX_GRAPH_NODES`: Maximum nodes in knowledge graph queries (default: 1000)

### Storage Backends

LightRAG supports multiple storage backends:

- **KV Storage**: `JsonKVStorage`, `RedisKVStorage`, `MongoKVStorage`, etc.
- **Vector Storage**: `NanoVectorDBStorage`, `QdrantStorage`, `MilvusStorage`, etc.
- **Graph Storage**: `NetworkXStorage`, `Neo4jStorage`, `MemgraphStorage`, etc.
- **Document Status**: `JsonDocStatusStorage`, `PostgresDocStatusStorage`, etc.

Configure via environment variables:
```bash
KV_STORAGE=JsonKVStorage
VECTOR_STORAGE=NanoVectorDBStorage
GRAPH_STORAGE=NetworkXStorage
DOC_STATUS_STORAGE=JsonDocStatusStorage
```

## 📡 API Usage

### Core Endpoints

- `GET /docs`: Swagger UI documentation
- `GET /health`: System health and configuration
- `POST /documents`: Upload and process documents
- `POST /query`: Query the knowledge base
- `GET /graphs`: Retrieve knowledge graph data
- `GET /webui`: Web UI interface (if built)

### Example API Usage

```python
import requests

# Upload a document
with open('document.txt', 'rb') as f:
    response = requests.post(
        'http://localhost:9621/documents',
        files={'file': f},
        headers={'Authorization': 'Bearer your_api_key'}
    )

# Query the knowledge base
response = requests.post(
    'http://localhost:9621/query',
    json={'query': 'What is machine learning?'},
    headers={'Authorization': 'Bearer your_api_key'}
)
```

### Python SDK Usage

```python
from lightrag import LightRAG

# Initialize RAG instance
rag = LightRAG(
    working_dir='./rag_storage',
    llm_model_func=your_llm_function,
    embedding_func=your_embedding_function
)

# Insert documents
rag.insert(['Your document text here'])

# Query
response = rag.query('Your question here')
print(response)
```

## 🛠️ Development

### Setting up Development Environment

1. **Install pre-commit hooks**:
   ```bash
   pip install pre-commit
   pre-commit install
   ```

2. **Install development dependencies**:
   ```bash
   pip install -r requirements-dev.txt  # If available
   ```

3. **Frontend development**:
   ```bash
   cd lightrag_webui
   bun install
   bun run dev  # Starts Vite dev server
   ```

### Running Tests

```bash
# Run Python tests
python -m pytest tests/

# Run frontend tests
cd lightrag_webui
bun test
```

### Building for Production

#### Backend
```bash
# Using Gunicorn (recommended for production)
python lightrag/api/run_with_gunicorn.py
```

#### Frontend
```bash
cd lightrag_webui
bun run build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes and ensure tests pass
4. Run pre-commit hooks: `pre-commit run --all-files`
5. Commit your changes: `git commit -am 'Add your feature'`
6. Push to the branch: `git push origin feature/your-feature`
7. Submit a pull request

### Development Guidelines

- Follow PEP 8 style guidelines for Python code
- Use type hints for function parameters and return values
- Write comprehensive tests for new features
- Update documentation for API changes
- Ensure frontend builds successfully before submitting PRs

## 📄 License

This project is developed by Prakash Yadav. Please check with the project author for licensing information, as no explicit license file is included in the repository.

## 🙏 Acknowledgments

- Built with FastAPI, React, and modern Python libraries
- Inspired by various RAG implementations in the AI community
- Thanks to all contributors and the open-source community

## 📞 Support

- **Repository**: [https://github.com/pky1987/RAG](https://github.com/pky1987/RAG)
- **Issues**: [https://github.com/pky1987/RAG/issues](https://github.com/pky1987/RAG/issues)
- **Author**: Prakash Yadav

---

For more detailed documentation, visit the API documentation at `/docs` when the server is running, or check the `docs/` directory in the repository.
