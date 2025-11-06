from waitress import serve
from app import app

if __name__ == '__main__':
    print("Starting production server with 8 threads...")
    serve(app, host='0.0.0.0', port=5000, threads=8)
