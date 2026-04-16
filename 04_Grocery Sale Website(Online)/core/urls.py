from django.contrib import admin
from django.urls import path
from api import views
from django.conf import settings # NAYA IMPORT (Delete mat karna)
from django.conf.urls.static import static # NAYA IMPORT (Delete mat karna)

urlpatterns = [
    # Admin Panel
    path('admin/', admin.site.urls),

    # Main Storefront
    path('', views.index, name='index'),
    path('product/<int:p_id>/', views.product_detail, name='product_detail'),

    # Review System
    path('product/<int:p_id>/add-review/', views.add_review, name='add_review'),

    # User Authentication
    path('login/', views.login_view, name='login'),
    path('register/', views.register_view, name='register'),
    path('logout/', views.logout_view, name='logout'),
    path('profile/', views.profile_view, name='profile'),

    # --- WALLET SYSTEM (NEW FEATURE) ---
    path('wallet/', views.wallet_view, name='wallet'),

    # Cart & Ordering
    path('cart/', views.cart_view, name='cart'),
    path('apply-coupon/', views.apply_coupon, name='apply_coupon'), 
    path('place-order/', views.place_order, name='place_order'),
    path('orders/', views.orders_view, name='orders'),
    path('generate-bill/<int:order_id>/', views.generate_bill, name='generate_bill'),

    # Wishlist Features
    path('wishlist/', views.wishlist_view, name='wishlist'),
    path('toggle-wishlist/<int:p_id>/', views.toggle_wishlist, name='toggle_wishlist'),

    # System Helpers
    path('toggle-theme/', views.toggle_theme, name='toggle_theme'),
    
    # Information Pages
    path('support/', views.support_view, name='support'),
    path('about/', views.about_view, name='about'),
]

# --- SABSE IMPORTANT LOGIC: IMAGES DIKHANE KE LIYE ---
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)