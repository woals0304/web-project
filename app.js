require('dotenv').config({ path: './.env.dev' });

const express = require('express');
const session = require('express-session');
const cors = require('cors');
const route = require('./route/index.js');
const dbConnect = require('./database/index.js');
const { errorHandler } = require('./util/errorHandler.js');
const timeout = require('connect-timeout');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const fs = require('fs');
const { STATUS_MESSAGE } = require('./util/constant/httpStatusCode');

const app = express();
const PORT = process.env.BACKEND_PORT || 3000;

// CORS 설정
app.use(cors('*'));

// 세션 초기화 함수
const initSessionId = async () => {
    try {
        const sql = 'UPDATE user_table SET session_id = NULL;';
        await dbConnect.query(sql);
        startHttpServer();
    } catch (error) {
        console.error('Failed to initialize session IDs:', error);
        process.exit(1); // 실패 시 프로세스 종료
    }
};

// 서버 시작 함수
const startHttpServer = () => {
    app.listen(PORT, () => {
        console.log(`edu-community app listening on port ${PORT}`);
    });
};

// 요청 속도 제한 설정
const limiter = rateLimit({
    // 10초동안
    windowMs: 10 * 1000,
    // 최대 100번의 요청을 허용
    max: 100,
    // 제한 초과 시 전송할 메시지
    message: STATUS_MESSAGE.TOO_MANY_REQUESTS,
    // RateLimit 헤더 정보를 표준으로 사용할 지 여부
    standardHeaders: true,
    // 레거시 X-RateLimit 헤더를 제거할 지 여부
    legacyHeaders: false
});

// 정적 파일 경로 설정
app.use('/public', express.static('public'));

// JSON 및 URL-encoded 요청 파싱
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 세션 설정
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: false,
            maxAge: 1000 * 60 * 60 * 24 // 1 day
        }
    })
);

// Timeout 설정
app.use(timeout('5s'));

// 요청 속도 제한 미들웨어
app.use(limiter);

// helmet
app.use(helmet());

// Routes
app.use('/', route);

// Error Handler
app.use(errorHandler);

// 초기화 후 서버 시작
initSessionId();