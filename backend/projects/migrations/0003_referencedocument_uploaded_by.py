# Generated by Django 5.0.3 on 2025-04-19 21:46

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0002_add_default_document_types'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='referencedocument',
            name='uploaded_by',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='uploaded_reference_documents', to=settings.AUTH_USER_MODEL, verbose_name='Uploadé par'),
        ),
    ]
