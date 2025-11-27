import json
import os
import urllib.request
import urllib.error
from datetime import datetime

def lambda_handler(event, context):
    """
    Lambda function to send deployment notifications to Discord.
    
    Expected event format:
    {
        "environment": "dev|test|prod",
        "status": "success|failure",
        "message": "Optional custom message",
        "alb_dns": "Optional ALB DNS name",
        "commit_sha": "Optional commit SHA"
    }
    """
    
    webhook_url = os.environ.get('DISCORD_WEBHOOK_URL')
    default_environment = os.environ.get('ENVIRONMENT', 'unknown')
    project_name = os.environ.get('PROJECT_NAME', 'StockWiz')
    
    if not webhook_url:
        return {
            'statusCode': 400,
            'body': json.dumps({'error': 'DISCORD_WEBHOOK_URL not configured'})
        }
    
    # Extract event data
    environment = event.get('environment', default_environment)
    status = event.get('status', 'success')
    custom_message = event.get('message', '')
    alb_dns = event.get('alb_dns', '')
    commit_sha = event.get('commit_sha', '')
    
    # Determine color and emoji based on status
    if status == 'success':
        color = 0x00ff00  # Green
        emoji = '✅'
        title = f'{emoji} Deployment Successful'
    else:
        color = 0xff0000  # Red
        emoji = '❌'
        title = f'{emoji} Deployment Failed'
    
    # Build Discord embed
    embed = {
        'title': title,
        'description': f'**Environment:** {environment.upper()}\n**Project:** {project_name}',
        'color': color,
        'timestamp': datetime.utcnow().isoformat(),
        'fields': []
    }
    
    if custom_message:
        embed['fields'].append({
            'name': 'Details',
            'value': custom_message,
            'inline': False
        })
    
    if alb_dns:
        embed['fields'].append({
            'name': 'ALB URL',
            'value': f'http://{alb_dns}',
            'inline': True
        })
    
    if commit_sha:
        short_sha = commit_sha[:7] if len(commit_sha) > 7 else commit_sha
        embed['fields'].append({
            'name': 'Commit',
            'value': f'`{short_sha}`',
            'inline': True
        })
    
    # Discord webhook payload
    payload = {
        'embeds': [embed]
    }
    
    # Send to Discord
    try:
        req = urllib.request.Request(
            webhook_url,
            data=json.dumps(payload).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        
        with urllib.request.urlopen(req, timeout=10) as response:
            response_data = response.read().decode('utf-8')
            
            return {
                'statusCode': 200,
                'body': json.dumps({
                    'message': 'Notification sent successfully',
                    'response': response_data
                })
            }
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8')
        return {
            'statusCode': e.code,
            'body': json.dumps({
                'error': f'Discord webhook error: {error_body}'
            })
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({
                'error': f'Unexpected error: {str(e)}'
            })
        }

