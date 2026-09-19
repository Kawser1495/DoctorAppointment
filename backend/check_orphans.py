import os

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

import django
django.setup()

from django.db import connection
from django.apps import apps


print("--- Foreign key orphan check ---")

cursor = connection.cursor()

total_orphans = 0
checked = 0

for model in apps.get_models():

    for field in model._meta.fields:

        if not field.many_to_one or not field.remote_field:
            continue

        source_table = model._meta.db_table
        source_column = field.column

        target_model = field.remote_field.model
        target_table = target_model._meta.db_table
        target_column = field.target_field.column

        query = f'''
            SELECT COUNT(*)
            FROM "{source_table}" AS source
            WHERE source."{source_column}" IS NOT NULL
              AND NOT EXISTS (
                  SELECT 1
                  FROM "{target_table}" AS target
                  WHERE target."{target_column}" = source."{source_column}"
              )
        '''

        try:
            cursor.execute(query)
            orphan_count = cursor.fetchone()[0]

            checked += 1

            print(
                f"{model._meta.label}.{field.name} "
                f"| orphan_rows={orphan_count}"
            )

            total_orphans += orphan_count

        except Exception as e:
            print(
                f"{model._meta.label}.{field.name} "
                f"| ERROR: {e}"
            )


print()
print("Foreign-key relationships checked:", checked)
print("Total orphan rows:", total_orphans)