from django.db import models
from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
    PermissionsMixin,
)
from django.utils import timezone
from main.utils import uuid_to_date, generate_unique_filename


class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("name", "ahmed")

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(max_length=250, null=True, unique=True)
    name = models.CharField(max_length=255, null=True, blank=True)
    is_expert = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    password = models.CharField(max_length=250, blank=True)
    USERNAME_FIELD = "email"
    objects = CustomUserManager()


class Request(models.Model):
    article_choices = [
        ("t_shirt", "t_shirt"),
        ("sweet_shirt", "sweet_shirt"),
        ("mug", "mug"),
        ("key_ring", "key_ring"),
    ]
    size_choices = [
        ("S", "S"),
        ("M", "M"),
        ("L", "L"),
        ("XL", "XL"),
        ("XXL", "XXL"),
    ]
    request_choices = [
        ("unseen", "unseen"),
        ("seen", "seen"),
        ("pending", "pending"),
        ("progress", "progress"),
        ("finished", "finished"),
    ]
    article = models.CharField(max_length=255, choices=article_choices, default="")
    description = models.TextField(default="", blank=True, null=True)
    phone = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=255, blank=True, null=True)  # Added city field
    name = models.CharField(max_length=255, blank=True, null=True)  # Added name field
    text = models.TextField(max_length=255, blank=True, null=True)
    design = models.ImageField(upload_to=generate_unique_filename, blank=True, null=True)
    # New fields for Cloudinary-stored images
    front_image = models.ImageField(upload_to="order_designs/front", blank=True, null=True)
    back_image = models.ImageField(upload_to="order_designs/back", blank=True, null=True)
    # Keep original fields for backward compatibility
    frontImage = models.TextField(null=True, blank=True)
    backImage = models.TextField(null=True, blank=True)
    color = models.CharField(max_length=255, default="white")
    size = models.CharField(
        max_length=255, choices=size_choices, default="", blank=True, null=True
    )
    quantity = models.PositiveIntegerField(default=1)  # Added quantity field
    creation_date = models.DateTimeField(default=timezone.now)
    is_seen = models.BooleanField(default=False)
    state = models.CharField(max_length=255, choices=request_choices, default="unseen")
    is_delivered = models.BooleanField(default=False)
    submitted_date = models.DateTimeField(null=True, blank=True)
    first_url = models.CharField(max_length=255, blank=True)
    last_url = models.CharField(max_length=255, blank=True)
    referrer = models.TextField(null=True, blank=True)
    repetitions = models.PositiveIntegerField(default=0)
    uuid = models.CharField(max_length=255, blank=True, null=True)
    price = models.PositiveIntegerField(default=0)

    @property
    def first_visit_date(self):
        if not self.uuid or "-" not in self.uuid:
            return "-"
        return uuid_to_date(self.uuid)


class Picture(models.Model):
    image = models.ImageField(upload_to="order_pictures")
    request = models.ForeignKey(
        Request,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="pictures",
    )


class Statistics(models.Model):
    start_date = models.DateField(default=timezone.now)
    finish_date = models.DateField(default=timezone.now)
    total_requests = models.PositiveIntegerField(default=0)
    new_requests = models.PositiveIntegerField(default=0)
    unseen_requests = models.PositiveIntegerField(default=0)
    in_progress_requests = models.PositiveIntegerField(default=0)
    finished_requests = models.PositiveIntegerField(default=0)
    delivered_requests = models.PositiveIntegerField(default=0)
    conversion_rate = models.FloatField(default=0.0)
    total_revenue = models.PositiveIntegerField(default=0)
    repetitions_count = models.PositiveIntegerField(default=0)
    top_article = models.CharField(max_length=255, default="")
    top_color = models.CharField(max_length=255, default="")


class Contact(models.Model):
    """Model for storing contact form submissions."""
    fullName = models.CharField(max_length=255)
    email = models.EmailField()
    phoneNumber = models.CharField(max_length=20)
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    read = models.BooleanField(default=False)
    
    def __str__(self):
        return f"Contact from {self.fullName} - {self.timestamp.strftime('%Y-%m-%d %H:%M')}"