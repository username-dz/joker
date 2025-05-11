# generate_fixtures.py
import random
from datetime import datetime, timedelta
from faker import Faker
from django.core.management.base import BaseCommand
from main.models import Request  # Adjust the import according to your app name

fake = Faker()


class Command(BaseCommand):
    help = "Generate random request fixtures"

    def handle(self, *args, **kwargs):
        start_date = datetime.strptime("2023-08-01", "%Y-%m-%d")
        end_date = datetime.strptime("2024-08-01", "%Y-%m-%d")

        for _ in range(20):
            # Random date between start_date and end_date
            creation_date = start_date + timedelta(
                days=random.randint(0, (end_date - start_date).days)
            )

            Request.objects.create(
                article=random.choice(["t_shirt", "sweet_shirt", "mug", "key_ring"]),
                description=fake.text(max_nb_chars=200),
                phone=fake.phone_number(),
                text=fake.text(max_nb_chars=100),
                color=random.choice(["white", "black", "red", "blue", "green"]),
                size=random.choice(["S", "M", "L", "XL", "XXL"]),
                creation_date=creation_date,
                is_seen=random.choice([True, False]),
                state=random.choice(["unseen", "pending", "progress", "finished"]),
                is_delivered=random.choice([True, False]),
                submitted_date=fake.date_time_this_year(
                    before_now=True, after_now=False
                ),
                first_url=fake.url(),
                last_url=fake.url(),
                referrer=fake.text(max_nb_chars=100),
                repetitions=random.randint(0, 100),
                uuid=fake.uuid4(),
                price=random.randint(10, 1000),
            )
        self.stdout.write(
            self.style.SUCCESS("Successfully generated 20 request fixtures")
        )
