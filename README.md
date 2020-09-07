# Ionic Demo1，显示npm上的包下载量

![](https://user-images.githubusercontent.com/6951527/92368634-917c8a00-f12a-11ea-869b-dfc9ea3af87b.gif)

## Feature Overview

*   App framework: [React](https://reactjs.org/)
*   UI components: [Ionic Framework](https://ionicframework.com/docs/components)
    *   Camera button: [Floating Action Button (FAB)](https://ionicframework.com/docs/api/fab)
    *   Photo Gallery display: [Grid](https://ionicframework.com/docs/api/grid)
    *   Delete Photo dialog: [Action Sheet](https://ionicframework.com/docs/api/action-sheet)
*   Native runtime: [Capacitor](https://capacitor.ionicframework.com)
    *   Taking photos: [Camera API](https://capacitor.ionicframework.com/docs/apis/camera)
    *   Writing photo to the filesystem: [Filesystem API](https://capacitor.ionicframework.com/docs/apis/filesystem)
    *   Storing photo gallery metadata: [Storage API](https://capacitor.ionicframework.com/docs/apis/storage)

## Project Structure

*   Tab2 (Photos) (`src/pages/Tab2.tsx`): Photo Gallery UI and basic logic.
*   usePhotoGallery Hook (`src/hooks/usePhotoGallery.ts`): Logic encapsulating Capacitor APIs, including Camera, Filesystem, and Storage.

## How to Run

> Note: It's highly recommended to follow along with the [tutorial guide](https://ionicframework.com/docs/react/your-first-app), which goes into more depth, but this is the fastest way to run the app.

0) Install Ionic if needed: `npm install -g @ionic/cli`.

1) Clone this repository.  
2) In a terminal, change directory into the repo: `cd photo-gallery-capacitor-react`.  
3) Install all packages: `npm install`.  
4) Run on the web: `ionic serve`.  
5) Run on iOS or Android: See [here](https://ionicframework.com/docs/building/running).
