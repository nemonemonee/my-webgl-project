# WebGL Project: Dynamic 3D Viewer with Lighting, Shading, and Distortion Effects

## User Guide

### Goals
- Build a Christmas Eve scene with various interesting and intriguing shapes.
- Build a camera that can freely navigate through the city.
- Provide a few different options for shading and lighting methods.

### Camera Navigation Instructions
- **W/S**: Moves the camera forward and backward at a fixed height.
- **A/D**: Moves the camera left and right at a fixed height.
- **Arrow Up/Down**: Aims the camera up and down without moving it.
- **Arrow Left/Right or Q/E**: Aims the camera left and right without moving it.
- **I/O**: Moves the camera forward and backward in the gaze direction.

### Button Interaction
- The name of each button explains its functionality.
- **Shading and Lighting Options**: Two selection menus where users can choose between Gouraud shading and Phong shading for shading options, and Phong lighting and Blinn-Phong lighting for lighting options.
- **Sphere Material**: A selection menu with 12 kinds of materials for users to choose from, which will only change the material of the sphere.
- **Rabbit Control**: Two buttons in this section: 
  - The first one is the switch for the distortion behavior.
  - The second one is the switch for the rotation.

### Light Controls
- There are two light sources: a lamp and a headlight.
  - **Lamp Light**: Users can change its location and its ambient, diffuse, and specular colors. Users can also turn each part on and off separately.
  - **Head Light**: Users can only turn it on or off, controlled by the headlight switch button.

## Results

- The first picture shows Gouraud shading with Phong lighting, while the second picture shows Gouraud shading with Blinn-Phong lighting. Notice the specular term is not circular even though the sphere is very smooth.

- The third picture shows Phong shading with Phong lighting, while the fourth picture shows Phong shading with Blinn-Phong lighting. These two pictures demonstrate how we can change the materials of the sphere, with 12 materials to choose from.

- These three pictures demonstrate the light controls. The first one shows only the headlight on: the headlight is a weak light source, but it is easy to notice the specular term at the center of the smooth sphere. The second picture shows no light on. The third picture shows the headlight on and the specular light from the lamp is on, which is changed to pink, clearly noticeable.

- There are more interesting things happening, such as the distortion of the rabbit. It is hard to show this with pictures, so remember to check it out!

## Scene Graph

[Your scene graph description goes here.]
