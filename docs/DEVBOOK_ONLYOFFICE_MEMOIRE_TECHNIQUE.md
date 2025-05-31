# Devbook : Intégration de l'édition collaborative OnlyOffice pour les Mémoires Techniques

## Objectif
Permettre la rédaction collaborative d'un mémoire technique Word pour chaque projet, avec gestion des statuts (rédaction, relecture, correction, validation), insertion depuis la bibliothèque, et sauvegarde via OnlyOffice.

---

## 1. Quand créer le document Word ?

**Choix recommandé :**
- **À la première ouverture de l'éditeur (clic sur "Rédiger")**
  - Avantages :
    - Pas de fichiers inutiles pour les projets sans mémoire technique rédigé.
    - Permet de différer la création jusqu'à ce qu'un utilisateur en ait vraiment besoin.
  - Inconvénient :
    - L'ouverture de l'éditeur peut être légèrement plus lente la première fois (création du fichier).

**Alternative :**
- À la création du projet (crée un fichier Word vierge d'office pour chaque projet).
  - Avantage :
    - Simplicité de gestion.
  - Inconvénient :
    - Génère des fichiers inutiles pour les projets qui n'auront jamais de mémoire technique.

**Conclusion :**
> On privilégie la création du document Word **lors du premier clic sur "Rédiger"**.

---

## 2. Étapes de développement

### A. Backend (Django)

1. **Endpoint pour obtenir l'URL du document Word**
   - Si le document existe déjà, retourner son URL.
   - Sinon, créer un fichier Word vierge (ex : avec python-docx), l'associer au projet/document, puis retourner son URL.
   - Exemple d'endpoint :
     ```http
     GET /api/projects/<project_id>/documents/<document_id>/word_url/
     ```

2. **Stockage des fichiers**
   - Les fichiers Word sont stockés dans `media/memoires/`.
   - L'URL retournée doit être accessible par OnlyOffice (via le serveur Docker).

3. **Callback de sauvegarde**
   - OnlyOffice enverra le document modifié au backend via un webhook ou un endpoint REST.
   - Le backend remplace le fichier Word existant.

4. **Gestion des statuts**
   - Les statuts sont déjà gérés dans le backend (rédaction, relecture, correction, validation) Vérifier ce qui est déja implémenté !.
   - Ajouter un endpoint pour changer le statut du document et du projet.

---

### B. Frontend (React)

1. **Récupération de l'URL du document**
   - Lors de l'ouverture de `MemoireTechniquePage.tsx`, appeler l'API pour obtenir l'URL du document Word à éditer.
   - Passer cette URL à `OnlyOfficeEditor`.

2. **Affichage de l'éditeur OnlyOffice**
   - Adapter `OnlyOfficeEditor` pour charger dynamiquement le document via l'URL reçue.
   - Gérer la configuration OnlyOffice (permissions, callbacks, etc.).

3. **Insertion depuis la bibliothèque**
   - Utiliser l'API JS OnlyOffice pour insérer des éléments de la bibliothèque dans le document.

4. **Sauvegarde**
   - L'utilisateur peut sauvegarder manuellement ou automatiquement.
   - OnlyOffice envoie le document modifié au backend.
   - Afficher la date/heure de la dernière sauvegarde dans l'UI.

5. **Gestion des statuts**
   - Afficher le statut courant du document.
   - Proposer les actions de changement de statut selon le rôle de l'utilisateur.
   Ex : Le rédacteur change le statut en "Document rédigé" , cela envoi une notif par mail au correcteur pour qu'il relise, ect...
   - Appeler l'API backend pour changer le statut.

---

## 3. Points d'attention

- **Sécurité** :
  - Vérifier que seuls les utilisateurs autorisés peuvent éditer ou changer le statut.
  - Protéger les endpoints backend (permissions Django).
- **Compatibilité OnlyOffice** :
  - L'URL du document doit être accessible par le conteneur Docker OnlyOffice (attention aux chemins et droits).
- **Gestion des erreurs** :
  - Gérer les cas où le document n'est pas accessible ou la sauvegarde échoue.

---

## 4. Roadmap technique (résumé)

1. [ ] Backend : Endpoint pour obtenir/créer l'URL du document Word
2. [ ] Backend : Endpoint de sauvegarde (callback OnlyOffice)
3. [ ] Backend : Endpoint de changement de statut (si besoin)
4. [ ] Frontend : Appel API pour obtenir l'URL du document
5. [ ] Frontend : Passage dynamique de l'URL à OnlyOfficeEditor
6. [ ] Frontend : Insertion depuis la bibliothèque via l'API JS OnlyOffice
7. [ ] Frontend : Affichage et gestion des statuts
8. [ ] Tests et validation

---

## 5. Journal d'avancement

### [Backend] Endpoint d'obtention/création du document Word vierge

- **Fichier modifié :** `backend/documents/views.py`
- **Action ajoutée :**
  - `@action(detail=True, methods=['get'], url_path='word_url')`
  - Permet d'obtenir l'URL du fichier Word associé à un document.
  - Si le fichier n'existe pas, il est créé à la volée (vierge) avec python-docx, stocké dans `media/memoires/`, puis associé au document.
- **Dépendance :** `python-docx` (installée)
- **Points d'attention :**
  - Le chemin `media/memoires/` doit être accessible en écriture par le serveur.
  - L'URL retournée doit être accessible par OnlyOffice (vérifier la configuration du serveur Docker si besoin).
  - Si python-docx n'est pas installé, une erreur explicite est retournée.
- **Exemple d'appel :**
  ```http
  GET /api/documents/<document_id>/word_url/
  ```
- **Prochaine étape :**
  - Tester l'endpoint depuis le frontend et passer dynamiquement l'URL à OnlyOfficeEditor.
  - Mettre à jour la gestion des statuts et la sauvegarde après édition.

### [Frontend] Chargement dynamique de l'URL du document Word

- **Fichier modifié :** `frontend/src/components/documents/MemoireTechniqueEditor.tsx`
- **Fonctionnalité :**
  - Appel à l'API `/api/documents/<documentId>/word_url/` lors du chargement du composant.
  - Stockage de l'URL retournée dans un state React.
  - Passage de cette URL à la prop `documentUrl` de `OnlyOfficeEditor`.
  - Affichage d'un loader pendant le chargement et d'un message d'erreur en cas d'échec.
- **Points d'attention :**
  - L'URL doit être accessible par OnlyOffice (vérifier le mapping réseau Docker si besoin).
  - Prévoir la gestion des erreurs réseau ou backend.
- **Prochaine étape :**
  - Adapter OnlyOfficeEditor pour utiliser l'URL réelle et préparer l'intégration avancée (API JS OnlyOffice, callbacks de sauvegarde, etc.).

**Ce devbook doit être mis à jour à chaque étape importante du développement.**

---

## Activer le HTTPS en local pour Django (certificat auto-signé)

> Cette section explique comment générer un certificat auto-signé et lancer le serveur Django en HTTPS pour lever les blocages Chrome lors de l'intégration OnlyOffice.

### 1. Génération du certificat auto-signé

Dans le dossier `backend/`, exécutez la commande suivante :

```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout devserver.key -out devserver.crt -subj "/C=FR/ST=France/L=Paris/O=Dev/OU=Dev/CN=localhost"
```

Cela crée deux fichiers :
- `backend/devserver.crt` (certificat)
- `backend/devserver.key` (clé privée)

### 2. Lancer Django en HTTPS

Utilisez la commande suivante pour démarrer le serveur Django avec SSL :

```bash
cd backend
python manage.py runserver_plus 0.0.0.0:8443 --cert-file devserver.crt --key-file devserver.key
```

> **Remarque** : `runserver_plus` nécessite d'installer `django-extensions` :
> ```bash
> pip install django-extensions
> ```
> et d'ajouter `'django_extensions'` à `INSTALLED_APPS` dans `settings.py`.

### 3. Adapter l'URL du document pour OnlyOffice

Dans le backend, l'URL du document Word doit maintenant pointer vers `https://host.docker.internal:8443/media/...`

### 4. Accepter le certificat dans le navigateur

Lors de la première connexion, Chrome affichera un avertissement de sécurité. Cliquez sur "Avancé" puis "Continuer vers localhost (dangereux)" pour accepter le certificat auto-signé.

---

**En cas de problème, voir la section "Dépannage HTTPS" plus bas.** 