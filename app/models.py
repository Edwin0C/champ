from datetime import datetime, timedelta

def ecuador_now():
    """Retorna la hora actual en zona horaria de Ecuador (UTC-5)."""
    return datetime.utcnow() - timedelta(hours=5)
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from app.extensions import db, login_manager

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='client') # 'admin' or 'client'
    balance = db.Column(db.Float, default=0.0)
    nombre = db.Column(db.String(100), nullable=False, default='')
    apellido = db.Column(db.String(100), nullable=False, default='')
    phone = db.Column(db.String(20), unique=True, nullable=False, default='')
    bonus_claimed = db.Column(db.Boolean, default=False)
    is_disabled = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=ecuador_now)
    # Withdrawal account fields
    withdraw_account_name = db.Column(db.String(150), nullable=True)
    withdraw_bank_name = db.Column(db.String(100), nullable=True)
    withdraw_account_number = db.Column(db.String(50), nullable=True)
    transactions = db.relationship('Transaction', backref='user', lazy=True)

    @property
    def is_active(self):
        return not self.is_disabled

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False) # e.g., "Meta-VIP1"
    description = db.Column(db.Text, nullable=True)
    price = db.Column(db.Float, nullable=False) # Investment Amount
    image_url = db.Column(db.String(500), nullable=False)
    
    # New fields for VIP structure
    daily_income = db.Column(db.Float, nullable=False, default=0.0)
    total_income = db.Column(db.Float, nullable=False, default=0.0)
    days_duration = db.Column(db.Integer, nullable=False, default=90)
    vip_level = db.Column(db.Integer, default=0) # 0, 1, 2... used for sorting or badges


class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    type = db.Column(db.String(50), nullable=False) # 'deposit', 'investment'
    amount = db.Column(db.Float, nullable=False)
    date = db.Column(db.DateTime, default=ecuador_now)
    details = db.Column(db.String(200)) # e.g., "Invested in Product X"
    status = db.Column(db.String(20), default='approved') # 'pending', 'approved', 'rejected'

class UserProduct(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    purchased_at = db.Column(db.DateTime, default=ecuador_now)
    last_claimed_at = db.Column(db.DateTime, nullable=True)
    times_claimed = db.Column(db.Integer, default=0)
    
    user = db.relationship('User', backref='user_products')
    product = db.relationship('Product', backref='user_products')

