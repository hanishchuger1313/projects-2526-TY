from django.db import models
from django.contrib.auth.models import User

# ==========================================
# 0. BANNER MODEL (For Dynamic Banners)
# ==========================================
class Banner(models.Model):
    title = models.CharField(max_length=100, help_text="Banner ka naam (e.g. Diwali Offer)")
    image = models.ImageField(upload_to='banners/', help_text="Upload banner from your computer")
    link_url = models.CharField(max_length=255, default="#", help_text="Click karne pe kahan jayega?")
    is_active = models.BooleanField(default=True, help_text="Check to show on website")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

# ==========================================
# 0.1 NEW: SCANNER CONFIG MODEL (For Admin Upload)
# ==========================================
class ScannerConfig(models.Model):
    name = models.CharField(max_length=100, default="KiranaHub Scanner")
    scanner_image = models.ImageField(upload_to='scanner/', help_text="Admin se scanner upload karein")
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

# 1. Product Model
class Product(models.Model):
    CATEGORY_CHOICES = [
        ('Dairy & Eggs', 'Dairy & Eggs'),
        ('Staples & Grains', 'Staples & Grains'),
        ('Snacks & Packaged Foods', 'Snacks & Packaged Foods'),
        ('Beverages', 'Beverages'),
        ('Household Essentials', 'Household Essentials'),
        ('Personal Care', 'Personal Care'),
    ]

    name = models.CharField(max_length=100)
    price = models.IntegerField()
    image_name = models.CharField(max_length=255) 
    cat = models.CharField(
        max_length=50, 
        choices=CATEGORY_CHOICES, 
        default='Staples & Grains'
    )
    rating = models.FloatField(default=5.0)
    desc = models.TextField(default="Premium quality product from KiranaHub.")
    stock = models.PositiveIntegerField(default=50) 
    unit = models.CharField(max_length=20, default="1 kg")

    def __str__(self):
        return self.name

# 2. User Profile Model
class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone = models.CharField(max_length=15, blank=True)
    address_line = models.TextField(blank=True)
    city = models.CharField(max_length=100, default="Nagpur")
    pincode = models.CharField(max_length=10, blank=True)
    gender = models.CharField(max_length=10, choices=[('Male', 'Male'), ('Female', 'Female')], blank=True)

    def __str__(self):
        return self.user.username

# 3. Coupon Model
class Coupon(models.Model):
    code = models.CharField(max_length=50, unique=True)
    discount_percent = models.IntegerField(default=10)
    min_order_amount = models.IntegerField(default=100)
    is_active = models.BooleanField(default=True)
    valid_until = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.code

# 4. Order Model
class Order(models.Model):
    ORDER_STATUS = [
        ('Order Placed', 'Order Placed'),
        ('Packed', 'Packed'),
        ('Shipped', 'Shipped'),
        ('Delivered', 'Delivered'),
        ('Cancelled', 'Cancelled'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    coupon_used = models.CharField(max_length=50, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=ORDER_STATUS, default="Order Placed")
    rider_name = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"Order {self.id} by {self.user.username}"

# 5. Order Items Model
class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2) 

    def __str__(self):
        return f"{self.quantity} x {self.product.name}"

# 6. Wishlist Model
class Wishlist(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    added_on = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'product')

    def __str__(self):
        return f"{self.user.username} - {self.product.name}"

# 7. Review Model
class Review(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    rating = models.IntegerField(default=5)
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username}'s review on {self.product.name}"

# 8. Wallet System (For KiranaHub Credits)
class Wallet(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='wallet')
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s Wallet - ₹{self.balance}"

class WalletTransaction(models.Model):
    TRANSACTION_TYPES = [
        ('Credit', 'Added Money'),
        ('Debit', 'Order Payment'),
        ('Refund', 'Refunded'),
    ]

    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name='transactions')
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    order_id = models.CharField(max_length=100, blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.transaction_type} of ₹{self.amount} - {self.wallet.user.username}"