set -e

echo "deploy script started"

eval $(ssh-agent -s)

echo "ssh agent working"

mkdir -p ~/.ssh

echo -e "$CI_SSH_PRIV_KEY" > ~/.ssh/id_rsa

echo "key created"

chmod 600 ~/.ssh/id_rsa

echo "status repo destinazione"

ssh -oStrictHostKeyChecking=no $CI_SSH_USER@$SERVER uptime
ssh $CI_SSH_USER@$SERVER "cd $DEPLOY_FOLDER && git status"

echo "connecting to $DEPLOY_FOLDER as $CI_SSH_USER and checking out $CI_COMMIT_SHA"

ssh $CI_SSH_USER@$SERVER "cd $DEPLOY_FOLDER && git fetch && git checkout $CI_COMMIT_SHA"

echo "docker-compose build and start"

ssh $CI_SSH_USER@$SERVER "cd $DEPLOY_FOLDER/projects/design-system && docker-compose -f ./.deploy/docker-compose-designsystem.yml up -d --build"

echo "Clean app image not necessary"

ssh $CI_SSH_USER@$SERVER "cd $DEPLOY_FOLDER/projects/design-system && docker image prune -f --filter label=step=build"

echo "deploy script terminated"
