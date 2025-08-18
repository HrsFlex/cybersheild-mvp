import sqlite3
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import json
import os
from faker import Faker

fake = Faker()

class TriNetraDataGenerator:
    def __init__(self, db_path):
        self.db_path = db_path
        self.ensure_directory_exists()
    
    def ensure_directory_exists(self):
        """Create data directory if it doesn't exist"""
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
    
    def create_tables(self):
        """Create database tables"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Transactions table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS transactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                transaction_id TEXT UNIQUE,
                from_account TEXT,
                to_account TEXT,
                amount REAL,
                timestamp TEXT,
                transaction_type TEXT,
                suspicious_score REAL,
                pattern_type TEXT,
                scenario TEXT
            )
        ''')
        
        # Accounts table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS accounts (
                account_id TEXT PRIMARY KEY,
                account_name TEXT,
                account_type TEXT,
                country TEXT,
                risk_level TEXT
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def generate_scenario_data(self, scenario_name, num_transactions=100):
        """Generate synthetic data for specific scenarios"""
        scenarios = {
            'terrorist_financing': self._generate_terrorist_financing,
            'crypto_sanctions': self._generate_crypto_sanctions,
            'human_trafficking': self._generate_human_trafficking
        }
        
        if scenario_name in scenarios:
            return scenarios[scenario_name](num_transactions)
        else:
            return self._generate_random_transactions(num_transactions)
    
    def _generate_terrorist_financing(self, num_transactions):
        """Generate terrorist financing scenario"""
        transactions = []
        base_time = datetime.now() - timedelta(days=30)
        target_account = "TERROR_CELL_001"
        
        for i in range(num_transactions):
            transaction = {
                'transaction_id': f'TF_{i:04d}',
                'from_account': f'DONOR_{i % 50:03d}',
                'to_account': target_account if i % 3 == 0 else f'SHELL_{i % 10:02d}',
                'amount': np.random.uniform(50, 500),  # Small amounts
                'timestamp': (base_time + timedelta(hours=i)).isoformat(),
                'transaction_type': 'transfer',
                'suspicious_score': np.random.uniform(0.6, 0.9),
                'pattern_type': 'micro_donations',
                'scenario': 'terrorist_financing'
            }
            transactions.append(transaction)
        
        return transactions
    
    def _generate_crypto_sanctions(self, num_transactions):
        """Generate crypto sanctions evasion scenario"""
        transactions = []
        base_time = datetime.now() - timedelta(days=7)
        
        for i in range(num_transactions):
            transaction = {
                'transaction_id': f'CS_{i:04d}',
                'from_account': f'WALLET_{i % 20:03d}',
                'to_account': f'MIXER_{i % 5:02d}' if i % 4 == 0 else f'EXCHANGE_{i % 8:02d}',
                'amount': np.random.uniform(1000, 50000),
                'timestamp': (base_time + timedelta(hours=i*2)).isoformat(),
                'transaction_type': 'crypto_transfer',
                'suspicious_score': np.random.uniform(0.7, 0.95),
                'pattern_type': 'layering',
                'scenario': 'crypto_sanctions'
            }
            transactions.append(transaction)
        
        return transactions
    
    def _generate_human_trafficking(self, num_transactions):
        """Generate human trafficking network scenario"""
        transactions = []
        base_time = datetime.now() - timedelta(days=60)
        
        for i in range(num_transactions):
            transaction = {
                'transaction_id': f'HT_{i:04d}',
                'from_account': f'FRONT_BUSINESS_{i % 15:02d}',
                'to_account': f'HANDLER_{i % 8:02d}',
                'amount': np.random.uniform(2000, 15000),
                'timestamp': (base_time + timedelta(hours=i*6)).isoformat(),
                'transaction_type': 'cash_transfer',
                'suspicious_score': np.random.uniform(0.5, 0.8),
                'pattern_type': 'network_distribution',
                'scenario': 'human_trafficking'
            }
            transactions.append(transaction)
        
        return transactions
    
    def _generate_random_transactions(self, num_transactions):
        """Generate normal transactions for baseline"""
        transactions = []
        base_time = datetime.now() - timedelta(days=30)
        
        for i in range(num_transactions):
            transaction = {
                'transaction_id': f'NORM_{i:04d}',
                'from_account': fake.iban(),
                'to_account': fake.iban(),
                'amount': np.random.uniform(100, 10000),
                'timestamp': (base_time + timedelta(hours=i)).isoformat(),
                'transaction_type': 'transfer',
                'suspicious_score': np.random.uniform(0.1, 0.3),
                'pattern_type': 'normal',
                'scenario': 'baseline'
            }
            transactions.append(transaction)
        
        return transactions
    
    def populate_database(self):
        """Populate database with all scenarios"""
        conn = sqlite3.connect(self.db_path)
        
        # Generate data for all scenarios
        all_transactions = []
        scenarios = ['terrorist_financing', 'crypto_sanctions', 'human_trafficking']
        
        for scenario in scenarios:
            transactions = self.generate_scenario_data(scenario, 150)
            all_transactions.extend(transactions)
        
        # Add some normal transactions
        normal_transactions = self.generate_scenario_data('normal', 300)
        all_transactions.extend(normal_transactions)
        
        # Insert transactions
        df = pd.DataFrame(all_transactions)
        df.to_sql('transactions', conn, if_exists='replace', index=False)
        
        print(f"✅ Generated {len(all_transactions)} transactions")
        print(f"✅ Database populated at: {self.db_path}")
        
        conn.close()

def init_database():
    """Initialize database with synthetic data"""
    from config import Config
    
    generator = TriNetraDataGenerator(Config.DATABASE_PATH)
    generator.create_tables()
    
    # Only populate if database is empty
    conn = sqlite3.connect(Config.DATABASE_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM transactions")
    count = cursor.fetchone()[0]
    conn.close()
    
    if count == 0:
        print("🔄 Initializing TriNetra database...")
        generator.populate_database()
    else:
        print(f"✅ Database already contains {count} transactions")

if __name__ == "__main__":
    # Test data generation
    generator = TriNetraDataGenerator("test_transactions.db")
    generator.create_tables()
    generator.populate_database()