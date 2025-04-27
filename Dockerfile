# Use an Nginx image to serve the static site
FROM nginx:alpine

# Copy the static site files to the Nginx HTML directory
COPY . /usr/share/nginx/html

# Expose port 80 to serve the site
EXPOSE 80