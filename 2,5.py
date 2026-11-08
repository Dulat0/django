from rest_framework import generics
from rest_framework import filters
from .models import YourModel
from .serializers import YourModelSerializer

class YourModelListAPIView(generics.ListAPIView):
    queryset = YourModel.objects.all()
    serializer_class = YourModelSerializer
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['field1', 'field2']  # Поля, по которым можно сортировать (?ordering=-field1)
    ordering = ['field1']  # Сортировка по умолчанию
