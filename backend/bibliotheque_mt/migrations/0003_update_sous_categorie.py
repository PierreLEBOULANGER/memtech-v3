from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('bibliotheque_mt', '0002_bibliothequeimage_sous_categorie_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='bibliothequeimage',
            name='sous_categorie',
            field=models.CharField(blank=True, choices=[('chantier', 'Photos de chantier'), ('equipement', 'Équipements'), ('installation', 'Installations'), ('documentation', 'Documentation')], max_length=50, null=True, verbose_name='Sous-catégorie'),
        ),
    ] 