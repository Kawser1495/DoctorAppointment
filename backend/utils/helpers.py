import random


def generate_booking_number():

    number = random.randint(100000,999999)

    return f"APT-{number}"