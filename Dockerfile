FROM oven/bun:1-alpine
WORKDIR /srv
COPY .output ./
ENV HOST=0.0.0.0 PORT=8080
EXPOSE 8080
CMD ["bun", "server/index.mjs"]
