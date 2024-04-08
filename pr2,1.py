from rest_framework import generics, permissions
from rest_framework_simplejwt.views
from django.contrib.auth.models import TokenObtainPairView
from .serializers import UserSerializer import RefreshToken 
from rest_framework_simplejwt.tokens import User

class UserCreate(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

class ObtainTokenPairWithInfo(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        refresh = RefreshToken.for_user(user)
        return user



