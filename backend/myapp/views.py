from rest_framework import viewsets, mixins
from .models import Car, Booking
from .serializers import CarSerializer, BookingSerializer


class CarViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Car.objects.filter(available=True)
    serializer_class = CarSerializer


class BookingViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer