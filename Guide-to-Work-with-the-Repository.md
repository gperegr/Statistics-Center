# How to Work with the Repository

Repository URL:
`https://github.boschdevcloud.com/PGE3CA/Statistics-Center.git`

This guide explains how to download the project, make changes safely, and send your work back using Visual Studio.

## Clone (Download) the Repository – First Time Only

**Tool used:** Visual Studio (no terminal needed)

1. Open Visual Studio

2. On the start screen, click `Clone a repository`

3. Paste this URL: `https://github.boschdevcloud.com/PGE3CA/Statistics-Center.git`

4. Choose a folder on your computer (any folder is fine)

5. Click `Clone`


**✅ The project files will appear in Visual Studio**

## Always Create a Branch Before Changing Anything

**Why:** This prevents breaking the main code.

**Tool used:** Visual Studio

1. In Visual Studio, open `Git `→ `Branches`

2. Click `New Branch`

3. Give it a name (example): `"feature-my-change"`

4. Make sure the new branch is checked out (active)

**✅ You are now working safely in your own branch**


## Make Changes to the Code

**Tool used:** Visual Studio

1. Edit files normally (HTML, JS, etc.)

2. Save your files

3. Nothing is shared yet — changes are only on your computer.


## Commit Your Changes (Save a Version)

**Tool used:** Visual Studio

1. Open `Git Changes`

2. You will see the modified files

3. Write a short message, for example: `"Update index.html layout"`

4. Click `Commit`

**✅ Your changes are now saved locally in your branch**


## Push (Send Your Changes to GitHub)

**Tool used:** Visual Studio

1. Still in `Git Changes`

2. Click `Push`

**✅ Your branch is now uploaded to the repository**


## Get Updates from Others (Pull)

**When to do this:**

* Before starting work

* If someone else updated the project

**Tool used:** Visual Studio

1. Open `Git Changes`

2. Click `Pull`

✅ Your local copy is updated with the latest changes


## Do I Need the Terminal?

**Short answer:** No, not for daily work.

**You only need the terminal if:**

* Someone explicitly asks you to run a Git command

* There is a problem Visual Studio cannot fix automatically

For normal work:

`Clone `→ `Branch `→ `Edit `→ `Commit `→ `Push `→ `Pull`

**👉 All done inside Visual Studio**

## Basic Rules (Very Important)

❌ Do NOT work directly on main

✅ Always create a branch

✅ Commit often with clear messages

✅ Pull before starting work

❌ Never delete branches you did not create