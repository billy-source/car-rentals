from rest_framework import serializers
from .models import Car, Booking


class CarSerializer(serializers.ModelSerializer):
    class Meta:
        model = Car
        fields = "__all__"


class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = "__all__"
        read_only_fields = ["total_price", "created_at"]

    def validate(self, data):
        days = (data["return_date"] - data["pickup_date"]).days
        if days < 1:
            raise serializers.ValidationError("Return date must be after pickup date.")
        if not data["car"].available:
            raise serializers.ValidationError("This car is not available.")
        data["total_price"] = days * data["car"].price_per_day
        return data