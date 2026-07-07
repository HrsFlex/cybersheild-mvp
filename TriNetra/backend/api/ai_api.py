from flask import Blueprint, jsonify, request
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from config import Config

try:
    import requests
except ImportError:
    requests = None

ai_bp = Blueprint('ai', __name__)

OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'
OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'


def _provider_settings():
    """Resolve which provider/key/model/url to use based on Config.LLM_PROVIDER."""
    provider = Config.LLM_PROVIDER

    if provider == 'openrouter':
        return {
            'provider': 'openrouter',
            'url': OPENROUTER_API_URL,
            'api_key': Config.OPENROUTER_API_KEY,
            'model': Config.OPENROUTER_MODEL,
        }

    # Default to OpenAI for any other value (including "openai")
    return {
        'provider': 'openai',
        'url': OPENAI_API_URL,
        'api_key': Config.OPENAI_API_KEY,
        'model': Config.OPENAI_MODEL,
    }


def call_llm(system_prompt, user_prompt, max_tokens=1024):
    """Call the configured LLM provider (OpenAI or OpenRouter) server-side.

    Keeping the API key here (read from env vars via Config) means it never
    ships to the browser.
    """
    settings = _provider_settings()

    if not settings['api_key']:
        raise RuntimeError(
            f"No API key configured for LLM_PROVIDER=\"{settings['provider']}\" "
            f"(set OPENAI_API_KEY or OPENROUTER_API_KEY, and LLM_PROVIDER, in the backend .env)"
        )
    if requests is None:
        raise RuntimeError('The "requests" package is not installed')

    headers = {
        'Authorization': f"Bearer {settings['api_key']}",
        'Content-Type': 'application/json'
    }

    response = requests.post(
        settings['url'],
        headers=headers,
        json={
            'model': settings['model'],
            'messages': [
                {'role': 'system', 'content': system_prompt},
                {'role': 'user', 'content': user_prompt}
            ],
            'temperature': 0.7,
            'max_tokens': max_tokens
        },
        timeout=20
    )
    response.raise_for_status()
    data = response.json()
    return data['choices'][0]['message']['content']


@ai_bp.route('/status', methods=['GET'])
def ai_status():
    """Lets the frontend check whether server-side AI is configured before trying it."""
    settings = _provider_settings()
    return jsonify({
        'status': 'success',
        'provider': settings['provider'],
        'configured': bool(settings['api_key'])
    })


@ai_bp.route('/financial-analysis', methods=['POST'])
def financial_analysis():
    try:
        data = request.get_json() or {}
        system_prompt = (
            'You are an expert financial crime analyst with deep knowledge of AML/CFT '
            'regulations and money laundering patterns. Respond ONLY with a single '
            'compact JSON object (no markdown, no commentary) with keys: '
            'riskAssessment (one of HIGH, MEDIUM, LOW, CRITICAL), confidence (integer 0-100), '
            'techniques (array of strings), recommendations (array of up to 5 strings), '
            'enhancedInsights (string), regulatoryAction (string).'
        )
        patterns = data.get('patterns') or ['Unknown']
        user_prompt = (
            'Analyze this transaction summary:\n'
            f"- Total transactions: {data.get('totalTransactions', 'Unknown')}\n"
            f"- Suspicious transactions: {data.get('suspiciousCount', 'Unknown')}\n"
            f"- Time period: {data.get('timePeriod', '30 days')}\n"
            f"- Total amount: {data.get('totalAmount', 'Unknown')}\n"
            f"- Patterns detected: {', '.join(patterns)}"
        )

        content = call_llm(system_prompt, user_prompt)
        return jsonify({'status': 'success', 'result': content})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 502


@ai_bp.route('/sar-enhancement', methods=['POST'])
def sar_enhancement():
    try:
        data = request.get_json() or {}
        system_prompt = (
            'You are a specialized SAR (Suspicious Activity Report) analyst with expertise '
            'in BSA/AML regulations. Respond ONLY with a single compact JSON object (no '
            'markdown, no commentary) with keys: enhancedNarrative (string), '
            'regulatoryCompliance (object with bsaRequirements, sarRequired, deadline, urgency), '
            'filingRequirements (object with deadline, urgency), '
            'recommendations (array of up to 6 strings).'
        )
        user_prompt = (
            'Review this SAR data:\n'
            f"- Pattern type: {data.get('patternType', 'Unknown')}\n"
            f"- Confidence score: {data.get('confidence', 'Unknown')}\n"
            f"- Accounts involved: {data.get('accountsCount', 'Unknown')}\n"
            f"- Amount range: {data.get('amountRange', 'Unknown')}\n"
            f"- Geographic risk: {data.get('geographicRisk', 'Unknown')}"
        )

        content = call_llm(system_prompt, user_prompt)
        return jsonify({'status': 'success', 'result': content})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 502


@ai_bp.route('/battle-analysis', methods=['POST'])
def battle_analysis():
    try:
        data = request.get_json() or {}
        system_prompt = (
            'You are an AI security expert analyzing adversarial machine learning systems '
            'for financial crime detection. Respond ONLY with a single compact JSON object '
            '(no markdown, no commentary) with keys: performanceLevel (one of EXCEPTIONAL, '
            'EXCELLENT, GOOD, NEEDS IMPROVEMENT), insights (string), '
            'recommendations (array of up to 5 strings).'
        )
        user_prompt = (
            'Analyze these HYDRA battle metrics:\n'
            f"- Defender wins: {data.get('defenderWins', 0)}\n"
            f"- Attacker wins: {data.get('attackerWins', 0)}\n"
            f"- Detection rate: {data.get('detectionRate', 0)}%\n"
            f"- Total battles: {data.get('totalBattles', 0)}"
        )

        content = call_llm(system_prompt, user_prompt)
        return jsonify({'status': 'success', 'result': content})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 502
