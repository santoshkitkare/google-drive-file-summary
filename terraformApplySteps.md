# 🟢 MONDAY MORNING — FULL APPLY FLOW

## Goal: Recreate infra + app without conflicts

### 1️⃣ Init + Validate (mandatory)
```
cd infra
terraform init
terraform validate
```

### 2️⃣ First Terraform apply
```
terraform apply
```

This will:
- Create ECR
- Create ECS + ALB
- Create S3
- Request ACM certs
- Attempt CloudFront (may fail first time)

⚠️ If CloudFront fails due to cert → continue steps below.

### 3️⃣ ACM DNS validation (FIRST TIME / IF CHANGED)

DNS Provider:

Add both CNAMEs shown in Terraform output:
```
_acme-challenge.api.santoshkitkare.com → *.acm-validations.aws
_acme-challenge.app.santoshkitkare.com → *.acm-validations.aws
```

TTL: 60

⏳ Wait 5–15 minutes.

👉 DO NOT remove these records ever again.

### 4️⃣ Push backend Docker image (required)
```
aws ecr get-login-password --region ap-south-1 \
| docker login --username AWS --password-stdin <ACCOUNT_ID>.dkr.ecr.ap-south-1.amazonaws.com
```
```
docker build -t google-drive-summary-api .
docker tag google-drive-summary-api:latest \
  <ACCOUNT_ID>.dkr.ecr.ap-south-1.amazonaws.com/google-drive-summary-api:latest
docker push <ACCOUNT_ID>.dkr.ecr.ap-south-1.amazonaws.com/google-drive-summary-api:latest
```

### 5️⃣ Terraform apply again (IMPORTANT)
```
terraform apply
```

Now:
- ACM certs = ISSUED
- HTTPS listener active
- CloudFront created successfully

Terraform outputs:
```
cloudfront_url = https://xxxxx.cloudfront.net
alb_dns        = xxxx.elb.amazonaws.com
s3_bucket_name = google-drive-file-summary
```

### 6️⃣ Re-add DNS records (mandatory)
Frontend
```
Type: CNAME
Host: app
Value: xxxxx.cloudfront.net
```

Backend
```
Type: CNAME
Host: api
Value: xxxx.elb.amazonaws.com
```

⏳ Wait 2–5 minutes.

### 7️⃣ Upload frontend to S3 (required)
```
aws s3 sync ./frontend/dist s3://google-drive-file-summary --delete
```

(Optional cache headers)

```
aws s3 sync ./frontend/dist s3://google-drive-file-summary \
  --delete \
  --cache-control "max-age=31536000,public"
```
### 8️⃣ Final verification (DO NOT SKIP)
Backend
```
curl https://api.santoshkitkare.com/health
```
✅ 200 OK

Frontend
Open:
```
https://app.santoshkitkare.com
```
✅ UI loads
✅ HTTPS valid

OAuth
- Popup opens once
- No loops
- No network error
- User logs in

## 🧠 GOLDEN RULES (PIN THESE)
- ❌ Never destroy before deleting CloudFront DNS
- ❌ Never apply before cert is ISSUED
- ❌ Never delete _acme-challenge records
- ❌ Never skip second terraform apply
- ❌ Never upload frontend before S3 exists

## 🟢 FINAL TL;DR
Friday
```
Delete app DNS
Empty S3
Delete ECR images
terraform destroy
```

Monday
```
terraform apply
(add DNS validation once)
docker push
terraform apply
Add app + api DNS
Upload frontend
```


# For clearing cloudFront cache
aws cloudfront create-invalidation --distribution-id <distribution-id> --paths "/*"