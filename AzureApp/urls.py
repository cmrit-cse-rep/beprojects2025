from django.urls import path
from . import views
from django.contrib.auth import views as auth_views

urlpatterns = [
    path('', views.index, name='home'),
    path('about/', views.about_view, name='about'),
    path('contact/', views.contact_view, name='contact'),
    path('service/', views.service_view, name='service'),
    path('signup/', views.register, name='signup'),
    path('signin/', auth_views.LoginView.as_view(template_name='signin.html'), name='login'),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    path('userlog/', views.userlog_view, name='userlog'),
    path('yoga_try/', views.yoga_try_view, name='yoga_try'),
    path('video_feed/', views.video_feed, name='video_feed'),
    path('video_feed_stream/', views.video_feed_stream, name='video_feed_stream'),
]