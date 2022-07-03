from django.urls import path
from .views import PerspectiveTransformView


urlpatterns = [
    path('generate/', PerspectiveTransformView.as_view(), name='transform'),
]