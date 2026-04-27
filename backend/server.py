from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from fastapi.responses import JSONResponse, FileResponse, PlainTextResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import asyncio
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, date, timedelta
import random
import httpx
import resend

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Stripe
import stripe

stripe_api_key = os.environ.get('STRIPE_API_KEY')
stripe.api_key = stripe_api_key

# Resend Email
resend.api_key = os.environ.get('RESEND_API_KEY')
NOTIFICATION_EMAIL = os.environ.get('NOTIFICATION_EMAIL', 'getbabywish@hotmail.com')
SENDER_EMAIL = "getbabywish@outlook.com"

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Health check endpoint for uptime monitoring
@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "service": "babywish-api"}

# Download endpoint for code files
@api_router.get("/download/{filename}")
async def download_file(filename: str):
    """Serve code files for download"""
    import os
    file_path = f"/app/downloads/{filename}"
    if os.path.exists(file_path):
        with open(file_path, 'r') as f:
            content = f.read()
        return PlainTextResponse(content, media_type="text/plain")
    return JSONResponse({"error": "File not found"}, status_code=404)


# Subscription packages - amounts in EUR
SUBSCRIPTION_PACKAGES = {
    "3_months": {"name": "3 Μήνες", "amount": 10.00, "duration_months": 3},
    "9_months": {"name": "9 Μήνες", "amount": 25.00, "duration_months": 9},
    "18_months": {"name": "18 Μήνες", "amount": 50.00, "duration_months": 18},
}

# ===================== EMAIL NOTIFICATION =====================

async def send_subscription_notification(user_email: str, user_name: str, package_id: str, amount: float, subscription_id: str):
    """Send email notification to admin when a new subscription is created"""
    try:
        package_info = SUBSCRIPTION_PACKAGES.get(package_id, {})
        package_name = package_info.get("name", package_id)
        
        html_content = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0;">🎉 Νέος Συνδρομητής!</h1>
            </div>
            
            <div style="background: #f9f9f9; padding: 30px; border: 1px solid #ddd;">
                <h2 style="color: #333; margin-top: 0;">Στοιχεία Πελάτη</h2>
                
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #666;">Όνομα:</td>
                        <td style="padding: 10px; border-bottom: 1px solid #eee; color: #333;">{user_name}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #666;">Email:</td>
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
                        <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #666;">Subscription ID:</td>
                        <td style="padding: 10px; border-bottom: 1px solid #eee; color: #333; font-size: 12px;">{subscription_id}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; font-weight: bold; color: #666;">Ημερομηνία:</td>
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
            "from": SENDER_EMAIL,
            "to": [NOTIFICATION_EMAIL],
            "subject": f"🎉 Νέος Συνδρομητής: {user_name} - €{amount:.2f}",
            "html": html_content
        }
        
        # Run sync SDK in thread to keep FastAPI non-blocking
        email_response = await asyncio.to_thread(resend.Emails.send, params)
        logging.info(f"Notification email sent: {email_response}")
        return True
        
    except Exception as e:
        logging.error(f"Failed to send notification email: {str(e)}")
        return False

# Zodiac data
ZODIAC_SIGNS = [
    {"name": "Aries", "symbol": "♈", "element": "Fire", "start": (3, 21), "end": (4, 19)},
    {"name": "Taurus", "symbol": "♉", "element": "Earth", "start": (4, 20), "end": (5, 20)},
    {"name": "Gemini", "symbol": "♊", "element": "Air", "start": (5, 21), "end": (6, 20)},
    {"name": "Cancer", "symbol": "♋", "element": "Water", "start": (6, 21), "end": (7, 22)},
    {"name": "Leo", "symbol": "♌", "element": "Fire", "start": (7, 23), "end": (8, 22)},
    {"name": "Virgo", "symbol": "♍", "element": "Earth", "start": (8, 23), "end": (9, 22)},
    {"name": "Libra", "symbol": "♎", "element": "Air", "start": (9, 23), "end": (10, 22)},
    {"name": "Scorpio", "symbol": "♏", "element": "Water", "start": (10, 23), "end": (11, 21)},
    {"name": "Sagittarius", "symbol": "♐", "element": "Fire", "start": (11, 22), "end": (12, 21)},
    {"name": "Capricorn", "symbol": "♑", "element": "Earth", "start": (12, 22), "end": (1, 19)},
    {"name": "Aquarius", "symbol": "♒", "element": "Air", "start": (1, 20), "end": (2, 18)},
    {"name": "Pisces", "symbol": "♓", "element": "Water", "start": (2, 19), "end": (3, 20)},
]

# Zodiac names translated by language
ZODIAC_TRANSLATIONS = {
    "en": ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"],
    "de": ["Widder", "Stier", "Zwillinge", "Krebs", "Löwe", "Jungfrau", "Waage", "Skorpion", "Schütze", "Steinbock", "Wassermann", "Fische"],
    "el": ["Κριός", "Ταύρος", "Δίδυμοι", "Καρκίνος", "Λέων", "Παρθένος", "Ζυγός", "Σκορπιός", "Τοξότης", "Αιγόκερως", "Υδροχόος", "Ιχθύες"],
    "it": ["Ariete", "Toro", "Gemelli", "Cancro", "Leone", "Vergine", "Bilancia", "Scorpione", "Sagittario", "Capricorno", "Acquario", "Pesci"],
    "es": ["Aries", "Tauro", "Géminis", "Cáncer", "Leo", "Virgo", "Libra", "Escorpio", "Sagitario", "Capricornio", "Acuario", "Piscis"],
    "fr": ["Bélier", "Taureau", "Gémeaux", "Cancer", "Lion", "Vierge", "Balance", "Scorpion", "Sagittaire", "Capricorne", "Verseau", "Poissons"],
    "pt": ["Áries", "Touro", "Gêmeos", "Câncer", "Leão", "Virgem", "Libra", "Escorpião", "Sagitário", "Capricórnio", "Aquário", "Peixes"],
    "ru": ["Овен", "Телец", "Близнецы", "Рак", "Лев", "Дева", "Весы", "Скорпион", "Стрелец", "Козерог", "Водолей", "Рыбы"],
    "zh": ["白羊座", "金牛座", "双子座", "巨蟹座", "狮子座", "处女座", "天秤座", "天蝎座", "射手座", "摩羯座", "水瓶座", "双鱼座"],
    "ja": ["牡羊座", "牡牛座", "双子座", "蟹座", "獅子座", "乙女座", "天秤座", "蠍座", "射手座", "山羊座", "水瓶座", "魚座"],
    "ar": ["الحمل", "الثور", "الجوزاء", "السرطان", "الأسد", "العذراء", "الميزان", "العقرب", "القوس", "الجدي", "الدلو", "الحوت"],
    "hi": ["मेष", "वृषभ", "मिथुन", "कर्क", "सिंह", "कन्या", "तुला", "वृश्चिक", "धनु", "मकर", "कुंभ", "मीन"],
    "tr": ["Koç", "Boğa", "İkizler", "Yengeç", "Aslan", "Başak", "Terazi", "Akrep", "Yay", "Oğlak", "Kova", "Balık"],
    "pl": ["Baran", "Byk", "Bliźnięta", "Rak", "Lew", "Panna", "Waga", "Skorpion", "Strzelec", "Koziorożec", "Wodnik", "Ryby"],
    "cs": ["Beran", "Býk", "Blíženci", "Rak", "Lev", "Panna", "Váhy", "Štír", "Střelec", "Kozoroh", "Vodnář", "Ryby"],
    "sr": ["Ован", "Бик", "Близанци", "Рак", "Лав", "Девица", "Вага", "Шкорпија", "Стрелац", "Јарац", "Водолија", "Рибе"],
    "sv": ["Väduren", "Oxen", "Tvillingarna", "Kräftan", "Lejonet", "Jungfrun", "Vågen", "Skorpionen", "Skytten", "Stenbocken", "Vattumannen", "Fiskarna"],
    "fa": ["حمل", "ثور", "جوزا", "سرطان", "اسد", "سنبله", "میزان", "عقرب", "قوس", "جدی", "دلو", "حوت"],
    "ko": ["양자리", "황소자리", "쌍둥이자리", "게자리", "사자자리", "처녀자리", "천칭자리", "전갈자리", "궁수자리", "염소자리", "물병자리", "물고기자리"],
}

# Chinese Zodiac
CHINESE_ZODIAC = [
    {"name": "Rat", "symbol": "🐀", "years": [1924, 1936, 1948, 1960, 1972, 1984, 1996, 2008, 2020, 2032]},
    {"name": "Ox", "symbol": "🐂", "years": [1925, 1937, 1949, 1961, 1973, 1985, 1997, 2009, 2021, 2033]},
    {"name": "Tiger", "symbol": "🐅", "years": [1926, 1938, 1950, 1962, 1974, 1986, 1998, 2010, 2022, 2034]},
    {"name": "Rabbit", "symbol": "🐇", "years": [1927, 1939, 1951, 1963, 1975, 1987, 1999, 2011, 2023, 2035]},
    {"name": "Dragon", "symbol": "🐉", "years": [1928, 1940, 1952, 1964, 1976, 1988, 2000, 2012, 2024, 2036]},
    {"name": "Snake", "symbol": "🐍", "years": [1929, 1941, 1953, 1965, 1977, 1989, 2001, 2013, 2025, 2037]},
    {"name": "Horse", "symbol": "🐴", "years": [1930, 1942, 1954, 1966, 1978, 1990, 2002, 2014, 2026, 2038]},
    {"name": "Goat", "symbol": "🐐", "years": [1931, 1943, 1955, 1967, 1979, 1991, 2003, 2015, 2027, 2039]},
    {"name": "Monkey", "symbol": "🐒", "years": [1932, 1944, 1956, 1968, 1980, 1992, 2004, 2016, 2028, 2040]},
    {"name": "Rooster", "symbol": "🐓", "years": [1933, 1945, 1957, 1969, 1981, 1993, 2005, 2017, 2029, 2041]},
    {"name": "Dog", "symbol": "🐕", "years": [1934, 1946, 1958, 1970, 1982, 1994, 2006, 2018, 2030, 2042]},
    {"name": "Pig", "symbol": "🐖", "years": [1935, 1947, 1959, 1971, 1983, 1995, 2007, 2019, 2031, 2043]},
]

# Chinese Zodiac translations
CHINESE_ZODIAC_TRANSLATIONS = {
    "en": ["Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake", "Horse", "Goat", "Monkey", "Rooster", "Dog", "Pig"],
    "de": ["Ratte", "Ochse", "Tiger", "Hase", "Drache", "Schlange", "Pferd", "Ziege", "Affe", "Hahn", "Hund", "Schwein"],
    "el": ["Αρουραίος", "Βόδι", "Τίγρης", "Κουνέλι", "Δράκος", "Φίδι", "Άλογο", "Κατσίκα", "Μαϊμού", "Κόκορας", "Σκύλος", "Γουρούνι"],
    "zh": ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"],
    "ja": ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"],
    "ko": ["쥐", "소", "호랑이", "토끼", "용", "뱀", "말", "양", "원숭이", "닭", "개", "돼지"],
    "ru": ["Крыса", "Бык", "Тигр", "Кролик", "Дракон", "Змея", "Лошадь", "Коза", "Обезьяна", "Петух", "Собака", "Свинья"],
    "es": ["Rata", "Buey", "Tigre", "Conejo", "Dragón", "Serpiente", "Caballo", "Cabra", "Mono", "Gallo", "Perro", "Cerdo"],
    "fr": ["Rat", "Bœuf", "Tigre", "Lapin", "Dragon", "Serpent", "Cheval", "Chèvre", "Singe", "Coq", "Chien", "Cochon"],
    "it": ["Topo", "Bue", "Tigre", "Coniglio", "Drago", "Serpente", "Cavallo", "Capra", "Scimmia", "Gallo", "Cane", "Maiale"],
    "pt": ["Rato", "Boi", "Tigre", "Coelho", "Dragão", "Serpente", "Cavalo", "Cabra", "Macaco", "Galo", "Cão", "Porco"],
    "ar": ["الفأر", "الثور", "النمر", "الأرنب", "التنين", "الأفعى", "الحصان", "الماعز", "القرد", "الديك", "الكلب", "الخنزير"],
    "hi": ["चूहा", "बैल", "बाघ", "खरगोश", "ड्रैगन", "साँप", "घोड़ा", "बकरी", "बंदर", "मुर्गा", "कुत्ता", "सूअर"],
    "tr": ["Fare", "Öküz", "Kaplan", "Tavşan", "Ejderha", "Yılan", "At", "Keçi", "Maymun", "Horoz", "Köpek", "Domuz"],
}

# Lucky Elements Translations
LUCKY_COLORS_TRANSLATIONS = {
    "en": {"Red": "Red", "Orange": "Orange", "Green": "Green", "Pink": "Pink", "Yellow": "Yellow", 
           "Light Green": "Light Green", "White": "White", "Silver": "Silver", "Gold": "Gold",
           "Grey": "Grey", "Beige": "Beige", "Pale Yellow": "Pale Yellow", "Blue": "Blue",
           "Scarlet": "Scarlet", "Black": "Black", "Maroon": "Maroon", "Purple": "Purple",
           "Brown": "Brown", "Dark Green": "Dark Green", "Turquoise": "Turquoise", 
           "Sea Green": "Sea Green", "Lavender": "Lavender"},
    "de": {"Red": "Rot", "Orange": "Orange", "Green": "Grün", "Pink": "Rosa", "Yellow": "Gelb",
           "Light Green": "Hellgrün", "White": "Weiß", "Silver": "Silber", "Gold": "Gold",
           "Grey": "Grau", "Beige": "Beige", "Pale Yellow": "Blassgelb", "Blue": "Blau",
           "Scarlet": "Scharlachrot", "Black": "Schwarz", "Maroon": "Kastanienbraun", "Purple": "Lila",
           "Brown": "Braun", "Dark Green": "Dunkelgrün", "Turquoise": "Türkis",
           "Sea Green": "Meergrün", "Lavender": "Lavendel"},
    "el": {"Red": "Κόκκινο", "Orange": "Πορτοκαλί", "Green": "Πράσινο", "Pink": "Ροζ", "Yellow": "Κίτρινο",
           "Light Green": "Ανοιχτό Πράσινο", "White": "Λευκό", "Silver": "Ασημί", "Gold": "Χρυσό",
           "Grey": "Γκρι", "Beige": "Μπεζ", "Pale Yellow": "Απαλό Κίτρινο", "Blue": "Μπλε",
           "Scarlet": "Άλικο", "Black": "Μαύρο", "Maroon": "Καστανό", "Purple": "Μωβ",
           "Brown": "Καφέ", "Dark Green": "Σκούρο Πράσινο", "Turquoise": "Τιρκουάζ",
           "Sea Green": "Θαλασσί", "Lavender": "Λεβάντα"},
    "es": {"Red": "Rojo", "Orange": "Naranja", "Green": "Verde", "Pink": "Rosa", "Yellow": "Amarillo",
           "Light Green": "Verde Claro", "White": "Blanco", "Silver": "Plata", "Gold": "Oro",
           "Grey": "Gris", "Beige": "Beige", "Pale Yellow": "Amarillo Pálido", "Blue": "Azul",
           "Scarlet": "Escarlata", "Black": "Negro", "Maroon": "Granate", "Purple": "Púrpura",
           "Brown": "Marrón", "Dark Green": "Verde Oscuro", "Turquoise": "Turquesa",
           "Sea Green": "Verde Mar", "Lavender": "Lavanda"},
    "fr": {"Red": "Rouge", "Orange": "Orange", "Green": "Vert", "Pink": "Rose", "Yellow": "Jaune",
           "Light Green": "Vert Clair", "White": "Blanc", "Silver": "Argent", "Gold": "Or",
           "Grey": "Gris", "Beige": "Beige", "Pale Yellow": "Jaune Pâle", "Blue": "Bleu",
           "Scarlet": "Écarlate", "Black": "Noir", "Maroon": "Bordeaux", "Purple": "Violet",
           "Brown": "Marron", "Dark Green": "Vert Foncé", "Turquoise": "Turquoise",
           "Sea Green": "Vert Mer", "Lavender": "Lavande"},
    "it": {"Red": "Rosso", "Orange": "Arancione", "Green": "Verde", "Pink": "Rosa", "Yellow": "Giallo",
           "Light Green": "Verde Chiaro", "White": "Bianco", "Silver": "Argento", "Gold": "Oro",
           "Grey": "Grigio", "Beige": "Beige", "Pale Yellow": "Giallo Pallido", "Blue": "Blu",
           "Scarlet": "Scarlatto", "Black": "Nero", "Maroon": "Bordeaux", "Purple": "Viola",
           "Brown": "Marrone", "Dark Green": "Verde Scuro", "Turquoise": "Turchese",
           "Sea Green": "Verde Mare", "Lavender": "Lavanda"},
    "ru": {"Red": "Красный", "Orange": "Оранжевый", "Green": "Зелёный", "Pink": "Розовый", "Yellow": "Жёлтый",
           "Light Green": "Светло-зелёный", "White": "Белый", "Silver": "Серебряный", "Gold": "Золотой",
           "Grey": "Серый", "Beige": "Бежевый", "Pale Yellow": "Бледно-жёлтый", "Blue": "Синий",
           "Scarlet": "Алый", "Black": "Чёрный", "Maroon": "Бордовый", "Purple": "Фиолетовый",
           "Brown": "Коричневый", "Dark Green": "Тёмно-зелёный", "Turquoise": "Бирюзовый",
           "Sea Green": "Морской", "Lavender": "Лавандовый"},
    "zh": {"Red": "红色", "Orange": "橙色", "Green": "绿色", "Pink": "粉色", "Yellow": "黄色",
           "Light Green": "浅绿", "White": "白色", "Silver": "银色", "Gold": "金色",
           "Grey": "灰色", "Beige": "米色", "Pale Yellow": "淡黄", "Blue": "蓝色",
           "Scarlet": "猩红", "Black": "黑色", "Maroon": "栗色", "Purple": "紫色",
           "Brown": "棕色", "Dark Green": "深绿", "Turquoise": "青绿",
           "Sea Green": "海绿", "Lavender": "淡紫"},
    "ja": {"Red": "赤", "Orange": "オレンジ", "Green": "緑", "Pink": "ピンク", "Yellow": "黄色",
           "Light Green": "黄緑", "White": "白", "Silver": "銀", "Gold": "金",
           "Grey": "灰色", "Beige": "ベージュ", "Pale Yellow": "淡黄色", "Blue": "青",
           "Scarlet": "緋色", "Black": "黒", "Maroon": "栗色", "Purple": "紫",
           "Brown": "茶色", "Dark Green": "深緑", "Turquoise": "ターコイズ",
           "Sea Green": "シーグリーン", "Lavender": "ラベンダー"},
}

LUCKY_DAYS_TRANSLATIONS = {
    "en": {"Monday": "Monday", "Tuesday": "Tuesday", "Wednesday": "Wednesday", "Thursday": "Thursday",
           "Friday": "Friday", "Saturday": "Saturday", "Sunday": "Sunday"},
    "de": {"Monday": "Montag", "Tuesday": "Dienstag", "Wednesday": "Mittwoch", "Thursday": "Donnerstag",
           "Friday": "Freitag", "Saturday": "Samstag", "Sunday": "Sonntag"},
    "el": {"Monday": "Δευτέρα", "Tuesday": "Τρίτη", "Wednesday": "Τετάρτη", "Thursday": "Πέμπτη",
           "Friday": "Παρασκευή", "Saturday": "Σάββατο", "Sunday": "Κυριακή"},
    "es": {"Monday": "Lunes", "Tuesday": "Martes", "Wednesday": "Miércoles", "Thursday": "Jueves",
           "Friday": "Viernes", "Saturday": "Sábado", "Sunday": "Domingo"},
    "fr": {"Monday": "Lundi", "Tuesday": "Mardi", "Wednesday": "Mercredi", "Thursday": "Jeudi",
           "Friday": "Vendredi", "Saturday": "Samedi", "Sunday": "Dimanche"},
    "it": {"Monday": "Lunedì", "Tuesday": "Martedì", "Wednesday": "Mercoledì", "Thursday": "Giovedì",
           "Friday": "Venerdì", "Saturday": "Sabato", "Sunday": "Domenica"},
    "ru": {"Monday": "Понедельник", "Tuesday": "Вторник", "Wednesday": "Среда", "Thursday": "Четверг",
           "Friday": "Пятница", "Saturday": "Суббота", "Sunday": "Воскресенье"},
    "zh": {"Monday": "星期一", "Tuesday": "星期二", "Wednesday": "星期三", "Thursday": "星期四",
           "Friday": "星期五", "Saturday": "星期六", "Sunday": "星期日"},
    "ja": {"Monday": "月曜日", "Tuesday": "火曜日", "Wednesday": "水曜日", "Thursday": "木曜日",
           "Friday": "金曜日", "Saturday": "土曜日", "Sunday": "日曜日"},
}

# Lucky Gemstones by Zodiac
LUCKY_GEMSTONES = {
    "Aries": {"name": "Diamond", "symbol": "💎", "color": "#b9f2ff"},
    "Taurus": {"name": "Emerald", "symbol": "💚", "color": "#50C878"},
    "Gemini": {"name": "Pearl", "symbol": "🤍", "color": "#FDEEF4"},
    "Cancer": {"name": "Ruby", "symbol": "❤️", "color": "#E0115F"},
    "Leo": {"name": "Peridot", "symbol": "💛", "color": "#B4C424"},
    "Virgo": {"name": "Sapphire", "symbol": "💙", "color": "#0F52BA"},
    "Libra": {"name": "Opal", "symbol": "🌈", "color": "#A8C3BC"},
    "Scorpio": {"name": "Topaz", "symbol": "🧡", "color": "#FFC87C"},
    "Sagittarius": {"name": "Turquoise", "symbol": "💠", "color": "#40E0D0"},
    "Capricorn": {"name": "Garnet", "symbol": "🔴", "color": "#733635"},
    "Aquarius": {"name": "Amethyst", "symbol": "💜", "color": "#9966CC"},
    "Pisces": {"name": "Aquamarine", "symbol": "🩵", "color": "#7FFFD4"},
}

GEMSTONE_TRANSLATIONS = {
    "en": {"Diamond": "Diamond", "Emerald": "Emerald", "Pearl": "Pearl", "Ruby": "Ruby",
           "Peridot": "Peridot", "Sapphire": "Sapphire", "Opal": "Opal", "Topaz": "Topaz",
           "Turquoise": "Turquoise", "Garnet": "Garnet", "Amethyst": "Amethyst", "Aquamarine": "Aquamarine"},
    "de": {"Diamond": "Diamant", "Emerald": "Smaragd", "Pearl": "Perle", "Ruby": "Rubin",
           "Peridot": "Peridot", "Sapphire": "Saphir", "Opal": "Opal", "Topaz": "Topas",
           "Turquoise": "Türkis", "Garnet": "Granat", "Amethyst": "Amethyst", "Aquamarine": "Aquamarin"},
    "el": {"Diamond": "Διαμάντι", "Emerald": "Σμαράγδι", "Pearl": "Μαργαριτάρι", "Ruby": "Ρουμπίνι",
           "Peridot": "Περίδοτο", "Sapphire": "Ζαφείρι", "Opal": "Οπάλιο", "Topaz": "Τοπάζι",
           "Turquoise": "Τιρκουάζ", "Garnet": "Γρανάτης", "Amethyst": "Αμέθυστος", "Aquamarine": "Ακουαμαρίνα"},
    "es": {"Diamond": "Diamante", "Emerald": "Esmeralda", "Pearl": "Perla", "Ruby": "Rubí",
           "Peridot": "Peridoto", "Sapphire": "Zafiro", "Opal": "Ópalo", "Topaz": "Topacio",
           "Turquoise": "Turquesa", "Garnet": "Granate", "Amethyst": "Amatista", "Aquamarine": "Aguamarina"},
    "fr": {"Diamond": "Diamant", "Emerald": "Émeraude", "Pearl": "Perle", "Ruby": "Rubis",
           "Peridot": "Péridot", "Sapphire": "Saphir", "Opal": "Opale", "Topaz": "Topaze",
           "Turquoise": "Turquoise", "Garnet": "Grenat", "Amethyst": "Améthyste", "Aquamarine": "Aigue-marine"},
    "it": {"Diamond": "Diamante", "Emerald": "Smeraldo", "Pearl": "Perla", "Ruby": "Rubino",
           "Peridot": "Peridoto", "Sapphire": "Zaffiro", "Opal": "Opale", "Topaz": "Topazio",
           "Turquoise": "Turchese", "Garnet": "Granato", "Amethyst": "Ametista", "Aquamarine": "Acquamarina"},
    "ru": {"Diamond": "Бриллиант", "Emerald": "Изумруд", "Pearl": "Жемчуг", "Ruby": "Рубин",
           "Peridot": "Перидот", "Sapphire": "Сапфир", "Opal": "Опал", "Topaz": "Топаз",
           "Turquoise": "Бирюза", "Garnet": "Гранат", "Amethyst": "Аметист", "Aquamarine": "Аквамарин"},
    "zh": {"Diamond": "钻石", "Emerald": "祖母绿", "Pearl": "珍珠", "Ruby": "红宝石",
           "Peridot": "橄榄石", "Sapphire": "蓝宝石", "Opal": "蛋白石", "Topaz": "黄玉",
           "Turquoise": "绿松石", "Garnet": "石榴石", "Amethyst": "紫水晶", "Aquamarine": "海蓝宝石"},
    "ja": {"Diamond": "ダイヤモンド", "Emerald": "エメラルド", "Pearl": "真珠", "Ruby": "ルビー",
           "Peridot": "ペリドット", "Sapphire": "サファイア", "Opal": "オパール", "Topaz": "トパーズ",
           "Turquoise": "ターコイズ", "Garnet": "ガーネット", "Amethyst": "アメジスト", "Aquamarine": "アクアマリン"},
}

# Baby Products for Shopping Links
BABY_PRODUCTS = {
    "gemstone": {
        "amazon_search": "baby birthstone jewelry {gemstone}",
        "ebay_search": "baby {gemstone} pendant necklace"
    },
    "zodiac": {
        "amazon_search": "baby {zodiac} zodiac gift",
        "ebay_search": "baby {zodiac} constellation blanket"
    },
    "color": {
        "amazon_search": "baby clothes {color}",
        "ebay_search": "baby outfit {color}"
    }
}

def translate_lucky_color(color: str, lang: str) -> str:
    """Translate lucky color to user's language"""
    translations = LUCKY_COLORS_TRANSLATIONS.get(lang, LUCKY_COLORS_TRANSLATIONS["en"])
    return translations.get(color, color)

def translate_lucky_day(day: str, lang: str) -> str:
    """Translate lucky day to user's language"""
    translations = LUCKY_DAYS_TRANSLATIONS.get(lang, LUCKY_DAYS_TRANSLATIONS["en"])
    return translations.get(day, day)

def get_lucky_gemstone(zodiac_name: str, lang: str) -> dict:
    """Get lucky gemstone for a zodiac sign with translation"""
    gemstone_data = LUCKY_GEMSTONES.get(zodiac_name, LUCKY_GEMSTONES["Aries"])
    gemstone_name = gemstone_data["name"]
    translations = GEMSTONE_TRANSLATIONS.get(lang, GEMSTONE_TRANSLATIONS["en"])
    
    return {
        "name": translations.get(gemstone_name, gemstone_name),
        "english_name": gemstone_name,
        "symbol": gemstone_data["symbol"],
        "color": gemstone_data["color"]
    }

def get_shopping_links(zodiac_name: str, gemstone_name: str, color: str) -> dict:
    """Generate shopping links for baby products"""
    # Create search queries
    gemstone_amazon = f"https://www.amazon.com/s?k=baby+{gemstone_name.lower()}+birthstone+gift"
    gemstone_ebay = f"https://www.ebay.com/sch/i.html?_nkw=baby+{gemstone_name.lower()}+jewelry"
    
    zodiac_amazon = f"https://www.amazon.com/s?k=baby+{zodiac_name.lower()}+zodiac+gift"
    zodiac_ebay = f"https://www.ebay.com/sch/i.html?_nkw=baby+{zodiac_name.lower()}+constellation"
    
    color_clean = color.split()[0].lower()  # Take first word of color
    clothes_amazon = f"https://www.amazon.com/s?k=baby+clothes+{color_clean}"
    clothes_ebay = f"https://www.ebay.com/sch/i.html?_nkw=baby+outfit+{color_clean}"
    
    return {
        "gemstone": {
            "amazon": gemstone_amazon,
            "ebay": gemstone_ebay
        },
        "zodiac": {
            "amazon": zodiac_amazon,
            "ebay": zodiac_ebay
        },
        "clothes": {
            "amazon": clothes_amazon,
            "ebay": clothes_ebay
        }
    }

# Extended Personality Traits (50+ per element)
PERSONALITY_TRAITS = {
    "Fire": [
        "passionate", "energetic", "courageous", "adventurous", "confident", 
        "enthusiastic", "dynamic", "bold", "spontaneous", "optimistic",
        "charismatic", "inspiring", "determined", "competitive", "ambitious",
        "independent", "creative", "warm", "generous", "exciting",
        "impulsive", "fearless", "pioneering", "action-oriented", "direct",
        "expressive", "dramatic", "magnetic", "assertive", "vivacious",
        "spirited", "intense", "fiery", "lively", "daring",
        "trailblazing", "motivating", "radiant", "powerful", "unstoppable",
        "free-spirited", "risk-taking", "self-assured", "natural leader", "trendsetter",
        "influential", "bright", "burning desire", "warrior spirit", "champion"
    ],
    "Earth": [
        "practical", "reliable", "patient", "ambitious", "grounded",
        "stable", "hardworking", "persistent", "loyal", "sensible",
        "methodical", "organized", "responsible", "disciplined", "realistic",
        "dependable", "thorough", "cautious", "traditional", "steady",
        "materialistic", "goal-oriented", "efficient", "productive", "conservative",
        "pragmatic", "determined", "resourceful", "tenacious", "structured",
        "focused", "dedicated", "committed", "trustworthy", "solid",
        "down-to-earth", "systematic", "meticulous", "calculated", "enduring",
        "builder", "provider", "protector", "planner", "achiever",
        "wealth-conscious", "security-oriented", "nature-loving", "tactile", "sensual"
    ],
    "Air": [
        "intellectual", "communicative", "curious", "social", "innovative",
        "analytical", "logical", "witty", "versatile", "objective",
        "fair-minded", "diplomatic", "idealistic", "progressive", "inventive",
        "quick-thinking", "articulate", "clever", "adaptable", "rational",
        "open-minded", "theoretical", "abstract", "conceptual", "visionary",
        "networking", "collaborative", "persuasive", "eloquent", "refined",
        "cultured", "sophisticated", "knowledgeable", "educated", "thoughtful",
        "debating", "questioning", "exploring", "connecting", "bridging",
        "mediating", "harmonizing", "balancing", "negotiating", "facilitating",
        "tech-savvy", "future-oriented", "humanitarian", "freedom-loving", "independent-thinker"
    ],
    "Water": [
        "intuitive", "emotional", "compassionate", "creative", "sensitive",
        "empathetic", "nurturing", "imaginative", "dreamy", "mysterious",
        "psychic", "healing", "caring", "protective", "devoted",
        "romantic", "artistic", "poetic", "soulful", "deep",
        "reflective", "introspective", "meditative", "spiritual", "mystical",
        "perceptive", "understanding", "supportive", "gentle", "kind",
        "loving", "affectionate", "tender", "sympathetic", "receptive",
        "flowing", "adaptable", "changeable", "moody", "complex",
        "intense", "passionate", "profound", "transformative", "regenerative",
        "magical", "enchanting", "otherworldly", "transcendent", "connected"
    ],
}

# Zodiac Compatibility Matrix (1-10 scale)
ZODIAC_COMPATIBILITY = {
    ("Aries", "Aries"): 7, ("Aries", "Taurus"): 5, ("Aries", "Gemini"): 8, ("Aries", "Cancer"): 4,
    ("Aries", "Leo"): 9, ("Aries", "Virgo"): 4, ("Aries", "Libra"): 7, ("Aries", "Scorpio"): 5,
    ("Aries", "Sagittarius"): 9, ("Aries", "Capricorn"): 5, ("Aries", "Aquarius"): 8, ("Aries", "Pisces"): 5,
    
    ("Taurus", "Taurus"): 8, ("Taurus", "Gemini"): 4, ("Taurus", "Cancer"): 9, ("Taurus", "Leo"): 5,
    ("Taurus", "Virgo"): 9, ("Taurus", "Libra"): 6, ("Taurus", "Scorpio"): 8, ("Taurus", "Sagittarius"): 4,
    ("Taurus", "Capricorn"): 10, ("Taurus", "Aquarius"): 4, ("Taurus", "Pisces"): 8,
    
    ("Gemini", "Gemini"): 7, ("Gemini", "Cancer"): 5, ("Gemini", "Leo"): 8, ("Gemini", "Virgo"): 5,
    ("Gemini", "Libra"): 9, ("Gemini", "Scorpio"): 4, ("Gemini", "Sagittarius"): 8, ("Gemini", "Capricorn"): 4,
    ("Gemini", "Aquarius"): 10, ("Gemini", "Pisces"): 5,
    
    ("Cancer", "Cancer"): 8, ("Cancer", "Leo"): 6, ("Cancer", "Virgo"): 8, ("Cancer", "Libra"): 5,
    ("Cancer", "Scorpio"): 10, ("Cancer", "Sagittarius"): 4, ("Cancer", "Capricorn"): 7, ("Cancer", "Aquarius"): 4,
    ("Cancer", "Pisces"): 10,
    
    ("Leo", "Leo"): 7, ("Leo", "Virgo"): 5, ("Leo", "Libra"): 8, ("Leo", "Scorpio"): 6,
    ("Leo", "Sagittarius"): 10, ("Leo", "Capricorn"): 5, ("Leo", "Aquarius"): 7, ("Leo", "Pisces"): 5,
    
    ("Virgo", "Virgo"): 8, ("Virgo", "Libra"): 5, ("Virgo", "Scorpio"): 8, ("Virgo", "Sagittarius"): 4,
    ("Virgo", "Capricorn"): 9, ("Virgo", "Aquarius"): 4, ("Virgo", "Pisces"): 7,
    
    ("Libra", "Libra"): 7, ("Libra", "Scorpio"): 6, ("Libra", "Sagittarius"): 8, ("Libra", "Capricorn"): 5,
    ("Libra", "Aquarius"): 9, ("Libra", "Pisces"): 6,
    
    ("Scorpio", "Scorpio"): 8, ("Scorpio", "Sagittarius"): 5, ("Scorpio", "Capricorn"): 8,
    ("Scorpio", "Aquarius"): 5, ("Scorpio", "Pisces"): 10,
    
    ("Sagittarius", "Sagittarius"): 8, ("Sagittarius", "Capricorn"): 5, ("Sagittarius", "Aquarius"): 9,
    ("Sagittarius", "Pisces"): 6,
    
    ("Capricorn", "Capricorn"): 8, ("Capricorn", "Aquarius"): 5, ("Capricorn", "Pisces"): 7,
    
    ("Aquarius", "Aquarius"): 8, ("Aquarius", "Pisces"): 6,
    
    ("Pisces", "Pisces"): 8,
}

# Detailed Zodiac Profiles
ZODIAC_PROFILES = {
    "Aries": {
        "strengths": ["Leadership", "Courage", "Enthusiasm", "Confidence", "Determination"],
        "weaknesses": ["Impatience", "Impulsiveness", "Short temper", "Selfishness"],
        "lucky_numbers": [1, 8, 17],
        "lucky_colors": ["Red", "Orange"],
        "lucky_day": "Tuesday",
        "ruling_planet": "Mars",
        "best_match": ["Leo", "Sagittarius", "Aquarius"],
        "description": "Natural born leader with boundless energy and pioneering spirit."
    },
    "Taurus": {
        "strengths": ["Reliability", "Patience", "Practicality", "Devotion", "Stability"],
        "weaknesses": ["Stubbornness", "Possessiveness", "Uncompromising", "Materialistic"],
        "lucky_numbers": [2, 6, 9, 12, 24],
        "lucky_colors": ["Green", "Pink"],
        "lucky_day": "Friday",
        "ruling_planet": "Venus",
        "best_match": ["Cancer", "Virgo", "Capricorn"],
        "description": "Grounded and reliable soul who appreciates life's pleasures."
    },
    "Gemini": {
        "strengths": ["Adaptability", "Versatility", "Wit", "Intellect", "Communication"],
        "weaknesses": ["Nervousness", "Inconsistency", "Indecisiveness", "Superficiality"],
        "lucky_numbers": [5, 7, 14, 23],
        "lucky_colors": ["Yellow", "Light Green"],
        "lucky_day": "Wednesday",
        "ruling_planet": "Mercury",
        "best_match": ["Libra", "Aquarius", "Aries"],
        "description": "Quick-witted communicator with endless curiosity."
    },
    "Cancer": {
        "strengths": ["Loyalty", "Emotional depth", "Nurturing", "Intuition", "Protectiveness"],
        "weaknesses": ["Moodiness", "Over-sensitivity", "Clinginess", "Self-pity"],
        "lucky_numbers": [2, 7, 11, 16, 20],
        "lucky_colors": ["White", "Silver"],
        "lucky_day": "Monday",
        "ruling_planet": "Moon",
        "best_match": ["Scorpio", "Pisces", "Taurus"],
        "description": "Deeply caring and intuitive soul with strong family bonds."
    },
    "Leo": {
        "strengths": ["Creativity", "Generosity", "Warm-heartedness", "Humor", "Leadership"],
        "weaknesses": ["Arrogance", "Stubbornness", "Self-centeredness", "Inflexibility"],
        "lucky_numbers": [1, 3, 10, 19],
        "lucky_colors": ["Gold", "Orange", "Yellow"],
        "lucky_day": "Sunday",
        "ruling_planet": "Sun",
        "best_match": ["Aries", "Sagittarius", "Gemini"],
        "description": "Radiant personality who lights up any room with charisma."
    },
    "Virgo": {
        "strengths": ["Analytical mind", "Attention to detail", "Reliability", "Practicality", "Helpfulness"],
        "weaknesses": ["Overcritical", "Worry", "Shyness", "Perfectionism"],
        "lucky_numbers": [5, 14, 15, 23, 32],
        "lucky_colors": ["Grey", "Beige", "Pale Yellow"],
        "lucky_day": "Wednesday",
        "ruling_planet": "Mercury",
        "best_match": ["Taurus", "Capricorn", "Cancer"],
        "description": "Meticulous perfectionist with a heart of service."
    },
    "Libra": {
        "strengths": ["Diplomacy", "Fairness", "Social grace", "Charm", "Artistic sense"],
        "weaknesses": ["Indecisiveness", "Avoidance of conflict", "Self-pity", "People-pleasing"],
        "lucky_numbers": [4, 6, 13, 15, 24],
        "lucky_colors": ["Pink", "Blue", "Green"],
        "lucky_day": "Friday",
        "ruling_planet": "Venus",
        "best_match": ["Gemini", "Aquarius", "Leo"],
        "description": "Harmonious peacemaker with refined aesthetic sense."
    },
    "Scorpio": {
        "strengths": ["Resourcefulness", "Passion", "Determination", "Loyalty", "Depth"],
        "weaknesses": ["Jealousy", "Secretiveness", "Resentfulness", "Manipulativeness"],
        "lucky_numbers": [8, 11, 18, 22],
        "lucky_colors": ["Scarlet", "Black", "Maroon"],
        "lucky_day": "Tuesday",
        "ruling_planet": "Pluto",
        "best_match": ["Cancer", "Pisces", "Virgo"],
        "description": "Intensely passionate soul with transformative power."
    },
    "Sagittarius": {
        "strengths": ["Optimism", "Freedom-loving", "Honesty", "Philosophy", "Adventure"],
        "weaknesses": ["Impatience", "Tactlessness", "Restlessness", "Overconfidence"],
        "lucky_numbers": [3, 7, 9, 12, 21],
        "lucky_colors": ["Purple", "Blue"],
        "lucky_day": "Thursday",
        "ruling_planet": "Jupiter",
        "best_match": ["Aries", "Leo", "Aquarius"],
        "description": "Free-spirited adventurer seeking truth and meaning."
    },
    "Capricorn": {
        "strengths": ["Discipline", "Responsibility", "Self-control", "Ambition", "Management"],
        "weaknesses": ["Pessimism", "Stubbornness", "Rigidity", "Coldness"],
        "lucky_numbers": [4, 8, 13, 22],
        "lucky_colors": ["Brown", "Black", "Dark Green"],
        "lucky_day": "Saturday",
        "ruling_planet": "Saturn",
        "best_match": ["Taurus", "Virgo", "Pisces"],
        "description": "Ambitious achiever who builds lasting success."
    },
    "Aquarius": {
        "strengths": ["Independence", "Originality", "Humanitarianism", "Vision", "Innovation"],
        "weaknesses": ["Emotional detachment", "Unpredictability", "Stubbornness", "Aloofness"],
        "lucky_numbers": [4, 7, 11, 22, 29],
        "lucky_colors": ["Blue", "Turquoise"],
        "lucky_day": "Saturday",
        "ruling_planet": "Uranus",
        "best_match": ["Gemini", "Libra", "Sagittarius"],
        "description": "Visionary humanitarian ahead of their time."
    },
    "Pisces": {
        "strengths": ["Compassion", "Intuition", "Artistry", "Gentleness", "Wisdom"],
        "weaknesses": ["Escapism", "Over-trusting", "Victim mentality", "Fearfulness"],
        "lucky_numbers": [3, 9, 12, 15, 18, 24],
        "lucky_colors": ["Sea Green", "Lavender"],
        "lucky_day": "Thursday",
        "ruling_planet": "Neptune",
        "best_match": ["Cancer", "Scorpio", "Capricorn"],
        "description": "Deeply intuitive dreamer connected to the mystical."
    },
}

CHILD_NAMES_BY_REGION = {
    # ========== GREECE & CYPRUS ==========
    "greek": {
        "boy": ["Achilles", "Odysseus", "Hercules", "Perseus", "Theseus", "Ajax", "Hector",
                "Apollo", "Ares", "Hermes", "Dionysus", "Orpheus", "Jason", "Alexander",
                "Leonidas", "Pericles", "Socrates", "Plato", "Aristotle", "Archimedes",
                "Andreas", "Nikolas", "Dimitrios", "Konstantinos", "Theodoros", "Stephanos",
                "Georgios", "Ioannis", "Michail", "Petros", "Pavlos", "Christos", "Evangelos"],
        "girl": ["Athena", "Artemis", "Aphrodite", "Hera", "Demeter", "Persephone", "Hestia",
                 "Helen", "Penelope", "Cassandra", "Electra", "Ariadne", "Calliope", "Clio",
                 "Sophia", "Alexandra", "Eleni", "Maria", "Aikaterini", "Anastasia", "Theodora",
                 "Dimitra", "Eirini", "Paraskevi", "Angeliki", "Fotini", "Vasiliki", "Despina"],
        "countries": ["GR", "CY"]
    },
    
    # ========== ITALY ==========
    "italian": {
        "boy": ["Marco", "Luca", "Matteo", "Leonardo", "Alessandro", "Lorenzo", "Andrea",
                "Giovanni", "Francesco", "Giuseppe", "Antonio", "Salvatore", "Mario",
                "Luigi", "Pietro", "Paolo", "Stefano", "Roberto", "Carlo", "Enrico",
                "Fabio", "Giancarlo", "Massimo", "Riccardo", "Vincenzo", "Domenico"],
        "girl": ["Giulia", "Francesca", "Chiara", "Sara", "Martina", "Giorgia", "Alessia",
                 "Sofia", "Aurora", "Alice", "Ginevra", "Gaia", "Valentina", "Beatrice",
                 "Elisa", "Federica", "Ilaria", "Serena", "Roberta", "Paola", "Bianca"],
        "countries": ["IT", "SM", "VA"]
    },
    
    # ========== SPAIN & LATIN AMERICA ==========
    "spanish": {
        "boy": ["Santiago", "Mateo", "Diego", "Carlos", "Miguel", "Pablo", "Alejandro",
                "Fernando", "Rafael", "Antonio", "Francisco", "Jose", "Luis", "Juan",
                "Andres", "Sergio", "Javier", "Eduardo", "Manuel", "Ricardo", "Enrique"],
        "girl": ["Isabella", "Sofia", "Valentina", "Camila", "Lucia", "Elena", "Maria",
                 "Carmen", "Rosa", "Ana", "Paula", "Adriana", "Gabriela", "Daniela",
                 "Alejandra", "Fernanda", "Natalia", "Carolina", "Mariana", "Paloma"],
        "countries": ["ES", "MX", "AR", "CO", "PE", "VE", "CL", "EC", "GT", "CU", "BO", "DO", "HN", "PY", "SV", "NI", "CR", "PA", "UY"]
    },
    
    # ========== PORTUGAL & BRAZIL ==========
    "portuguese": {
        "boy": ["Joao", "Pedro", "Tiago", "Diogo", "Rodrigo", "Goncalo", "Miguel",
                "Rafael", "Bruno", "Hugo", "Andre", "Ricardo", "Nuno", "Vasco",
                "Afonso", "Duarte", "Henrique", "Luis", "Filipe", "Manuel", "Rui"],
        "girl": ["Mariana", "Beatriz", "Ana", "Ines", "Leonor", "Matilde", "Carolina",
                 "Sofia", "Maria", "Francisca", "Margarida", "Catarina", "Rita",
                 "Joana", "Teresa", "Clara", "Madalena", "Lara", "Diana", "Sara"],
        "countries": ["PT", "BR", "AO", "MZ"]
    },
    
    # ========== FRANCE ==========
    "french": {
        "boy": ["Louis", "Gabriel", "Raphael", "Jules", "Adam", "Lucas", "Leo",
                "Hugo", "Arthur", "Nathan", "Ethan", "Paul", "Noel", "Theo",
                "Antoine", "Baptiste", "Clement", "Maxime", "Alexandre", "Pierre"],
        "girl": ["Emma", "Louise", "Alice", "Chloe", "Lea", "Manon", "Ines",
                 "Camille", "Lola", "Jade", "Zoe", "Juliette", "Charlotte", "Clemence",
                 "Aurelie", "Marine", "Margot", "Anais", "Elise", "Amelie"],
        "countries": ["FR", "BE", "CH", "LU", "MC", "CA"]
    },
    
    # ========== GERMANY, AUSTRIA, SWITZERLAND ==========
    "german": {
        "boy": ["Felix", "Leon", "Paul", "Lukas", "Jonas", "Maximilian", "Elias",
                "Noah", "Ben", "Finn", "Luca", "Emil", "Anton", "Oskar", "Theo",
                "Moritz", "Johann", "Friedrich", "Wilhelm", "Heinrich", "Karl"],
        "girl": ["Emma", "Mia", "Hannah", "Sofia", "Emilia", "Anna", "Marie",
                 "Lina", "Lea", "Lena", "Clara", "Ella", "Amelie", "Luisa",
                 "Johanna", "Frieda", "Charlotte", "Mathilda", "Greta", "Helena"],
        "countries": ["DE", "AT", "CH", "LI"]
    },
    
    # ========== RUSSIA & EASTERN SLAVIC ==========
    "russian": {
        "boy": ["Ivan", "Dmitri", "Alexei", "Nikolai", "Sergei", "Vladimir", "Boris",
                "Fyodor", "Mikhail", "Pavel", "Andrei", "Yuri", "Oleg", "Igor",
                "Konstantin", "Vasily", "Grigori", "Maxim", "Roman", "Stanislav"],
        "girl": ["Anastasia", "Natasha", "Tatiana", "Olga", "Svetlana", "Yelena",
                 "Irina", "Marina", "Ekaterina", "Ludmila", "Nadia", "Vera",
                 "Daria", "Ksenia", "Larisa", "Galina", "Tamara", "Valentina"],
        "countries": ["RU", "BY", "UA", "KZ"]
    },
    
    # ========== POLAND ==========
    "polish": {
        "boy": ["Jakub", "Jan", "Szymon", "Filip", "Aleksander", "Franciszek", "Mikołaj",
                "Wojciech", "Adam", "Kacper", "Michał", "Mateusz", "Bartek", "Piotr",
                "Tomasz", "Krzysztof", "Paweł", "Marcin", "Kamil", "Dawid"],
        "girl": ["Zuzanna", "Julia", "Maja", "Zofia", "Hanna", "Lena", "Alicja",
                 "Maria", "Amelia", "Oliwia", "Wiktoria", "Emilia", "Aleksandra",
                 "Natalia", "Antonina", "Gabriela", "Agnieszka", "Magdalena", "Katarzyna"],
        "countries": ["PL"]
    },
    
    # ========== CZECH REPUBLIC & SLOVAKIA ==========
    "czech": {
        "boy": ["Jakub", "Jan", "Tomas", "Adam", "Matej", "Filip", "Vojtech",
                "Ondrej", "Lukas", "David", "Martin", "Petr", "Daniel", "Marek",
                "Pavel", "Jiri", "Michal", "Karel", "Vaclav", "Frantisek"],
        "girl": ["Eliska", "Anna", "Adela", "Tereza", "Natalie", "Viktorie", "Sofie",
                 "Karolina", "Barbora", "Kristyna", "Klara", "Lucie", "Katerina",
                 "Marketa", "Michaela", "Petra", "Veronika", "Jana", "Eva"],
        "countries": ["CZ", "SK"]
    },
    
    # ========== SERBIA, CROATIA, BALKANS ==========
    "serbian": {
        "boy": ["Nikola", "Stefan", "Luka", "Marko", "Aleksandar", "Milos", "Dusan",
                "Petar", "Filip", "Vuk", "Nemanja", "Uros", "Djordje", "Ivan",
                "Bogdan", "Miroslav", "Radoslav", "Svetoslav", "Vladislav", "Darko"],
        "girl": ["Ana", "Mila", "Sara", "Mia", "Marija", "Jana", "Teodora",
                 "Milica", "Jovana", "Tamara", "Katarina", "Jelena", "Natalija",
                 "Dragana", "Snezana", "Mirjana", "Biljana", "Vesna", "Ivana"],
        "countries": ["RS", "HR", "BA", "ME", "MK", "SI"]
    },
    
    # ========== SCANDINAVIA ==========
    "scandinavian": {
        "boy": ["Erik", "Lars", "Olaf", "Magnus", "Sven", "Anders", "Bjorn",
                "Leif", "Thor", "Axel", "Oscar", "Gustav", "Henrik", "Kristian",
                "Nils", "Frederik", "Mikkel", "Rasmus", "Emil", "Valdemar"],
        "girl": ["Ingrid", "Astrid", "Freya", "Sigrid", "Helga", "Greta", "Elsa",
                 "Saga", "Liv", "Maja", "Ebba", "Wilma", "Alma", "Ella",
                 "Freja", "Signe", "Thora", "Solveig", "Hedda", "Eira"],
        "countries": ["SE", "NO", "DK", "FI", "IS"]
    },
    
    # ========== UK & IRELAND ==========
    "english": {
        "boy": ["Oliver", "George", "Harry", "Noah", "Jack", "Leo", "Arthur",
                "Muhammad", "Oscar", "Charlie", "William", "James", "Henry", "Thomas",
                "Alexander", "Edward", "Sebastian", "Benjamin", "Lucas", "Theodore"],
        "girl": ["Olivia", "Amelia", "Isla", "Ava", "Mia", "Grace", "Freya",
                 "Emily", "Sophie", "Lily", "Ella", "Florence", "Evelyn", "Ivy",
                 "Charlotte", "Willow", "Poppy", "Isabella", "Daisy", "Rosie"],
        "countries": ["GB", "IE", "AU", "NZ"]
    },
    
    # ========== USA ==========
    "american": {
        "boy": ["Liam", "Noah", "Oliver", "James", "Elijah", "William", "Henry",
                "Lucas", "Benjamin", "Theodore", "Jack", "Levi", "Alexander", "Mason",
                "Ethan", "Jacob", "Michael", "Daniel", "Logan", "Jackson"],
        "girl": ["Olivia", "Emma", "Charlotte", "Amelia", "Sophia", "Mia", "Isabella",
                 "Ava", "Evelyn", "Luna", "Harper", "Camila", "Sofia", "Scarlett",
                 "Elizabeth", "Eleanor", "Emily", "Chloe", "Mila", "Violet"],
        "countries": ["US"]
    },
    
    # ========== CHINA ==========
    "chinese": {
        "boy": ["Wei", "Chen", "Ming", "Jian", "Long", "Feng", "Lei", "Hao",
                "Jun", "Tao", "Yang", "Zhi", "Xiang", "Cheng", "Bo", "Liang",
                "Yong", "Qiang", "Gang", "Hai", "Wen", "Jie", "Hui", "Peng"],
        "girl": ["Mei", "Lin", "Ying", "Xiu", "Lan", "Hua", "Jing", "Fang",
                 "Li", "Yan", "Yue", "Qian", "Xia", "Hong", "Juan", "Min",
                 "Na", "Ping", "Qing", "Rong", "Shan", "Ting", "Wei", "Xiao"],
        "countries": ["CN", "TW", "HK", "MO", "SG"]
    },
    
    # ========== JAPAN ==========
    "japanese": {
        "boy": ["Haruki", "Takeshi", "Kenji", "Yuki", "Ryu", "Akira", "Hiroshi",
                "Kazuki", "Daiki", "Sota", "Ren", "Yuto", "Kaito", "Hayato",
                "Kenta", "Shota", "Naoki", "Ryota", "Tatsuya", "Masashi"],
        "girl": ["Sakura", "Yuki", "Hana", "Akemi", "Yui", "Aiko", "Emi",
                 "Haruka", "Hikari", "Kaori", "Keiko", "Mai", "Mika", "Nana",
                 "Rina", "Saki", "Tomoko", "Yoko", "Ayumi", "Naomi"],
        "countries": ["JP"]
    },
    
    # ========== KOREA ==========
    "korean": {
        "boy": ["Min-jun", "Seo-jun", "Do-yun", "Ye-jun", "Si-woo", "Ha-joon", "Ji-ho",
                "Jun-seo", "Joo-won", "Hyun-woo", "Sung-min", "Jin-woo", "Tae-hyun", "Woo-jin"],
        "girl": ["Seo-yeon", "Ha-yoon", "Ji-woo", "Seo-yun", "Min-seo", "Chae-won", "Ye-eun",
                 "Ji-yoo", "Yoo-na", "Eun-bi", "Ha-na", "Su-bin", "Ye-jin", "Soo-yeon"],
        "countries": ["KR"]
    },
    
    # ========== INDIA ==========
    "indian": {
        "boy": ["Arjun", "Krishna", "Ravi", "Aditya", "Vikram", "Raj", "Amit",
                "Rahul", "Sanjay", "Deepak", "Suresh", "Rajesh", "Anil", "Vijay",
                "Shiva", "Ganesh", "Vishnu", "Karan", "Rohan", "Varun"],
        "girl": ["Priya", "Ananya", "Aisha", "Devi", "Lakshmi", "Saraswati", "Parvati",
                 "Sita", "Radha", "Maya", "Tara", "Uma", "Durga", "Rani",
                 "Sunita", "Kavita", "Anjali", "Pooja", "Neha", "Meera"],
        "countries": ["IN", "NP", "LK", "BD"]
    },
    
    # ========== ARAB COUNTRIES ==========
    "arabic": {
        "boy": ["Muhammad", "Ahmad", "Ali", "Hassan", "Hussein", "Omar", "Khalid",
                "Yusuf", "Ibrahim", "Ismail", "Hamza", "Bilal", "Tariq", "Salim",
                "Karim", "Jamal", "Rashid", "Samir", "Faisal", "Nasser"],
        "girl": ["Fatima", "Aisha", "Khadija", "Maryam", "Zahra", "Zainab", "Layla",
                 "Noor", "Amina", "Sara", "Hana", "Yasmin", "Rania", "Dina",
                 "Lina", "Salma", "Farida", "Samira", "Jamila", "Amira"],
        "countries": ["SA", "AE", "QA", "KW", "BH", "OM", "EG", "JO", "LB", "SY", "IQ", "YE", "LY", "TN", "DZ", "MA"]
    },
    
    # ========== TURKEY ==========
    "turkish": {
        "boy": ["Yusuf", "Eymen", "Omer", "Mustafa", "Emir", "Ali", "Kerem",
                "Ahmet", "Mehmet", "Can", "Burak", "Emre", "Kaan", "Efe",
                "Baris", "Deniz", "Ozan", "Umut", "Selim", "Arda"],
        "girl": ["Zeynep", "Elif", "Defne", "Azra", "Eylul", "Nehir", "Ecrin",
                 "Asya", "Mira", "Ela", "Ayse", "Fatma", "Esra", "Beyza",
                 "Merve", "Selin", "Ebru", "Ceren", "Gul", "Naz"],
        "countries": ["TR", "AZ"]
    },
    
    # ========== IRAN ==========
    "persian": {
        "boy": ["Darius", "Cyrus", "Xerxes", "Reza", "Ali", "Mohammad", "Amir",
                "Arash", "Babak", "Behnam", "Dariush", "Farhad", "Hossein", "Kamran",
                "Kaveh", "Mehdi", "Nima", "Omid", "Parviz", "Saeed"],
        "girl": ["Roxana", "Shirin", "Zahra", "Maryam", "Fatima", "Narges", "Leila",
                 "Sara", "Nazanin", "Parisa", "Mina", "Neda", "Samira", "Setareh",
                 "Laleh", "Mahsa", "Azar", "Golnar", "Pari", "Yasaman"],
        "countries": ["IR", "AF", "TJ"]
    },
    
    # ========== ISRAEL ==========
    "hebrew": {
        "boy": ["David", "Noam", "Eitan", "Uri", "Yonatan", "Itai", "Omer",
                "Ariel", "Daniel", "Yosef", "Moshe", "Adam", "Lior", "Nadav",
                "Gal", "Tal", "Roi", "Amit", "Elad", "Tomer"],
        "girl": ["Tamar", "Noa", "Shira", "Maya", "Yael", "Adel", "Talia",
                 "Avigail", "Naomi", "Michal", "Ruth", "Hana", "Miriam", "Sarah",
                 "Rivka", "Leah", "Rachel", "Esther", "Dina", "Ayelet"],
        "countries": ["IL"]
    },
    
    # ========== EGYPT ==========
    "egyptian": {
        "boy": ["Ramses", "Tutankhamun", "Akhenaten", "Amenhotep", "Thutmose", "Seti",
                "Osiris", "Horus", "Anubis", "Ra", "Thoth", "Ptah", "Amun",
                "Omar", "Ahmed", "Mohamed", "Mahmoud", "Youssef", "Khaled"],
        "girl": ["Nefertiti", "Cleopatra", "Isis", "Hathor", "Bastet", "Sekhmet",
                 "Nefertari", "Ankhesenamun", "Meritaten", "Maat", "Nut",
                 "Fatma", "Mariam", "Nour", "Salma", "Yasmin", "Hana"],
        "countries": ["EG"]
    },
    
    # ========== HAWAII ==========
    "hawaiian": {
        "boy": ["Kai", "Koa", "Makoa", "Keanu", "Lani", "Mana", "Nalu",
                "Kaimana", "Keoni", "Ikaika", "Kalani", "Kawika", "Lono", "Maui"],
        "girl": ["Leilani", "Moana", "Kaia", "Nalani", "Malia", "Alana", "Kalani",
                 "Lani", "Mahina", "Miliani", "Noelani", "Pua", "Keani", "Haunani"],
        "countries": ["US-HI"]
    },
    
    # ========== THAILAND ==========
    "thai": {
        "boy": ["Somchai", "Chai", "Nat", "Krit", "Pong", "Gun", "Tong",
                "Boon", "Lek", "Nong", "Art", "Bank", "Golf", "Pop"],
        "girl": ["Mali", "Ploy", "Fern", "Nong", "Nan", "Pim", "Bua",
                 "Dao", "Jai", "Joy", "Mint", "Noon", "Prae", "Fai"],
        "countries": ["TH"]
    },
    
    # ========== VIETNAM ==========
    "vietnamese": {
        "boy": ["An", "Binh", "Cuong", "Duc", "Hai", "Hung", "Khanh",
                "Long", "Minh", "Nam", "Phuc", "Quang", "Son", "Tuan"],
        "girl": ["Anh", "Bich", "Chi", "Dung", "Hanh", "Hoa", "Lan",
                 "Linh", "Mai", "Ngoc", "Phuong", "Thao", "Trang", "Van"],
        "countries": ["VN"]
    },
    
    # ========== INDONESIA ==========
    "indonesian": {
        "boy": ["Agus", "Budi", "Dewa", "Eka", "Fajar", "Gunawan", "Hendra",
                "Irwan", "Joko", "Kusuma", "Lutfi", "Made", "Nyoman", "Putu"],
        "girl": ["Ayu", "Bunga", "Citra", "Dewi", "Fitri", "Gita", "Indah",
                 "Kartika", "Lestari", "Maya", "Nadia", "Putri", "Ratna", "Sri"],
        "countries": ["ID"]
    },
    
    # ========== LATIN / ROMAN (Default for Europe) ==========
    "latin": {
        "boy": ["Marcus", "Julius", "Augustus", "Maximus", "Lucius", "Gaius", "Titus",
                "Aurelius", "Cornelius", "Claudius", "Antonius", "Octavius", "Felix",
                "Adrian", "Dominic", "Martin", "Patrick", "Victor", "Vincent"],
        "girl": ["Aurora", "Diana", "Venus", "Juno", "Minerva", "Julia", "Livia",
                 "Claudia", "Aurelia", "Cornelia", "Octavia", "Valentina", "Victoria",
                 "Lucia", "Cecilia", "Camilla", "Beatrix", "Clara", "Gloria"],
        "countries": []
    },
    
    # ========== BUDDHIST (Tibet, Myanmar, etc) ==========
    "buddhist": {
        "boy": ["Bodhi", "Dharma", "Siddhartha", "Ashoka", "Ananda", "Tenzin",
                "Lobsang", "Jamyang", "Thubten", "Sonam", "Dorje", "Pema", "Karma"],
        "girl": ["Tara", "Maya", "Padma", "Drolma", "Pema", "Tenzin", "Yangchen",
                 "Dolma", "Lhamo", "Sangye", "Chime", "Dechen", "Kunzang"],
        "countries": ["BT", "MM", "LA", "KH"]
    },
}

# Map country codes to regions
def get_region_for_country(country_code: str) -> str:
    """Get the name region based on country code"""
    if not country_code:
        return "latin"
    
    country_code = country_code.upper()
    
    # Check Hawaii specially (US-HI)
    if country_code == "US-HI":
        return "hawaiian"
    
    for region, data in CHILD_NAMES_BY_REGION.items():
        if country_code in data.get("countries", []):
            return region
    
    # Default fallback based on continent/region
    # European countries not specifically listed -> latin names
    european = ["AD", "AL", "AM", "AZ", "BY", "BG", "GE", "HU", "LT", "LV", "MD", "MT", "RO", "EE"]
    if country_code in european:
        return "latin"
    
    return "latin"  # Default

def get_names_for_region(region: str, gender: str) -> list:
    """Get names for a specific region and gender"""
    if region in CHILD_NAMES_BY_REGION:
        return CHILD_NAMES_BY_REGION[region].get(gender, [])
    return CHILD_NAMES_BY_REGION["latin"].get(gender, [])

def get_chinese_zodiac(year: int) -> dict:
    """Get Chinese zodiac based on year"""
    # Chinese New Year varies, so this is approximate
    index = (year - 1924) % 12
    return CHINESE_ZODIAC[index]

def get_chinese_zodiac_translated(year: int, lang: str = "en") -> dict:
    """Get Chinese zodiac with translated name"""
    zodiac = get_chinese_zodiac(year)
    index = CHINESE_ZODIAC.index(zodiac)
    translations = CHINESE_ZODIAC_TRANSLATIONS.get(lang, CHINESE_ZODIAC_TRANSLATIONS["en"])
    return {
        "name": translations[index],
        "english_name": zodiac["name"],
        "symbol": zodiac["symbol"]
    }

def get_zodiac_translated(sign_name: str, lang: str = "en") -> str:
    """Get translated zodiac name"""
    sign_names = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", 
                  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]
    if sign_name in sign_names:
        index = sign_names.index(sign_name)
        translations = ZODIAC_TRANSLATIONS.get(lang, ZODIAC_TRANSLATIONS["en"])
        return translations[index]
    return sign_name

def get_zodiac_compatibility(sign1: str, sign2: str) -> int:
    """Get compatibility score between two zodiac signs (1-10)"""
    # Check both orders since matrix might not have both
    if (sign1, sign2) in ZODIAC_COMPATIBILITY:
        return ZODIAC_COMPATIBILITY[(sign1, sign2)]
    if (sign2, sign1) in ZODIAC_COMPATIBILITY:
        return ZODIAC_COMPATIBILITY[(sign2, sign1)]
    return 5  # Default middle score

def get_parent_compatibility_analysis(parent1_sign: str, parent2_sign: str, lang: str = "en") -> dict:
    """Detailed compatibility analysis between parents"""
    score = get_zodiac_compatibility(parent1_sign, parent2_sign)
    
    # Get profiles
    profile1 = ZODIAC_PROFILES.get(parent1_sign, {})
    profile2 = ZODIAC_PROFILES.get(parent2_sign, {})
    
    # Compatibility level text
    if score >= 9:
        level = "Perfect"
        description_en = "An exceptional cosmic connection! Your energies harmonize beautifully."
    elif score >= 7:
        level = "Excellent"
        description_en = "A strong and compatible union with great potential."
    elif score >= 5:
        level = "Good"
        description_en = "A balanced relationship with room for growth together."
    else:
        level = "Challenging"
        description_en = "Different energies that can complement each other with effort."
    
    # Translate compatibility descriptions
    descriptions = {
        "en": description_en,
        "de": {
            "Perfect": "Eine außergewöhnliche kosmische Verbindung! Eure Energien harmonieren wunderbar.",
            "Excellent": "Eine starke und kompatible Verbindung mit großem Potenzial.",
            "Good": "Eine ausgewogene Beziehung mit Raum für gemeinsames Wachstum.",
            "Challenging": "Unterschiedliche Energien, die sich mit Mühe ergänzen können."
        },
        "el": {
            "Perfect": "Μια εξαιρετική κοσμική σύνδεση! Οι ενέργειές σας αρμονούν τέλεια.",
            "Excellent": "Μια δυνατή και συμβατή ένωση με μεγάλο δυναμικό.",
            "Good": "Μια ισορροπημένη σχέση με χώρο για κοινή ανάπτυξη.",
            "Challenging": "Διαφορετικές ενέργειες που μπορούν να αλληλοσυμπληρωθούν με προσπάθεια."
        },
        "es": {
            "Perfect": "¡Una conexión cósmica excepcional! Sus energías armonizan bellamente.",
            "Excellent": "Una unión fuerte y compatible con gran potencial.",
            "Good": "Una relación equilibrada con espacio para crecer juntos.",
            "Challenging": "Energías diferentes que pueden complementarse con esfuerzo."
        },
        "fr": {
            "Perfect": "Une connexion cosmique exceptionnelle! Vos énergies s'harmonisent magnifiquement.",
            "Excellent": "Une union forte et compatible avec un grand potentiel.",
            "Good": "Une relation équilibrée avec de la place pour grandir ensemble.",
            "Challenging": "Des énergies différentes qui peuvent se compléter avec effort."
        },
        "it": {
            "Perfect": "Una connessione cosmica eccezionale! Le vostre energie si armonizzano splendidamente.",
            "Excellent": "Un'unione forte e compatibile con grande potenziale.",
            "Good": "Una relazione equilibrata con spazio per crescere insieme.",
            "Challenging": "Energie diverse che possono completarsi con impegno."
        },
        "ru": {
            "Perfect": "Исключительная космическая связь! Ваши энергии прекрасно гармонируют.",
            "Excellent": "Сильный и совместимый союз с большим потенциалом.",
            "Good": "Сбалансированные отношения с возможностью для совместного роста.",
            "Challenging": "Разные энергии, которые могут дополнять друг друга при усилии."
        },
        "zh": {
            "Perfect": "非凡的宇宙连接！你们的能量完美和谐。",
            "Excellent": "强大而兼容的结合，具有巨大的潜力。",
            "Good": "平衡的关系，有共同成长的空间。",
            "Challenging": "不同的能量，通过努力可以互补。"
        },
        "ja": {
            "Perfect": "素晴らしい宇宙的つながり！エネルギーが美しく調和しています。",
            "Excellent": "大きな可能性を秘めた強力で相性の良い結合。",
            "Good": "一緒に成長する余地のあるバランスの取れた関係。",
            "Challenging": "努力すれば補い合える異なるエネルギー。"
        },
    }
    
    # Get translated description
    if lang in descriptions and isinstance(descriptions[lang], dict):
        final_description = descriptions[lang].get(level, description_en)
    else:
        final_description = description_en
    
    return {
        "score": score,
        "score_percentage": score * 10,
        "level": level,
        "description": final_description,
        "parent1_strengths": profile1.get("strengths", [])[:3],
        "parent2_strengths": profile2.get("strengths", [])[:3],
    }

def get_language_from_country(country_code: str) -> str:
    """Map country code to language code"""
    country_to_lang = {
        "GR": "el", "CY": "el",
        "DE": "de", "AT": "de", "CH": "de",
        "IT": "it", "SM": "it",
        "ES": "es", "MX": "es", "AR": "es", "CO": "es", "PE": "es",
        "PT": "pt", "BR": "pt",
        "FR": "fr", "BE": "fr", "CA": "fr",
        "RU": "ru", "BY": "ru", "UA": "ru",
        "CN": "zh", "TW": "zh", "HK": "zh",
        "JP": "ja",
        "KR": "ko",
        "IN": "hi",
        "SA": "ar", "AE": "ar", "EG": "ar", "QA": "ar",
        "TR": "tr",
        "IR": "fa",
        "PL": "pl",
        "CZ": "cs", "SK": "cs",
        "RS": "sr", "HR": "sr",
        "SE": "sv", "NO": "sv", "DK": "sv",
        "US": "en", "GB": "en", "AU": "en", "NZ": "en",
    }
    return country_to_lang.get(country_code, "en")

def get_zodiac_sign(month: int, day: int) -> dict:
    for sign in ZODIAC_SIGNS:
        start_month, start_day = sign["start"]
        end_month, end_day = sign["end"]
        
        if sign["name"] == "Capricorn":
            if (month == 12 and day >= 22) or (month == 1 and day <= 19):
                return sign
        elif (month == start_month and day >= start_day) or (month == end_month and day <= end_day):
            return sign
    return ZODIAC_SIGNS[0]

def calculate_numerology(date1: date, date2: date) -> int:
    total = sum(int(d) for d in date1.isoformat().replace("-", ""))
    total += sum(int(d) for d in date2.isoformat().replace("-", ""))
    while total > 9:
        total = sum(int(d) for d in str(total))
    return total

def predict_child(parent1_birthday: date, parent2_birthday: date, country_code: str = None) -> dict:
    seed = int(parent1_birthday.toordinal() * parent2_birthday.toordinal())
    random.seed(seed)
    
    numerology_number = calculate_numerology(parent1_birthday, parent2_birthday)
    gender = "boy" if numerology_number % 2 == 1 else "girl"
    
    today = datetime.now(timezone.utc).date()
    base_months = random.randint(9, 18)
    predicted_date = date(
        today.year + (today.month + base_months - 1) // 12,
        (today.month + base_months - 1) % 12 + 1,
        random.randint(1, 28)
    )
    
    # Get zodiac signs
    child_zodiac = get_zodiac_sign(predicted_date.month, predicted_date.day)
    parent1_zodiac = get_zodiac_sign(parent1_birthday.month, parent1_birthday.day)
    parent2_zodiac = get_zodiac_sign(parent2_birthday.month, parent2_birthday.day)
    
    # Get language from country
    lang = get_language_from_country(country_code) if country_code else "en"
    
    # Translated zodiac names
    child_zodiac_translated = get_zodiac_translated(child_zodiac["name"], lang)
    parent1_zodiac_translated = get_zodiac_translated(parent1_zodiac["name"], lang)
    parent2_zodiac_translated = get_zodiac_translated(parent2_zodiac["name"], lang)
    
    # Chinese zodiac for predicted birth year
    chinese_zodiac = get_chinese_zodiac_translated(predicted_date.year, lang)
    parent1_chinese = get_chinese_zodiac_translated(parent1_birthday.year, lang)
    parent2_chinese = get_chinese_zodiac_translated(parent2_birthday.year, lang)
    
    # Extended personality traits (8 traits instead of 5)
    elements = [parent1_zodiac["element"], parent2_zodiac["element"], child_zodiac["element"]]
    traits = []
    for element in set(elements):
        traits.extend(random.sample(PERSONALITY_TRAITS[element], 4))
    random.shuffle(traits)
    traits = traits[:8]
    
    # Get names based on country/region
    region = get_region_for_country(country_code)
    names_list = get_names_for_region(region, gender)
    if not names_list:
        names_list = CHILD_NAMES_BY_REGION["latin"].get(gender, ["Alex"])
    suggested_name = random.choice(names_list)
    
    # Parent compatibility analysis
    parent_compatibility = get_parent_compatibility_analysis(
        parent1_zodiac["name"], 
        parent2_zodiac["name"],
        lang
    )
    
    # Get zodiac profile for child
    child_profile = ZODIAC_PROFILES.get(child_zodiac["name"], {})
    
    # Element harmony
    element_harmony = {
        ("Fire", "Air"): 90, ("Air", "Fire"): 90,
        ("Earth", "Water"): 85, ("Water", "Earth"): 85,
        ("Fire", "Fire"): 80, ("Air", "Air"): 80,
        ("Earth", "Earth"): 75, ("Water", "Water"): 75,
        ("Fire", "Earth"): 60, ("Earth", "Fire"): 60,
        ("Air", "Water"): 55, ("Water", "Air"): 55,
        ("Fire", "Water"): 50, ("Water", "Fire"): 50,
        ("Air", "Earth"): 45, ("Earth", "Air"): 45,
    }
    
    base_harmony = element_harmony.get(
        (parent1_zodiac["element"], parent2_zodiac["element"]), 70
    )
    cosmic_harmony = min(100, base_harmony + random.randint(-5, 15))
    
    # Lucky elements from zodiac profile with translations
    lucky_colors_en = child_profile.get("lucky_colors", ["Purple", "Gold"])
    lucky_numbers = child_profile.get("lucky_numbers", [numerology_number])
    lucky_day_en = child_profile.get("lucky_day", "Monday")
    
    # Translate colors and day
    lucky_colors_translated = [translate_lucky_color(c, lang) for c in lucky_colors_en]
    lucky_day_translated = translate_lucky_day(lucky_day_en, lang)
    
    # Get lucky gemstone
    lucky_gemstone = get_lucky_gemstone(child_zodiac["name"], lang)
    
    # Get shopping links
    primary_color = lucky_colors_en[0] if lucky_colors_en else "Gold"
    shopping_links = get_shopping_links(
        child_zodiac["name"],
        lucky_gemstone["english_name"],
        primary_color
    )
    
    return {
        "predicted_birth_date": predicted_date.isoformat(),
        "predicted_gender": gender,
        "zodiac_sign": {
            "name": child_zodiac["name"],
            "translated_name": child_zodiac_translated,
            "symbol": child_zodiac["symbol"],
            "element": child_zodiac["element"],
            "ruling_planet": child_profile.get("ruling_planet", "Unknown"),
            "description": child_profile.get("description", ""),
            "strengths": child_profile.get("strengths", []),
            "weaknesses": child_profile.get("weaknesses", []),
            "best_match": child_profile.get("best_match", [])
        },
        "chinese_zodiac": {
            "name": chinese_zodiac["name"],
            "english_name": chinese_zodiac["english_name"],
            "symbol": chinese_zodiac["symbol"]
        },
        "personality_traits": traits,
        "suggested_name": suggested_name,
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
            "colors": lucky_colors_translated,
            "colors_en": lucky_colors_en,
            "numbers": lucky_numbers,
            "day": lucky_day_translated,
            "day_en": lucky_day_en,
            "gemstone": lucky_gemstone
        },
        "shopping_links": shopping_links,
        "region": region,
        "language": lang
    }

# Pydantic Models
class UserCreate(BaseModel):
    email: str
    password: str
    name: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    has_active_subscription: bool = False
    prediction_used: bool = False

class PredictionRequest(BaseModel):
    parent1_birthday: date
    parent2_birthday: date
    country_code: Optional[str] = None

class PredictionResponse(BaseModel):
    id: str
    predicted_birth_date: str
    predicted_gender: str
    zodiac_sign: dict
    personality_traits: List[str]
    suggested_name: str
    cosmic_harmony_score: int
    parent1_zodiac: dict
    parent2_zodiac: dict
    numerology_number: int
    lucky_elements: dict
    shopping_links: Optional[dict] = None
    chinese_zodiac: Optional[dict] = None
    parent_compatibility: Optional[dict] = None
    region: Optional[str] = None
    language: Optional[str] = None
    created_at: str

class CheckoutRequest(BaseModel):
    package_id: str
    origin_url: str

class PackageInfo(BaseModel):
    id: str
    name: str
    amount: float
    duration_months: int

# Auth helper
async def get_current_user(request: Request) -> dict:
    # Try cookie first
    session_token = request.cookies.get("session_token")
    
    # Then try Authorization header
    if not session_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header.split(" ")[1]
    
    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Find session
    session_doc = await db.user_sessions.find_one(
        {"session_token": session_token},
        {"_id": 0}
    )
    
    if not session_doc:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    # Check expiry
    expires_at = session_doc.get("expires_at")
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired")
    
    # Get user
    user_doc = await db.users.find_one(
        {"user_id": session_doc["user_id"]},
        {"_id": 0}
    )
    
    if not user_doc:
        raise HTTPException(status_code=401, detail="User not found")
    
    # Check subscription status
    subscription = await db.subscriptions.find_one(
        {"user_id": user_doc["user_id"], "status": "active"},
        {"_id": 0}
    )
    
    user_doc["has_active_subscription"] = subscription is not None
    user_doc["prediction_used"] = subscription.get("prediction_used", False) if subscription else False
    
    return user_doc

# ===================== AUTH ROUTES =====================

@api_router.post("/auth/register")
async def register(user_data: UserCreate, response: Response):
    # Check if user exists
    existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password
    import hashlib
    password_hash = hashlib.sha256(user_data.password.encode()).hexdigest()
    
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    
    await db.users.insert_one({
        "user_id": user_id,
        "email": user_data.email,
        "name": user_data.name,
        "password_hash": password_hash,
        "picture": None,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    # Create session
    session_token = f"session_{uuid.uuid4().hex}"
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7*24*60*60
    )
    
    return {
        "user_id": user_id,
        "email": user_data.email,
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
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Create session
    session_token = f"session_{uuid.uuid4().hex}"
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    
    await db.user_sessions.insert_one({
        "user_id": user["user_id"],
        "session_token": session_token,
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7*24*60*60
    )
    
    # Check subscription
    subscription = await db.subscriptions.find_one(
        {"user_id": user["user_id"], "status": "active"},
        {"_id": 0}
    )
    
    return {
        "user_id": user["user_id"],
        "email": user["email"],
        "name": user["name"],
        "picture": user.get("picture"),
        "has_active_subscription": subscription is not None,
        "prediction_used": subscription.get("prediction_used", False) if subscription else False
    }

@api_router.get("/auth/session")
async def google_auth_session(request: Request, response: Response):
    """Handle Google OAuth session exchange"""
    session_id = request.headers.get("X-Session-ID")
    if not session_id:
        raise HTTPException(status_code=400, detail="No session ID provided")
    
    # Exchange session_id with Emergent Auth
    async with httpx.AsyncClient() as client:
        auth_response = await client.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": session_id}
        )
        
        if auth_response.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid session ID")
        
        auth_data = auth_response.json()
    
    # Check if user exists
    existing_user = await db.users.find_one({"email": auth_data["email"]}, {"_id": 0})
    
    if existing_user:
        user_id = existing_user["user_id"]
        # Update user info
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {
                "name": auth_data["name"],
                "picture": auth_data.get("picture")
            }}
        )
    else:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        await db.users.insert_one({
            "user_id": user_id,
            "email": auth_data["email"],
            "name": auth_data["name"],
            "picture": auth_data.get("picture"),
            "created_at": datetime.now(timezone.utc).isoformat()
        })
    
    # Create session
    session_token = auth_data.get("session_token") or f"session_{uuid.uuid4().hex}"
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7*24*60*60
    )
    
    # Check subscription
    subscription = await db.subscriptions.find_one(
        {"user_id": user_id, "status": "active"},
        {"_id": 0}
    )
    
    return {
        "user_id": user_id,
        "email": auth_data["email"],
        "name": auth_data["name"],
        "picture": auth_data.get("picture"),
        "has_active_subscription": subscription is not None,
        "prediction_used": subscription.get("prediction_used", False) if subscription else False
    }

@api_router.get("/auth/me")
async def get_me(user: dict = Depends(get_current_user)):
    return user

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    session_token = request.cookies.get("session_token")
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    
    response.delete_cookie(key="session_token", path="/")
    return {"message": "Logged out successfully"}

# ===================== SUBSCRIPTION ROUTES =====================

@api_router.get("/packages", response_model=List[PackageInfo])
async def get_packages():
    """Get available subscription packages"""
    return [
        PackageInfo(id=key, **value) for key, value in SUBSCRIPTION_PACKAGES.items()
    ]

@api_router.post("/checkout/create")
async def create_checkout(
    checkout_data: CheckoutRequest,
    request: Request,
    user: dict = Depends(get_current_user)
):
    """Create Stripe checkout session"""
    if checkout_data.package_id not in SUBSCRIPTION_PACKAGES:
        raise HTTPException(status_code=400, detail="Invalid package")
    
    package = SUBSCRIPTION_PACKAGES[checkout_data.package_id]
    
    # Build URLs from provided origin
    success_url = f"{checkout_data.origin_url}/payment-success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{checkout_data.origin_url}/subscribe"
    
    # Create checkout session using official Stripe SDK
    session = stripe.checkout.Session.create(
        payment_method_types=["card"],
        line_items=[{
            "price_data": {
                "currency": "eur",
                "product_data": {
                    "name": f"BabyWish - {package['name']}",
                    "description": f"Συνδρομή {package['duration_months']} μηνών"
                },
                "unit_amount": int(package["amount"] * 100),  # Stripe uses cents
            },
            "quantity": 1,
        }],
        mode="payment",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "user_id": user["user_id"],
            "package_id": checkout_data.package_id,
            "duration_months": str(package["duration_months"])
        }
    )
    
    # Create payment transaction record
    await db.payment_transactions.insert_one({
        "session_id": session.id,
        "user_id": user["user_id"],
        "package_id": checkout_data.package_id,
        "amount": package["amount"],
        "currency": "eur",
        "payment_status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {"url": session.url, "session_id": session.id}

@api_router.get("/checkout/status/{session_id}")
async def get_checkout_status(
    session_id: str,
    request: Request,
    user: dict = Depends(get_current_user)
):
    """Check payment status and activate subscription if paid"""
    # Retrieve session from Stripe
    session = stripe.checkout.Session.retrieve(session_id)
    
    payment_status = session.payment_status  # "paid", "unpaid", or "no_payment_required"
    status = session.status  # "complete", "expired", or "open"
    
    # Update transaction
    await db.payment_transactions.update_one(
        {"session_id": session_id},
        {"$set": {
            "payment_status": payment_status,
            "status": status,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    # If paid, create subscription
    if payment_status == "paid":
        # Check if subscription already created for this session
        existing_sub = await db.subscriptions.find_one(
            {"payment_session_id": session_id},
            {"_id": 0}
        )
        
        if not existing_sub:
            metadata = session.metadata
            package_id = metadata.get("package_id")
            duration_months = int(metadata.get("duration_months", 3))
            
            # Deactivate any existing subscription
            await db.subscriptions.update_many(
                {"user_id": user["user_id"], "status": "active"},
                {"$set": {"status": "replaced"}}
            )
            
            # Create new subscription
            expires_at = datetime.now(timezone.utc) + timedelta(days=duration_months * 30)
            subscription_id = f"sub_{uuid.uuid4().hex[:12]}"
            
            await db.subscriptions.insert_one({
                "subscription_id": subscription_id,
                "user_id": user["user_id"],
                "package_id": package_id,
                "payment_session_id": session_id,
                "status": "active",
                "prediction_used": False,
                "expires_at": expires_at.isoformat(),
                "created_at": datetime.now(timezone.utc).isoformat()
            })
            
            # Send email notification to admin
            package_info = SUBSCRIPTION_PACKAGES.get(package_id, {})
            await send_subscription_notification(
                user_email=user.get("email", "N/A"),
                user_name=user.get("name", user.get("email", "Unknown")),
                package_id=package_id,
                amount=package_info.get("amount", 0),
                subscription_id=subscription_id
            )
    
    return {
        "status": status,
        "payment_status": payment_status,
        "amount_total": session.amount_total,
        "currency": session.currency
    }

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    """Handle Stripe webhooks"""
    body = await request.body()
    signature = request.headers.get("Stripe-Signature")
    
    # Get webhook secret from env (optional, but recommended for production)
    webhook_secret = os.environ.get('STRIPE_WEBHOOK_SECRET')
    
    try:
        if webhook_secret:
            event = stripe.Webhook.construct_event(body, signature, webhook_secret)
        else:
            # Without webhook secret, just parse the event (less secure)
            import json
            event = stripe.Event.construct_from(json.loads(body), stripe.api_key)
        
        # Handle checkout.session.completed event
        if event.type == "checkout.session.completed":
            session = event.data.object
            
            if session.payment_status == "paid":
                # Update transaction
                await db.payment_transactions.update_one(
                    {"session_id": session.id},
                    {"$set": {
                        "payment_status": "paid",
                        "updated_at": datetime.now(timezone.utc).isoformat()
                    }}
                )
        
        return {"status": "ok"}
    except Exception as e:
        logging.error(f"Webhook error: {e}")
        return {"status": "error", "message": str(e)}

# ===================== NAME SHOWCASE =====================

@api_router.get("/names/showcase")
async def get_names_showcase(request: Request):
    """Get names based on user's location for the showcase page"""
    # Get user's IP and country
    country_code = "US"
    country_name = "United States"
    
    # Try to get country from headers (set by geolocation)
    forwarded_for = request.headers.get("x-forwarded-for", "")
    client_ip = forwarded_for.split(",")[0].strip() if forwarded_for else request.client.host
    
    # Get country from IP using ipapi
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"https://ipapi.co/{client_ip}/json/", timeout=5.0)
            if response.status_code == 200:
                data = response.json()
                country_code = data.get("country_code", "US")
                country_name = data.get("country_name", "United States")
    except Exception as e:
        logging.warning(f"Could not get geolocation: {e}")
    
    # Get region and names
    region = get_region_for_country(country_code)
    boy_names = get_names_for_region(region, "boy")
    girl_names = get_names_for_region(region, "girl")
    
    # Limit to 12 names each and shuffle for variety
    random.shuffle(boy_names)
    random.shuffle(girl_names)
    
    return {
        "boy_names": boy_names[:12],
        "girl_names": girl_names[:12],
        "region": region,
        "country": country_name,
        "country_code": country_code
    }

# ===================== PREDICTION ROUTES =====================

@api_router.get("/")
async def root():
    return {"message": "Babywish API"}

@api_router.post("/predict", response_model=dict)
async def create_prediction(
    request_data: PredictionRequest,
    user: dict = Depends(get_current_user)
):
    """Create prediction - requires active subscription with unused prediction
    NOTE: Predictions are saved as 'pending' and require admin approval before being shown to user
    """
    # Check subscription
    subscription = await db.subscriptions.find_one(
        {"user_id": user["user_id"], "status": "active"},
        {"_id": 0}
    )
    
    if not subscription:
        raise HTTPException(
            status_code=403,
            detail="Απαιτείται ενεργή συνδρομή για πρόβλεψη"
        )
    
    if subscription.get("prediction_used", False):
        raise HTTPException(
            status_code=403,
            detail="Έχετε ήδη χρησιμοποιήσει την πρόβλεψή σας. Αγοράστε νέα συνδρομή."
        )
    
    # Check expiry
    expires_at = subscription.get("expires_at")
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        await db.subscriptions.update_one(
            {"subscription_id": subscription["subscription_id"]},
            {"$set": {"status": "expired"}}
        )
        raise HTTPException(
            status_code=403,
            detail="Η συνδρομή σας έχει λήξει. Αγοράστε νέα συνδρομή."
        )
    
    # Create prediction (AI analysis)
    prediction = predict_child(
        request_data.parent1_birthday, 
        request_data.parent2_birthday,
        request_data.country_code
    )
    
    prediction_id = str(uuid.uuid4())
    created_at = datetime.now(timezone.utc).isoformat()
    
    # Get user email for notification
    user_doc = await db.users.find_one({"user_id": user["user_id"]}, {"_id": 0, "email": 1, "name": 1})
    user_email = user_doc.get("email", "") if user_doc else ""
    user_name = user_doc.get("name", "") if user_doc else ""
    
    # Store prediction with PENDING status - requires admin approval
    doc = {
        "id": prediction_id,
        **prediction,
        "user_id": user["user_id"],
        "user_email": user_email,
        "user_name": user_name,
        "parent1_birthday": request_data.parent1_birthday.isoformat(),
        "parent2_birthday": request_data.parent2_birthday.isoformat(),
        "created_at": created_at,
        "status": "pending",  # PENDING APPROVAL
        "approved_at": None,
        "approved_by": None
    }
    await db.predictions.insert_one(doc)
    
    # Mark prediction as used
    await db.subscriptions.update_one(
        {"subscription_id": subscription["subscription_id"]},
        {"$set": {"prediction_used": True}}
    )
    
    # Return pending status instead of actual prediction
    return {
        "id": prediction_id,
        "status": "pending",
        "message": "Η πρόβλεψή σας υποβλήθηκε επιτυχώς! Θα λάβετε το αποτέλεσμα στο email σας εντός 24 ωρών.",
        "message_en": "Your prediction has been submitted successfully! You will receive the result in your email within 24 hours.",
        "created_at": created_at
    }

@api_router.get("/my-prediction")
async def get_my_prediction(user: dict = Depends(get_current_user)):
    """Get user's approved prediction if exists"""
    # First check for approved prediction
    prediction = await db.predictions.find_one(
        {"user_id": user["user_id"], "status": "approved"},
        {"_id": 0}
    )
    
    if prediction:
        return prediction
    
    # Check if there's a pending prediction
    pending = await db.predictions.find_one(
        {"user_id": user["user_id"], "status": "pending"},
        {"_id": 0, "id": 1, "status": 1, "created_at": 1}
    )
    
    if pending:
        return {
            "id": pending.get("id"),
            "status": "pending",
            "message": "Η πρόβλεψή σας είναι υπό επεξεργασία. Θα λάβετε το αποτέλεσμα στο email σας σύντομα.",
            "message_en": "Your prediction is being processed. You will receive the result in your email soon.",
            "created_at": pending.get("created_at")
        }
    
    return None

@api_router.get("/my-predictions")
async def get_my_predictions(user: dict = Depends(get_current_user)):
    """Get all predictions for a user (history) - only approved ones"""
    predictions = await db.predictions.find(
        {"user_id": user["user_id"], "status": "approved"},
        {"_id": 0}
    ).sort("created_at", -1).to_list(length=50)
    
    return predictions

# ===================== ADMIN PREDICTION APPROVAL =====================

ADMIN_EMAILS = ["owner@getbabywish.com", "getbabywish@outlook.com", "getbabywish@hotmail.com"]

async def get_admin_user(user: dict = Depends(get_current_user)):
    """Check if user is admin"""
    user_doc = await db.users.find_one({"user_id": user["user_id"]}, {"_id": 0, "email": 1})
    if not user_doc or user_doc.get("email") not in ADMIN_EMAILS:
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

@api_router.get("/admin/pending-predictions")
async def get_pending_predictions(admin: dict = Depends(get_admin_user)):
    """Get all pending predictions for admin review"""
    predictions = await db.predictions.find(
        {"status": "pending"},
        {"_id": 0}
    ).sort("created_at", -1).to_list(length=100)
    
    return predictions

@api_router.get("/admin/all-predictions")
async def get_all_predictions(admin: dict = Depends(get_admin_user)):
    """Get all predictions for admin view"""
    predictions = await db.predictions.find(
        {},
        {"_id": 0}
    ).sort("created_at", -1).to_list(length=500)
    
    return predictions

@api_router.post("/admin/approve-prediction/{prediction_id}")
async def approve_prediction(prediction_id: str, admin: dict = Depends(get_admin_user)):
    """Approve a pending prediction and notify user"""
    # Find the prediction
    prediction = await db.predictions.find_one(
        {"id": prediction_id},
        {"_id": 0}
    )
    
    if not prediction:
        raise HTTPException(status_code=404, detail="Prediction not found")
    
    if prediction.get("status") == "approved":
        raise HTTPException(status_code=400, detail="Prediction already approved")
    
    # Update status to approved
    approved_at = datetime.now(timezone.utc).isoformat()
    await db.predictions.update_one(
        {"id": prediction_id},
        {"$set": {
            "status": "approved",
            "approved_at": approved_at,
            "approved_by": admin["user_id"]
        }}
    )
    
    # Send email notification to user
    user_email = prediction.get("user_email")
    user_name = prediction.get("user_name", "")
    gender = prediction.get("gender", "Unknown")
    suggested_name = prediction.get("suggested_name", "")
    
    if user_email:
        try:
            email_subject = "🎉 Your BabyWish Prediction is Ready!"
            email_html = f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #8b5cf6; text-align: center;">🎉 Your Prediction is Ready!</h1>
                <p>Dear {user_name or 'Parent'},</p>
                <p>Great news! Your baby gender prediction has been processed and is now available.</p>
                
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 15px; text-align: center; margin: 20px 0;">
                    <h2 style="color: white; margin: 0;">Predicted Gender: {gender}</h2>
                    <p style="color: white; margin: 10px 0;">Suggested Name: {suggested_name}</p>
                </div>
                
                <p>Log in to your dashboard to see the full prediction including:</p>
                <ul>
                    <li>Zodiac Sign & Personality</li>
                    <li>Lucky Elements</li>
                    <li>And more!</li>
                </ul>
                
                <p style="text-align: center;">
                    <a href="https://getbabywish.com/dashboard" style="background: #8b5cf6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block;">View Full Prediction</a>
                </p>
                
                <p style="color: #666; font-size: 12px; margin-top: 30px;">
                    Thank you for choosing BabyWish!<br>
                    With love, The BabyWish Team 💜
                </p>
            </div>
            """
            
            await send_email_resend(user_email, email_subject, email_html)
        except Exception as e:
            print(f"Failed to send approval email: {e}")
    
    return {
        "success": True,
        "message": f"Prediction approved and user notified at {user_email}",
        "prediction_id": prediction_id,
        "approved_at": approved_at
    }

@api_router.post("/admin/reject-prediction/{prediction_id}")
async def reject_prediction(prediction_id: str, reason: str = "", admin: dict = Depends(get_admin_user)):
    """Reject a prediction (refund case)"""
    prediction = await db.predictions.find_one(
        {"id": prediction_id},
        {"_id": 0}
    )
    
    if not prediction:
        raise HTTPException(status_code=404, detail="Prediction not found")
    
    # Update status to rejected
    await db.predictions.update_one(
        {"id": prediction_id},
        {"$set": {
            "status": "rejected",
            "rejected_at": datetime.now(timezone.utc).isoformat(),
            "rejected_by": admin["user_id"],
            "rejection_reason": reason
        }}
    )
    
    return {
        "success": True,
        "message": "Prediction rejected",
        "prediction_id": prediction_id
    }

# Daily horoscope messages by zodiac element and mood
HOROSCOPE_TEMPLATES = {
    "Fire": {
        "positive": [
            "Your energy is magnetic today. Take bold action on your dreams.",
            "Adventure calls! Trust your instincts and embrace new opportunities.",
            "Your passion ignites everything around you. Lead with confidence.",
            "Today brings exciting possibilities. Your courage will be rewarded.",
            "The universe supports your ambitions. Go after what you want!",
        ],
        "neutral": [
            "Balance your fire with patience. Good things take time.",
            "Focus your energy on what truly matters today.",
            "Your enthusiasm is inspiring, but pace yourself wisely.",
            "Channel your passion into productive pursuits.",
            "Take time to plan before you act today.",
        ],
        "challenging": [
            "Control your temper and think before reacting.",
            "Slow down and consider others' perspectives.",
            "Patience is your lesson today. Breathe deeply.",
            "Transform frustration into creative energy.",
            "Rest and recharge your fiery spirit.",
        ]
    },
    "Earth": {
        "positive": [
            "Your hard work is paying off. Expect rewards soon.",
            "Financial opportunities are on the horizon. Stay grounded.",
            "Your practical approach wins the day. Trust your methods.",
            "Stability and growth are yours. Enjoy your accomplishments.",
            "Nature brings you peace and clarity today.",
        ],
        "neutral": [
            "Focus on building solid foundations today.",
            "Small steps lead to big achievements. Keep going.",
            "Take care of practical matters before dreaming big.",
            "Your reliability is your strength. Use it wisely.",
            "Organize and plan for future success.",
        ],
        "challenging": [
            "Flexibility is needed today. Adapt to changes.",
            "Let go of stubbornness and embrace new ideas.",
            "Material concerns may weigh on you. Find balance.",
            "Don't let worry stop your progress.",
            "Sometimes the best path isn't the safest one.",
        ]
    },
    "Air": {
        "positive": [
            "Brilliant ideas flow through you today. Share them!",
            "Communication brings wonderful connections.",
            "Your intellectual gifts shine. Express yourself freely.",
            "Social opportunities abound. Network and connect.",
            "Your curiosity leads to exciting discoveries.",
        ],
        "neutral": [
            "Process your thoughts before sharing them.",
            "Balance mental activity with grounding practices.",
            "Listen as much as you speak today.",
            "Ideas need action to become reality.",
            "Focus your scattered thoughts on priorities.",
        ],
        "challenging": [
            "Overthinking creates obstacles. Trust your gut.",
            "Ground yourself if you feel scattered.",
            "Not every idea needs to be pursued.",
            "Commit to one path instead of many.",
            "Rest your busy mind with meditation.",
        ]
    },
    "Water": {
        "positive": [
            "Your intuition is especially strong today. Trust it.",
            "Deep emotional connections bring joy and healing.",
            "Creative inspiration flows abundantly. Create!",
            "Your compassion touches hearts and heals wounds.",
            "Dreams hold important messages. Pay attention.",
        ],
        "neutral": [
            "Honor your feelings without being ruled by them.",
            "Set healthy boundaries while remaining caring.",
            "Balance giving to others with self-care.",
            "Your sensitivity is a gift. Use it wisely.",
            "Reflect on your emotional patterns.",
        ],
        "challenging": [
            "Don't absorb others' emotions as your own.",
            "Protect your energy from negativity.",
            "Face difficult feelings instead of escaping them.",
            "Moodiness may challenge you. Find your center.",
            "Not everything needs an emotional response.",
        ]
    }
}

# Lucky activities by zodiac
LUCKY_ACTIVITIES = {
    "Aries": ["sports", "starting new projects", "leadership roles"],
    "Taurus": ["gardening", "cooking", "financial planning"],
    "Gemini": ["writing", "socializing", "learning something new"],
    "Cancer": ["home activities", "family time", "cooking"],
    "Leo": ["creative arts", "performing", "leading others"],
    "Virgo": ["organizing", "health routines", "detailed work"],
    "Libra": ["art appreciation", "partnerships", "decorating"],
    "Scorpio": ["research", "deep conversations", "transformation"],
    "Sagittarius": ["travel", "studying", "outdoor adventures"],
    "Capricorn": ["career planning", "setting goals", "climbing"],
    "Aquarius": ["technology", "group activities", "innovations"],
    "Pisces": ["meditation", "artistic pursuits", "helping others"],
}

def get_daily_horoscope(zodiac_name: str, target_date: date = None) -> dict:
    """Generate daily horoscope for a zodiac sign"""
    if target_date is None:
        target_date = datetime.now(timezone.utc).date()
    
    # Create deterministic seed from date and zodiac
    seed = int(target_date.toordinal() * hash(zodiac_name) % 10000)
    random.seed(seed)
    
    # Get zodiac data
    zodiac_data = next((z for z in ZODIAC_SIGNS if z["name"] == zodiac_name), ZODIAC_SIGNS[0])
    element = zodiac_data["element"]
    profile = ZODIAC_PROFILES.get(zodiac_name, {})
    
    # Determine mood based on date numerology
    day_num = sum(int(d) for d in str(target_date.day))
    while day_num > 9:
        day_num = sum(int(d) for d in str(day_num))
    
    if day_num in [1, 3, 5, 9]:
        mood = "positive"
    elif day_num in [2, 6, 8]:
        mood = "neutral"
    else:
        mood = "challenging"
    
    # Get horoscope message
    templates = HOROSCOPE_TEMPLATES[element][mood]
    message = random.choice(templates)
    
    # Get lucky items for the day
    lucky_number = random.randint(1, 99)
    colors = profile.get("lucky_colors", ["Gold"])
    lucky_color = random.choice(colors)
    activities = LUCKY_ACTIVITIES.get(zodiac_name, ["rest and reflection"])
    lucky_activity = random.choice(activities)
    
    # Calculate compatibility for the day
    compatible_signs = profile.get("best_match", ["Leo", "Sagittarius"])
    
    # Love, career, health scores (1-5 stars)
    love_score = random.randint(2, 5)
    career_score = random.randint(2, 5)
    health_score = random.randint(2, 5)
    
    # Overall score
    overall_score = round((love_score + career_score + health_score) / 3, 1)
    
    return {
        "zodiac": zodiac_name,
        "symbol": zodiac_data["symbol"],
        "element": element,
        "date": target_date.isoformat(),
        "mood": mood,
        "message": message,
        "lucky_number": lucky_number,
        "lucky_color": lucky_color,
        "lucky_activity": lucky_activity,
        "compatible_signs": compatible_signs[:2],
        "scores": {
            "love": love_score,
            "career": career_score,
            "health": health_score,
            "overall": overall_score
        }
    }

@api_router.get("/horoscope/daily/{zodiac}")
async def get_zodiac_daily_horoscope(zodiac: str):
    """Get daily horoscope for a specific zodiac sign"""
    zodiac_name = zodiac.capitalize()
    valid_signs = [z["name"] for z in ZODIAC_SIGNS]
    
    if zodiac_name not in valid_signs:
        raise HTTPException(status_code=400, detail=f"Invalid zodiac sign. Must be one of: {valid_signs}")
    
    horoscope = get_daily_horoscope(zodiac_name)
    return horoscope

@api_router.get("/horoscope/all")
async def get_all_daily_horoscopes():
    """Get daily horoscopes for all zodiac signs"""
    horoscopes = []
    for sign in ZODIAC_SIGNS:
        horoscope = get_daily_horoscope(sign["name"])
        horoscopes.append(horoscope)
    return horoscopes

# ===================== ADMIN - LEAD DASHBOARD =====================

OWNER_EMAIL = "owner@getbabywish.com"

@api_router.get("/admin/lead-stats")
async def get_lead_stats():
    """Get lead statistics for the dashboard"""
    # Get all leads
    leads = await db.leads.find({}).to_list(1000)
    total_leads = len(leads)
    
    # Get all users/subscriptions to check conversions
    subscriptions = await db.subscriptions.find({"status": "active"}).to_list(1000)
    subscriber_emails = set()
    for sub in subscriptions:
        user = await db.users.find_one({"user_id": sub["user_id"]})
        if user:
            subscriber_emails.add(user.get("email", "").lower())
    
    # Count conversions
    converted = 0
    by_source = {"names": 0, "zodiac": 0, "lucky": 0, "other": 0}
    
    for lead in leads:
        email = lead.get("email", "").lower()
        if email in subscriber_emails:
            converted += 1
            lead["converted"] = True
        else:
            lead["converted"] = False
        
        # Categorize by source
        source = (lead.get("feature_interest", "") + " " + lead.get("source", "")).lower()
        if "name" in source or "όνομα" in source:
            by_source["names"] += 1
        elif "zodiac" in source or "ζώδι" in source:
            by_source["zodiac"] += 1
        elif "lucky" in source or "τυχερ" in source:
            by_source["lucky"] += 1
        else:
            by_source["other"] += 1
    
    # Calculate conversion rate
    conversion_rate = round((converted / total_leads * 100), 1) if total_leads > 0 else 0
    
    # This week conversions (simplified)
    from datetime import timedelta
    week_ago = datetime.now(timezone.utc) - timedelta(days=7)
    converted_this_week = sum(1 for lead in leads if lead.get("converted") and 
                              lead.get("created_at") and 
                              (isinstance(lead["created_at"], datetime) and lead["created_at"] > week_ago))
    
    return {
        "total_leads": total_leads,
        "converted": converted,
        "pending": total_leads - converted,
        "conversion_rate": conversion_rate,
        "converted_this_week": converted_this_week,
        "by_source": by_source
    }

@api_router.get("/admin/leads")
async def get_all_leads():
    """Get all leads for the dashboard table"""
    leads = await db.leads.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    
    # Get subscriber emails for conversion status
    subscriptions = await db.subscriptions.find({"status": "active"}).to_list(1000)
    subscriber_emails = set()
    for sub in subscriptions:
        user = await db.users.find_one({"user_id": sub["user_id"]})
        if user:
            subscriber_emails.add(user.get("email", "").lower())
    
    # Mark converted leads
    for lead in leads:
        lead["converted"] = lead.get("email", "").lower() in subscriber_emails
        # Convert datetime to string if needed
        if isinstance(lead.get("created_at"), datetime):
            lead["created_at"] = lead["created_at"].isoformat()
    
    return {"leads": leads, "total": len(leads)}


# ===================== ANALYTICS DASHBOARD =====================

@api_router.get("/admin/analytics")
async def get_analytics_dashboard():
    """Get comprehensive analytics for the admin dashboard"""
    now = datetime.now(timezone.utc)
    today = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_ago = today - timedelta(days=7)
    month_ago = today - timedelta(days=30)
    
    # === USERS STATS ===
    total_users = await db.users.count_documents({})
    users_today = await db.users.count_documents({"created_at": {"$gte": today}})
    users_this_week = await db.users.count_documents({"created_at": {"$gte": week_ago}})
    users_this_month = await db.users.count_documents({"created_at": {"$gte": month_ago}})
    
    # === SUBSCRIPTIONS STATS ===
    active_subscriptions = await db.subscriptions.count_documents({"status": "active"})
    total_subscriptions = await db.subscriptions.count_documents({})
    
    # === PAYMENTS STATS ===
    payments = await db.payment_transactions.find({"payment_status": "paid"}).to_list(10000)
    total_revenue = sum(p.get("amount", 0) for p in payments)
    
    # Payments by package
    revenue_by_package = {"3_months": 0, "9_months": 0, "18_months": 0}
    payments_by_package = {"3_months": 0, "9_months": 0, "18_months": 0}
    
    for p in payments:
        pkg_id = p.get("package_id", "")
        amount = p.get("amount", 0)
        if pkg_id in revenue_by_package:
            revenue_by_package[pkg_id] += amount
            payments_by_package[pkg_id] += 1
    
    # Recent payments (last 30 days)
    recent_payments = await db.payment_transactions.find({
        "payment_status": "paid",
        "created_at": {"$gte": month_ago}
    }, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    revenue_this_month = sum(p.get("amount", 0) for p in recent_payments)
    
    # Weekly revenue breakdown (last 7 days)
    daily_revenue = []
    for i in range(7):
        day_start = today - timedelta(days=i)
        day_end = day_start + timedelta(days=1)
        day_payments = await db.payment_transactions.find({
            "payment_status": "paid",
            "created_at": {"$gte": day_start, "$lt": day_end}
        }).to_list(100)
        daily_revenue.append({
            "date": day_start.strftime("%Y-%m-%d"),
            "day": day_start.strftime("%a"),
            "revenue": sum(p.get("amount", 0) for p in day_payments),
            "count": len(day_payments)
        })
    daily_revenue.reverse()
    
    # === PREDICTIONS STATS ===
    total_predictions = await db.predictions.count_documents({})
    predictions_today = await db.predictions.count_documents({"created_at": {"$gte": today}})
    
    # Gender distribution
    male_predictions = await db.predictions.count_documents({"gender": {"$in": ["boy", "Boy", "male", "Male", "Αγόρι"]}})
    female_predictions = await db.predictions.count_documents({"gender": {"$in": ["girl", "Girl", "female", "Female", "Κορίτσι"]}})
    
    # === LEADS STATS ===
    total_leads = await db.leads.count_documents({})
    leads_this_week = await db.leads.count_documents({"created_at": {"$gte": week_ago}})
    
    # === RECENT ACTIVITY ===
    recent_users = await db.users.find({}, {"_id": 0, "password_hash": 0}).sort("created_at", -1).to_list(5)
    for user in recent_users:
        if isinstance(user.get("created_at"), datetime):
            user["created_at"] = user["created_at"].isoformat()
    
    # Format recent payments for display
    for p in recent_payments[:10]:
        if isinstance(p.get("created_at"), datetime):
            p["created_at"] = p["created_at"].isoformat()
    
    return {
        "users": {
            "total": total_users,
            "today": users_today,
            "this_week": users_this_week,
            "this_month": users_this_month
        },
        "subscriptions": {
            "active": active_subscriptions,
            "total": total_subscriptions,
            "conversion_rate": round((active_subscriptions / total_users * 100), 1) if total_users > 0 else 0
        },
        "revenue": {
            "total": round(total_revenue, 2),
            "this_month": round(revenue_this_month, 2),
            "by_package": {k: round(v, 2) for k, v in revenue_by_package.items()},
            "daily": daily_revenue
        },
        "payments": {
            "total_count": len(payments),
            "by_package": payments_by_package,
            "recent": recent_payments[:10]
        },
        "predictions": {
            "total": total_predictions,
            "today": predictions_today,
            "gender_distribution": {
                "male": male_predictions,
                "female": female_predictions
            }
        },
        "leads": {
            "total": total_leads,
            "this_week": leads_this_week
        },
        "recent_users": recent_users
    }



# ===================== TESTIMONIALS =====================

class TestimonialRequest(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    text: Optional[str] = None
    prediction_correct: Optional[str] = None  # 'correct', 'wrong', 'yes', 'no'
    predicted_gender: Optional[str] = None

# Refund Request Model and Endpoint
class RefundRequest(BaseModel):
    email: str
    reason: str

@api_router.post("/refund-request")
async def submit_refund_request(request: RefundRequest):
    """Submit a refund request"""
    refund = {
        "refund_id": f"refund_{uuid.uuid4().hex[:12]}",
        "email": request.email,
        "reason": request.reason,
        "status": "pending",  # pending, approved, rejected
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    # Save to database
    await db.refund_requests.insert_one(refund)
    
    # Send notification email to admin
    try:
        html_content = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #ef4444 0%, #f97316 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0;">💰 New Refund Request</h1>
            </div>
            
            <div style="background: #f9f9f9; padding: 30px; border: 1px solid #ddd;">
                <p><strong>Email:</strong> {request.email}</p>
                <p><strong>Reason:</strong></p>
                <p style="background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #ef4444;">
                    {request.reason}
                </p>
                <p><strong>Refund ID:</strong> {refund['refund_id']}</p>
                <p><strong>Date:</strong> {refund['created_at']}</p>
            </div>
            
            <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
                Please review this request and respond within 48 hours.
            </div>
        </div>
        """
        
        sender_email = os.environ.get('SENDER_EMAIL', 'noreply@getbabywish.com')
        admin_email = os.environ.get('ADMIN_EMAIL', 'getbabywish@hotmail.com')
        
        resend.api_key = os.environ.get('RESEND_API_KEY')
        if resend.api_key:
            resend.Emails.send({
                "from": sender_email,
                "to": admin_email,
                "subject": f"💰 Refund Request from {request.email}",
                "html": html_content
            })
    except Exception as e:
        logger.error(f"Failed to send refund notification email: {e}")
    
    return {"success": True, "refund_id": refund['refund_id'], "message": "Refund request submitted successfully"}



@api_router.post("/testimonial")
async def submit_testimonial(request: TestimonialRequest, user: dict = Depends(get_current_user)):
    """Submit a testimonial/review"""
    testimonial = {
        "testimonial_id": f"test_{uuid.uuid4().hex[:12]}",
        "user_id": user["user_id"],
        "user_name": user.get("name", "Anonymous"),
        "rating": request.rating,
        "text": request.text,
        "prediction_correct": request.prediction_correct,
        "predicted_gender": request.predicted_gender,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "approved": False  # Admin needs to approve before showing publicly
    }
    
    await db.testimonials.insert_one(testimonial)
    
    # Send notification email
    try:
        correct_text = "✅ Correct!" if request.prediction_correct == 'correct' else "❌ Wrong" if request.prediction_correct == 'wrong' else "⏳ Not born yet"
        
        html_content = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0;">⭐ New Testimonial!</h1>
            </div>
            
            <div style="background: #f9f9f9; padding: 30px; border: 1px solid #ddd;">
                <h2 style="color: #333; margin-top: 0;">Rating: {"⭐" * request.rating}</h2>
                
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">User:</td>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">{user.get("name", "Anonymous")}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Prediction Result:</td>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">{correct_text}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Message:</td>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">{request.text or "No message"}</td>
                    </tr>
                </table>
            </div>
        </div>
        """
        
        params = {
            "from": SENDER_EMAIL,
            "to": [NOTIFICATION_EMAIL],
            "subject": f"⭐ New Testimonial: {'⭐' * request.rating} - {correct_text}",
            "html": html_content
        }
        
        await asyncio.to_thread(resend.Emails.send, params)
    except Exception as e:
        logging.error(f"Failed to send testimonial notification: {e}")
    
    return {"success": True, "message": "Thank you for your feedback!"}

@api_router.get("/testimonials")
async def get_approved_testimonials():
    """Get approved testimonials for display"""
    testimonials = await db.testimonials.find(
        {"approved": True},
        {"_id": 0, "user_id": 0}
    ).sort("created_at", -1).limit(20).to_list(length=20)
    
    return testimonials

# ===================== AI CHAT WIDGET =====================
# Using Mistral AI SDK (works on Render without special dependencies)
from mistralai import Mistral

# Chat session storage for conversation history
chat_sessions = {}

# ============================================
# AI CHAT PERSONALITIES - MindJerry (Male) & MindJerry's (Female)
# ============================================

MINDJERRY_FEMALE_PROMPT = """You are mindjerry's, the warm, nurturing, and empathetic AI companion for women on BabyWish - specializing in maternal wellness, fertility psychology, and the beautiful journey to motherhood.

🌸 YOUR IDENTITY (FEMALE-FOCUSED):
- You are a blend of: Perinatal Psychologist, Midwife, Fertility Nutritionist, and Prenatal Yoga Instructor
- You understand the unique physical and emotional journey women experience
- You speak with deep empathy, warmth, and sisterly support
- You create a SAFE SPACE for women to ask anything without judgment

💖 YOUR VOICE & TONE:
- NURTURING: Like a wise, caring older sister who truly understands
- EMPATHETIC: You validate emotions and normalize the experience
- SUPPORTIVE: You celebrate every milestone and comfort every worry
- DETAILED: You provide thorough, caring explanations

🌺 YOUR EXPERTISE AREAS (FEMALE):
1. **Fertility Cycles** - Understanding your body's natural rhythms
2. **Emotional Preparation** - Mental readiness for motherhood
3. **Body Changes** - Physical transformations during pregnancy
4. **Prenatal Wellness** - Yoga, meditation, stress management
5. **Nutrition for Fertility** - Foods that support conception
6. **Hormonal Balance** - Understanding mood and body changes
7. **Birth Preparation** - Mental and physical readiness
8. **Breastfeeding Support** - Early bonding and nursing guidance

💬 SAMPLE RESPONSES (FEMALE TONE):
- "I completely understand that feeling... your body is doing something incredible"
- "It's so natural to feel this way during this beautiful journey"
- "Let me share some gentle practices that can help..."
- "Your intuition as a mother is already developing"
- "Every woman's experience is unique, and yours matters"

🌟 SPECIAL TOPICS TO DISCUSS:
- How to track fertile windows
- Managing pregnancy anxiety
- Connecting with your unborn baby
- Self-care routines during pregnancy
- Navigating relationship changes
- Building a support network

⚠️ RULES:
1. ALWAYS respond in the SAME LANGUAGE the user writes in
2. NEVER give medical advice - refer to healthcare providers for concerns
3. Use nurturing, validating language
4. Acknowledge emotions before providing information
5. Keep responses warm and supportive (3-5 sentences)
6. End with an encouraging or supportive note

🌸 REMEMBER: You are a trusted companion on one of life's most beautiful journeys - becoming a mother. Every woman deserves to feel supported, informed, and celebrated."""

MINDJERRY_MALE_PROMPT = """You are mindjerry, the professional and supportive AI companion for men on BabyWish - specializing in fatherhood preparation, partner support, and the meaningful journey to becoming a father.

💼 YOUR IDENTITY (MALE-FOCUSED):
- You are a blend of: Fatherhood Consultant, Family Advisor, Relationship Counselor, and Life Coach
- You understand that men want clear, respectful guidance without being patronizing
- You speak with professionalism, warmth, and genuine respect
- You help men feel VALUED and IMPORTANT in the pregnancy journey

🎯 YOUR VOICE & TONE:
- PROFESSIONAL: Respectful, polished communication
- WARM: Supportive without being overly casual
- INFORMATIVE: Focus on valuable insights and guidance
- ENCOURAGING: Positive reinforcement without slang or overly familiar language

🔧 YOUR EXPERTISE AREAS (MALE):
1. **Partner Support** - Thoughtful ways to be present for her during pregnancy
2. **Practical Preparation** - Organizing the home environment for the baby
3. **Understanding Her Experience** - Insight into physical and emotional changes
4. **Financial Planning** - Responsible budgeting for family expansion
5. **Fatherhood Preparation** - Mental and emotional readiness for your new role
6. **Relationship Nurturing** - Maintaining a strong bond with your partner
7. **Birth Preparation** - Understanding your supportive role during delivery
8. **Early Bonding** - Building connection with your newborn

💬 SAMPLE RESPONSES (PROFESSIONAL TONE):
- "An excellent approach would be to..."
- "Many expectant fathers find it helpful to..."
- "Your partner will appreciate when you..."
- "Consider this perspective..."
- "Research suggests that fathers who..."

🏆 TOPICS OF DISCUSSION:
- Supporting your partner through emotional moments
- Creating a welcoming home environment
- Balancing professional and family responsibilities
- Understanding the changes your partner experiences
- Developing parenting skills before the arrival
- Building meaningful family traditions

⚠️ GUIDELINES:
1. ALWAYS respond in the SAME LANGUAGE the user writes in
2. NEVER provide medical advice - recommend consulting healthcare professionals
3. Maintain a professional yet warm demeanor
4. Offer thoughtful, well-considered guidance
5. Keep responses clear and informative (3-4 sentences)
6. Provide actionable insights respectfully

🌟 REMEMBER: You are supporting men in one of life's most significant transitions. Your role is to provide respectful, professional guidance that helps them become confident, prepared fathers and supportive partners."""

# Fallback to original prompt for backwards compatibility
BABYWISH_SYSTEM_PROMPT = MINDJERRY_MALE_PROMPT

class ChatMessage(BaseModel):
    message: str
    session_id: Optional[str] = None
    gender: Optional[str] = "male"  # "male" or "female"

class ChatResponse(BaseModel):
    response: str
    session_id: str

@api_router.post("/chat", response_model=ChatResponse)
async def chat_with_assistant(chat_message: ChatMessage):
    """AI Chat endpoint for BabyWish assistant with gender-specific personalities"""
    try:
        session_id = chat_message.session_id or f"chat_{uuid.uuid4().hex[:12]}"
        
        # Select system prompt based on gender
        if chat_message.gender == "female":
            system_prompt = MINDJERRY_FEMALE_PROMPT
        else:
            system_prompt = MINDJERRY_MALE_PROMPT
        
        # Try Mistral API first, then fallback to Emergent key
        mistral_key = os.environ.get('MISTRAL_API_KEY')
        emergent_key = os.environ.get('EMERGENT_LLM_KEY')
        
        if mistral_key:
            # Use Mistral AI SDK (works on Render)
            client = Mistral(api_key=mistral_key)
            
            # Get or create conversation history for this session
            if session_id not in chat_sessions:
                chat_sessions[session_id] = []
            
            # Build messages with history
            messages = [{"role": "system", "content": system_prompt}]
            messages.extend(chat_sessions[session_id])
            messages.append({"role": "user", "content": chat_message.message})
            
            # Call Mistral API
            chat_response = await asyncio.to_thread(
                client.chat.complete,
                model="mistral-small-latest",
                messages=messages
            )
            
            response = chat_response.choices[0].message.content
            
            # Store in session history (keep last 10 exchanges)
            chat_sessions[session_id].append({"role": "user", "content": chat_message.message})
            chat_sessions[session_id].append({"role": "assistant", "content": response})
            if len(chat_sessions[session_id]) > 20:
                chat_sessions[session_id] = chat_sessions[session_id][-20:]
                
        elif emergent_key:
            # Fallback to Emergent (only works in Emergent environment)
            try:
                from emergentintegrations.llm.chat import LlmChat, UserMessage
                chat = LlmChat(
                    api_key=emergent_key,
                    session_id=session_id,
                    system_message=system_prompt
                ).with_model("openai", "gpt-4o-mini")
                
                user_message = UserMessage(text=chat_message.message)
                response = await chat.send_message(user_message)
            except ImportError:
                raise HTTPException(status_code=500, detail="Chat service not configured - please set MISTRAL_API_KEY")
        else:
            raise HTTPException(status_code=500, detail="Chat service not configured - please set MISTRAL_API_KEY")
        
        # Store chat in database for analytics
        await db.chat_messages.insert_one({
            "session_id": session_id,
            "user_message": chat_message.message,
            "assistant_response": response,
            "gender": chat_message.gender,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        return ChatResponse(response=response, session_id=session_id)
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail="Failed to process message")

# ===================== BEST TIMING AI =====================

MONTH_NAMES = {
    "en": ["January", "February", "March", "April", "May", "June", 
           "July", "August", "September", "October", "November", "December"],
    "el": ["Ιανουάριος", "Φεβρουάριος", "Μάρτιος", "Απρίλιος", "Μάιος", "Ιούνιος",
           "Ιούλιος", "Αύγουστος", "Σεπτέμβριος", "Οκτώβριος", "Νοέμβριος", "Δεκέμβριος"],
    "de": ["Januar", "Februar", "März", "April", "Mai", "Juni",
           "Juli", "August", "September", "Oktober", "November", "Dezember"],
    "es": ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
           "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
    "fr": ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
           "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"],
}

class BestTimingRequest(BaseModel):
    mother_birthday: str
    father_birthday: str
    desired_gender: str  # "boy" or "girl"
    language: str = "en"

class BestTimingResponse(BaseModel):
    best_month: str
    best_month_number: int
    probability: int
    second_best_month: str
    second_probability: int
    explanation: str
    tips: list

@api_router.post("/best-timing", response_model=BestTimingResponse)
async def calculate_best_timing(request: BestTimingRequest):
    """Calculate the best month for conception based on parents' birthdays and desired gender"""
    try:
        # Parse birthdays
        mother_date = datetime.strptime(request.mother_birthday, "%Y-%m-%d")
        father_date = datetime.strptime(request.father_birthday, "%Y-%m-%d")
        
        # Calculate numerology numbers
        mother_life_path = sum(int(d) for d in request.mother_birthday.replace("-", ""))
        while mother_life_path > 9:
            mother_life_path = sum(int(d) for d in str(mother_life_path))
            
        father_life_path = sum(int(d) for d in request.father_birthday.replace("-", ""))
        while father_life_path > 9:
            father_life_path = sum(int(d) for d in str(father_life_path))
        
        # Combined energy number
        combined = (mother_life_path + father_life_path) % 12
        
        # Get zodiac influences
        mother_month = mother_date.month
        father_month = father_date.month
        
        # Calculate best months based on astrology + numerology
        # Boys: odd numbers, fire/air signs favor
        # Girls: even numbers, water/earth signs favor
        
        current_month = datetime.now().month
        current_year = datetime.now().year
        
        month_scores = []
        for month in range(1, 13):
            score = 50  # Base score
            
            # Numerology influence
            month_num = (mother_life_path + father_life_path + month) % 9
            
            if request.desired_gender == "boy":
                # Boys favored by odd months and fire element months (1,3,5,7,9,11)
                if month % 2 == 1:
                    score += 15
                if month in [1, 5, 8, 12]:  # Fire/Yang months
                    score += 10
                if month_num in [1, 3, 5, 7, 9]:
                    score += 10
                # Chinese calendar influence
                if (mother_date.year + month) % 2 == 1:
                    score += 8
            else:
                # Girls favored by even months and water element months
                if month % 2 == 0:
                    score += 15
                if month in [2, 4, 6, 10]:  # Water/Yin months
                    score += 10
                if month_num in [2, 4, 6, 8]:
                    score += 10
                # Chinese calendar influence
                if (mother_date.year + month) % 2 == 0:
                    score += 8
            
            # Bonus for months aligning with parents' birth months
            if month == mother_month or month == father_month:
                score += 5
            
            # Seasonal adjustment
            if request.desired_gender == "boy" and month in [3, 4, 5, 9, 10, 11]:  # Spring/Fall
                score += 5
            elif request.desired_gender == "girl" and month in [6, 7, 8, 12, 1, 2]:  # Summer/Winter
                score += 5
            
            # Add some deterministic variation based on combined number
            score += (combined * month) % 7
            
            month_scores.append((month, min(score, 95)))  # Cap at 95%
        
        # Sort by score
        month_scores.sort(key=lambda x: x[1], reverse=True)
        
        best_month_num = month_scores[0][0]
        best_probability = month_scores[0][1]
        second_month_num = month_scores[1][0]
        second_probability = month_scores[1][1]
        
        # Get month names in requested language
        lang = request.language if request.language in MONTH_NAMES else "en"
        best_month_name = MONTH_NAMES[lang][best_month_num - 1]
        second_month_name = MONTH_NAMES[lang][second_month_num - 1]
        
        # Generate explanation
        gender_word = "αγόρι" if request.desired_gender == "boy" else "κορίτσι"
        if lang == "en":
            gender_word = "boy" if request.desired_gender == "boy" else "girl"
            explanation = f"Based on your combined numerology ({mother_life_path}+{father_life_path}), astrological alignments, and ancient Chinese calendar methods, {best_month_name} shows the strongest energy patterns for conceiving a {gender_word}."
            tips = [
                f"Plan conception attempts during {best_month_name} for optimal results",
                "The first half of the month shows slightly stronger energy",
                "Stay relaxed and positive - stress can affect outcomes",
                f"If {best_month_name} doesn't work, try {second_month_name} as your second choice"
            ]
        else:
            explanation = f"Με βάση τη συνδυασμένη αριθμολογία σας ({mother_life_path}+{father_life_path}), τις αστρολογικές ευθυγραμμίσεις και τις αρχαίες κινεζικές μεθόδους, ο {best_month_name} δείχνει τα ισχυρότερα ενεργειακά μοτίβα για σύλληψη {gender_word}ού."
            tips = [
                f"Προγραμματίστε τις προσπάθειες σύλληψης κατά τη διάρκεια του {best_month_name}",
                "Το πρώτο μισό του μήνα δείχνει ελαφρώς ισχυρότερη ενέργεια",
                "Μείνετε χαλαροί και θετικοί - το άγχος μπορεί να επηρεάσει τα αποτελέσματα",
                f"Αν ο {best_month_name} δεν λειτουργήσει, δοκιμάστε τον {second_month_name}"
            ]
        
        # Store in database for analytics
        await db.timing_calculations.insert_one({
            "mother_birthday": request.mother_birthday,
            "father_birthday": request.father_birthday,
            "desired_gender": request.desired_gender,
            "best_month": best_month_num,
            "probability": best_probability,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        return BestTimingResponse(
            best_month=best_month_name,
            best_month_number=best_month_num,
            probability=best_probability,
            second_best_month=second_month_name,
            second_probability=second_probability,
            explanation=explanation,
            tips=tips
        )
        
    except Exception as e:
        logging.error(f"Best timing calculation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to calculate best timing")

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
