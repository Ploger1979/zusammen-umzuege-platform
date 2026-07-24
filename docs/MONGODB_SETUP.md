# 🛠️ MongoDB Atlas Einrichtung (Schritt für Schritt)

Damit dein User-Login und die Datenbank auf Netlify funktionieren, brauchst du eine Cloud-Datenbank. Hier ist die Anleitung, wie du das kostenlos und professionell einrichtest.

---

### 1. Account erstellen
1. Gehe auf [mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register).
2. Erstelle einen kostenlosen Account (oder logge dich mit Google ein).

### 2. Kostenlose Datenbank erstellen (Cluster)
1. Wähle **"Free"** (Shared) Plan.
2. Wähle einen Provider (z.B. **AWS**) und eine Region in der Nähe (z.B. **Frankfurt** `eu-central-1`).
3. Klicke unten auf **"Create Cluster"**.

### 3. Benutzer und Passwort festlegen (Wichtig!)
1. Du wirst gefragt, einen Datenbank-User anzulegen ("Security Quickstart").
2. **Username:** z.B. `admin`
3. **Password:** Wähle ein sicheres Passwort und **merke es dir gut**! (Du brauchst es gleich für den Link).
4. Klicke auf **"Create Database User"**.

### 4. Netzwerkzugriff erlauben (Wichtig für Netlify)
1. Im Bereich "Network Access" (IP Address Access List):
2. Wähle **"Allow Access from Anywhere"** (oder trage `0.0.0.0/0` ein).
   * *Das ist notwendig, damit Netlify auf die Datenbank zugreifen kann.*
3. Klicke auf **"Add IP Address"**.

### 5. Verbindungslink holen (Connection String)
1. Gehe zurück zum Dashboard ("Database" links im Menü).
2. Klicke beim Cluster auf den Button **"Connect"**.
3. Wähle **"Drivers"** (Node.js, Go, Python, etc.).
4. Du siehst nun einen Link, der so aussieht:
   ```text
   mongodb+srv://admin:<db_password>@cluster0.p8xyz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   ```
5. **Kopiere diesen Link.**

### 6. Link in Netlify eintragen
1. Öffne dein [Netlify Dashboard](https://app.netlify.com/).
2. Gehe zu deinem Projekt **"Zusammen Umzüge"**.
3. Klicke auf **"Site configuration"** -> **"Environment variables"**.
4. Klicke auf **"Add a variable"**.
5. **Key:** `MONGODB_URI`
6. **Value:** Füge den Link von Schritt 5 ein.
   * ⚠️ **WICHTIG:** Ersetze `<db_password>` im Link durch dein echtes Passwort (ohne die Klammern `< >`).
7. Klicke auf **"Save"**.

---

### ✅ Fertig!
Jetzt starte einen neuen **Deploy** auf Netlify (oder warte kurz), und das Login/Registrieren wird funktionieren!

**(Optional) Verbindung mit MongoDB Compass:**
Du kannst denselben Link auch in dein Programm **MongoDB Compass** auf dem PC einfügen, um die Daten live zu sehen.
