from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserList, RequestViewSet, StatisticsView, UserInfoView, ContactViewSet

# Create a router and register our viewset
router = DefaultRouter()
router.register(r'requests', RequestViewSet, basename='request')
router.register(r'contacts', ContactViewSet, basename='contact')

urlpatterns = [
    path('', include(router.urls)),  # This creates all CRUD endpoints for requests
    path('users/', UserList.as_view(), name='users'),
    path('statistics/calculate/', StatisticsView.as_view({'get': 'calculate'}), name='stats-calculate'),
    path('auth/user-info/', UserInfoView.as_view(), name='user-info'),
    path('auth/user/', UserInfoView.as_view(), name='user-info-alt'),
]