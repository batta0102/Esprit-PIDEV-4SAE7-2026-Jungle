# Image runtime Java 17 — le JAR est produit par Maven sur l’agent Jenkins (mvn package) avant docker build.
FROM eclipse-temurin:17-jre-jammy

ARG JAR_FILE=target/*.jar

WORKDIR /app

RUN groupadd --system app && useradd --system --gid app app
COPY ${JAR_FILE} app.jar
RUN chown -R app:app /app

USER app

EXPOSE 8098

ENV JAVA_OPTS="-XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"

ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar /app/app.jar"]
