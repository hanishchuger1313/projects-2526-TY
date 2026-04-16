from django.contrib import admin
# ScannerConfig ko import list mein add kiya hai
from .models import Product, UserProfile, Order, OrderItem, Wishlist, Review, Coupon, Banner, ScannerConfig, Wallet, WalletTransaction

# 0. Scanner Configuration (Admin se Scanner change karne ke liye)
@admin.register(ScannerConfig)
class ScannerConfigAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_active')
    list_editable = ('is_active',)

# 1. Banner Model Registration
@admin.register(Banner)
class BannerAdmin(admin.ModelAdmin):
    list_display = ('title', 'is_active', 'created_at')
    list_filter = ('is_active',)
    search_fields = ('title',)

# 2. Coupon Model registration
@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ('code', 'discount_percent', 'min_order_amount', 'is_active', 'valid_until')
    list_filter = ('is_active',)
    search_fields = ('code',)

# 3. Wallet & Transactions (Taaki Admin balance dekh sake)
admin.site.register(Wallet)
admin.site.register(WalletTransaction)

# 4. Existing models (Baki sab standard registration)
admin.site.register(Product)
admin.site.register(UserProfile)
admin.site.register(Order)
admin.site.register(OrderItem)
admin.site.register(Wishlist)
admin.site.register(Review)