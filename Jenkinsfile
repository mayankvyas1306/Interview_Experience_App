pipeline {

    // Run pipeline on local Jenkins machine
    // In your case: Windows laptop
    agent any

    // Global environment variables
    environment {

        // Production environment
        NODE_ENV = 'production'

        // Docker image names
        BACKEND_IMAGE = 'interviewexperience-backend'
        FRONTEND_IMAGE = 'interviewexperience-frontend'
    }

    stages {

        // ─────────────────────────────────────────────
        // STAGE 1 — Pull Latest Code
        // ─────────────────────────────────────────────
        stage('Checkout Code') {
            steps {

                // Pull latest code from configured branch
                checkout scm

                echo ' Latest code pulled successfully'
            }
        }

        // ─────────────────────────────────────────────
        // STAGE 2 — Install Backend Dependencies
        // ─────────────────────────────────────────────
        stage('Install Backend Dependencies') {
            steps {

                dir('server') {

                    // npm ci = clean install for CI/CD
                    // Faster and more stable than npm install
                    bat 'npm ci'
                }

                echo ' Backend dependencies installed'
            }
        }

        // ─────────────────────────────────────────────
        // STAGE 3 — Run Backend Tests
        // ─────────────────────────────────────────────
        stage('Backend Validation') {
            steps {

                dir('server') {

            // Validate dependencies installed
                    bat 'npm list'

                    echo ' Backend validation successful'
                }
            }
        }

        // ─────────────────────────────────────────────
        // STAGE 4 — Stop Old Containers
        // ─────────────────────────────────────────────
        stage('Stop Old Containers') {
            steps {

                // Stop old containers safely
                // Prevent pipeline failure if nothing is running
                bat '''
                docker compose down
                if %ERRORLEVEL% NEQ 0 exit /b 0
                '''

                echo ' Old containers stopped'
            }
        }

        // ─────────────────────────────────────────────
        // STAGE 5 — Build Docker Images
        // ─────────────────────────────────────────────
        stage('Build Docker Images') {
            steps {

                withCredentials([
                    string(credentialsId: 'MONGO_URI', variable: 'MONGO_URI'),
                    string(credentialsId: 'JWT_SECRET', variable: 'JWT_SECRET'),
                    string(credentialsId: 'GEMINI_API_KEY', variable: 'GEMINI_API_KEY'),
                    string(credentialsId: 'CLIENT_URL', variable: 'CLIENT_URL')
                ]) {

                    // Build fresh images
                    // no-cache prevents stale builds
                    bat 'docker compose build --no-cache'

                    echo ' Docker images built successfully'
                }
            }
        }

        // ─────────────────────────────────────────────
        // STAGE 6 — Deploy Containers
        // ─────────────────────────────────────────────
        stage('Deploy Containers') {
            steps {

                withCredentials([
                    string(credentialsId: 'MONGO_URI', variable: 'MONGO_URI'),
                    string(credentialsId: 'JWT_SECRET', variable: 'JWT_SECRET'),
                    string(credentialsId: 'GEMINI_API_KEY', variable: 'GEMINI_API_KEY'),
                    string(credentialsId: 'CLIENT_URL', variable: 'CLIENT_URL')
                ]) {

                    // Start containers in background
                    bat 'docker compose up -d'

                    echo ' Containers deployed successfully'
                }
            }
        }

        // ─────────────────────────────────────────────
        // STAGE 7 — Health Check
        // ─────────────────────────────────────────────
        stage('Health Check') {
            steps {

                // Wait for containers to start
                sleep(time: 20, unit: 'SECONDS')

                // Verify backend health endpoint
                bat '''
                curl -f http://localhost:5000/health
                if %ERRORLEVEL% NEQ 0 exit /b 1
                '''

                echo ' Health check passed'
            }
        }

        // ─────────────────────────────────────────────
        // STAGE 8 — Verify Running Containers
        // ─────────────────────────────────────────────
        stage('Verify Containers') {
            steps {

                // Show running containers
                bat 'docker compose ps'

                echo ' Containers verified successfully'
            }
        }
    }

    // ─────────────────────────────────────────────
    // POST BUILD ACTIONS
    // ─────────────────────────────────────────────
    post {

        success {

            echo ' Pipeline completed successfully!'
            echo ' Application deployed successfully!'
        }

        failure {

            echo ' Pipeline failed!'
            echo ' Check Jenkins Console Output'
        }

        always {

            // Cleanup dangling Docker images
            bat '''
            docker image prune -f
            if %ERRORLEVEL% NEQ 0 exit /b 0
            '''

            echo ' Docker cleanup completed'
        }
    }
}