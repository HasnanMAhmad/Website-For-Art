import http.server
import socketserver
import os
import sys
import json
from datetime import datetime

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(DIRECTORY, 'api', 'data')
ORDERS_FILE = os.path.join(DATA_DIR, 'orders.json')

class SPAHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def _send_json_response(self, data, status_code=200):
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PATCH, PUT, DELETE')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-Studio-Pin')
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False).encode('utf-8'))

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PATCH, PUT, DELETE')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-Studio-Pin')
        self.end_headers()

    def do_POST(self):
        clean_path = self.path.split('?')[0].split('#')[0].lstrip('/')
        content_length = int(self.headers.get('Content-Length', 0))
        raw_body = self.rfile.read(content_length) if content_length > 0 else b'{}'
        
        try:
            payload = json.loads(raw_body.decode('utf-8')) if raw_body else {}
        except Exception:
            payload = {}

        if clean_path == 'api/orders.php':
            os.makedirs(DATA_DIR, exist_ok=True)
            orders = []
            if os.path.exists(ORDERS_FILE):
                try:
                    with open(ORDERS_FILE, 'r', encoding='utf-8') as f:
                        orders = json.load(f)
                except Exception:
                    orders = []

            # Prepare order record
            order_id = payload.get('id', f"order-{int(datetime.now().timestamp()*1000)}")
            order_number = payload.get('orderNumber', f"MISHI-{datetime.now().strftime('%Y')}-{order_id[-5:].upper()}")
            
            order_record = {
                'id': order_id,
                'orderNumber': order_number,
                'customer': payload.get('customer', {
                    'name': payload.get('customerName', 'Guest Collector'),
                    'email': payload.get('customerEmail', ''),
                    'phone': payload.get('customerPhone', ''),
                    'address': payload.get('deliveryAddress', '')
                }),
                'items': payload.get('items', []),
                'currency': payload.get('currency', 'GBP'),
                'totalGBP': payload.get('totalGBP', 0.0),
                'formattedTotal': payload.get('formattedTotal', ''),
                'checkoutMethod': payload.get('checkoutMethod', 'card_gateway'),
                'paymentStatus': payload.get('paymentStatus', 'paid'),
                'transactionId': payload.get('transactionId', f"TXN-{int(datetime.now().timestamp()*1000)}"),
                'cardLast4': payload.get('cardLast4', '4242'),
                'cardBrand': payload.get('cardBrand', 'Card'),
                'status': payload.get('status', 'paid'),
                'createdAt': payload.get('createdAt', datetime.now().isoformat())
            }

            orders.insert(0, order_record)
            with open(ORDERS_FILE, 'w', encoding='utf-8') as f:
                json.dump(orders, f, indent=2, ensure_ascii=False)

            return self._send_json_response({
                'success': True,
                'message': 'Order successfully recorded locally in api/data/orders.json',
                'orderId': order_id,
                'orderNumber': order_number,
                'savedToDb': False,
                'order': order_record
            })

        elif clean_path.startswith('api/'):
            return self._send_json_response({'success': True})

        return super().do_GET()

    def do_GET(self):
        # Extract path without query parameters or anchors
        clean_path = self.path.split('?')[0].split('#')[0]
        trimmed_path = clean_path.lstrip('/')

        # Handle local mock for orders.php
        if trimmed_path == 'api/orders.php':
            orders = []
            if os.path.exists(ORDERS_FILE):
                try:
                    with open(ORDERS_FILE, 'r', encoding='utf-8') as f:
                        orders = json.load(f)
                except Exception:
                    orders = []
            return self._send_json_response({
                'success': True,
                'count': len(orders),
                'dbMode': 'local_python_json',
                'orders': orders
            })

        # Local system path
        local_file_path = os.path.join(DIRECTORY, trimmed_path)

        # If the file or directory exists physically, serve it normally
        if os.path.exists(local_file_path) and not os.path.isdir(local_file_path):
            return super().do_GET()
        elif clean_path == '/' or clean_path == '':
            return super().do_GET()
        else:
            # SPA fallback: Serve index.html for clean routes like /originals, /prints, etc.
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.end_headers()
            with open(os.path.join(DIRECTORY, 'index.html'), 'rb') as f:
                self.wfile.write(f.read())

if __name__ == '__main__':
    # Allow port reuse immediately
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), SPAHandler) as httpd:
        print(f"Local SPA Server running at http://localhost:{PORT}/")
        print(f"Serving directory: {DIRECTORY}")
        sys.stdout.flush()
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            pass
