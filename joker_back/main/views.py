from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import authenticate, login
from django.utils import timezone
from django.db.models import Count, Sum
from .serializers import UserSerializer, RequestSerializer, StatisticsSerializer, ContactSerializer
from .models import User, Request, Contact
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny


class UserInfoView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        return Response({
            'id': user.id,
            'email': user.email,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser
        })
class UserList(generics.ListCreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def perform_create(self, serializer):
        user = serializer.save()
        user = authenticate(
            email=self.request.data.get("email"),
            password=self.request.data.get("password"),
        )
        if user and user.is_active:
            login(self.request, user)


class RequestViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing article requests.
    Provides standard CRUD operations plus custom actions.
    """
    queryset = Request.objects.all().order_by('-creation_date')
    serializer_class = RequestSerializer
    
    def get_permissions(self):
        """
        Allow anyone to submit a request, but require authentication for admin operations.
        """
        if self.action == 'create':
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def list(self, request, *args, **kwargs):
        """Override list method to add pagination"""
        page_size = int(request.query_params.get('page_size', 20))
        page = int(request.query_params.get('page', 1))
        
        start = (page - 1) * page_size
        end = page * page_size
        
        queryset = self.filter_queryset(self.get_queryset())
        total_count = queryset.count()
        queryset = queryset[start:end]
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'results': serializer.data,
            'count': total_count,
            'page': page,
            'total_pages': (total_count + page_size - 1) // page_size
        })
    
    @action(detail=False, methods=['get'])
    def unseen(self, request):
        """Get all unseen requests"""
        unseen_requests = Request.objects.filter(state="unseen")
        serializer = self.get_serializer(unseen_requests, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def pending(self, request):
        """Get all pending requests"""
        pending_requests = Request.objects.filter(state="pending")
        serializer = self.get_serializer(pending_requests, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def progress(self, request):
        """Get all in-progress requests"""
        in_progress = Request.objects.filter(state="progress")
        serializer = self.get_serializer(in_progress, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def finished(self, request):
        """Get all finished requests"""
        finished = Request.objects.filter(state="finished")
        serializer = self.get_serializer(finished, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def mark_seen(self, request, pk=None):
        """Mark a request as seen without changing its state"""
        request_obj = self.get_object()
        # Update both is_seen flag AND state to "seen"
        request_obj.is_seen = True
        request_obj.state = "seen"
        request_obj.save()
        return Response({'status': 'request marked as seen', 'is_seen': True, 'state': 'seen'})
    
    @action(detail=True, methods=['post'])
    def mark_delivered(self, request, pk=None):
        """Mark a request as delivered"""
        request_obj = self.get_object()
        request_obj.is_delivered = True
        request_obj.save()
        return Response({'status': 'request marked as delivered'})
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Update the status of a request"""
        request_obj = self.get_object()
        new_status = request.data.get('status')
        
        if new_status not in ["unseen", "seen", "pending", "progress", "finished"]:
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
            
        request_obj.state = new_status
        request_obj.save()
        return Response({'status': f'request status updated to {new_status}'})


class StatisticsView(viewsets.ViewSet):
    """
    ViewSet for retrieving statistics about requests.
    """
    serializer_class = StatisticsSerializer
    
    @action(detail=False, methods=['get'])
    def calculate(self, request):
        """Calculate statistics for requests"""
        try:
            start_date = request.query_params.get("start_date")
            end_date = request.query_params.get("end_date")

            if not start_date or not end_date:
                today = timezone.now().date()
                start_date = end_date = today

            # Make sure we're using proper date filtering
            requests = Request.objects.filter(
                creation_date__date__range=[start_date, end_date]
            )

            # Calculate statistics with proper error handling
            total_requests = requests.count()
            unseen_requests = requests.filter(state="unseen").count()
            seen_requests = requests.filter(state="seen").count()  # Added seen counter
            pending_requests = requests.filter(state="pending").count()
            in_progress_requests = requests.filter(state="progress").count()
            finished_requests = requests.filter(state="finished").count()
            delivered_requests = requests.filter(is_delivered=True).count()

            conversion_rate = (
                (finished_requests + delivered_requests) / total_requests * 100
                if total_requests > 0
                else 0
            )

            total_revenue = (
                requests.filter(state__in=["finished", "delivered"]).aggregate(Sum("price"))["price__sum"]
                or 0
            )

            repetitions_count = (
                requests.aggregate(Sum("repetitions"))["repetitions__sum"] or 0
            )

            # Handle potentially missing data
            try:
                top_article_obj = (
                    requests.values("article")
                    .annotate(count=Count("article"))
                    .order_by("-count")
                    .first()
                )
                top_article = top_article_obj["article"] if top_article_obj else ""
            except:
                top_article = ""

            try:
                top_color_obj = (
                    requests.values("color")
                    .annotate(count=Count("color"))
                    .order_by("-count")
                    .first()
                )
                top_color = top_color_obj["color"] if top_color_obj else ""
            except:
                top_color = ""

            data = {
                "total_requests": total_requests,
                "unseen_requests": unseen_requests,
                "seen_requests": seen_requests,  # Added seen counter to response
                "pending_requests": pending_requests,
                "in_progress_requests": in_progress_requests,
                "finished_requests": finished_requests,
                "delivered_requests": delivered_requests,
                "conversion_rate": conversion_rate,
                "total_revenue": total_revenue,
                "repetitions_count": repetitions_count,
                "top_article": top_article,
                "top_color": top_color,
            }
            serializer = StatisticsSerializer(data)
            return Response(serializer.data)
        except Exception as e:
            # Better error handling
            print(f"Error calculating statistics: {str(e)}")
            return Response(
                {"error": "Failed to calculate statistics"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ContactViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing contact form submissions.
    Provides standard CRUD operations plus custom actions.
    """
    queryset = Contact.objects.all().order_by('-timestamp')
    serializer_class = ContactSerializer
    
    def list(self, request, *args, **kwargs):
        """Override list method to add pagination"""
        page_size = int(request.query_params.get('page_size', 20))
        page = int(request.query_params.get('page', 1))
        
        start = (page - 1) * page_size
        end = page * page_size
        
        queryset = self.filter_queryset(self.get_queryset())
        total_count = queryset.count()
        queryset = queryset[start:end]
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'results': serializer.data,
            'count': total_count,
            'page': page,
            'total_pages': (total_count + page_size - 1) // page_size
        })
    
    def get_permissions(self):
        """
        Allow anyone to submit a contact form, but require authentication for viewing messages.
        """
        if self.action == 'create':
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """Mark a contact message as read"""
        contact = self.get_object()
        contact.read = True
        contact.save()
        return Response({'status': 'message marked as read'})
    
    @action(detail=False, methods=['get'])
    def unread(self, request):
        """Get all unread contact messages"""
        unread_messages = Contact.objects.filter(read=False).order_by('-timestamp')
        serializer = self.get_serializer(unread_messages, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """Get count of unread contact messages"""
        unread_count = Contact.objects.filter(read=False).count()
        return Response({'unread_count': unread_count})