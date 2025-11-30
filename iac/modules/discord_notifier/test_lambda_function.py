import json
import os
import unittest
from unittest.mock import patch, MagicMock, mock_open
import urllib.error
from datetime import datetime

from lambda_function import lambda_handler


class TestLambdaFunction(unittest.TestCase):
    """Test suite for Discord notifier Lambda function."""

    def setUp(self):
        """Set up test fixtures."""
        self.webhook_url = 'https://discord.com/api/webhooks/test/test'
        self.context = MagicMock()
        self.default_event = {
            'environment': 'dev',
            'status': 'success'
        }

    @patch.dict(os.environ, {
        'DISCORD_WEBHOOK_URL': 'https://discord.com/api/webhooks/test/test',
        'ENVIRONMENT': 'dev',
        'PROJECT_NAME': 'StockWiz'
    })
    @patch('lambda_function.urllib.request.urlopen')
    def test_successful_deployment_with_all_fields(self, mock_urlopen):
        """Test successful deployment notification with all optional fields."""
        # Mock successful HTTP response
        mock_response = MagicMock()
        mock_response.read.return_value = b'{"id": "123456"}'
        mock_urlopen.return_value.__enter__.return_value = mock_response
        mock_urlopen.return_value.__exit__.return_value = None

        event = {
            'environment': 'prod',
            'status': 'success',
            'message': 'Deployment completed successfully',
            'alb_dns': 'test-alb-123456.us-east-1.elb.amazonaws.com',
            'commit_sha': 'abcdef1234567890'
        }

        result = lambda_handler(event, self.context)

        self.assertEqual(result['statusCode'], 200)
        body = json.loads(result['body'])
        self.assertEqual(body['message'], 'Notification sent successfully')

        # Verify the request was made correctly
        mock_urlopen.assert_called_once()
        call_args = mock_urlopen.call_args
        request = call_args[0][0]
        self.assertEqual(request.full_url, self.webhook_url)
        # Verify headers are set correctly (headers are normalized to lowercase)
        self.assertIn('Content-type', request.headers)
        self.assertEqual(request.headers['Content-type'], 'application/json')

        # Verify payload structure
        payload_data = json.loads(call_args[0][0].data)
        self.assertIn('embeds', payload_data)
        embed = payload_data['embeds'][0]
        self.assertEqual(embed['title'], '✅ Deployment Successful')
        self.assertEqual(embed['color'], 0x00ff00)
        self.assertIn('PROD', embed['description'])
        self.assertEqual(len(embed['fields']), 3)  # message, alb_dns, commit_sha

    @patch.dict(os.environ, {
        'DISCORD_WEBHOOK_URL': 'https://discord.com/api/webhooks/test/test',
        'ENVIRONMENT': 'dev',
        'PROJECT_NAME': 'StockWiz'
    })
    @patch('lambda_function.urllib.request.urlopen')
    def test_failed_deployment(self, mock_urlopen):
        """Test failed deployment notification."""
        mock_response = MagicMock()
        mock_response.read.return_value = b'{"id": "123456"}'
        mock_urlopen.return_value.__enter__.return_value = mock_response
        mock_urlopen.return_value.__exit__.return_value = None

        event = {
            'environment': 'test',
            'status': 'failure',
            'message': 'Deployment failed due to timeout'
        }

        result = lambda_handler(event, self.context)

        self.assertEqual(result['statusCode'], 200)

        # Verify failure embed
        call_args = mock_urlopen.call_args
        payload_data = json.loads(call_args[0][0].data)
        embed = payload_data['embeds'][0]
        self.assertEqual(embed['title'], '❌ Deployment Failed')
        self.assertEqual(embed['color'], 0xff0000)

    @patch.dict(os.environ, {
        'DISCORD_WEBHOOK_URL': 'https://discord.com/api/webhooks/test/test',
        'ENVIRONMENT': 'dev',
        'PROJECT_NAME': 'StockWiz'
    })
    @patch('lambda_function.urllib.request.urlopen')
    def test_minimal_event(self, mock_urlopen):
        """Test with minimal event data."""
        mock_response = MagicMock()
        mock_response.read.return_value = b'{"id": "123456"}'
        mock_urlopen.return_value.__enter__.return_value = mock_response
        mock_urlopen.return_value.__exit__.return_value = None

        event = {}

        result = lambda_handler(event, self.context)

        self.assertEqual(result['statusCode'], 200)

        # Verify default values
        call_args = mock_urlopen.call_args
        payload_data = json.loads(call_args[0][0].data)
        embed = payload_data['embeds'][0]
        self.assertIn('DEV', embed['description'])  # Uses default environment
        self.assertEqual(len(embed['fields']), 0)  # No optional fields

    @patch.dict(os.environ, {
        'DISCORD_WEBHOOK_URL': 'https://discord.com/api/webhooks/test/test',
        'ENVIRONMENT': 'prod',
        'PROJECT_NAME': 'CustomProject'
    })
    @patch('lambda_function.urllib.request.urlopen')
    def test_custom_environment_variables(self, mock_urlopen):
        """Test with custom environment variables."""
        mock_response = MagicMock()
        mock_response.read.return_value = b'{"id": "123456"}'
        mock_urlopen.return_value.__enter__.return_value = mock_response
        mock_urlopen.return_value.__exit__.return_value = None

        event = {'status': 'success'}

        result = lambda_handler(event, self.context)

        self.assertEqual(result['statusCode'], 200)

        call_args = mock_urlopen.call_args
        payload_data = json.loads(call_args[0][0].data)
        embed = payload_data['embeds'][0]
        self.assertIn('PROD', embed['description'])
        self.assertIn('CustomProject', embed['description'])

    @patch.dict(os.environ, {}, clear=True)
    def test_missing_webhook_url(self):
        """Test error when DISCORD_WEBHOOK_URL is not configured."""
        event = {'status': 'success'}

        result = lambda_handler(event, self.context)

        self.assertEqual(result['statusCode'], 400)
        body = json.loads(result['body'])
        self.assertIn('error', body)
        self.assertIn('DISCORD_WEBHOOK_URL', body['error'])

    @patch.dict(os.environ, {
        'DISCORD_WEBHOOK_URL': 'https://discord.com/api/webhooks/test/test',
        'ENVIRONMENT': 'dev',
        'PROJECT_NAME': 'StockWiz'
    })
    @patch('lambda_function.urllib.request.urlopen')
    def test_http_error(self, mock_urlopen):
        """Test handling of HTTP errors from Discord."""
        # Mock HTTPError
        error_response = MagicMock()
        error_response.read.return_value = b'{"message": "Invalid webhook"}'
        mock_urlopen.side_effect = urllib.error.HTTPError(
            url='https://discord.com/api/webhooks/test/test',
            code=404,
            msg='Not Found',
            hdrs={},
            fp=error_response
        )

        event = {'status': 'success'}

        result = lambda_handler(event, self.context)

        self.assertEqual(result['statusCode'], 404)
        body = json.loads(result['body'])
        self.assertIn('error', body)
        self.assertIn('Discord webhook error', body['error'])

    @patch.dict(os.environ, {
        'DISCORD_WEBHOOK_URL': 'https://discord.com/api/webhooks/test/test',
        'ENVIRONMENT': 'dev',
        'PROJECT_NAME': 'StockWiz'
    })
    @patch('lambda_function.urllib.request.urlopen')
    def test_general_exception(self, mock_urlopen):
        """Test handling of general exceptions."""
        mock_urlopen.side_effect = Exception('Network error')

        event = {'status': 'success'}

        result = lambda_handler(event, self.context)

        self.assertEqual(result['statusCode'], 500)
        body = json.loads(result['body'])
        self.assertIn('error', body)
        self.assertIn('Unexpected error', body['error'])

    @patch.dict(os.environ, {
        'DISCORD_WEBHOOK_URL': 'https://discord.com/api/webhooks/test/test',
        'ENVIRONMENT': 'dev',
        'PROJECT_NAME': 'StockWiz'
    })
    @patch('lambda_function.urllib.request.urlopen')
    def test_commit_sha_truncation(self, mock_urlopen):
        """Test that long commit SHA is truncated to 7 characters."""
        mock_response = MagicMock()
        mock_response.read.return_value = b'{"id": "123456"}'
        mock_urlopen.return_value.__enter__.return_value = mock_response
        mock_urlopen.return_value.__exit__.return_value = None

        event = {
            'status': 'success',
            'commit_sha': 'abcdef1234567890abcdef1234567890'
        }

        result = lambda_handler(event, self.context)

        self.assertEqual(result['statusCode'], 200)

        call_args = mock_urlopen.call_args
        payload_data = json.loads(call_args[0][0].data)
        embed = payload_data['embeds'][0]
        commit_field = next(f for f in embed['fields'] if f['name'] == 'Commit')
        self.assertEqual(commit_field['value'], '`abcdef1`')  # First 7 chars

    @patch.dict(os.environ, {
        'DISCORD_WEBHOOK_URL': 'https://discord.com/api/webhooks/test/test',
        'ENVIRONMENT': 'dev',
        'PROJECT_NAME': 'StockWiz'
    })
    @patch('lambda_function.urllib.request.urlopen')
    def test_short_commit_sha(self, mock_urlopen):
        """Test that short commit SHA is not truncated."""
        mock_response = MagicMock()
        mock_response.read.return_value = b'{"id": "123456"}'
        mock_urlopen.return_value.__enter__.return_value = mock_response
        mock_urlopen.return_value.__exit__.return_value = None

        event = {
            'status': 'success',
            'commit_sha': 'abc123'
        }

        result = lambda_handler(event, self.context)

        self.assertEqual(result['statusCode'], 200)

        call_args = mock_urlopen.call_args
        payload_data = json.loads(call_args[0][0].data)
        embed = payload_data['embeds'][0]
        commit_field = next(f for f in embed['fields'] if f['name'] == 'Commit')
        self.assertEqual(commit_field['value'], '`abc123`')  # Not truncated

    @patch.dict(os.environ, {
        'DISCORD_WEBHOOK_URL': 'https://discord.com/api/webhooks/test/test',
        'ENVIRONMENT': 'dev',
        'PROJECT_NAME': 'StockWiz'
    })
    @patch('lambda_function.urllib.request.urlopen')
    def test_user_agent_header(self, mock_urlopen):
        """Test that User-Agent header is set correctly."""
        mock_response = MagicMock()
        mock_response.read.return_value = b'{"id": "123456"}'
        mock_urlopen.return_value.__enter__.return_value = mock_response
        mock_urlopen.return_value.__exit__.return_value = None

        event = {'status': 'success'}

        lambda_handler(event, self.context)

        call_args = mock_urlopen.call_args
        request = call_args[0][0]
        # Headers are normalized to lowercase in Request
        user_agent = request.headers.get('User-agent', '')
        self.assertIn('Mozilla/5.0', user_agent)
        self.assertIn('Chrome/91.0.4472.124', user_agent)

    @patch.dict(os.environ, {
        'DISCORD_WEBHOOK_URL': 'https://discord.com/api/webhooks/test/test',
        'ENVIRONMENT': 'dev',
        'PROJECT_NAME': 'StockWiz'
    })
    @patch('lambda_function.urllib.request.urlopen')
    def test_timestamp_in_embed(self, mock_urlopen):
        """Test that timestamp is included in embed."""
        mock_response = MagicMock()
        mock_response.read.return_value = b'{"id": "123456"}'
        mock_urlopen.return_value.__enter__.return_value = mock_response
        mock_urlopen.return_value.__exit__.return_value = None

        event = {'status': 'success'}

        lambda_handler(event, self.context)

        call_args = mock_urlopen.call_args
        payload_data = json.loads(call_args[0][0].data)
        embed = payload_data['embeds'][0]
        self.assertIn('timestamp', embed)
        # Verify timestamp is in ISO format
        try:
            datetime.fromisoformat(embed['timestamp'].replace('Z', '+00:00'))
        except ValueError:
            self.fail('Timestamp is not in valid ISO format')

    @patch.dict(os.environ, {
        'DISCORD_WEBHOOK_URL': 'https://discord.com/api/webhooks/test/test',
        'ENVIRONMENT': 'dev',
        'PROJECT_NAME': 'StockWiz'
    })
    @patch('lambda_function.urllib.request.urlopen')
    def test_alb_dns_url_format(self, mock_urlopen):
        """Test that ALB DNS is formatted as URL."""
        mock_response = MagicMock()
        mock_response.read.return_value = b'{"id": "123456"}'
        mock_urlopen.return_value.__enter__.return_value = mock_response
        mock_urlopen.return_value.__exit__.return_value = None

        event = {
            'status': 'success',
            'alb_dns': 'test-alb-123456.us-east-1.elb.amazonaws.com'
        }

        lambda_handler(event, self.context)

        call_args = mock_urlopen.call_args
        payload_data = json.loads(call_args[0][0].data)
        embed = payload_data['embeds'][0]
        alb_field = next(f for f in embed['fields'] if f['name'] == 'ALB URL')
        self.assertEqual(
            alb_field['value'],
            'http://test-alb-123456.us-east-1.elb.amazonaws.com'
        )

    @patch.dict(os.environ, {
        'DISCORD_WEBHOOK_URL': 'https://discord.com/api/webhooks/test/test',
        'ENVIRONMENT': 'dev',
        'PROJECT_NAME': 'StockWiz'
    })
    @patch('lambda_function.urllib.request.urlopen')
    def test_timeout_handling(self, mock_urlopen):
        """Test that timeout is set correctly."""
        mock_response = MagicMock()
        mock_response.read.return_value = b'{"id": "123456"}'
        mock_urlopen.return_value.__enter__.return_value = mock_response
        mock_urlopen.return_value.__exit__.return_value = None

        event = {'status': 'success'}

        lambda_handler(event, self.context)

        call_args = mock_urlopen.call_args
        # Verify timeout parameter is passed
        self.assertEqual(call_args[1]['timeout'], 10)


if __name__ == '__main__':
    unittest.main()

