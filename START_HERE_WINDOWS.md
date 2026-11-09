# Wallora on Windows — start here

If you saw warnings like `could not open directory 'AppData/...' Permission denied`, Git was started in your Windows user folder (`C:/Users/Paul`) instead of the Wallora project folder.

Do **not** push that repository to GitHub.

## 1. Stop the accidental Git command

In the terminal window, press:

```text
Ctrl + C
```

If it already finished, do not run `git commit` or `git push` from `C:/Users/Paul`.

## 2. Move the accidental Git metadata out of the way

This does **not** delete your personal files. It only renames the hidden Git folder that was created by mistake.

In Git Bash:

```bash
cd ~
pwd
```

You should see something like:

```text
/c/Users/Paul
```

Then run:

```bash
mv .git git-home-mistake-backup
```

If it says `.git` does not exist, that is fine. If it says the file is in use, close the terminal, open a new Git Bash window, and try again.

Later, after your real Wallora repository is safely on GitHub, you can delete the backup folder from `C:/Users/Paul` because it may contain staged copies of personal files.

## 3. Download the real project

Open the Wallora preview in your browser and go to:

```text
/login
```

Click **Download project ZIP**.

Save it to your Downloads folder.

## 4. Extract it into its own folder

In File Explorer:

1. Right-click `wallora-source.zip`.
2. Choose **Extract All…**.
3. Extract into `Documents`.

You should end up with a folder like:

```text
C:/Users/Paul/Documents/wallora
```

Inside that folder you must see files such as:

```text
package.json
netlify.toml
src
catalog
drizzle
```

If you do not see `package.json`, you are in the wrong folder.

You should also see `src`, `public`, `catalog`, `drizzle`, and `netlify.toml`. If those are missing, download the full project ZIP again. GitHub must receive the full project, not only root files.

## 5. Open Git Bash inside the project folder

In File Explorer, open:

```text
Documents/wallora
```

Right-click an empty area inside the folder and choose:

```text
Open Git Bash here
```

Then verify:

```bash
pwd
ls package.json netlify.toml
```

The path should end in `/Documents/wallora`, not just `/c/Users/Paul`.

## 6. Initialize Git only inside the project

Now run:

```bash
git init
git add .
git status --short
```

Check the list. You should see project files such as `src/`, `catalog/`, `package.json`, and `netlify.toml`.

You should **not** see:

```text
.env
AppData/
Documents/My Music/
Cookies/
```

If you see those, stop. You are in the wrong folder.

## 7. Commit and push to GitHub

Use the empty GitHub repository you already created. If you have not created one yet, make an empty private repository and do not add a README, license, or `.gitignore` there.

Copy the repository URL from GitHub. It will look similar to:

```text
https://github.com/YOUR-USERNAME/YOUR-REPO.git
```

Then run, replacing the URL with your real one:

```bash
git commit -m "Initial Wallora marketplace"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git push -u origin main
```

If Git says `remote origin already exists`, update it instead:

```bash
git remote set-url origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git push -u origin main
```

If Git asks for your name and email:

```bash
git config --global user.name "Paul"
git config --global user.email "artbending@gmail.com"
```

Then repeat the commit command.

## 8. Continue deployment

After the push succeeds, follow `DEPLOYMENT.md`:

1. Create a Neon database.
2. Run the Drizzle migrations.
3. Import the GitHub repository into Netlify.
4. Add `DATABASE_URL` and `ADMIN_EMAILS` in Netlify.
5. Deploy.
