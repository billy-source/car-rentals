from datetime import date
from decimal import Decimal

from django.conf import settings
from django.contrib.auth.password_validation import validate_password
from django.db import transaction
from rest_framework import serializers

from .models import Booking, User, Vehicle, VehicleImage


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])

    class Meta:
        model = User
        fields = ["username", "email", "password", "first_name", "last_name", "phone"]

    def create(self, data):
        # Role is never accepted from the client: public sign-ups are always customers.
        return User.objects.create_user(role=User.Role.CUSTOMER, **data)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "phone", "role"]
        read_only_fields = ["id", "username", "role"]


class VehicleImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = VehicleImage
        fields = ["id", "image", "is_primary"]


class VehicleSerializer(serializers.ModelSerializer):
    images = VehicleImageSerializer(many=True, read_only=True)

    class Meta:
        model = Vehicle
        fields = "__all__"
        read_only_fields = ["created_at"]


class BookingSerializer(serializers.ModelSerializer):
    vehicle_name = serializers.CharField(source="vehicle.__str__", read_only=True)
    customer_name = serializers.SerializerMethodField()
    customer_phone = serializers.CharField(source="customer.phone", read_only=True)

    def get_customer_name(self, b):
        return b.customer.get_full_name() or b.customer.username

    class Meta:
        model = Booking
        fields = "__all__"
        read_only_fields = ["customer", "status", "total_price", "deposit_amount", "pickup_mileage",
                            "pickup_notes", "return_mileage", "return_notes", "created_at"]

    def validate(self, d):
        v, start, end = d["vehicle"], d["start_date"], d["end_date"]
        if start < date.today():
            raise serializers.ValidationError("Start date cannot be in the past.")
        if end <= start:
            raise serializers.ValidationError("Return date must be after the start date.")
        if not v.is_active or v.status != Vehicle.Status.AVAILABLE:
            raise serializers.ValidationError("This vehicle is not available for booking.")
        if Booking.overlapping(v, start, end).exists():
            raise serializers.ValidationError("This vehicle is already booked for those dates.")
        return d

    def create(self, data):
        v, start, end = data["vehicle"], data["start_date"], data["end_date"]
        with transaction.atomic():
            Vehicle.objects.select_for_update().get(pk=v.pk)  # lock row to prevent double-booking
            if Booking.overlapping(v, start, end).exists():
                raise serializers.ValidationError("This vehicle is already booked for those dates.")
            total = v.price_per_day * (end - start).days
            deposit = (total * Decimal(settings.DEPOSIT_PERCENT) / 100).quantize(Decimal("0.01"))
            return Booking.objects.create(customer=self.context["request"].user,
                                          total_price=total, deposit_amount=deposit, **data)


class HandoverSerializer(serializers.Serializer):
    mileage = serializers.IntegerField(min_value=0)
    notes = serializers.CharField(required=False, allow_blank=True, default="")