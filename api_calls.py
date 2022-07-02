import requests, io, base64
from PIL import Image
import numpy as np

url = 'http://127.0.0.1:8000/api/'
img_url = 'test_img_11.jpg'

img = Image.open(img_url)
img = np.array(img)
img = Image.fromarray(img.astype(np.uint8))
data = io.BytesIO()
img.save(data, 'PNG')
encoded = base64.b64encode(data.getvalue())

payload = requests.post(url, data={'img': encoded})
# print(payload.json())
base64img = payload.json()['processed img']
img = base64.b64decode(base64img)
img = io.BytesIO(img)
img = Image.open(img)
img.save('output.jpg')
