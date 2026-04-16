import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.models import Product

# The 20 Initial Kirana Products
products_to_add = [
    # Grains & Staples
    {'name': 'Basmati Rice (1kg)', 'price': 95, 'image_name': 'basmati_rice.jpg', 'rating': 5},
    {'name': 'Fortune Atta (5kg)', 'price': 210, 'image_name': 'atta.jpg', 'rating': 5},
    {'name': 'Maida (1kg)', 'price': 45, 'image_name': 'maida.jpg', 'rating': 4},
    {'name': 'Poha (500g)', 'price': 38, 'image_name': 'poha.jpg', 'rating': 4},
    {'name': 'Oats (500g)', 'price': 120, 'image_name': 'oats.jpg', 'rating': 5},
    # Pulses & Lentils
    {'name': 'Toor Dal (1kg)', 'price': 140, 'image_name': 'toor_dal.jpg', 'rating': 5},
    {'name': 'Moong Dal (1kg)', 'price': 110, 'image_name': 'moong_dal.jpg', 'rating': 4},
    {'name': 'Rajma (1kg)', 'price': 120, 'image_name': 'rajma.jpg', 'rating': 5},
    {'name': 'Kabuli Chana (1kg)', 'price': 130, 'image_name': 'chana.jpg', 'rating': 4},
    # Spices
    {'name': 'Tata Salt (1kg)', 'price': 28, 'image_name': 'salt.jpg', 'rating': 5},
    {'name': 'Sugar (1kg)', 'price': 44, 'image_name': 'sugar.jpg', 'rating': 5},
    {'name': 'Turmeric Powder', 'price': 30, 'image_name': 'turmeric.jpg', 'rating': 4},
    {'name': 'Red Chilli Powder', 'price': 45, 'image_name': 'chilli.jpg', 'rating': 4},
    # Snacks & Ice Cream
    {'name': 'Lays Chips', 'price': 20, 'image_name': 'chips.jpg', 'rating': 5},
    {'name': 'Kurkure Namkeen', 'price': 20, 'image_name': 'namkeen.jpg', 'rating': 5},
    {'name': 'Amul Chocolate Ice Cream', 'price': 180, 'image_name': 'icecream.jpg', 'rating': 5},
    {'name': 'Good Day Biscuits', 'price': 30, 'image_name': 'biscuits.jpg', 'rating': 4},
    {'name': 'Dairy Milk Silk', 'price': 80, 'image_name': 'chocolate.jpg', 'rating': 5},
    # Household
    {'name': 'Vim Bar', 'price': 10, 'image_name': 'vim.jpg', 'rating': 5},
    {'name': 'Surf Excel (1kg)', 'price': 115, 'image_name': 'surf.jpg', 'rating': 5},
]

for p in products_to_add:
    Product.objects.get_or_create(
        name=p['name'], 
        defaults={'price': p['price'], 'image_name': p['image_name'], 'rating': p['rating']}
    )

print("20 Core Products Added to KiranaHub Database!")