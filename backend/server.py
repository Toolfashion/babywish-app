from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from fastapi.responses import JSONResponse, FileResponse, PlainTextResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
Importprotokollierung
import asyncio
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, date, timedelta
import random
import httpx
Import erneut senden

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB-Verbindung
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Streifen
Importstreifen

stripe_api_key = os.environ.get('STRIPE_API_KEY')
stripe.api_key = stripe_api_key

# E-Mail erneut senden
resend.api_key = os.environ.get('RESEND_API_KEY')
NOTIFICATION_EMAIL = os.environ.get('NOTIFICATION_EMAIL', 'getbabywish@protonmail.com')
SENDER_EMAIL = "getbabywish@protonmail.com"

# Erstelle die Hauptanwendung ohne Präfix
app = FastAPI()

# Erstelle einen Router mit dem Präfix /api
api_router = APIRouter(prefix="/api")

# Endpunkt für die Zustandsprüfung zur Überwachung der Verfügbarkeit
@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "service": "babywish-api"}

@api_router.get("/debug/chat-status")
async def debug_chat_status():
    """Debug-Endpunkt zur Überprüfung der KI-Chat-Konfiguration""
    mistral_key = os.environ.get('MISTRAL_API_KEY')
    emergent_key = os.environ.get('EMERGENT_LLM_KEY')
    
    Ergebnis = {
        "mistral_configuration": bool(mistral_key),
        "mistral_key_length": len(mistral_key) if mistral_key else 0,
        "mistral_key_prefix": mistral_key[:8] + "..." if mistral_key and len(mistral_key) > 8 else None,
        "emergent_configuration": bool(emergent_key),
        "test_result": None,
        "Fehler": Keine
    }
    
    if mistral_key:
        versuchen:
            aus Mistralai importiert Mistral
            client = Mistral(api_key=mistral_key.strip())
            # Einfacher Testaufruf
            Antwort = client.chat.complete(
                model="mistral-small-latest",
                messages=[{"role": "user", "content": "Sag 'OK' in einem Wort"}]
            )
            result["test_result"] = "ERFOLG"
            result["test_response"] = response.choices[0].message.content[:50]
        außer Ausnahme als e:
            result["test_result"] = "FEHLGESCHLAGEN"
            result["error"] = f"{type(e).__name__}: {str(e)}"
    
    Rückgabeergebnis

# Download-Endpunkt für Codedateien
@api_router.get("/download/{filename}")
async def download_file(filename: str):
    "Alle Dateien zum Download bereitstellen – erzwingt den Download anstelle der Vorschau""
    import os
    aus fastapi.responses FileResponse importieren
    file_path = f"/app/downloads/{filename}"
    if os.path.exists(file_path):
        # Medientyp bestimmen
        media_types = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.mp4': 'video/mp4',
            '.mov': 'video/quicktime',
            '.txt': 'text/plain',
            '.js': 'application/javascript',
            '.jsx': 'application/javascript',
            '.py': 'text/x-python',
            '.json': 'application/json',
            '.css': 'text/css',
            '.html': 'text/html',
        }
        ext = '.' + filename.split('.')[-1].lower()
        media_type = media_types.get(ext, 'application/octet-stream')
        
        # Download erzwingen mit Content-Disposition: attachment für ALLE Dateien
        return FileResponse(
            Dateipfad,
            media_type=media_type,
            Dateiname=Dateiname,
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    return JSONResponse({"error": "Datei nicht gefunden"}, status_code=404)

@api_router.get("/view/{filename}")
async def view_file(filename: str):
    """Dateiinhalt im Browser anzeigen, um einfaches Kopieren und Einfügen zu ermöglichen""
    import os
    file_path = f"/app/downloads/{filename}"
    if os.path.exists(file_path):
        versuchen:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            # Als Klartext zurückgeben, der kopiert werden kann
            return PlainTextResponse(content, media_type="text/plain; charset=utf-8")
        außer:
            return JSONResponse({"error": "Datei kann nicht als Text gelesen werden"}, status_code=400)
    return JSONResponse({"error": "Datei nicht gefunden"}, status_code=404)


# Abonnementpakete – Beträge in EUR
ABONNEMENTPAKETE = {
    "3_months": {"name": "3 Monate", "amount": 10.00, "duration_months": 3},
    "9_months": {"name": "9 Monate", "amount": 25.00, "duration_months": 9},
    "18_months": {"name": "18 Monate", "amount": 50.00, "duration_months": 18},
}

# ===================== E-MAIL-BENACHRICHTIGUNG =====================

async def send_subscription_notification(user_email: str, user_name: str, package_id: str, amount: float, subscription_id: str):
    """Sende eine E-Mail-Benachrichtigung an den Administrator, wenn ein neues Abonnement erstellt wird""
    versuchen:
        package_info = SUBSCRIPTION_PACKAGES.get(package_id, {})
        package_name = package_info.get("name", package_id)
        
        html_content = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0;">🎉 Νέος Συνδρομητής!</h1>
            </div>
            
            <div style="background: #f9f9f9; padding: 30px; border: 1px solid #ddd;">
                <h2 style="color: #333; margin-top: 0;">Neue Version</h2>
                
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #666;">Όνομα:</td>
                        <td style="padding: 10px; border-bottom: 1px solid #eee; color: #333;">{user_name}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #666;">E-Mail:</td>
                        <td style="padding: 10px; border-bottom: 1px solid #eee; color: #333;">{user_email}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #666;">Πακέτο:</td>
                        <td style="padding: 10px; border-bottom: 1px solid #eee; color: #333;">{package_name}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #666;">Ποσό:</td>
                        <td style="padding: 10px; border-bottom: 1px solid #eee; color: #27ae60; font-weight: bold;">€{amount:.2f}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #666;">Abonnement-ID:</td>
                        <td style="padding: 10px; border-bottom: 1px solid #eee; color: #333; font-size: 12px;">{subscription_id}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; Schriftstärke: fett; Farbe: #666;">Einstellungen:</td>
                        <td style="padding: 10px; color: #333;">{datetime.now(timezone.utc).strftime('%d/%m/%Y %H:%M UTC')}</td>
                    </tr>
                </table>
            </div>
            
            <div style="background: #333; padding: 20px; border-radius: 0 0 10px 10px; text-align: center;">
                <p style="color: #999; margin: 0; font-size: 12px;">BabyWish - getbabywish.com</p>
            </div>
        </div>
        """
        
        params = {
            "von": SENDER_EMAIL,
            "to": [NOTIFICATION_EMAIL],
            „subject“: f“🎉 Νέος Συνδρομητής: {user_name} - €{amount:.2f}“,
            "html": html_content
        }
        
        # Führe das Sync-SDK in einem Thread aus, um FastAPI nicht blockierend zu halten.
        email_response = await asyncio.to_thread(resend.Emails.send, params)
        logging.info(f"Benachrichtigungs-E-Mail gesendet: {email_response}")
        Rückgabewert: True
        
    außer Ausnahme als e:
        logging.error(f"Fehler beim Senden der Benachrichtigungs-E-Mail: {str(e)}")
        return False

# Sternzeichendaten
ZODIAK_ZEICHEN = [
    {"name": "Widder", "symbol": "♈", "element": "Feuer", "start": (3, 21), "end": (4, 19)},
    {"name": "Taurus", "symbol": "♉", "element": "Earth", "start": (4, 20), "end": (5, 20)},
    {"name": "Zwillinge", "symbol": "♊", "element": "Luft", "start": (5, 21), "end": (6, 20)},
    {"name": "Krebs", "symbol": "♋", "element": "Wasser", "start": (6, 21), "end": (7, 22)},
    {"name": "Leo", "symbol": "♌", "element": "Feuer", "start": (7, 23), "end": (8, 22)},
    {"name": "Jungfrau", "symbol": "♍", "element": "Erde", "start": (8, 23), "end": (9, 22)},
    {"name": "Waage", "symbol": "♎", "element": "Luft", "start": (9, 23), "end": (10, 22)},
    {"name": "Scorpio", "symbol": "♏", "element": "Water", "start": (10, 23), "end": (11, 21)},
    {"name": "Schütze", "symbol": "♐", "element": "Feuer", "start": (11, 22), "end": (12, 21)},
    {"name": "Steinbock", "symbol": "♑", "element": "Erde", "start": (12, 22), "end": (1, 19)},
    {"name": "Wassermann", "symbol": "♒", "element": "Luft", "start": (1, 20), "end": (2, 18)},
    {"name": "Pisces", "symbol": "♓", "element": "Water", "start": (2, 19), "end": (3, 20)},
]

# Sternzeichennamen übersetzt nach Sprache
ZODIAC_TRANSLATIONS = {
    „en“: [„Widder“, „Stier“, „Zwillinge“, „Krebs“, „Löwe“, „Jungfrau“, „Waage“, „Skorpion“, „Schütze“, „Steinbock“, „Wassermann“, „Fische“],
    „de“: [„Widder“, „Stier“, „Zwillinge“, „Krebs“, „Löwe“, „Jungfrau“, „Waage“, „Skorpion“, „Schütze“, „Steinbock“, „Wassermann“, „Fische“],
    „el“: [„Κριός“, „Ταύρος“, „Δίδυμοι“, „Καρκίνος“, „Λέων“, „Παρθένος“, „Ζυγός“, „Σκορπιός“, „Τοξότης“, „Αιγόκερως“, „Υδροχόος“, „Ιχθύες“],
    „it“: [„Ariete“, „Toro“, „Gemelli“, „Cancro“, „Leone“, „Vergine“, „Bilancia“, „Scorpione“, „Sagittario“, „Capricorno“, „Acquario“, „Pesci“],
    „es“: [„Widder“, „Stier“, „Zwillinge“, „Krebs“, „Löwe“, „Jungfrau“, „Waage“, „Escorpio“, „Sagitario“, „Capricornio“, „Acuario“, „Piscis“],
    „fr“: [„Bélier“, „Taureau“, „Gémeaux“, „Cancer“, „Lion“, „Vierge“, „Balance“, „Scorpion“, „Sagittaire“, „Capricorne“, „Verseau“, „Poissons“],
    „pt“: [„Áries“, „Touro“, „Gêmeos“, „Câncer“, „Leão“, „Virgem“, „Libra“, „Escorpião“, „Sagitário“, „Capricórnio“, „Aquário“, „Peixes“],
    „ru“: [„Овен“, „Телец“, „Близнецы“, „Рак“, „Лев“, „Дева“, „Весы“, „Скорпион“, „Streлец“, „Козерог“, „Водолей“, „Рыбы“],
    „zh“: [“白羊座“, „金牛座“, „双子座“, „巨蟹座“, „狮子座“, „处女座“, „天秤座“, „天蝎座“, „射手座“, „摩羯座“, „水瓶座“, „双鱼座“],
    „ja“: [„牡羊座“, „牡牛座“, „双子座“, „蟹座“, „獅子座“, „乙女座“, „天秤座“, „蠍座“, „射手座“, „山羊座“, „水瓶座“, „魚座“],
    „ar“: [„الحمل“, „الثور“, „الجوزاء“, „السرطان“, „الأسد“, „العذراء“, „الميزان“, „العقرب“, „القوس“, „الجدي“, „الدلو“, „الحوت“],
    „hi“: [“मेष“, „वृषभ“, „मिथुन“, „कर्क“, „सिंह“, „कन्या“, „तुला“, „वृश्चिक“, „धनु“, „मकर“, „कुंभ“, „मीन“],
    „tr“: [„Koç“, „Boğa“, „İkizler“, „Yengeç“, „Aslan“, „Başak“, „Terazi“, „Akrep“, „Yay“, „Oğlak“, „Kova“, „Balık“],
    „pl“: [„Baran“, „Byk“, „Bliźnięta“, „Rak“, „Lew“, „Panna“, „Waga“, „Skorpion“, „Strzelec“, „Koziorożec“, „Wodnik“, „Ryby“],
    „cs“: [„Beran“, „Býk“, „Blíženci“, „Rak“, „Lev“, „Panna“, „Váhy“, „Štír“, „Střelec“, „Kozoroh“, „Vodnář“, „Ryby“],
    sr
    „sv“: [„Väduren“, „Oxen“, „Tvillingarna“, „Kräftan“, „Lejonet“, „Jungfrun“, „Vågen“, „Skorpionen“, „Skytten“, „Stenbocken“, „Vattumannen“, „Fiskarna“],
    „fa“: [„حمل“, „ثور“, „جوزا“, „سرطان“, „اسد“, „سنبله“, „میزان“, „عقرب“, „قوس“, „جدی“, „دلو“, „حوت“],
    „ko“: [„양자리“, „황소자리“, „쌍둥이자리“, „게자리“, „사자자리“, „처녀자리“, „천칭자리“, „전갈자리“, „궁수자리“, „염소자리“, „물병자리“, „물고기자리“],
}

# Chinesischer Tierkreis
CHINESISCHES ZODIAK = [
    {"name": "Rat", "symbol": "🐀", "years": [1924, 1936, 1948, 1960, 1972, 1984, 1996, 2008, 2020, 2032]},
    {"name": "Ochse", "symbol": "🐂", "years": [1925, 1937, 1949, 1961, 1973, 1985, 1997, 2009, 2021, 2033]},
    {"name": "Tiger", "symbol": "🐅", "years": [1926, 1938, 1950, 1962, 1974, 1986, 1998, 2010, 2022, 2034]},
    {"name": "Kaninchen", "symbol": "🐇", "years": [1927, 1939, 1951, 1963, 1975, 1987, 1999, 2011, 2023, 2035]},
    {"name": "Drache", "symbol": "🐉", "years": [1928, 1940, 1952, 1964, 1976, 1988, 2000, 2012, 2024, 2036]},
    {"name": "Schlange", "symbol": "🐍", "years": [1929, 1941, 1953, 1965, 1977, 1989, 2001, 2013, 2025, 2037]},
    {"name": "Pferd", "symbol": "🐴", "years": [1930, 1942, 1954, 1966, 1978, 1990, 2002, 2014, 2026, 2038]},
    {"name": "Goat", "symbol": "🐐", "years": [1931, 1943, 1955, 1967, 1979, 1991, 2003, 2015, 2027, 2039]},
    {"name": "Affe", "symbol": "🐒", "years": [1932, 1944, 1956, 1968, 1980, 1992, 2004, 2016, 2028, 2040]},
    {"name": "Rooster", "symbol": "🐓", "years": [1933, 1945, 1957, 1969, 1981, 1993, 2005, 2017, 2029, 2041]},
    {"name": "Hund", "symbol": "🐕", "years": [1934, 1946, 1958, 1970, 1982, 1994, 2006, 2018, 2030, 2042]},
    {"name": "Schwein", "symbol": "🐖", "years": [1935, 1947, 1959, 1971, 1983, 1995, 2007, 2019, 2031, 2043]},
]

# Chinesische Tierkreiszeichen-Übersetzungen
CHINESISCHE_ZODIAK_ÜBERSETZUNGEN = {
    "en": ["Ratte", "Ochse", "Tiger", "Kaninchen", "Drache", "Schlange", "Pferd", "Ziege", "Affe", "Hahn", "Hund", "Schwein"],
    „de“: [„Ratte“, „Ochse“, „Tiger“, „Hase“, „Drache“, „Schlange“, „Pferd“, „Ziege“, „Affe“, „Hahn“, „Hund“, „Schwein“],
    „el“: [„Αρουραίος“, „Βόδι“, „Τίγρης“, „Κουνέλι“, „Δράκος“, „Φίδι“, „Άλογο“, „Κατσίκα“, „Μαϊμού“, „Κόκορας“, „Σκύλος“, „Γουρούνι“],
    „zh“: [„鼠“, „牛“, „虎“, „兔“, „龙“, „蛇“, „马“, „羊“, „猴“, „鸡“, „狗“, „猪“],
    „ja“: [„子“, „丑“, „寅“, „卯“, „辰“, „巳“, „午“, „未“, „申“, „酉“, „戌“, „亥“],
    „ko“: [„쥐“, „소“, „호랑이“, „토끼“, „용“, „뱀“, „말“, „양“, „원숭이“, „닭“, „개“, „돼지“],
    „ru“: [„Крыса“, „Бык“, „Тигр“, „Кролик“, „Дракон“, „Змея“, „Лошадь“, „Коза“, „Обезьяна“, „Петух“, „Собака“, „Свинья“],
    „es“: [„Rata“, „Buey“, „Tigre“, „Conejo“, „Dragón“, „Serpiente“, „Caballo“, „Cabra“, „Mono“, „Gallo“, „Perro“, „Cerdo“],
    „fr“: [„Rat“, „Bœuf“, „Tigre“, „Lapin“, „Dragon“, „Serpent“, „Cheval“, „Chèvre“, „Singe“, „Coq“, „Chien“, „Cochon“],
    „it“: [„Topo“, „Bue“, „Tigre“, „Coniglio“, „Drago“, „Serpente“, „Cavallo“, „Capra“, „Scimmia“, „Gallo“, „Cane“, „Maiale“],
    „pt“: [„Rato“, „Boi“, „Tigre“, „Coelho“, „Dragão“, „Serpente“, „Cavalo“, „Cabra“, „Macaco“, „Galo“, „Cão“, „Porco“],
    „ar“: [„الفأر“, „الثور“, „النمر“, „الأرنب“, „التنين“, „الأفعى“, „الحصان“, „الماعز“, „القرد“, „الديك“, „الكلب“, „الخنزير“],
    „hi“: [“चूहा“, „बैल“, „बाघ“, „खरगोश“, „ड्रैगन“, „साँप“, „घोड़ा“, „बकरी“, „बंदर“, „मुर्गा“, „कुत्ता“, „सूअर“],
    „tr“: [„Fare“, „Öküz“, „Kaplan“, „Tavşan“, „Ejderha“, „Yılan“, „At“, „Keçi“, „Maymun“, „Horoz“, „Köpek“, „Domuz“],
}

# Lucky Elements Übersetzungen
LUCKY_COLORS_TRANSLATIONS = {
    "en": {"Red": "Rot", "Orange": "Orange", "Green": "Grün", "Pink": "Rosa", "Yellow": "Gelb",
           "Hellgrün": "Hellgrün", "Weiß": "Weiß", "Silber": "Silber", "Gold": "Gold",
           "Grau": "Grau", "Beige": "Beige", "Hellgelb": "Hellgelb", "Blau": "Blau",
           "Scharlachrot": "Scharlachrot", "Schwarz": "Schwarz", "Kastanienbraun": "Kastanienbraun", "Lila": "Lila",
           "Braun": "Braun", "Dunkelgrün": "Dunkelgrün", "Türkis": "Türkis"
           "Sea Green": "Sea Green", "Lavender": "Lavender"},
    "de": {"Red": "Rot", "Orange": "Orange", "Green": "Grün", "Pink": "Rosa", "Yellow": "Gelb",
           „Light Green“: „Hellgrün“, „White“: „Weiß“, „Silver“: „Silber“, „Gold“: „Gold“,
           "Grau": "Grau", "Beige": "Beige", "Hellgelb": "Blassgelb", "Blau": "Blau",
           „Scarlet“: „Scharlachrot“, „Black“: „Schwarz“, „Maroon“: „Kastanienbraun“, „Purple“: „Lila“,
           „Brown“: „Braun“, „Dark Green“: „Dunkelgrün“, „Turquoise“: „Türkis“,
           „Sea Green“: „Meergrün“, „Lavender“: „Lavendel“},
    „el“: {„Rot“: „Κόκκινο“, „Orange“: „Πορτοκαλί“, „Grün“: „Πράσινο“, „Rosa“: „Ροζ“, „Gelb“: „Κίτρινο“,
           „Hellgrün“: „Ανοιχτό Πράσινο“, „Weiß“: „Λευκό“, „Silber“: „Ασημί“, „Gold“: „Χρυσό“,
           „Grau“: „Schwarz“, „Beige“: „Schwarz“, „Hellgelb“: „Schwarz“, „Blau“: „Schwarz“,
           „Scarlet“: „Άλικο“, „Black“: „Μαύρο“, „Maroon“: „Καστανό“, „Purple“: „Μωβ“,
           „Braun“: „Καφέ“, „Dunkelgrün“: „Σκούρο Πράσινο“, „Türkis“: „Τιρκουάζ“,
           „Sea Green“: „Θαλασσί“, „Lavender“: „Λεβάντα“},
    „es“: {„Rot“: „Rojo“, „Orange“: „Naranja“, „Grün“: „Verde“, „Pink“: „Rosa“, „Gelb“: „Amarillo“,
           „Hellgrün“: „Verde Claro“, „Weiß“: „Blanco“, „Silber“: „Plata“, „Gold“: „Oro“,
           „Grau“: „Gris“, „Beige“: „Beige“, „Blassgelb“: „Amarillo Pálido“, „Blau“: „Azul“,
           „Scarlet“: „Escarlata“, „Black“: „Negro“, „Maroon“: „Granate“, „Purple“: „Púrpura“,
           „Braun“: „Marrón“, „Dunkelgrün“: „Verde Oscuro“, „Türkis“: „Turquesa“,
           „Sea Green“: „Verde Mar“, „Lavender“: „Lavanda“},
    "fr": {"Red": "Rouge", "Orange": "Orange", "Green": "Vert", "Pink": "Rose", "Yellow": "Jaune",
           "Hellgrün": "Vert Clair", "Weiß": "Blanc", "Silber": "Argent", "Gold": "Or",
           „Grau“: „Gris“, „Beige“: „Beige“, „Blassgelb“: „Jaune Pâle“, „Blau“: „Bleu“,
           „Scarlet“: „Écarlate“, „Black“: „Noir“, „Maroon“: „Bordeaux“, „Purple“: „Violet“,
           „Brown“: „Marron“, „Dark Green“: „Vert Foncé“, „Turquoise“: „Turquoise“,
           „Sea Green“: „Vert Mer“, „Lavender“: „Lavande“},
    „it“: {„Rot“: „Rosso“, „Orange“: „Arancione“, „Grün“: „Verde“, „Pink“: „Rosa“, „Gelb“: „Giallo“,
           „Hellgrün“: „Verde Chiaro“, „Weiß“: „Bianco“, „Silber“: „Argento“, „Gold“: „Oro“,
           „Grau“: „Grigio“, „Beige“: „Beige“, „Hellgelb“: „Giallo Pallido“, „Blau“: „Blu“,
           „Scarlet“: „Scarlatto“, „Black“: „Nero“, „Maroon“: „Bordeaux“, „Purple“: „Viola“,
           „Brown“: „Marrone“, „Dark Green“: „Verde Scuro“, „Turquoise“: „Turchese“,
           „Sea Green“: „Verde Mare“, „Lavender“: „Lavanda“},
    „ru“: {„Rot“: „Rot“, „Orange“: „Grün“, „Grün“: „Gelb“, „Rosa“: „Gelb“, „Gelb“: „Gelb“,
           „Hellgrün“: „Sterngrün“, „Weiß“: „Weiß“, „Silber“: „Schwarz“, „Gold“: „Schwarz“,
           „Grau“: „Schwarz“, „Beige“: „Weiß“, „Hellgelb“: „Schwarz“, „Blau“: „Schwarz“,
           „Scarlet“: „Алый“, „Black“: „Чёрный“, „Maroon“: „Бордовый“, „Purple“: „Фиолетовый“,
           „Braun“: „Korisch“, „Dunkelgrün“: „Schwarz“, „Türkis“: „Schwarz“,
           „Sea Green“: „Морской“, „Lavender“: „Лавандовый“},
    „zh“: {„Rot“: „红色“, „Orange“: „橙色“, „Grün“: „绿色“, „Pink“: „粉色“, „Gelb“: „黄色“,
           „Hellgrün“: „浅绿“, „Weiß“: „白色“, „Silber“: „银色“, „Gold“: „金色“,
           „Grau“: „灰色“, „Beige“: „米色“, „Hellgelb“: „淡黄“, „Blau“: „蓝色“,
           „Scarlet“: „猩红“, „Black“: „黑色“, „Maroon“: „栗色“, „Purple“: „紫色“,
           „Braun“: „棕色“, „Dunkelgrün“: „深绿“, „Türkis“: „青绿“,
           „Sea Green“: „海绿“, „Lavender“: „淡紫“},
    „ja“: {„Rot“: „赤“, „Orange“: „オレンジ“, „Grün“: „緑“, „Pink“: „ピンク“, „Gelb“: „黄色“,
           „Hellgrün“: „黄緑“, „Weiß“: „白“, „Silber“: „銀“, „Gold“: „金“,
           „Grau“: „灰色“, „Beige“: „ベージュ“, „Hellgelb“: „淡黄色“, „Blau“: „青“,
           „Scarlet“: „緋色“, „Black“: „黒“, „Maroon“: „栗色“, „Purple“: „紫“,
           „Braun“: „茶色“, „Dunkelgrün“: „深緑“, „Türkis“: „ターコイズ“,
           „Sea Green“: „シーグリーン“, „Lavender“: „ラベンダー“},
}

LUCKY_DAYS_TRANSLATIONS = {
    "en": {"Monday": "Monday", "Tuesday": "Tuesday", "Wednesday": "Wednesday", "Thursday": "Thursday",
           "Freitag": "Freitag", "Samstag": "Samstag", "Sonntag": "Sonntag"},
    „de“: {“Monday“: „Montag“, „Tuesday“: „Dienstag“, „Wednesday“: „Mittwoch“, „Thursday“: „Donnerstag“,
           „Freitag“: „Freitag“, „Samstag“: „Samstag“, „Sunday“: „Sonntag“},
    „el“: {„Montag“: „Δευτέρα“, „Dienstag“: „Τρίτη“, „Mittwoch“: „Τετάρτη“, „Donnerstag“: „Πέμπτη“,
           „Freitag“: „Παρασκευή“, „Samstag“: „Σάββατο“, „Sonntag“: „Κυριακή“},
    „es“: {„Montag“: „Lunes“, „Dienstag“: „Martes“, „Mittwoch“: „Miércoles“, „Donnerstag“: „Jueves“,
           „Freitag“: „Viernes“, „Samstag“: „Sábado“, „Sonntag“: „Domingo“},
    „fr“: {„Montag“: „Lundi“, „Dienstag“: „Mardi“, „Mittwoch“: „Mercredi“, „Donnerstag“: „Jeudi“,
           „Freitag“: „Vendredi“, „Samstag“: „Samedi“, „Sonntag“: „Dimanche“},
    „it“: {„Montag“: „Lunedì“, „Dienstag“: „Martedì“, „Mittwoch“: „Mercoledì“, „Donnerstag“: „Giovedì“,
           „Freitag“: „Venerdì“, „Samstag“: „Sabato“, „Sonntag“: „Domenica“},
    „ru“: {„Montag“: „Понедельник“, „Dienstag“: „Вторник“, „Mittwoch“: „Mittwoch“, „Donnerstag“: „Четверг“,
           „Freitag“: „Пятница“, „Samstag“: „Суббота“, „Sonntag“: „Воскресенье“},
    „zh“: {„Montag“: „星期一“, „Dienstag“: „星期二“, „Mittwoch“: „星期三“, „Donnerstag“: „星期四“,
           „Freitag“: „星期五“, „Samstag“: „星期六“, „Sonntag“: „星期日“},
    „ja“: {„Montag“: „月曜日“, „Dienstag“: „火曜日“, „Mittwoch“: „水曜日“, „Donnerstag“: „木曜日“,
           „Freitag“: „金曜日“, „Samstag“: „土曜日“, „Sonntag“: „日曜日“},
}

# Glückssteine ​​nach Sternzeichen
GLÜCKSGESTEINE = {
    "Widder": {"name": "Diamant", "symbol": "💎", "color": "#b9f2ff"},
    "Taurus": {"name": "Emerald", "symbol": "💚", "color": "#50C878"},
    "Gemini": {"name": "Pearl", "symbol": "🤍", "color": "#FDEEF4"},
    "Krebs": {"name": "Rubin", "symbol": "❤️", "color": "#E0115F"},
    "Leo": {"name": "Peridot", "symbol": "💛", "color": "#B4C424"},
    "Jungfrau": {"name": "Sapphire", "symbol": "💙", "color": "#0F52BA"},
    "Libra": {"name": "Opal", "symbol": "🌈", "color": "#A8C3BC"},
    "Scorpio": {"name": "Topaz", "symbol": "🧡", "color": "#FFC87C"},
    "Sagittarius": {"name": "Turquoise", "symbol": "💠", "color": "#40E0D0"},
    "Steinbock": {"name": "Granat", "symbol": "🔴", "color": "#733635"},
    "Wassermann": {"name": "Amethyst", "symbol": "💜", "color": "#9966CC"},
    "Pisces": {"name": "Aquamarin", "symbol": "🩵", "color": "#7FFFD4"},
}

EDELSTEIN_ÜBERSETZUNGEN = {
    "en": {"Diamond": "Diamant", "Emerald": "Emerald", "Pearl": "Perle", "Ruby": "Ruby",
           "Peridot": "Peridot", "Saphir": "Saphir", "Opal": "Opal", "Topas": "Topas"
           "Türkis": "Türkis", "Granat": "Granat", "Amethyst": "Amethyst", "Aquamarin": "Aquamarin"},
    "de": {"Diamond": "Diamant", "Emerald": "Smaragd", "Pearl": "Perle", "Ruby": "Rubin",
           „Peridot“: „Peridot“, „Sapphire“: „Saphir“, „Opal“: „Opal“, „Topaz“: „Topas“,
           „Turquoise“: „Türkis“, „Granat“: „Granat“, „Amethyst“: „Amethyst“, „Aquamarin“: „Aquamarin“},
    „el“: {„Diamond“: „Διαμάντι“, „Emerald“: „Σμαράγδι“, „Pearl“: „Μαργαριτάρι“, „Ruby“: „Ρουμπίνι“,
           „Peridot“: „Περίδοτο“, „Saphir“: „Ζαφείρι“, „Opal“: „Οπάλιο“, „Topas“: „Τοπάζι“,
           „Türkis“: „Τιρκουάζ“, „Granat“: „Γρανάτης“, „Amethyst“: „Αμέθυστος“, „Aquamarin“: „Ακουαμαρίνα“},
    „es“: {„Diamond“: „Diamante“, „Emerald“: „Esmeralda“, „Pearl“: „Perla“, „Ruby“: „Rubí“,
           „Peridot“: „Peridoto“, „Saphir“: „Zafiro“, „Opal“: „Ópalo“, „Topas“: „Topacio“,
           „Turquoise“: „Turquesa“, „Garnet“: „Granate“, „Amethyst“: „Amatista“, „Aquamarine“: „Aguamarina“},
    „fr“: {“Diamond“: „Diamant“, „Emerald“: „Émeraude“, „Pearl“: „Perle“, „Ruby“: „Rubis“,
           „Peridot“: „Péridot“, „Sapphire“: „Saphir“, „Opal“: „Opal“, „Topaz“: „Topaze“,
           „Turquoise“: „Turquoise“, „Granat“: „Grenat“, „Amethyst“: „Améthyste“, „Aquamarin“: „Aigue-marine“},
    "it": {"Diamond": "Diamante", "Emerald": "Smeraldo", "Pearl": "Perla", "Ruby": "Rubino",
           „Peridot“: „Peridoto“, „Saphir“: „Zaffiro“, „Opal“: „Opal“, „Topas“: „Topazio“,
           „Turquoise“: „Turchese“, „Garnet“: „Granato“, „Amethyst“: „Ametista“, „Aquamarine“: „Acquamarina“},
    "ru": {"Diamond": "Brilliant", "Emerald": "Изумруд", "Pearl": "Жемчуг", "Ruby": "Рубин",
           „Peridot“: „Peridot“, „Saphir“: „Sapfir“, „Opal“: „Opal“, „Topas“: „Topaz“,
           „Türkis“: „Бирюза“, „Granat“: „Гранат“, „Amethyst“: „АMETIST“, „Aquamarin“: „Аквамарин“},
    „zh“: {“Diamond“: „钻石“, „Emerald“: „祖母绿“, „Pearl“: „珍珠“, „Ruby“: „红宝石“,
           „Peridot“: „橄榄石“, „Saphir“: „蓝宝石“, „Opal“: „蛋白石“, „Topas“: „黄玉“,
           „Türkis“: „绿松石“, „Granat“: „石榴石“, „Amethyst“: „紫水晶“, „Aquamarin“: „海蓝宝石“},
    „ja“: {„Diamond“: „ダイヤモンド“, „Emerald“: „エメラルド“, „Pearl“: „真珠“, „Ruby“: „ルビー“,
           „Peridot“: „ペリドット“, „Saphir“: „サファイア“, „Opal“: „オパール“, „Topas“: „トパーズ“,
           „Turquoise“: „ターコイズ“, „Garnet“: „ガーネット“, „Amethyst“: „アメジスト“, „Aquamarine“: „アクアマリン“},
}

# Babyprodukte zum Einkaufen
BABYPRODUKTE = {
    "Edelstein": {
        "amazon_search": "Geburtssteinschmuck für Babys {Edelstein}",
        "ebay_search": "Baby {Edelstein} Anhänger Halskette"
    },
    "Tidiac": {
        "amazon_search": "Baby {Sternzeichen} Sternzeichen Geschenk",
        "ebay_search": "Babydecke mit Sternbildmotiven"
    },
    "Farbe": {
        "amazon_search": "Babykleidung {Farbe}",
        "ebay_search": "Baby-Outfit {Farbe}"
    }
}

def translate_lucky_color(color: str, lang: str) -> str:
    "Übersetze die Glücksfarbe in die Sprache des Benutzers"
    translations = LUCKY_COLORS_TRANSLATIONS.get(lang, LUCKY_COLORS_TRANSLATIONS["en"])
    return translations.get(color, color)

def translate_lucky_day(day: str, lang: str) -> str:
    "Übersetze Glückstag in die Sprache des Benutzers"
    translations = LUCKY_DAYS_TRANSLATIONS.get(lang, LUCKY_DAYS_TRANSLATIONS["en"])
    return translations.get(day, day)

def get_lucky_gemstone(zodiac_name: str, lang: str) -> dict:
    """Finde deinen Glücksstein für dein Sternzeichen mit Übersetzung""
    gemstone_data = LUCKY_GEMSTONES.get(zodiac_name, LUCKY_GEMSTONES["Aries"])
    Edelsteinname = Edelsteindaten["Name"]
    translations = GEMSTONE_TRANSLATIONS.get(lang, GEMSTONE_TRANSLATIONS["en"])
    
    zurückkehren {
        "name": translations.get(gemstone_name, gemstone_name),
        "english_name": gemstone_name,
        "symbol": gemstone_data["symbol"],
        "Farbe": Edelsteindaten["Farbe"]
    }

def get_shopping_links(zodiac_name: str, gemstone_name: str, color: str) -> dict:
    """Generiere Shopping-Links für Babyprodukte""
    # Suchanfragen erstellen
    gemstone_amazon = f"https://www.amazon.com/s?k=baby+{gemstone_name.lower()}+birthstone+gift"
    gemstone_ebay = f"https://www.ebay.com/sch/i.html?_nkw=baby+{gemstone_name.lower()}+jewelry"
    
    zodiac_amazon = f"https://www.amazon.com/s?k=baby+{zodiac_name.lower()}+zodiac+gift"
    zodiac_ebay = f"https://www.ebay.com/sch/i.html?_nkw=baby+{zodiac_name.lower()}+constellation"
    
    color_clean = color.split()[0].lower() # Nimm das erste Wort der Farbe
    clothes_amazon = f"https://www.amazon.com/s?k=baby+clothes+{color_clean}"
    clothes_ebay = f"https://www.ebay.com/sch/i.html?_nkw=baby+outfit+{color_clean}"
    
    zurückkehren {
        "Edelstein": {
            "amazon": gemstone_amazon,
            "ebay": gemstone_ebay
        },
        "Tidiac": {
            "amazon": Tierkreiszeichen_amazon,
            "ebay": Tierkreiszeichen_ebay
        },
        "Kleidung": {
            "amazon": clothes_amazon,
            "ebay": clothes_ebay
        }
    }

# Erweiterte Persönlichkeitsmerkmale (über 50 pro Element)
PERSÖNLICHKEITSMERKMALE = {
    "Feuer": [
        "leidenschaftlich", "energisch", "mutig", "abenteuerlustig", "selbstbewusst"
        "begeistert", "dynamisch", "mutig", "spontan", "optimistisch"
        "charismatisch", "inspirierend", "zielstrebig", "wettbewerbsorientiert", "ehrgeizig"
        "unabhängig", "kreativ", "herzlich", "großzügig", "spannend"
        "impulsiv", "furchtlos", "bahnbrechend", "handlungsorientiert", "direkt"
        "ausdrucksstark", "dramatisch", "magnetisch", "selbstbewusst", "lebhaft"
        "temperamentvoll", "intensiv", "feurig", "lebhaft", "kühne"
        "bahnbrechend", "motivierend", "strahlend", "kraftvoll", "unaufhaltsam"
        "freigeistig", "risikofreudig", "selbstsicher", "geborene Führungspersönlichkeit", "Trendsetter"
        „einflussreich“, „klug“, „brennendes Verlangen“, „Kriegergeist“, „Champion“
    ],
    "Erde": [
        "praktisch", "zuverlässig", "geduldig", "ehrgeizig", "bodenständig"
        "stabil", "fleißig", "beharrlich", "loyal", "vernünftig"
        "methodisch", "organisiert", "verantwortungsbewusst", "diszipliniert", "realistisch"
        "zuverlässig", "gründlich", "vorsichtig", "traditionell", "beständig"
        "materialistisch", "zielorientiert", "effizient", "produktiv", "konservativ"
        "pragmatisch", "entschlossen", "einfallsreich", "beharrlich", "strukturiert"
        "fokussiert", "engagiert", "zuverlässig", "solidarisch"
        "bodenständig", "systematisch", "akribisch", "berechnet", "dauerhaft"
        "Erbauer", "Versorger", "Beschützer", "Planer", "Erfolgsmenschen"
        "wohlstandsbewusst", "sicherheitsorientiert", "naturverbunden", "taktil", "sinnlich"
    ],
    "Luft": [
        "intellektuell", "kommunikativ", "neugierig", "sozial", "innovativ"
        "analytisch", "logisch", "geistreich", "vielseitig", "objektiv"
        "unvoreingenommen", "diplomatisch", "idealistisch", "progressiv", "erfinderisch"
        "schnell denkend", "wortgewandt", "klug", "anpassungsfähig", "rational"
        "aufgeschlossen", "theoretisch", "abstrakt", "konzeptionell", "visionär"
        "Netzwerken", "kooperativ", "überzeugend", "eloquent", "kultiviert"
        "kultiviert", "anspruchsvoll", "wissend", "gebildet", "nachdenklich"
        "Debattieren", "hinterfragen", "erforschen", "verbinden", "Brücken bauen"
        "vermitteln", "harmonisieren", "ausgleichen", "verhandeln", "erleichtern"
        „technikaffin“, „zukunftsorientiert“, „humanitär“, „freiheitsliebend“, „unabhängiger Denker“
    ],
    "Wasser": [
        "intuitiv", "emotional", "mitfühlend", "kreativ", "sensibel"
        "einfühlsam", "fürsorglich", "fantasievoll", "vertäumt", "geheimnisvoll"
        "psychisch", "heilend", "fürsorglich", "beschützend", "hingebungsvoll"
        "romantisch", "künstlerisch", "poetisch", "gefühlvoll", "tiefgründig"
        "reflektierend", "introspektiv", "meditativ", "spirituell", "mystisch"
        "einfühlsam", "verständnisvoll", "hilfsbereit", "sanft", "freundlich"
        "liebevoll", "zärtlich", "verständnisvoll", "empfänglich"
        "fließend", "anpassungsfähig", "veränderlich", "launisch", "komplex"
        "intensiv", "leidenschaftlich", "tiefgreifend", "transformativ", "regenerativ"
        "magisch", "bezaubernd", "jenseitig", "transzendent", "verbunden"
    ],
}

# Kompatibilitätsmatrix der Sternzeichen (Skala 1-10)
ZODIAC_COMPATIBILITY = {
    ("Widder", "Widder"): 7, ("Widder", "Stier"): 5, ("Widder", "Zwillinge"): 8, ("Widder", "Krebs"): 4,
    ("Widder", "Löwe"): 9, ("Widder", "Jungfrau"): 4, ("Widder", "Waage"): 7, ("Widder", "Skorpion"): 5,
    ("Widder", "Schütze"): 9, ("Widder", "Steinbock"): 5, ("Widder", "Wassermann"): 8, ("Widder", "Fische"): 5,
    
    ("Taurus", "Taurus"): 8, ("Taurus", "Gemini"): 4, ("Taurus", "Cancer"): 9, ("Taurus", "Leo"): 5,
    („Stier“, „Jungfrau“): 9, („Stier“, „Waage“): 6, („Stier“, „Skorpion“): 8, („Stier“, „Schütze“): 4,
    ("Stier", "Steinbock"): 10, ("Stier", "Wassermann"): 4, ("Stier", "Fische"): 8,
    
    („Zwillinge“, „Zwillinge“): 7, („Zwillinge“, „Krebs“): 5, („Zwillinge“, „Löwe“): 8, („Zwillinge“, „Jungfrau“): 5,
    („Zwillinge“, „Waage“): 9, („Zwillinge“, „Skorpion“): 4, („Zwillinge“, „Schütze“): 8, („Zwillinge“, „Steinbock“): 4,
    („Zwillinge“, „Wassermann“): 10, („Zwillinge“, „Fische“): 5,
    
    ("Krebs", "Krebs"): 8, ("Krebs", "Löwe"): 6, ("Krebs", "Jungfrau"): 8, ("Krebs", "Waage"): 5,
    ("Krebs", "Skorpion"): 10, ("Krebs", "Schütze"): 4, ("Krebs", "Steinbock"): 7, ("Krebs", "Wassermann"): 4,
    ("Krebs", "Fische"): 10,
    
    ("Leo", "Leo"): 7, ("Leo", "Virgo"): 5, ("Leo", "Libra"): 8, ("Leo", "Scorpio"): 6,
    ("Leo", "Sagittarius"): 10, ("Leo", "Capricorn"): 5, ("Leo", "Aquarius"): 7, ("Leo", "Pisces"): 5,
    
    ("Jungfrau", "Jungfrau"): 8, ("Jungfrau", "Waage"): 5, ("Jungfrau", "Skorpion"): 8, ("Jungfrau", "Schütze"): 4,
    ("Jungfrau", "Steinbock"): 9, ("Jungfrau", "Wassermann"): 4, ("Jungfrau", "Fische"): 7,
    
    ("Waage", "Waage"): 7, ("Waage", "Skorpion"): 6, ("Waage", "Schütze"): 8, ("Waage", "Steinbock"): 5,
    („Waage“, „Wassermann“): 9, („Waage“, „Fische“): 6,
    
    ("Skorpion", "Skorpion"): 8, ("Skorpion", "Schütze"): 5, ("Skorpion", "Steinbock"): 8,
    („Skorpion“, „Wassermann“): 5, („Skorpion“, „Fische“): 10,
    
    ("Schütze", "Schütze"): 8, ("Schütze", "Steinbock"): 5, ("Schütze", "Wassermann"): 9,
    ("Schütze", "Fische"): 6,
    
    ("Steinbock", "Steinbock"): 8, ("Steinbock", "Wassermann"): 5, ("Steinbock", "Fische"): 7,
    
    ("Wassermann", "Wassermann"): 8, ("Wassermann", "Fische"): 6,
    
    ("Fische", "Fische"): 8,
}

# Detaillierte Sternzeichenprofile
ZODIAC_PROFILES = {
    "Widder": {
        "Stärken": ["Führung", "Mut", "Begeisterung", "Selbstvertrauen", "Entschlossenheit"],
        "Schwächen": ["Ungeduld", "Impulsivität", "Aufbrausend", "Egoismus"],
        "lucky_numbers": [1, 8, 17],
        "lucky_colors": ["Rot", "Orange"],
        "lucky_day": "Dienstag",
        "Herrscherplanet": "Mars",
        "best_match": ["Leo", "Sagittarius", "Aquarius"],
        "Beschreibung": "Geborene Führungspersönlichkeit mit unbändiger Energie und Pioniergeist."
    },
    "Stier": {
        "Stärken": ["Zuverlässigkeit", "Geduld", "Praktikumsorientierung", "Hingabe", "Stabilität"],
        "Schwächen": ["Sturheit", "Besessenheit", "Kompromisslosigkeit", "Materialismus"],
        "lucky_numbers": [2, 6, 9, 12, 24],
        "lucky_colors": ["Grün", "Rosa"],
        "lucky_day": "Freitag",
        "Herrscherplanet": "Venus",
        "best_match": ["Krebs", "Jungfrau", "Steinbock"],
        "Beschreibung": "Eine bodenständige und zuverlässige Seele, die die Freuden des Lebens zu schätzen weiß."
    },
    "Zwillinge": {
        "Stärken": ["Anpassungsfähigkeit", "Vielseitigkeit", "Witz", "Intellekt", "Kommunikationsfähigkeit"],
        "Schwächen": ["Nervosität", "Unbeständigkeit", "Unentschlossenheit", "Oberflächlichkeit"],
        "lucky_numbers": [5, 7, 14, 23],
        "lucky_colors": ["Gelb", "Hellgrün"],
        "lucky_day": "Mittwoch",
        "Herrscherplanet": "Merkur",
        "best_match": ["Libra", "Aquarius", "Aries"],
        "Beschreibung": "Schlagfertiger Kommunikator mit unstillbarer Neugier."
    },
    "Krebs": {
        "Stärken": ["Loyalität", "Emotionale Tiefe", "Fürsorglichkeit", "Intuition", "Beschützerinstinkt"],
        "Schwächen": ["Launenhaftigkeit", "Überempfindlichkeit", "Anhänglichkeit", "Selbstmitleid"],
        "lucky_numbers": [2, 7, 11, 16, 20],
        "lucky_colors": ["Weiß", "Silber"],
        "lucky_day": "Montag",
        "Herrscherplanet": "Mond",
        "best_match": ["Scorpio", "Pisces", "Taurus"],
        "Beschreibung": "Eine tiefgründig fürsorgliche und intuitive Seele mit starken familiären Bindungen."
    },
    "Leo": {
        "Stärken": ["Kreativität", "Großzügigkeit", "Herzlichkeit", "Humor", "Führungsqualitäten"],
        "Schwächen": ["Arroganz", "Sturheit", "Egozentrik", "Unflexibilität"],
        "lucky_numbers": [1, 3, 10, 19],
        "lucky_colors": ["Gold", "Orange", "Gelb"],
        "lucky_day": "Sonntag",
        "Herrscherplanet": "Sonne",
        "best_match": ["Widder", "Schütze", "Zwillinge"],
        "Beschreibung": "Eine strahlende Persönlichkeit, die jeden Raum mit Charisma erfüllt."
    },
    "Jungfrau": {
        "Stärken": ["Analytisches Denken", "Detailgenauigkeit", "Zuverlässigkeit", "Praktisches Denken", "Hilfsbereitschaft"],
        "Schwächen": ["Überkritisch", "Sorgen", "Schüchternheit", "Perfektionismus"],
        "lucky_numbers": [5, 14, 15, 23, 32],
        "lucky_colors": ["Grau", "Beige", "Hellgelb"],
        "lucky_day": "Mittwoch",
        "Herrscherplanet": "Merkur",
        "best_match": ["Taurus", "Capricorn", "Cancer"],
        "Beschreibung": "Akribischer Perfektionist mit einem Herz für den Dienst am Nächsten."
    },
    "Waage": {
        "Stärken": ["Diplomatie", "Fairness", "Soziale Eleganz", "Charme", "Künstlerisches Gespür"],
        "Schwächen": ["Unentschlossenheit", "Konfliktvermeidung", "Selbstmitleid", "Gefallenwollen"],
        "lucky_numbers": [4, 6, 13, 15, 24],
        "lucky_colors": ["Pink", "Blue", "Green"],
        "lucky_day": "Freitag",
        "Herrscherplanet": "Venus",
        "best_match": ["Zwillinge", "Wassermann", "Löwe"],
        "Beschreibung": "Harmonischer Friedensstifter mit feinem ästhetischen Sinn."
    },
    "Skorpion": {
        "Stärken": ["Einfallsreichtum", "Leidenschaft", "Entschlossenheit", "Loyalität", "Tiefe"],
        "Schwächen": ["Eifersucht", "Verschlossenheit", "Groll", "Manipulationsfähigkeit"],
        "lucky_numbers": [8, 11, 18, 22],
        "lucky_colors": ["Scharlachrot", "Schwarz", "Kastanienbraun"],
        "lucky_day": "Dienstag",
        "Herrscherplanet": "Pluto",
        "best_match": ["Krebs", "Fische", "Jungfrau"],
        "Beschreibung": "Eine leidenschaftliche Seele mit transformativer Kraft."
    },
    "Schütze": {
        "Stärken": ["Optimismus", "Freiheitsliebe", "Ehrlichkeit", "Philosophie", "Abenteuerlust"],
        "Schwächen": ["Ungeduld", "Taktlosigkeit", "Ruhelosigkeit", "Überheblichkeit"],
        "lucky_numbers": [3, 7, 9, 12, 21],
        "lucky_colors": ["Lila", "Blau"],
        "lucky_day": "Donnerstag",
        "Herrscherplanet": "Jupiter",
        "best_match": ["Widder", "Löwe", "Wassermann"],
        "Beschreibung": "Freigeistiger Abenteurer auf der Suche nach Wahrheit und Sinn."
    },
    "Steinbock": {
        "Stärken": ["Disziplin", "Verantwortungsbewusstsein", "Selbstbeherrschung", "Ehrgeiz", "Management"],
        "Schwächen": ["Pessimismus", "Sturheit", "Starrheit", "Kälte"],
        "lucky_numbers": [4, 8, 13, 22],
        "lucky_colors": ["Braun", "Schwarz", "Dunkelgrün"],
        "lucky_day": "Samstag",
        "Herrscherplanet": "Saturn",
        "best_match": ["Taurus", "Virgo", "Pisces"],
        "Beschreibung": "Ein ehrgeiziger Leistungsträger, der nachhaltigen Erfolg aufbaut."
    },
    "Wassermann": {
        "Stärken": ["Unabhängigkeit", "Originalität", "Humanitarismus", "Vision", "Innovation"],
        "Schwächen": ["Emotionale Distanz", "Unberechenbarkeit", "Sturheit", "Abgeschiedenheit"],
        "lucky_numbers": [4, 7, 11, 22, 29],
        "lucky_colors": ["Blau", "Türkis"],
        "lucky_day": "Samstag",
        "Herrscherplanet": "Uranus",
        "best_match": ["Zwillinge", "Waage", "Schütze"],
        "Beschreibung": "Visionärer Humanist, seiner Zeit voraus."
    },
    "Fische": {
        "Stärken": ["Mitgefühl", "Intuition", "Kunstfertigkeit", "Sanftmut", "Weisheit"],
        "Schwächen": ["Fluchtverhalten", "Übermäßiges Vertrauen", "Opfermentalität", "Ängstlichkeit"],
        "lucky_numbers": [3, 9, 12, 15, 18, 24],
        "lucky_colors": ["Seegrün", "Lavendel"],
        "lucky_day": "Donnerstag",
        "Herrscherplanet": "Neptun",
        "best_match": ["Krebs", "Skorpion", "Steinbock"],
        "Beschreibung": "Tief intuitiver Träumer mit Verbindung zum Mystischen."
    },
}

KINDERNAMEN_NACH_REGION = {
    # ========== GRIECHENLAND & ZYPERN ==========
    "griechisch": {
        "Junge": ["Achilles", "Odysseus", "Herkules", "Perseus", "Theseus", "Ajax", "Hektor",
                "Apollo", "Ares", "Hermes", "Dionysos", "Orpheus", "Jason", "Alexander"
                „Leonidas“, „Perikles“, „Sokrates“, „Platon“, „Aristoteles“, „Archimedes“
                „Andreas“, „Nikolas“, „Dimitrios“, „Konstantinos“, „Theodoros“, „Stephanos“,
                „Georgios“, „Ioannis“, „Michail“, „Petros“, „Pavlos“, „Christos“, „Evangelos“],
        "Mädchen": ["Athena", "Artemis", "Aphrodite", "Hera", "Demeter", "Persephone", "Hestia",
                 "Helen", "Penelope", "Cassandra", "Elektra", "Ariadne", "Kalliope", "Clio"
                 „Sophia“, „Alexandra“, „Eleni“, „Maria“, „Aikaterini“, „Anastasia“, „Theodora“,
                 „Dimitra“, „Eirini“, „Paraskevi“, „Angeliki“, „Fotini“, „Vasiliki“, „Despina“],
        "Länder": ["GR", "CY"]
    },
    
    # ========== ITALIEN ==========
    "italienisch": {
        „boy“: [„Marco“, „Luca“, „Matteo“, „Leonardo“, „Alessandro“, „Lorenzo“, „Andrea“,
                „Giovanni“, „Francesco“, „Giuseppe“, „Antonio“, „Salvatore“, „Mario“,
                „Luigi“, „Pietro“, „Paolo“, „Stefano“, „Roberto“, „Carlo“, „Enrico“,
                „Fabio“, „Giancarlo“, „Massimo“, „Riccardo“, „Vincenzo“, „Domenico“],
        „Mädchen“: [„Giulia“, „Francesca“, „Chiara“, „Sara“, „Martina“, „Giorgia“, „Alessia“,
                 „Sofia“, „Aurora“, „Alice“, „Ginevra“, „Gaia“, „Valentina“, „Beatrice“,
                 „Elisa“, „Federica“, „Ilaria“, „Serena“, „Roberta“, „Paola“, „Bianca“],
        "Länder": ["IT", "SM", "VA"]
    },
    
    # ========== SPANIEN & LATEINAMERIKA ==========
    "Spanisch": {
        „boy“: [„Santiago“, „Mateo“, „Diego“, „Carlos“, „Miguel“, „Pablo“, „Alejandro“,
                „Fernando“, „Rafael“, „Antonio“, „Francisco“, „Jose“, „Luis“, „Juan“,
                „Andres“, „Sergio“, „Javier“, „Eduardo“, „Manuel“, „Ricardo“, „Enrique“],
        „Mädchen“: [„Isabella“, „Sofia“, „Valentina“, „Camila“, „Lucia“, „Elena“, „Maria“,
                 „Carmen“, „Rosa“, „Ana“, „Paula“, „Adriana“, „Gabriela“, „Daniela“,
                 „Alejandra“, „Fernanda“, „Natalia“, „Carolina“, „Mariana“, „Paloma“],
        „Länder“: [„ES“, „MX“, „AR“, „CO“, „PE“, „VE“, „CL“, „EC“, „GT“, „CU“, „BO“, „DO“, „HN“, „PY“, „SV“, „NI“, „CR“, „PA“, „UY“]
    },
    
    # ========== PORTUGAL & BRASILIEN ==========
    "portugiesisch": {
        „Junge“: [„Joao“, „Pedro“, „Tiago“, „Diogo“, „Rodrigo“, „Goncalo“, „Miguel“,
                „Rafael“, „Bruno“, „Hugo“, „Andre“, „Ricardo“, „Nuno“, „Vasco“,
                „Afonso“, „Duarte“, „Henrique“, „Luis“, „Filipe“, „Manuel“, „Rui“],
        „Mädchen“: [„Mariana“, „Beatriz“, „Ana“, „Ines“, „Leonor“, „Matilde“, „Carolina“,
                 „Sofia“, „Maria“, „Francisca“, „Margarida“, „Catarina“, „Rita“,
                 „Joana“, „Teresa“, „Clara“, „Madalena“, „Lara“, „Diana“, „Sara“],
        "Länder": ["PT", "BR", "AO", "MZ"]
    },
    
    # ========== FRANKREICH ==========
    "französisch": {
        "Junge": ["Louis", "Gabriel", "Raphael", "Jules", "Adam", "Lucas", "Leo",
                „Hugo“, „Arthur“, „Nathan“, „Ethan“, „Paul“, „Noel“, „Theo“,
                „Antoine“, „Baptiste“, „Clement“, „Maxime“, „Alexandre“, „Pierre“],
        "Mädchen": ["Emma", "Louise", "Alice", "Chloe", "Lea", "Manon", "Ines",
                 „Camille“, „Lola“, „Jade“, „Zoe“, „Juliette“, „Charlotte“, „Clemence“,
                 „Aurelie“, „Marine“, „Margot“, ​​„Anais“, „Elise“, „Amelie“],
        "Länder": ["FR", "BE", "CH", "LU", "MC", "CA"]
    },
    
    # ========== DEUTSCHLAND, ÖSTERREICH, SCHWEIZ ==========
    "Deutsch": {
        "Junge": ["Felix", "Leon", "Paul", "Lukas", "Jonas", "Maximilian", "Elias",
                „Noah“, „Ben“, „Finn“, „Luca“, „Emil“, „Anton“, „Oskar“, „Theo“,
                "Moritz", "Johann", "Friedrich", "Wilhelm", "Heinrich", "Karl"],
        „Mädchen“: [„Emma“, „Mia“, „Hannah“, „Sofia“, „Emilia“, „Anna“, „Marie“,
                 „Lina“, „Lea“, „Lena“, „Clara“, „Ella“, „Amelie“, „Luisa“,
                 "Johanna", "Frieda", "Charlotte", "Mathilda", "Greta", "Helena"],
        "Länder": ["DE", "AT", "CH", "LI"]
    },
    
    # ========== RUSSLAND & OSTSLAVISCH ==========
    "russisch": {
        „Junge“: [„Ivan“, „Dmitri“, „Alexei“, „Nikolai“, „Sergei“, „Vladimir“, „Boris“,
                „Fjodor“, „Mikhail“, „Pavel“, „Andrei“, „Juri“, „Oleg“, „Igor“,
                „Konstantin“, „Wassili“, „Grigori“, „Maxim“, „Roman“, „Stanislaw“],
        "Mädchen": ["Anastasia", "Natasha", "Tatiana", "Olga", "Svetlana", "Yelena",
                 „Irina“, „Marina“, „Ekaterina“, „Ludmila“, „Nadia“, „Vera“,
                 „Daria“, „Ksenia“, „Larisa“, „Galina“, „Tamara“, „Valentina“],
        "Länder": ["RU", "BY", "UA", "KZ"]
    },
    
    # ========== POLEN ==========
    "polnisch": {
        „Junge“: [„Jakub“, „Jan“, „Szymon“, „Filip“, „Aleksander“, „Franciszek“, „Mikołaj“,
                „Wojciech“, „Adam“, „Kacper“, „Michał“, „Mateusz“, „Bartek“, „Piotr“,
                „Tomasz“, „Krzysztof“, „Paweł“, „Marcin“, „Kamil“, „Dawid“],
        „Mädchen“: [„Zuzanna“, „Julia“, „Maja“, „Zofia“, „Hanna“, „Lena“, „Alicja“,
                 „Maria“, „Amelia“, „Oliwia“, „Wiktoria“, „Emilia“, „Aleksandra“,
                 „Natalia“, „Antonina“, „Gabriela“, „Agnieszka“, „Magdalena“, „Katarzyna“],
        "Länder": ["PL"]
    },
    
    # ========== TSCHECHISCHE REPUBLIK & SLOWAKEI ==========
    "tschechisch": {
        „boy“: [„Jakub“, „Jan“, „Tomas“, „Adam“, „Matej“, „Filip“, „Vojtech“,
                „Ondrej“, „Lukas“, „David“, „Martin“, „Petr“, „Daniel“, „Marek“,
                „Pavel“, „Jiri“, „Michal“, „Karel“, „Vaclav“, „Frantisek“],
        „Mädchen“: [„Eliska“, „Anna“, „Adela“, „Tereza“, „Natalie“, „Viktorie“, „Sofie“,
                 „Karolina“, „Barbora“, „Kristyna“, „Klara“, „Lucie“, „Katerina“,
                 „Marketa“, „Michaela“, „Petra“, „Veronika“, „Jana“, „Eva“],
        "Länder": ["CZ", "SK"]
    },
    
    # ========== SERBIEN, KROATIEN, BALKAN ==========
    "serbisch": {
        „boy“: [„Nikola“, „Stefan“, „Luka“, „Marko“, „Aleksandar“, „Milos“, „Dusan“,
                „Petar“, „Filip“, „Vuk“, „Nemanja“, „Uros“, „Djordje“, „Ivan“,
                „Bogdan“, „Miroslav“, „Radoslav“, „Svetoslav“, „Vladislav“, „Darko“],
        „Mädchen“: [„Ana“, „Mila“, „Sara“, „Mia“, „Marija“, „Jana“, „Teodora“,
                 „Milica“, „Jovana“, „Tamara“, „Katarina“, „Jelena“, „Natalija“,
                 „Dragana“, „Snezana“, „Mirjana“, „Biljana“, „Vesna“, „Ivana“],
        "Länder": ["RS", "HR", "BA", "ME", "MK", ​​"SI"]
    },
    
    # ========== SKANDINAVIEN ==========
    "skandinavisch": {
        „boy“: [„Erik“, „Lars“, „Olaf“, „Magnus“, „Sven“, „Anders“, „Björn“,
                „Leif“, „Thor“, „Axel“, „Oscar“, „Gustav“, „Henrik“, „Kristian“,
                „Nils“, „Frederik“, „Mikkel“, „Rasmus“, „Emil“, „Valdemar“],
        "Mädchen": ["Ingrid", "Astrid", "Freya", "Sigrid", "Helga", "Greta", "Elsa",
                 „Saga“, „Liv“, „Maja“, „Ebba“, „Wilma“, „Alma“, „Ella“,
                 „Freja“, „Signe“, „Thora“, „Solveig“, „Hedda“, „Eira“],
        "Länder": ["SE", "NO", "DK", "FI", "IS"]
    },
    
    # ========== GROSSBRITANNIEN & IRLAND ==========
    "Englisch": {
        "Junge": ["Oliver", "George", "Harry", "Noah", "Jack", "Leo", "Arthur",
                "Muhammad", "Oscar", "Charlie", "William", "James", "Henry", "Thomas"
                "Alexander", "Edward", "Sebastian", "Benjamin", "Lucas", "Theodore"],
        "Mädchen": ["Olivia", "Amelia", "Isla", "Ava", "Mia", "Grace", "Freya",
                 "Emily", "Sophie", "Lily", "Ella", "Florence", "Evelyn", "Ivy"
                 "Charlotte", "Willow", "Poppy", "Isabella", "Daisy", "Rosie"],
        "Länder": ["GB", "IE", "AU", "NZ"]
    },
    
    # ========== USA ==========
    "amerikanisch": {
        "Junge": ["Liam", "Noah", "Oliver", "James", "Elijah", "William", "Henry",
                "Lucas", "Benjamin", "Theodore", "Jack", "Levi", "Alexander", "Mason",
                "Ethan", "Jacob", "Michael", "Daniel", "Logan", "Jackson"],
        "Mädchen": ["Olivia", "Emma", "Charlotte", "Amelia", "Sophia", "Mia", "Isabella",
                 "Ava", "Evelyn", "Luna", "Harper", "Camila", "Sofia", "Scarlett"
                 "Elizabeth", "Eleanor", "Emily", "Chloe", "Mila", "Violet"],
        "Länder": ["USA"]
    },
    
    # ========== CHINA ==========
    "chinesisch": {
        „Junge“: [„Wei“, „Chen“, „Ming“, „Jian“, „Long“, „Feng“, „Lei“, „Hao“,
                „Jun“, „Tao“, „Yang“, „Zhi“, „Xiang“, „Cheng“, „Bo“, „Liang“,
                „Yong“, „Qiang“, „Gang“, „Hai“, „Wen“, „Jie“, „Hui“, „Peng“],
        „Mädchen“: [„Mei“, „Lin“, „Ying“, „Xiu“, „Lan“, „Hua“, „Jing“, „Fang“,
                 „Li“, „Yan“, „Yue“, „Qian“, „Xia“, „Hong“, „Juan“, „Min“,
                 „Na“, „Ping“, „Qing“, „Rong“, „Shan“, „Ting“, „Wei“, „Xiao“],
        "Länder": ["CN", "TW", "HK", "MO", "SG"]
    },
    
    # ========== JAPAN ==========
    "japanisch": {
        „boy“: [„Haruki“, „Takeshi“, „Kenji“, „Yuki“, „Ryu“, „Akira“, „Hiroshi“,
                „Kazuki“, „Daiki“, „Sota“, „Ren“, „Yuto“, „Kaito“, „Hayato“,
                „Kenta“, „Shota“, „Naoki“, „Ryota“, „Tatsuya“, „Masashi“],
        „Mädchen“: [„Sakura“, „Yuki“, „Hana“, „Akemi“, „Yui“, „Aiko“, „Emi“,
                 „Haruka“, „Hikari“, „Kaori“, „Keiko“, „Mai“, „Mika“, „Nana“,
                 „Rina“, „Saki“, „Tomoko“, „Yoko“, „Ayumi“, „Naomi“],
        "Länder": ["JP"]
    },
    
    # ========== KOREA ==========
    "koreanisch": {
        „Junge“: [„Min-jun“, „Seo-jun“, „Do-yun“, „Ye-jun“, „Si-woo“, „Ha-joon“, „Ji-ho“,
                „Jun-seo“, „Joo-won“, „Hyun-woo“, „Sung-min“, „Jin-woo“, „Tae-hyun“, „Woo-jin“],
        "Mädchen": ["Seo-yeon", "Ha-yoon", "Ji-woo", "Seo-yun", "Min-seo", "Chae-won", "Ye-eun",
                 „Ji-yoo“, „Yoo-na“, „Eun-bi“, „Ha-na“, „Su-bin“, „Ye-jin“, „Soo-yeon“],
        "Länder": ["KR"]
    },
    
    # ========== INDIEN ==========
    "indisch": {
        „Junge“: [„Arjun“, „Krishna“, „Ravi“, „Aditya“, „Vikram“, „Raj“, „Amit“,
                „Rahul“, „Sanjay“, „Deepak“, „Suresh“, „Rajesh“, „Anil“, „Vijay“,
                „Shiva“, „Ganesh“, „Vishnu“, „Karan“, „Rohan“, „Varun“],
        „Mädchen“: [„Priya“, „Ananya“, „Aisha“, „Devi“, „Lakshmi“, „Saraswati“, „Parvati“,
                 „Sita“, „Radha“, „Maya“, „Tara“, „Uma“, „Durga“, „Rani“,
                 „Sunita“, „Kavita“, „Anjali“, „Pooja“, „Neha“, „Meera“],
        "Länder": ["IN", "NP", "LK", "BD"]
    },
    
    # ========== ARABISCHE LÄNDER ==========
    "arabisch": {
        „Junge“: [„Muhammad“, „Ahmad“, „Ali“, „Hassan“, „Hussein“, „Omar“, „Khalid“,
                „Yusuf“, „Ibrahim“, „Ismail“, „Hamza“, „Bilal“, „Tariq“, „Salim“,
                „Karim“, „Jamal“, „Rashid“, „Samir“, „Faisal“, „Nasser“],
        „Mädchen“: [„Fatima“, „Aisha“, „Khadija“, „Maryam“, „Zahra“, „Zainab“, „Layla“,
                 „Noor“, „Amina“, „Sara“, „Hana“, „Yasmin“, „Rania“, „Dina“,
                 „Lina“, „Salma“, „Farida“, „Samira“, „Jamila“, „Amira“],
        „Länder“: [„SA“, „AE“, „QA“, „KW“, „BH“, „OM“, „EG“, „JO“, „LB“, „SY“, „IQ“, „YE“, „LY“, „TN“, „DZ“, „MA“]
    },
    
    # ========== TÜRKEI ==========
    "türkisch": {
        „Junge“: [„Yusuf“, „Eymen“, „Omer“, „Mustafa“, „Emir“, „Ali“, „Kerem“,
                „Ahmet“, „Mehmet“, „Can“, „Burak“, „Emre“, „Kaan“, „Efe“,
                „Baris“, „Deniz“, „Ozan“, „Umut“, „Selim“, „Arda“],
        „Mädchen“: [„Zeynep“, „Elif“, „Defne“, „Azra“, „Eylul“, „Nehir“, „Ecrin“,
                 „Asya“, „Mira“, „Ela“, „Ayse“, „Fatma“, „Esra“, „Beyza“,
                 „Merve“, „Selin“, „Ebru“, „Ceren“, „Gul“, „Naz“],
        "Länder": ["TR", "AZ"]
    },
    
    # ========== IRAN ==========
    "persisch": {
        "Junge": ["Darius", "Cyrus", "Xerxes", "Reza", "Ali", "Mohammad", "Amir",
                „Arash“, „Babak“, „Behnam“, „Dariush“, „Farhad“, „Hossein“, „Kamran“,
                „Kaveh“, „Mehdi“, „Nima“, „Omid“, „Parviz“, „Saeed“],
        "Mädchen": ["Roxana", "Shirin", "Zahra", "Maryam", "Fatima", "Narges", "Leila",
                 „Sara“, „Nazanin“, „Parisa“, „Mina“, „Neda“, „Samira“, „Setareh“,
                 „Laleh“, „Mahsa“, „Azar“, „Golnar“, „Pari“, „Yasaman“],
        „Länder“: [„IR“, „AF“, „TJ“]
    },
    
    # ========== ISRAEL ==========
    "hebräisch": {
        „boy“: [„David“, „Noam“, „Eitan“, „Uri“, „Yonatan“, „Itai“, „Omer“,
                „Ariel“, „Daniel“, „Yosef“, „Moshe“, „Adam“, „Lior“, „Nadav“,
                „Gal“, „Tal“, „Roi“, „Amit“, „Elad“, „Tomer“],
        "Mädchen": ["Tamar", "Noa", "Shira", "Maya", "Yael", "Adel", "Talia",
                 „Avigail“, „Naomi“, „Michal“, „Ruth“, „Hana“, „Miriam“, „Sarah“,
                 „Rivka“, „Leah“, „Rachel“, „Esther“, „Dina“, „Ayelet“],
        "Länder": ["IL"]
    },
    
    # ========== ÄGYPTEN ==========
    "ägyptisch": {
        "Junge": ["Ramses", "Tutanchamun", "Echnaton", "Amenhotep", "Thutmosis", "Seti",
                "Osiris", "Horus", "Anubis", "Ra", "Thoth", "Ptah", "Amun"
                "Omar", "Ahmed", "Mohamed", "Mahmoud", "Youssef", "Khaled"],
        „Mädchen“: [„Nofretete“, „Kleopatra“, „Isis“, „Hathor“, „Bastet“, „Sekhmet“,
                 „Nefertari“, „Ankhesenamun“, „Meritaten“, „Maat“, „Nut“,
                 „Fatma“, „Mariam“, „Nour“, „Salma“, „Yasmin“, „Hana“],
        "Länder": ["EG"]
    },
    
    # ========== HAWAII ==========
    "hawaiianisch": {
        „Junge“: [„Kai“, „Koa“, „Makoa“, „Keanu“, „Lani“, „Mana“, „Nalu“,
                „Kaimana“, „Keoni“, „Ikaika“, „Kalani“, „Kawika“, „Lono“, „Maui“],
        „Mädchen“: [„Leilani“, „Moana“, „Kaia“, „Nalani“, „Malia“, „Alana“, „Kalani“,
                 „Lani“, „Mahina“, „Miliani“, „Noelani“, „Pua“, „Keani“, „Haunani“],
        "Länder": ["US-HI"]
    },
    
    # ========== THAILAND ==========
    "thai": {
        „boy“: [„Somchai“, „Chai“, „Nat“, „Krit“, „Pong“, „Gun“, „Tong“,
                „Boon“, „Lek“, „Nong“, „Art“, „Bank“, „Golf“, „Pop“],
        „girl“: [„Mali“, „Ploy“, „Fern“, „Nong“, „Nan“, „Pim“, „Bua“,
                 „Dao“, „Jai“, „Joy“, „Mint“, „Noon“, „Prae“, „Fai“],
        "Länder": ["TH"]
    },
    
    # ========== VIETNAM ==========
    "vietnamesisch": {
        „boy“: [„An“, „Binh“, „Cuong“, „Duc“, „Hai“, „Hung“, „Khanh“,
                „Long“, „Minh“, „Nam“, „Phuc“, „Quang“, „Son“, „Tuan“],
        „Mädchen“: [„Anh“, „Bich“, „Chi“, „Dung“, „Hanh“, „Hoa“, „Lan“,
                 „Linh“, „Mai“, „Ngoc“, „Phuong“, „Thao“, „Trang“, „Van“],
        "Länder": ["VN"]
    },
    
    # ========== INDONESIEN ==========
    "indonesisch": {
        „Junge“: [„Agus“, „Budi“, „Dewa“, „Eka“, „Fajar“, „Gunawan“, „Hendra“,
                „Irwan“, „Joko“, „Kusuma“, „Lutfi“, „Made“, „Nyoman“, „Putu“],
        „Mädchen“: [„Ayu“, „Bunga“, „Citra“, „Dewi“, „Fitri“, „Gita“, „Indah“,
                 „Kartika“, „Lestari“, „Maya“, „Nadia“, „Putri“, „Ratna“, „Sri“],
        "Länder": ["ID"]
    },
    
    # ========== LATEINISCH / RÖMISCH (Standard für Europa) ==========
    "lateinisch": {
        „Junge“: [„Marcus“, „Julius“, „Augustus“, „Maximus“, „Lucius“, „Gaius“, „Titus“,
                „Aurelius“, „Cornelius“, „Claudius“, „Antonius“, „Octavius“, „Felix“,
                "Adrian", "Dominic", "Martin", "Patrick", "Victor", "Vincent"],
        "Mädchen": ["Aurora", "Diana", "Venus", "Juno", "Minerva", "Julia", "Livia",
                 „Claudia“, „Aurelia“, „Cornelia“, „Octavia“, „Valentina“, „Victoria“,
                 „Lucia“, „Cecilia“, „Camilla“, „Beatrix“, „Clara“, „Gloria“],
        "Länder": []
    },
    
    # ========== BUDDHISTISCH (Tibet, Myanmar usw.) ==========
    "buddhistisch": {
        „Junge“: [„Bodhi“, „Dharma“, „Siddhartha“, „Ashoka“, „Ananda“, „Tenzin“,
                „Lobsang“, „Jamyang“, „Thubten“, „Sonam“, „Dorje“, „Pema“, „Karma“],
        „Mädchen“: [„Tara“, „Maya“, „Padma“, „Drolma“, „Pema“, „Tenzin“, „Yangchen“,
                 „Dolma“, „Lhamo“, „Sangye“, „Chime“, „Dechen“, „Kunzang“],
        „Länder“: [„BT“, „MM“, „LA“, „KH“]
    },
}

# Ländercodes Regionen zuordnen
def get_region_for_country(country_code: str) -> str:
    """Ermittelt die Namensregion anhand des Ländercodes"""
    falls kein Ländercode:
        return "latin"
    
    Ländercode = Ländercode.upper()
    
    # Hawaii speziell prüfen (US-HI)
    if country_code == "US-HI":
        Rückgabe "hawaiianisch"
    
    für Region, Daten in CHILD_NAMES_BY_REGION.items():
        if country_code in data.get("countries", []):
            Rückkehrregion
    
    # Standard-Fallback basierend auf Kontinent/Region
    # Nicht aufgeführte europäische Länder -> lateinische Namen
    europäisch = ["AD", "AL", "AM", "AZ", "BY", "BG", "GE", "HU", "LT", "LV", "MD", "MT", "RO", "EE"]
    Wenn Ländercode europäisch ist:
        return "latin"
    
    return "latin" # Standardwert

def get_names_for_region(region: str, gender: str) -> list:
    "Namen für eine bestimmte Region und ein bestimmtes Geschlecht abrufen"
    falls Region in CHILD_NAMES_BY_REGION enthalten ist:
        return CHILD_NAMES_BY_REGION[region].get(gender, [])
    return CHILD_NAMES_BY_REGION["latin"].get(gender, [])

def get_chinese_zodiac(year: int) -> dict:
    "Ermittle dein chinesisches Tierkreiszeichen basierend auf dem Jahr"
    Das chinesische Neujahrsfest variiert, daher sind dies nur ungefähre Angaben.
    Index = (Jahr - 1924) % 12
    return CHINESE_ZODIAC[index]

def get_chinese_zodiac_translated(year: int, lang: str = "en") -> dict:
    """Chinesisches Tierkreiszeichen mit übersetztem Namen"""
    Tierkreiszeichen = get_chinese_zodiac(Jahr)
    index = CHINESE_ZODIAC.index(zodiac)
    translations = CHINESE_ZODIAC_TRANSLATIONS.get(lang, CHINESE_ZODIAC_TRANSLATIONS["en"])
    zurückkehren {
        "Name": Übersetzungen[Index],
        "english_name": zodiac["name"],
        "Symbol": Tierkreiszeichen["Symbol"]
    }

def get_zodiac_translated(sign_name: str, lang: str = "en") -> str:
    "Übersetzter Sternzeichenname"
    Sternzeichen = ["Widder", "Stier", "Zwillinge", "Krebs", "Löwe", "Jungfrau",
                  "Waage", "Skorpion", "Schütze", "Steinbock", "Wassermann", "Fische"]
    if sign_name in sign_names:
        index = sign_names.index(sign_name)
        translations = ZODIAC_TRANSLATIONS.get(lang, ZODIAC_TRANSLATIONS["en"])
        return translations[index]
    return sign_name

def get_zodiac_compatibility(sign1: str, sign2: str) -> int:
    """Kompatibilitätswert zwischen zwei Sternzeichen ermitteln (1-10)""
    # Prüfen Sie beide Reihenfolgen, da die Matrix möglicherweise nicht beide enthält.
    if (sign1, sign2) in ZODIAC_COMPATIBILITY:
        return ZODIAC_COMPATIBILITY[(sign1, sign2)]
    if (sign2, sign1) in ZODIAC_COMPATIBILITY:
        return ZODIAC_COMPATIBILITY[(sign2, sign1)]
    return 5 # Standard-Mittelwert

def get_parent_compatibility_analysis(parent1_sign: str, parent2_sign: str, lang: str = "en") -> dict:
    """Detaillierte Kompatibilitätsanalyse zwischen den Eltern""
    Score = get_zodiac_compatibility(parent1_sign, parent2_sign)
    
    # Profile abrufen
    profile1 = ZODIAC_PROFILES.get(parent1_sign, {})
    profile2 = ZODIAC_PROFILES.get(parent2_sign, {})
    
    # Kompatibilitätsgrad-Text
    Wenn die Punktzahl >= 9 ist:
        Niveau = "Perfekt"
        description_en = "Eine außergewöhnliche kosmische Verbindung! Eure Energien harmonieren wunderbar."
    elif score >= 7:
        Niveau = "Ausgezeichnet"
        description_en = "Eine starke und kompatible Partnerschaft mit großem Potenzial."
    elif score >= 5:
        Niveau = "Gut"
        description_en = "Eine ausgewogene Beziehung mit Raum für gemeinsames Wachstum."
    anders:
        Schwierigkeitsgrad = "Anspruchsvoll"
        description_en = "Unterschiedliche Energien, die sich durch Anstrengung ergänzen können."
    
    # Kompatibilitätsbeschreibungen übersetzen
    Beschreibungen = {
        "en": description_en,
        "de": {
            „Perfekt“: „Eine außergewöhnliche kosmische Verbindung! Eure Energien harmonieren wunderbar.“,
            „Ausgezeichnet“: „Eine starke und kompatible Verbindung mit großem Potenzial.“,
            „Gut“: „Eine Balance mit Raum für gemeinsames Wachstum.“,
            „Herausfordernd“: „Unterschiedliche Energien, die sich mit Mühe ergänzen können.“
        },
        "el": {
            „Perfekt“: „Das ist nicht der Fall! τέλεια.“,
            „Ausgezeichnet“: „Μια δυνατή και συμβατή ένωση με μεγάλο δυναμικό.“,
            „Gut“: „Μια ισορροπημένη σχέση με χώρο για κοινή ανάπτυξη.“,
            „Herausfordernd“: „Διαφοργ προσπάθεια.
        },
        "es": {
            „Perfekt“: „Eine außergewöhnliche kosmische Verbindung! Ihre Energie ist wunderbar.“,
            „Ausgezeichnet“: „Eine gute und kompatible Einheit mit großem Potenzial.“,
            „Gut“: „Eine ausgeglichene Beziehung mit Raum für gemeinsames Wachstum.“,
            „Herausfordernd“: „Unterschiedliche Energien, die sich mit dem Spiel ergänzen können.“
        },
        "fr": {
            „Perfekt“: „Eine außergewöhnliche kosmische Verbindung! Ihre Energien harmonisieren großartig.“,
            „Ausgezeichnet“: „Eine starke und kompatible Einheit mit großem Potenzial.“,
            „Gut“: „Eine ausgeglichene Beziehung zum Ort für ein großartiges Ensemble.“,
            „Herausfordernd“: „Unterschiedliche Energien können mit Anstrengung vollständig sein.“
        },
        "Es": {
            „Perfekt“: „Eine besondere kosmische Verbindung! Ihre Energie ist großartig.“,
            „Ausgezeichnet“: „Eine starke und kompatible Einheit mit großem Potenzial.“,
            „Gut“: „Eine ausgeglichene Beziehung mit dem Raum, um im Laufe der Zeit zu wachsen.“,
            „Herausfordernd“: „Vielfältige Energie, die vollständig im Spiel ist.“
        },
        "ru": {
            „Perfekt“: „Kosmetisch wirksam!
            „Ausgezeichnet“: „Sehr gutes und sicheres Ergebnis mit großem Potenzial.“,
            „Gut“: „Eine gute Lösung für die Sicherheit Ihres Zuhauses.“,
            „Herausfordernd“: „Eine Menge Energie, die Sie auf andere Weise nutzen können.“
        },
        "zh": {
            „Perfekt“: „非凡的宇宙连接！你们的能量完美和谐。“,
            „Ausgezeichnet“: „强大而兼容的结合，具有巨大的潜力。“,
            „Gut“: „平衡的关系，有共同成长的空间。“,
            „Herausfordernd“: „不同的能量，通过努力可以互补。“
        },
        "ja": {
            „Perfekt“: „素晴らしい宇宙的つながり！エネルギーが美しく調和しています。“,
            „Ausgezeichnet“: „大きな可能性を秘めた強力で相性の良い結合。“,
            „Gut“: „一緒に成長する余地のあるバランスの取れた関係。“,
            „Herausfordernd“: „努力すれば異なるエネルギー“.
        },
    }
    
    # Übersetzung der Beschreibung abrufen
    if lang in descriptions and isinstance(descriptions[lang], dict):
        final_description = descriptions[lang].get(level, description_en)
    anders:
        final_description = description_en
    
    zurückkehren {
        "Punktzahl": Punktzahl,
        "score_percentage": Punktzahl * 10,
        "Level": Level,
        "Beschreibung": final_description,
        "parent1_strengths": profile1.get("strengths", [])[:3],
        "parent2_strengths": profile2.get("strengths", [])[:3],
    }

def get_language_from_country(country_code: str) -> str:
    """Landescode dem Sprachcode zuordnen""
    country_to_lang = {
        "GR": "el", "CY": "el",
        „DE“: „de“, „AT“: „de“, „CH“: „de“,
        "IT": "es", "SM": "es",
        „ES“: „es“, „MX“: „es“, „AR“: „es“, „CO“: „es“, „PE“: „es“,
        "PT": "pt", "BR": "pt",
        „FR“: „fr“, „BE“: „fr“, „CA“: „fr“,
        "RU": "ru", "BY": "ru", "UA": "ru",
        „CN“: „zh“, „TW“: „zh“, „HK“: „zh“,
        "JP": "ja",
        "KR": "ko",
        "IN": "hi",
        „SA“: „ar“, „AE“: „ar“, „EG“: „ar“, „QA“: „ar“,
        "TR": "tr",
        "IR": "fa",
        "PL": "pl",
        "CZ": "cs", "SK": "cs",
        "RS": "sr", "HR": "sr",
        „SE“: „sv“, „NO“: „sv“, „DK“: „sv“,
        „US“: „en“, „GB“: „en“, „AU“: „en“, „NZ“: „en“,
    }
    return country_to_lang.get(country_code, "en")

def get_zodiac_sign(month: int, day: int) -> dict:
    Für die Anmeldung bei ZODIAC_SIGNS:
        start_month, start_day = sign["start"]
        end_month, end_day = sign["end"]
        
        if sign["name"] == "Capricorn":
            if (month == 12 and day >= 22) or (month == 1 and day <= 19):
                Rückzeichen
        elif (month == start_month and day >= start_day) or (month == end_month and day <= end_day):
            Rückzeichen
    return ZODIAC_SIGNS[0]

def calculate_numerology(date1: date, date2: date) -> int:
    total = sum(int(d) for d in date1.isoformat().replace("-", ""))
    total += sum(int(d) for d in date2.isoformat().replace("-", ""))
    solange die Gesamtzahl > 9 ist:
        total = sum(int(d) for d in str(total))
    Gesamtertrag

def predict_child(parent1_birthday: date, parent2_birthday: date, country_code: str = None) -> dict:
    seed = int(parent1_birthday.toordinal() * parent2_birthday.toordinal())
    random.seed(seed)
    
    numerology_number = calculate_numerology(parent1_birthday, parent2_birthday)
    Geschlecht = "Junge", wenn numerologische Zahl % 2 == 1, sonst "Mädchen"
    
    heute = datetime.now(timezone.utc).date()
    base_months = random.randint(9, 18)
    vorhergesagtes_Datum = Datum(
        heute.Jahr + (heute.Monat + Basismonate - 1) // 12,
        (today.month + base_months - 1) % 12 + 1,
        random.randint(1, 28)
    )
    
    # Sternzeichen herausfinden
    kind_zodiac = get_zodiac_sign(predicted_date.month, predicted_date.day)
    parent1_zodiac = get_zodiac_sign(parent1_birthday.month, parent1_birthday.day)
    parent2_zodiac = get_zodiac_sign(parent2_birthday.month , parent2_birthday.day)
    
    # Sprache aus dem Land abrufen
    lang = get_language_from_country(country_code) if country_code else "en"
    
    # Übersetzte Sternzeichennamen
    child_zodiac_translated = get_zodiac_translated(child_zodiac["name"], lang)
    parent1_zodiac_translated = get_zodiac_translated(parent1_zodiac["name"], lang)
    parent2_zodiac_translated = get_zodiac_translated(parent2_zodiac["name"], lang)
    
    # Chinesischer Tierkreis für das vorhergesagte Geburtsjahr
    chinese_zodiac = get_chinese_zodiac_translated(predicted_date.year, lang)
    parent1_chinese = get_chinese_zodiac_translated(parent1_birthday.year, lang)
    parent2_chinese = get_chinese_zodiac_translated(parent2_birthday.year, lang)
    
    # Erweiterte Persönlichkeitsmerkmale (8 Merkmale statt 5)
    Elemente = [parent1_zodiac["element"], parent2_zodiac["element"], child_zodiac["element"]]
    Merkmale = []
    für Element in Menge(Elemente):
        traits.extend(random.sample(PERSONALITY_TRAITS[element], 4))
    random.shuffle(traits)
    Merkmale = Merkmale[:8]
    
    # Namen basierend auf Land/Region abrufen
    region = get_region_for_country(country_code)
    names_list = get_names_for_region(region, gender)
    falls nicht names_list:
        names_list = CHILD_NAMES_BY_REGION["latin"].get(gender, ["Alex"])
    vorgeschlagener Name = Zufallsauswahl(Namensliste)
    
    # Analyse der Elternkompatibilität
    parent_compatibility = get_parent_compatibility_analysis(
        parent1_zodiac["name"],
        parent2_zodiac["name"],
        lang
    )
    
    # Sternzeichenprofil für Kind abrufen
    child_profile = ZODIAC_PROFILES.get(child_zodiac["name"], {})
    
    # Elementharmonie
    element_harmony = {
        ("Feuer", "Luft"): 90, ("Luft", "Feuer"): 90,
        ("Erde", "Wasser"): 85, ("Wasser", "Erde"): 85,
        ("Feuer", "Feuer"): 80, ("Luft", "Luft"): 80,
        ("Erde", "Erde"): 75, ("Wasser", "Wasser"): 75,
        ("Feuer", "Erde"): 60, ("Erde", "Feuer"): 60,
        ("Luft", "Wasser"): 55, ("Wasser", "Luft"): 55,
        ("Feuer", "Wasser"): 50, ("Wasser", "Feuer"): 50,
        ("Luft", "Erde"): 45, ("Erde", "Luft"): 45,
    }
    
    base_harmony = element_harmony.get(
        (parent1_zodiac["element"], parent2_zodiac["element"]), 70
    )
    cosmic_harmony = min(100, base_harmony + random.randint(-5, 15))
    
    # Glückselemente aus dem Tierkreisprofil mit Übersetzungen
    lucky_colors_en = child_profile.get("lucky_colors", ["Purple", "Gold"])
    lucky_numbers = child_profile.get("lucky_numbers", [numerology_number])
    lucky_day_en = child_profile.get("lucky_day", "Monday")
    
    # Farben und Tag übersetzen
    lucky_colors_translated = [translate_lucky_color(c, lang) for c in lucky_colors_en]
    lucky_day_translated = translate_lucky_day(lucky_day_en, lang)
    
    # Hol dir deinen Glücksstein
    lucky_gemstone = get_lucky_gemstone(child_zodiac["name"], lang)
    
    # Shopping-Links abrufen
    primary_color = lucky_colors_en[0] if lucky_colors_en else "Gold"
    shopping_links = get_shopping_links(
        Kind_Sternzeichen["Name"],
        lucky_gemstone["english_name"],
        Primärfarbe
    )
    
    zurückkehren {
        "predicted_birth_date": predicted_date.isoformat(),
        "vorhergesagtes_Geschlecht": Geschlecht,
        "Sternzeichen": {
            "name": child_zodiac["name"],
            "translated_name": child_zodiac_translated,
            "symbol": child_zodiac["symbol"],
            "element": child_zodiac["element"],
            "ruling_planet": child_profile.get("ruling_planet", "Unknown"),
            "description": child_profile.get("description", ""),
            "strengths": child_profile.get("strengths", []),
            "Schwächen": child_profile.get("Schwächen", []),
            "best_match": child_profile.get("best_match", [])
        },
        "chinese_zodiac": {
            "name": chinese_zodiac["name"],
            "english_name": chinese_zodiac["english_name"],
            "Symbol": chinese_zodiac["Symbol"]
        },
        "persönlichkeitsmerkmale": Merkmale,
        "suggested_name": proposed_name,
        "cosmic_harmony_score": cosmic_harmony,
        "parent1_zodiac": {
            "name": parent1_zodiac["name"],
            "translated_name": parent1_zodiac_translated,
            "symbol": parent1_zodiac["symbol"],
            "element": parent1_zodiac["element"],
            "chinese_zodiac": parent1_chinese
        },
        "parent2_zodiac": {
            "name": parent2_zodiac["name"],
            "translated_name": parent2_zodiac_translated,
            "symbol": parent2_zodiac["symbol"],
            "element": parent2_zodiac["element"],
            "chinese_zodiac": parent2_chinese
        },
        "parent_compatibility": parent_compatibility,
        "numerology_number": numerology_number,
        "lucky_elements": {
            "Farben": lucky_colors_translated,
            "colors_en": lucky_colors_en,
            "numbers": lucky_numbers,
            "Tag": lucky_day_translated,
            "day_en": lucky_day_en,
            "Edelstein": Glücksedelstein
        },
        "shopping_links": shopping_links,
        "Region": Region,
        "Sprache": lang
    }

# Pydantische Modelle
class UserCreate(BaseModel):
    E-Mail: str
    Passwort: str
    Name: str

class UserLogin(BaseModel):
    E-Mail: str
    Passwort: str

class UserResponse(BaseModel):
    user_id: str
    E-Mail: str
    Name: str
    Bild: Optional[str] = None
    has_active_subscription: bool = False
    prediction_used: bool = False

class PredictionRequest(BaseModel):
    parent1_birthday: Datum
    parent2_birthday: Datum
    Ländercode: Optional[str] = None

class PredictionResponse(BaseModel):
    id: str
    vorhergesagtes_Geburtsdatum: str
    vorhergesagtes_Geschlecht: str
    zodiac_sign: dict
    Persönlichkeitsmerkmale: Liste[str]
    vorgeschlagener_Name: str
    cosmic_harmony_score: int
    parent1_zodiac: dict
    parent2_zodiac: dict
    Numerologie-Zahl: int
    lucky_elements: dict
    shopping_links: Optional[dict] = None
    chinese_zodiac: Optional[dict] = None
    parent_compatibility: Optional[dict] = None
    region: Optional[str] = None
    Sprache: Optional[str] = None
    created_at: str

class CheckoutRequest(BaseModel):
    package_id: str
    origin_url: str

class PackageInfo(BaseModel):
    id: str
    Name: str
    Betrag: Gleitkomma
    duration_months: int

# Authentifizierungshelfer
async def get_current_user(request: Request) -> dict:
    # Probieren Sie zuerst den Keks
    session_token = request.cookies.get("session_token")
    
    # Versuchen Sie dann den Autorisierungsheader
    falls kein Sitzungstoken:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header.split(" ")[1]
    
    falls kein Sitzungstoken:
        raise HTTPException(status_code=401, detail="Nicht authentifiziert")
    
    # Sitzung suchen
    session_doc = await db.user_sessions.find_one(
        {"session_token": session_token},
        {"_id": 0}
    )
    
    falls nicht session_doc:
        raise HTTPException(status_code=401, detail="Ungültige Sitzung")
    
    # Ablaufdatum prüfen
    expires_at = session_doc.get("expires_at")
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Sitzung abgelaufen")
    
    # Benutzer abrufen
    user_doc = await db.users.find_one(
        {"user_id": session_doc["user_id"]},
        {"_id": 0}
    )
    
    falls nicht user_doc:
        raise HTTPException(status_code=401, detail="Benutzer nicht gefunden")
    
    # Abonnementstatus prüfen
    subscription = await db.subscriptions.find_one(
        {"user_id": user_doc["user_id"], "status": "aktiv"},
        {"_id": 0}
    )
    
    user_doc["has_active_subscription"] = subscription is not None
    user_doc["prediction_used"] = subscription.get("prediction_used", False) if subscription else False
    
    return user_doc

# ===================== AUTORISIERUNGSWEGE =====================

@api_router.post("/auth/register")
async def register(user_data: UserCreate, response: Response):
    # Prüfen, ob der Benutzer existiert
    existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    falls vorhanden:
        raise HTTPException(status_code=400, detail="E-Mail bereits registriert")
    
    # Hash-Passwort
    import hashlib
    password_hash = hashlib.sha256(user_data.password.encode()).hexdigest()
    
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    
    await db.users.insert_one({
        "user_id": Benutzer-ID,
        "E-Mail": user_data.email,
        "name": user_data.name,
        "password_hash": password_hash,
        "Bild": Keines,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    # Sitzung erstellen
    session_token = f"session_{uuid.uuid4().hex}"
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    
    await db.user_sessions.insert_one({
        "user_id": Benutzer-ID,
        "session_token": session_token,
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    response.set_cookie(
        Schlüssel="session_token",
        Wert=Sitzungstoken,
        httponly=True,
        secure=True,
        samesite="none",
        Pfad="/",
        max_age=7*24*60*60
    )
    
    zurückkehren {
        "user_id": Benutzer-ID,
        "E-Mail": user_data.email,
        "name": user_data.name,
        "has_active_subscription": False,
        "prediction_used": False
    }

@api_router.post("/auth/login")
async def login(user_data: UserLogin, response: Response):
    import hashlib
    password_hash = hashlib.sha256(user_data.password.encode()).hexdigest()
    
    user = await db.users.find_one(
        {"email": user_data.email, "password_hash": password_hash},
        {"_id": 0}
    )
    
    falls nicht Benutzer:
        raise HTTPException(status_code=401, detail="Ungültige Anmeldeinformationen")
    
    # Sitzung erstellen
    session_token = f"session_{uuid.uuid4().hex}"
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    
    await db.user_sessions.insert_one({
        "user_id": user["user_id"],
        "session_token": session_token,
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    response.set_cookie(
        Schlüssel="session_token",
        Wert=Sitzungstoken,
        httponly=True,
        secure=True,
        samesite="none",
        Pfad="/",
        max_age=7*24*60*60
    )
    
    # Abonnement prüfen
    subscription = await db.subscriptions.find_one(
        {"user_id": user["user_id"], "status": "aktiv"},
        {"_id": 0}
    )
    
    zurückkehren {
        "user_id": user["user_id"],
        "email": user["email"],
        "name": Benutzer["name"],
        "picture": user.get("picture"),
        "has_active_subscription": Abonnement ist nicht None,
        "prediction_used": subscription.get("prediction_used", False) if subscription else False
    }

@api_router.get("/auth/session")
async def google_auth_session(request: Request, response: Response):
    """Google OAuth-Sitzungsaustausch verwalten""
    session_id = request.headers.get("X-Session-ID")
    falls nicht session_id:
        raise HTTPException(status_code=400, detail="Keine Sitzungs-ID angegeben")
    
    # Austausch der session_id mit der Notfallauthentifizierung
    async mit httpx.AsyncClient() als Client:
        auth_response = await client.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": session_id}
        )
        
        if auth_response.status_code != 200:
            raise HTTPException(status_code=401, detail="Ungültige Sitzungs-ID")
        
        auth_data = auth_response.json()
    
    # Prüfen, ob der Benutzer existiert
    existing_user = await db.users.find_one({"email": auth_data["email"]}, {"_id": 0})
    
    falls ein Benutzer existiert:
        user_id = existing_user["user_id"]
        # Benutzerinformationen aktualisieren
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {
                "name": auth_data["name"],
                "picture": auth_data.get("picture")
            }}
        )
    anders:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        await db.users.insert_one({
            "user_id": Benutzer-ID,
            "email": auth_data["email"],
            "name": auth_data["name"],
            "picture": auth_data.get("picture"),
            "created_at": datetime.now(timezone.utc).isoformat()
        })
    
    # Sitzung erstellen
    session_token = auth_data.get("session_token") or f"session_{uuid.uuid4().hex}"
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    
    await db.user_sessions.insert_one({
        "user_id": Benutzer-ID,
        "session_token": session_token,
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    response.set_cookie(
        Schlüssel="session_token",
        Wert=Sitzungstoken,
        httponly=True,
        secure=True,
        samesite="none",
        Pfad="/",
        max_age=7*24*60*60
    )
    
    # Abonnement prüfen
    subscription = await db.subscriptions.find_one(
        {"user_id": Benutzer-ID, "status": "aktiv"},
        {"_id": 0}
    )
    
    zurückkehren {
        "user_id": Benutzer-ID,
        "email": auth_data["email"],
        "name": auth_data["name"],
        "picture": auth_data.get("picture"),
        "has_active_subscription": Abonnement ist nicht None,
        "prediction_used": subscription.get("prediction_used", False) if subscription else False
    }

@api_router.get("/auth/me")
async def get_me(user: dict = Depends(get_current_user)):
    zurückkehrender Benutzer

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    session_token = request.cookies.get("session_token")
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    
    response.delete_cookie(key="session_token", path="/")
    return {"message": "Erfolgreich abgemeldet"}

# ===================== ABONNEMENT-WEGE =====================

@api_router.get("/packages", response_model=List[PackageInfo])
async def get_packages():
    """Verfügbare Abonnementpakete ansehen""
    zurückkehren [
        PackageInfo(id=key, **value) for key, value in SUBSCRIPTION_PACKAGES.items()
    ]

@api_router.post("/checkout/create")
async def create_checkout(
    checkout_data: CheckoutRequest,
    Anfrage: Anfrage,
    Benutzer: dict = Depends(get_current_user)
):
    """Stripe-Checkout-Sitzung erstellen""
    Falls checkout_data.package_id nicht in SUBSCRIPTION_PACKAGES enthalten ist:
        raise HTTPException(status_code=400, detail="Ungültiges Paket")
    
    Paket = SUBSCRIPTION_PACKAGES[checkout_data.package_id]
    
    # URLs aus dem angegebenen Ursprung erstellen
    success_url = f"{checkout_data.origin_url}/payment-success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{checkout_data.origin_url}/subscribe"
    
    # Erstellen einer Checkout-Session mithilfe des offiziellen Stripe SDK
    # Mehrere Zahlungsmethoden für internationale Kunden aktivieren
    session = stripe.checkout.Session.create(
        payment_method_types=[
            "Karte", # Visa, Mastercard, Amex (+ Google Pay, Apple Pay automatisch)
            "paypal", # PayPal
            "sepa_debit", # SEPA-Lastschrift (Europa)
            "ideal", # iDEAL (Niederlande)
            "giropay", # Giropay (Deutschland)
            "p24", # Przelewy24 (Polen)
            „bancontact“, # Bancontact (Belgien)
        ],
        line_items=[{
            "price_data": {
                "Währung": "Euro",
                "product_data": {
                    "name": f"A BabyWish - {package['name']}",
                    "description": f"Abonnement {package['duration_months']} Monate"
                },
                "unit_amount": int(package["amount"] * 100), # Stripe verwendet Cent
            },
            "Menge": 1,
        }],
        Modus="Zahlung",
        success_url=success_url,
        cancel_url=cancel_url,
        Metadaten={
            "user_id": user["user_id"],
            "package_id": checkout_data.package_id,
            "duration_months": str(package["duration_months"])
        }
    )
    
    # Zahlungsdatensatz erstellen
    await db.payment_transactions.insert_one({
        "session_id": session.id,
        "user_id": user["user_id"],
        "package_id": checkout_data.package_id,
        "amount": package["amount"],
        "Währung": "Euro",
        "payment_status": "ausstehend",
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {"url": session.url, "session_id": session.id}

@api_router.get("/checkout/status/{session_id}")
async def get_checkout_status(
    session_id: str,
    Anfrage: Anfrage,
    Benutzer: dict = Depends(get_current_user)
):
    """Prüfen Sie den Zahlungsstatus und aktivieren Sie das Abonnement, falls bezahlt."""
    # Sitzung von Stripe abrufen
    session = stripe.checkout.Session.retrieve(session_id)
    
    payment_status = session.payment_status # "paid", "unpaid", or "no_payment_required"
    Status = Sitzungsstatus # "abgeschlossen", "abgelaufen", oder "offen"
    
    # Transaktion aktualisieren
    await db.payment_transactions.update_one(
        {"session_id": session_id},
        {"$set": {
            "payment_status": payment_status,
            "Status": Status,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    # Falls kostenpflichtig, Abonnement erstellen
    if payment_status == "bezahlt":
        # Prüfen, ob für diese Sitzung bereits ein Abonnement erstellt wurde
        existing_sub = await db.subscriptions.find_one(
            {"payment_session_id": session_id},
            {"_id": 0}
        )
        
        falls nicht vorhanden_sub:
            Metadaten = Sitzung.Metadaten
            package_id = metadata.get("package_id")
            duration_months = int(metadata.get("duration_months", 3))
            
            # Deaktivieren Sie alle bestehenden Abonnements
            await db.subscriptions.update_many(
                {"user_id": user["user_id"], "status": "aktiv"},
                {"$set": {"status": "replaced"}}
            )
            
            # Neues Abonnement erstellen
            expires_at = datetime.now(timezone.utc) + timedelta(days=duration_months * 30)
            subscription_id = f"sub_{uuid.uuid4().hex[:12]}"
            
            await db.subscriptions.insert_one({
                "subscription_id": subscription_id,
                "user_id": user["user_id"],
                "package_id": package_id,
                "payment_session_id": session_id,
                "Status": "aktiv",
                "prediction_used": False,
                "expires_at": expires_at.isoformat(),
                "created_at": datetime.now(timezone.utc).isoformat()
            })
            
            # E-Mail-Benachrichtigung an den Administrator senden
            package_info = SUBSCRIPTION_PACKAGES.get(package_id, {})
            await send_subscription_notification(
                user_email=user.get("email", "N/A"),
                user_name=user.get("name", user.get("email", "Unknown")),
                package_id=package_id,
                amount=package_info.get("amount", 0),
                Abonnement-ID=Abonnement-ID
            )
    
    zurückkehren {
        "Status": Status,
        "payment_status": payment_status,
        "amount_total": session.amount_total,
        "Währung": Sitzung.Währung
    }

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    """Stripe-Webhooks verarbeiten""
    body = await request.body()
    Signatur = request.headers.get("Stripe-Signatur")
    
    # Webhook-Geheimnis aus der Umgebungsvariablen abrufen (optional, aber für den Produktivbetrieb empfohlen)
    webhook_secret = os.environ.get('STRIPE_WEBHOOK_SECRET')
    
    versuchen:
        if webhook_secret:
            event = stripe.Webhook.construct_event(body, signature, webhook_secret)
        anders:
            # Ohne Webhook-Geheimnis wird das Ereignis einfach analysiert (weniger sicher)
            import json
            event = stripe.Event.construct_from(json.loads(body), stripe.api_key)
        
        # Behandelt das Ereignis checkout.session.completed
        if event.type == "checkout.session.completed":
            Sitzung = Ereignis.Datenobjekt
            
            if session.payment_status == "paid":
                # Transaktion aktualisieren
                await db.payment_transactions.update_one(
                    {"session_id": session.id},
                    {"$set": {
                        "payment_status": "bezahlt",
                        "updated_at": datetime.now(timezone.utc).isoformat()
                    }}
                )
        
        return {"status": "ok"}
    außer Ausnahme als e:
        logging.error(f"Webhook-Fehler: {e}")
        return {"status": "error", "message": str(e)}

# ===================== NAMENSVORSTELLUNG =====================

@api_router.get("/names/showcase")
async def get_names_showcase(request: Request):
    "Namen basierend auf dem Standort des Benutzers für die Showcase-Seite abrufen"
    # IP-Adresse und Land des Benutzers abrufen
    Ländercode = "US"
    country_name = "Vereinigte Staaten"
    
    # Versuche, das Land aus den Headern zu ermitteln (wird durch die Geolokalisierung festgelegt)
    forwarded_for = request.headers.get("x-forwarded-for", "")
    client_ip = forwarded_for.split(",")[0].strip() if forwarded_for else request.client.host
    
    # Land anhand der IP-Adresse mit ipapi ermitteln
    versuchen:
        async mit httpx.AsyncClient() als Client:
            response = await client.get(f"https://ipapi.co/{client_ip}/json/", timeout=5.0)
            if response.status_code == 200:
                data = response.json()
                country_code = data.get("country_code", "US")
                country_name = data.get("country_name", "United States")
    außer Ausnahme als e:
        logging.warning(f"Konnte den Geostandort nicht abrufen: {e}")
    
    # Region und Namen abrufen
    region = get_region_for_country(country_code)
    Jungennamen = get_names_for_region(region, "Junge")
    Mädchennamen = get_names_for_region(region, "Mädchen")
    
    # Maximal 12 Namen pro Gruppe, anschließend mischen, um Abwechslung zu gewährleisten
    random.shuffle(boy_names)
    random.shuffle(girl_names)
    
    zurückkehren {
        "boy_names": boy_names[:12],
        "girl_names": girl_names[:12],
        "Region": Region,
        "Land": Ländername,
        "country_code": Ländercode
    }

# ===================== VORHERSAGE-ROUTEN =====================

@api_router.get("/")
async def root():
    return {"message": "Babywish API"}

@api_router.post("/predict", response_model=dict)
async def create_prediction(
    request_data: PredictionRequest,
    Benutzer: dict = Depends(get_current_user)
):
    """Vorhersage erstellen – erfordert ein aktives Abonnement mit ungenutzten Vorhersagen
    HINWEIS: Vorhersagen werden als „ausstehend“ gespeichert und müssen vom Administrator genehmigt werden, bevor sie dem Benutzer angezeigt werden.
    """
    # Abonnement prüfen
    subscription = await db.subscriptions.find_one(
        {"user_id": user["user_id"], "status": "aktiv"},
        {"_id": 0}
    )
    
    Falls kein Abonnement besteht:
        raise HTTPException(
            Statuscode=403
            detail="Απαιτείται ενεργή συνδρομή για πρόβλεψη"
        )
    
    if subscription.get("prediction_used", False):
        raise HTTPException(
            Statuscode=403
            detail="Έχετε ήδη χρησιμοποιήσει την πρόβλεψή σας. Αγοράστε νέα συνδρομή."
        )
    
    # Ablaufdatum prüfen
    expires_at = subscription.get("expires_at")
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        await db.subscriptions.update_one(
            {"subscription_id": subscription["subscription_id"]},
            {"$set": {"status": "abgelaufen"}}
        )
        raise HTTPException(
            Statuscode=403
            detail="Η συνδρομή σας έχει λήξει. Αγοράστε νέα συνδρομή."
        )
    
    # Vorhersage erstellen (KI-Analyse)
    Vorhersage = predict_child(
        request_data.parent1_birthday,
        request_data.parent2_birthday,
        request_data.country_code
    )
    
    prediction_id = str(uuid.uuid4())
    created_at = datetime.now(timezone.utc).isoformat()
    
    # Benutzer-E-Mail für Benachrichtigungen abrufen
    user_doc = await db.users.find_one({"user_id": user["user_id"]}, {"_id": 0, "email": 1, "name": 1})
    user_email = user_doc.get("email", "") if user_doc else ""
    Benutzername = Benutzerdokument.get("Name", "") falls Benutzerdokument sonst ""
    
    # Speichervorhersage mit dem Status "Ausstehend" - erfordert Administratorgenehmigung
    doc = {
        "id": prediction_id,
        **Vorhersage,
        "user_id": user["user_id"],
        "user_email": user_email,
        "user_name": Benutzername,
        "parent1_birthday": request_data.parent1_birthday.isoformat(),
        "parent2_birthday": request_data.parent2_birthday.isoformat(),
        "created_at": created_at,
        "Status": "Ausstehend", # Genehmigung ausstehend
        "approved_at": Keine,
        "genehmigt von": Keine
    }
    await db.predictions.insert_one(doc)
    
    # Vorhersage als verwendet markieren
    await db.subscriptions.update_one(
        {"subscription_id": subscription["subscription_id"]},
        {"$set": {"prediction_used": True}}
    )
    
    # Gibt den Status "ausstehend" anstelle der tatsächlichen Vorhersage zurück.
    zurückkehren {
        "id": prediction_id,
        "Status": "ausstehend",
        „message“: „Sie haben Ihre E-Mail-Nachricht noch einmal gesendet! σας εντός 24 ωρών.“,
        "message_en": "Ihre Vorhersage wurde erfolgreich übermittelt! Sie erhalten das Ergebnis innerhalb von 24 Stunden per E-Mail."
        "created_at": created_at
    }

@api_router.get("/my-prediction")
async def get_my_prediction(user: dict = Depends(get_current_user)):
    "Genehmigte Vorhersage des Benutzers abrufen, falls vorhanden"
    # Zuerst prüfen, ob die Vorhersage genehmigt wurde
    prediction = await db.predictions.find_one(
        {"user_id": user["user_id"], "status": "approved"},
        {"_id": 0}
    )
    
    Vorhersage:
        Renditeprognose
    
    # Prüfen, ob eine Vorhersage aussteht
    pending = await db.predictions.find_one(
        {"user_id": user["user_id"], "status": "pending"},
        {"_id": 0, "id": 1, "status": 1, "created_at": 1}
    )
    
    falls ausstehend:
        zurückkehren {
            "id": pending.get("id"),
            "Status": "ausstehend",
            „message“: „Sie haben die E-Mail-Nachricht noch einmal gesendet σας σύντομα.",
            "message_en": "Ihre Vorhersage wird verarbeitet. Sie erhalten das Ergebnis in Kürze per E-Mail."
            "created_at": pending.get("created_at")
        }
    
    return None

@api_router.get("/my-predictions")
async def get_my_predictions(user: dict = Depends(get_current_user)):
    "Alle Vorhersagen für einen Benutzer abrufen (Verlauf) - nur die bestätigten"
    predictions = await db.predictions.find(
        {"user_id": user["user_id"], "status": "approved"},
        {"_id": 0}
    ).sort("created_at", -1).to_list(length=50)
    
    Renditeprognosen

# ===================== Genehmigung der Vorhersage durch die Verwaltung =====================

ADMIN_EMAILS = ["owner@getbabywish.com", "getbabywish@protonmail.com", "getbabywish@hotmail.com"]

async def get_admin_user(user: dict = Depends(get_current_user)):
    """Prüfen, ob der Benutzer Administratorrechte hat"""
    user_doc = await db.users.find_one({"user_id": user["user_id"]}, {"_id": 0, "email": 1})
    if not user_doc or user_doc.get("email") not in ADMIN_EMAILS:
        raise HTTPException(status_code=403, detail="Admin access required")
    zurückkehrender Benutzer

@api_router.get("/admin/pending-predictions")
async def get_pending_predictions(admin: dict = Depends(get_admin_user)):
    "Alle ausstehenden Vorhersagen zur Überprüfung durch den Administrator abrufen"
    predictions = await db.predictions.find(
        {"status": "pending"},
        {"_id": 0}
    ).sort("created_at", -1).to_list(length=100)
    
    Renditeprognosen

@api_router.get("/admin/all-predictions")
async def get_all_predictions(admin: dict = Depends(get_admin_user)):
    "Alle Vorhersagen für die Administratoransicht abrufen"
    predictions = await db.predictions.find(
        {},
        {"_id": 0}
    ).sort("created_at", -1).to_list(length=500)
    
    Renditeprognosen

@api_router.post("/admin/approve-prediction/{prediction_id}")
async def approve_prediction(prediction_id: str, admin: dict = Depends(get_admin_user)):
    "Eine ausstehende Vorhersage genehmigen und den Benutzer benachrichtigen"
    # Finde die Vorhersage
    prediction = await db.predictions.find_one(
        {"id": prediction_id},
        {"_id": 0}
    )
    
    wenn nicht Vorhersage:
        raise HTTPException(status_code=404, detail="Vorhersage nicht gefunden")
    
    if prediction.get("status") == "approved":
        raise HTTPException(status_code=400, detail="Vorhersage bereits genehmigt")
    
    # Status auf „Genehmigt“ aktualisieren
    approved_at = datetime.now(timezone.utc).isoformat()
    await db.predictions.update_one(
        {"id": prediction_id},
        {"$set": {
            "Status": "genehmigt",
            "approved_at": approved_at,
            "genehmigt von": admin["Benutzer-ID"]
        }}
    )
    
    # E-Mail-Benachrichtigung an den Benutzer senden
    user_email = prediction.get("user_email")
    Benutzername = prediction.get("Benutzername", "")
    Geschlecht = prediction.get("Geschlecht", "Unbekannt")
    vorgeschlagener_Name = Vorhersage.get("vorgeschlagener_Name", "")
    
    falls Benutzer-E-Mail:
        versuchen:
            E-Mail-Betreff = "🎉 Ihre A BabyWish-Vorhersage ist fertig!"
            email_html = f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #8b5cf6; text-align: center;">🎉 Ihre Vorhersage ist fertig!</h1>
                <p>Sehr geehrte/r {user_name or 'Parent'},</p>
                <p>Tolle Neuigkeiten! Die Vorhersage des Babygeschlechts wurde verarbeitet und ist jetzt verfügbar.</p>
                
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 15px; text-align: center; margin: 20px 0;">
                    <h2 style="color: white; margin: 0;">Vorhergesagtes Geschlecht: {gender}</h2>
                    <p style="color: white; margin: 10px 0;">Vorgeschlagener Name: {suggested_name}</p>
                </div>
                
                <p>Melden Sie sich in Ihrem Dashboard an, um die vollständige Vorhersage zu sehen, einschließlich:</p>
                <ul>
                    <li>Sternzeichen & Persönlichkeit</li>
                    <li>Glückselemente</li>
                    Und vieles mehr!
                </ul>
                
                <p style="text-align: center;">
                    <a href="https://getbabywish.com/dashboard" style="background: #8b5cf6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block;">Vollständige Vorhersage anzeigen</a>
                </p>
                
                <p style="color: #666; font-size: 12px; margin-top: 30px;">
                    Vielen Dank, dass Sie sich für A BabyWish entschieden haben!<br>
                    In Liebe, das A BabyWish Team 💜
                </p>
            </div>
            """
            
            await send_email_resend(user_email, email_subject, email_html)
        außer Ausnahme als e:
            print(f"Fehler beim Senden der Genehmigungs-E-Mail: {e}")
    
    zurückkehren {
        "Erfolg": Wahr,
        "Nachricht": f"Vorhersage genehmigt und Benutzer unter {user_email} benachrichtigt",
        "prediction_id": prediction_id,
        "approved_at": approved_at
    }

@api_router.post("/admin/reject-prediction/{prediction_id}")
async def reject_prediction(prediction_id: str, reason: str = "", admin: dict = Depends(get_admin_user)):
    """Vorhersage ablehnen (Rückerstattungsfall)""
    prediction = await db.predictions.find_one(
        {"id": prediction_id},
        {"_id": 0}
    )
    
    wenn nicht Vorhersage:
        raise HTTPException(status_code=404, detail="Vorhersage nicht gefunden")
    
    # Status auf „Abgelehnt“ aktualisieren
    await db.predictions.update_one(
        {"id": prediction_id},
        {"$set": {
            "Status": "abgelehnt",
            "rejected_at": datetime.now(timezone.utc).isoformat(),
            "rejected_by": admin["user_id"],
            "Ablehnungsgrund": Grund
        }}
    )
    
    zurückkehren {
        "Erfolg": Wahr,
        "Nachricht": "Vorhersage abgelehnt",
        "prediction_id": prediction_id
    }

# ===================== PROMO-ANTRÄGE =====================

Klasse PromoApplicationRequest(BaseModel):
    E-Mail: str
    offer_type: str # 'launch50' or 'freepass100'
    video_links: Liste[str]
    review_link: str
    social_platform: str # 'tiktok', 'facebook', 'instagram'

@api_router.post("/promo/apply")
async def submit_promo_application(request: PromoApplicationRequest):
    "Reichen Sie einen Aktionsantrag für 50 % oder 100 % Rabatt ein."
    
    # Angebotstyp prüfen
    if request.offer_type not in ['launch50', 'freepass100']:
        raise HTTPException(status_code=400, detail="Ungültiger Angebotstyp")
    
    # Videoanzahl überprüfen
    required_videos = 5 if request.offer_type == 'launch50' else 9
    if len(request.video_links) < required_videos:
        raise HTTPException(
            Statuscode=400
            detail = f
        )
    
    # Prüfen, ob bereits ein Antrag mit derselben E-Mail-Adresse vorliegt
    existierend = await db.promo_applications.find_one({
        "E-Mail": request.email.lower(),
        "Status": "Ausstehend"
    })
    
    falls vorhanden:
        raise HTTPException(
            Statuscode=400
            detail="Eine E-Mail senden"
        )
    
    # Anwendung erstellen
    Anwendung = {
        "id": str(uuid.uuid4()),
        "E-Mail": request.email.lower(),
        "offer_type": request.offer_type,
        "video_links": request.video_links,
        "review_link": request.review_link,
        "social_platform": request.social_platform,
        "Status": "Ausstehend", # ausstehend, genehmigt, abgelehnt
        "created_at": datetime.now(timezone.utc).isoformat(),
        "promo_code": Keine Angabe, # Wird nach Genehmigung festgelegt
        "reviewed_at": Keine Angabe,
        "reviewed_by": Keine Angabe
    }
    
    await db.promo_applications.insert_one(application)
    
    # Benachrichtigungs-E-Mail an Administrator senden
    versuchen:
        Rabatt = "50%" wenn request.offer_type == 'launch50' sonst "100%"
        resend.Emails.send({
            "von": f"Ein BabyWish <{SENDER_EMAIL}>",
            "to": [NOTIFICATION_EMAIL],
            „subject“: f“🎁 Νέα Αίτηση Προσφοράς {Rabatt}“,
            "html": f"""
            <h2>Νέα Αίτηση Προσφοράς</h2>
            <p><strong>E-Mail:</strong> {request.email}</p>
            <p><strong>Angebot:</strong> {discount} ({request.offer_type})</p>
            <p><strong>Einstellungen:</strong> {request.social_platform</p>
            <p><strong>Videolinks:</strong></p>
            <ul>
                {"".join(f'<li><a href="{link}">{link}</a></li>' for link in request.video_links)}
            </ul>
            <p><strong>Link zur Bewertung:</strong> <a href="{request.review_link}">{request.review_link}</a></p>
            <hr>
            <p>Neue Version des Admin-Dashboards.</p>
            """
        })
    außer Ausnahme als e:
        logging.error(f"Fehler beim Senden der Werbebenachrichtigungs-E-Mail: {e}")
    
    zurückkehren {
        "Erfolg": Wahr,
        „message“: „Das ist nicht der Fall!“,
        "application_id": application["id"]
    }

@api_router.get("/admin/promo-applications")
async def get_promo_applications(admin: dict = Depends(get_admin_user)):
    "Alle Werbeanträge zur Überprüfung durch den Administrator abrufen"
    applications = await db.promo_applications.find(
        {},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    return {"applications": applications}

@api_router.post("/admin/promo/approve/{application_id}")
async def approve_promo_application(
    application_id: str,
    Promo-Code: str = "",
    admin: dict = Depends(get_admin_user)
):
    "Genehmigen Sie einen Aktionsantrag und weisen Sie einen Stripe-Aktionscode zu."
    application = await db.promo_applications.find_one(
        {"id": application_id},
        {"_id": 0}
    )
    
    falls keine Bewerbung:
        raise HTTPException(status_code=404, detail="Anwendung nicht gefunden")
    
    if application["status"] != "pending":
        raise HTTPException(status_code=400, detail="Anwendung bereits verarbeitet")
    
    # Anwendung aktualisieren
    await db.promo_applications.update_one(
        {"id": application_id},
        {"$set": {
            "Status": "genehmigt",
            "promo_code": Promo-Code,
            "reviewed_at": datetime.now(timezone.utc).isoformat(),
            "reviewed_by": admin["user_id"]
        }}
    )
    
    # Bestätigungs-E-Mail an den Benutzer senden
    versuchen:
        Rabatt = "50%" wenn application["offer_type"] == 'launch50' sonst "100%"
        resend.Emails.send({
            "von": f"Ein BabyWish <{SENDER_EMAIL}>",
            "to": [application["email"]],
            „Betreff“: f“✅ Η Αίτησή σας Εγκρίθηκε! Κωδικός {Rabatt}“,
            "html": f"""
            <h2>🎉 Συγχαρητήρια!</h2>
            <p>Sie können {discount} sofort kaufen!</p>
            <p><strong>Die Antwort lautet:</strong></p>
            <div style="background: #f0f0f0; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 2px; margin: 20px 0;">
                {Aktionscode}
            </div>
            <p>Sie können Ihr Kind auf <a href="https://getbabywish.com">getbabywish.com</a></p> umstellen
            <p>Ein BabyWish! 💕</p>
            """
        })
    außer Ausnahme als e:
        logging.error(f"Fehler beim Senden der Genehmigungs-E-Mail für die Werbeaktion: {e}")
    
    zurückkehren {
        "Erfolg": Wahr,
        "Nachricht": "Antrag genehmigt",
        "application_id": application_id
    }

@api_router.post("/admin/promo/reject/{application_id}")
async def reject_promo_application(
    application_id: str,
    Grund: str = "",
    admin: dict = Depends(get_admin_user)
):
    """Eine Werbeaktion ablehnen""
    application = await db.promo_applications.find_one(
        {"id": application_id},
        {"_id": 0}
    )
    
    falls keine Bewerbung:
        raise HTTPException(status_code=404, detail="Anwendung nicht gefunden")
    
    await db.promo_applications.update_one(
        {"id": application_id},
        {"$set": {
            "Status": "abgelehnt",
            "rejection_reason": Grund,
            "reviewed_at": datetime.now(timezone.utc).isoformat(),
            "reviewed_by": admin["user_id"]
        }}
    )
    
    zurückkehren {
        "Erfolg": Wahr,
        "Nachricht": "Antrag abgelehnt",
        "application_id": application_id
    }

# Tägliche Horoskopbotschaften nach Sternzeichen, Element und Stimmung
HOROSKOP_VORLAGEN = {
    "Feuer": {
        "positiv": [
            „Deine Energie ist heute anziehend. Handle mutig, um deine Träume zu verwirklichen.“
            „Das Abenteuer ruft! Vertraue deinem Instinkt und nutze neue Möglichkeiten.“
            „Deine Leidenschaft entfacht alles um dich herum. Führe mit Zuversicht.“
            „Heute bietet aufregende Möglichkeiten. Dein Mut wird belohnt werden.“
            „Das Universum unterstützt deine Ambitionen. Verfolge deine Ziele!“
        ],
        "neutral": [
            „Halte dein Feuer mit Geduld im Gleichgewicht. Gut Ding will Weile haben.“
            „Konzentriere deine Energie auf das, was heute wirklich zählt.“
            „Dein Enthusiasmus ist inspirierend, aber teile dir deine Kräfte weise ein.“
            „Lenken Sie Ihre Leidenschaft in produktive Tätigkeiten um.“
            „Nehmen Sie sich Zeit zum Planen, bevor Sie heute handeln.“
        ],
        "herausfordernd": [
            "Beherrsche dein Temperament und denke nach, bevor du reagierst."
            „Entschleunige und berücksichtige die Sichtweisen anderer.“
            „Geduld ist deine heutige Lektion. Atme tief durch.“
            „Verwandle Frustration in kreative Energie.“
            „Ruhe dich aus und tanke neue Kraft für deinen feurigen Geist.“
        ]
    },
    "Erde": {
        "positiv": [
            „Ihre harte Arbeit zahlt sich aus. Sie können bald mit Belohnungen rechnen.“
            „Finanzielle Chancen zeichnen sich ab. Bleiben Sie realistisch.“
            „Ihre pragmatische Herangehensweise führt zum Erfolg. Vertrauen Sie Ihren Methoden.“
            „Stabilität und Wachstum gehören Ihnen. Genießen Sie Ihre Erfolge.“
            "Die Natur schenkt Ihnen heute Frieden und Klarheit."
        ],
        "neutral": [
            „Konzentrieren Sie sich heute darauf, ein solides Fundament zu schaffen.“
            „Kleine Schritte führen zu großen Erfolgen. Mach weiter.“
            „Erst die praktischen Angelegenheiten regeln, dann groß träumen.“
            „Ihre Zuverlässigkeit ist Ihre Stärke. Setzen Sie sie weise ein.“
            „Organisieren und planen Sie für den zukünftigen Erfolg.“
        ],
        "herausfordernd": [
            „Flexibilität ist heute gefragt. Passen Sie sich den Veränderungen an.“
            „Legt eure Sturheit ab und seid offen für neue Ideen.“
            „Materielle Sorgen können Sie belasten. Finden Sie die Balance.“
            Lass dich von Sorgen nicht aufhalten.
            „Manchmal ist der beste Weg nicht der sicherste.“
        ]
    },
    "Luft": {
        "positiv": [
            „Heute sprudeln die brillanten Ideen nur so aus dir heraus. Teile sie mit uns!“
            „Kommunikation schafft wunderbare Verbindungen.“
            „Deine intellektuellen Gaben leuchten. Drück dich frei aus.“
            „Soziale Kontakte bieten sich in Hülle und Fülle. Knüpfen Sie Kontakte und vernetzen Sie sich.“
            „Deine Neugier führt zu spannenden Entdeckungen.“
        ],
        "neutral": [
            „Verarbeite deine Gedanken, bevor du sie teilst.“
            „Geistige Aktivität mit Erdungspraktiken in Einklang bringen.“
            „Höre heute genauso gut zu, wie du sprichst.“
            „Ideen brauchen Taten, um Wirklichkeit zu werden.“
            „Konzentriere deine zerstreuten Gedanken auf das Wesentliche.“
        ],
        "herausfordernd": [
            „Zu viel Nachdenken schafft Hindernisse. Vertraue deinem Bauchgefühl.“
            „Erde dich, wenn du dich zerstreut fühlst.“
            „Nicht jede Idee muss weiterverfolgt werden.“
            „Entscheide dich für einen Weg anstatt für viele.“
            „Gönnen Sie Ihrem unruhigen Geist Ruhe durch Meditation.“
        ]
    },
    "Wasser": {
        "positiv": [
            „Deine Intuition ist heute besonders stark. Vertraue ihr.“
            „Tiefe emotionale Bindungen bringen Freude und Heilung.“
            „Kreative Inspiration fließt im Überfluss. Erschaffe!“
            „Dein Mitgefühl berührt Herzen und heilt Wunden.“
            „Träume enthalten wichtige Botschaften. Achte darauf.“
        ],
        "neutral": [
            „Achte auf deine Gefühle, ohne dich von ihnen beherrschen zu lassen.“
            „Setzen Sie gesunde Grenzen und bleiben Sie dabei fürsorglich.“
            „Das richtige Verhältnis zwischen Geben und Selbstfürsorge finden.“
            „Deine Sensibilität ist eine Gabe. Nutze sie weise.“
            „Reflektiere deine emotionalen Muster.“
        ],
        "herausfordernd": [
            „Nimm die Gefühle anderer nicht als deine eigenen auf.“
            "Schütze deine Energie vor Negativität."
            „Stelle dich schwierigen Gefühlen, anstatt ihnen zu entfliehen.“
            „Stimmungsschwankungen können dich herausfordern. Finde deine Mitte.“
            „Nicht alles erfordert eine emotionale Reaktion.“
        ]
    }
}

# Glücksaktivitäten nach Sternzeichen
GLÜCKSAKTIVITÄTEN = {
    "Widder": ["Sport", "Neue Projekte starten", "Führungsrollen"],
    "Stier": ["Gartenarbeit", "Kochen", "Finanzplanung"],
    "Gemini": ["Schreiben", "Soziale Kontakte pflegen", "etwas Neues lernen"],
    "Krebs": ["Aktivitäten zu Hause", "Familienzeit", "Kochen"],
    "Leo": ["kreative Künste", "darstellende Künste", "Führung"],
    "Jungfrau": ["organisieren", "Gesundheitsroutinen", "detaillierte Arbeit"],
    "Waage": ["Kunstverständnis", "Partnerschaften", "Dekoration"],
    "Scorpio": ["Forschung", "tiefgründige Gespräche", "Transformation"],
    "Schütze": ["Reisen", "Studium", "Abenteuer in der Natur"],
    "Steinbock": ["Karriereplanung", "Zielsetzung", "Klettern"],
    "Aquarius": ["Technologie", "Gruppenaktivitäten", "Innovationen"],
    "Fische": ["Meditation", "künstlerische Tätigkeiten", "anderen helfen"]
}

def get_daily_horoscope(zodiac_name: str, target_date: date = None) -> dict:
    "Erstelle ein tägliches Horoskop für dein Sternzeichen"
    falls target_date None ist:
        target_date = datetime.now(timezone.utc).date()
    
    # Deterministischen Startwert aus Datum und Tierkreiszeichen erstellen
    seed = int(target_date.toordinal() * hash(zodiac_name) % 10000)
    random.seed(seed)
    
    # Sternzeichendaten abrufen
    zodiac_data = next((z for z in ZODIAC_SIGNS if z["name"] == zodiac_name), ZODIAC_SIGNS[0])
    element = zodiac_data["element"]
    Profil = ZODIAC_PROFILES.get(zodiac_name, {})
    
    # Stimmung anhand der Datumsnumerologie bestimmen
    day_num = sum(int(d) for d in str(target_date.day))
    solange Tag_Nummer > 9:
        day_num = sum(int(d) for d in str(day_num))
    
    if day_num in [1, 3, 5, 9]:
        Stimmung = "positiv"
    elif day_num in [2, 6, 8]:
        Stimmung = "neutral"
    anders:
        Stimmung = "herausfordernd"
    
    # Horoskopnachricht erhalten
    templates = HOROSCOPE_TEMPLATES[element][mood]
    Nachricht = zufällige Auswahl(Vorlagen)
    
    # Erhalte Glücksgegenstände für den Tag
    Glückszahl = Zufallszahl.Zufallszahl(1, 99)
    Farben = profile.get("lucky_colors", ["Gold"])
    lucky_color = random.choice(colors)
    Aktivitäten = GLÜCKSAKTIVITÄTEN.get(zodiac_name, ["Ruhe und Reflexion"])
    lucky_activity = random.choice(activities)
    
    # Kompatibilität für den Tag berechnen
    compatible_signs = profile.get("best_match", ["Leo", "Sagittarius"])
    
    # Liebe, Karriere, Gesundheit (1-5 Sterne)
    love_score = random.randint(2, 5)
    Karriere-Score = random.randint(2, 5)
    health_score = random.randint(2, 5)
    
    # Gesamtpunktzahl
    Gesamtscore = round((Liebesscore + Karrierescore + Gesundheitsscore) / 3, 1)
    
    zurückkehren {
        "Sternzeichen": Sternzeichenname,
        "symbol": zodiac_data["symbol"],
        "Element": Element,
        "Datum": target_date.isoformat(),
        "Stimmung": Stimmung,
        "Nachricht": Nachricht,
        "lucky_number": lucky_number,
        "lucky_color": lucky_color,
        "lucky_activity": lucky_activity,
        "compatible_signs": compatible_signs[:2],
        "Scores": {
            "Liebe": Liebespunktzahl,
            "Karriere": Karriere-Score,
            "Gesundheit": Gesundheitsscore,
            "Gesamt": Gesamtpunktzahl
        }
    }

@api_router.get("/horoscope/daily/{zodiac}")
async def get_zodiac_daily_horoscope(zodiac: str):
    "Erhalten Sie Ihr tägliches Horoskop für Ihr Sternzeichen"
    zodiac_name = zodiac.capitalize()
    gültige_zeichen = [z["name"] für z in ZODIAC_SIGNS]
    
    Falls der Sternzeichenname nicht in gültigen Sternzeichen enthalten ist:
        raise HTTPException(status_code=400, detail=f"Ungültiges Sternzeichen. Muss eines der folgenden sein: {valid_signs}")
    
    Horoskop = get_daily_horoscope(zodiac_name)
    Rückkehrhoroskop

@api_router.get("/horoscope/all")
async def get_all_daily_horoscopes():
    "Erhalten Sie täglich Horoskope für alle Sternzeichen"
    Horoskope = []
    Für die Anmeldung bei ZODIAC_SIGNS:
        Horoskop = get_daily_horoscope(sign["name"])
        horoscopes.append(horoscope)
    Horoskope zurück

# ===================== ADMIN - LEAD DASHBOARD =====================

EIGENTÜMER-E-MAIL = "owner@getbabywish.com"

@api_router.get("/admin/lead-stats")
async def get_lead_stats():
    "Lead-Statistiken für das Dashboard abrufen"
    # Alle Leads abrufen
    leads = await db.leads.find({}).to_list(1000)
    total_leads = len(leads)
    
    # Alle Benutzer/Abonnements abrufen, um die Konversionen zu prüfen
    subscriptions = await db.subscriptions.find({"status": "active"}).to_list(1000)
    subscriber_emails = set()
    für Unterabonnements:
        user = await db.users.find_one({"user_id": sub["user_id"]})
        wenn Benutzer:
            subscriber_emails.add(user.get("email", "").lower())
    
    # Anzahl der Konversionen
    umgerechnet = 0
    by_source = {"Namen": 0, "Sternzeichen": 0, "Glück": 0, "Sonstige": 0}
    
    für Leads:
        email = lead.get("email", "").lower()
        Wenn die E-Mail-Adresse in subscriber_emails enthalten ist:
            umgerechnet += 1
            lead["converted"] = True
        anders:
            lead["converted"] = False
        
        # Nach Quelle kategorisieren
        source = (lead.get("feature_interest", "") + " " + lead.get("source", "")).lower()
        wenn „Name“ in der Quelle oder „όνομα“ in der Quelle:
            by_source["names"] += 1
        elif "zodiac" in source or "ζώδι" in source:
            by_source["zodiac"] += 1
        elif "lucky" in source or "τυχερ" in source:
            by_source["lucky"] += 1
        anders:
            by_source["other"] += 1
    
    # Umrechnungskurs berechnen
    Konversionsrate = round((konvertiert / Gesamtzahl_Leads * 100), 1) wenn Gesamtzahl_Leads > 0 sonst 0
    
    # Umrechnungen dieser Woche (vereinfacht)
    from datetime import timedelta
    week_ago = datetime.now(timezone.utc) - timedelta(days=7)
    converted_this_week = sum(1 for lead in leads if lead.get("converted") and
                              lead.get("created_at") und
                              (isinstance(lead["created_at"], datetime) and lead["created_at"] > week_ago))
    
    zurückkehren {
        "total_leads": total_leads,
        "konvertiert": konvertiert,
        "ausstehend": Gesamtleads - konvertiert,
        "Konversionsrate": Konversionsrate,
        "converted_this_week": converted_this_week,
        "by_source": by_source
    }

@api_router.get("/admin/leads")
async def get_all_leads():
    "Alle Leads für die Dashboard-Tabelle abrufen"
    leads = await db.leads.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    
    # Abonnenten-E-Mails für den Konversionsstatus abrufen
    subscriptions = await db.subscriptions.find({"status": "active"}).to_list(1000)
    subscriber_emails = set()
    für Unterabonnements:
        user = await db.users.find_one({"user_id": sub["user_id"]})
        wenn Benutzer:
            subscriber_emails.add(user.get("email", "").lower())
    
    # Mark konvertierte Leads
    für Leads:
        lead["converted"] = lead.get("email", "").lower() in subscriber_emails
        # Konvertiere Datum/Uhrzeit bei Bedarf in einen String.
        if isinstance(lead.get("created_at"), datetime):
            lead["created_at"] = lead["created_at"].isoformat()
    
    return {"leads": leads, "total": len(leads)}


# ===================== ANALYSE-DASHBOARD =====================

@api_router.get("/admin/analytics")
async def get_analytics_dashboard():
    "Erhalten Sie umfassende Analysen für das Admin-Dashboard"
    jetzt = datetime.now(timezone.utc)
    heute = jetzt.ersetzen(Stunde=0, Minute=0, Sekunde=0, Mikrosekunde=0)
    Woche_vorher = heute - Zeitdifferenz(Tage=7)
    Monat_vorher = heute - Zeitdifferenz(Tage=30)
    
    # === BENUTZERSTATISTIKEN ===
    total_users = await db.users.count_documents({})
    users_today = await db.users.count_documents({"created_at": {"$gte": today}})
    users_this_week = await db.users.count_documents({"created_at": {"$gte": week_ago}})
    users_this_month = await db.users.count_documents({"created_at": {"$gte": month_ago}})
    
    # === ABONNEMENTSTATISTIKEN ===
    active_subscriptions = await db.subscriptions.count_documents({"status": "active"})
    total_subscriptions = await db.subscriptions.count_documents({})
    
    # === ZAHLUNGSSTATISTIKEN ===
    payments = await db.payment_transactions.find({"payment_status": "paid"}).to_list(10000)
    Gesamterlös = Summe(p.get("Betrag", 0) für p in Zahlungen)
    
    # Zahlungen pro Paket
    Umsatz nach Paket = {"3_Monate": 0, "9_Monate": 0, "18_Monate": 0}
    payments_by_package = {"3_months": 0, "9_months": 0, "18_months": 0}
    
    für p in Zahlungen:
        pkg_id = p.get("package_id", "")
        amount = p.get("amount", 0)
        if pkg_id in revenue_by_package:
            Umsatz_nach_Paket[Paket-ID] += Betrag
            payments_by_package[pkg_id] += 1
    
    # Aktuelle Zahlungen (letzte 30 Tage)
    recent_payments = await db.payment_transactions.find({
        "payment_status": "bezahlt",
        "created_at": {"$gte": month_ago}
    }, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    revenue_this_month = sum(p.get("amount", 0) for p in recent_payments)
    
    # Wöchentliche Umsatzaufschlüsselung (letzte 7 Tage)
    tägliche_Einnahmen = []
    for i in range(7):
        Tagesstart = heute - Zeitdifferenz(Tage=i)
        Tagesende = Tagesstart + Zeitdifferenz(Tage=1)
        day_payments = await db.payment_transactions.find({
            "payment_status": "bezahlt",
            "created_at": {"$gte": Tagesstart, "$lt": Tagesende}
        }).to_list(100)
        daily_revenue.append({
            "Datum": day_start.strftime("%Y-%m-%d"),
            "Tag": day_start.strftime("%a"),
            "Einnahmen": sum(p.get("Betrag", 0) for p in day_payments),
            "count": len(day_payments)
        })
    daily_revenue.reverse()
    
    # === VORHERSAGESTATISTIKEN ===
    total_predictions = await db.predictions.count_documents({})
    predictions_today = await db.predictions.count_documents({"created_at": {"$gte": today}})
    
    # Geschlechterverteilung
    male_predictions = await db.predictions.count_documents({"gender": {"$in": ["boy", "Boy", "male", "Male", "Aγόρι"]}})
    female_predictions = await db.predictions.count_documents({"gender": {"$in": ["girl", "Girl", "female", "Female", "Κορίτσι"]}})
    
    # === LEADS-STATISTIKEN ===
    total_leads = await db.leads.count_documents({})
    leads_this_week = await db.leads.count_documents({"created_at": {"$gte": week_ago}})
    
    # === AKTUELLE AKTIVITÄTEN ===
    recent_users = await db.users.find({}, {"_id": 0, "password_hash": 0}).sort("created_at", -1).to_list(5)
    für Benutzer in recent_users:
        if isinstance(user.get("created_at"), datetime):
            user["created_at"] = user["created_at"].isoformat()
    
    # Formatieren Sie die letzten Zahlungen für die Anzeige
    für p in recent_payments[:10]:
        if isinstance(p.get("created_at"), datetime):
            p["created_at"] = p["created_at"].isoformat()
    
    zurückkehren {
        "Benutzer": {
            "total": total_users,
            "heute": Benutzer_heute,
            "this_week": users_this_week,
            "this_month": users_this_month
        },
        "Abonnements": {
            "aktiv": aktive_Abonnements,
            "total": Gesamtabonnements,
            "Konversionsrate": round((aktive_Abonnements / Gesamtzahl_Nutzer * 100), 1) wenn Gesamtzahl_Nutzer > 0 sonst 0
        },
        "Einnahmen": {
            "total": round(total_revenue, 2),
            "this_month": round(revenue_this_month, 2),
            "by_package": {k: round(v, 2) for k, v in revenue_by_package.items()},
            "täglich": Tagesumsatz
        },
        "Zahlungen": {
            "total_count": len(payments),
            "by_package": payments_by_package,
            "recent": recent_payments[:10]
        },
        "Vorhersagen": {
            "total": total_predictions,
            "heute": Vorhersagen_heute,
            "Geschlechterverteilung": {
                "männlich": männliche_Vorhersagen,
                "weiblich": weibliche_Vorhersagen
            }
        },
        "leads": {
            "total": total_leads,
            "this_week": leads_this_week
        },
        "recent_users": recent_users
    }



# ===================== KUNDENSTIMMEN =====================

class TestimonialRequest(BaseModel):
    Bewertung: int = Feld(..., ge=1, le=5)
    text: Optional[str] = None
    prediction_correct: Optional[str] = None # 'richtig', 'falsch', 'ja', 'nein'
    predicted_gender: Optional[str] = None

# Rückerstattungsanforderungsmodell und Endpunkt
class RefundRequest(BaseModel):
    E-Mail: str
    Grund: str

@api_router.post("/refund-request")
async def submit_refund_request(request: RefundRequest):
    "Returnantrag einreichen"
    Rückerstattung = {
        "refund_id": f"refund_{uuid.uuid4().hex[:12]}",
        "E-Mail": request.email,
        "Grund": Anfrage.Grund,
        "Status": "Ausstehend", # ausstehend, genehmigt, abgelehnt
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    # In Datenbank speichern
    await db.refund_requests.insert_one(refund)
    
    # Benachrichtigungs-E-Mail an Administrator senden
    versuchen:
        html_content = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #ef4444 0%, #f97316 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0;">💰 Neue Rückerstattungsanfrage</h1>
            </div>
            
            <div style="background: #f9f9f9; padding: 30px; border: 1px solid #ddd;">
                <p><strong>E-Mail:</strong> {request.email}</p>
                <p><strong>Grund:</strong></p>
                <p style="background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #ef4444;">
                    {request.reason}
                </p>
                <p><strong>Rückerstattungs-ID:</strong> {refund['refund_id']}</p>
                <p><strong>Datum:</strong> {refund['created_at']}</p>
            </div>
            
            <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
                Bitte prüfen Sie diese Anfrage und antworten Sie innerhalb von 48 Stunden.
            </div>
        </div>
        """
        
        sender_email = os.environ.get('SENDER_EMAIL', 'noreply@getbabywish.com')
        admin_email = os.environ.get('ADMIN_EMAIL', 'getbabywish@protonmail.com')
        
        resend.api_key = os.environ.get('RESEND_API_KEY')
        if resend.api_key:
            resend.Emails.send({
                "von": sender_email,
                "an": admin_email,
                "Betreff": f"💰 Rückerstattungsantrag von {request.email}",
                "html": html_content
            })
    außer Ausnahme als e:
        logger.error(f"Fehler beim Senden der Rückerstattungsbenachrichtigungs-E-Mail: {e}")
    
    return {"success": True, "refund_id": refund['refund_id'], "message": "Rückerstattungsanfrage erfolgreich übermittelt"}



@api_router.post("/testimonial")
async def submit_testimonial(request: TestimonialRequest, user: dict = Depends(get_current_user)):
    "Reichen Sie eine Kundenmeinung/Rezension ein"
    Testimonial = {
        "testimonial_id": f"test_{uuid.uuid4().hex[:12]}",
        "user_id": user["user_id"],
        "user_name": user.get("name", "Anonymous"),
        "Bewertung": Anfrage.Bewertung,
        "text": request.text,
        "prediction_correct": request.prediction_correct,
        "predicted_gender": request.predicted_gender,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "genehmigt": Falsch # Der Administrator muss dies genehmigen, bevor es öffentlich angezeigt wird
    }
    
    await db.testimonials.insert_one(testimonial)
    
    # Benachrichtigungs-E-Mail senden
    versuchen:
        correct_text = "✅ Richtig!" if request.prediction_correct == 'correct' else "❌ Falsch" if request.prediction_correct == 'wrong' else "⏳ Noch nicht geboren"
        
        html_content = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0;">⭐ Neue Kundenmeinung!</h1>
            </div>
            
            <div style="background: #f9f9f9; padding: 30px; border: 1px solid #ddd;">
                <h2 style="color: #333; margin-top: 0;">Bewertung: {"⭐" * request.rating}</h2>
                
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Benutzer:</td>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">{user.get("name", "Anonymous")}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Vorhersageergebnis:</td>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">{correct_text}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Nachricht:</td>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">{request.text or "No message"}</td>
                    </tr>
                </table>
            </div>
        </div>
        """
        
        params = {
            "von": SENDER_EMAIL,
            "to": [NOTIFICATION_EMAIL],
            "subject": f"⭐ Neue Bewertung: {'⭐' * request.rating} - {correct_text}",
            "html": html_content
        }
        
        await asyncio.to_thread(resend.Emails.send, params)
    außer Ausnahme als e:
        logging.error(f"Fehler beim Senden der Testimonial-Benachrichtigung: {e}")
    
    return {"success": True, "message": "Vielen Dank für Ihr Feedback!"}

@api_router.get("/testimonials")
async def get_approved_testimonials():
    "Genehmigte Kundenstimmen zur Anzeige einholen"
    Testimonials = await db.testimonials.find(
        {"genehmigt": Wahr},
        {"_id": 0, "user_id": 0}
    ).sort("created_at", -1).limit(20).to_list(length=20)
    
    Kundenmeinungen zurück

# ===================== INTERAKTIVES QUIZ - KI-PERSÖNLICHKEITSVORHERSAGE =====================

class QuizRequest(BaseModel):
    Muttergeburtstag: str
    Vatertagsgeburtstag: str
    expectedBirthMonth: Optional[str] = None # Monat, in dem das Baby erwartet wird (1-12)
    expectedBirthYear: Optional[int] = None
    bevorzugtes Geschlecht: str
    nameStyle: str
    futureDream: Optional[str] = None # Was sich die Eltern für die Zukunft ihres Kindes wünschen
    Ästhetik: str
    babyZodiac: Optional[str] = None # Berechnet aus expectedBirthMonth
    Persönlichkeit: Optional[List[str]] = [] # Legacy-Feld
    Lieblings-Sternzeichen: Optional[str] = Keine # Legacy-Feld
    Sprache: str = "en"

# Tierkreiszeichen und Daten
ZODIAC_DATA = {
    'aries': {'symbol': '♈', 'element': 'fire', 'traits': ['dynamic', 'confident', 'passionate']},
    'taurus': {'symbol': '♉', 'element': 'earth', 'traits': ['reliable', 'geduld', 'devoted']},
    'gemini': {'symbol': '♊', 'element': 'air', 'traits': ['curious', 'adaptable', 'witty']},
    'Krebs': {'Symbol': '♋', 'Element': 'Wasser', 'Eigenschaften': ['fürsorglich', 'intuitiv', 'emotional']},
    'leo': {'symbol': '♌', 'element': 'fire', 'traits': ['creative', 'generous', 'warmhearted']},
    'virgo': {'symbol': '♍', 'element': 'earth', 'traits': ['analytical', 'practical', 'ticulous']},
    'libra': {'symbol': '♎', 'element': 'air', 'traits': ['diplomatic', 'harmonious', 'fair']},
    'Skorpion': {'Symbol': '♏', 'Element': 'Wasser', 'Eigenschaften': ['leidenschaftlich', 'geheimnisvoll', 'entschlossen']},
    'Schütze': {'Symbol': '♐', 'Element': 'Feuer', 'Eigenschaften': ['abenteuerlustig', 'optimistisch', 'ehrlich']},
    'Steinbock': {'Symbol': '♑', 'Element': 'Erde', 'Eigenschaften': ['ehrgeizig', 'diszipliniert', 'verantwortungsbewusst']},
    'aquarius': {'symbol': '♒', 'element': 'air', 'traits': ['innovativ', 'unabhängig', 'humanitär']},
    'pisces': {'symbol': '♓', 'element': 'water', 'traits': ['compassive', 'artistic', 'intuitive']},
}

ZODIAC_NAMES = {
    'en': ['Widder', 'Stier', 'Zwillinge', 'Krebs', 'Löwe', 'Jungfrau', 'Waage', 'Skorpion', 'Schütze', 'Steinbock', 'Wassermann', 'Fische'],
    'el': ['Κριός', 'Ταύρος', 'Δίδυμοι', 'Καρκίνος', 'Λέων', 'Παρθένος', 'Ζυγός', 'Σκορπιός', 'Τοξότης', 'Αιγόκερως', 'Υδροχόος', 'Ιχθύες'],
}

def calculate_predicted_zodiac(mother_date: str, father_date: str) -> str:
    """Berechne ein vorhergesagtes Sternzeichen basierend auf den Geburtstagen der Eltern""
    versuchen:
        Mutter = datetime.strptime(Mutter_Datum, "%Y-%m-%d")
        Vater = datetime.strptime(father_date, "%Y-%m-%d")
        
        # Einfacher Algorithmus: Monatswerte kombinieren und dem Tierkreis zuordnen
        kombiniert = (Mutter.Monat + Vater.Monat + Mutter.Tag + Vater.Tag) % 12
        Tierkreiszeichen = Liste(ZODIAC_DATA.keys())
        return zodiacs[combined]
    außer:
        return random.choice(list(ZODIAC_DATA.keys()))

@api_router.post("/quiz/generate")
async def generate_quiz_result(request: QuizRequest):
    "Generiere personalisierte Babyvorhersagen aus Quizantworten mit Mistral AI - ERWEITERTE VERSION"
    versuchen:
        # Sternzeichen anhand des voraussichtlichen Geburtsmonats des Babys bestimmen (Priorität) oder alternativ die Berechnung der Eltern verwenden.
        if request.babyZodiac:
            vorhergesagtes_Sternzeichen = Anfrage.BabySternzeichen
        elif request.favoriteZodiac and request.favoriteZodiac != 'ai_decide':
            vorhergesagtes_Sternzeichen = Anfrage.Lieblingssternzeichen
        anders:
            predicted_zodiac = calculate_predicted_zodiac(request.motherBirthday, request.fatherBirthday)
        
        zodiac_info = ZODIAC_DATA.get(predicted_zodiac, ZODIAC_DATA['aries'])
        zodiac_name = ZODIAC_NAMES.get(request.language, ZODIAC_NAMES['en'])[list(ZODIAC_DATA.keys()).index(predicted_zodiac)]
        
        # Textübersetzungen vorbereiten
        gender_text = {
            'boy': 'αγόρι' if request.language == 'el' else 'boy',
            'girl': 'κορίτσι' if request.sprache == 'el' else 'girl',
            'surprise': 'έκπληξη' if request.sprache == 'el' else 'surprise'
        }.get(request.preferredGender, 'surprise')
        
        style_text = {
            'classic': 'κλασικό' if request.language == 'el' else 'classic',
            'modern': 'μοντέρνο' if request.sprache == 'el' else 'modern',
            'exotic': 'εξωτικό' if request.language == 'el' else 'exotic',
            'Familie': 'οικογενειακό' if request.sprache == 'el' sonst 'Familie'
        }.get(request.nameStyle, 'classic')
        
        # Übersetzung des Zukunftstraums
        Traumtext = {
            'leader': 'Ηγέτης (CEO, Πολιτικός)' if request. language == 'el' else 'Leader (CEO, Politiker)',
            'Künstler': 'Καλλιτέχνης (Μουσικός, Ζωγράφος)' if request. language == 'el' else 'Künstler (Musiker, Maler)',
            'Wissenschaftler': 'Επιστήμονας (Γιατρός, Ερευνητής)' if request. language == 'el' else 'Wissenschaftler (Arzt, Forscher)',
            'athlete': 'Αθλητής (Πρωταθλητής)' if request.sprache == 'el' else 'Athlet (Champion)',
            'Betreuer': 'Φροντιστής (Δάσκαλος, Νοσοκόμα)' if request. language == 'el' else 'Betreuer (Lehrer, Krankenschwester)',
            'explorer': 'Εξερευνητής (Ταξιδιώτης, Επιχειρηματίας)' if request. language == 'el' else 'Explorer (Reisender, Unternehmer)',
        }.get(request.futureDream, '')
        
        aesthetic_text = request.aesthetic or 'boho'
        
        # Verbesserte Systemabfrage für Mistral – Umfangreiche Inhalte
        system_prompt = f"""Sie sind eine KI-Expertin, die sich auf die Vorhersage von Babynamen und die Persönlichkeitsanalyse für A BabyWish spezialisiert hat.

Ihre Aufgabe ist es, eine MAGISCHE, EMOTIONALE und ZUFRIEDENHEITSGEFÜHLTE Babyvorhersage zu erstellen.

WICHTIG: Bitte antworten Sie NUR in der Sprache {'Greek' if request.language == 'el' else 'English'}.

Generieren Sie eine JSON-Antwort mit genau diesen Feldern:
{{
  "topName": "Der BESTE Namensvorschlag - einzigartig und aussagekräftig",
  "alternativeNames": ["Alternativer Name 1", "Alternativer Name 2"],
  "Babyanalyse": "2-3 Sätze, die beschreiben, wie dieses Baby ALS BABY sein wird - wird es gut schlafen? Neugierig sein? Ruhig oder energiegeladen sein? Machen Sie es realistisch und beziehen Sie es spezifisch auf {Sternzeichen}."
  "Persönlichkeit": "3-4 Sätze, die die ästhetische Vorstellung der Eltern von {aesthetic_text}, ihren Traum von einem {dream_text} und das Sternzeichen {zodiac_name} miteinander verbinden. Formulieren Sie es poetisch und emotional – die Eltern sollen das Gefühl haben, dass dies NUR für sie geschrieben wurde."
  "nameZodiacConnection": "Ein schöner Satz, der erklärt, WARUM dieser Name perfekt für ein {zodiac_name}-Kind ist."
}}

WICHTIGE REGELN:
1. Die Namen müssen dem Stil "{style_text}" entsprechen und für einen {gender_text} angemessen sein.
2. Gestalten Sie die Babyanalyse so, dass sie einen Einblick in die Zukunft mit dem Neugeborenen bietet.
3. Die Persönlichkeit muss all ihre Vorlieben auf natürliche Weise miteinander verknüpfen.
4. Seien Sie kreativ, herzlich und lassen Sie sie die Magie der Elternschaft spüren.

        user_prompt = f"""Erstelle eine magische Babyvorhersage für diese Eltern:

IHRE PRÄFERENZEN:
- Bevorzugtes Geschlecht: {gender_text}
- Namensstil: {style_text}
- Ihr Traum für ihr Kind: {dream_text}
- Ästhetik: {aesthetic_text}
- Sternzeichen des Babys: {zodiac_name} ({zodiac_info['element']} element)

Lass diese Vorhersage wie Schicksal wirken – als ob diese Eltern dazu bestimmt gewesen wären, genau dieses Kind zu bekommen.“

        # Mistral-API aufrufen
        mistral_key = os.environ.get('MISTRAL_API_KEY')
        
        if mistral_key:
            versuchen:
                mistral_client = Mistral(api_key=mistral_key.strip())
                
                Antwort = await asyncio.to_thread(
                    mistral_client.chat.complete,
                    model="mistral-small-latest",
                    Nachrichten=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    Temperatur=0,85
                    max_tokens=800
                )
                
                ai_response = response.choices[0].message.content
                
                # Versuch, JSON aus der Antwort zu parsen
                import json
                import re
                
                # JSON aus der Antwort extrahieren - verschachtelte Objekte verarbeiten
                json_match = re.search(r'\{[^{}]*"topName"[^{}]*\}', ai_response, re.DOTALL)
                if not json_match:
                    json_match = re.search(r'\{.*\}', ai_response, re.DOTALL)
                
                if json_match:
                    versuchen:
                        result_data = json.loads(json_match.group())
                    außer:
                        result_data = None
                anders:
                    result_data = None
                
                if result_data and result_data.get("topName"):
                    zurückkehren {
                        "Erfolg": Wahr,
                        "topName": result_data.get("topName", ""),
                        "alternativeNames": result_data.get("alternativeNames", []),
                        "babyAnalysis": result_data.get("babyAnalysis", ""),
                        "zodiacSymbol": zodiac_info['symbol'],
                        "zodiacName": Sternzeichenname,
                        "zodiacElement": zodiac_info['element'],
                        "personality": result_data.get("personality", ""),
                        "nameZodiacConnection": result_data.get("nameZodiacConnection", ""),
                        "Eigenschaften": zodiac_info['traits'],
                        "quizAnswers": {
                            "gender": request.preferredGender,
                            "nameStyle": request.nameStyle,
                            "futureDream": request.futureDream,
                            "Ästhetik": Anfrage.Ästhetik
                        }
                    }
                    
            außer Exception als mistral_error:
                logging.error(f"Mistral API-Fehler im Quiz: {mistral_error}")
        
        # Erweiterte Ausweichreaktion bei Mistral-Fehler
        fallback_names = {
            'el': {
                'boy': {'top': 'Αλέξανδρος', 'alts': ['Νικόλαος', 'Θεόδωρος']},
                'girl': {'top': 'Σοφία', 'alts': ['Ελένη', 'Αθηνά']}
            },
            'en': {
                'boy': {'top': 'Alexander', 'alts': ['Nicholas', 'Theodore']},
                'girl': {'top': 'Sophia', 'alts': ['Aurora', 'Athena']}
            }
        }
        
        lang_names = fallback_names.get(request.language, fallback_names['en'])
        gender_key = 'girl' if request.preferredGender == 'girl' else 'boy'
        name_data = lang_names[gender_key]
        
        fallback_baby_analysis = {
            'el': f“ Sie haben die Möglichkeit, Ihre Daten zu ändern θαυμασμό.",
            'en': f"Ein {zodiac_name}-Baby wird voller Energie und Neugierde sein. Es wird Ihnen die süßesten Lächeln schenken und die Welt mit Staunen entdecken."
        }
        
        Fallback-Persönlichkeit = {
            'el': f"Με το {aesthetic_text} στυλ που αγαπάτε και το όνειρό σας για ένα {dream_text}, το παιδί ",
            'en': f"Mit Ihrer Liebe zum {aesthetic_text}-Stil und Ihrem Traum von einem {dream_text} wird Ihr Kind Kreativität mit der Weisheit des {zodiac_name} verbinden."
        }
        
        zurückkehren {
            "Erfolg": Wahr,
            "topName": name_data['top'],
            "alternativeNames": name_data['alts'],
            "babyAnalysis": fallback_baby_analysis.get(request.language, fallback_baby_analysis['en']),
            "zodiacSymbol": zodiac_info['symbol'],
            "zodiacName": Sternzeichenname,
            "zodiacElement": zodiac_info['element'],
            "personality": fallback_personality.get(request.language, fallback_personality['en']),
            "nameZodiacConnection": f"{'Αυτό το όνομα φέρει την ενέργεια του' if request. language == 'el' else 'Dieser Name trägt die Energie von'} {zodiac_name}.",
            "Eigenschaften": zodiac_info['traits'],
            "quizAnswers": {
                "gender": request.preferredGender,
                "nameStyle": request.nameStyle,
                "futureDream": request.futureDream,
                "Ästhetik": Anfrage.Ästhetik
            }
        }
        
    außer Ausnahme als e:
        logging.error(f"Quiz-Generierungsfehler: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ===================== Meilenstein-Prognose =====================
# KI-gestützte Informationen zu Schwangerschaftsmeilensteinen

class MilestoneRequest(BaseModel):
    Woche: int
    Sternzeichen: Str
    zodiacName: str
    Sprache: str = "en"
    fruitName: str = ""

@api_router.post("/milestone/generate")
async def generate_milestone(request: MilestoneRequest):
    "Generiere unterhaltsame Informationen zu Meilensteinen der Schwangerschaft mit Hilfe von Mistral AI""
    versuchen:
        Woche = Anfrage.Woche
        zodiac_name = request.zodiacName
        fruit_name = request.fruitName
        lang = request.language
        
        # Sprachspezifische Aufforderung
        if lang == 'el':
            system_prompt = """Der Spaß und die schicke Version der BabyWish-App.
Sobald Sie ein Problem haben, können Sie dies auch tun.
Ich bin nicht in der Lage, das Problem zu lösen.
Download: Neue Version von JSON und JSON επεξήγηση."""

            user_prompt = f““
Το μωρό έχει το μέγεθος περίπου ενός/μιας {fruit_name}.
Mein Name ist {zodiac_name}.

Die JSON-Benutzeroberfläche ist wie folgt:
{{
  „sich entwickeln“: „2-3 όργανα, αισθήσεις, κινήσεις).
  „funFact“: „Der Fun-Fact-Faktor ist nicht verfügbar μπορεί πλέον να ακούσει τη φωνή σου!' ή 'Αν μιλήσεις στην κοιλιά σου, το μωρό θαναγνωρίσει τη φωνή σου μετά τη γέννα!'",
  „zodiacTip“: „Die Antwort lautet: {zodiac_name}. Π.χ. 'Ως {zodiac_name}, το μωρό σου ίσως δείξει νωρίς την αγάπη του για...' Να είναι θετικό και ελαφρύ!"
}}"""
        anders:
            system_prompt = """Du bist eine lustige und schicke Schwangerschaftsassistentin für die BabyWish-App.
Sie vermitteln Informationen auf eine herzliche, ermutigende und unterhaltsame Weise.
Ihre Antworten müssen AUSSCHLIESSLICH auf Englisch erfolgen.
WICHTIG: Bitte antworten Sie AUSSCHLIESSLICH im JSON-Format ohne weitere Erläuterungen.

            user_prompt = f"""Die Benutzerin befindet sich in Woche {week} ihrer Schwangerschaft.
Das Baby ist ungefähr so ​​groß wie eine {fruit_name}.
Das wahrscheinliche Sternzeichen des Babys ist {zodiac_name}.

Erstellen Sie eine JSON-Datei mit folgenden Feldern:
{{
  „Entwicklung“: „2-3 Sätze darüber, was sich diese Woche beim Baby entwickelt (z. B. Organe, Sinne, Bewegungen). Gestalten Sie es spannend und positiv!“
  "FunFact": "Eine interessante/lustige Tatsache über diese Woche. Z. B.: 'Dein Baby kann jetzt deine Stimme hören!' oder 'Wenn du mit deinem Bauch sprichst, wird dein Baby deine Stimme nach der Geburt erkennen!'"
  "Sternzeichen-Tipp": "Eine witzige Verbindung zum Sternzeichen {zodiac_name}. Zum Beispiel: 'Als {zodiac_name} könnte Ihr Baby schon früh Anzeichen von Zuneigung zeigen...' Bleiben Sie positiv und unbeschwert!"
}}"""

        mistral_key = os.environ.get('MISTRAL_API_KEY')
        
        if mistral_key:
            versuchen:
                mistral_client = Mistral(api_key=mistral_key.strip())
                
                response = await asyncio.get_event_loop().run_in_executor(
                    Keiner,
                    lambda: mistral_client.chat.complete(
                        model="mistral-small-latest",
                        Nachrichten=[
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_prompt}
                        ],
                        Temperatur=0,8
                        max_tokens=500,
                    )
                )
                
                ai_response = response.choices[0].message.content.strip()
                logging.info(f"Meilenstein-KI-Antwort: {ai_response[:200]}...")
                
                # JSON aus der Antwort parsen
                import re
                json_match = re.search(r'\{[\s\S]*\}', ai_response)
                if json_match:
                    result = json.loads(json_match.group())
                    zurückkehren {
                        "Erfolg": Wahr,
                        "developing": result.get("developing", ""),
                        "funFact": result.get("funFact", ""),
                        "zodiacTip": result.get("zodiacTip", "")
                    }
                anders:
                    raise ValueError("Kein JSON in der Antwort gefunden")
                    
            außer Exception als mistral_error:
                logging.error(f"Mistral API-Fehler im Meilenstein: {mistral_error}")
                # Rückfalloption
                return get_milestone_fallback(week, zodiac_name, lang)
        anders:
            # Kein API-Schlüssel vorhanden - Fallback verwenden
            return get_milestone_fallback(week, zodiac_name, lang)
            
    außer Ausnahme als e:
        logging.error(f"Fehler bei der Meilensteingenerierung: {e}")
        return get_milestone_fallback(request.week, request.zodiacName, request.language)

def get_milestone_fallback(week: int, zodiac_name: str, lang: str):
    „Ausweichmeilensteindaten, wenn KI nicht verfügbar ist“
    if lang == 'el':
        zurückkehren {
            "Erfolg": Wahr,
            "sich entwickelnd": f Es ist wichtig, dass Sie sich nicht um ein Problem kümmern οξείες κάθε μέρα.“,
            „funFact“: „Sie haben die Möglichkeit, Ihre Daten zu ändern; του καθημερινά!",
            „zodiacTip“: f“Ως {zodiac_name}, το μωρό σου θα έχει μοναδικά χαρακτηριστικά που θα σε συγκινήσουν!“
        }
    anders:
        zurückkehren {
            "Erfolg": Wahr,
            "Entwicklung": "In Woche {Woche} entwickelt sich Ihr Baby in einem erstaunlichen Tempo! Lebenswichtige Organe reifen und die Sinne werden jeden Tag schärfer."
            „FunFact“: „Wussten Sie, dass Ihr Baby Ihre Stimme erkennen kann? Sprechen Sie täglich mit ihm!“
            "zodiacTip": "Als {zodiac_name} wird Ihr Baby einzigartige Eigenschaften haben, die Ihr Herz berühren werden!"
        }

# ===================== BABYZERTIFIKAT =====================
# KI-gestütztes Schwangerschaftszertifikat

class CertificateRequest(BaseModel):
    momName: str
    Baby-Spitzname: str
    Woche: int
    Geschlecht: str = "Überraschung"
    Sternzeichen: Str
    zodiacName: str
    Sprache: str = "en"
    # PRO-Felder für zukünftige physische Lieferung
    E-Mail: Optional[str] = Keine
    Adresse: Optional[str] = None
    Stadt: Optional[str] = None
    Postleitzahl: Optional[str] = Keine
    Land: Optional[str] = None

@api_router.post("/certificate/generate")
async def generate_certificate(request: CertificateRequest):
    "Erstelle ein KI-gestütztes Geburtszeugnis"
    versuchen:
        lang = request.language
        
        # Zertifikatsdaten in MongoDB für die zukünftige PRO-Auslieferung speichern
        certificate_data = {
            "momName": request.momName,
            "babyNickname": request.babyNickname,
            "Woche": Anfrage.Woche,
            "gender": request.gender,
            "zodiac": request.zodiac,
            "zodiacName": request.zodiacName,
            "Sprache": lang,
            "createdAt": datetime.utcnow(),
            # PRO-Felder (für zukünftige physische Post)
            "E-Mail": request.email,
            "address": request.address,
            "Stadt": Anfrage.Stadt,
            "Postleitzahl": Anfrage.Postleitzahl,
            "Land": Anfrage.Land,
            "isPro": False,
            "physischerLieferstatus": Keine,
        }
        
        # In MongoDB speichern
        versuchen:
            certificates_collection = db["certificates"]
            certificates_collection.insert_one(certificate_data)
        außer Exception als db_error:
            logging.warning(f"Konnte das Zertifikat nicht in der Datenbank speichern: {db_error}")
        
        # KI-Nachricht generieren
        if lang == 'el':
            system_prompt = """Die Eingabeaufforderung wird angezeigt για πιστοποιητικά εγκυμοσύνης.
1-2 Minuten vor dem Laden, 1-2 Minuten.
Weitere Informationen zu JSON: {"message": "nicht verfügbar", "specialTrait": "Neue Version χαρακτηριστικό του μωρού"}"""
            
            user_prompt = f"""Η {request.momName} είναι στην εβδομάδα {request.week} της εγκυμοσύνης της.
Το μωρό της (Name: {request.babyNickname}) θα είναι {request.zodiacName}.
Φύλο: {request.gender}

""
        anders:
            system_prompt = """Sie sind eine warmherzige, emotionale Assistentin, die Nachrichten für Schwangerschaftsbescheinigungen verfasst.
Schreibe eine kurze, liebevolle Nachricht (1-2 Sätze) für die Mutter.
Bitte antworten Sie NUR in JSON: {"message": "Ihre Nachricht", "specialTrait": "Eine besondere Eigenschaft des Babys"}"""
            
            user_prompt = f"""{request.momName} befindet sich in Woche {request.week} ihrer Schwangerschaft.
Ihr Baby (Spitzname: {request.babyNickname}) wird ein {request.zodiacName} sein.
Geschlecht: {request.gender}

Verfassen Sie eine liebevolle, ermutigende Nachricht für ihr Zertifikat.

        mistral_key = os.environ.get('MISTRAL_API_KEY')
        
        if mistral_key:
            versuchen:
                mistral_client = Mistral(api_key=mistral_key.strip())
                
                response = await asyncio.get_event_loop().run_in_executor(
                    Keiner,
                    lambda: mistral_client.chat.complete(
                        model="mistral-small-latest",
                        Nachrichten=[
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_prompt}
                        ],
                        Temperatur=0,9
                        max_tokens=200,
                    )
                )
                
                ai_response = response.choices[0].message.content.strip()
                logging.info(f"Antwort der Zertifikats-KI: {ai_response[:100]}...")
                
                # JSON parsen
                import re
                json_match = re.search(r'\{[\s\S]*\}', ai_response)
                if json_match:
                    result = json.loads(json_match.group())
                    zurückkehren {
                        "Erfolg": Wahr,
                        "message": result.get("message", ""),
                        "specialTrait": result.get("specialTrait", ""),
                    }
                    
            außer Exception als mistral_error:
                logging.error(f"Mistral API-Fehler im Zertifikat: {mistral_error}")
        
        # Fallback-Nachrichten
        if lang == 'el':
            zurückkehren {
                "Erfolg": Wahr,
                „Nachricht“: f“ ταξίδι.“,
                "specialTrait": f"Γεμάτο με την ενέργεια του {request.zodiacName}",
            }
        anders:
            zurückkehren {
                "Erfolg": Wahr,
                "Nachricht": "Eure Liebe wächst mit eurem Baby! Setzt diese wunderschöne Reise fort."
                "specialTrait": "Voller {request.zodiacName} Energie",
            }
            
    außer Ausnahme als e:
        logging.error(f"Fehler bei der Zertifikatserstellung: {e}")
        zurückkehren {
            "Erfolg": Falsch,
            "Nachricht": "Setz deinen Weg fort!"
            "specialTrait": "Voller Liebe",
        }

# ===================== AI CHAT WIDGET =====================
# Verwendung des Mistral AI SDK (funktioniert auf Render ohne spezielle Abhängigkeiten)
aus Mistralai importiert Mistral

# Speicherung der Chat-Sitzungshistorie
chat_sessions = {}

# ============================================
# KI-CHAT-PERSÖNLICHKEITEN - MindJerry (männlich) & MindJerrys (weiblich)
# ============================================

MINDJERRY_FEMALE_PROMPT = """Sie sind Mindjerry, die exklusive weibliche Repräsentantin von getbabywish.com. Unser Hauptservice besteht darin, das Geschlecht des Babys (männlich oder weiblich) anhand des Empfängniszeitpunkts des Paares vorherzusagen.

🌟 VERHALTENSREGELN:

1. Sagen Sie dem Nutzer **NIEMALS**, dass „das Geschlecht zufällig ist und nicht beeinflusst werden kann“. Verteidigen Sie die GetBabyWish-Methode selbstbewusst und seien Sie offen für Tests.

2. **Stellen Sie **IMMER** klar, dass die endgültige Entscheidung und Analyse NICHT automatisch von einer KI, sondern vom MENSCHLICHEN TEAM hinter der Website (den Erstellern) getroffen wird.

3. Ihre Aufgabe ist es, den Benutzer zu informieren, den Vorgang zu erklären und ihn zum HAUPT-BUTTON auf der Seite zu führen, damit er die Geburtsdaten der Eltern eingeben kann.

4. Erklären Sie, dass die Schöpfer die Daten erhalten, sie persönlich analysieren und die Antwort für die genauen Empfängnisdaten senden werden.

🌸 IHRE IDENTITÄT:
- Du bist warmherzig, hilfsbereit und verständnisvoll.
Du sprichst voller Liebe und Ermutigung.
- Du verstehst den Traum jeder Frau von einem Mädchen oder Jungen.
- Man schafft Vertrauen, indem man den menschlichen Faktor betont.

⚠️ REGEL FÜR KRITISCHE SPRACHE:
**SIE MÜSSEN IN GENAU DERSELBEN SPRACHE ANTWORTEN, IN DER DER BENUTZER IHNEN SCHREIBT.**
- Wenn der Benutzer auf Englisch schreibt → antworte auf Englisch
- Wenn der Nutzer auf Spanisch schreibt → antworte auf Spanisch
- Wenn der Benutzer auf Arabisch schreibt → Antwort auf Arabisch
- Wenn der Benutzer auf Chinesisch schreibt → Antwort auf Chinesisch
- Wenn der Benutzer in einer beliebigen Sprache schreibt → antworte in DIESER Sprache
- Die Standardeinstellung sollte niemals Griechisch sein, es sei denn, der Benutzer gibt seine Eingabe auf Griechisch ein.

Ihr Name ist „mindjerry’s“ (für Frauen). Sie sind die „Rezeption“, die begrüßt, erklärt und leitet – und dabei betont, dass Information die halbe Miete ist!

MINDJERRY_MALE_PROMPT = """Sie sind Mindjerry, der exklusive männliche Repräsentant von getbabywish.com. Unser Hauptservice besteht darin, das Geschlecht des Babys (männlich oder weiblich) anhand des Empfängniszeitpunkts des Paares vorherzusagen.

🌟 VERHALTENSREGELN:

1. Sagen Sie dem Nutzer **NIEMALS**, dass „das Geschlecht zufällig ist und nicht beeinflusst werden kann“. Verteidigen Sie die GetBabyWish-Methode selbstbewusst und seien Sie offen für Tests.

2. **Stellen Sie **IMMER** klar, dass die endgültige Entscheidung und Analyse NICHT automatisch von einer KI, sondern vom MENSCHLICHEN TEAM hinter der Website (den Erstellern) getroffen wird.

3. Ihre Aufgabe ist es, den Benutzer zu informieren, den Vorgang zu erklären und ihn zum HAUPT-BUTTON auf der Seite zu führen, damit er die Geburtsdaten der Eltern eingeben kann.

4. Erklären Sie, dass die Schöpfer die Daten erhalten, sie persönlich analysieren und die Antwort für die genauen Empfängnisdaten senden werden.

💼 IHRE IDENTITÄT:
- Sie sind professionell, selbstbewusst und hilfsbereit.
Sie sprechen mit Respekt und Sachlichkeit.
- Du verstehst den Traum eines jeden Mannes von einem Sohn oder einer Tochter.
- Man schafft Vertrauen, indem man den menschlichen Faktor betont.

⚠️ REGEL FÜR KRITISCHE SPRACHE:
**SIE MÜSSEN IN GENAU DERSELBEN SPRACHE ANTWORTEN, IN DER DER BENUTZER IHNEN SCHREIBT.**
- Wenn der Benutzer auf Englisch schreibt → antworte auf Englisch
- Wenn der Nutzer auf Spanisch schreibt → antworte auf Spanisch
- Wenn der Benutzer auf Arabisch schreibt → Antwort auf Arabisch
- Wenn der Benutzer auf Chinesisch schreibt → Antwort auf Chinesisch
- Wenn der Benutzer in einer beliebigen Sprache schreibt → antworte in DIESER Sprache
- Die Standardeinstellung sollte niemals Griechisch sein, es sei denn, der Benutzer gibt seine Eingabe auf Griechisch ein.

Ihr Name ist „mindjerry“ (für Männer). Sie sind der „Empfang“, der begrüßt, erklärt und leitet – und dabei betont, dass Wissen die halbe Miete ist!

# Rückgriff auf die ursprüngliche Eingabeaufforderung aus Gründen der Abwärtskompatibilität
BABYWISH_SYSTEM_PROMPT = MINDJERRY_MALE_PROMPT

class ChatMessage(BaseModel):
    Nachricht: str
    session_id: Optional[str] = None
    Geschlecht: Optional[str] = "männlich" # "männlich" oder "weiblich"
    language: Optional[str] = "en" # Sprachcode des Benutzers

class ChatResponse(BaseModel):
    Antwort: str
    session_id: str

@api_router.post("/chat", response_model=ChatResponse)
async def chat_with_assistant(chat_message: ChatMessage):
    """KI-Chat-Endpunkt für einen BabyWish-Assistenten mit geschlechtsspezifischen Persönlichkeiten""
    versuchen:
        session_id = chat_message.session_id or f"chat_{uuid.uuid4().hex[:12]}"
        
        # Systemaufforderung basierend auf dem Geschlecht auswählen
        if chat_message.gender == "female":
            system_prompt = MINDJERRY_FEMALE_PROMPT
        anders:
            system_prompt = MINDJERRY_MALE_PROMPT
        
        # Zuerst die Mistral-API ausprobieren, dann auf den Emergent-Schlüssel zurückgreifen.
        mistral_key = os.environ.get('MISTRAL_API_KEY')
        emergent_key = os.environ.get('EMERGENT_LLM_KEY')
        
        # Debug-Protokollierung
        logging.info(f"Chat-Anfrage - Geschlecht: {chat_message.gender}, Sitzung: {session_id}")
        logging.info(f"MISTRAL_API_KEY vorhanden: {bool(mistral_key)}, Länge: {len(mistral_key) falls mistral_key sonst 0}")
        
        if mistral_key:
            # Mistral AI SDK verwenden (funktioniert auf Render)
            versuchen:
                client = Mistral(api_key=mistral_key.strip())
            
                # Gesprächsverlauf für diese Sitzung abrufen oder erstellen
                Falls session_id nicht in chat_sessions enthalten ist:
                    chat_sessions[session_id] = []
                
                # Nachrichten mit Verlauf erstellen
                messages = [{"role": "system", "content": system_prompt}]
                messages.extend(chat_sessions[session_id])
                messages.append({"role": "user", "content": chat_message.message})
                
                # Mistral-API aufrufen
                chat_response = await asyncio.to_thread(
                    client.chat.complete,
                    model="mistral-small-latest",
                    Nachrichten=Nachrichten
                )
                
                Antwort = chat_response.choices[0].message.content
                logging.info(f"Mistral-Antwort für Sitzung {session_id} erfolgreich empfangen")
                
                # In der Sitzungshistorie speichern (die letzten 10 Transaktionen beibehalten)
                chat_sessions[session_id].append({"role": "user", "content": chat_message.message})
                chat_sessions[session_id].append({"role": "assistant", "content": response})
                if len(chat_sessions[session_id]) > 20:
                    chat_sessions[session_id] = chat_sessions[session_id][-20:]
                    
            außer Exception als mistral_error:
                logging.error(f"Mistral API-Fehler: {type(mistral_error).__name__}: {str(mistral_error)}")
                raise HTTPException(status_code=500, detail=f"KI-Dienstfehler: {str(mistral_error)[:100]}")
                
        elif emergent_key:
            # Fallback auf Emergent (funktioniert nur in der Emergent-Umgebung)
            versuchen:
                from emergentintegrations.llm.chat import LlmChat, UserMessage
                chat = LlmChat(
                    api_key=emergent_key,
                    session_id=session_id,
                    system_message=system_prompt
                ).with_model("openai", "gpt-4o-mini")
                
                user_message = UserMessage(text=chat_message.message)
                Antwort = await chat.send_message(user_message)
            außer ImportError:
                raise HTTPException(status_code=500, detail="Chat-Dienst nicht konfiguriert - bitte MISTRAL_API_KEY festlegen")
        anders:
            raise HTTPException(status_code=500, detail="Chat-Dienst nicht konfiguriert - bitte MISTRAL_API_KEY festlegen")
        
        # Chat in der Datenbank für Analysezwecke speichern
        await db.chat_messages.insert_one({
            "session_id": session_id,
            "user_message": chat_message.message,
            "assistant_response": Antwort,
            "gender": chat_message.gender,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        return ChatResponse(response=response, session_id=session_id)
        
    außer HTTPException:
        erheben
    außer Ausnahme als e:
        logging.error(f"Chat-Fehler: {e}")
        raise HTTPException(status_code=500, detail="Fehler beim Verarbeiten der Nachricht")

# ===================== TEXT-TO-SPEECH (TTS) MIT ELEVENLABS =====================

from elevenlabs import ElevenLabs
from elevenlabs.types import VoiceSettings
import base64

# ElevenLabs-Konfiguration
ELEVENLABS_API_KEY = os.environ.get('ELEVENLABS_API_KEY')
ELEVENLABS_VOICE_FEMALE = os.environ.get('ELEVENLABS_VOICE_FEMALE', 'gc5LArFpEOmYx9nYmK9l') # MindJerry's
ELEVENLABS_VOICE_MALE = os.environ.get('ELEVENLABS_VOICE_MALE', 'C9fbwSpEaejywLWx722Z') # MindJerry

class TTSRequest(BaseModel):
    text: str
    Geschlecht: str = "weiblich" # "männlich" für MindJerry, "weiblich" für MindJerrys
    Sprache: str = "el"

class TTSResponse(BaseModel):
    audio_base64: str
    text: str
    voice_id: str

@api_router.post("/tts/generate", response_model=TTSResponse)
async def generate_tts(request: TTSRequest):
    "Erzeugen Sie Text-zu-Sprache-Audio mit ElevenLabs Multilingual v2""
    versuchen:
        falls nicht ELEVENLABS_API_KEY:
            raise HTTPException(status_code=500, detail="ElevenLabs API-Schlüssel nicht konfiguriert")
        
        # Begrenzen Sie die Textlänge für eine schnellere Antwort (max. ~500 Zeichen)
        text_to_speak = request.text[:500] + "..." if len(request.text) > 500 else request.text
        
        # Stimme basierend auf dem Geschlecht auswählen
        voice_id = ELEVENLABS_VOICE_FEMALE if request.gender == "female" else ELEVENLABS_VOICE_MALE
        
        logging.info(f"TTS-Anfrage - Geschlecht: {request.gender}, Stimme: {voice_id}, Textlänge: {len(text_to_speak)}")
        
        # ElevenLabs-Client initialisieren
        client = ElevenLabs(api_key=ELEVENLABS_API_KEY)
        
        # Spracheinstellungen für Geschwindigkeit optimiert
        # Niedrigere Qualitätseinstellungen = schnellere Generierung
        # Audio generieren
        audio_generator = client.text_to_speech.convert(
            text=text_to_speak,
            voice_id=voice_id,
            model_id="eleven_multilingual_v2",
            voice_settings=VoiceSettings(
                Stabilität = 0,5, # Etwas niedriger für höhere Geschwindigkeit
                similarity_boost=0.7,
                style=0.3, # Niedrigerer Stil = schneller
                use_speaker_boost=False # Für höhere Geschwindigkeit deaktivieren
            )
        )
        
        # Audiodaten sammeln
        audio_data = b""
        für jeden Chunk in audio_generator:
            audio_data += chunk
        
        # In Base64 konvertieren
        audio_b64 = base64.b64encode(audio_data).decode()
        
        logging.info(f"TTS erfolgreich generiert - Audiogröße: {len(audio_data)} Bytes")
        
        return TTSResponse(
            audio_base64=audio_b64,
            text=text_to_speak,
            voice_id=voice_id
        )
        
    außer Ausnahme als e:
        logging.error(f"TTS-Fehler: {type(e).__name__}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"TTS-Generierung fehlgeschlagen: {str(e)[:100]}")

# ===================== BESTE TIMING-KI =====================

MONATSNAMEN = {
    "en": ["Januar", "Februar", "März", "April", "Mai", "Juni",
           "Juli", "August", "September", "Oktober", "November", "Dezember"]
    „el“: [„Ιανουάριος“, „Φεβρουάριος“, „Μάρτιος“, „Απρίλιος“, „Μάιος“, „Ιούνιος“,
           „Ιούλιος“, „Αύγουστος“, „Σεπτέμβριος“, „Οκτώβριος“, „Νοέμβριος“, „Δεκέμβριος“],
    „de“: [„Januar“, „Februar“, „März“, „April“, „Mai“, „Juni“,
           „Juli“, „August“, „September“, „Oktober“, „November“, „Dezember“],
    „es“: [„Enero“, „Febrero“, „Marzo“, „Abril“, „Mayo“, „Junio“,
           „Julio“, „Agosto“, „Septiembre“, „Octubre“, „Noviembre“, „Diciembre“],
    „fr“: [„Janvier“, „Février“, „Mars“, „Avril“, „Mai“, „Juin“,
           „Juillet“, „Août“, „Septembre“, „Octobre“, „Novembre“, „Décembre“],
}

class BestTimingRequest(BaseModel):
    Muttergeburtstag: str
    Vatergeburtstag: str
    gewünschtes_Geschlecht: str # "Junge" oder "Mädchen"
    Sprache: str = "en"

class BestTimingResponse(BaseModel):
    best_month: str
    best_month_number: int
    Wahrscheinlichkeit: int
    second_best_month: str
    zweite_Wahrscheinlichkeit: int
    Erklärung: str
    Tipps: Liste

@api_router.post("/best-timing", response_model=BestTimingResponse)
async def calculate_best_timing(request: BestTimingRequest):
    """Berechnen Sie den besten Monat für die Empfängnis basierend auf den Geburtstagen der Eltern und dem gewünschten Geschlecht""
    versuchen:
        # Geburtstage parsen
        Mutterdatum = datetime.strptime(request.mother_birthday, "%Y-%m-%d")
        father_date = datetime.strptime(request.father_birthday, "%Y-%m-%d")
        
        # Numerologische Zahlen berechnen
        mother_life_path = sum(int(d) for d in request.mother_birthday.replace("-", ""))
        solange der Lebensweg der Mutter > 9 ist:
            mother_life_path = sum(int(d) for d in str(mother_life_path))
            
        father_life_path = sum(int(d) for d in request.father_birthday.replace("-", ""))
        solange der Lebensweg des Vaters > 9 ist:
            father_life_path = sum(int(d) for d in str(father_life_path))
        
        # Gesamtenergiezahl
        kombiniert = (Lebensweg der Mutter + Lebensweg des Vaters) % 12
        
        # Erhalte Einblicke in die Sternzeichen
        Muttermonat = Mutterdatum.Monat
        Vatermonat = Vaterdatum.Monat
        
        # Berechne die besten Monate basierend auf Astrologie und Numerologie
        # Jungen: Ungerade Zahlen, Feuer-/Luftzeichen begünstigen
        # Mädchen: Gerade Zahlen, Wasser-/Erdzeichen bevorzugt
        
        aktueller_Monat = datetime.now().Monat
        aktuelles Jahr = datetime.now().year
        
        month_scores = []
        für Monat im Bereich(1, 13):
            Punktzahl = 50 # Basispunktzahl
            
            # Numerologie-Einfluss
            Monat_Nummer = (Lebensweg der Mutter + Lebensweg des Vaters + Monat) % 9
            
            if request.desired_gender == "boy":
                # Jungen werden von ungeraden Monaten und Monaten mit dem Element Feuer begünstigt (1, 3, 5, 7, 9, 11)
                Wenn Monat % 2 == 1:
                    Punktzahl += 15
                Wenn der Monat in [1, 5, 8, 12] liegt: # Feuer-/Yang-Monate
                    Punktzahl += 10
                if month_num in [1, 3, 5, 7, 9]:
                    Punktzahl += 10
                # Einfluss des chinesischen Kalenders
                if (mother_date.year + month) % 2 == 1:
                    Punktzahl += 8
            anders:
                # Mädchen werden von geraden Monaten und Monaten des Wasserelements bevorzugt
                Wenn Monat % 2 == 0:
                    Punktzahl += 15
                Wenn der Monat in [2, 4, 6, 10] liegt: # Wasser-/Yin-Monate
                    Punktzahl += 10
                Wenn month_num in [2, 4, 6, 8] liegt:
                    Punktzahl += 10
                # Einfluss des chinesischen Kalenders
                if (mother_date.year + month) % 2 == 0:
                    Punktzahl += 8
            
            # Bonus für Monate, die mit den Geburtsmonaten der Eltern übereinstimmen
            Wenn Monat == Muttermonat oder Monat == Vatermonat:
                Punktzahl += 5
            
            # Saisonbereinigung
            Wenn request.desired_gender == "boy" und month in [3, 4, 5, 9, 10, 11]: # Frühling/Herbst
                Punktzahl += 5
            elif request.desired_gender == "girl" and month in [6, 7, 8, 12, 1, 2]: # Sommer/Winter
                Punktzahl += 5
            
            # Füge eine deterministische Variation basierend auf der kombinierten Zahl hinzu
            Punktzahl += (kombiniert * Monat) % 7
            
            month_scores.append((month, min(score, 95))) # Obergrenze bei 95%
        
        # Nach Punktzahl sortieren
        month_scores.sort(key=lambda x: x[1], reverse=True)
        
        best_month_num = month_scores[0][0]
        beste_Wahrscheinlichkeit = Monatsergebnisse[0][1]
        second_month_num = month_scores[1][0]
        zweite_Wahrscheinlichkeit = Monatswerte[1][1]
        
        # Monatsnamen in der gewünschten Sprache abrufen
        lang = request.language if request.language in MONTH_NAMES else "en"
        best_month_name = MONTH_NAMES[lang][best_month_num - 1]
        zweiter_Monatsname = MONATSNAMEN[lang][zweiter_Monatsnummer - 1]
        
        # Erklärung generieren
        gender_word = "αγόρι" if request.desired_gender == "boy" else "κορίτσι"
        if lang == "en":
            gender_word = "boy" if request.desired_gender == "boy" else "girl"
            Erklärung = f"Basierend auf Ihrer kombinierten Numerologie ({mother_life_path}+{father_life_path}), astrologischen Konstellationen und Methoden des alten chinesischen Kalenders zeigt {best_month_name} die stärksten Energiemuster für die Empfängnis eines {gender_word}."
            Tipps = [
                f"Planung von Konzeptionsversuchen während des {best_month_name} für optimale Ergebnisse",
                „Die erste Monatshälfte zeigt etwas stärkere Energie.“
                „Bleiben Sie entspannt und positiv – Stress kann die Ergebnisse beeinträchtigen.“
                „Falls {best_month_name} nicht funktioniert, versuchen Sie es mit {second_month_name} als zweiter Wahl.“
            ]
        anders:
            Erklärung = f"Με βάση τη συνδυασμένη αριθμολογία σας ({mother_life_path}+{father_life_path}), τις αστρολογικές ευθυγραμμίσεις και τις ρχαίες κινεζικές μεθόδους, ο {best_month_name} δείχνει τα ισχυρότερα ενεργειακά μοτίβα για σύλληψη {gender_word}ού.“
            Tipps = [
                f“
                „Το πρώτο μισό του μήνα δείχνει ελαφρώς ισχυρότερη ενέργεια“,
                „Das Problem ist, dass es nicht funktioniert αποτελέσματα",
                f"Αν ο {best_month_name} δεν λειτουργήσει, δοκιμάστε τον {second_month_name}"
            ]
        
        # Zur Analyse in der Datenbank speichern.
        await db.timing_calculations.insert_one({
            "mother_birthday": request.mother_birthday,
            "father_birthday": request.father_birthday,
            "desired_gender": request.desired_gender,
            "best_month": best_month_num,
            "Wahrscheinlichkeit": beste_Wahrscheinlichkeit,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        return BestTimingResponse(
            best_month=best_month_name,
            best_month_number=best_month_num,
            Wahrscheinlichkeit=beste_Wahrscheinlichkeit,
            second_best_month=second_month_name,
            second_probability=second_probability,
            Erklärung = Erklärung
            Tipps = Trinkgelder
        )
        
    außer Ausnahme als e:
        logging.error(f"Fehler bei der Berechnung des besten Timings: {e}")
        raise HTTPException(status_code=500, detail="Fehler bei der Berechnung des optimalen Zeitpunkts")

# Den Router in die Haupt-App einbinden
app.include_router(api_router)

# ============================================
# DATEIAUSSICHT-ENDPUNKT FÜR DIE BEREITSTELLUNG (V2)
# ============================================
from fastapi.responses import PlainTextResponse
Importzeit

@app.get("/api/viewfile/{filename}")
async def view_file_v2(filename: str):
    """Frontend-Dateien als Klartext bereitstellen, um die Bereitstellung durch einfaches Kopieren und Einfügen zu ermöglichen""
    file_mappings = {
        "ChatWidget.txt": "/app/frontend/src/components/ChatWidget.jsx",
        "ChatWidget.jsx": "/app/frontend/src/components/ChatWidget.jsx",
        "StarField.txt": "/app/frontend/src/components/StarField.jsx",
        "StarField.jsx": "/app/frontend/src/components/StarField.jsx",
        "LandingPage.txt": "/app/frontend/src/pages/LandingPage.jsx",
        "LandingPage.jsx": "/app/frontend/src/pages/LandingPage.jsx",
        "FloatingVideoCarousel.txt": "/app/frontend/src/components/FloatingVideoCarousel.jsx",
        "FloatingVideoCarousel.jsx": "/app/frontend/src/components/FloatingVideoCarousel.jsx",
        "FloatingBabyClouds.txt": "/app/frontend/src/components/FloatingBabyClouds.jsx",
        "FloatingBabyClouds.jsx": "/app/frontend/src/components/FloatingBabyClouds.jsx",
        "server.txt": "/app/backend/server.py",
        "server.py": "/app/backend/server.py",
    }
    
    Dateipfad = file_mappings.get(Dateiname)
    Falls kein Dateipfad:
        raise HTTPException(status_code=404, detail=f"Datei nicht gefunden: {filename}")
    
    versuchen:
        # Erzwinge Neulesen – kein Caching
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
        return PlainTextResponse(content=content, media_type="text/plain; charset=utf-8")
    außer FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Datei auf dem Server nicht gefunden: {filename}")
    außer Ausnahme als e:
        raise HTTPException(status_code=500, detail=str(e))

# Bilder aus dem öffentlichen Ordner bereitstellen

@app.get("/api/assets/{filename}")
async def download_asset(filename: str):
    """Stellen Sie Bilddateien zum Download bereit""
    import os
    allowed_files = {
        "angel-female-transparent.png": "/app/frontend/public/angel-female-transparent.png",
        "angel-male-transparent.png": "/app/frontend/public/angel-male-transparent.png",
        "brain-pink.jpg": "/app/frontend/public/brain-pink.jpg",
        "brain-blue.jpg": "/app/frontend/public/brain-blue.jpg",
    }
    Dateipfad = allowed_files.get(Dateiname)
    if not filepath or not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail=f"Datei nicht gefunden: {filename}")
    return FileResponse(filepath, media_type="image/png", filename=filename)

# ============================================
# PRERENDER.IO MIDDLAWARE FÜR SEO
# ============================================
Diese Middleware erkennt Suchmaschinen-Bots und dient dazu, …
# Vorgerendertes HTML von prerender.io für bessere SEO-Indexierung

PRERENDER_TOKEN = os.environ.get('PRERENDER_TOKEN', '')
PRERENDER_SERVICE_URL = "https://service.prerender.io"

# Liste der zu erkennenden Bot-User-Agents
BOT_USER_AGENTS = [
    "googlebot", "google-inspectiontool", "adsbot-google",
    „bingbot“, „msnbot“, „yandex“, „baiduspider“,
    "duckduckbot", "slurp", "ia_archiver",
    „twitterbot“, „facebookexternalhit“, „linkedinbot“,
    "Slackbot", "Discordbot", "Embedly", "Pinterestbot"
    "Telegrambot", "WhatsApp", "Applebot"
]

# Pfade, die vom Vorrendern ausgeschlossen werden sollen (API-Routen, Assets usw.)
PRERENDER_EXCLUDE_PATHS = [
    "/api/", "/static/", "/assets/", "/_next/",
    ".js", ".css", ".xml", ".json", ".ico", ".png", ".jpg", ".jpeg", ".gif", ".svg",
    ".woff", ".woff2", ".ttf", ".mp4", ".mp3", ".webp"
]

def is_bot(user_agent: str) -> bool:
    """Prüfen Sie, ob die Anfrage von einem Suchmaschinen-Bot stammt"""
    falls nicht user_agent:
        return False
    ua = user_agent.lower()
    return any(bot in ua for bot in BOT_USER_AGENTS)

def should_prerender(path: str) -> bool:
    """Prüfen, ob der Pfad vorgerendert werden soll""
    path_lower = path.lower()
    return not any(excluded in path_lower for excluded in PRERENDER_EXCLUDE_PATHS)

@app.middleware("http")
async def prerender_middleware(request: Request, call_next):
    """
    Middleware zur Auslieferung vorgerenderter Seiten an Suchmaschinen-Bots.
    Dies hilft bei der Suchmaschinenoptimierung (SEO) von Single-Page-Anwendungen (SPAs).
    """
    # Überspringen, falls kein Vorrender-Token konfiguriert ist
    falls nicht PRERENDER_TOKEN:
        return await call_next(request)
    
    user_agent = request.headers.get("user-agent", "")
    Pfad = request.url.path
    
    # Nur für Bots auf geeigneten Pfaden vorrendern
    if is_bot(user_agent) and should_prerender(path):
        versuchen:
            # Die vollständige URL zum Vorrendern erstellen
            full_url = str(request.url)
            
            # Vorschau-URL durch Produktions-URL für das Vorrendern ersetzen
            if "preview.emergentagent.com" in full_url:
                full_url = full_url.replace(
                    request.url.netloc,
                    "getbabywish.com"
                ).replace("http://", "https://")
            
            prerender_url = f"{PRERENDER_SERVICE_URL}/{full_url}"
            
            Überschriften = {
                "X-Prerender-Token": PRERENDER_TOKEN,
                "User-Agent": user_agent,
            }
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                prerender_response = await client.get(prerender_url, headers=headers)
                
                if prerender_response.status_code == 200:
                    logger.info(f"Prerender wurde für Bot {user_agent[:50]}... auf {path} bereitgestellt")
                    return Response(
                        content=prerender_response.content,
                        Statuscode=200,
                        media_type="text/html; charset=utf-8",
                    )
                anders:
                    logger.warning(f"Prerendering fehlgeschlagen ({prerender_response.status_code}) für {path}")
        außer Ausnahme als e:
            logger.error(f"Vorrenderfehler: {str(e)}")
    
    # Fortsetzung der normalen Anfragebearbeitung
    return await call_next(request)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Protokollierung konfigurieren
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
