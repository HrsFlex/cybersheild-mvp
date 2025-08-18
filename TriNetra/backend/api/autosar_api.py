from flask import Blueprint, jsonify, request
from datetime import datetime, timedelta
import sqlite3
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from config import Config

autosar_bp = Blueprint('autosar', __name__)

class AutoSARGenerator:
    """Automated Suspicious Activity Report Generator"""
    
    def __init__(self):
        self.templates = {
            'terrorist_financing': {
                'title': 'Suspected Terrorist Financing Activity',
                'summary': 'Multiple small-value transactions from various sources converging to potential terror-linked accounts',
                'priority': 'HIGH',
                'regulatory_codes': ['31.a', '31.b']
            },
            'crypto_sanctions': {
                'title': 'Sanctions Evasion via Cryptocurrency',
                'summary': 'Large-value cryptocurrency transactions through mixing services to evade sanctions',
                'priority': 'CRITICAL',
                'regulatory_codes': ['20.a', '25.c']
            },
            'human_trafficking': {
                'title': 'Human Trafficking Network Activity',
                'summary': 'Cash-intensive transactions between front businesses and known trafficking handlers',
                'priority': 'HIGH',
                'regulatory_codes': ['35.a', '35.b']
            }
        }
    
    def generate_sar_report(self, pattern_data, transactions):
        """Generate SAR report based on detected pattern"""
        pattern_type = pattern_data.get('scenario', 'unknown')
        template = self.templates.get(pattern_type, self.templates['terrorist_financing'])
        
        # Calculate statistics
        total_amount = sum(float(t.get('amount', 0)) for t in transactions)
        avg_amount = total_amount / len(transactions) if transactions else 0
        suspicious_count = len([t for t in transactions if float(t.get('suspicious_score', 0)) > 0.5])
        
        # Generate report
        report = {
            'report_id': f'SAR_{datetime.now().strftime("%Y%m%d_%H%M%S")}',
            'generated_at': datetime.now().isoformat(),
            'title': template['title'],
            'priority': template['priority'],
            'summary': template['summary'],
            'details': {
                'pattern_type': pattern_type,
                'total_transactions': len(transactions),
                'suspicious_transactions': suspicious_count,
                'total_amount': round(total_amount, 2),
                'average_amount': round(avg_amount, 2),
                'time_period': self._calculate_time_period(transactions),
                'accounts_involved': self._get_unique_accounts(transactions)
            },
            'evidence': {
                'transaction_ids': [t.get('transaction_id', t.get('id', '')) for t in transactions[:10]],  # First 10
                'pattern_indicators': self._identify_indicators(pattern_type, transactions),
                'risk_factors': self._assess_risk_factors(transactions)
            },
            'regulatory_compliance': {
                'codes': template['regulatory_codes'],
                'filing_deadline': self._calculate_filing_deadline(),
                'law_enforcement_notification': template['priority'] == 'CRITICAL'
            },
            'recommendations': self._generate_recommendations(pattern_type),
            'attachments': {
                'transaction_timeline': f'chronos_timeline_{pattern_type}.pdf',
                'network_analysis': f'hydra_analysis_{pattern_type}.pdf',
                'statistical_summary': f'stats_{pattern_type}.xlsx'
            }
        }
        
        return report
    
    def _calculate_time_period(self, transactions):
        """Calculate the time period covered by transactions"""
        if not transactions:
            return "Unknown"
        
        timestamps = [t.get('timestamp') for t in transactions if t.get('timestamp')]
        if not timestamps:
            return "Unknown"
        
        try:
            dates = [datetime.fromisoformat(ts.replace('Z', '+00:00')) for ts in timestamps]
            min_date = min(dates)
            max_date = max(dates)
            days = (max_date - min_date).days
            return f"{days} days ({min_date.strftime('%Y-%m-%d')} to {max_date.strftime('%Y-%m-%d')})"
        except:
            return "Unknown"
    
    def _get_unique_accounts(self, transactions):
        """Get unique accounts involved"""
        accounts = set()
        for t in transactions:
            if t.get('from_account'):
                accounts.add(t['from_account'])
            if t.get('to_account'):
                accounts.add(t['to_account'])
        return list(accounts)[:20]  # Limit to first 20
    
    def _identify_indicators(self, pattern_type, transactions):
        """Identify pattern-specific indicators"""
        indicators = {
            'terrorist_financing': [
                'Multiple small-value donations',
                'Geographic clustering of sources',
                'Timing patterns suggesting coordination',
                'Convergence to limited target accounts'
            ],
            'crypto_sanctions': [
                'Use of cryptocurrency mixing services',
                'Rapid conversion between currencies',
                'High-value transactions to known sanctioned entities',
                'Layering through multiple exchanges'
            ],
            'human_trafficking': [
                'Cash-intensive business operations',
                'Geographic movement patterns',
                'Transactions to known handler networks',
                'Front business involvement'
            ]
        }
        
        return indicators.get(pattern_type, ['Suspicious transaction patterns detected'])
    
    def _assess_risk_factors(self, transactions):
        """Assess overall risk factors"""
        risk_factors = []
        
        # High suspicious score average
        avg_suspicion = sum(float(t.get('suspicious_score', 0)) for t in transactions) / len(transactions)
        if avg_suspicion > 0.7:
            risk_factors.append('High average suspicious activity score')
        
        # Large amounts
        amounts = [float(t.get('amount', 0)) for t in transactions]
        if max(amounts) > 10000:
            risk_factors.append('Large individual transaction amounts')
        
        # Frequency
        if len(transactions) > 50:
            risk_factors.append('High transaction frequency')
        
        return risk_factors
    
    def _calculate_filing_deadline(self):
        """Calculate SAR filing deadline (30 days from discovery)"""
        deadline = datetime.now() + timedelta(days=30)
        return deadline.strftime('%Y-%m-%d')
    
    def _generate_recommendations(self, pattern_type):
        """Generate recommendations based on pattern type"""
        recommendations = {
            'terrorist_financing': [
                'Immediately freeze all related accounts',
                'Notify law enforcement and counter-terrorism units',
                'Conduct enhanced due diligence on all involved parties',
                'Monitor for additional related transactions'
            ],
            'crypto_sanctions': [
                'Block all cryptocurrency transactions to flagged addresses',
                'Report to OFAC and relevant sanctions authorities',
                'Conduct enhanced screening of all crypto activities',
                'Implement additional controls for cryptocurrency transactions'
            ],
            'human_trafficking': [
                'Coordinate with human trafficking task forces',
                'Monitor all related business accounts for additional activity',
                'Conduct enhanced due diligence on business relationships',
                'Report to National Human Trafficking Hotline'
            ]
        }
        
        return recommendations.get(pattern_type, [
            'Conduct enhanced monitoring of flagged accounts',
            'Report to appropriate law enforcement agencies',
            'Implement additional transaction controls'
        ])

# Global SAR generator instance
sar_generator = AutoSARGenerator()

@autosar_bp.route('/generate', methods=['POST'])
def generate_sar():
    """Generate SAR report"""
    try:
        request_data = request.get_json()
        
        if not request_data:
            return jsonify({'status': 'error', 'message': 'No data provided'}), 400
        
        pattern_data = request_data.get('pattern', {})
        scenario = pattern_data.get('scenario', 'terrorist_financing')
        
        # Get transactions for the scenario
        conn = sqlite3.connect(Config.DATABASE_PATH)
        query = f"SELECT * FROM transactions WHERE scenario = '{scenario}' AND suspicious_score > 0.5 LIMIT 50"
        
        import pandas as pd
        df = pd.read_sql_query(query, conn)
        conn.close()
        
        transactions = df.to_dict('records')
        
        # Generate SAR report
        sar_report = sar_generator.generate_sar_report(pattern_data, transactions)
        
        return jsonify({
            'status': 'success',
            'sar_report': sar_report
        })
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@autosar_bp.route('/templates', methods=['GET'])
def get_sar_templates():
    """Get available SAR templates"""
    try:
        return jsonify({
            'status': 'success',
            'templates': sar_generator.templates
        })
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500