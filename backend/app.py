from flask import Flask
from config import Config
from database import db, bcrypt

app = Flask(__name__)
app.config.from_object(Config)
db.init_app(app)
bcrypt.init_app(app)

# Aquí va el modelo de usuario
from flask_login import UserMixin
from datetime import datetime
import enum

class BloodType(enum.Enum):
    A_POSITIVE = "A+"
    A_NEGATIVE = "A-"
    B_POSITIVE = "B+"
    B_NEGATIVE = "B-"
    AB_POSITIVE = "AB+"
    AB_NEGATIVE = "AB-"
    O_POSITIVE = "O+"
    O_NEGATIVE = "O-"

class Gender(enum.Enum):
    MALE = "Masculino"
    FEMALE = "Femenino"
    OTHER = "Otro"

class OrganDonorStatus(enum.Enum):
    REGISTERED = "Registrado"
    PENDING_APPROVAL = "Pendiente"
    ACTIVE_DONOR = "Activo"
    INACTIVE = "Inactivo"

class User(UserMixin, db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    dni = db.Column(db.String(20), unique=True, nullable=False)
    birth_date = db.Column(db.Date, nullable=False)
    gender = db.Column(db.Enum(Gender), nullable=False)
    blood_type = db.Column(db.Enum(BloodType), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    address = db.Column(db.String(200))
    city = db.Column(db.String(100))
    country = db.Column(db.String(100), default='Argentina')
    is_donor = db.Column(db.Boolean, default=False)
    donor_status = db.Column(db.Enum(OrganDonorStatus))
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    
    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)

# Crear tablas
with app.app_context():
    db.create_all()

from auth import auth_bp
app.register_blueprint(auth_bp)

if __name__ == '__main__':
    app.run(debug=True)