from flask import Blueprint, render_template, redirect, url_for, flash, request, abort
from flask_login import login_required, current_user
from app.extensions import db
from app.models import User, Product, Transaction, UserProduct

admin_bp = Blueprint('admin', __name__, url_prefix='/admin')

@admin_bp.before_request
@login_required
def require_admin():
    if current_user.role != 'admin':
        abort(403)

@admin_bp.route('/')
def dashboard():
    print(f"DEBUG: Accessing Admin Dashboard. User: {current_user.username}, Role: '{current_user.role}'")
    users = User.query.filter_by(role='client').all()
    pending_recharges = Transaction.query.filter_by(type='deposit', status='pending').order_by(Transaction.date.desc()).all()
    pending_investments = Transaction.query.filter_by(type='investment', status='pending').order_by(Transaction.date.desc()).all()
    
    return render_template('admin/dashboard.html', users=users, 
                           pending_recharges=pending_recharges, pending_investments=pending_investments)

@admin_bp.route('/user/<int:user_id>/history')
def user_history(user_id):
    user = User.query.get_or_404(user_id)
    transactions = Transaction.query.filter_by(user_id=user_id).order_by(Transaction.date.desc()).all()
    return render_template('admin/user_history.html', user=user, transactions=transactions)

@admin_bp.route('/approve/<int:tx_id>', methods=['POST'])
@login_required
def approve_recharge(tx_id):
    if current_user.role != 'admin':
        abort(403)
    tx = Transaction.query.get_or_404(tx_id)
    
    # Handle Deposit Approval
    if tx.status == 'pending' and tx.type == 'deposit':
        tx.status = 'approved'
        user = User.query.get(tx.user_id)
        user.balance += tx.amount
        db.session.commit()
        flash(f'Recarga de ${tx.amount} aprobada.', 'success')
        
    # Handle Investment Approval
    elif tx.status == 'pending' and tx.type == 'investment':
        tx.status = 'approved'
        # Funds already deducted, just mark as active/approved
        db.session.commit()
        flash(f'Inversión de ${tx.amount} aprobada.', 'success')
        
    return redirect(url_for('admin.dashboard'))

@admin_bp.route('/reject/<int:tx_id>', methods=['POST'])
@login_required
def reject_recharge(tx_id):
    if current_user.role != 'admin':
        abort(403)
    tx = Transaction.query.get_or_404(tx_id)
    
    if tx.status == 'pending':
        tx.status = 'rejected'
        
        # If it was an investment, REFUND the user
        if tx.type == 'investment':
            user = User.query.get(tx.user_id)
            user.balance += tx.amount # Refund
            flash('Inversión rechazada. Fondos devueltos al usuario.', 'warning')
        else:
            flash('Solicitud rechazada', 'warning')
            
        db.session.commit()
        
    return redirect(url_for('admin.dashboard'))

@admin_bp.route('/product/add', methods=['POST'])
def add_product():
    title = request.form.get('title')
    description = request.form.get('description')
    price = float(request.form.get('price'))
    image_url = request.form.get('image_url')
    
    new_product = Product(title=title, description=description, price=price, image_url=image_url)
    db.session.add(new_product)
    db.session.commit()
    
    flash('Producto agregado exitosamente.', 'success')
    return redirect(url_for('admin.dashboard'))

@admin_bp.route('/user/<int:user_id>/update_balance', methods=['POST'])
def update_balance(user_id):
    user = User.query.get_or_404(user_id)
    new_balance = float(request.form.get('balance'))
    user.balance = new_balance
    db.session.commit()
    flash(f'Balance actualizado para {user.username}.', 'success')
    return redirect(url_for('admin.dashboard'))

@admin_bp.route('/user/<int:user_id>/edit', methods=['POST'])
def edit_user(user_id):
    user = User.query.get_or_404(user_id)
    nombre = request.form.get('nombre', user.nombre)
    apellido = request.form.get('apellido', user.apellido)
    phone = request.form.get('phone', '')
    balance = request.form.get('balance', user.balance)
    
    user.nombre = nombre
    user.apellido = apellido
    if phone:
        user.phone = '+593' + phone
        user.username = '+593' + phone
    user.balance = float(balance)
    db.session.commit()
    flash(f'Usuario {user.nombre} {user.apellido} actualizado.', 'success')
    return redirect(url_for('admin.dashboard'))

@admin_bp.route('/user/<int:user_id>/delete', methods=['POST'])
def delete_user(user_id):
    user = User.query.get_or_404(user_id)
    # Eliminar primero todos los registros relacionados para evitar errores de FK
    UserProduct.query.filter_by(user_id=user.id).delete()
    Transaction.query.filter_by(user_id=user.id).delete()
    db.session.delete(user)
    db.session.commit()
    flash('Usuario eliminado permanentemente.', 'warning')
    return redirect(url_for('admin.dashboard'))

@admin_bp.route('/user/<int:user_id>/toggle', methods=['POST'])
def toggle_user(user_id):
    user = User.query.get_or_404(user_id)
    user.is_disabled = not user.is_disabled
    db.session.commit()
    status = 'deshabilitado' if user.is_disabled else 'habilitado'
    flash(f'Usuario {user.nombre} {status}.', 'info')
    return redirect(url_for('admin.dashboard'))

@admin_bp.route('/user/<int:user_id>/recharge', methods=['POST'])
def admin_recharge(user_id):
    user = User.query.get_or_404(user_id)
    amount = float(request.form.get('amount', 0))
    if amount > 0:
        user.balance += amount
        t = Transaction(user_id=user.id, type='deposit', amount=amount, 
                       details=f'Recarga por admin (${amount})', status='approved')
        db.session.add(t)
        db.session.commit()
        flash(f'Recarga de ${amount} aplicada a {user.nombre} {user.apellido}.', 'success')
    return redirect(url_for('admin.dashboard'))
