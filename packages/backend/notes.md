1. create ec2 instance

   - check allow ssh, http, https

2. in instance creation tab, generate a key pair. The private key will be downloaded to your local machine.
3. `ssh -i path-to-private-key ubuntu@ip`
   - remember to also save the `.pem` file into bitwarden's aws-key folder.

- if you run into a permission error, `chmod 400 /Users/albertchang/Downloads/sample-hono-be-key-pair.pem`

4.  enable ufw

    - `sudo ufw allow ssh`
    - `sudo ufw allow http`
    - `sudo ufw allow https`
    - `sudo ufw enable`
    - `sudo ufw status`

5.  `sudo apt update && sudo apt upgrade -y`
6.  get the lastest lts of node and install it

    - `curl -fsSL https://deb.nodesource.com/setup_23.x -o nodesource_setup.sh`
    - `bash nodesource_setup.sh`
    - `apt-get install -y nodejs`
    - `node -v`
    - for up to date info, [nodesource](https://github.com/nodesource/distributions)

7.  `ssh-keygen -t ed25519 -C "a89529294@hotmail.com"`
8.  `cat ~/.ssh/id_ed25519.pub`, copy and paste this to github
9.  cd to desired location and `git clone ...`
10. cd into cloned app.

    - `sudo corepack enable pnpm`
    - `pnpm i`

11. `sudo npm install -g pm2`
12. Assuming there is a prod script.

    - `cd path-to-app`,
    - `pm2 start pnpm --name "hono-be" -- run prod`
    - `pm2 list`
    - `pm2 save`
    - `pm2 startup`
    - `pm2 restart hono-be` # if you need to restart hono-be
    - `pm2 delete hono-be` # to remove entry

13. install and enable _nginx_

    - `sudo apt install nginx -y`
    - `sudo systemctl start nginx`
    - `sudo systemctl enable nginx`
    - `sudo systemctl status nginx`

14. setup _nginx_ config

    - `sudo vi /etc/nginx/conf.d/hono-be.con`
    - paste the following into the file

```nginx
server {
    listen 80;
    server_name your_domain.com www.your_domain.com;  # Replace with your domain or IP

    location / {
        proxy_pass http://localhost:3000;  # Forward to your Node.js app
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

15. Test and reload Nginx:

    - `sudo nginx -t`
    - `sudo systemctl reload nginx`
    - go back to local machine, test `http://ip`

16. set up https

    - `sudo vi /etc/nginx/conf.d/hono-be.conf`
    - replace the ip with domain name
    - `sudo nginx -t && sudo systemctl reload nginx`
    - `sudo apt install certbot python3-certbot-nginx -y`
    - `sudo certbot --nginx -d <domain_name>`
    - test on local machine `https:domain_name`
    - back on ec2 instance, `sudo certbot renew --dry-run`

17. connect to aws rds

    - `ssh -i xxx.pem -L 5433:rds-endpoint:5432 ubuntu@ip`, keep connection on
    - in pgadmin, query tool workspace fill in
      - hostname: localhost
      - port: 5433
      - database: postgres
      - user: postgres
      - password: your_secret_password
    - once in you can create a new db, `CREATE DATABSE dbname`
    - disconnect and then reconnect under the new db

18. Add tsup for bundling (required if you want absolute imports).
    - in package.json script: `"build": "tsup src/index.ts --format esm --dts --outDir dist",`
    - in `tsconfig.json` add

```json
    "baseUrl": "src", // enables direct import from src
    "paths": {
      "trpc/*": ["trpc/*"],
      "db/*": ["db/*"],
      "helpers/*": ["helpers/*"]
      // add more top level folders in src if you need
    },
    "moduleResolution": "Bundler" // enables importing without specifcying .js/.ts
```

    - Right now we are not using absolute imports, because it breaks trpc types on the frontend
