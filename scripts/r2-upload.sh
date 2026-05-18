#!/bin/bash
# Upload blog/content images from public/ to Cloudflare R2
# Reads config from secrets/.cloudflare.env
#
# Usage: ./scripts/r2-upload.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$PROJECT_DIR/secrets/.cloudflare.env"

if [ ! -f "$ENV_FILE" ]; then
  echo "Error: $ENV_FILE not found"
  exit 1
fi

# Source env vars (skip comments)
while IFS='=' read -r key value; do
  [[ "$key" =~ ^#.*$ || -z "$key" ]] && continue
  export "$key=$value"
done < "$ENV_FILE"

BUCKET="${R2_BUCKET:-sagarsarkale-assets}"
ENDPOINT="$CF_ENDPOINT"
PUBLIC_DIR="$PROJECT_DIR/public"

# Directories to upload (everything except favicons/fonts/og-image)
SKIP_PATTERNS=("favicon*" "apple-touch-icon*" "mstile*" "og-image*" "fonts" "logos")

echo "Uploading images from public/ to R2 bucket: $BUCKET"
echo "Endpoint: $ENDPOINT"
echo ""

count=0
find "$PUBLIC_DIR" -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.gif" -o -name "*.webp" -o -name "*.svg" \) | while read -r file; do
  rel="${file#$PUBLIC_DIR/}"

  # Skip favicons and other non-content assets
  skip=false
  for pattern in "${SKIP_PATTERNS[@]}"; do
    if [[ "$rel" == $pattern* ]]; then
      skip=true
      break
    fi
  done
  $skip && continue

  echo "  uploading: $rel"
  AWS_ACCESS_KEY_ID="$CF_ACCESS_KEY_ID" \
  AWS_SECRET_ACCESS_KEY="$CF_SECRET_ACCESS_KEY" \
  AWS_DEFAULT_REGION=auto \
  aws s3 cp "$file" "s3://$BUCKET/$rel" \
    --endpoint-url "$ENDPOINT" \
    --quiet

  count=$((count + 1))
done

echo ""
echo "Done. Uploaded files to s3://$BUCKET/"
echo ""
echo "Next steps:"
echo "1. Enable public access for the bucket in Cloudflare dashboard"
echo "   R2 > sagarsarkale-assets > Settings > Public Access"
echo "2. Either use the r2.dev subdomain or connect a custom domain (e.g. assets.sagarsarkale.com)"
echo "3. Set R2_PUBLIC_URL in secrets/.cloudflare.env"
echo "4. Run: node scripts/r2-rewrite.mjs"
