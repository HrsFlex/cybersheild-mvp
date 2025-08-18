from flask import Blueprint, jsonify, request
import sqlite3
import pandas as pd
from datetime import datetime, timedelta
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from config import Config

chronos_bp = Blueprint('chronos', __name__)

@chronos_bp.route('/timeline', methods=['GET'])
def get_timeline_data():
    """Get transaction timeline data for CHRONOS visualization"""
    try:
        scenario = request.args.get('scenario', 'all')
        time_range = request.args.get('time_range', '30d')
        
        conn = sqlite3.connect(Config.DATABASE_PATH)
        
        # Build query based on scenario
        if scenario == 'all':
            query = "SELECT * FROM transactions ORDER BY timestamp"
        else:
            query = f"SELECT * FROM transactions WHERE scenario = '{scenario}' ORDER BY timestamp"
        
        df = pd.read_sql_query(query, conn)
        conn.close()
        
        # Convert to timeline format
        timeline_data = []
        for _, row in df.iterrows():
            timeline_data.append({
                'id': row['transaction_id'],
                'timestamp': row['timestamp'],
                'from_account': row['from_account'],
                'to_account': row['to_account'],
                'amount': float(row['amount']),
                'suspicious_score': float(row['suspicious_score']),
                'pattern_type': row['pattern_type'],
                'scenario': row['scenario']
            })
        
        return jsonify({
            'status': 'success',
            'data': timeline_data,
            'total_transactions': len(timeline_data)
        })
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@chronos_bp.route('/patterns', methods=['GET'])
def get_pattern_analysis():
    """Get detected patterns for visualization"""
    try:
        conn = sqlite3.connect(Config.DATABASE_PATH)
        
        # Get pattern statistics
        query = """
            SELECT 
                pattern_type,
                scenario,
                COUNT(*) as transaction_count,
                AVG(suspicious_score) as avg_suspicion,
                AVG(amount) as avg_amount
            FROM transactions 
            GROUP BY pattern_type, scenario
        """
        
        df = pd.read_sql_query(query, conn)
        conn.close()
        
        patterns = df.to_dict('records')
        
        return jsonify({
            'status': 'success',
            'patterns': patterns
        })
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500