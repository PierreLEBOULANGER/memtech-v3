# Generated by Django 5.0.3 on 2025-04-19 21:14

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='MOA',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255, verbose_name='Nom')),
                ('address', models.TextField(verbose_name='Adresse')),
                ('logo', models.BinaryField(blank=True, null=True, verbose_name='Logo')),
            ],
            options={
                'verbose_name': "Maître d'ouvrage",
                'verbose_name_plural': "Maîtres d'ouvrage",
                'db_table': 'moa',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='MOE',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255, verbose_name='Nom')),
                ('address', models.TextField(verbose_name='Adresse')),
                ('logo', models.BinaryField(blank=True, null=True, verbose_name='Logo')),
            ],
            options={
                'verbose_name': "Maître d'œuvre",
                'verbose_name_plural': "Maîtres d'œuvre",
                'db_table': 'moe',
                'managed': False,
            },
        ),
    ]
