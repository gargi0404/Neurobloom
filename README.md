# NeuroBloom

A web-based mental health support platform with role-based login, interactive cognitive games, adaptive AI, and dashboards for users and therapists.

## Tech Stack
- **Frontend:** React.js (Vite, TypeScript), Firebase Auth
- **Backend:** Node.js, Express.js, TypeScript, MongoDB Atlas (Mongoose)
- **ML:** TensorFlow.js (adaptive difficulty)
- **Deployment:** Vercel (frontend), Render (backend)

## Folder Structure
```
/NeuroBloom
  /client         # React frontend
  /server         # Node.js backend
  /ml             # TensorFlow.js adaptive model
  README.md
  .gitignore
  package.json
```

## Setup

### Prerequisites
- Node.js >= 18
- Yarn or npm
- MongoDB Atlas account
- Firebase project (for Auth)

### Install
```sh
# From project root
cd client && yarn install
cd ../server && yarn install
```

### Run
- **Frontend:**
  ```sh
  cd client && yarn dev
  ```
- **Backend:**
  ```sh
  cd server && yarn dev
  ```

### Deployment
- Frontend: Vercel
- Backend: Render

---

## Features
- Role-based login (user, therapist)
- Interactive cognitive games
- User dashboard (progress, charts)
- Therapist dashboard (patient insights)
- AI/ML adaptive difficulty

---

## Contributing
PRs welcome! Please lint and test before submitting. 