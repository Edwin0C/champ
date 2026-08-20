from app import create_app, db
from app.models import User, Product

app = create_app()

with app.app_context():
    db.drop_all() # Reset DB for clean schema change
    db.create_all()
    
    # Admin
    if not User.query.filter_by(username='saturno6').first():
        admin = User(username='saturno6', role='admin', nombre='Admin', apellido='System', phone='+593000000000')
        admin.set_password('h36dt100')
        db.session.add(admin)
    
    # Client
    if not User.query.filter_by(username='client').first():
        client = User(username='+593984917595', role='client', nombre='Usuario', apellido='Demo', phone='+593984917595')
        client.set_password('client123')
        client.balance = 3.45 # Matching reference
        db.session.add(client)

    # Seed Tokens (Vinicius to Mbappe)
    products_data = [
        {"title": "Vinicius-Token",         "price": 7.0,    "daily": 1.0,   "total": 90.0,    "days": 90, "vip": 1, "image": "/static/images/1.png"},
        {"title": "Neymar-Token",           "price": 18.0,   "daily": 3.0,   "total": 270.0,   "days": 90, "vip": 2, "image": "/static/images/2.png"},
        {"title": "Messi-Token",            "price": 40.0,   "daily": 8.0,   "total": 720.0,   "days": 90, "vip": 3, "image": "/static/images/3.png"},
        {"title": "CristianoRonaldo-Token", "price": 100.0,  "daily": 25.0,  "total": 2250.0,  "days": 90, "vip": 4, "image": "/static/images/4.png"},
        {"title": "Bellingham-Token",       "price": 200.0,  "daily": 53.0,  "total": 4770.0,  "days": 90, "vip": 5, "image": "/static/images/5.png"},
        {"title": "HarryKane-Token",        "price": 400.0,  "daily": 112.0, "total": 10080.0, "days": 90, "vip": 6, "image": "/static/images/6.png"},
        {"title": "LamineYamal-Token",      "price": 800.0,  "daily": 235.0, "total": 21150.0, "days": 90, "vip": 7, "image": "/static/images/7.png"},
        {"title": "Haaland-Token",          "price": 1500.0, "daily": 500.0, "total": 45000.0, "days": 90, "vip": 8, "image": "/static/images/8.png"},
        {"title": "Mbappe-Token",           "price": 2000.0, "daily": 700.0, "total": 63007.0, "days": 90, "vip": 9, "image": "/static/images/9.png"},
    ]

    for p in products_data:
        prod = Product(
            title=p['title'],
            description=f"Ingresos diarios totales ${p['total']}",
            price=p['price'],
            daily_income=p['daily'],
            total_income=p['total'],
            days_duration=p['days'],
            vip_level=p['vip'],
            image_url=p['image']
        )
        db.session.add(prod)

    db.session.commit()
    print("Database reset and seeded with Player Tokens.")
