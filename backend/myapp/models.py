from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import models

BLOCKING = ["pending", "approved", "active"]


class User(AbstractUser):
    class Role(models.TextChoices):
        CUSTOMER = "customer", "Customer"
        STAFF = "staff", "Rental Staff"
        ADMIN = "admin", "Business Administrator"

    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True)
    role = models.CharField(max_length=10, choices=Role.choices, default=Role.CUSTOMER)

    def save(self, *args, **kwargs):
        if self.is_superuser:
            self.role = self.Role.ADMIN
        super().save(*args, **kwargs)


class Vehicle(models.Model):
    class Status(models.TextChoices):
        AVAILABLE = "available", "Available"
        MAINTENANCE = "maintenance", "In maintenance"

    make = models.CharField(max_length=50)
    model = models.CharField(max_length=50)
    year = models.PositiveSmallIntegerField()
    category = models.CharField(max_length=30)  # Economy, SUV, Van, Luxury...
    plate_number = models.CharField(max_length=20, unique=True)
    price_per_day = models.DecimalField(max_digits=10, decimal_places=2)
    seats = models.PositiveSmallIntegerField(default=5)
    transmission = models.CharField(max_length=20, default="Automatic")
    fuel = models.CharField(max_length=20, default="Petrol")
    mileage = models.PositiveIntegerField(default=0)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=15, choices=Status.choices, default=Status.AVAILABLE)
    is_active = models.BooleanField(default=True)  # False = removed from listings
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.make} {self.model} ({self.plate_number})"


class VehicleImage(models.Model):
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to="vehicles/")
    is_primary = models.BooleanField(default=False)


class Booking(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"
        CANCELLED = "cancelled", "Cancelled"
        ACTIVE = "active", "Active (picked up)"
        COMPLETED = "completed", "Completed"

    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="bookings")
    vehicle = models.ForeignKey(Vehicle, on_delete=models.PROTECT, related_name="bookings")
    start_date = models.DateField()
    end_date = models.DateField()  # return date; same-day turnover is allowed
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    total_price = models.DecimalField(max_digits=12, decimal_places=2)
    deposit_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    notes = models.TextField(blank=True)
    pickup_mileage = models.PositiveIntegerField(null=True, blank=True)
    pickup_notes = models.TextField(blank=True)
    return_mileage = models.PositiveIntegerField(null=True, blank=True)
    return_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    @classmethod
    def overlapping(cls, vehicle, start, end):
        return cls.objects.filter(vehicle=vehicle, status__in=BLOCKING,
                                  start_date__lt=end, end_date__gt=start)

    @classmethod
    def overlapping_vehicle_ids(cls, start, end):
        return cls.objects.filter(status__in=BLOCKING, start_date__lt=end,
                                  end_date__gt=start).values_list("vehicle_id", flat=True)