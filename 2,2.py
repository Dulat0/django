from django.urls import path
from .views import UserCreate, ObtainTokenPairWithInfo

urlpatterns = [
    path('register/', UserCreate.as_view(), name='user-register'),
    path('token/', ObtainTokenPairWithInfo.as_view(), name='token_obtain_pair'),
]
