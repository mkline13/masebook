# Masebook

A social media app with a novel design combining features from Facebook, Reddit, Discord, and others.

### Why?

Currently, Masebook is serving the purpose of teaching me how to write a CRUD web app. However, my long-term vision is to create a social-media app that can be easily installed and run on minimal hardware by hobbyists and IT professionals. I think that in order for social media sites to be beneficial to their communities in the long run, they need to be smaller, less centralized, more geographically constrained, and governed by members of their communities. I'm hoping Masebook can serve as a playground to test out design ideas that would make social media better for local communities.

## How it's made

Front end: vanilla JS / HTML / CSS

Back end: Node.js, Express, PostgreSQL, Bcrypt.js

## Current status

Masebook is not quite ready for test deployment.

These are the features that have been implemented thus far:
- Authentication (session-based)
- Role-based permissions system for determining a user's allowed actions within a space
- Server directory of spaces and users
- Creation of new spaces
- Reading / creating posts in authorized spaces

Unfinished MVP features:
- Space deletion / editing
- Updating / deleting posts
- Following spaces
- Dashboard feed
- Prepare for deployment
- Comments
- Profile photos
- Deluxe pokes
- Controls for server administrators

### Future goals

Once the minimum viable product is ready, here are some ideas and features I'd like to experiment with:
- Competitive snake games 🐍🐍🐍
- Direct messaging
- Rewriting major portions of the app so it can be deployed on inexpensive hardware such as the Raspberry Pi
- Mobile apps