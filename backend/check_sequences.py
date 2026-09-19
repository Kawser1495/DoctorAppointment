import os
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

import django
django.setup()

from django.db import connection
from django.apps import apps


print("--- PostgreSQL sequence integrity check ---")

cursor = connection.cursor()

models = [
    model
    for model in apps.get_models()
    if (
        model._meta.managed
        and getattr(model._meta.pk, "auto_created", False)
        and model._meta.pk.column == "id"
    )
]

problems = 0

for model in models:

    table = model._meta.db_table

    cursor.execute(
        'SELECT MAX("id") FROM "{}"'.format(table)
    )

    max_id = cursor.fetchone()[0]

    cursor.execute(
        "SELECT pg_get_serial_sequence(%s, %s)",
        [table, "id"],
    )

    sequence_name = cursor.fetchone()[0]

    if sequence_name is None:
        print(
            model._meta.label,
            "| table=", table,
            "| max_id=", max_id,
            "| sequence=NONE",
            "| status=NO SEQUENCE",
        )
        continue

    cursor.execute(
        "SELECT last_value FROM {}".format(
            sequence_name
        )
    )

    sequence_value = cursor.fetchone()[0]

    if max_id is None:
        status = "OK (empty table)"
    elif sequence_value >= max_id:
        status = "OK"
    else:
        status = "CHECK"
        problems += 1

    print(
        model._meta.label,
        "| max_id=", max_id,
        "| sequence=", sequence_value,
        "| status=", status,
    )


print()
print("Potential sequence problems:", problems)