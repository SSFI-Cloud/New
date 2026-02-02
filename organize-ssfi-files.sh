#!/bin/bash

# SSFI Project Auto-Organization Script
# This script organizes downloaded files into proper backend and frontend structure

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Base directory
BASE_DIR="/Users/lakshmanan/Downloads/SSFI-Laxman"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}SSFI Project File Organization Script${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Navigate to base directory
cd "$BASE_DIR" || exit 1

echo -e "${YELLOW}Current directory: $(pwd)${NC}\n"

# Create backend structure
echo -e "${GREEN}Creating backend directory structure...${NC}"
mkdir -p ssfi-backend/{src/{config,middleware,controllers,services,routes,validators,utils,types},prisma/migrations,uploads/{documents,photos,signatures,banners,certificates},logs}

# Create frontend structure
echo -e "${GREEN}Creating frontend directory structure...${NC}"
mkdir -p ssfi-frontend/{src/{app/{auth/{login,register},dashboard/{dashboard,events,profile},public/{about,events,gallery,news}},components/{layout,home,events,dashboard,ui,shared},lib/{api,hooks,utils,store},types,styles},public/{images/{hero,athletes,events,sponsors,news}}}

echo -e "${GREEN}Directory structure created!${NC}\n"

# Function to move and rename files
move_and_rename() {
    local source="$1"
    local dest_dir="$2"
    local new_name="$3"
    
    if [ -f "$source" ]; then
        echo -e "  Moving: ${source} → ${dest_dir}/${new_name}"
        mv "$source" "$dest_dir/$new_name"
    else
        echo -e "  ${YELLOW}Not found: ${source}${NC}"
    fi
}

# Organize Backend Files
echo -e "${BLUE}Organizing Backend Files...${NC}"

# Root files
move_and_rename "ssfi_package_json.json" "ssfi-backend" "package.json"
move_and_rename "ssfi_env_example.sh" "ssfi-backend" ".env.example"

# Prisma files
move_and_rename "ssfi_prisma_schema.txt" "ssfi-backend/prisma" "schema.prisma"

# Source files - app.ts
move_and_rename "ssfi_app_ts.ts" "ssfi-backend/src" "app.ts"

# Middleware files
move_and_rename "ssfi_auth_middleware.ts" "ssfi-backend/src/middleware" "auth.middleware.ts"
move_and_rename "ssfi_error_middleware.ts" "ssfi-backend/src/middleware" "error.middleware.ts"
move_and_rename "ssfi_upload_middleware.ts" "ssfi-backend/src/middleware" "upload.middleware.ts"
move_and_rename "ssfi_validation_middleware.ts" "ssfi-backend/src/middleware" "validation.middleware.ts"

# Controller files
move_and_rename "ssfi_auth_controller.ts" "ssfi-backend/src/controllers" "auth.controller.ts"

# Service files
move_and_rename "ssfi_auth_service.ts" "ssfi-backend/src/services" "auth.service.ts"
move_and_rename "ssfi_image_service.ts" "ssfi-backend/src/services" "image.service.ts"
move_and_rename "ssfi_otp_service.ts" "ssfi-backend/src/services" "otp.service.ts"
move_and_rename "ssfi_uid_service.ts" "ssfi-backend/src/services" "uid.service.ts"

# Route files
move_and_rename "ssfi_auth_routes.ts" "ssfi-backend/src/routes" "auth.routes.ts"

# Validator files
move_and_rename "ssfi_auth_validator.ts" "ssfi-backend/src/validators" "auth.validator.ts"

# Util files
move_and_rename "ssfi_logger_util.ts" "ssfi-backend/src/utils" "logger.util.ts"
move_and_rename "ssfi_response_util.ts" "ssfi-backend/src/utils" "response.util.ts"

echo -e "${GREEN}Backend files organized!${NC}\n"

# Organize Frontend Files
echo -e "${BLUE}Organizing Frontend Files...${NC}"

# Home components
move_and_rename "ssfi_home_hero.ts" "ssfi-frontend/src/components/home" "HeroSection.tsx"
move_and_rename "ssfi_stats_counter.ts" "ssfi-frontend/src/components/home" "StatsCounter.tsx"
move_and_rename "ssfi_featured_events.ts" "ssfi-frontend/src/components/home" "FeaturedEvents.tsx"
move_and_rename "ssfi_why_join.ts" "ssfi-frontend/src/components/home" "WhyJoinSSFI.tsx"
move_and_rename "ssfi_news_section.ts" "ssfi-frontend/src/components/home" "NewsSection.tsx"
move_and_rename "ssfi_sponsors_cta.ts" "ssfi-frontend/src/components/home" "SponsorsMarquee.tsx"

# Layout components
move_and_rename "ssfi_header_nav.ts" "ssfi-frontend/src/components/layout" "Header.tsx"
move_and_rename "ssfi_footer_layout.ts" "ssfi-frontend/src/components/layout" "Footer.tsx"

# App pages
move_and_rename "ssfi_home_page.ts" "ssfi-frontend/src/app" "page.tsx"

# Auth components
move_and_rename "ssfi_login_register.ts" "ssfi-frontend/src/app/auth" "AuthForms.tsx"

# API client
move_and_rename "ssfi_api_client.ts" "ssfi-frontend/src/lib/api" "client.ts"

echo -e "${GREEN}Frontend files organized!${NC}\n"

# Keep documentation files in a docs folder
echo -e "${BLUE}Organizing documentation files...${NC}"
mkdir -p docs
move_and_rename "ssfi_backend_plan.txt" "docs" "backend_plan.md"
move_and_rename "ssfi_frontend_nextjs.txt" "docs" "frontend_plan.md"
move_and_rename "ssfi_complete_setup.md" "docs" "complete_setup.md"

echo -e "${GREEN}Documentation files organized!${NC}\n"

# Create README files
echo -e "${BLUE}Creating README files...${NC}"

cat > ssfi-backend/README.md << 'EOF'
# SSFI Backend

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

3. Setup database:
```bash
npx prisma migrate dev
npx prisma generate
```

4. Run development server:
```bash
npm run dev
```

## Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run migrations
EOF

cat > ssfi-frontend/README.md << 'EOF'
# SSFI Frontend

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment:
```bash
cp .env.example .env.local
# Edit .env.local with your API URL
```

3. Run development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
EOF

echo -e "${GREEN}README files created!${NC}\n"

# List remaining files
echo -e "${YELLOW}Checking for remaining files...${NC}"
remaining_files=$(find . -maxdepth 1 -type f ! -name "organize-ssfi-files.sh" ! -name ".DS_Store")

if [ -n "$remaining_files" ]; then
    echo -e "${RED}The following files were not organized:${NC}"
    echo "$remaining_files"
    echo -e "\n${YELLOW}These files might need manual placement.${NC}"
else
    echo -e "${GREEN}All files have been organized!${NC}"
fi

# Summary
echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}Organization Complete!${NC}"
echo -e "${BLUE}========================================${NC}\n"

echo -e "${GREEN}Project structure:${NC}"
echo -e "  📁 ssfi-backend/    - Backend API (Node.js + Express + Prisma)"
echo -e "  📁 ssfi-frontend/   - Frontend (Next.js + React + Tailwind)"
echo -e "  📁 docs/            - Documentation and planning files"
echo -e "\n${YELLOW}Next steps:${NC}"
echo -e "  1. cd ssfi-backend && npm install"
echo -e "  2. Configure .env file"
echo -e "  3. npx prisma migrate dev"
echo -e "  4. npm run dev"
echo -e "\n  Then in another terminal:"
echo -e "  1. cd ssfi-frontend && npm install"
echo -e "  2. Configure .env.local file"
echo -e "  3. npm run dev"
echo -e "\n${GREEN}Happy coding! 🚀${NC}\n"
