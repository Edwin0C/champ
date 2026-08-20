from flask import Blueprint, render_template, redirect, url_for, flash, request
from flask_login import login_user, logout_user, login_required, current_user
from app.models import User

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        if current_user.role == 'admin':
            return redirect(url_for('admin.dashboard'))
        return redirect(url_for('client.dashboard'))

    if request.method == 'POST':
        username_input = request.form.get('username')
        password = request.form.get('password')
        
        # Try with +593 prefix (for phone numbers) first, then without (for admin)
        username = '+593' + username_input
        user = User.query.filter_by(username=username).first()
        
        # If not found, try without prefix (for admin login)
        if not user:
            user = User.query.filter_by(username=username_input).first()

        if user and user.check_password(password):
            login_user(user)
            
            # Welcome bonus for first-time login
            if not user.bonus_claimed and user.role == 'client':
                from app.extensions import db
                user.balance += 4.0
                user.bonus_claimed = True
                # Record the bonus as a transaction
                from app.models import Transaction
                bonus_tx = Transaction(
                    user_id=user.id,
                    type='deposit',
                    amount=4.0,
                    details='Bono de bienvenida - nuevo usuario',
                    status='approved'
                )
                db.session.add(bonus_tx)
                db.session.commit()
                flash('🎉 ¡Se han acreditado $4.00 USD a tu cuenta como bono de bienvenida!', 'success')
            
            if user.role == 'admin':
                return redirect(url_for('admin.dashboard'))
            return redirect(url_for('client.dashboard'))
        else:
            flash('Usuario o contraseña incorrectos.', 'danger')

    return render_template('auth/login.html')

@auth_bp.route('/logout')
@login_required
def logout():
    logout_user()
    flash('Has cerrado sesión correctamente.', 'info')
    return redirect(url_for('auth.login'))

@auth_bp.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('client.dashboard'))
    
    if request.method == 'POST':
        nombre = request.form.get('nombre', '').strip()
        apellido = request.form.get('apellido', '').strip()
        phone_input = request.form.get('phone', '').strip()
        password = request.form.get('password', '')
        
        # Build full phone number with +593
        phone = '+593' + phone_input
        
        # Validations
        if not nombre or not apellido:
            flash('Nombre y apellido son requeridos.', 'danger')
            return render_template('auth/register.html')
        
        if not phone_input.isdigit() or len(phone_input) != 9:
            flash('El número de teléfono debe tener 9 dígitos.', 'danger')
            return render_template('auth/register.html')
        
        if not phone_input.startswith('9'):
            flash('El número de teléfono ecuatoriano debe comenzar con 9.', 'danger')
            return render_template('auth/register.html')
        
        if len(password) < 6:
            flash('La contraseña debe tener al menos 6 caracteres.', 'danger')
            return render_template('auth/register.html')
        
        # Check if phone already exists
        from app.extensions import db
        existing_user = User.query.filter_by(phone=phone).first()
        if existing_user:
            flash('Este número de teléfono ya está registrado.', 'danger')
            return render_template('auth/register.html')
        
        # Create user
        new_user = User(
            username=phone,  # Use phone as username for login
            nombre=nombre,
            apellido=apellido,
            phone=phone,
            role='client'
        )
        new_user.set_password(password)
        
        db.session.add(new_user)
        db.session.commit()
        
        flash('¡Registro exitoso! Ahora puedes iniciar sesión.', 'success')
        return redirect(url_for('auth.login'))
    
    return render_template('auth/register.html')

