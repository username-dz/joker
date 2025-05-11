from rest_framework import serializers
from rest_framework.permissions import AllowAny
from .models import User, Request, Contact
from .utils import base64_to_image, generate_unique_filename


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = "__all__"

class RequestSerializer(serializers.ModelSerializer):
    # File upload fields - these will override model fields with the same name
    front_image = serializers.ImageField(required=False)
    back_image = serializers.ImageField(required=False)
    
    # Add fields to store the uploaded image URLs after Cloudinary processing
    front_image_url = serializers.SerializerMethodField(read_only=True)
    back_image_url = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = Request
        fields = "__all__"
        
    def get_front_image_url(self, obj):
        # Return the URL if the image exists
        if obj.front_image and hasattr(obj.front_image, 'url'):
            return obj.front_image.url
        # Fallback to design field if front_image is not available
        elif obj.design and hasattr(obj.design, 'url'):
            return obj.design.url
        return None
        
    def get_back_image_url(self, obj):
        # Return the URL if the image exists
        if obj.back_image and hasattr(obj.back_image, 'url'):
            return obj.back_image.url
        # Fallback to checking related pictures
        pictures = obj.pictures.all()
        if pictures.exists():
            picture = pictures.first()
            if picture.image and hasattr(picture.image, 'url'):
                return picture.image.url
        return None
        
    def create(self, validated_data):
        # Extract image files from validated data
        front_image = validated_data.pop('front_image', None)
        back_image = validated_data.pop('back_image', None)
        
        # For backward compatibility, also check for base64 data
        front_image_data = validated_data.pop('frontImage', None)
        back_image_data = validated_data.pop('backImage', None)
        
        # Create the request object
        request = Request.objects.create(**validated_data)
        
        # Process front image file if provided
        if front_image:
            try:
                # Make sure the file isn't already read/consumed
                if hasattr(front_image, 'seek') and callable(front_image.seek):
                    front_image.seek(0)
                # Save the file directly to the front_image field (Cloudinary)
                request.front_image.save(f'front_design_{request.id}.png', front_image, save=True)
            except Exception as e:
                print(f"Error saving front image: {e}")
        # Fallback to base64 data if file not provided
        elif front_image_data:
            try:
                front_image_file = base64_to_image(front_image_data, f'front_{request.id}')
                if front_image_file:
                    request.front_image.save(f'front_design_{request.id}.png', front_image_file, save=True)
                    request.frontImage = None  # Remove base64 data to save space
            except Exception as e:
                print(f"Error processing base64 front image: {e}")
        
        # Process back image file if provided
        if back_image:
            try:
                # Make sure the file isn't already read/consumed
                if hasattr(back_image, 'seek') and callable(back_image.seek):
                    back_image.seek(0)
                # Save the file directly to the back_image field (Cloudinary)
                request.back_image.save(f'back_design_{request.id}.png', back_image, save=True)
                
                # Also create a Picture instance for backward compatibility
                from .models import Picture
                picture = Picture()
                picture.request = request
                
                # Make a fresh copy of the file for the Picture model
                if hasattr(back_image, 'seek') and callable(back_image.seek):
                    back_image.seek(0)
                    
                picture.image.save(f'back_design_{request.id}.png', back_image, save=True)
            except Exception as e:
                print(f"Error saving back image: {e}")
        # Fallback to base64 data if file not provided
        elif back_image_data:
            try:
                back_image_file = base64_to_image(back_image_data, f'back_{request.id}')
                if back_image_file:
                    request.back_image.save(f'back_design_{request.id}.png', back_image_file, save=True)
                    
                    # Create a Picture instance for backward compatibility
                    from .models import Picture
                    picture = Picture()
                    picture.request = request
                    
                    # Create a fresh copy of the file for the Picture model
                    if hasattr(back_image_file, 'seek') and callable(back_image_file.seek):
                        back_image_file.seek(0)
                        
                    picture.image.save(f'back_design_{request.id}.png', back_image_file, save=True)
                    request.backImage = None  # Remove base64 data to save space
            except Exception as e:
                print(f"Error processing base64 back image: {e}")
        
        # Save the request with all updates
        request.save()
        return request

class StatisticsSerializer(serializers.Serializer):
    total_requests = serializers.IntegerField()
    unseen_requests = serializers.IntegerField()
    seen_requests = serializers.IntegerField()  # Added seen_requests field
    pending_requests = serializers.IntegerField()
    in_progress_requests = serializers.IntegerField()
    finished_requests = serializers.IntegerField()
    delivered_requests = serializers.IntegerField()
    conversion_rate = serializers.FloatField()
    total_revenue = serializers.IntegerField()
    repetitions_count = serializers.IntegerField()
    top_article = serializers.CharField()
    top_color = serializers.CharField()

class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = '__all__'
        read_only_fields = ('timestamp', 'read')
