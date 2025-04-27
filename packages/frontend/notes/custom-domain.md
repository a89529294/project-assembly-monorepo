Step 1: Request an SSL Certificate in ACM (Simplified with Route 53)
Go to AWS Certificate Manager (ACM)

Important: Request the certificate in us-east-1 (N. Virginia) because CloudFront only works with ACM certificates from this region.

Request a certificate

Add both:

Your root domain (example.com)

Wildcard (\*.example.com) (optional but recommended for subdomains)

Domain Validation (Easier with Route 53)

Instead of manual DNS/email validation, choose "DNS validation".

ACM will generate DNS records (CNAME) for validation.

Route 53 can auto-create these records:

Click "Create records in Route 53" (if your domain is hosted in Route 53).

This automates validation (usually completes in a few minutes).

If using another DNS provider, you’ll need to manually add the CNAME records.

Step 3: Configure DNS in Route 53 (Instead of External DNS)
Since you're using Route 53:

Go to Route 53 Console

Select your hosted zone (e.g., example.com)

Create an Alias record (recommended for CloudFront):

Click "Create Record"

Configure:

Record name: www (or leave blank for root domain example.com)

Record type: A (IPv4)

Alias: Toggle ON

Route traffic to:

Select "Alias to CloudFront distribution"

Choose your CloudFront distribution (e.g., d123.cloudfront.net)

(Optional) TTL: Leave default

Save

For Root Domain (example.com)
Route 53 supports Alias records at the root level (unlike CNAMEs), so you can point example.com directly to CloudFront.

Follow the same steps as above, but leave the Record name blank.

Key Benefits of Using Route 53 with CloudFront
✅ Auto SSL Validation – ACM can automatically add DNS records in Route 53 for certificate validation.
✅ Alias Records – No need for CNAMEs; Route 53 supports native Alias records for root domains.
✅ Faster Propagation – AWS services integrate seamlessly, reducing DNS delays.
✅ Better Reliability – Managed by AWS, ensuring high availability.

Final Steps (Same as Before)
Wait for CloudFront deployment (~15 mins).

Test:

Open https://www.example.com (should load via CloudFront).

Check SSL padlock in the browser.

If you encounter issues:

Double-check that the ACM certificate is in us-east-1.

Verify Route 53 Alias records are correctly pointing to CloudFront.

Clear DNS cache (nslookup www.example.com or dig www.example.com).
