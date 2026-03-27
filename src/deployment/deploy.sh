#!/bin/bash

# Deployment Script

echo "Building project..."
pnpm build

echo "Deploying to production..."
pnpm deploy