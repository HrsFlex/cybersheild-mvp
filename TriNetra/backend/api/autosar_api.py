from flask import Blueprint, jsonify, request
from datetime import datetime, timedelta
import sqlite3
import sys
import os
import random
import json
import re
import numpy as np


sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from config import Config

autosar_bp = Blueprint('autosar', __name__)

base_dir = os.path.dirname(__file__)
with open(os.path.join(base_dir, "../data/simplemap.json"), "r", encoding="utf-8") as f:
    india_cities = json.load(f)

def random_india_location():
    """Pick a random city from the simplemap JSON"""
    city = random.choice(india_cities)
    return {
        "lat": float(city["lat"]),
        "lon": float(city["lng"]),
        "city": city["city"]
    }
class AutoSARGenerator:
    """Enhanced Automated Suspicious Activity Report Generator with ML-powered analysis"""
    
    def __init__(self):
        self.templates = {
            'terrorist_financing': {
                'title': 'Suspected Terrorist Financing Activity',
                'summary': 'Multiple small-value transactions from various sources converging to potential terror-linked accounts',
                'priority': 'HIGH',
                'regulatory_codes': ['31.a', '31.b'],
                'ml_type': 'terrorist_financing',
                'confidence_threshold': 0.75
            },
            'crypto_sanctions': {
                'title': 'Sanctions Evasion via Cryptocurrency',
                'summary': 'Large-value cryptocurrency transactions through mixing services to evade sanctions',
                'priority': 'CRITICAL',
                'regulatory_codes': ['20.a', '25.c'],
                'ml_type': 'crypto_laundering',
                'confidence_threshold': 0.80
            },
            'human_trafficking': {
                'title': 'Human Trafficking Network Activity',
                'summary': 'Cash-intensive transactions between front businesses and known trafficking handlers',
                'priority': 'HIGH',
                'regulatory_codes': ['35.a', '35.b'],
                'ml_type': 'trafficking_laundering',
                'confidence_threshold': 0.70
            }
        }
        
        # Enhanced money laundering detection types
        self.ml_detection_types = {
            'crypto_laundering': {
                'name': 'Cryptocurrency Money Laundering',
                'description': 'Digital asset-based laundering through exchanges and mixing services',
                'indicators': ['multiple_exchanges', 'mixing_services', 'privacy_coins', 'rapid_conversion'],
                'risk_multiplier': 1.5
            },
            'terrorist_financing': {
                'name': 'Terrorist Financing',
                'description': 'Financial support for terrorist organizations and activities',
                'indicators': ['small_donations', 'geographic_clustering', 'hawala_networks', 'cash_intensive'],
                'risk_multiplier': 2.0
            },
            'trafficking_laundering': {
                'name': 'Human Trafficking Money Laundering',
                'description': 'Laundering proceeds from human trafficking operations',
                'indicators': ['cash_businesses', 'cross_border', 'frequent_locations', 'service_industries'],
                'risk_multiplier': 1.8
            },
            'trade_based_laundering': {
                'name': 'Trade-Based Money Laundering',
                'description': 'Laundering through manipulation of trade transactions',
                'indicators': ['invoice_manipulation', 'over_under_invoicing', 'phantom_shipments', 'free_trade_zones'],
                'risk_multiplier': 1.3
            },
            'shell_company_laundering': {
                'name': 'Shell Company Money Laundering',
                'description': 'Use of shell companies to obscure beneficial ownership',
                'indicators': ['shell_companies', 'complex_structures', 'nominee_directors', 'offshore_jurisdictions'],
                'risk_multiplier': 1.6
            },
            'smurfing_structuring': {
                'name': 'Smurfing and Structuring',
                'description': 'Breaking large transactions into smaller amounts to avoid reporting',
                'indicators': ['below_threshold', 'multiple_accounts', 'timing_patterns', 'coordinated_deposits'],
                'risk_multiplier': 1.4
            }
        }

    
    def generate_sar_report(self, pattern_data, transactions):
        """Generate enhanced SAR report with ML-powered analysis"""
        pattern_type = pattern_data.get('scenario', 'unknown')
        template = self.templates.get(pattern_type, self.templates['terrorist_financing'])
        
        # Enhanced ML-powered analysis
        ml_analysis = self.perform_ml_analysis(transactions, pattern_type)
        location_analysis = self.analyze_transaction_locations(transactions)
        risk_assessment = self.enhanced_risk_assessment(transactions, pattern_type)
        
        # Calculate enhanced statistics
        total_amount = sum(float(t.get('amount', 0)) for t in transactions)
        avg_amount = total_amount / len(transactions) if transactions else 0
        suspicious_count = len([t for t in transactions if float(t.get('suspicious_score', 0)) > 0.5])
        critical_count = len([t for t in transactions if float(t.get('suspicious_score', 0)) > 0.8])
        
        # Generate comprehensive report
        report = {
            'report_id': f'SAR_{datetime.now().strftime("%Y%m%d_%H%M%S")}',
            'generated_at': datetime.now().isoformat(),
            'title': template['title'],
            'priority': self._determine_priority(ml_analysis, risk_assessment),
            'summary': template['summary'],
            'confidence_score': ml_analysis['overall_confidence'],
            
            # Enhanced details section
            'details': {
                'pattern_type': pattern_type,
                'total_transactions': len(transactions),
                'suspicious_transactions': suspicious_count,
                'critical_transactions': critical_count,
                'total_amount': round(total_amount, 2),
                'average_amount': round(avg_amount, 2),
                'median_amount': self._calculate_median_amount(transactions),
                'time_period': self._calculate_time_period(transactions),
                'accounts_involved': self._get_unique_accounts(transactions),
                'geographic_spread': location_analysis['geographic_summary'],
                'transaction_velocity': self._calculate_velocity(transactions),
                'amount_distribution': self._analyze_amount_distribution(transactions)
            },
            
            # ML-powered money laundering detection
            'ml_detection': {
                'detected_types': ml_analysis['detected_types'],
                'confidence_scores': ml_analysis['confidence_scores'],
                'primary_type': ml_analysis['primary_type'],
                'secondary_types': ml_analysis['secondary_types'],
                'pattern_complexity': ml_analysis['pattern_complexity'],
                'evasion_indicators': ml_analysis['evasion_indicators']
            },
            
            # Enhanced evidence section
            'evidence': {
                'transaction_ids': [t.get('transaction_id', t.get('id', '')) for t in transactions[:15]],
                'pattern_indicators': self._identify_indicators(pattern_type, transactions),
                'risk_factors': risk_assessment['risk_factors'],
                'suspicious_patterns': ml_analysis['suspicious_patterns'],
                'location_red_flags': location_analysis['red_flags'],
                'timing_anomalies': self._detect_timing_anomalies(transactions),
                'amount_anomalies': self._detect_amount_anomalies(transactions)
            },
            
            # Location and Aadhar analysis
            'location_analysis': {
                'high_risk_locations': location_analysis['high_risk_locations'],
                'cross_border_activity': location_analysis['cross_border_activity'],
                'location_clustering': location_analysis['clustering_analysis'],
                'aadhar_region_analysis': location_analysis['aadhar_analysis'],
                'geographic_risk_score': location_analysis['geographic_risk_score']
            },
            
            # Enhanced regulatory compliance
            'regulatory_compliance': {
                'codes': template['regulatory_codes'],
                'filing_deadline': self._calculate_filing_deadline(),
                'law_enforcement_notification': template['priority'] == 'CRITICAL' or ml_analysis['overall_confidence'] > 0.85,
                'additional_reporting': self._determine_additional_reporting(ml_analysis, location_analysis),
                'compliance_score': risk_assessment['compliance_score']
            },
            
            # Enhanced recommendations
            'recommendations': self._generate_enhanced_recommendations(pattern_type, ml_analysis, location_analysis),
            'immediate_actions': self._generate_immediate_actions(ml_analysis, risk_assessment),
            
            # Enhanced attachments
            'attachments': {
                'transaction_timeline': f'chronos_timeline_{pattern_type}.pdf',
                'network_analysis': f'hydra_analysis_{pattern_type}.pdf',
                'statistical_summary': f'stats_{pattern_type}.xlsx',
                'location_mapping': f'location_analysis_{pattern_type}.pdf',
                'ml_analysis_report': f'ml_detection_{pattern_type}.pdf',
                'risk_assessment': f'risk_assessment_{pattern_type}.pdf'
            },
            
            # Quality metrics
            'quality_metrics': {
                'data_completeness': self._assess_data_completeness(transactions),
                'analysis_confidence': ml_analysis['analysis_confidence'],
                'false_positive_probability': ml_analysis['false_positive_probability'],
                'investigation_priority': risk_assessment['investigation_priority']
            }
        }
        
        return report
    
    def perform_ml_analysis(self, transactions, pattern_type):
        """Perform ML-powered money laundering type detection"""
        if not transactions:
            return self._default_ml_analysis()
        
        # Calculate base features for ML analysis
        amounts = [float(t.get('amount', 0)) for t in transactions]
        suspicion_scores = [float(t.get('suspicious_score', 0)) for t in transactions]
        
        # Detect multiple money laundering types
        detected_types = []
        confidence_scores = {}
        
        for ml_type, config in self.ml_detection_types.items():
            confidence = self._calculate_ml_confidence(transactions, ml_type, config)
            if confidence > 0.5:  # Threshold for detection
                detected_types.append(ml_type)
                confidence_scores[ml_type] = round(confidence, 3)
        
        # Determine primary type (highest confidence)
        primary_type = max(confidence_scores.keys(), key=lambda k: confidence_scores[k]) if confidence_scores else pattern_type
        
        # Secondary types (other significant detections)
        secondary_types = [t for t in detected_types if t != primary_type and confidence_scores[t] > 0.6]
        
        # Overall analysis confidence
        overall_confidence = max(confidence_scores.values()) if confidence_scores else 0.5
        
        # Pattern complexity analysis
        pattern_complexity = self._analyze_pattern_complexity(transactions)
        
        # Evasion indicators
        evasion_indicators = self._detect_evasion_indicators(transactions)
        
        # Suspicious patterns
        suspicious_patterns = self._identify_suspicious_patterns(transactions)
        
        return {
            'detected_types': detected_types,
            'confidence_scores': confidence_scores,
            'primary_type': primary_type,
            'secondary_types': secondary_types,
            'overall_confidence': round(overall_confidence, 3),
            'pattern_complexity': pattern_complexity,
            'evasion_indicators': evasion_indicators,
            'suspicious_patterns': suspicious_patterns,
            'analysis_confidence': min(overall_confidence + 0.1, 1.0),
            'false_positive_probability': max(0.05, 1.0 - overall_confidence)
        }
    
    def analyze_transaction_locations(self, transactions):
        """Analyze transaction locations and Aadhar-based geographic data"""
        if not transactions:
            return self._default_location_analysis()
        
        # Extract location data
        locations = []
        countries = []
        states = []
        cities = []
        
        for tx in transactions:
            if 'aadhar_location' in tx:
                loc = tx['aadhar_location']
                locations.append(loc)
                countries.append(loc.get('country', 'Unknown'))
                states.append(loc.get('state', 'Unknown'))
                cities.append(loc.get('city', 'Unknown'))
            elif 'from_location' in tx:
                locations.append(tx['from_location'])
                cities.append(tx['from_location'].get('city', 'Unknown'))
        
        # Analyze high-risk locations
        high_risk_countries = ['Pakistan', 'Afghanistan', 'Iran', 'North Korea']
        high_risk_locations = [loc for loc in locations if loc.get('country') in high_risk_countries]
        
        # Cross-border activity analysis
        unique_countries = list(set(countries))
        cross_border_activity = {
            'total_countries': len(unique_countries),
            'countries': unique_countries,
            'high_risk_countries': [c for c in unique_countries if c in high_risk_countries],
            'cross_border_ratio': len(unique_countries) / len(transactions) if transactions else 0
        }
        
        # Geographic clustering analysis
        clustering_analysis = self._analyze_geographic_clustering(locations)
        
        # Aadhar region analysis
        aadhar_analysis = self._analyze_aadhar_regions(states, cities)
        
        # Calculate geographic risk score
        geographic_risk_score = self._calculate_geographic_risk_score(locations, high_risk_locations, cross_border_activity)
        
        # Geographic summary
        geographic_summary = {
            'total_locations': len(locations),
            'unique_countries': len(unique_countries),
            'unique_states': len(set(states)),
            'unique_cities': len(set(cities)),
            'high_risk_percentage': (len(high_risk_locations) / len(locations) * 100) if locations else 0
        }
        
        # Red flags
        red_flags = []
        if len(high_risk_locations) > len(locations) * 0.3:
            red_flags.append('High concentration of transactions in high-risk countries')
        if len(unique_countries) > 5:
            red_flags.append('Transactions spanning multiple countries')
        if cross_border_activity['cross_border_ratio'] > 0.5:
            red_flags.append('High cross-border transaction activity')
        
        return {
            'high_risk_locations': high_risk_locations,
            'cross_border_activity': cross_border_activity,
            'clustering_analysis': clustering_analysis,
            'aadhar_analysis': aadhar_analysis,
            'geographic_risk_score': round(geographic_risk_score, 3),
            'geographic_summary': geographic_summary,
            'red_flags': red_flags
        }
    
    def enhanced_risk_assessment(self, transactions, pattern_type):
        """Perform enhanced risk assessment"""
        if not transactions:
            return self._default_risk_assessment()
        
        risk_factors = []
        risk_score = 0.0
        
        # Amount-based risk factors
        amounts = [float(t.get('amount', 0)) for t in transactions]
        if amounts:
            max_amount = max(amounts)
            avg_amount = sum(amounts) / len(amounts)
            
            if max_amount > 100000:  # Large amounts
                risk_factors.append('Large individual transaction amounts detected')
                risk_score += 0.15
            
            if avg_amount > 50000:  # High average
                risk_factors.append('High average transaction amounts')
                risk_score += 0.10
        
        # Frequency-based risk factors
        if len(transactions) > 100:
            risk_factors.append('High transaction frequency')
            risk_score += 0.10
        elif len(transactions) > 50:
            risk_factors.append('Moderate transaction frequency')
            risk_score += 0.05
        
        # Suspicion score analysis
        suspicion_scores = [float(t.get('suspicious_score', 0)) for t in transactions]
        if suspicion_scores:
            avg_suspicion = sum(suspicion_scores) / len(suspicion_scores)
            high_suspicion_count = len([s for s in suspicion_scores if s > 0.8])
            
            if avg_suspicion > 0.7:
                risk_factors.append('High average suspicion score')
                risk_score += 0.20
            
            if high_suspicion_count > len(transactions) * 0.3:
                risk_factors.append('High concentration of critical risk transactions')
                risk_score += 0.25
        
        # Pattern-specific risk factors
        template = self.templates.get(pattern_type, {})
        if template.get('priority') == 'CRITICAL':
            risk_score += 0.15
        elif template.get('priority') == 'HIGH':
            risk_score += 0.10
        
        # Normalize risk score
        risk_score = min(risk_score, 1.0)
        
        # Determine investigation priority
        if risk_score > 0.8:
            investigation_priority = 'URGENT'
        elif risk_score > 0.6:
            investigation_priority = 'HIGH'
        elif risk_score > 0.4:
            investigation_priority = 'MEDIUM'
        else:
            investigation_priority = 'LOW'
        
        # Calculate compliance score
        compliance_score = min(0.95, 0.5 + (risk_score * 0.5))
        
        return {
            'risk_factors': risk_factors,
            'risk_score': round(risk_score, 3),
            'investigation_priority': investigation_priority,
            'compliance_score': round(compliance_score, 3)
        }
    
    def _calculate_ml_confidence(self, transactions, ml_type, config):
        """Calculate confidence score for specific ML type detection"""
        if not transactions:
            return 0.0
        
        confidence = 0.0
        indicators = config['indicators']
        
        # Analyze transaction patterns for specific ML type indicators
        if ml_type == 'crypto_laundering':
            # Look for crypto-related patterns
            crypto_methods = ['Cryptocurrency', 'Bitcoin', 'Ethereum', 'USDT']
            crypto_count = sum(1 for t in transactions if any(method in str(t.get('transaction_method', '')) for method in crypto_methods))
            confidence += (crypto_count / len(transactions)) * 0.4
            
            # Multiple exchanges indicator
            if len(set(t.get('from_account', '') for t in transactions)) > 10:
                confidence += 0.2
            
        elif ml_type == 'terrorist_financing':
            # Small amounts clustering
            amounts = [float(t.get('amount', 0)) for t in transactions]
            small_amounts = [a for a in amounts if a < 10000]
            confidence += (len(small_amounts) / len(amounts)) * 0.3
            
            # Geographic clustering from high-risk regions
            high_risk_countries = ['Pakistan', 'Afghanistan', 'Iran']
            high_risk_count = 0
            for t in transactions:
                if 'aadhar_location' in t and t['aadhar_location'].get('country') in high_risk_countries:
                    high_risk_count += 1
            confidence += (high_risk_count / len(transactions)) * 0.4
            
        elif ml_type == 'trafficking_laundering':
            # Cash-intensive patterns
            cash_methods = ['Cash Deposit', 'Hawala', 'Money Order']
            cash_count = sum(1 for t in transactions if any(method in str(t.get('transaction_method', '')) for method in cash_methods))
            confidence += (cash_count / len(transactions)) * 0.3
            
        elif ml_type == 'smurfing_structuring':
            # Below-threshold patterns
            amounts = [float(t.get('amount', 0)) for t in transactions]
            below_threshold = [a for a in amounts if 9000 <= a <= 10000]  # Just below $10k reporting threshold
            confidence += (len(below_threshold) / len(amounts)) * 0.5
        
        # Apply risk multiplier
        confidence *= config.get('risk_multiplier', 1.0)
        
        # Add baseline suspicion score component
        avg_suspicion = sum(float(t.get('suspicious_score', 0)) for t in transactions) / len(transactions)
        confidence += avg_suspicion * 0.3
        
        return min(confidence, 1.0)
    
    def _analyze_pattern_complexity(self, transactions):
        """Analyze the complexity of transaction patterns"""
        if not transactions:
            return {'score': 0.0, 'level': 'LOW'}
        
        complexity_score = 0.0
        
        # Number of unique accounts
        accounts = set()
        for t in transactions:
            accounts.add(t.get('from_account', ''))
            accounts.add(t.get('to_account', ''))
        
        account_complexity = min(len(accounts) / 20, 1.0)  # Normalize to max 20 accounts
        complexity_score += account_complexity * 0.3
        
        # Transaction method diversity
        methods = set(t.get('transaction_method', '') for t in transactions)
        method_complexity = min(len(methods) / 5, 1.0)  # Normalize to max 5 methods
        complexity_score += method_complexity * 0.2
        
        # Geographic spread
        countries = set()
        for t in transactions:
            if 'aadhar_location' in t:
                countries.add(t['aadhar_location'].get('country', ''))
        
        geographic_complexity = min(len(countries) / 5, 1.0)  # Normalize to max 5 countries
        complexity_score += geographic_complexity * 0.3
        
        # Amount variation
        amounts = [float(t.get('amount', 0)) for t in transactions]
        if amounts:
            amount_std = np.std(amounts) if len(amounts) > 1 else 0
            amount_mean = np.mean(amounts)
            amount_complexity = min(amount_std / amount_mean, 1.0) if amount_mean > 0 else 0
            complexity_score += amount_complexity * 0.2
        
        # Determine complexity level
        if complexity_score > 0.7:
            level = 'HIGH'
        elif complexity_score > 0.4:
            level = 'MEDIUM'
        else:
            level = 'LOW'
        
        return {
            'score': round(complexity_score, 3),
            'level': level,
            'account_diversity': len(accounts),
            'method_diversity': len(methods),
            'geographic_diversity': len(countries)
        }
    
    def _detect_evasion_indicators(self, transactions):
        """Detect evasion indicators in transactions"""
        indicators = []
        
        if not transactions:
            return indicators
        
        amounts = [float(t.get('amount', 0)) for t in transactions]
        
        # Just-below-threshold amounts (structuring)
        threshold_amounts = [a for a in amounts if 9000 <= a <= 10000]
        if len(threshold_amounts) > len(amounts) * 0.2:
            indicators.append('Potential structuring detected - amounts just below reporting threshold')
        
        # Rapid sequence transactions
        timestamps = []
        for t in transactions:
            try:
                ts = datetime.fromisoformat(t.get('timestamp', '').replace('Z', '+00:00'))
                timestamps.append(ts)
            except:
                continue
        
        if len(timestamps) > 1:
            timestamps.sort()
            rapid_count = 0
            for i in range(1, len(timestamps)):
                if (timestamps[i] - timestamps[i-1]).total_seconds() < 3600:  # Within 1 hour
                    rapid_count += 1
            
            if rapid_count > len(timestamps) * 0.3:
                indicators.append('Rapid sequence transactions detected')
        
        # Round number amounts (potential artificial amounts)
        round_amounts = [a for a in amounts if a % 1000 == 0 and a > 1000]
        if len(round_amounts) > len(amounts) * 0.5:
            indicators.append('High frequency of round number amounts')
        
        # Multiple transaction methods (potential layering)
        methods = set(t.get('transaction_method', '') for t in transactions)
        if len(methods) > 4:
            indicators.append('Multiple transaction methods used - potential layering')
        
        return indicators
    
    def _identify_suspicious_patterns(self, transactions):
        """Identify specific suspicious patterns"""
        patterns = []
        
        if not transactions:
            return patterns
        
        # Circular transactions
        account_pairs = []
        for t in transactions:
            from_acc = t.get('from_account', '')
            to_acc = t.get('to_account', '')
            account_pairs.append((from_acc, to_acc))
        
        # Check for reverse transactions (A->B and B->A)
        for pair in account_pairs:
            reverse_pair = (pair[1], pair[0])
            if reverse_pair in account_pairs:
                patterns.append('Circular transaction pattern detected')
                break
        
        # Concentration patterns
        to_accounts = [t.get('to_account', '') for t in transactions]
        account_counts = {}
        for acc in to_accounts:
            account_counts[acc] = account_counts.get(acc, 0) + 1
        
        max_concentration = max(account_counts.values()) if account_counts else 0
        if max_concentration > len(transactions) * 0.4:
            patterns.append('High concentration to single destination account')
        
        # Timing patterns
        if self._detect_suspicious_timing(transactions):
            patterns.append('Suspicious timing patterns detected')
        
        return patterns
    
    def _detect_suspicious_timing(self, transactions):
        """Detect suspicious timing patterns"""
        if len(transactions) < 5:
            return False
        
        timestamps = []
        for t in transactions:
            try:
                ts = datetime.fromisoformat(t.get('timestamp', '').replace('Z', '+00:00'))
                timestamps.append(ts)
            except:
                continue
        
        if len(timestamps) < 5:
            return False
        
        timestamps.sort()
        
        # Check for regular intervals (potential automation)
        intervals = []
        for i in range(1, len(timestamps)):
            interval = (timestamps[i] - timestamps[i-1]).total_seconds()
            intervals.append(interval)
        
        # Check if most intervals are similar (within 10% variance)
        if len(intervals) > 3:
            avg_interval = sum(intervals) / len(intervals)
            similar_intervals = [i for i in intervals if abs(i - avg_interval) < avg_interval * 0.1]
            if len(similar_intervals) > len(intervals) * 0.7:
                return True
        
        return False
    
    # Additional helper methods for the enhanced features
    def _determine_priority(self, ml_analysis, risk_assessment):
        """Determine report priority based on ML analysis and risk assessment"""
        confidence = ml_analysis['overall_confidence']
        risk_score = risk_assessment['risk_score']
        
        if confidence > 0.85 or risk_score > 0.8:
            return 'CRITICAL'
        elif confidence > 0.7 or risk_score > 0.6:
            return 'HIGH'
        elif confidence > 0.5 or risk_score > 0.4:
            return 'MEDIUM'
        else:
            return 'LOW'
    
    def _calculate_median_amount(self, transactions):
        """Calculate median transaction amount"""
        amounts = [float(t.get('amount', 0)) for t in transactions]
        if not amounts:
            return 0.0
        amounts.sort()
        n = len(amounts)
        if n % 2 == 0:
            return (amounts[n//2 - 1] + amounts[n//2]) / 2
        else:
            return amounts[n//2]
    
    def _calculate_velocity(self, transactions):
        """Calculate transaction velocity (transactions per day)"""
        if not transactions:
            return 0.0
        
        timestamps = []
        for t in transactions:
            try:
                ts = datetime.fromisoformat(t.get('timestamp', '').replace('Z', '+00:00'))
                timestamps.append(ts)
            except:
                continue
        
        if len(timestamps) < 2:
            return 0.0
        
        timestamps.sort()
        time_span = (timestamps[-1] - timestamps[0]).total_seconds() / (24 * 3600)  # Convert to days
        
        if time_span <= 0:
            return len(transactions)  # All transactions in same day
        
        return round(len(transactions) / time_span, 2)
    
    def _analyze_amount_distribution(self, transactions):
        """Analyze distribution of transaction amounts"""
        amounts = [float(t.get('amount', 0)) for t in transactions]
        if not amounts:
            return {}
        
        amounts.sort()
        n = len(amounts)
        
        return {
            'min': min(amounts),
            'max': max(amounts),
            'range': max(amounts) - min(amounts),
            'q1': amounts[n//4] if n > 3 else amounts[0],
            'q3': amounts[3*n//4] if n > 3 else amounts[-1],
            'std_dev': round(np.std(amounts), 2),
            'coefficient_variation': round(np.std(amounts) / np.mean(amounts), 3) if np.mean(amounts) > 0 else 0
        }
    
    def _analyze_geographic_clustering(self, locations):
        """Analyze geographic clustering of transactions"""
        if not locations:
            return {'clusters': 0, 'analysis': 'No location data'}
        
        # Simple clustering analysis based on cities and countries
        cities = [loc.get('city', 'Unknown') for loc in locations]
        countries = [loc.get('country', 'Unknown') for loc in locations]
        
        city_counts = {}
        country_counts = {}
        
        for city in cities:
            city_counts[city] = city_counts.get(city, 0) + 1
        for country in countries:
            country_counts[country] = country_counts.get(country, 0) + 1
        
        # Find dominant clusters
        dominant_city = max(city_counts.keys(), key=lambda k: city_counts[k]) if city_counts else 'Unknown'
        dominant_country = max(country_counts.keys(), key=lambda k: country_counts[k]) if country_counts else 'Unknown'
        
        return {
            'total_locations': len(locations),
            'unique_cities': len(set(cities)),
            'unique_countries': len(set(countries)),
            'dominant_city': dominant_city,
            'dominant_country': dominant_country,
            'city_concentration': max(city_counts.values()) / len(locations) if locations else 0,
            'country_concentration': max(country_counts.values()) / len(locations) if locations else 0
        }
    
    def _analyze_aadhar_regions(self, states, cities):
        """Analyze Aadhar-based regional patterns"""
        if not states:
            return {'analysis': 'No Aadhar region data available'}
        
        state_counts = {}
        for state in states:
            state_counts[state] = state_counts.get(state, 0) + 1
        
        # Identify regional risk patterns
        high_risk_states = ['Jammu and Kashmir', 'Punjab', 'West Bengal']  # Border states
        high_risk_count = sum(state_counts.get(state, 0) for state in high_risk_states)
        
        return {
            'total_states': len(set(states)),
            'state_distribution': state_counts,
            'high_risk_state_transactions': high_risk_count,
            'high_risk_percentage': (high_risk_count / len(states) * 100) if states else 0,
            'dominant_state': max(state_counts.keys(), key=lambda k: state_counts[k]) if state_counts else 'Unknown'
        }
    
    def _calculate_geographic_risk_score(self, locations, high_risk_locations, cross_border_activity):
        """Calculate overall geographic risk score"""
        if not locations:
            return 0.0
        
        risk_score = 0.0
        
        # High-risk location percentage
        high_risk_ratio = len(high_risk_locations) / len(locations)
        risk_score += high_risk_ratio * 0.4
        
        # Cross-border activity risk
        cross_border_ratio = cross_border_activity['cross_border_ratio']
        risk_score += min(cross_border_ratio * 0.3, 0.3)
        
        # Number of high-risk countries
        high_risk_country_count = len(cross_border_activity['high_risk_countries'])
        risk_score += min(high_risk_country_count * 0.1, 0.3)
        
        return min(risk_score, 1.0)
    
    def _detect_timing_anomalies(self, transactions):
        """Detect timing anomalies in transactions"""
        anomalies = []
        
        if len(transactions) < 3:
            return anomalies
        
        timestamps = []
        for t in transactions:
            try:
                ts = datetime.fromisoformat(t.get('timestamp', '').replace('Z', '+00:00'))
                timestamps.append(ts)
            except:
                continue
        
        if len(timestamps) < 3:
            return anomalies
        
        timestamps.sort()
        
        # Check for off-hours transactions (11 PM to 5 AM)
        off_hours_count = 0
        for ts in timestamps:
            if ts.hour < 5 or ts.hour >= 23:
                off_hours_count += 1
        
        if off_hours_count > len(timestamps) * 0.3:
            anomalies.append('High frequency of off-hours transactions')
        
        # Check for weekend transactions
        weekend_count = sum(1 for ts in timestamps if ts.weekday() >= 5)
        if weekend_count > len(timestamps) * 0.4:
            anomalies.append('High frequency of weekend transactions')
        
        # Check for burst patterns
        time_gaps = []
        for i in range(1, len(timestamps)):
            gap = (timestamps[i] - timestamps[i-1]).total_seconds()
            time_gaps.append(gap)
        
        if time_gaps:
            avg_gap = sum(time_gaps) / len(time_gaps)
            burst_count = sum(1 for gap in time_gaps if gap < avg_gap * 0.1)
            if burst_count > len(time_gaps) * 0.3:
                anomalies.append('Transaction burst patterns detected')
        
        return anomalies
    
    def _detect_amount_anomalies(self, transactions):
        """Detect amount anomalies in transactions"""
        anomalies = []
        
        amounts = [float(t.get('amount', 0)) for t in transactions]
        if not amounts:
            return anomalies
        
        # Outlier detection using IQR method
        amounts.sort()
        n = len(amounts)
        q1 = amounts[n//4] if n > 3 else amounts[0]
        q3 = amounts[3*n//4] if n > 3 else amounts[-1]
        iqr = q3 - q1
        
        if iqr > 0:
            lower_bound = q1 - 1.5 * iqr
            upper_bound = q3 + 1.5 * iqr
            
            outliers = [a for a in amounts if a < lower_bound or a > upper_bound]
            if len(outliers) > len(amounts) * 0.1:
                anomalies.append('Statistical outliers in transaction amounts detected')
        
        # Check for suspicious round numbers
        round_amounts = [a for a in amounts if a % 1000 == 0 and a >= 10000]
        if len(round_amounts) > len(amounts) * 0.3:
            anomalies.append('High frequency of large round number amounts')
        
        # Check for just-below-threshold amounts
        threshold_amounts = [a for a in amounts if 9000 <= a <= 10000]
        if len(threshold_amounts) > len(amounts) * 0.15:
            anomalies.append('Potential structuring - amounts just below $10,000 threshold')
        
        return anomalies
    
    def _determine_additional_reporting(self, ml_analysis, location_analysis):
        """Determine additional reporting requirements"""
        additional_reports = []
        
        # Check for terrorist financing indicators
        if 'terrorist_financing' in ml_analysis['detected_types']:
            additional_reports.append('Counter-Terrorism Financing Unit')
            additional_reports.append('Financial Intelligence Unit')
        
        # Check for cross-border activity
        if location_analysis['cross_border_activity']['total_countries'] > 3:
            additional_reports.append('Cross-Border Transaction Monitoring Unit')
        
        # Check for high-risk countries
        if location_analysis['cross_border_activity']['high_risk_countries']:
            additional_reports.append('Sanctions Compliance Unit')
            additional_reports.append('OFAC Reporting')
        
        # Check for crypto activity
        if 'crypto_laundering' in ml_analysis['detected_types']:
            additional_reports.append('Cryptocurrency Monitoring Unit')
        
        return additional_reports
    
    def _generate_enhanced_recommendations(self, pattern_type, ml_analysis, location_analysis):
        """Generate enhanced recommendations based on comprehensive analysis"""
        recommendations = []
        
        # Base recommendations from pattern type
        base_recommendations = self._generate_recommendations(pattern_type)
        recommendations.extend(base_recommendations)
        
        # ML analysis specific recommendations
        if ml_analysis['overall_confidence'] > 0.8:
            recommendations.append('Implement immediate enhanced monitoring for all detected patterns')
        
        for ml_type in ml_analysis['detected_types']:
            if ml_type == 'crypto_laundering':
                recommendations.append('Implement blockchain analysis tools for cryptocurrency tracking')
                recommendations.append('Review all cryptocurrency exchange relationships')
            elif ml_type == 'smurfing_structuring':
                recommendations.append('Lower transaction monitoring thresholds for involved accounts')
                recommendations.append('Implement real-time structuring detection alerts')
        
        # Location-based recommendations
        if location_analysis['geographic_risk_score'] > 0.6:
            recommendations.append('Implement enhanced geographic risk monitoring')
            
        if location_analysis['cross_border_activity']['high_risk_countries']:
            recommendations.append('Apply enhanced due diligence for high-risk country transactions')
            recommendations.append('Review sanctions compliance procedures')
        
        # Evasion indicator recommendations
        if ml_analysis['evasion_indicators']:
            recommendations.append('Implement anti-evasion detection mechanisms')
            recommendations.append('Review transaction monitoring rules for evasion patterns')
        
        return list(set(recommendations))  # Remove duplicates
    
    def _generate_immediate_actions(self, ml_analysis, risk_assessment):
        """Generate immediate actions based on analysis"""
        actions = []
        
        if risk_assessment['investigation_priority'] == 'URGENT':
            actions.append('IMMEDIATE: Freeze all identified accounts')
            actions.append('IMMEDIATE: Notify law enforcement within 24 hours')
            actions.append('IMMEDIATE: Escalate to senior compliance management')
        
        if ml_analysis['overall_confidence'] > 0.85:
            actions.append('File SAR report within 48 hours')
            actions.append('Implement real-time monitoring for related accounts')
        
        if 'terrorist_financing' in ml_analysis['detected_types']:
            actions.append('URGENT: Notify counter-terrorism authorities immediately')
            actions.append('Block all outgoing transactions from flagged accounts')
        
        if risk_assessment['risk_score'] > 0.7:
            actions.append('Conduct immediate account review')
            actions.append('Implement temporary transaction limits')
        
        return actions
    
    def _assess_data_completeness(self, transactions):
        """Assess completeness of transaction data"""
        if not transactions:
            return 0.0
        
        required_fields = ['transaction_id', 'amount', 'from_account', 'to_account', 'timestamp']
        optional_fields = ['aadhar_location', 'transaction_method', 'suspicious_score']
        
        completeness_score = 0.0
        field_scores = {}
        
        for field in required_fields:
            present_count = sum(1 for t in transactions if t.get(field) is not None and t.get(field) != '')
            field_score = present_count / len(transactions)
            field_scores[field] = field_score
            completeness_score += field_score * 0.15  # Required fields are weighted more
        
        for field in optional_fields:
            present_count = sum(1 for t in transactions if t.get(field) is not None and t.get(field) != '')
            field_score = present_count / len(transactions)
            field_scores[field] = field_score
            completeness_score += field_score * 0.05  # Optional fields are weighted less
        
        return round(min(completeness_score, 1.0), 3)
    
    # Default analysis methods for empty data
    def _default_ml_analysis(self):
        """Default ML analysis for empty data"""
        return {
            'detected_types': [],
            'confidence_scores': {},
            'primary_type': 'unknown',
            'secondary_types': [],
            'overall_confidence': 0.0,
            'pattern_complexity': {'score': 0.0, 'level': 'LOW'},
            'evasion_indicators': [],
            'suspicious_patterns': [],
            'analysis_confidence': 0.0,
            'false_positive_probability': 1.0
        }
    
    def _default_location_analysis(self):
        """Default location analysis for empty data"""
        return {
            'high_risk_locations': [],
            'cross_border_activity': {'total_countries': 0, 'countries': [], 'high_risk_countries': [], 'cross_border_ratio': 0},
            'clustering_analysis': {'clusters': 0, 'analysis': 'No data'},
            'aadhar_analysis': {'analysis': 'No data'},
            'geographic_risk_score': 0.0,
            'geographic_summary': {'total_locations': 0, 'unique_countries': 0, 'unique_states': 0, 'unique_cities': 0, 'high_risk_percentage': 0},
            'red_flags': []
        }
    
    def _default_risk_assessment(self):
        """Default risk assessment for empty data"""
        return {
            'risk_factors': ['No transaction data available for analysis'],
            'risk_score': 0.0,
            'investigation_priority': 'LOW',
            'compliance_score': 0.5
        }
    
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
        
        if not transactions:
            return ['No transaction data available']
        
        # High suspicious score average
        avg_suspicion = sum(float(t.get('suspicious_score', 0)) for t in transactions) / len(transactions)
        if avg_suspicion > 0.7:
            risk_factors.append('High average suspicious activity score')
        
        # Large amounts
        amounts = [float(t.get('amount', 0)) for t in transactions]
        if amounts and max(amounts) > 10000:
            risk_factors.append('Large individual transaction amounts')
        
        # Frequency
        if len(transactions) > 50:
            risk_factors.append('High transaction frequency')
        
        if not risk_factors:
            risk_factors.append('Standard risk profile detected')
        
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
        
        # Get transactions for the scenario (using parameterized query to prevent SQL injection)
        conn = sqlite3.connect(Config.DATABASE_PATH)
        query = "SELECT * FROM transactions WHERE scenario = ? AND suspicious_score > 0.5 LIMIT 50"
        
        import pandas as pd
        df = pd.read_sql_query(query, conn, params=[scenario])
        conn.close()
        
        transactions = df.to_dict('records')
        
        # Enhance transactions with Aadhar location data (similar to Chronos enhancement)
        for t in transactions:
            # Add enhanced location data with Aadhar information
            t['aadhar_location'] = generate_aadhar_location_data()
            t['country_risk_level'] = get_country_risk_assessment(t['aadhar_location']['country'])
            t['transaction_method'] = get_realistic_transaction_method()
            t['bank_details'] = generate_bank_details()
            
            # Legacy location for backward compatibility
            t['from_location'] = random_india_location()
            t['to_location'] = random_india_location()
        
        # Generate enhanced SAR report
        sar_report = sar_generator.generate_sar_report(pattern_data, transactions)
        
        return jsonify({
            'status': 'success',
            'sar_report': sar_report,
            'transactions': transactions
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

@autosar_bp.route('/location-mapping', methods=['POST'])
def get_location_mapping():
    """Get location mapping data for SAR visualization"""
    try:
        request_data = request.get_json()
        scenario = request_data.get('scenario', 'all')
        
        # Get transactions with location data
        conn = sqlite3.connect(Config.DATABASE_PATH)
        query = "SELECT * FROM transactions WHERE scenario = ? LIMIT 100"
        
        import pandas as pd
        df = pd.read_sql_query(query, conn, params=[scenario])
        conn.close()
        
        # Generate location mapping data
        location_mapping = []
        transaction_clusters = {}
        
        for _, row in df.iterrows():
            location_data = generate_aadhar_location_data()
            country_risk = get_country_risk_assessment(location_data['country'])
            
            # Create location point for mapping
            location_point = {
                'transaction_id': row['transaction_id'],
                'lat': location_data['lat'],
                'lng': location_data['lng'],
                'city': location_data['city'],
                'state': location_data['state'],
                'country': location_data['country'],
                'amount': float(row['amount']),
                'suspicious_score': float(row['suspicious_score']),
                'country_risk_level': country_risk['level'],
                'country_risk_color': country_risk['color'],
                'timestamp': row['timestamp'],
                'cluster_id': f"{location_data['city']}_{location_data['state']}"
            }
            
            location_mapping.append(location_point)
            
            # Group by cluster for analysis
            cluster_id = location_point['cluster_id']
            if cluster_id not in transaction_clusters:
                transaction_clusters[cluster_id] = {
                    'location': f"{location_data['city']}, {location_data['state']}",
                    'country': location_data['country'],
                    'transaction_count': 0,
                    'total_amount': 0,
                    'avg_suspicion': 0,
                    'risk_level': country_risk['level'],
                    'coordinates': {'lat': location_data['lat'], 'lng': location_data['lng']}
                }
            
            transaction_clusters[cluster_id]['transaction_count'] += 1
            transaction_clusters[cluster_id]['total_amount'] += location_point['amount']
        
        # Calculate cluster averages
        for cluster in transaction_clusters.values():
            if cluster['transaction_count'] > 0:
                cluster_transactions = [t for t in location_mapping if t['cluster_id'] == cluster['location'].replace(', ', '_')]
                cluster['avg_suspicion'] = sum(t['suspicious_score'] for t in cluster_transactions) / len(cluster_transactions)
        
        # Generate risk heatmap data
        risk_heatmap = generate_risk_heatmap(location_mapping)
        
        # Cross-border flow analysis
        cross_border_flows = analyze_cross_border_flows(location_mapping)
        
        return jsonify({
            'status': 'success',
            'location_mapping': {
                'transaction_points': location_mapping,
                'clusters': transaction_clusters,
                'risk_heatmap': risk_heatmap,
                'cross_border_flows': cross_border_flows,
                'summary': {
                    'total_locations': len(location_mapping),
                    'unique_cities': len(set(p['city'] for p in location_mapping)),
                    'unique_countries': len(set(p['country'] for p in location_mapping)),
                    'high_risk_transactions': len([p for p in location_mapping if p['country_risk_level'] >= 3])
                }
            }
        })
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

# Enhanced helper functions

def generate_aadhar_location_data():
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
    
    # Add some international locations for suspicious transactions (15% chance)
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
    
    # Add coordinates
    coordinates = get_location_coordinates(location['city'])
    location.update(coordinates)
    
    return location

def get_location_coordinates(city):
    """Get coordinates for cities"""
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

def get_country_risk_assessment(country):
    """Get country risk assessment"""
    high_risk_countries = ['Pakistan', 'Afghanistan', 'North Korea', 'Iran']
    medium_risk_countries = ['UAE', 'Malaysia', 'Thailand', 'Myanmar']
    
    if country in high_risk_countries:
        return {'level': 3, 'description': 'High Risk Country', 'color': '#ff4444'}
    elif country in medium_risk_countries:
        return {'level': 2, 'description': 'Medium Risk Country', 'color': '#ffaa00'}
    else:
        return {'level': 1, 'description': 'Low Risk Country', 'color': '#44ff44'}

def get_realistic_transaction_method():
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

def generate_risk_heatmap(location_points):
    """Generate risk heatmap data for visualization"""
    heatmap_data = []
    
    # Group points by geographic regions
    region_risk = {}
    
    for point in location_points:
        key = f"{point['lat']:.1f},{point['lng']:.1f}"  # Round to create regions
        
        if key not in region_risk:
            region_risk[key] = {
                'lat': round(point['lat'], 1),
                'lng': round(point['lng'], 1),
                'risk_score': 0,
                'transaction_count': 0,
                'total_amount': 0
            }
        
        # Calculate weighted risk score
        risk_weight = point['suspicious_score'] * point['country_risk_level']
        region_risk[key]['risk_score'] += risk_weight
        region_risk[key]['transaction_count'] += 1
        region_risk[key]['total_amount'] += point['amount']
    
    # Normalize risk scores
    for region in region_risk.values():
        if region['transaction_count'] > 0:
            region['avg_risk_score'] = region['risk_score'] / region['transaction_count']
            region['intensity'] = min(region['avg_risk_score'] * region['transaction_count'] / 10, 1.0)
        
        heatmap_data.append(region)
    
    return heatmap_data

def analyze_cross_border_flows(location_points):
    """Analyze cross-border transaction flows"""
    flows = []
    countries = {}
    
    # Group by country
    for point in location_points:
        country = point['country']
        if country not in countries:
            countries[country] = {
                'country': country,
                'transaction_count': 0,
                'total_amount': 0,
                'avg_suspicion': 0,
                'risk_level': point['country_risk_level']
            }
        
        countries[country]['transaction_count'] += 1
        countries[country]['total_amount'] += point['amount']
    
    # Calculate averages
    for country_data in countries.values():
        if country_data['transaction_count'] > 0:
            country_points = [p for p in location_points if p['country'] == country_data['country']]
            country_data['avg_suspicion'] = sum(p['suspicious_score'] for p in country_points) / len(country_points)
    
    # Generate flow connections between high-activity countries
    country_list = list(countries.values())
    for i, country1 in enumerate(country_list):
        for country2 in country_list[i+1:]:
            if country1['transaction_count'] > 5 and country2['transaction_count'] > 5:
                # Create flow between countries
                flow_strength = min(country1['transaction_count'], country2['transaction_count']) / 100
                flows.append({
                    'from_country': country1['country'],
                    'to_country': country2['country'],
                    'strength': flow_strength,
                    'risk_level': max(country1['risk_level'], country2['risk_level'])
                })
    
    return {
        'country_summary': list(countries.values()),
        'cross_border_flows': flows,
        'high_risk_countries': [c for c in countries.values() if c['risk_level'] >= 3]
    }