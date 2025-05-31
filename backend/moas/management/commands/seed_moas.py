from django.core.management.base import BaseCommand # type: ignore
from moas.models import MOA, MOE

class Command(BaseCommand):
    help = 'Seed la base de données avec des MOA et MOE de test'

    def handle(self, *args, **kwargs):
        
        MOA.objects.create(name="Alter cité", address="48 C boulevard Foch\n49100 Angers", logo=None)
        MOA.objects.create(name="Angers Loire Habitat", address="4 rue de la Rame\n49100 Angers", logo=None)

        MOE.objects.create(name="Pragma Ingénierie", address="4 rue de la Rame\n49100 Angers", logo=None)
        MOE.objects.create(name="IRH ingénieurs conseil Angers", address="8 Rue Olivier de Serres\nCS 37289\n49072 Beaucouzé", logo=None)

        self.stdout.write(self.style.SUCCESS('MOA et MOE de test créés !'))