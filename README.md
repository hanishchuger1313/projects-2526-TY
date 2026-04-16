GROUP NO 4
KiranaHub: Localized Quick Commerce Platform 🙏
KiranaHub is a digital platform designed to provide a seamless grocery shopping experience by connecting local "Kirana" shops with customers. The main aim of the project is to provide a fast, reliable, and user-friendly interface for ordering daily essentials like packaged staples, dairy, and snacks with a focus on localized delivery.

The platform allows users to browse products through a professional Bento-style UI, add items to their cart, and place orders securely using OTP-based authentication. On the other side, the admin can manage the entire inventory, update product prices, monitor order activities, and control system operations through a robust dashboard. The system includes features like user registration, wallet management, dynamic category filtering, and cash-on-delivery (COD) support.

Overall, KiranaHub acts as a secure bridge between local vendors and consumers, ensuring privacy, speed, and easy access to daily necessities.

Features
User Registration & Login System – Secure authentication for customers.

Multi-Factor Authentication (OTP) – Enhanced security using Fast2SMS API.

Bento-Style UI/UX – A clean and modern storefront for better navigation.

Dynamic Inventory Management – Admin can add/edit packaged kirana products.

Admin Dashboard – Full control over users, orders, and coupons.

Activity Logs & Monitoring – Tracking system changes and user actions.

Tech Stack
Frontend: HTML5, CSS3, Bootstrap 5, JavaScript

Backend: Python / Django Framework

Database: SQLite (db.sqlite3)

Team Members
Baisane Narendra
Bhavsar Satyam
Chaudari Siddhesh
Deore Durgesh


Software Installation Instructions
Objective: To install and run the KiranaHub application successfully on a system.

Requirements:

Computer / Laptop

Internet Connection (For initial setup)

Python 3.10+ installed

Code Editor (VS Code recommended)

Project Folder (grocery_shop)

Procedure / Steps:

Copy the project folder from the DVD to your local drive (e.g., Desktop).

Open VS Code and select "Open Folder" to load the project.

Open the Terminal in VS Code (Ctrl + `).

Install requirements by running:
pip install django pillow django-cleanup

Apply Migrations to set up the database:
python manage.py migrate

Create Admin Account (Optional):
python manage.py createsuperuser

Run the Server:
python manage.py runserver

Open your browser and go to: http://127.0.0.1:8000/

Register or login to use the system.

Expected Output
The KiranaHub application will run successfully in the browser. Users will be able to browse kirana products, add them to the cart, and place orders, while the admin manages the store via the dashboard.

Conclusion
The KiranaHub project has been successfully installed and executed. The system ensures an efficient grocery delivery model using modern web technologies and secure authentication.

Precautions
Ensure Python is added to your system PATH.

Always run migrations if you change the models.py file.

Do not delete the db.sqlite3 file, as it contains all project data.

Check for errors in the terminal if the server fails to start.

Ensure the media folder is present for product images to load.
