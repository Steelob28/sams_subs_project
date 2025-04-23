from rest_framework import serializers
from .models import SnowflakeData

class SnowflakeDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = SnowflakeData
        fields = '__all__' 