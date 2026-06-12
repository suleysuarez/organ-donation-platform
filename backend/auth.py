from flask import Blueprint, request, jsonify
from database import db, bcrypt
from app import User, BloodType, Gender
from datetime import datetime

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/auth/register', methods=['POST'])
def register():
    """Registra un nuevo usuario en el sistema"""
    
    data = request.get_json()
    
    # Validar campos requeridos
    required_fields = [
        'username', 'email', 'password', 
        'first_name', 'last_name', 'dni',
        'birth_date', 'gender', 'blood_type', 'phone'
    ]
    
    for field in required_fields:
        if field not in data or not data[field]:
            return jsonify({'error': f'El campo {field} es requerido'}), 400
    
    # Validar que username no exista
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'El nombre de usuario ya existe'}), 409
    
    # Validar que email no exista
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'El email ya está registrado'}), 409
    
    # Validar que DNI no exista
    if User.query.filter_by(dni=data['dni']).first():
        return jsonify({'error': 'El DNI ya está registrado'}), 409
    
    # Validar tipo de sangre
    try:
        blood_type = BloodType(data['blood_type'])
    except ValueError:
        tipos = [t.value for t in BloodType]
        return jsonify({'error': f'Tipo de sangre inválido. Opciones: {tipos}'}), 400
    
    # Validar género
    try:
        gender = Gender(data['gender'])
    except ValueError:
        generos = [g.value for g in Gender]
        return jsonify({'error': f'Género inválido. Opciones: {generos}'}), 400
    
    # Validar fecha de nacimiento
    try:
        birth_date = datetime.strptime(data['birth_date'], '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'error': 'Formato de fecha inválido. Use YYYY-MM-DD'}), 400
    
    # Crear usuario
    user = User(
        username=data['username'],
        email=data['email'],
        first_name=data['first_name'],
        last_name=data['last_name'],
        dni=data['dni'],
        birth_date=birth_date,
        gender=gender,
        blood_type=blood_type,
        phone=data['phone'],
        address=data.get('address', ''),
        city=data.get('city', ''),
        country=data.get('country', 'Argentina')
    )
    
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({
        'message': 'Usuario registrado exitosamente',
        'user': user.to_dict()
    }), 201