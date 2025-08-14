#!/bin/bash

echo "[두니사랑단 ingwannu 패널]: 응급 복구 시작!"

# utils 디렉토리 생성
mkdir -p utils

# seed.js 파일이 없으면 생성
if [ ! -f "utils/seed.js" ]; then
    echo "[두니사랑단 ingwannu 패널]: seed.js 파일 생성 중..."
    cat > utils/seed.js << 'EOF'
const { sequelize, User } = require('../models');
require('dotenv').config();

const seedOwner = async () => {
  try {
    // Sync database
    await sequelize.sync({ force: false });
    
    // Check if owner already exists
    const existingOwner = await User.findOne({
      where: { username: process.env.ADMIN_USERNAME }
    });
    
    if (existingOwner) {
      console.log('Owner account already exists');
      return;
    }
    
    // Create owner account
    const owner = await User.create({
      username: process.env.ADMIN_USERNAME,
      email: process.env.ADMIN_EMAIL || 'admin@example.com',
      phone: process.env.ADMIN_PHONE || '010-0000-0000',
      password_hash: process.env.ADMIN_PASSWORD,
      role: 'OWNER',
      status: 'ACTIVE'
    });
    
    console.log('Owner account created successfully:', {
      id: owner.id,
      username: owner.username,
      email: owner.email,
      role: owner.role
    });
  } catch (error) {
    console.error('Error seeding owner:', error);
  }
};

module.exports = seedOwner;
EOF
fi

# .env 파일이 없으면 생성
if [ ! -f ".env" ]; then
    echo "[두니사랑단 ingwannu 패널]: .env 파일 생성 중..."
    cat > .env << 'EOF'
# Server Configuration
PORT=50012
NODE_ENV=production

# Database
DATABASE_URL=sqlite://database.sqlite

# JWT Secret
JWT_SECRET=wicked_jwt_secret_2024

# Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=changeThisPassword123!
ADMIN_EMAIL=admin@example.com
ADMIN_PHONE=010-0000-0000

# Session
SESSION_SECRET=wicked_session_secret_2024
EOF
fi

echo "[두니사랑단 ingwannu 패널]: 파일 구조 확인..."
echo "현재 디렉토리: $(pwd)"
echo "파일 목록:"
ls -la

echo "[두니사랑단 ingwannu 패널]: utils 디렉토리 내용:"
ls -la utils/

echo "[두니사랑단 ingwannu 패널]: 복구 완료! 이제 서버를 시작할 수 있습니다."