from django.db import models

# Create your models here.

class SnowflakeData(models.Model):
    # This is a temporary model - we'll modify it based on your actual Snowflake data structure
    title = models.CharField(max_length=200)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Snowflake Data'

    def __str__(self):
        return self.title
