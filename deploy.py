"""
MISHIS ARTWORK — Automated Production FTP Deployment Pipeline
Deploys local storefront bundle and backend API to Hostinger public_html.
"""
from ftplib import FTP
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

FTP_HOST = '145.79.209.71' # Hostinger Production FTP IP
FTP_PORT = 21
FTP_USER = 'u325926470.mishisartwork.com'
FTP_PASS = 'Mishiart_0401'
TARGET_DIR = '/public_html'
SOURCE_FILE = 'index.html'

def upload_dir_recursive(ftp, local_dir, remote_dir):
    try:
        ftp.mkd(remote_dir)
    except Exception:
        pass

    for item in os.listdir(local_dir):
        local_path = os.path.join(local_dir, item)
        remote_path = f"{remote_dir}/{item}"
        if os.path.isdir(local_path):
            upload_dir_recursive(ftp, local_path, remote_path)
        else:
            if item in ['orders.json', 'artworks.json']:
                try:
                    if ftp.size(remote_path) is not None:
                        print(f"[DEPLOY] Preserving existing remote data file: {remote_path}")
                        continue
                except Exception:
                    pass
            with open(local_path, 'rb') as f:
                print(f"[DEPLOY] Syncing {local_path} -> {remote_path}...")
                ftp.storbinary(f'STOR {remote_path}', f)

def deploy():
    if not os.path.exists(SOURCE_FILE):
        print(f"[DEPLOY ERROR] Source bundle '{SOURCE_FILE}' not found in current directory.")
        sys.exit(1)

    file_size = os.path.getsize(SOURCE_FILE)
    print(f"[DEPLOY] Preparing deployment of '{SOURCE_FILE}' ({file_size:,} bytes)...")
    print(f"[DEPLOY] Connecting to Hostinger FTP at {FTP_HOST}:{FTP_PORT}...")

    try:
        ftp = FTP(timeout=30)
        ftp.connect(FTP_HOST, FTP_PORT)
        print(f"[DEPLOY] Authenticating as user '{FTP_USER}'...")
        ftp.login(FTP_USER, FTP_PASS)
        print(f"[DEPLOY] Logged in successfully. Current remote directory: {ftp.pwd()}")

        # Ensure in public_html
        if 'public_html' not in ftp.pwd():
            try:
                ftp.cwd('public_html')
                print(f"[DEPLOY] Navigated to: {ftp.pwd()}")
            except Exception as e:
                print(f"[DEPLOY WARN] Could not cwd to public_html: {e}")

        # Stream binary upload for index.html
        with open(SOURCE_FILE, 'rb') as f:
            print(f"[DEPLOY] Uploading payload to remote index.html...")
            ftp.storbinary('STOR index.html', f)

        # Upload .htaccess for clean URL routing & performance headers
        if os.path.exists('.htaccess'):
            with open('.htaccess', 'rb') as f:
                print("[DEPLOY] Uploading .htaccess for clean URL routing...")
                ftp.storbinary('STOR .htaccess', f)
                print("[DEPLOY] Successfully uploaded .htaccess")

        # Upload /api directory
        if os.path.exists('api'):
            print("[DEPLOY] Synchronizing backend API suite to remote...")
            upload_dir_recursive(ftp, 'api', 'api')

        print("[DEPLOY] Upload complete! Running post-deploy verification...")
        ftp.quit()

        # Run verification check
        import subprocess
        subprocess.run([sys.executable, 'verify-site-secure.py'])

    except Exception as e:
        print(f"[DEPLOY FAILED] FTP operation encountered error: {e}")
        sys.exit(1)

if __name__ == '__main__':
    deploy()
