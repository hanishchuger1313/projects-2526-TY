import json
import datetime
import random
from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse, HttpResponse
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.utils import timezone
from django.db import transaction
from .models import Product, UserProfile, Order, OrderItem, Wishlist, Review, Coupon, Banner, Wallet, WalletTransaction

# 1. Home Page
def index(request):
    products = Product.objects.all()
    banners = Banner.objects.filter(is_active=True).order_by('-created_at')
    
    user_wishlist = []
    wallet_balance = 0
    if request.user.is_authenticated:
        user_wishlist = Wishlist.objects.filter(user=request.user).values_list('product_id', flat=True)
        wallet, _ = Wallet.objects.get_or_create(user=request.user)
        wallet_balance = wallet.balance
    
    return render(request, 'index.html', {
        'products': products,
        'user_wishlist': list(user_wishlist),
        'banners': banners,
        'wallet_balance': wallet_balance
    })

# 2. AJAX Toggle for Wishlist
@login_required(login_url='login')
def toggle_wishlist(request, p_id):
    product = get_object_or_404(Product, id=p_id)
    wish_item, created = Wishlist.objects.get_or_create(user=request.user, product=product)
    if not created:
        wish_item.delete()
        return JsonResponse({'status': 'removed'})
    return JsonResponse({'status': 'added'})

# 3. Wishlist Page
@login_required(login_url='login')
def wishlist_view(request):
    wishlist_items = Wishlist.objects.filter(user=request.user).order_by('-added_on')
    return render(request, 'wishlist.html', {'wishlist': wishlist_items})

# 4. Cart View (UPDATED with Smart Suggestions)
def cart_view(request):
    wallet_balance = 0
    if request.user.is_authenticated:
        wallet, _ = Wallet.objects.get_or_create(user=request.user)
        wallet_balance = wallet.balance
    
    all_products = list(Product.objects.all())
    if len(all_products) >= 4:
        suggestions = random.sample(all_products, 4)
    else:
        suggestions = all_products

    return render(request, 'cart.html', {
        'wallet_balance': wallet_balance,
        'suggestions': suggestions
    })

# 5. Place Order & Wallet Payment Logic
@login_required(login_url='login')
def place_order(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            cart_items = data.get('cart', [])
            total_amount = float(data.get('total_amount', 0))
            discount_amount = data.get('discount_amount', 0)
            coupon_code = data.get('coupon_code', None)
            payment_method = data.get('payment_method', 'cod')

            if not cart_items:
                return JsonResponse({'status': 'error', 'message': 'Cart is empty'}, status=400)

            user_wallet, _ = Wallet.objects.get_or_create(user=request.user)
            if payment_method == 'wallet':
                if user_wallet.balance < total_amount:
                    return JsonResponse({'status': 'error', 'message': 'Insufficient Wallet Balance!'}, status=400)

            with transaction.atomic():
                order = Order.objects.create(
                    user=request.user,
                    total_amount=total_amount,
                    discount_amount=discount_amount,
                    coupon_used=coupon_code,
                    status="Order Placed",
                    rider_name="Assigning Rider..." 
                )

                if payment_method == 'wallet':
                    user_wallet.balance -= total_amount
                    user_wallet.save()
                    WalletTransaction.objects.create(
                        wallet=user_wallet,
                        transaction_type='Debit',
                        amount=total_amount,
                        order_id=str(order.id)
                    )

                for item in cart_items:
                    product = Product.objects.get(id=item['id'])
                    qty = int(item['quantity'])
                    if product.stock >= qty:
                        product.stock -= qty
                        product.save()
                    
                    OrderItem.objects.create(
                        order=order, 
                        product=product,
                        quantity=qty, 
                        price=item['price']
                    )

            return JsonResponse({'status': 'success', 'order_id': order.id})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    return JsonResponse({'status': 'error', 'message': 'Invalid request'}, status=400)

# 6. Wallet View & Add Money
@login_required(login_url='login')
def wallet_view(request):
    wallet, _ = Wallet.objects.get_or_create(user=request.user)
    transactions = WalletTransaction.objects.filter(wallet=wallet).order_by('-timestamp')
    
    if request.method == "POST":
        amount_str = request.POST.get('amount', '0')
        amount = float(amount_str) if amount_str else 0
        if amount > 0:
            wallet.balance += amount
            wallet.save()
            WalletTransaction.objects.create(
                wallet=wallet,
                transaction_type='Credit',
                amount=amount
            )
            messages.success(request, f"₹{amount} added to KiranaHub Wallet!")
            return redirect('wallet')

    return render(request, 'wallet.html', {
        'wallet': wallet,
        'transactions': transactions
    })

# 7. Apply Coupon Logic
def apply_coupon(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            code = data.get('code', '').strip()
            cart_total = float(data.get('cart_total', 0))
            coupon = Coupon.objects.filter(code__iexact=code, is_active=True).first()
            
            if not coupon:
                return JsonResponse({'status': 'error', 'message': 'Invalid Coupon'}, status=404)
            if coupon.valid_until and coupon.valid_until < timezone.now():
                return JsonResponse({'status': 'error', 'message': 'Coupon expired'}, status=400)
            if cart_total < coupon.min_order_amount:
                return JsonResponse({'status': 'error', 'message': f'Min ₹{coupon.min_order_amount} required'}, status=400)
            
            return JsonResponse({
                'status': 'success',
                'discount_percent': coupon.discount_percent,
                'message': 'Coupon Applied!'
            })
        except:
            return JsonResponse({'status': 'error', 'message': 'Server Error'}, status=500)
    return JsonResponse({'status': 'error', 'message': 'Invalid Method'}, status=405)

# 8. Orders History
@login_required(login_url='login')
def orders_view(request):
    orders = Order.objects.filter(user=request.user).order_by('-created_at')
    return render(request, 'orders.html', {'orders': orders})

# 9. Billing Receipt
@login_required(login_url='login')
def generate_bill(request, order_id):
    order = get_object_or_404(Order, id=order_id, user=request.user)
    items = OrderItem.objects.filter(order=order)
    subtotal = sum(item.price * item.quantity for item in items)
    return render(request, 'receipt.html', {
        'order': order, 
        'items': items, 
        'subtotal': subtotal,
        'date': datetime.datetime.now()
    })

# 10. Profile Update
@login_required(login_url='login')
def profile_view(request):
    profile, created = UserProfile.objects.get_or_create(user=request.user)
    if request.method == "POST":
        request.user.first_name = request.POST.get('first_name')
        request.user.save()
        profile.phone = request.POST.get('phone')
        profile.address_line = request.POST.get('address')
        profile.city = request.POST.get('city')
        profile.save()
        messages.success(request, "Profile Updated!")
        return redirect('profile')
    return render(request, 'profile.html', {'profile': profile})

# 11. Auth Views (FIXED FOR EMAIL)
def login_view(request):
    if request.method == "POST":
        # HTML se 'username' field mein email aa raha hai
        email_val = request.POST.get('username') 
        ps = request.POST.get('password')
        
        # Django authenticates against the 'username' field
        user = authenticate(username=email_val, password=ps)
        
        if user:
            login(request, user)
            return redirect('index')
        messages.error(request, "Invalid Details")
    return render(request, 'login.html')

def register_view(request):
    if request.method == "POST":
        name = request.POST.get('name')
        # Fix: Using 'email' instead of 'number' to match HTML
        email_val = request.POST.get('email') 
        pw = request.POST.get('password')
        
        if not email_val:
            messages.error(request, "Email is required!")
            return render(request, 'login.html')

        if not User.objects.filter(username=email_val).exists():
            # Use email as the username to avoid "username must be set" error
            user = User.objects.create_user(username=email_val, email=email_val, password=pw, first_name=name)
            UserProfile.objects.create(user=user)
            Wallet.objects.create(user=user)
            messages.success(request, "Registered!")
            return redirect('login')
        else:
            messages.error(request, "User already exists.")
    return render(request, 'login.html')

def logout_view(request):
    logout(request)
    return redirect('login')

# 12. Theme & Product Details
def toggle_theme(request):
    theme = request.session.get('kh_theme', 'light')
    request.session['kh_theme'] = 'dark' if theme == 'light' else 'light'
    return redirect(request.META.get('HTTP_REFERER', 'index'))

def product_detail(request, p_id):
    product = get_object_or_404(Product, id=p_id)
    reviews = Review.objects.filter(product=product).order_by('-created_at')
    return render(request, 'product_detail.html', {
        'product': product,
        'reviews': reviews
    })

@login_required(login_url='login')
def add_review(request, p_id):
    if request.method == "POST":
        product = get_object_or_404(Product, id=p_id)
        Review.objects.create(
            product=product,
            user=request.user,
            rating=request.POST.get('rating'),
            comment=request.POST.get('comment')
        )
        messages.success(request, "Thank you for your feedback!")
        return redirect('product_detail', p_id=p_id)
    return redirect('index')

# 13. Support & About
def support_view(request):
    return render(request, 'support.html')

def about_view(request):
    return render(request, 'about.html')