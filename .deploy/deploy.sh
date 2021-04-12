set -e

echo "deploy script started"

echo "preparing .env file"
envsubst < .deploy/$ENV/docker-compose.yml > .deploy/$ENV/docker-compose.yml.replaced
rm .deploy/$ENV/docker-compose.yml && mv .deploy/$ENV/docker-compose.yml.replaced .deploy/$ENV/docker-compose.yml

eval $(ssh-agent -s)

echo "ssh agent working"

mkdir -p ~/.ssh

echo -e "$SSH_PRIV_KEY" > ~/.ssh/id_rsa

echo "key created"

chmod 600 ~/.ssh/id_rsa

ssh -oStrictHostKeyChecking=no $SSH_USER@$SERVER uptime

echo "copying $ENV files to $SERVER:$DEPLOY_FOLDER/$ENV/"

ssh $SSH_USER@$SERVER "mkdir -p $DEPLOY_FOLDER/$ENV/"

scp -oStrictHostKeyChecking=no -r .deploy/$ENV/* $SSH_USER@$SERVER:$DEPLOY_FOLDER/$ENV/

echo "Login to Azure repository"

ssh $SSH_USER@$SERVER "echo $CI_REGISTRY_PSW | docker login -u $CI_REGISTRY_USR --password-stdin https://$CI_REGISTRY"

echo "docker-compose pull"

ssh $SSH_USER@$SERVER "cd $DEPLOY_FOLDER/$ENV && docker-compose pull"

echo "docker-compose down"

ssh $SSH_USER@$SERVER "cd $DEPLOY_FOLDER/$ENV && docker-compose down || true"

echo "docker-compose up"

ssh $SSH_USER@$SERVER "cd $DEPLOY_FOLDER/$ENV && docker-compose up -d"

echo "deploy script terminated"
