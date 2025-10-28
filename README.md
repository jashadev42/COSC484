# COSC484
Dating app - Spark

#### Members:
Abdul, Jasha, Mamadou, Moriah, Nate

#### Project Idea:
Dating app, exactly like hinge. Instead of its being an asynchronous experience “swiping right”
or liking their pictures, it’s a live chat between you and the profile you’re viewing. So, you can
only interact with people who are actively online using the app.

This is intended to increase continuity in conversations and give each other undivided attention
while they are chatting. The advantages are that you get immediate gratification and don’t have
to wonder whether or not there's a missed opportunity.

Either party can “swipe left” and reject at anytime or they can like and it shows up as a “{Name}
liked you!” in the chat. Liking someone would save/bookmark the chat so you can go back to it.
You can also have your contact info saved so you can quick send during a live chat.

#### Potential Tech Stack:
- React (with TypeScript)
- SQL database technology (need to choose)
- socket.io (handles web sockets)
- Authentification (sign in with google)? JWT (handles username/password)?
- Python backend server (connecting users to each other, handles api route endpoints,
posting/updating/deleting pictures and information from your profile)


# Development Environment
## API Backend
### Linux/MacOS
```bash
cd api
python -m venv .venv
pip install -r requirements.txt
source .venv/bin/activate 
```

### Windows
```powershell
cd api
python -m venv .venv
pip install -r requirements.txt
.venv/Scripts/activate 
```

### Set Environment Variables in /api
Use database information in the following format:
```bash
user={}
password={}
host={}
port={} 
dbname={}
```

### Running the API
```bash
fastapi dev main.py
```


## Svelte Frontend
### Install Dependencies
```bash
cd spark-app
npm install
```

### Start Development Server
```bash
npm run dev
```

### Connect via Browser URL
```
http://localhost:5173
```