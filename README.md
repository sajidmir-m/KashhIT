# Kassh.IT E‑Commerce

## Project info

Kassh.IT storefront built with Vite, React, TypeScript, Tailwind, shadcn/ui, and Supabase.

## How can I edit this code?

There are several ways of editing your application.

Local development

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## Tech Stack

- Vite + React + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (Auth, Database, Storage, Edge Functions)

## Environment Variables

### Client-side (Vite)
Create a `.env` file in the root directory with:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Supabase Edge Functions
For Razorpay integration, configure these environment variables in your Supabase project:

1. Go to your Supabase Dashboard
2. Navigate to **Project Settings** → **Edge Functions** → **Secrets**
3. Add the following secrets:
   - `RAZORPAY_KEY_ID` - Your Razorpay Key ID
   - `RAZORPAY_KEY_SECRET` - Your Razorpay Key Secret

**Note**: These secrets are automatically available to Edge Functions via `Deno.env.get()`.

## Deploy

### Automatic Deployment with GitHub Actions

This repository includes a GitHub Actions workflow that automatically deploys to Vercel on every push to the `main` branch.

**Setup Instructions:**

1. **Get your Vercel Token:**
   - Go to [Vercel Account Settings](https://vercel.com/account/tokens)
   - Click "Create Token"
   - Give it a name (e.g., "GitHub Actions")
   - **Important:** If you're using a team, make sure the token has team access
   - Copy the token (you won't be able to see it again!)

2. **Add the Token to GitHub Secrets:**
   - Go to your GitHub repository
   - Click on **Settings** → **Secrets and variables** → **Actions**
   - Click **New repository secret**
   - Name: `VERCEL_TOKEN`
   - Value: Paste your Vercel token
   - Click **Add secret**

3. **Link your Vercel Project (if not already linked):**
   - Install Vercel CLI: `npm i -g vercel`
   - Run `vercel link` in your project directory
   - Follow the prompts to link your project

4. **Add Collaborators to Vercel Project (IMPORTANT for team deployments):**
   - Go to your [Vercel Dashboard](https://vercel.com/dashboard)
   - Select your project: `kash-it-ecom`
   - Click on **Settings** → **Collaborators**
   - Click **Add Member** or **Invite**
   - Enter your collaborator's email (e.g., `mirsajidd7@gmail.com`)
   - Select their role (usually **Developer** or **Member**)
   - Click **Send Invitation**
   - Your collaborator will receive an email invitation to join the project
   - **Note:** They must accept the invitation and have a Vercel account

5. **Push to main branch:**
   - The workflow will automatically deploy on every push to `main`
   - All collaborators with access can now trigger deployments

**Troubleshooting Deployment Errors:**

**Error: "Git author must have access to the team"**
- Solution: Add the collaborator to the Vercel project (see step 4 above)
- Make sure the collaborator has accepted the Vercel invitation
- Ensure the `VERCEL_TOKEN` has team-level access (not just personal)

**Error: "No existing credentials found"**
- Solution: Make sure `VERCEL_TOKEN` is set in GitHub Secrets
- Verify the token is valid and hasn't expired

**Error: "Project not found"**
- Solution: Run `vercel link` to link the project
- Or manually specify project ID in workflow if needed

### Manual Deployment

Host on Vercel/Netlify or any static host. Configure environment variables for Supabase and Razorpay in your hosting platform's dashboard.

## Collaborating & Merging Updates

### For Collaborators: How to Push Changes to Main Branch

**First Time Setup (if friend doesn't have the repository):**
```sh
# 1. Clone the repository
git clone https://github.com/AlphaDoc1/kash-it-ecom.git

# 2. Navigate to the project directory
cd kash-it-ecom

# 3. Install dependencies
npm install
```

**Pushing Changes to Main Branch:**
```sh
# 1. Make sure you're on the main branch and it's up to date
git checkout main
git pull origin main

# 2. Make your changes to files (edit, add, delete files)

# 3. Check what files have changed
git status

# 4. Stage your changes (add files to commit)
git add .
# Or add specific files: git add <file-name>

# 5. Commit your changes with a descriptive message
git commit -m "Description of your changes"

# 6. Push to main branch
git push origin main
```

**If you get an error about being behind:**
```sh
# Pull the latest changes first, then push
git pull origin main
git push origin main
```

**Complete Workflow Example:**
```sh
# Step 1: Update your local repository
git checkout main
git pull origin main

# Step 2: Make your changes (edit files in your editor)

# Step 3: Stage, commit, and push
git add .
git commit -m "Add new feature: [describe what you added]"
git push origin main
```

### How to Merge Collaborator's Updates

If a collaborator has pushed changes to the repository, follow these steps to merge their updates:

**Option 1: Merge from main branch (if they pushed directly to main)**
```sh
# Pull the latest changes from remote
git pull origin main
```

**Option 2: Merge from a feature branch (if they created a pull request)**
```sh
# Fetch all branches
git fetch --all

# Check available branches
git branch -r

# Pull and merge the specific branch
git pull origin <branch-name>

# Or merge a specific branch into main
git checkout main
git pull origin main
git merge origin/<branch-name>
```

**Option 3: Handle merge conflicts (if any)**
```sh
# If conflicts occur, Git will mark them in the files
# 1. Open the conflicted files and resolve conflicts manually
# 2. Stage the resolved files
git add <resolved-files>

# 3. Complete the merge
git commit -m "Merge updates from collaborator"
```

**Quick Check:**
```sh
# Check if you're up to date
git fetch origin
git status

# See what's different
git log HEAD..origin/main --oneline
```
