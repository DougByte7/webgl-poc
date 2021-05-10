# About

This project is a proof of concept that a I create as I learn WebGL.
It was bootstrapped with [Create React App](https://github.com/facebook/create-react-app) and TypeScript.

It should be just a spinning triangle, but when I got that I thought "what if I add some light texture and transform handles?" so, this project has the following

## Features

- [x] Error Boundary
- [x] WebGL2 Context renderer
- [x] Weird textured spinning cube
- [x] [Blinn-Phong shading](https://en.wikipedia.org/wiki/Blinn%E2%80%93Phong_reflection_model)
- [x] Play/Pause "animation"
- [x] Transform handles

## Components
The `App` component holds the `WebGLCanvasComponent` and `TransformActionsMenuComponent`.

The `WebGLCanvasComponent` is responsible for setting up the render pipeline and perform the transformations, I create some wrappers for the "gl.create" functions to keep the code clean and error handling, actually just a some throw statements that are caught by the `ErrorBoundaryComponent`.

The `ErrorBoundaryComponent` renders the error message and componentStack, also contains a `Button` to refresh the page.

The `TransformActionsMenuComponent` is responsible for the UI transform handles `RangeInput` and the two actions `Button`, it will display a message explaining how to use the Rotation handles.

The `RangeInput` is a styled `input:range` with a label

The `Button` is a styled button with two types `default` and `error`.

With 'styled' I mean exactly it, pure scss. I didn't use any css in js tool because I think this project is too small to be worth it.
## To start the project

You can just see it running on the [GitHub Pages](https://dougbyte7.github.io/webgl-poc/)
or
In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

## Future work
* Other illumination types
* Wavefront .obj reader
* Shadow
* FXAA