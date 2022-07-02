from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
import base64, cv2
import numpy as np
from .functions import get_top_down_view

# Create your views here.
class PerspectiveTransformView(APIView):
    parser_classes = [FormParser, MultiPartParser]
    def post(self, request):
        file_obj = request.data['file']
        img = cv2.imread(file_obj)
        print(img.shape)
        # base64img = request.body
        # base64img = str(base64img).split(',')[-1]
        # np_array = np.frombuffer(base64.b64decode(base64img), np.uint8)
        # img = cv2.imdecode(np_array, cv2.IMREAD_COLOR)
        # top_down_img = get_top_down_view(img, show_output=False)
        # output = cv2.imencode('.jpg', top_down_img)[1]
        # output = base64.b64encode(output)
        # mime = "image/jpeg"
        # img_data = "data:%s;base64,%s" % (mime, output.decode('utf-8'))
        return Response({'img': 'done'})

