import unittest
import requests
import json
import os
from bs4 import BeautifulSoup

# Get the backend URL from the frontend .env file
with open('/app/frontend/.env', 'r') as f:
    for line in f:
        if line.startswith('REACT_APP_BACKEND_URL='):
            BACKEND_URL = line.strip().split('=')[1]
            break

# API endpoints
HEALTH_CHECK_ENDPOINT = f"{BACKEND_URL}/api/health"
ANALYZE_NEWSLETTER_ENDPOINT = f"{BACKEND_URL}/api/analyze-newsletter"

class TestNewsletterAnalyzerAPI(unittest.TestCase):
    
    def test_health_check(self):
        """Test the health check endpoint"""
        response = requests.get(HEALTH_CHECK_ENDPOINT)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "ok")
        self.assertTrue("message" in data)
        print("✅ Health check endpoint is working")
    
    def test_analyze_newsletter_basic(self):
        """Test the analyze newsletter endpoint with basic HTML"""
        html_content = """
        <!DOCTYPE html>
        <html>
        <head>
            <title>Test Newsletter</title>
        </head>
        <body>
            <table>
                <tr>
                    <td>
                        <h1>Welcome to our Newsletter</h1>
                        <p>This is a test newsletter content.</p>
                        <img src="https://example.com/image.jpg" alt="Test image">
                        <a href="https://example.com">Visit our website</a>
                        <a href="https://example.com/unsubscribe">Unsubscribe</a>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        """
        
        payload = {
            "html_content": html_content,
            "subject": "Test Newsletter",
            "preheader": "This is a test newsletter",
            "sender": "test@example.com"
        }
        
        response = requests.post(ANALYZE_NEWSLETTER_ENDPOINT, json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Check response structure
        self.assertIn("links", data)
        self.assertIn("html_issues", data)
        self.assertIn("responsive_preview", data)
        self.assertIn("inbox_preview", data)
        self.assertIn("report", data)
        
        # Check links extraction
        self.assertEqual(len(data["links"]), 2)
        
        # Check inbox preview
        self.assertEqual(data["inbox_preview"]["gmail"]["subject"], "Test Newsletter")
        self.assertEqual(data["inbox_preview"]["gmail"]["preheader"], "This is a test newsletter")
        self.assertEqual(data["inbox_preview"]["gmail"]["sender"], "test@example.com")
        
        print("✅ Analyze newsletter endpoint basic test passed")
    
    def test_analyze_newsletter_with_issues(self):
        """Test the analyze newsletter endpoint with HTML that has issues"""
        html_content = """
        <!DOCTYPE html>
        <html>
        <head>
            <title>Newsletter with Issues</title>
        </head>
        <body style="font-family: Arial; color: #333;">
            <div>
                <h1 style="color: red;">Newsletter with Issues</h1>
                <p>This newsletter has some issues that should be detected.</p>
                <img src="https://example.com/image.jpg">
                <a href="https://example.com">Visit our website</a>
                <a href="https://nonexistentwebsite123456789.com">Broken link</a>
            </div>
        </body>
        </html>
        """
        
        payload = {
            "html_content": html_content,
            "subject": "Newsletter with Issues",
            "preheader": "This newsletter has issues",
            "sender": "test@example.com"
        }
        
        response = requests.post(ANALYZE_NEWSLETTER_ENDPOINT, json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Check HTML issues detection
        html_issues = data["html_issues"]
        self.assertTrue(any("alt" in issue for issue in html_issues), "Missing alt attribute not detected")
        self.assertTrue(any("style" in issue.lower() for issue in html_issues), "Inline styles not detected")
        self.assertTrue(any("désabonnement" in issue.lower() for issue in html_issues), "Missing unsubscribe link not detected")
        self.assertTrue(any("table" in issue.lower() for issue in html_issues), "Missing table layout not detected")
        
        # Check link verification
        links = data["links"]
        broken_links = [link for link in links if link["status"] == "error"]
        self.assertTrue(len(broken_links) > 0, "Broken link not detected")
        
        # Check report generation
        report = data["report"]
        self.assertTrue(len(report["critical_issues"]) > 0, "Critical issues not reported")
        
        print("✅ Analyze newsletter with issues test passed")
    
    def test_analyze_newsletter_without_openai_key(self):
        """Test the analyze newsletter endpoint without OpenAI API key"""
        html_content = """
        <!DOCTYPE html>
        <html>
        <head>
            <title>Test Newsletter</title>
        </head>
        <body>
            <table>
                <tr>
                    <td>
                        <h1>Welcome to our Newsletter</h1>
                        <p>This is a test newsletter content.</p>
                        <a href="https://example.com">Visit our website</a>
                        <a href="https://example.com/unsubscribe">Unsubscribe</a>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        """
        
        payload = {
            "html_content": html_content,
            "subject": "Test Newsletter",
            "preheader": "This is a test newsletter",
            "sender": "test@example.com"
        }
        
        response = requests.post(ANALYZE_NEWSLETTER_ENDPOINT, json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Check that AI analysis is None when no API key is provided
        self.assertIsNone(data["ai_analysis"])
        
        print("✅ Analyze newsletter without OpenAI API key test passed")
    
    def test_analyze_newsletter_with_invalid_openai_key(self):
        """Test the analyze newsletter endpoint with invalid OpenAI API key"""
        html_content = """
        <!DOCTYPE html>
        <html>
        <head>
            <title>Test Newsletter</title>
        </head>
        <body>
            <table>
                <tr>
                    <td>
                        <h1>Welcome to our Newsletter</h1>
                        <p>This is a test newsletter content.</p>
                        <a href="https://example.com">Visit our website</a>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        """
        
        payload = {
            "html_content": html_content,
            "openai_api_key": "invalid_key_123456789",
            "subject": "Test Newsletter",
            "preheader": "This is a test newsletter",
            "sender": "test@example.com"
        }
        
        response = requests.post(ANALYZE_NEWSLETTER_ENDPOINT, json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Check that AI analysis contains an error message
        self.assertIsNotNone(data["ai_analysis"])
        self.assertIn("error", data["ai_analysis"])
        
        print("✅ Analyze newsletter with invalid OpenAI API key test passed")
    
    def test_analyze_newsletter_with_complex_html(self):
        """Test the analyze newsletter endpoint with complex HTML"""
        html_content = """
        <!DOCTYPE html>
        <html>
        <head>
            <title>Complex Newsletter</title>
            <style>
                .header { background-color: #f0f0f0; }
                .content { padding: 20px; }
            </style>
        </head>
        <body>
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                    <td class="header">
                        <h1>Complex Newsletter</h1>
                        <p>This is a more complex newsletter with multiple sections.</p>
                    </td>
                </tr>
                <tr>
                    <td class="content">
                        <h2>Section 1</h2>
                        <p>This is the first section of our newsletter.</p>
                        <img src="https://example.com/image1.jpg" alt="Section 1 image">
                        <a href="https://example.com/section1">Read more</a>
                    </td>
                </tr>
                <tr>
                    <td class="content">
                        <h2>Section 2</h2>
                        <p>This is the second section of our newsletter.</p>
                        <img src="https://example.com/image2.jpg" alt="Section 2 image">
                        <a href="https://example.com/section2">Read more</a>
                    </td>
                </tr>
                <tr>
                    <td>
                        <p>To unsubscribe, <a href="https://example.com/unsubscribe">click here</a>.</p>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        """
        
        payload = {
            "html_content": html_content,
            "subject": "Complex Newsletter",
            "preheader": "This is a complex newsletter with multiple sections",
            "sender": "newsletter@example.com"
        }
        
        response = requests.post(ANALYZE_NEWSLETTER_ENDPOINT, json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Check links extraction for complex HTML
        self.assertEqual(len(data["links"]), 3)
        
        # Check responsive preview
        self.assertEqual(data["responsive_preview"]["desktop_width"], 600)
        self.assertEqual(data["responsive_preview"]["mobile_width"], 375)
        self.assertEqual(data["responsive_preview"]["html_content"], html_content)
        
        print("✅ Analyze newsletter with complex HTML test passed")
    
    def test_analyze_newsletter_error_handling(self):
        """Test error handling in the analyze newsletter endpoint"""
        # Test with empty HTML content
        payload = {
            "html_content": "",
            "subject": "Empty Newsletter",
            "preheader": "This newsletter is empty",
            "sender": "test@example.com"
        }
        
        response = requests.post(ANALYZE_NEWSLETTER_ENDPOINT, json=payload)
        self.assertEqual(response.status_code, 200)  # Should still return 200 with empty results
        
        # Test with malformed JSON
        response = requests.post(
            ANALYZE_NEWSLETTER_ENDPOINT, 
            data="This is not JSON",
            headers={"Content-Type": "application/json"}
        )
        self.assertEqual(response.status_code, 422)  # FastAPI validation error
        
        print("✅ Analyze newsletter error handling test passed")

if __name__ == "__main__":
    unittest.main()