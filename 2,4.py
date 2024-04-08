from rest_framework import generics
from rest_framework import filters
from .models import YourModel
from .serializers import YourModelSerializer

class YourModelSearchAPIView(generics.ListAPIView):
    queryset = YourModel.objects.all()
    serializer_class = YourModelSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']  
