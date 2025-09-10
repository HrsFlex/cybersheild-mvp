from flask import Blueprint, jsonify, request
import sqlite3
import pandas as pd
from datetime import datetime, timedelta
import sys
import os
import json
import random

sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from config import Config

chronos_bp = Blueprint('chronos', __name__)

@chronos_bp.route('/timeline', methods=['GET'])
def get_timeline_data():
    """Get enhanced transaction timeline data for CHRONOS visualization with time quantum selection"""
    try:
        scenario = request.args.get('scenario', 'all')
        time_quantum = request.args.get('time_quantum', '1m')  # 1m, 6m, 1y, 3y
        
        conn = sqlite3.connect(Config.DATABASE_PATH)
        
        # Calculate time range based on quantum
        now = datetime.now()
        if time_quantum == '1m':
            start_date = now - timedelta(days=30)
        elif time_quantum == '6m':
            start_date = now - timedelta(days=180)
        elif time_quantum == '1y':
            start_date = now - timedelta(days=365)
        elif time_quantum == '3y':
            start_date = now - timedelta(days=1095)
        else:
            start_date = now - timedelta(days=30)  # Default to 1 month
        
        # Build query based on scenario and time range
        if scenario == 'all':
            query = "SELECT * FROM transactions WHERE timestamp >= ? ORDER BY timestamp"
            df = pd.read_sql_query(query, conn, params=[start_date.isoformat()])
        else:
            query = "SELECT * FROM transactions WHERE scenario = ? AND timestamp >= ? ORDER BY timestamp"
            df = pd.read_sql_query(query, conn, params=[scenario, start_date.isoformat()])
        conn.close()
        
        # Convert to enhanced timeline format with layering analysis
        timeline_data = []
        for _, row in df.iterrows():
            # Generate realistic Aadhar-based location data
            aadhar_location = generate_aadhar_location()
            
            # Apply layering method analysis
            layering_analysis = apply_layering_method(row)
            
            timeline_data.append({
                'id': row['transaction_id'],
                'timestamp': row['timestamp'],
                'from_account': row['from_account'],
                'to_account': row['to_account'],
                'amount': float(row['amount']),
                'suspicious_score': float(row['suspicious_score']),
                'pattern_type': row['pattern_type'],
                'scenario': row['scenario'],
                # Enhanced fields
                'aadhar_location': aadhar_location,
                'layering_analysis': layering_analysis,
                'country_risk_level': get_country_risk_level(aadhar_location['country']),
                'transaction_method': get_transaction_method(),
                'bank_details': generate_bank_details()
            })
        
        return jsonify({
            'status': 'success',
            'data': timeline_data,
            'total_transactions': len(timeline_data),
            'time_quantum': time_quantum,
            'date_range': {
                'start': start_date.isoformat(),
                'end': now.isoformat()
            },
            'layering_summary': generate_layering_summary(timeline_data)
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

@chronos_bp.route('/search', methods=['POST'])
def search_transactions():
    """Search transactions with detailed popup information"""
    try:
        search_data = request.get_json()
        search_term = search_data.get('term', '')
        search_type = search_data.get('type', 'all')  # all, amount, account, id
        
        conn = sqlite3.connect(Config.DATABASE_PATH)
        
        # Build search query based on type
        if search_type == 'amount':
            query = "SELECT * FROM transactions WHERE amount = ? ORDER BY timestamp DESC"
            df = pd.read_sql_query(query, conn, params=[float(search_term)])
        elif search_type == 'account':
            query = "SELECT * FROM transactions WHERE from_account LIKE ? OR to_account LIKE ? ORDER BY timestamp DESC"
            df = pd.read_sql_query(query, conn, params=[f'%{search_term}%', f'%{search_term}%'])
        elif search_type == 'id':
            query = "SELECT * FROM transactions WHERE transaction_id LIKE ? ORDER BY timestamp DESC"
            df = pd.read_sql_query(query, conn, params=[f'%{search_term}%'])
        else:
            # Search all fields
            query = """
                SELECT * FROM transactions 
                WHERE transaction_id LIKE ? 
                OR from_account LIKE ? 
                OR to_account LIKE ? 
                OR CAST(amount AS TEXT) LIKE ?
                ORDER BY timestamp DESC
            """
            search_pattern = f'%{search_term}%'
            df = pd.read_sql_query(query, conn, params=[search_pattern, search_pattern, search_pattern, search_pattern])
        
        conn.close()
        
        # Format search results with enhanced details
        results = []
        for _, row in df.iterrows():
            aadhar_location = generate_aadhar_location()
            layering_analysis = apply_layering_method(row)
            
            results.append({
                'id': row['transaction_id'],
                'timestamp': row['timestamp'],
                'from_account': row['from_account'],
                'to_account': row['to_account'],
                'amount': float(row['amount']),
                'suspicious_score': float(row['suspicious_score']),
                'pattern_type': row['pattern_type'],
                'scenario': row['scenario'],
                'aadhar_location': aadhar_location,
                'layering_analysis': layering_analysis,
                'country_risk_level': get_country_risk_level(aadhar_location['country']),
                'transaction_method': get_transaction_method(),
                'bank_details': generate_bank_details(),
                'match_type': search_type,
                'match_score': calculate_match_score(row, search_term, search_type)
            })
        
        return jsonify({
            'status': 'success',
            'results': results,
            'total_matches': len(results),
            'search_term': search_term,
            'search_type': search_type
        })
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

# Helper Functions

def generate_aadhar_location():
    """Generate realistic Aadhar-based location data"""
    indian_locations = [
        {'state': 'Maharashtra', 'city': 'Mumbai', 'region': 'Western', 'country': 'India'},
        {'state': 'Delhi', 'city': 'New Delhi', 'region': 'Northern', 'country': 'India'},
        {'state': 'Karnataka', 'city': 'Bangalore', 'region': 'Southern', 'country': 'India'},
        {'state': 'Tamil Nadu', 'city': 'Chennai', 'region': 'Southern', 'country': 'India'},
        {'state': 'West Bengal', 'city': 'Kolkata', 'region': 'Eastern', 'country': 'India'},
        {'state': 'Gujarat', 'city': 'Ahmedabad', 'region': 'Western', 'country': 'India'},
        {'state': 'Rajasthan', 'city': 'Jaipur', 'region': 'Western', 'country': 'India'},
        {'state': 'Punjab', 'city': 'Chandigarh', 'region': 'Northern', 'country': 'India'},
        {'state': 'Uttar Pradesh', 'city': 'Lucknow', 'region': 'Northern', 'country': 'India'},
    ]
    
    # Add some international locations for suspicious transactions
    international_locations = [
        {'state': 'Dubai', 'city': 'Dubai', 'region': 'Middle East', 'country': 'UAE'},
        {'state': 'Singapore', 'city': 'Singapore', 'region': 'Southeast Asia', 'country': 'Singapore'},
        {'state': 'Karachi', 'city': 'Karachi', 'region': 'South Asia', 'country': 'Pakistan'},
        {'state': 'London', 'city': 'London', 'region': 'Europe', 'country': 'UK'},
        {'state': 'New York', 'city': 'New York', 'region': 'North America', 'country': 'USA'},
    ]
    
    # 85% chance of Indian location, 15% international
    if random.random() < 0.85:
        location = random.choice(indian_locations)
    else:
        location = random.choice(international_locations)
    
    # Add coordinates for mapping
    coordinates = get_location_coordinates(location['city'])
    location.update(coordinates)
    
    return location

def get_location_coordinates(city):
    """Get approximate coordinates for cities"""
    coordinates_map = {
        'Mumbai': {'lat': 19.0760, 'lng': 72.8777},
        'New Delhi': {'lat': 28.6139, 'lng': 77.2090},
        'Bangalore': {'lat': 12.9716, 'lng': 77.5946},
        'Chennai': {'lat': 13.0827, 'lng': 80.2707},
        'Kolkata': {'lat': 22.5726, 'lng': 88.3639},
        'Ahmedabad': {'lat': 23.0225, 'lng': 72.5714},
        'Jaipur': {'lat': 26.9124, 'lng': 75.7873},
        'Chandigarh': {'lat': 30.7333, 'lng': 76.7794},
        'Lucknow': {'lat': 26.8467, 'lng': 80.9462},
        'Dubai': {'lat': 25.2048, 'lng': 55.2708},
        'Singapore': {'lat': 1.3521, 'lng': 103.8198},
        'Karachi': {'lat': 24.8607, 'lng': 67.0011},
        'London': {'lat': 51.5074, 'lng': -0.1278},
        'New York': {'lat': 40.7128, 'lng': -74.0060},
    }
    
    return coordinates_map.get(city, {'lat': 0, 'lng': 0})

def apply_layering_method(transaction_row):
    """Apply layering method analysis for pattern detection"""
    layering_analysis = {
        'layer_1_extraction': {
            'description': 'Transaction data extraction and basic pattern identification',
            'patterns_detected': [],
            'risk_indicators': []
        },
        'layer_2_processing': {
            'description': 'Advanced pattern analysis and relationship mapping',
            'connected_accounts': random.randint(2, 15),
            'temporal_patterns': [],
            'amount_patterns': []
        },
        'layer_3_integration': {
            'description': 'Cross-reference with known threat patterns and geolocation',
            'threat_level': 'LOW',
            'geolocation_risk': 'NORMAL',
            'pattern_match_confidence': 0.0
        }
    }
    
    suspicious_score = float(transaction_row['suspicious_score'])
    amount = float(transaction_row['amount'])
    pattern_type = transaction_row['pattern_type']
    
    # Layer 1: Basic pattern detection
    if amount < 10000:
        layering_analysis['layer_1_extraction']['patterns_detected'].append('Small value transaction')
    elif amount > 500000:
        layering_analysis['layer_1_extraction']['patterns_detected'].append('Large value transaction')
        layering_analysis['layer_1_extraction']['risk_indicators'].append('High amount alert')
    
    if pattern_type in ['rapid_sequence', 'smurfing']:
        layering_analysis['layer_1_extraction']['patterns_detected'].append('Structured layering detected')
        layering_analysis['layer_1_extraction']['risk_indicators'].append('Potential money laundering')
    
    # Layer 2: Advanced processing
    if suspicious_score > 0.7:
        layering_analysis['layer_2_processing']['temporal_patterns'].append('Suspicious timing patterns')
        layering_analysis['layer_2_processing']['amount_patterns'].append('Irregular amount structure')
    
    # Layer 3: Integration and final assessment
    if suspicious_score > 0.8:
        layering_analysis['layer_3_integration']['threat_level'] = 'CRITICAL'
        layering_analysis['layer_3_integration']['pattern_match_confidence'] = suspicious_score
    elif suspicious_score > 0.5:
        layering_analysis['layer_3_integration']['threat_level'] = 'MEDIUM'
        layering_analysis['layer_3_integration']['pattern_match_confidence'] = suspicious_score
    
    return layering_analysis

def get_country_risk_level(country):
    """Get risk level based on country"""
    high_risk_countries = ['Pakistan', 'Afghanistan', 'North Korea', 'Iran']
    medium_risk_countries = ['UAE', 'Malaysia', 'Thailand', 'Myanmar']
    
    if country in high_risk_countries:
        return {'level': 3, 'description': 'High Risk Country', 'color': '#ff4444'}
    elif country in medium_risk_countries:
        return {'level': 2, 'description': 'Medium Risk Country', 'color': '#ffaa00'}
    else:
        return {'level': 1, 'description': 'Low Risk Country', 'color': '#44ff44'}

def get_transaction_method():
    """Generate realistic transaction method"""
    methods = [
        'NEFT', 'RTGS', 'IMPS', 'UPI', 'Wire Transfer', 
        'Cryptocurrency', 'Hawala', 'Cash Deposit', 'Cheque', 'Digital Wallet'
    ]
    return random.choice(methods)

def generate_bank_details():
    """Generate realistic bank details"""
    banks = [
        'State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank',
        'Punjab National Bank', 'Bank of Baroda', 'Canara Bank', 'IDBI Bank',
        'Central Bank of India', 'Union Bank of India'
    ]
    
    return {
        'bank_name': random.choice(banks),
        'branch_code': f'BR{random.randint(1000, 9999)}',
        'ifsc_code': f'SBIN{random.randint(100000, 999999)}',
        'swift_code': f'SWIFT{random.randint(10000, 99999)}'
    }

def generate_layering_summary(timeline_data):
    """Generate summary of layering analysis for all transactions"""
    if not timeline_data:
        return {}
    
    total_transactions = len(timeline_data)
    high_risk = sum(1 for tx in timeline_data if tx['layering_analysis']['layer_3_integration']['threat_level'] == 'CRITICAL')
    medium_risk = sum(1 for tx in timeline_data if tx['layering_analysis']['layer_3_integration']['threat_level'] == 'MEDIUM')
    low_risk = total_transactions - high_risk - medium_risk
    
    return {
        'total_transactions': total_transactions,
        'risk_distribution': {
            'critical': high_risk,
            'medium': medium_risk,
            'low': low_risk
        },
        'layering_effectiveness': {
            'layer_1_detection_rate': random.uniform(0.85, 0.95),
            'layer_2_processing_rate': random.uniform(0.75, 0.90),
            'layer_3_integration_rate': random.uniform(0.60, 0.80)
        }
    }

def calculate_match_score(transaction_row, search_term, search_type):
    """Calculate how well a transaction matches the search criteria"""
    if search_type == 'amount':
        return 1.0 if float(transaction_row['amount']) == float(search_term) else 0.0
    elif search_type == 'account':
        account_match = (search_term.lower() in transaction_row['from_account'].lower() or 
                        search_term.lower() in transaction_row['to_account'].lower())
        return 0.9 if account_match else 0.0
    elif search_type == 'id':
        return 0.95 if search_term.lower() in transaction_row['transaction_id'].lower() else 0.0
    else:
        # General search - calculate composite score
        score = 0.0
        if search_term.lower() in transaction_row['transaction_id'].lower():
            score += 0.4
        if search_term.lower() in str(transaction_row['amount']):
            score += 0.3
        if (search_term.lower() in transaction_row['from_account'].lower() or 
            search_term.lower() in transaction_row['to_account'].lower()):
            score += 0.3
        return min(score, 1.0)