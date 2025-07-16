from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import re
import requests
import json
from urllib.parse import urlparse
import asyncio
import aiohttp
from bs4 import BeautifulSoup
import openai
import os
from datetime import datetime

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class NewsletterAnalysisRequest(BaseModel):
    html_content: str
    openai_api_key: Optional[str] = None
    subject: Optional[str] = None
    preheader: Optional[str] = None
    sender: Optional[str] = None

class LinkInfo(BaseModel):
    url: str
    text: str
    status_code: Optional[int] = None
    status: str = "pending"
    favicon: Optional[str] = None
    title: Optional[str] = None
    preview_image: Optional[str] = None
    description: Optional[str] = None

class AnalysisResult(BaseModel):
    ai_analysis: Optional[Dict[str, Any]] = None
    links: List[LinkInfo] = []
    html_issues: List[str] = []
    responsive_preview: Dict[str, Any] = {}
    inbox_preview: Dict[str, Any] = {}
    report: Dict[str, Any] = {}

# Utility functions
def extract_links_from_html(html_content: str) -> List[LinkInfo]:
    """Extract all links from HTML content"""
    soup = BeautifulSoup(html_content, 'html.parser')
    links = []
    
    for link in soup.find_all('a', href=True):
        href = link['href']
        text = link.get_text(strip=True)
        links.append(LinkInfo(url=href, text=text))
    
    return links

async def verify_link_status(session: aiohttp.ClientSession, link: LinkInfo) -> LinkInfo:
    """Verify the status of a single link"""
    try:
        async with session.head(link.url, timeout=aiohttp.ClientTimeout(total=10)) as response:
            link.status_code = response.status
            if response.status == 200:
                link.status = "success"
            elif response.status == 404:
                link.status = "error"
            else:
                link.status = "warning"
            
            # Try to get favicon and title
            try:
                domain = urlparse(link.url).netloc
                link.favicon = f"https://www.google.com/s2/favicons?domain={domain}"
                
                # Get page title
                async with session.get(link.url, timeout=aiohttp.ClientTimeout(total=5)) as page_response:
                    if page_response.status == 200:
                        content = await page_response.text()
                        page_soup = BeautifulSoup(content, 'html.parser')
                        title_tag = page_soup.find('title')
                        if title_tag:
                            link.title = title_tag.get_text(strip=True)[:100]
                        # Try Open Graph preview image
                        og_img = page_soup.find('meta', property='og:image')
                        if og_img and og_img.get('content'):
                            link.preview_image = og_img['content']
                        else:
                            twitter_img = page_soup.find('meta', attrs={'name': 'twitter:image'})
                            if twitter_img and twitter_img.get('content'):
                                link.preview_image = twitter_img['content']

                        # Try meta description / og:description
                        description_tag = page_soup.find('meta', property='og:description')
                        if not description_tag:
                            description_tag = page_soup.find('meta', attrs={'name': 'description'})
                        if description_tag and description_tag.get('content'):
                            link.description = description_tag['content'][:200]
            except:
                pass
                
    except Exception as e:
        link.status = "error"
        link.status_code = None
    
    return link

async def verify_all_links(links: List[LinkInfo]) -> List[LinkInfo]:
    """Verify all links concurrently"""
    async with aiohttp.ClientSession() as session:
        tasks = [verify_link_status(session, link) for link in links]
        return await asyncio.gather(*tasks)

def analyze_html_issues(html_content: str) -> List[str]:
    """Analyze HTML for common issues"""
    issues = []
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # Check for missing alt attributes
    images = soup.find_all('img')
    for img in images:
        if not img.get('alt'):
            issues.append(f"Image manque l'attribut alt: {img.get('src', 'source inconnue')}")
    
    # Check for inline styles (not responsive)
    if 'style=' in html_content:
        issues.append("Styles inline détectés - peuvent causer des problèmes de responsivité")
    
    # Check for missing unsubscribe link
    unsubscribe_found = False
    for link in soup.find_all('a', href=True):
        if any(keyword in link.get_text().lower() for keyword in ['unsubscribe', 'désabonnement', 'se désabonner']):
            unsubscribe_found = True
            break
    
    if not unsubscribe_found:
        issues.append("Lien de désabonnement manquant")
    
    # Check for table-based layout (common in emails)
    tables = soup.find_all('table')
    if not tables:
        issues.append("Aucune table détectée - vérifiez la compatibilité email")
    
    return issues

async def analyze_with_ai(html_content: str, api_key: str, subject: str = "", preheader: str = "") -> Dict[str, Any]:
    """Analyze newsletter content with OpenAI"""
    if not api_key:
        return {"error": "Clé API OpenAI manquante"}
    
    # Extract text content for analysis
    soup = BeautifulSoup(html_content, 'html.parser')
    text_content = soup.get_text()
    
    prompt = f"""
    Analysez cette newsletter et fournissez une évaluation détaillée en français:
    
    Sujet: {subject}
    Préheader: {preheader}
    Contenu: {text_content[:3000]}...
    
    Veuillez analyser et retourner un JSON avec:
    {{
        "orthographe_grammaire": {{
            "score": 0-10,
            "erreurs": ["liste des erreurs"],
            "suggestions": ["suggestions d'amélioration"]
        }},
        "lisibilite": {{
            "score": 0-10,
            "niveau": "facile/moyen/difficile",
            "suggestions": ["conseils pour améliorer"]
        }},
        "cta_evaluation": {{
            "ctas_detectes": ["liste des CTA"],
            "efficacite": 0-10,
            "suggestions": ["améliorer les CTA"]
        }},
        "sujet_preheader": {{
            "sujet_score": 0-10,
            "preheader_score": 0-10,
            "suggestions": ["améliorer sujet/preheader"]
        }},
        "structure": {{
            "score": 0-10,
            "problemes": ["problèmes structurels"],
            "suggestions": ["améliorer structure"]
        }}
    }}
    """
    
    try:
        client = openai.OpenAI(api_key=api_key)
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "Tu es un expert en marketing par email. Analyse les newsletters et donne des conseils pratiques en français."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3
        )
        
        result = json.loads(response.choices[0].message.content)
        return result
        
    except Exception as e:
        return {"error": f"Erreur lors de l'analyse IA: {str(e)}"}

# API endpoints
@app.post("/api/analyze-newsletter", response_model=AnalysisResult)
async def analyze_newsletter(request: NewsletterAnalysisRequest):
    """Main endpoint to analyze newsletter"""
    try:
        result = AnalysisResult()
        
        # Extract and verify links
        links = extract_links_from_html(request.html_content)
        verified_links = await verify_all_links(links)
        result.links = verified_links
        
        # Analyze HTML issues
        result.html_issues = analyze_html_issues(request.html_content)
        
        # AI Analysis (if API key provided)
        if request.openai_api_key:
            ai_result = await analyze_with_ai(
                request.html_content, 
                request.openai_api_key,
                request.subject or "",
                request.preheader or ""
            )
            result.ai_analysis = ai_result
        
        # Generate responsive preview data
        result.responsive_preview = {
            "desktop_width": 600,
            "mobile_width": 375,
            "html_content": request.html_content
        }
        
        # Generate inbox preview data
        result.inbox_preview = {
            "gmail": {
                "subject": request.subject or "Sujet de la newsletter",
                "preheader": request.preheader or "Texte de prévisualisation...",
                "sender": request.sender or "sender@example.com"
            },
            "apple_mail": {
                "subject": request.subject or "Sujet de la newsletter", 
                "preheader": request.preheader or "Texte de prévisualisation...",
                "sender": request.sender or "sender@example.com"
            }
        }
        
        # Generate report summary
        critical_issues = []
        warnings = []
        
        # Count link issues
        broken_links = [link for link in verified_links if link.status == "error"]
        if broken_links:
            critical_issues.append(f"{len(broken_links)} lien(s) cassé(s)")
        
        # Add HTML issues
        critical_issues.extend(result.html_issues)
        
        # AI-based issues
        if result.ai_analysis and "error" not in result.ai_analysis:
            ai_data = result.ai_analysis
            if ai_data.get("orthographe_grammaire", {}).get("score", 10) < 7:
                warnings.append("Problèmes d'orthographe/grammaire détectés")
            if ai_data.get("lisibilite", {}).get("score", 10) < 6:
                warnings.append("Lisibilité à améliorer")
        
        result.report = {
            "critical_issues": critical_issues,
            "warnings": warnings,
            "total_links": len(verified_links),
            "broken_links": len(broken_links),
            "analysis_timestamp": datetime.now().isoformat()
        }
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'analyse: {str(e)}")

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "message": "Newsletter analyzer API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)