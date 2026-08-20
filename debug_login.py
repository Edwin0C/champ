import requests

session = requests.Session()
url = 'http://127.0.0.1:5000/login'
data = {
    'username': '984917595',
    'password': 'client123'
}

print(f"Attempting login to {url} with user 984917595")
response = session.post(url, data=data, allow_redirects=False)

print(f"Response Code: {response.status_code}")
if 'Location' in response.headers:
    print(f"Redirect Location: {response.headers['Location']}")
    # Also print absolute URL if relative
    if not response.headers['Location'].startswith('http'):
        print(f"Absolute Redirect: http://127.0.0.1:5000{response.headers['Location']}")
else:
    print("No redirect (Login failed?)")

print("Cookies:", session.cookies.get_dict())
