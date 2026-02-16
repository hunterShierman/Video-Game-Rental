# GitHub Workflow Guide 🚀

## Quick Overview

GitHub helps teams work together on code without overwriting each other's work. Here's how we'll use it:
```
main branch (protected)
    ↓
Your feature branch (you work here)
    ↓
Pull Request (ask to merge your code)
    ↓
Code Review (team checks your work)
    ↓
Merge to main (your code is added!)
```

---

## First Time Setup

### 1. Install Git

**Check if you have Git:**
```bash
git --version
```

**If not installed:**
- **Windows:** Download from [git-scm.com](https://git-scm.com)
- **Mac:** Run `git --version` in Terminal (it will prompt to install)
- **Linux:** `sudo apt install git`

---

### 2. Configure Git
```bash
# Set your name (shows in commits)
git config --global user.name "Your Name"

# Set your email (use your GitHub email)
git config --global user.email "your.email@example.com"

# Check it worked
git config --list
```

---

### 3. Clone the Repository

**First time only:**
```bash
# Get the repository URL from GitHub
# Click the green "Code" button → Copy HTTPS URL

# Clone to your computer
git clone https://github.com/your-team/video-game-rental.git

# Go into the folder
cd video-game-rental

# Go into client folder
cd client

# Install dependencies
npm install
```

✅ **You're set up!**

---

## Daily Workflow

### 📥 Step 1: Get Latest Code (Every Day Before You Start)
```bash
# Make sure you're on main branch
git checkout main

# Download latest changes
git pull origin main
```

**Why?** Your teammates may have added code. You want the latest version!

---

### 🌿 Step 2: Create Your Feature Branch
```bash
# Create and switch to a new branch
git checkout -b feature/your-feature-name

# Example:
git checkout -b feature/browse-games-page
```

**Branch naming:**
- `feature/` - for new features
- `fix/` - for bug fixes
- Example: `feature/game-details-page`
- Example: `fix/login-button-bug`

✅ **Now you're on your own branch! You can code safely.**

---

### 💻 Step 3: Write Code

Work on your feature normally:
- Edit files
- Test your code
- Make sure everything works

---

### 💾 Step 4: Save Your Changes (Commit)
```bash
# See what files you changed
git status

# Add all changed files
git add .

# Save with a message
git commit -m "Add browse games page with filtering"
```

**Good commit messages:**
✅ `"Add browse games page with genre filter"`
✅ `"Fix login button not redirecting"`
✅ `"Update game card styling for mobile"`

**Bad commit messages:**
❌ `"stuff"`
❌ `"changes"`
❌ `"fixed it"`

---

### 📤 Step 5: Upload to GitHub (Push)
```bash
# First time pushing this branch
git push -u origin feature/your-feature-name

# After that, just:
git push
```

✅ **Your code is now on GitHub!**

---

### 🔃 Step 6: Create Pull Request (PR)

**On GitHub website:**

1. Go to your repository on GitHub
2. You'll see a yellow banner: **"feature/your-feature-name had recent pushes"**
3. Click **"Compare & pull request"**
4. Fill out the form:
```markdown
Title: Add browse games page

Description:
- Added BrowseGamesPage component
- Added genre and platform filters
- Added search functionality
- Responsive grid layout

How to test:
1. Go to http://localhost:5173/browse
2. Try filtering by genre
3. Try searching for "Elden"
```

5. Click **"Create pull request"**

✅ **Done! Now wait for review.**

---

### 👀 Step 7: Code Review

**Hunter (Scrum Master) will:**
- Look at your code
- Test it
- Leave comments if changes needed
- Approve when ready

**If changes requested:**
```bash
# Make the changes in your editor
# Then commit again
git add .
git commit -m "Fix: update button styling per review"
git push

# The PR automatically updates!
```

---

### ✅ Step 8: Merge to Main

**After approval:**
1. Hunter will **"Merge the pull request"**
2. Click **"Confirm merge"**
3. Click **"Delete branch"** (cleans up)

✅ **Your code is now in main!**

---

### 🔄 Step 9: Start Next Feature
```bash
# Go back to main
git checkout main

# Get your merged code
git pull origin main

# Delete your local feature branch (optional)
git branch -d feature/browse-games-page

# Start a new feature
git checkout -b feature/my-next-feature
```

**Repeat Steps 1-9 for each new feature!**

---

## Quick Reference
```bash
# Get latest code
git checkout main
git pull origin main

# Create new branch
git checkout -b feature/feature-name

# Save changes
git add .
git commit -m "Clear message"

# Upload to GitHub
git push

# Switch branches
git checkout branch-name

# See current branch
git branch

# See what changed
git status
```

---

## Common Scenarios

### ❓ "I made changes but I'm on the wrong branch"

**If you haven't committed yet:**
```bash
# Save your changes temporarily
git stash

# Switch to correct branch
git checkout -b feature/correct-branch

# Get your changes back
git stash pop
```

**If you already committed:**
```bash
# Create new branch from current position
git checkout -b feature/correct-branch

# Done! Your commits are on the new branch
```

---

### ❓ "I need to update my branch with latest main"
```bash
# Save your work first
git add .
git commit -m "WIP: working on feature"

# Get latest main
git checkout main
git pull origin main

# Go back to your branch
git checkout feature/your-feature

# Merge main into your branch
git merge main

# If conflicts, fix them in your editor
# Then:
git add .
git commit -m "Merge main into feature branch"
git push
```

---

### ❓ "I want to see my teammate's branch"
```bash
# Get all branches from GitHub
git fetch origin

# Switch to their branch
git checkout feature/their-branch-name

# Go back to yours
git checkout feature/your-branch-name
```

---

### ❓ "I messed up and want to start over"

**If you haven't pushed:**
```bash
# Throw away all changes
git reset --hard origin/main
```

**If you already pushed:**
```bash
# Ask Hunter for help! Don't force push.
```

---

### ❓ "Git says 'merge conflict'"

**Don't panic!** This means you and a teammate edited the same file.
```bash
# Open the conflicted file in your editor
# Look for these markers:

<<<<<<< HEAD
Your code
=======
Their code
>>>>>>> main

# Delete the markers and keep the correct code
# Save the file

# Tell Git you fixed it
git add .
git commit -m "Resolve merge conflict"
git push
```

---

## Visual Guide

### Branch Visualization
```
main branch:
  A --- B --- C --- F (latest)
         \         /
          D --- E
        (your feature branch)
```

- **A, B, C** = Commits on main
- **D, E** = Your commits on your branch
- **F** = Merge (your code added to main)

---

### Full Workflow Diagram
```
1. Clone repo (one time)
   ↓
2. git checkout main
   git pull origin main
   ↓
3. git checkout -b feature/name
   ↓
4. [Write code, test it]
   ↓
5. git add .
   git commit -m "message"
   ↓
6. git push
   ↓
7. Create PR on GitHub
   ↓
8. Code review
   ↓
9. Merge to main
   ↓
10. Repeat from step 2
```

---

## Important Rules

### ✅ DO:
- Pull from main before starting new work
- Create a new branch for each feature
- Write clear commit messages
- Test your code before pushing
- Create PR when feature is complete
- Respond to code review feedback

### ❌ DON'T:
- **Never** push directly to main
- **Never** commit `.env` file
- Don't commit broken code
- Don't create giant PRs (keep features small)
- Don't ignore merge conflicts

---

## GitHub Desktop (Visual Alternative)

If command line is scary, try **GitHub Desktop**:

1. Download: [desktop.github.com](https://desktop.github.com)
2. Clone repository (File → Clone Repository)
3. Create branch (Branch → New Branch)
4. Make changes in your editor
5. Write commit message in GitHub Desktop
6. Click "Commit to feature/branch-name"
7. Click "Push origin"
8. Click "Create Pull Request"

**Same workflow, but with buttons!**

---

## Getting Help

**Before asking:**
1. Read the error message carefully
2. Google the error
3. Check this guide

**When stuck:**
Post in Discord/Slack:
```
I'm trying to [what you're doing]
I ran: [command you ran]
I got this error: [paste error]
```


---

## Practice Exercise

Try this to practice the workflow:
```bash
# 1. Get latest code
git checkout main
git pull origin main

# 2. Create test branch
git checkout -b test/my-first-branch

# 3. Make a small change
# Edit README.md, add your name to team section

# 4. Commit
git add .
git commit -m "Add my name to README"

# 5. Push
git push -u origin test/my-first-branch

# 6. Create PR on GitHub
# (follow Step 6 above)

# 7. After it's merged, clean up
git checkout main
git pull origin main
git branch -d test/my-first-branch
```

✅ **You did it!**

---

## Cheat Sheet (Print This!)
```bash
# Daily workflow
git checkout main          # Switch to main
git pull origin main       # Get latest
git checkout -b feature/X  # Create branch
# [code here]
git add .                  # Stage changes
git commit -m "message"    # Save changes
git push                   # Upload to GitHub
# [create PR on GitHub]

# Useful commands
git status                 # What changed?
git branch                 # Which branch am I on?
git log                    # See commit history
git diff                   # See exact changes

# Help!
git checkout main          # Get back to safety
git stash                  # Save changes temporarily
git reset --hard          # Undo everything (careful!)
```

---

**Questions?** Ask Hunter or post in Discord/instagram!
