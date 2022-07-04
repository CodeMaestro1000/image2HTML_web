from django.http import FileResponse
from rest_framework.response import Response
from rest_framework.views import APIView
import cloudinary, cloudinary.uploader, imutils, datetime, os
from .functions import get_top_down_view, detect_shapes, generate_output_html
from config import settings


cloudinary.config( 
  cloud_name = settings.CLOUD_NAME, 
  api_key = settings.API_KEY, 
  api_secret = settings.API_SECRET,
  secure = True
)
# Create your views here.
class PerspectiveTransformView(APIView):
    def post(self, request):
        data = request.data
        image = imutils.url_to_image(data['url'])
        lower_threshold = int(data['lower'])
        upper_threshold = int(data['upper'])
        warped_image = get_top_down_view(image, lower_edge_threshold=lower_threshold, upper_edge_threshold=upper_threshold, show_output=False)
        shape_data = detect_shapes(warped_image, duplicate_threshold=2, delta=5, show_output=False) if warped_image is not None else None

        cloudinary.uploader.destroy(data['public_id'], signature='352455341867742')
        if shape_data:
            output_day = datetime.datetime.now().strftime('%y%m%d_%H-%M-%S')
            file_name = f'output_{output_day}.html'
            generate_output_html(shape_data, file_name, boiler_plate=False)
            response = FileResponse(open(file_name, 'rb'))
            os.remove(file_name)
            return response
        else:
            return Response({'status': 'No Shapes Detected'})

