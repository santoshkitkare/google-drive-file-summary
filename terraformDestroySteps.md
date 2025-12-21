# 🔴 FRIDAY NIGHT — CLEAN DESTROY FLOW
## Goal: Remove everything without Terraform failures

### 0️⃣ Pre-checks (2 minutes, mandatory)
```
bash

cd infra
terraform init
terraform validate
```

If validate fails → STOP. Fix first.

### 1️⃣ Remove Frontend DNS (CloudFront alias safety)

DNS Provider (Namecheap / Route53 / etc.)

❌ Delete:
```
app.santoshkitkare.com → *.cloudfront.net
```


### 📌 Why:
CloudFront forbids alias reuse if DNS still points to old distribution.

### 2️⃣ (Optional but safe) Remove API DNS

Not strictly required, but keeps DNS clean.

❌ Delete:
```
api.santoshkitkare.com → *.elb.amazonaws.com
```

### 3️⃣ Empty S3 bucket (required)

Terraform cannot delete non-empty buckets.
```
aws s3 rm s3://google-drive-file-summary --recursive
```


If versioning enabled:
```
aws s3api delete-objects \
  --bucket google-drive-file-summary \
  --delete "$(aws s3api list-object-versions \
    --bucket google-drive-file-summary \
    --query='{Objects: Versions[].{Key:Key,VersionId:VersionId}}')"
```

### 4️⃣ Delete all images from ECR (required)

Terraform deletes repo only if empty.
```
aws ecr batch-delete-image \
  --repository-name google-drive-summary-api \
  --image-ids $(aws ecr list-images \
    --repository-name google-drive-summary-api \
    --query 'imageIds[*]' \
    --output json)
```


(If repo doesn’t exist → ignore)

### 5️⃣ Destroy infrastructure
```
terraform destroy
```

Expected:
- ECS gone
- ALB gone
- CloudFront gone
- S3 bucket gone
- VPC remains (if shared)

### 6️⃣ End of Friday

- ✅ No AWS cost
- ✅ Clean slate
- ✅ DNS safe
