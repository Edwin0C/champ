from flask import Blueprint, render_template, redirect, url_for, flash, request
from flask_login import login_required, current_user
from app.extensions import db
from app.models import Product, Transaction, User, UserProduct, ecuador_now
from datetime import timedelta

client_bp = Blueprint('client', __name__)

@client_bp.route('/')
@login_required
def dashboard():
    if current_user.role == 'admin':
        return redirect(url_for('admin.dashboard'))
    
    products = Product.query.order_by(Product.price.asc()).all()
    user_transactions = Transaction.query.filter_by(user_id=current_user.id).order_by(Transaction.date.desc()).limit(5).all()
    return render_template('client/dashboard.html', user=current_user, products=products, transactions=user_transactions)

@client_bp.route('/profile')
@login_required
def profile():
    return render_template('client/profile.html')

@client_bp.route('/my_products')
@login_required
def my_products():
    user_products = UserProduct.query.filter_by(user_id=current_user.id).order_by(UserProduct.purchased_at.desc()).all()
    now = ecuador_now()
    
    products_data = []
    for up in user_products:
        # Calculate time until next claim
        if up.last_claimed_at:
            next_claim = up.last_claimed_at + timedelta(hours=24)
        else:
            next_claim = up.purchased_at + timedelta(hours=24)
        
        can_claim = now >= next_claim
        remaining_seconds = max(0, int((next_claim - now).total_seconds())) if not can_claim else 0
        remaining_claims = up.product.days_duration - up.times_claimed
        
        products_data.append({
            'up': up,
            'product': up.product,
            'can_claim': can_claim,
            'remaining_seconds': remaining_seconds,
            'remaining_claims': remaining_claims,
            'total_earned': up.times_claimed * up.product.daily_income
        })
    
    return render_template('client/my_products.html', products_data=products_data, now=now)

@client_bp.route('/claim/<int:user_product_id>', methods=['POST'])
@login_required
def claim(user_product_id):
    up = UserProduct.query.get_or_404(user_product_id)
    if up.user_id != current_user.id:
        flash('Acceso denegado.', 'danger')
        return redirect(url_for('client.my_products'))
    
    now = ecuador_now()
    if up.last_claimed_at:
        next_claim = up.last_claimed_at + timedelta(hours=24)
    else:
        next_claim = up.purchased_at + timedelta(hours=24)
    
    if now < next_claim:
        flash('Aún no puedes reclamar. Espera a que se complete el tiempo.', 'warning')
        return redirect(url_for('client.my_products'))
    
    if up.times_claimed >= up.product.days_duration:
        flash('Ya has alcanzado el máximo de reclamos para este producto.', 'info')
        return redirect(url_for('client.my_products'))
    
    # Process claim
    daily_income = up.product.daily_income
    current_user.balance += daily_income
    up.last_claimed_at = now
    up.times_claimed += 1
    
    t = Transaction(
        user_id=current_user.id,
        type='claim',
        amount=daily_income,
        details=f'Reclamo diario de {up.product.title} (día {up.times_claimed}/{up.product.days_duration})',
        status='approved'
    )
    db.session.add(t)
    db.session.commit()
    
    flash(f'¡Has reclamado ${daily_income:.2f} de {up.product.title}!', 'success')
    return redirect(url_for('client.my_products'))

@client_bp.route('/recharge', methods=['GET', 'POST'])
@login_required
def recharge():
    if request.method == 'POST':
        amount = float(request.form.get('amount', 0))
        if amount > 0:
            t = Transaction(user_id=current_user.id, type='deposit', amount=amount, details='Solicitud de Recarga', status='pending')
            db.session.add(t)
            db.session.commit()
            return redirect(url_for('client.payment_telegram', amount=amount))
            
    return render_template('client/recharge.html')

@client_bp.route('/payment/telegram')
@login_required
def payment_telegram():
    amount = request.args.get('amount', '0')
    return render_template('client/payment_telegram.html', amount=amount)

@client_bp.route('/withdrawal_account', methods=['GET', 'POST'])
@login_required
def withdrawal_account():
    if request.method == 'POST':
        current_user.withdraw_account_name = request.form.get('account_name', '').strip()
        current_user.withdraw_bank_name = request.form.get('bank_name', '').strip()
        current_user.withdraw_account_number = request.form.get('account_number', '').strip()
        db.session.commit()
        flash('Cuenta de retiro guardada correctamente.', 'success')
        return redirect(url_for('client.withdrawal_account'))
    return render_template('client/withdraw_account.html', editing=request.args.get('edit'))

@client_bp.route('/records/<type>')
@login_required
def records(type):
    title = "recarga" if type == 'recharge' else "retiros"
    filter_type = 'deposit' if type == 'recharge' else 'withdraw'
    txs = Transaction.query.filter_by(user_id=current_user.id).filter(Transaction.type.ilike(f'%{filter_type}%')).order_by(Transaction.date.desc()).all()
    return render_template('client/records.html', transactions=txs, title=title)

@client_bp.route('/service')
@login_required
def service():
    return render_template('client/service.html')

@client_bp.route('/invest/<int:product_id>', methods=['POST'])
@login_required
def invest(product_id):
    product = Product.query.get_or_404(product_id)
    if current_user.balance >= product.price:
        # Deduct balance
        current_user.balance -= product.price
        
        # Create UserProduct
        user_product = UserProduct(
            user_id=current_user.id,
            product_id=product.id
        )
        db.session.add(user_product)
        
        # Create transaction record
        transaction = Transaction(
            user_id=current_user.id,
            type='investment',
            amount=product.price,
            details=f'Inversión en {product.title}',
            status='approved'
        )
        db.session.add(transaction)
        db.session.commit()
        flash(f'¡Has invertido en {product.title}! Revisa "Mis productos" para reclamar tus ganancias diarias.', 'success')
    else:
        flash('Saldo insuficiente para esta inversión.', 'danger')
        
    return redirect(url_for('client.dashboard'))
