from django.urls import path
from .views import PerspectiveTransformView


urlpatterns = [
    path('', PerspectiveTransformView.as_view(), name='transform'),
]