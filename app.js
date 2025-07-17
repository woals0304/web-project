import express from 'express';
import { join } from 'path';

const app = express();
const port = 8080;

// 정적 파일 서빙을 위한 디렉토리 설정
app.use(express.static('public'));

// 루트 경로에 대한 요청 처리
app.get('/', (request, response) => {
    return response.sendFile(join(process.cwd(), 'public/index.html'));
});

// 서버 시작
app.listen(port, () => {
    console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});