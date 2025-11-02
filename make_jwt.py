import time, os
import jwt  # pip install PyJWT

APP_ID = "2223898"  # e.g. "123456"
if not APP_ID or not APP_ID.isdigit():
    raise SystemExit("Set GH_APP_ID to your numeric GitHub App ID")

with open("/home/ryandallimore/Downloads/jambot-site-app.2025-11-02.private-key.pem", "r", encoding="utf-8") as f:
    private_key = f.read()

now = int(time.time())
payload = {
    "iat": now - 60,          # backdate 60s for clock skew
    "exp": now + 9 * 60,      # max 10m; use 9m to be safe
    "iss": APP_ID             # numeric App ID
}

token = jwt.encode(payload, private_key, algorithm="RS256")
# PyJWT>=2 returns a str; if you’re on an older PyJWT it returns bytes
if isinstance(token, bytes):
    token = token.decode("utf-8")

print(token)
