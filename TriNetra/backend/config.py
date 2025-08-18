import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'trinetra-secret-key-2025'
    DATABASE_PATH = os.path.join(os.path.dirname(__file__), 'data', 'transactions.db')
    DEBUG = True
    HOST = '0.0.0.0'
    PORT = 5000