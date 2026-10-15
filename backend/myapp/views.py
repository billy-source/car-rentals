from datetime import date

from rest_framework import generics, mixins, permissions, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import Booking, Vehicle
from .permissions import IsAdminRole, IsStaffOrAdmin
from .serializers import (BookingSerializer, HandoverSerializer, RegisterSerializer,
                          UserSerializer, VehicleImageSerializer, VehicleSerializer)

S = Booking.Status


# ---------- Accounts ----------
class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


# ---------- Vehicles ----------
class VehicleViewSet(viewsets.ModelViewSet):
    serializer_class = VehicleSerializer
    filterset_fields = {"category": ["exact"], "transmission": ["exact"], "fuel": ["exact"],
                        "seats": ["gte"], "price_per_day": ["gte", "lte"]}
    search_fields = ["make", "model", "category", "description"]
    ordering_fields = ["price_per_day", "year", "created_at"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [AllowAny()]
        return [IsAdminRole()]

    def get_queryset(self):
        qs = Vehicle.objects.prefetch_related("images")
        user = self.request.user
        is_admin = user.is_authenticated and user.role == "admin"
        if not is_admin:  # public sees only listed, non-maintenance vehicles
            qs = qs.filter(is_active=True, status=Vehicle.Status.AVAILABLE)

        start = self.request.query_params.get("available_from")
        end = self.request.query_params.get("available_to")
        if start and end:  # hide vehicles already booked in that window
            try:
                start, end = date.fromisoformat(start), date.fromisoformat(end)
            except ValueError:
                raise ValidationError("Dates must be in YYYY-MM-DD format.")
            if end <= start:
                raise ValidationError("available_to must be after available_from.")
            qs = qs.exclude(id__in=Booking.overlapping_vehicle_ids(start, end))
        return qs

    def perform_destroy(self, instance):
        instance.is_active = False  # keep booking history; never hard-delete
        instance.save(update_fields=["is_active"])

    @action(detail=True, methods=["post"], parser_classes=[MultiPartParser, FormParser])
    def upload_image(self, request, pk=None):
        vehicle = self.get_object()
        ser = VehicleImageSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        ser.save(vehicle=vehicle)
        return Response(ser.data, status=201)


# ---------- Bookings ----------
class BookingViewSet(mixins.CreateModelMixin, mixins.ListModelMixin,
                     mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    serializer_class = BookingSerializer
    filterset_fields = ["status", "vehicle"]
    ordering_fields = ["created_at", "start_date"]

    def get_permissions(self):
        perm = {"approve": IsAdminRole, "reject": IsAdminRole,
                "pickup": IsStaffOrAdmin, "return_vehicle": IsStaffOrAdmin}.get(self.action, IsAuthenticated)
        return [perm()]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Booking.objects.none()
        qs = Booking.objects.select_related("vehicle", "customer")
        u = self.request.user
        return qs if u.role in ("staff", "admin") else qs.filter(customer=u)

    def _move(self, booking, allowed, new, **fields):
        if booking.status not in allowed:
            raise ValidationError(f"A {booking.status} booking cannot be changed this way.")
        booking.status = new
        for k, v in fields.items():
            setattr(booking, k, v)
        booking.save()
        return Response(self.get_serializer(booking).data)

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        return self._move(self.get_object(), [S.PENDING], S.APPROVED)

    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        return self._move(self.get_object(), [S.PENDING], S.REJECTED)

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        b = self.get_object()  # customers can only reach their own bookings
        if request.user.role == "customer" and b.start_date <= date.today():
            raise PermissionDenied("Bookings can only be cancelled before the start date.")
        if request.user.role == "staff":
            raise PermissionDenied("Staff cannot cancel bookings.")
        return self._move(b, [S.PENDING, S.APPROVED], S.CANCELLED)

    @action(detail=True, methods=["post"])
    def pickup(self, request, pk=None):
        ser = HandoverSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        return self._move(self.get_object(), [S.APPROVED], S.ACTIVE,
                          pickup_mileage=ser.validated_data["mileage"],
                          pickup_notes=ser.validated_data["notes"])

    @action(detail=True, methods=["post"], url_path="return")
    def return_vehicle(self, request, pk=None):
        ser = HandoverSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        b = self.get_object()
        if b.pickup_mileage is not None and ser.validated_data["mileage"] < b.pickup_mileage:
            raise ValidationError("Return mileage cannot be lower than pickup mileage.")
        resp = self._move(b, [S.ACTIVE], S.COMPLETED,
                          return_mileage=ser.validated_data["mileage"],
                          return_notes=ser.validated_data["notes"])
        b.vehicle.mileage = ser.validated_data["mileage"]
        b.vehicle.save(update_fields=["mileage"])
        return resp