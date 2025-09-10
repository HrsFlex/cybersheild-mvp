#!/usr/bin/env python3
"""
Basic TriNetra Backend Test - No external dependencies
"""

import sqlite3
import json
import random
from datetime import datetime, timedelta

def test_database_creation():
    """Test basic database operations"""
    print("🔄 Testing database creation...")
    
    db_path = 'test_trinetra.db'
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Create transactions table
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
    
    # Insert test data
    test_transactions = []
    base_time = datetime.now() - timedelta(days=7)
    
    for i in range(50):
        tx = {
            'transaction_id': f'TEST_{i:04d}',
            'from_account': f'ACC_{i % 10:03d}',
            'to_account': f'ACC_{(i + 1) % 10:03d}',
            'amount': random.uniform(100, 10000),
            'timestamp': (base_time + timedelta(hours=i)).isoformat(),
            'transaction_type': 'transfer',
            'suspicious_score': random.uniform(0.1, 0.9),
            'pattern_type': random.choice(['normal', 'layering', 'smurfing']),
            'scenario': 'test_scenario'
        }
        test_transactions.append(tx)
    
    # Insert transactions
    for tx in test_transactions:
        cursor.execute('''
            INSERT INTO transactions 
            (transaction_id, from_account, to_account, amount, timestamp, 
             transaction_type, suspicious_score, pattern_type, scenario)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            tx['transaction_id'], tx['from_account'], tx['to_account'],
            tx['amount'], tx['timestamp'], tx['transaction_type'],
            tx['suspicious_score'], tx['pattern_type'], tx['scenario']
        ))
    
    conn.commit()
    
    # Test query
    cursor.execute("SELECT COUNT(*) FROM transactions")
    count = cursor.fetchone()[0]
    
    conn.close()
    
    print(f"✅ Database created with {count} test transactions")
    return db_path

def test_api_simulation():
    """Test API simulation without Flask"""
    print("🔄 Testing API simulation...")
    
    # Simulate CHRONOS timeline data
    chronos_data = {
        'status': 'success',
        'data': [
            {
                'id': 'TF_0001',
                'timestamp': datetime.now().isoformat(),
                'from_account': 'DONOR_001',
                'to_account': 'TERROR_CELL_001',
                'amount': 250.0,
                'suspicious_score': 0.85,
                'pattern_type': 'micro_donations',
                'scenario': 'terrorist_financing'
            }
        ],
        'total_transactions': 1
    }
    
    # Simulate HYDRA pattern generation
    hydra_pattern = {
        'pattern_id': f'GEN_{datetime.now().strftime("%H%M%S")}',
        'pattern_type': 'layering_complex',
        'complexity_score': 0.75,
        'generated_at': datetime.now().isoformat()
    }
    
    # Simulate Auto-SAR report
    sar_report = {
        'report_id': f'SAR_{datetime.now().strftime("%Y%m%d_%H%M%S")}',
        'generated_at': datetime.now().isoformat(),
        'title': 'Suspected Terrorist Financing Activity',
        'priority': 'HIGH',
        'summary': 'Multiple small-value transactions detected'
    }
    
    print("✅ API simulation data generated")
    print(f"   - CHRONOS: {len(chronos_data['data'])} transactions")
    print(f"   - HYDRA: {hydra_pattern['pattern_type']} pattern")
    print(f"   - Auto-SAR: {sar_report['report_id']}")
    
    return chronos_data, hydra_pattern, sar_report

def main():
    """Run all tests"""
    print("🔹 TriNetra Backend Basic Test")
    print("=" * 50)
    
    try:
        # Test 1: Database
        db_path = test_database_creation()
        
        # Test 2: API simulation
        chronos_data, hydra_pattern, sar_report = test_api_simulation()
        
        # Test 3: JSON serialization
        print("🔄 Testing JSON serialization...")
        test_json = json.dumps({
            'chronos': chronos_data,
            'hydra': hydra_pattern,
            'autosar': sar_report
        }, indent=2)
        print("✅ JSON serialization working")
        
        print("\n🎉 All basic tests passed!")
        print("\nNext steps:")
        print("1. Install Flask: pip install Flask Flask-CORS")
        print("2. Install pandas: pip install pandas numpy")
        print("3. Install ML libraries: pip install scikit-learn")
        print("4. Run: python app.py")
        
        # Cleanup
        import os
        if os.path.exists(db_path):
            os.remove(db_path)
            print(f"🧹 Cleaned up {db_path}")
            
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()