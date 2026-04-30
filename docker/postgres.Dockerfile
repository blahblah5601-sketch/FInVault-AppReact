# Use PostgreSQL 15 with Alpine Linux
FROM postgres:15-alpine

# Set environment variables for PostgreSQL
ENV POSTGRES_DB=finvault \
    POSTGRES_USER=finvault_user \
    POSTGRES_PASSWORD=your_secure_password_here

# Copy initialization scripts
COPY ./scripts/init-db.sql /docker-entrypoint-initdb.d/

# Create a directory for database backups
RUN mkdir -p /backups

# Set working directory
WORKDIR /app

# Expose PostgreSQL port
EXPOSE 5432

# Default command
CMD ["postgres"]