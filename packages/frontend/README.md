https://d22hlibzizjrcs.cloudfront.net/

s3 bucket + cloudfront

## server index.html for all paths

click on the s3 bucket hosting the app -> properties -> scroll down to the end -> click on edit Static website hosting -> under Error document enter `index.html`

## Identifying HMR failire

`npx vite --debug hmr`
