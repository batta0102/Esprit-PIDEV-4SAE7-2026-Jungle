pipeline {
    agent {
        docker {
            image 'maven:3.9.9-eclipse-temurin-17'
            reuseNode true
        }
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        // TEMPORAIRE — retirer une fois Java 17 + Maven Docker confirmés dans les logs Jenkins
        stage('Debug') {
            steps {
                sh 'java -version'
                sh 'mvn -version'
                sh 'echo $JAVA_HOME'
            }
        }

        stage('Build') {
            steps {
                sh 'mvn clean package -DskipTests'
            }
        }
    }
}
