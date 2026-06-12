import os

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'clave-secreta')
    SQLALCHEMY_DATABASE_URI = 'sqlite:///donacion.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False