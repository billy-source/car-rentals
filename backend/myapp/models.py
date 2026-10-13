from django.db import models


class Car(models.Model):
    name = models.CharField(max_length=100)
    car_type = models.CharField(max_length=30)  # Economy, SUV, Van...
    price_per_day = models.PositiveIntegerField()
    seats = models.PositiveSmallIntegerField(default=5)
    transmission = models.CharField(max_length=20, default="Automatic")
    fuel = models.CharField(max_length=20, default="Petrol")
    image_url = models.URLField(blank=True)
    available = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class Booking(models.Model):
    car = models.ForeignKey(Car, on_delete=models.CASCADE, related_name="bookings")
    customer_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20)
    pickup_date = models.DateField()
    return_date = models.DateField()
    total_price = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.customer_name} - {self.car.name}"
