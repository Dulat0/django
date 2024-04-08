from rest_framework import generics
from rest_framework import filters
from .models import YourModel
from .serializers import YourModelSerializer

class YourModelListAPIView(generics.ListAPIView):
    queryset = YourModel.objects.all()
    serializer_class = YourModelSerializer
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['field1', 'field2']  # Поля, по которым можно сортировать

    def get_queryset(self):
        queryset = super().get_queryset()
        ordering = self.request.query_params.get('ordering', 'default_field_to_sort')
        if ordering in self.ordering_fields:
            queryset = queryset.order_by(ordering)
        return queryset
