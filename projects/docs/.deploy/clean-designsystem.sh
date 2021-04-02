set -e

echo "clean script started"

eval $(ssh-agent -s)

echo "ssh agent working"

mkdir -p ~/.ssh

echo -e "$CI_SSH_PRIV_KEY" > ~/.ssh/id_rsa

echo "key created"

chmod 600 ~/.ssh/id_rsa

echo "status repo destinazione"

ssh -oStrictHostKeyChecking=no $CI_SSH_USER@$SERVER uptime
ssh $CI_SSH_USER@$SERVER "cd $DEPLOY_FOLDER && git status"

echo "connecting to $DEPLOY_FOLDER/projects/design-system as $CI_SSH_USER and stopping the build container"

# ssh $CI_SSH_USER@$SERVER "cd $DEPLOY_FOLDER/projects/design-system && docker-compose stop --label step=build"

# echo "cleaning sources"

# ssh $CI_SSH_USER@$SERVER "cd $DEPLOY_FOLDER/projects/design-system && rm -R ."

echo "clean script terminated"
