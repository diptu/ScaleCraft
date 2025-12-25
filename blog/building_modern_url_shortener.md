---
id: v1  URL Shortener
title: Modern URL Shortener
sidebar_position: 2
---

# Building a Modern URL Shortener with NestJS, Prisma, and Supabase

## 1.Project Initialization
The first step in any NestJS project is scaffold the application using the Nest CLI. This sets up a modular structure out of the box, including essential configuration files and dependencies.
### 1.1 Install Nest CLI (Optional)
```bash
npm i -g @nestjs/cli
```

### 1.2 Scaffold the Project
Run the following command to create the project directory and initial file
```bash
nest new url_shortner
```
### 1.3 Select Package Manager
During the installation, you will be prompted to choose a package manager. For this project, we recommend npm.

Once the installation is complete, navigate into your project:

```bash
cd url_shortner
```
### 1.4 Project Structure Overview

At this stage, your src/ directory contains:

- main.ts: The entry point of the application.

- app.module.ts: The root module of the application.

- app.controller.ts: A basic controller with a single route.

- app.service.ts: A basic service with a single method.

## 2 Local Development & Project Cleanup:

With the base project scaffolded, the next phase focuses on establishing a clean slate.

### 2.1 Start the Development Server
start the application in watch mode:
```bash
npm run start:dev
```
### 2.2 Project Cleanup

- Delete the following files from the src/ directory:

    src/app.controller.ts

    src/app.controller.spec.ts

    src/app.service.ts
### 2.3 Update the Root Module

```ts
import { Module } from '@nestjs/common';

@Module({
  imports: [],
  controllers: [],
  providers: [],
})
export class AppModule {}
```