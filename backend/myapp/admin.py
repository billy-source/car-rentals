from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import Booking, User, Vehicle, VehicleImage

admin.site.register(User, UserAdmin)
admin.site.register(Vehicle)
admin.site.register(VehicleImage)
admin.site.register(Booking)