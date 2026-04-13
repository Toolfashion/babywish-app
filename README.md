# BabyWish App

A full-stack web application that predicts a future child's gender, name, zodiac, and personality traits based on the parents' birthdays.

## Features
- 18+ language support with auto-detection
- Culturally relevant predictions based on user location
- Stripe payment integration
- Daily horoscope
- Lucky elements with Amazon/eBay links
- Lead tracking dashboard

## Tech Stack
- **Frontend**: React, Tailwind CSS
- **Backend**: FastAPI, Python
- **Database**: MongoDB

## Setup

### Backend
```bash
cd backend
pip install -r requirements.txt
python server.py
```

### Frontend
```bash
cd frontend
yarn install
yarn start
```

## Environment Variables

### Backend (.env)
- MONGO_URL
- STRIPE_API_KEY
- RESEND_API_KEY

### Frontend (.env)
- REACT_APP_BACKEND_URL
