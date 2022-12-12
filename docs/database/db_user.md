# User

## Overview:

- Each user should have a set of informations which can be validated
- User should be prompted to get a unique REST API key, which will be used on the web
- Username is a unique field (case sensitive)
- Password should be encripted and changable

## Roles:

- Roles determine whether the user has access to specific options of the NXT, Website and GPS app
- Server functionalities should not be connected to any user Role
- Expected roles:
  - [Basic](#basic)
  - [Admin](#admin)

## Basic:

- Basic user is that which has a role attribute set to 'basic_min'
- Basic user should have options such as:
  - Register, Login
  - Change password
  - Change username
  - View NXT status
  - View NXT position
  - View NXT camera view
  - Control NXT

## Admin:

- Admin user is that which has a role attribute set to 'admin'
- Admin user should have functionalities same as 'basic_min' with:
  - Configure NXT:
    - Set NXT learning rate
    - Set NXT NN depth
    - Set NXT order of activation functions
    - Update NXT controls (add, remove, reconfigure)
