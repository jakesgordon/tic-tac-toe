# Tic Tac Toe - Node

This repository includes an implementation of a simple Tic Tac Toe game with multiplayer support
provided by a Node.js websocket server.

![screenshot](mobile.png)

## Usage

```bash
> npm run dev        # run both client and server
> npm run dev:client # run client only
> npm run dev:server # run server only
> npm run test       # run (server) unit tests
> npm run lint       # run eslint
> npm run build      # build production assets
```

## Overview

There are 2 main components

  * `client.ts` is the client side entry point that constructs a websocket
    and connects to the server. It has no real game logic and simply sends commands
    to the server and responds to the events it sends back.
  * `server.ts` is the websocket server that does all the heavy lifting and manages
    a `Lobby` of `Player`s and the `Game` that they are currently playing. It reacts
    to commands from the websocket clients and responds by sending events back.

## The Interface

_coming soon_

## The Client

_coming soon_

## The Server

_coming soon_


## Repository Structure

The repository includes:

```console
    └── index.html          - page layout and templates
    └── public              - static assets 
    └── src
        └── interface.ts    - abstract types used by both client and server
        └── server.ts       - THE WEBSOCKET SERVER
        └── client.ts       - THE WEBSOCKET CLIENT
        └── client
            └── header.ts   - a webcomponent
            └── board.ts    - a webcomponent
```
