pipeline {
    agent any
    environment {
        ekbana30 = credentials('ekbana30')
        APP_NAME = "coldstorewebapp"
        APP_PLATFORM = "django" //choose one among "django, maven, gradle,laravel ..."
        RUNNING_PORT = "8000"
        EXPOSE_PORT = "31290"
        REPO_NAME = "coldstorewebapp"
    }
    stages {
        stage('get_commit_msg') {
            steps {
              script {
                notifyStarted()
                passedBuilds = []
                lastSuccessfulBuild(passedBuilds, currentBuild);
                env.changeLog = getChangeLog(passedBuilds)
                echo "changeLog \n${env.changeLog}"
              }
            }
        }

        stage('Deploy to $BRANCH_NAME server') {
            steps{
              script {
                sshagent(['ekbana30']) {
                sh '''
                ssh -tt -o StrictHostKeyChecking=no ekbana@10.10.5.30 -p 22 << EOF
                cd /mnt/disk1/kube-cluster/system-management/jenkins_automation/$APP_PLATFORM/script
                ./run.sh $APP_NAME $APP_NAME:$BRANCH_NAME-$BUILD_NUMBER $RUNNING_PORT $EXPOSE_PORT $BRANCH_NAME $REPO_NAME  $GIT_URL $APP_PLATFORM $BUILD_NUMBER
                exit
            EOF '''
              }
            }
          }
        }
      }

    post{

      success{
        notifySuccessful()
      }
      failure{
        notifyFailed()
      }
    }

}

def notifyStarted() {
mattermostSend (
  color: "#2A42EE",
  channel: '@rajan',
  endpoint: 'https://ekbana.letsperk.com/hooks/kqndtuee7ig4jnfz19f7byoqxr',
  message: "Build STARTED: ${env.JOB_NAME} #${env.BUILD_NUMBER} (<${env.BUILD_URL}|Link to build>)"
  )
}

def notifySuccessful() {
mattermostSend (
  color: "#00f514",
  channel: '@rajan',
  endpoint: 'https://ekbana.letsperk.com/hooks/kqndtuee7ig4jnfz19f7byoqxr',
  message: "Build SUCCESS: ${env.JOB_NAME} #${env.BUILD_NUMBER} (<${env.BUILD_URL}|Link to build>):\n${changeLog}"
  )
}

def notifyFailed() {
mattermostSend (
  color: "#e00707",
  channel: '@rajan',
  endpoint: 'https://ekbana.letsperk.com/hooks/kqndtuee7ig4jnfz19f7byoqxr',
  message: "Build FAILED: ${env.JOB_NAME} #${env.BUILD_NUMBER} (<${env.BUILD_URL}|Link to build>)"
  )
}
def lastSuccessfulBuild(passedBuilds, build) {
  if ((build != null) && (build.result != 'SUCCESS')) {
      passedBuilds.add(build)
      lastSuccessfulBuild(passedBuilds, build.getPreviousBuild())
   }
}

@NonCPS
def getChangeLog(passedBuilds) {
    def log = ""
    for (int x = 0; x < passedBuilds.size(); x++) {
        def currentBuild = passedBuilds[x];
        def changeLogSets = currentBuild.changeSets
        for (int i = 0; i < changeLogSets.size(); i++) {
            def entries = changeLogSets[i].items
            for (int j = 0; j < entries.length; j++) {
                def entry = entries[j]
                log += "* ${entry.msg} by ${entry.author} \n"
            }
        }
    }
    return log;
  }


