import datetime
import uuid
import base64
import os
from django.core.files.base import ContentFile


def uuid_to_date(uuid):
    timestamp = uuid.split("-")[0]
    if timestamp:
        date = datetime.datetime.fromtimestamp(int(timestamp) / 1000)
        return date


def generate_unique_filename(instance, filename):
    """Generate a unique filename for uploads to Cloudinary"""
    ext = filename.split('.')[-1]
    unique_name = f"{uuid.uuid4().hex}.{ext}"
    return unique_name


def base64_to_image(base64_string, filename_prefix):
    """Convert a base64 string to a Django ContentFile for upload to Cloudinary"""
    if not base64_string:
        return None
    
    # Remove header if present
    if "," in base64_string:
        format, base64_string = base64_string.split(";base64,")
    
    try:
        decoded_file = base64.b64decode(base64_string)
        file_ext = "png"  # Default extension
        
        # Generate unique filename
        filename = f"{filename_prefix}_{uuid.uuid4().hex}.{file_ext}"
        
        return ContentFile(decoded_file, name=filename)
    except Exception as e:
        print(f"Error converting base64 to image: {e}")
        return None
