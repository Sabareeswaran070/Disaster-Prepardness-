from getpass import getpass

from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.user import User


def create_admin():

    db = SessionLocal()

    try:
        email = input("Admin email: ").strip()
        full_name = input("Admin name: ").strip()
        password = getpass("Admin password: ")

        existing_user = (
            db.query(User)
            .filter(User.email == email)
            .first()
        )

        if existing_user:
            print("User already exists.")

            existing_user.role = "ADMIN"
            existing_user.is_active = True

            db.commit()

            print("Existing user promoted to ADMIN.")
            print(f"ID: {existing_user.id}")
            print(f"Email: {existing_user.email}")
            print(f"Role: {existing_user.role}")

            return

        admin = User(
            full_name=full_name,
            email=email,
            password_hash=hash_password(password),
            role="ADMIN",
            institution_id=None,
            is_active=True,
        )

        db.add(admin)
        db.commit()
        db.refresh(admin)

        print()
        print("Admin created successfully.")
        print(f"ID: {admin.id}")
        print(f"Email: {admin.email}")
        print(f"Role: {admin.role}")

    finally:
        db.close()


if __name__ == "__main__":
    create_admin()