from flask import Blueprint, jsonify, request
import numpy as np
import random
from datetime import datetime

hydra_bp = Blueprint('hydra', __name__)

class SimpleHydraGAN:
    """Simplified GAN for pattern generation and detection"""
    
    def __init__(self):
        self.detection_accuracy = 0.75
        self.generation_patterns = [
            'smurfing_enhanced',
            'layering_complex',
            'integration_hidden',
            'shell_company_web_v2'
        ]
    
    def generate_adversarial_pattern(self):
        """Generate a new adversarial pattern"""
        pattern = random.choice(self.generation_patterns)
        
        # Simulate pattern generation
        generated_pattern = {
            'pattern_id': f'GEN_{datetime.now().strftime("%H%M%S")}',
            'pattern_type': pattern,
            'complexity_score': np.random.uniform(0.6, 0.9),
            'transactions': self._generate_pattern_transactions(pattern),
            'generated_at': datetime.now().isoformat()
        }
        
        return generated_pattern
    
    def _generate_pattern_transactions(self, pattern_type):
        """Generate transactions for a specific pattern"""
        num_transactions = random.randint(10, 30)
        transactions = []
        
        for i in range(num_transactions):
            transactions.append({
                'from': f'GEN_ACC_{i % 5:02d}',
                'to': f'TARGET_{i % 3:02d}',
                'amount': np.random.uniform(1000, 10000),
                'timestamp': datetime.now().isoformat(),
                'generated': True
            })
        
        return transactions
    
    def test_detection(self, pattern):
        """Test detection accuracy against generated pattern"""
        # Simulate detection accuracy with some randomness
        base_accuracy = self.detection_accuracy
        pattern_complexity = pattern.get('complexity_score', 0.5)
        
        # Higher complexity = harder to detect
        detection_score = base_accuracy - (pattern_complexity * 0.2) + np.random.uniform(-0.1, 0.1)
        detection_score = max(0.1, min(0.95, detection_score))
        
        return {
            'detected': detection_score > 0.5,
            'confidence': detection_score,
            'pattern_id': pattern['pattern_id']
        }

# Global HYDRA instance
hydra_system = SimpleHydraGAN()

@hydra_bp.route('/generate', methods=['POST'])
def generate_pattern():
    """Generate adversarial pattern"""
    try:
        pattern = hydra_system.generate_adversarial_pattern()
        
        return jsonify({
            'status': 'success',
            'pattern': pattern
        })
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@hydra_bp.route('/detect', methods=['POST'])
def test_detection():
    """Test detection against generated pattern"""
    try:
        pattern_data = request.get_json()
        
        if not pattern_data:
            return jsonify({'status': 'error', 'message': 'No pattern data provided'}), 400
        
        detection_result = hydra_system.test_detection(pattern_data)
        
        return jsonify({
            'status': 'success',
            'detection': detection_result
        })
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@hydra_bp.route('/simulation', methods=['GET'])
def run_simulation():
    """Run AI vs AI simulation"""
    try:
        rounds = int(request.args.get('rounds', 10))
        
        simulation_results = []
        total_detected = 0
        
        for i in range(rounds):
            # Generate pattern
            pattern = hydra_system.generate_adversarial_pattern()
            
            # Test detection
            detection = hydra_system.test_detection(pattern)
            
            if detection['detected']:
                total_detected += 1
            
            simulation_results.append({
                'round': i + 1,
                'pattern': pattern['pattern_type'],
                'complexity': pattern['complexity_score'],
                'detected': detection['detected'],
                'confidence': detection['confidence']
            })
        
        return jsonify({
            'status': 'success',
            'simulation': {
                'rounds': rounds,
                'total_detected': total_detected,
                'detection_rate': total_detected / rounds,
                'results': simulation_results
            }
        })
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500