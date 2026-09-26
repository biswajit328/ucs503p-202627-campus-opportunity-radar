import sys, os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.getcwd())

from app.main import app
print(f"Backend OK - {len(app.routes)} routes registered")
for route in app.routes:
    if hasattr(route, 'path') and hasattr(route, 'methods'):
        print(f"  {', '.join(route.methods):8s} {route.path}")
