# syntax=docker/dockerfile:1

FROM maven:3.9.9-eclipse-temurin-17-alpine AS builder
WORKDIR /build

COPY pom.xml .
COPY src ./src

RUN mvn -B -ntp -DskipTests package

FROM eclipse-temurin:17-jre-alpine AS runtime
WORKDIR /app

RUN apk add --no-cache dumb-init \
    && addgroup -S spring -g 1000 \
    && adduser -S spring -u 1000 -G spring

COPY --from=builder /build/target/*.jar /app/app.jar
RUN chown spring:spring /app/app.jar

USER spring:spring

EXPOSE 8098

ENV JAVA_OPTS=""

ENTRYPOINT ["dumb-init", "--"]
CMD ["sh", "-c", "exec java $JAVA_OPTS -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -jar /app/app.jar"]