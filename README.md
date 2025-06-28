# 🛩️ Paper Plane Adventures – A Two Player Game Between Desktop and Mobile

A two-player game where one person plays on desktop and the other on mobile. Work together or compete by flying paper airplanes through hoops.

## Overview

This project was created as part of a two-week assignment for a third-year design studio course, where we explored networked multiplayer experiences using the [A-Frame](https://aframe.io/) framework.

I was inspired by the game [Lifeslide](https://store.steampowered.com/app/956140/Lifeslide/) and wanted to make a simple flying game based on paper airplanes.

There are two modes:

- **Collaborative Mode**
  - Players share one airplane.
  - Mobile player tilts phone to move up and down.
  - Desktop player clicks buttons to move left and right.
  - The goal is to pass through hoops together.

- **Competitive Mode**
  - Each player controls their own airplane.
  - Mobile movement is limited to the vertical (y) axis.
  - Desktop movement is limited to the horizontal (x) axis.
  - Ghost planes and hoops show the opponent’s position.
  - The goal is to score more points than the other player.

### Supported Devices

This experience supports desktop and mobile devices used at the same time.

### Technologies Used

- JavaScript  
- HTML  
- CSS  
- Node.js  
- VS Code  
- [A-Frame](https://aframe.io/)  
- [WebSockets](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API) (via [socket.io](https://socket.io/))

## 🧾 Desktop Setup Instructions

This project is not hosted online at the moment. To try it out locally:

1. Install [Git](https://git-scm.com/downloads)  
2. Install [Node.js](https://nodejs.org/en/download)  
3. Clone the repository and run the server:
   - `git clone https://github.com/your-username/paper-plane-duo.git`
   - `cd paper-plane-duo`
   - `npm install`
   - `node app.js`
4. Open `http://localhost:8080` in your desktop browser  
5. Open the same link on your phone (make sure both devices are on the same network)  
6. Choose a mode and follow the instructions on screen

## 🚧 What Was Challenging

The hardest part was figuring out how to separate and sync the plane’s movement between devices. On mobile, I moved the camera to simulate flight, while on desktop, I moved the airplane model itself. Since the movement worked differently, I decided to create separate components for each.

Another issue I ran into was frame rate differences. My phone and computer both run at 60fps, so syncing looked fine. But when I tested it with a classmate’s 120fps device, the airplane moved too fast. To fix this, I looked at A-Frame’s source code—specifically how they use the `tick()` function in the `wasd-controls` component—and realized I could scale movement using the built-in `deltaTime` value. After implementing that, movement synced properly across devices with different frame rates.

## ✅ What Went Well

I'm happy with how the ghost plane and ghost hoops turned out in competitive mode. They were extra features I wasn’t sure I’d have time to finish, but I managed to get them working and I think they help show the other player's position in a clear and non-intrusive way.

## 🎨 Assets and Attributions

### Inspiration

- [Lifeslide – Steam Game](https://store.steampowered.com/app/956140/Lifeslide/)

### 3D Models

- [Paper Airplane (Sketchfab)](https://sketchfab.com/3d-models/paper-airplane-29aa6a99e1d24b52a9d7d9eb2695bdb8)  
- [Paper Airplane (CGTrader)](https://www.cgtrader.com/items/644366/download-page)

### Icons

- [Desktop Icon](https://www.flaticon.com/free-icons/desktop)  
- [Phone Icon](https://www.flaticon.com/free-icons/phone)  
- [Wind Icon](https://www.flaticon.com/free-icons/wind)  
- [Select Icon](https://www.flaticon.com/free-icons/select)  
- [Paper Plane Icon](https://www.iconpacks.net/free-icon/paper-plane-2563.html#google_vignette)

### 🎧 Sound Effects

- [Mystical Background Music](https://pixabay.com/sound-effects/mystical-music-54294/)  
- [Notification Ding](https://pixabay.com/sound-effects/elevator-chimenotification-ding-recreation-287560/)  
- [Ambient Soundscape](https://pixabay.com/sound-effects/atmosphere-soundscape-302345/)

## 📚 Credits

This project was developed as part of a third-year design studio course in the [Interactive Multimedia and Design](https://bitdegree.ca/index.php?Program=IMD&Section=Home) program.
