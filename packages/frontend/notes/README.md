https://d22hlibzizjrcs.cloudfront.net/

s3 bucket + cloudfront

## server index.html for all paths

click on the s3 bucket hosting the app -> properties -> scroll down to the end -> click on edit Static website hosting -> under Error document enter `index.html`

## Identifying HMR failire

`npx vite --debug hmr`

## Only allow access through CloudFront

1. Disable s3 bucket static website hosting
2. Go to CloudFront, create a new origin access. This can be found on the left navigation, under security.
3. In CloudFront, select the distribution. Under origin make sure the origin domain is pointed at the right bucket.
4. Under the same tab, under origin access, select Origin access control settings.
5. Then under Origin access control pick the origin access you created on step 2.
6. Copy the policy from the banner that showed up underneath.
7. Go back to the s3 bucket and paste the policy in.
8. Remember you can enable Block all public access now since users will access your website through CloudFront.
9. Finally, under distribution, error pages. Click on create custom error response.

- for error code, pick 403
- for customize error response check yes
- response path = /index.html
- response code = 200
