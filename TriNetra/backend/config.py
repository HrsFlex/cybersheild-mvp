import os

try:
    from dotenv import load_dotenv
    load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))
except ImportError:
    pass

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'trinetra-secret-key-2025'
    DATABASE_PATH = os.path.join(os.path.dirname(__file__), 'data', 'transactions.db')
    DEBUG = True
    HOST = '0.0.0.0'
    PORT = 5001
    # AI provider used for the enhanced insights features (chronos/hydra/autosar).
    # "openai"     -> calls OpenAI directly using OPENAI_API_KEY
    # "openrouter" -> routes through OpenRouter using OPENROUTER_API_KEY
    LLM_PROVIDER = os.environ.get('LLM_PROVIDER', 'openai').lower()

    OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY', '')
    OPENAI_MODEL = os.environ.get('OPENAI_MODEL', 'gpt-4o-mini')

    OPENROUTER_API_KEY = os.environ.get('OPENROUTER_API_KEY', '')
    OPENROUTER_MODEL = os.environ.get('OPENROUTER_MODEL', 'openai/gpt-4o-mini')