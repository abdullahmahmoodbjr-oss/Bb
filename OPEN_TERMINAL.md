# How to open a terminal in this project

A terminal is the black/white command window where you type commands like `npm install` and `npm run dev`.

## If you are using Windows

### Option A: From File Explorer

1. Open the folder that contains this project.
2. Click the address bar at the top of File Explorer.
3. Type:

```text
cmd
```

4. Press **Enter**.
5. A terminal opens already inside this project folder.

### Option B: Right-click the project folder

1. Open the folder that contains this project.
2. Right-click inside the folder on empty space.
3. Click **Open in Terminal**.
4. If you see PowerShell, that is okay.

## If you are using macOS

1. Open **Finder**.
2. Open the folder that contains this project.
3. Right-click the folder.
4. Click **Services**.
5. Click **New Terminal at Folder**.

If you do not see that option:

1. Open the **Terminal** app.
2. Type `cd ` with a space after it.
3. Drag the project folder into the Terminal window.
4. Press **Enter**.

## If you are using Linux

1. Open the file manager.
2. Open the folder that contains this project.
3. Right-click inside the folder.
4. Click **Open in Terminal**.

## If you are using VS Code

1. Open VS Code.
2. Click **File** → **Open Folder**.
3. Select this project folder.
4. Click **Terminal** → **New Terminal**.

The terminal at the bottom of VS Code is now inside the project.

## How to check you are in the right folder

Run:

```bash
pwd
```

You should see the project path. In this environment, the project path is:

```text
/workspace/Bb
```

Then run:

```bash
npm run mcp:url
```

If the command starts, you are in the right project.

## The commands you need after opening terminal

Use three terminals.

### Terminal 1: start the MCP server

```bash
npm install
npm run install:browsers
npm run dev
```

Leave this terminal open.

### Terminal 2: create the public HTTPS URL

```bash
ngrok http 3000
```

Leave this terminal open too.

### Terminal 3: print the ChatGPT URL

```bash
npm run mcp:url
```

Copy the URL that ends with `/mcp` and paste it into ChatGPT.
