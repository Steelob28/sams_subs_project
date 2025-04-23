from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SnowflakeDataViewSet

router = DefaultRouter()
router.register(r'data', SnowflakeDataViewSet)

urlpatterns = [
    path('', include(router.urls)),
] 