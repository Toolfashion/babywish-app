"""
Test suite for Daily Horoscope, Lucky Elements Translation, and Shopping Links features
"""
import pytest
import requests
import os
from datetime import date

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://parent-to-baby-1.preview.emergentagent.com')

# Test credentials
TEST_EMAIL = "demo@babywish.com"
TEST_PASSWORD = "demo123"


class TestHoroscopeEndpoints:
    """Tests for Daily Horoscope API endpoints"""
    
    def test_horoscope_all_endpoint_returns_12_signs(self):
        """Test /api/horoscope/all returns all 12 zodiac signs"""
        response = requests.get(f"{BASE_URL}/api/horoscope/all")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        assert len(data) == 12, f"Expected 12 zodiac signs, got {len(data)}"
        
        # Verify all zodiac signs are present
        expected_signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", 
                         "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]
        returned_signs = [h["zodiac"] for h in data]
        for sign in expected_signs:
            assert sign in returned_signs, f"Missing zodiac sign: {sign}"
        print(f"✓ All 12 zodiac signs returned: {returned_signs}")
    
    def test_horoscope_all_has_required_fields(self):
        """Test each horoscope has all required fields"""
        response = requests.get(f"{BASE_URL}/api/horoscope/all")
        assert response.status_code == 200
        
        data = response.json()
        required_fields = ["zodiac", "symbol", "element", "date", "mood", "message", 
                          "lucky_number", "lucky_color", "lucky_activity", 
                          "compatible_signs", "scores"]
        
        for horoscope in data:
            for field in required_fields:
                assert field in horoscope, f"Missing field '{field}' in {horoscope.get('zodiac', 'unknown')}"
            
            # Verify scores structure
            assert "love" in horoscope["scores"], "Missing love score"
            assert "career" in horoscope["scores"], "Missing career score"
            assert "health" in horoscope["scores"], "Missing health score"
            assert "overall" in horoscope["scores"], "Missing overall score"
        
        print("✓ All horoscopes have required fields including scores")
    
    def test_horoscope_daily_single_zodiac(self):
        """Test /api/horoscope/daily/{zodiac} for each sign"""
        test_signs = ["aries", "leo", "pisces"]  # Test a few signs
        
        for sign in test_signs:
            response = requests.get(f"{BASE_URL}/api/horoscope/daily/{sign}")
            assert response.status_code == 200, f"Failed for {sign}: {response.status_code}"
            
            data = response.json()
            assert data["zodiac"] == sign.capitalize(), f"Expected {sign.capitalize()}, got {data['zodiac']}"
            assert "message" in data, f"Missing message for {sign}"
            assert len(data["message"]) > 10, f"Message too short for {sign}"
        
        print(f"✓ Individual horoscope endpoints working for: {test_signs}")
    
    def test_horoscope_daily_invalid_zodiac(self):
        """Test invalid zodiac sign returns 400"""
        response = requests.get(f"{BASE_URL}/api/horoscope/daily/invalid_sign")
        assert response.status_code == 400, f"Expected 400 for invalid sign, got {response.status_code}"
        print("✓ Invalid zodiac sign correctly returns 400 error")
    
    def test_horoscope_scores_in_valid_range(self):
        """Test that scores are within valid range (1-5)"""
        response = requests.get(f"{BASE_URL}/api/horoscope/all")
        assert response.status_code == 200
        
        data = response.json()
        for horoscope in data:
            scores = horoscope["scores"]
            assert 1 <= scores["love"] <= 5, f"Love score out of range for {horoscope['zodiac']}"
            assert 1 <= scores["career"] <= 5, f"Career score out of range for {horoscope['zodiac']}"
            assert 1 <= scores["health"] <= 5, f"Health score out of range for {horoscope['zodiac']}"
            assert 1 <= scores["overall"] <= 5, f"Overall score out of range for {horoscope['zodiac']}"
        
        print("✓ All scores are within valid range (1-5)")
    
    def test_horoscope_all_zodiac_symbols(self):
        """Test all zodiac symbols are correct"""
        response = requests.get(f"{BASE_URL}/api/horoscope/all")
        assert response.status_code == 200
        
        data = response.json()
        expected_symbols = {
            "Aries": "♈", "Taurus": "♉", "Gemini": "♊", "Cancer": "♋",
            "Leo": "♌", "Virgo": "♍", "Libra": "♎", "Scorpio": "♏",
            "Sagittarius": "♐", "Capricorn": "♑", "Aquarius": "♒", "Pisces": "♓"
        }
        
        for horoscope in data:
            zodiac = horoscope["zodiac"]
            assert horoscope["symbol"] == expected_symbols[zodiac], f"Wrong symbol for {zodiac}"
        
        print("✓ All zodiac symbols are correct")
    
    def test_horoscope_elements_correct(self):
        """Test all zodiac elements are correct"""
        response = requests.get(f"{BASE_URL}/api/horoscope/all")
        assert response.status_code == 200
        
        data = response.json()
        expected_elements = {
            "Aries": "Fire", "Taurus": "Earth", "Gemini": "Air", "Cancer": "Water",
            "Leo": "Fire", "Virgo": "Earth", "Libra": "Air", "Scorpio": "Water",
            "Sagittarius": "Fire", "Capricorn": "Earth", "Aquarius": "Air", "Pisces": "Water"
        }
        
        for horoscope in data:
            zodiac = horoscope["zodiac"]
            assert horoscope["element"] == expected_elements[zodiac], f"Wrong element for {zodiac}"
        
        print("✓ All zodiac elements are correct")


class TestAuthenticatedPrediction:
    """Tests for authenticated user prediction with shopping links and lucky elements"""
    
    @pytest.fixture
    def auth_session(self):
        """Get authentication session for test user using cookies"""
        session = requests.Session()
        response = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if response.status_code == 200:
            # Session cookies are automatically stored in the session
            return session
        pytest.skip(f"Authentication failed: {response.status_code} - {response.text}")
    
    def test_authenticated_user_can_get_prediction(self, auth_session):
        """Test authenticated user can retrieve their prediction"""
        response = auth_session.get(f"{BASE_URL}/api/my-prediction")
        
        # User should have a prediction (as per context)
        if response.status_code == 200:
            data = response.json()
            assert data is not None, "Prediction should not be None"
            print(f"✓ User has prediction with gender: {data.get('predicted_gender')}")
            return data
        elif response.status_code == 404:
            print("⚠ User has no prediction yet")
            pytest.skip("User has no prediction to test")
        else:
            pytest.fail(f"Unexpected status: {response.status_code} - {response.text}")
    
    def test_prediction_has_shopping_links(self, auth_session):
        """Test user's prediction includes shopping_links"""
        response = auth_session.get(f"{BASE_URL}/api/my-prediction")
        
        if response.status_code == 404:
            pytest.skip("User has no prediction to test")
        
        assert response.status_code == 200, f"Failed: {response.status_code} - {response.text}"
        data = response.json()
        
        # Check shopping_links structure
        assert "shopping_links" in data, "Missing shopping_links in prediction"
        links = data["shopping_links"]
        
        # Verify all categories
        assert "gemstone" in links, "Missing gemstone category"
        assert "zodiac" in links, "Missing zodiac category"
        assert "clothes" in links, "Missing clothes category"
        
        # Verify Amazon/eBay links
        for category in ["gemstone", "zodiac", "clothes"]:
            assert "amazon" in links[category], f"Missing Amazon link for {category}"
            assert "ebay" in links[category], f"Missing eBay link for {category}"
            assert "amazon.com" in links[category]["amazon"], f"Invalid Amazon URL for {category}"
            assert "ebay.com" in links[category]["ebay"], f"Invalid eBay URL for {category}"
        
        print(f"✓ Shopping links present: gemstone, zodiac, clothes with Amazon/eBay")
        print(f"  - Gemstone Amazon: {links['gemstone']['amazon'][:60]}...")
        print(f"  - Zodiac Amazon: {links['zodiac']['amazon'][:60]}...")
        print(f"  - Clothes Amazon: {links['clothes']['amazon'][:60]}...")
    
    def test_prediction_has_lucky_elements(self, auth_session):
        """Test user's prediction includes lucky_elements with translations"""
        response = auth_session.get(f"{BASE_URL}/api/my-prediction")
        
        if response.status_code == 404:
            pytest.skip("User has no prediction to test")
        
        assert response.status_code == 200
        data = response.json()
        
        # Check lucky_elements structure
        assert "lucky_elements" in data, "Missing lucky_elements in prediction"
        lucky = data["lucky_elements"]
        
        # Verify required fields
        assert "colors" in lucky, "Missing colors in lucky_elements"
        assert "numbers" in lucky, "Missing numbers in lucky_elements"
        assert "day" in lucky, "Missing day in lucky_elements"
        assert "gemstone" in lucky, "Missing gemstone in lucky_elements"
        
        # Verify gemstone structure
        gemstone = lucky["gemstone"]
        assert "name" in gemstone, "Missing name in gemstone"
        assert "symbol" in gemstone, "Missing symbol in gemstone"
        
        # Verify translations are present (should have both translated and English versions)
        assert "colors_en" in lucky, "Missing English colors reference"
        assert "day_en" in lucky, "Missing English day reference"
        
        print(f"✓ Lucky elements with translations:")
        print(f"  - Colors: {lucky['colors']} (EN: {lucky['colors_en']})")
        print(f"  - Day: {lucky['day']} (EN: {lucky['day_en']})")
        print(f"  - Gemstone: {gemstone['name']} {gemstone['symbol']}")
    
    def test_prediction_has_zodiac_info(self, auth_session):
        """Test user's prediction includes zodiac information"""
        response = auth_session.get(f"{BASE_URL}/api/my-prediction")
        
        if response.status_code == 404:
            pytest.skip("User has no prediction to test")
        
        assert response.status_code == 200
        data = response.json()
        
        # Check zodiac_sign structure
        assert "zodiac_sign" in data, "Missing zodiac_sign in prediction"
        zodiac = data["zodiac_sign"]
        
        assert "name" in zodiac, "Missing name in zodiac_sign"
        assert "symbol" in zodiac, "Missing symbol in zodiac_sign"
        assert "element" in zodiac, "Missing element in zodiac_sign"
        assert "translated_name" in zodiac, "Missing translated_name in zodiac_sign"
        
        print(f"✓ Zodiac info: {zodiac['name']} ({zodiac['translated_name']}) {zodiac['symbol']} ({zodiac['element']})")


class TestPredictChildFunction:
    """Tests for the predict_child function logic by checking backend response structure"""
    
    def test_backend_health(self):
        """Test backend is healthy"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        print("✓ Backend is healthy")
    
    def test_horoscope_has_lucky_color(self):
        """Test horoscope includes lucky_color field"""
        response = requests.get(f"{BASE_URL}/api/horoscope/daily/aries")
        assert response.status_code == 200
        
        data = response.json()
        assert "lucky_color" in data, "Missing lucky_color in horoscope"
        assert isinstance(data["lucky_color"], str), "lucky_color should be a string"
        print(f"✓ Horoscope has lucky_color: {data['lucky_color']}")
    
    def test_horoscope_has_lucky_activity(self):
        """Test horoscope includes lucky_activity field"""
        response = requests.get(f"{BASE_URL}/api/horoscope/daily/leo")
        assert response.status_code == 200
        
        data = response.json()
        assert "lucky_activity" in data, "Missing lucky_activity in horoscope"
        assert isinstance(data["lucky_activity"], str), "lucky_activity should be a string"
        print(f"✓ Horoscope has lucky_activity: {data['lucky_activity']}")
    
    def test_horoscope_has_compatible_signs(self):
        """Test horoscope includes compatible_signs field"""
        response = requests.get(f"{BASE_URL}/api/horoscope/daily/pisces")
        assert response.status_code == 200
        
        data = response.json()
        assert "compatible_signs" in data, "Missing compatible_signs in horoscope"
        assert isinstance(data["compatible_signs"], list), "compatible_signs should be a list"
        assert len(data["compatible_signs"]) > 0, "compatible_signs should not be empty"
        print(f"✓ Horoscope has compatible_signs: {data['compatible_signs']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
