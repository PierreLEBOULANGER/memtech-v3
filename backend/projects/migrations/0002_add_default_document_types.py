from django.db import migrations

def add_default_document_types(apps, schema_editor):
    DocumentType = apps.get_model('projects', 'DocumentType')
    
    document_types = [
        {
            'type': 'MEMO_TECHNIQUE',
            'description': 'Mémoire technique détaillant la méthodologie et les moyens mis en œuvre',
            'is_mandatory': False
        },
        {
            'type': 'SOGED',
            'description': 'Schéma d\'Organisation de Gestion et d\'Élimination des Déchets',
            'is_mandatory': False
        },
        {
            'type': 'SOPAQ',
            'description': 'Schéma d\'Organisation du Plan d\'Assurance Qualité',
            'is_mandatory': False
        },
        {
            'type': 'SOPRE',
            'description': 'Schéma d\'Organisation du Plan de Respect de l\'Environnement',
            'is_mandatory': False
        },
        {
            'type': 'PPSPS',
            'description': 'Plan Particulier de Sécurité et de Protection de la Santé',
            'is_mandatory': False
        },
        {
            'type': 'PAQ',
            'description': 'Plan d\'Assurance Qualité',
            'is_mandatory': False
        }
    ]
    
    for doc_type in document_types:
        DocumentType.objects.get_or_create(**doc_type)

def remove_default_document_types(apps, schema_editor):
    DocumentType = apps.get_model('projects', 'DocumentType')
    DocumentType.objects.all().delete()

class Migration(migrations.Migration):
    dependencies = [
        ('projects', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(add_default_document_types, remove_default_document_types),
    ] 