#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""gen_tuyen_dung.py — Sinh trang tuyển dụng OMEGA (31 HTML + JSON)
Chạy: python auto-omega/gen_tuyen_dung.py
"""
import os, json, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

ROOT     = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TINTUC        = os.path.join(ROOT, 'tin-tuc')
JOBS_JSON_DIR = os.path.join(TINTUC, 'tuyen-dung')
NEWS_JSON     = os.path.join(TINTUC, '_tools', 'news-data.json')
GEN_DATE  = '16/04/2026'
NEXT_ID   = 175   # ID bắt đầu thêm vào news-data.json

# ─── 30 VỊ TRÍ TUYỂN DỤNG ────────────────────────────────────────────────────
JOBS = [
  {"id":"J001","slug":"tuyen-dung-lap-trinh-vien-backend","title":"Lập trình viên Backend (.NET / Node.js)","dept":"Phòng Kỹ thuật","dept_slug":"ky-thuat","type":"Toàn thời gian","level":"Senior","location":"TP.HCM","salary":"20 – 35 triệu","openings":3,"deadline":"30/06/2026","status":"ACTIVE","hot":True,
   "excerpt":"Xây dựng và tối ưu hóa hệ thống backend cho nền tảng ERP OMEGA – xử lý nghiệp vụ phức tạp, hiệu năng cao.",
   "duties":["Thiết kế và phát triển API (RESTful/GraphQL) phục vụ các phân hệ ERP","Tối ưu hiệu năng truy vấn CSDL (SQL Server, PostgreSQL)","Tích hợp hệ thống bên thứ ba: thuế điện tử, ngân hàng, EDI","Review code, hướng dẫn junior developer","Viết unit/integration test và tài liệu kỹ thuật","Nghiên cứu áp dụng AI, microservices, cloud vào ERP"],
   "requirements":["3+ năm kinh nghiệm với .NET (C#) hoặc Node.js","Thành thạo SQL Server, hiểu ORM (EF Core / Prisma)","Hiểu biết về kiến trúc microservices, REST API","Có kinh nghiệm ERP / phần mềm quản trị là lợi thế lớn","Đọc hiểu tài liệu kỹ thuật tiếng Anh"],
   "benefits":["Lương cạnh tranh + thưởng dự án","Môi trường Agile, không OT vô tội vạ","Đào tạo chuyên sâu ERP và công nghệ mới","Bảo hiểm sức khỏe, du lịch hàng năm"]},

  {"id":"J002","slug":"tuyen-dung-lap-trinh-vien-frontend","title":"Lập trình viên Frontend (Vue.js / React)","dept":"Phòng Kỹ thuật","dept_slug":"ky-thuat","type":"Toàn thời gian","level":"Middle – Senior","location":"TP.HCM","salary":"18 – 30 triệu","openings":2,"deadline":"30/06/2026","status":"ACTIVE","hot":True,
   "excerpt":"Xây dựng giao diện người dùng hiện đại cho hệ thống OMEGA ERP – đẹp, responsive, UX tối ưu.",
   "duties":["Phát triển SPA với Vue 3 / React cho các module ERP","Xây dựng component library, design system nội bộ","Tối ưu hiệu năng render và bundle size","Phối hợp Backend và UI/UX hoàn thiện sản phẩm","Viết unit test cho component"],
   "requirements":["2+ năm Vue.js hoặc React","Thành thạo HTML5, CSS3, JavaScript ES2020+","Có kinh nghiệm TypeScript là lợi thế","Hiểu REST API, Axios, state management (Pinia/Redux)","Portfolio dự án thực tế có thể xem được"],
   "benefits":["Lương cạnh tranh + review 2 lần/năm","Làm việc với product dùng thực bởi 1000+ doanh nghiệp","Đào tạo UX/UI và công nghệ frontend mới","Bảo hiểm sức khỏe, teambuilding, thưởng Tết"]},

  {"id":"J003","slug":"tuyen-dung-lap-trinh-vien-mobile","title":"Lập trình viên Mobile (React Native / Flutter)","dept":"Phòng Kỹ thuật","dept_slug":"ky-thuat","type":"Toàn thời gian","level":"Middle","location":"TP.HCM","salary":"18 – 28 triệu","openings":2,"deadline":"30/06/2026","status":"ACTIVE","hot":False,
   "excerpt":"Phát triển ứng dụng mobile cho hệ sinh thái OMEGA (APV, SCR, STK, SOR, MST, HRM App).",
   "duties":["Phát triển tính năng mới cho 6 ứng dụng mobile OMEGA","Tích hợp API với hệ thống ERP backend","Tối ưu hiệu năng trên iOS & Android","Debug, viết test, phát hành lên App Store / CH Play","Phối hợp team backend và UI/UX"],
   "requirements":["2+ năm React Native hoặc Flutter","Đã publish ít nhất 1 app lên store","Thành thạo RESTful API, push notification, offline-first","Có kinh nghiệm barcode/QR scanner là lợi thế","Biết Git, CI/CD cơ bản"],
   "benefits":["Lương cạnh tranh, review định kỳ","Làm việc trực tiếp trên sản phẩm 1000+ doanh nghiệp","Đào tạo kỹ thuật, hỗ trợ thi chứng chỉ","Bảo hiểm đầy đủ, thưởng dự án"]},

  {"id":"J004","slug":"tuyen-dung-ky-su-qa-testing","title":"Kỹ sư QA / Testing","dept":"Phòng Kỹ thuật","dept_slug":"ky-thuat","type":"Toàn thời gian","level":"Middle","location":"TP.HCM","salary":"15 – 22 triệu","openings":2,"deadline":"30/06/2026","status":"ACTIVE","hot":False,
   "excerpt":"Đảm bảo chất lượng sản phẩm OMEGA ERP – xây dựng test plan, viết test case, automation test.",
   "duties":["Phân tích yêu cầu, lập kế hoạch và thực hiện kiểm thử","Viết test case, test script cho từng phân hệ ERP","Xây dựng automation test (Selenium, Playwright hoặc Appium)","Báo cáo lỗi, theo dõi fix trong Jira","Kiểm thử hiệu năng, bảo mật, hồi quy"],
   "requirements":["1+ năm kinh nghiệm QA/Testing phần mềm","Kỹ năng viết test case rõ ràng, tư duy kiểm thử tốt","Biết automation test (Selenium/Playwright) là lợi thế","Có kiến thức cơ bản về SQL","Cẩn thận, tỉ mỉ, có trách nhiệm với chất lượng"],
   "benefits":["Lương + thưởng bug bounty","Đào tạo ISTQB, automation testing","Môi trường Agile phối hợp trực tiếp dev","Bảo hiểm sức khỏe, du lịch hàng năm"]},

  {"id":"J005","slug":"tuyen-dung-ky-su-devops","title":"Kỹ sư DevOps / Cloud","dept":"Phòng Kỹ thuật","dept_slug":"ky-thuat","type":"Toàn thời gian","level":"Senior","location":"TP.HCM","salary":"22 – 35 triệu","openings":1,"deadline":"30/06/2026","status":"ACTIVE","hot":True,
   "excerpt":"Xây dựng và vận hành hạ tầng cloud, CI/CD pipeline cho hệ thống OMEGA ERP.",
   "duties":["Quản lý hạ tầng cloud (AWS/Azure/GCP) cho ERP","Xây dựng và tối ưu CI/CD pipeline (GitLab CI, GitHub Actions)","Monitoring, alerting, on-call hạ tầng production","Containerization (Docker, Kubernetes)","Bảo mật hạ tầng, backup và disaster recovery"],
   "requirements":["3+ năm kinh nghiệm DevOps/SRE","Thành thạo Linux, Docker, Kubernetes","Kinh nghiệm với ít nhất 1 cloud provider (AWS ưu tiên)","Biết IaC (Terraform/Ansible)","Có chứng chỉ cloud là lợi thế"],
   "benefits":["Lương cạnh tranh, thưởng vận hành","Ngân sách cloud và tool hàng năm","Hỗ trợ thi chứng chỉ AWS/Azure","Bảo hiểm sức khỏe, làm việc hybrid"]},

  {"id":"J006","slug":"tuyen-dung-chuyen-gia-ai-automation","title":"Chuyên gia AI & Automation (ERP)","dept":"Phòng Kỹ thuật","dept_slug":"ky-thuat","type":"Toàn thời gian","level":"Senior","location":"TP.HCM","salary":"25 – 45 triệu","openings":1,"deadline":"30/06/2026","status":"ACTIVE","hot":True,
   "excerpt":"Nghiên cứu và tích hợp AI (LLM, Gemini, GPT) vào hệ sinh thái OMEGA ERP – tự động hóa quy trình quản trị.",
   "duties":["Prototype các tính năng AI cho ERP (chatbot, auto-fill, dự báo)","Tích hợp LLM API (Gemini, OpenAI, Anthropic) vào phân hệ ERP","Xây dựng AI agent tự động hóa quy trình kế toán, nhân sự","Đánh giá và tối ưu prompt engineering, RAG pipeline","Tư vấn kỹ thuật AI cho team triển khai và khách hàng"],
   "requirements":["3+ năm kinh nghiệm ML/AI hoặc backend với LLM integration","Thành thạo Python; kinh nghiệm LangChain/LlamaIndex","Hiểu biết về ERP / quản trị doanh nghiệp là lợi thế lớn","Portfolio dự án AI thực tế","Đọc hiểu tài liệu kỹ thuật tiếng Anh tốt"],
   "benefits":["Lương top-market, thưởng nghiên cứu","Ngân sách API token hàng tháng","Tham gia hội thảo AI trong và ngoài nước","Môi trường nghiên cứu tự do"]},

  {"id":"J007","slug":"tuyen-dung-chuyen-vien-tu-van-trien-khai-erp","title":"Chuyên viên Tư vấn Triển khai ERP","dept":"Phòng Triển khai","dept_slug":"trien-khai","type":"Toàn thời gian","level":"Middle – Senior","location":"TP.HCM (đi tỉnh theo dự án)","salary":"18 – 30 triệu","openings":4,"deadline":"30/06/2026","status":"ACTIVE","hot":True,
   "excerpt":"Tư vấn và triển khai hệ thống OMEGA ERP tại doanh nghiệp khách hàng – phân tích nghiệp vụ, cấu hình, đào tạo.",
   "duties":["Khảo sát, phân tích quy trình nghiệp vụ của khách hàng","Cấu hình và tùy chỉnh OMEGA ERP theo yêu cầu","Đào tạo người dùng cuối tại khách hàng","Hỗ trợ go-live và xử lý sự cố sau triển khai","Viết tài liệu hướng dẫn sử dụng, quy trình vận hành"],
   "requirements":["1+ năm kinh nghiệm triển khai ERP hoặc phần mềm quản lý","Hiểu biết nghiệp vụ kế toán, mua hàng, bán hàng, kho","Giao tiếp tốt, chịu được áp lực dự án","Sẵn sàng đi công tác tỉnh thành theo dự án","Tốt nghiệp ĐH Kế toán, QTKD, CNTT hoặc liên quan"],
   "benefits":["Lương + phụ cấp công tác","Đào tạo chuyên sâu toàn bộ hệ thống OMEGA ERP","Lộ trình thăng tiến lên Team Lead / PM","Bảo hiểm sức khỏe, du lịch hàng năm"]},

  {"id":"J008","slug":"tuyen-dung-chuyen-vien-trien-khai-ke-toan","title":"Chuyên viên Triển khai Kế toán (OMEGA.GL / FA / MC)","dept":"Phòng Triển khai","dept_slug":"trien-khai","type":"Toàn thời gian","level":"Middle","location":"TP.HCM","salary":"16 – 25 triệu","openings":3,"deadline":"30/06/2026","status":"ACTIVE","hot":False,
   "excerpt":"Triển khai phân hệ kế toán OMEGA cho doanh nghiệp – từ cấu hình hệ thống đến đào tạo kế toán viên.",
   "duties":["Cấu hình phân hệ GL, FA, MC, CL theo đặc thù khách hàng","Hỗ trợ nhập số dư đầu kỳ, kiểm tra số liệu","Đào tạo kế toán viên sử dụng hệ thống","Xử lý câu hỏi nghiệp vụ kế toán từ khách hàng","Viết hướng dẫn vận hành, tài liệu nghiệp vụ"],
   "requirements":["Tốt nghiệp ĐH Kế toán / Kiểm toán / Tài chính","1+ năm làm kế toán thực tế hoặc triển khai phần mềm kế toán","Hiểu chuẩn mực kế toán VN (VAS, TT200/133)","Kỹ năng Excel tốt","Có chứng chỉ kế toán (CPA, ACCA) là lợi thế"],
   "benefits":["Lương + phụ cấp dự án","Học nghiệp vụ kế toán từ nhiều ngành","Hỗ trợ thi chứng chỉ kế toán","Bảo hiểm sức khỏe, thưởng Tết"]},

  {"id":"J009","slug":"tuyen-dung-chuyen-vien-trien-khai-san-xuat","title":"Chuyên viên Triển khai Sản xuất (OMEGA.MM / PC / QC)","dept":"Phòng Triển khai","dept_slug":"trien-khai","type":"Toàn thời gian","level":"Middle","location":"TP.HCM (đi tỉnh theo dự án)","salary":"16 – 26 triệu","openings":2,"deadline":"30/06/2026","status":"ACTIVE","hot":False,
   "excerpt":"Triển khai phân hệ sản xuất OMEGA cho nhà máy – BOM, lệnh sản xuất, kế hoạch, kiểm soát chất lượng.",
   "duties":["Khảo sát quy trình sản xuất tại nhà máy khách hàng","Cấu hình MM (Sản xuất), PC (Giá thành), QC (Chất lượng)","Hướng dẫn nhập BOM, routing, lệnh sản xuất","Đào tạo người dùng nhà máy (quản đốc, kế hoạch, QC)","Xử lý yêu cầu đặc thù ngành"],
   "requirements":["Tốt nghiệp ĐH kỹ thuật, quản lý sản xuất hoặc kinh tế","Hiểu biết về quy trình sản xuất, MRP, BOM","Kinh nghiệm làm việc trong nhà máy là lợi thế","Sẵn sàng đi công tác tỉnh theo dự án","Chịu áp lực, làm việc nhóm tốt"],
   "benefits":["Lương + phụ cấp công tác hậu hĩnh","Tiếp xúc đa dạng ngành (nhựa, gỗ, thực phẩm, dệt may)","Đào tạo Lean, ISO, chứng chỉ sản xuất","Bảo hiểm đầy đủ, thưởng dự án"]},

  {"id":"J010","slug":"tuyen-dung-chuyen-vien-trien-khai-nhan-su","title":"Chuyên viên Triển khai Nhân sự (OMEGA.HR / PR)","dept":"Phòng Triển khai","dept_slug":"trien-khai","type":"Toàn thời gian","level":"Middle","location":"TP.HCM","salary":"15 – 24 triệu","openings":2,"deadline":"30/06/2026","status":"ACTIVE","hot":False,
   "excerpt":"Triển khai phân hệ nhân sự và tiền lương OMEGA cho doanh nghiệp – cấu hình, đào tạo và hỗ trợ sau go-live.",
   "duties":["Cấu hình phân hệ HR, Payroll theo đặc thù khách hàng","Hỗ trợ nhập dữ liệu nhân sự, thiết lập quy tắc tính lương","Đào tạo bộ phận HR, kế toán lương tại khách hàng","Xử lý câu hỏi về luật lao động, BHXH trong hệ thống","Viết tài liệu hướng dẫn sử dụng"],
   "requirements":["Tốt nghiệp ĐH QTKD, Luật lao động, Kinh tế hoặc CNTT","Hiểu Luật Lao động VN, BHXH, thuế TNCN","Kinh nghiệm HR/C&B hoặc phần mềm nhân sự là lợi thế","Kỹ năng Excel tốt, tỉ mỉ, cẩn thận","Giao tiếp tốt, thân thiện với người dùng"],
   "benefits":["Lương + thưởng dự án","Nắm vững pháp luật lao động qua thực tế","Môi trường chuyên nghiệp, teamwork tốt","Bảo hiểm sức khỏe, du lịch"]},

  {"id":"J011","slug":"tuyen-dung-business-analyst","title":"Business Analyst (ERP)","dept":"Phòng Triển khai","dept_slug":"trien-khai","type":"Toàn thời gian","level":"Middle – Senior","location":"TP.HCM","salary":"20 – 32 triệu","openings":2,"deadline":"30/06/2026","status":"ACTIVE","hot":True,
   "excerpt":"Phân tích nghiệp vụ, xây dựng tài liệu yêu cầu và cầu nối giữa khách hàng và team kỹ thuật OMEGA.",
   "duties":["Thu thập và phân tích yêu cầu nghiệp vụ từ doanh nghiệp khách hàng","Viết BRD, FRD, user story, use case cho các tính năng ERP","Làm cầu nối giữa khách hàng – triển khai – kỹ thuật","Tham gia UAT, hỗ trợ kiểm thử nghiệp vụ","Đề xuất cải tiến quy trình nghiệp vụ"],
   "requirements":["2+ năm kinh nghiệm BA, ưu tiên ERP / phần mềm doanh nghiệp","Hiểu biết tốt về quy trình kế toán, sản xuất hoặc nhân sự","Kỹ năng viết tài liệu rõ ràng, chuẩn mực","Thành thạo BPMN, flowchart, wireframe cơ bản","Tiếng Anh đọc hiểu kỹ thuật tốt"],
   "benefits":["Lương cạnh tranh + thưởng dự án","Tiếp xúc đa ngành từ F&B đến y tế, phân phối","Lộ trình phát triển lên PM hoặc Solution Architect","Bảo hiểm sức khỏe, đào tạo chứng chỉ CBAP/PMI"]},

  {"id":"J012","slug":"tuyen-dung-chuyen-vien-dao-tao-erp","title":"Chuyên viên Đào tạo ERP","dept":"Phòng Triển khai","dept_slug":"trien-khai","type":"Toàn thời gian","level":"Junior – Middle","location":"TP.HCM (đi tỉnh theo lịch)","salary":"13 – 20 triệu","openings":2,"deadline":"30/06/2026","status":"ACTIVE","hot":False,
   "excerpt":"Thiết kế và thực hiện chương trình đào tạo OMEGA ERP cho người dùng cuối tại doanh nghiệp.",
   "duties":["Soạn giáo trình, slide, video hướng dẫn sử dụng ERP","Đào tạo trực tiếp và trực tuyến tại khách hàng","Xây dựng ngân hàng câu hỏi, bài kiểm tra sau đào tạo","Cập nhật tài liệu khi có phiên bản phần mềm mới","Hỗ trợ người dùng giai đoạn sau go-live"],
   "requirements":["Kỹ năng trình bày, giảng dạy tốt","Hiểu biết cơ bản về kế toán hoặc sản xuất","Thành thạo PowerPoint, Word, Canva","Sẵn sàng đi tỉnh theo lịch đào tạo","Tốt nghiệp ĐH bất kỳ ngành"],
   "benefits":["Lương + phụ cấp đào tạo","Học được nghiệp vụ ERP toàn diện","Kỹ năng thuyết trình được rèn giũa liên tục","Bảo hiểm, thưởng Tết"]},

  {"id":"J013","slug":"tuyen-dung-truong-nhom-trien-khai","title":"Trưởng nhóm Triển khai ERP","dept":"Phòng Triển khai","dept_slug":"trien-khai","type":"Toàn thời gian","level":"Leader","location":"TP.HCM","salary":"25 – 40 triệu","openings":1,"deadline":"30/06/2026","status":"ACTIVE","hot":False,
   "excerpt":"Dẫn dắt nhóm triển khai ERP – quản lý dự án, đảm bảo chất lượng và tiến độ giao hàng.",
   "duties":["Lập kế hoạch và quản lý tiến độ dự án ERP","Phân công và giám sát công việc nhóm triển khai","Giải quyết trực tiếp các vấn đề nghiệp vụ phức tạp","Báo cáo tiến độ cho khách hàng và ban lãnh đạo","Cải tiến quy trình và phương pháp triển khai"],
   "requirements":["3+ năm kinh nghiệm triển khai ERP, 1+ năm quản lý nhóm","Hiểu biết sâu ít nhất 2 phân hệ ERP","Kỹ năng lập kế hoạch dự án, quản lý rủi ro","Kỹ năng lãnh đạo, coaching team","Chứng chỉ PMP / PRINCE2 là lợi thế"],
   "benefits":["Lương + bonus KPI dự án","Quyền phê duyệt ngân sách nhóm","Cơ hội phát triển lên PM / Phó GĐ Dịch vụ","Bảo hiểm sức khỏe cao cấp, xe công tác"]},

  {"id":"J014","slug":"tuyen-dung-chuyen-vien-kinh-doanh","title":"Chuyên viên Kinh doanh (ERP Software)","dept":"Phòng Kinh doanh","dept_slug":"kinh-doanh","type":"Toàn thời gian","level":"Junior – Middle","location":"TP.HCM","salary":"10 – 15 triệu + hoa hồng không giới hạn","openings":5,"deadline":"30/06/2026","status":"ACTIVE","hot":True,
   "excerpt":"Tìm kiếm và phát triển khách hàng doanh nghiệp cho hệ thống ERP OMEGA – thu nhập không giới hạn.",
   "duties":["Tìm kiếm, tiếp cận và tư vấn doanh nghiệp về phần mềm ERP","Demo sản phẩm, xây dựng đề xuất giải pháp phù hợp","Đàm phán hợp đồng và chốt deal","Chăm sóc, duy trì quan hệ khách hàng","Phối hợp team triển khai bàn giao dự án"],
   "requirements":["1+ năm kinh nghiệm bán hàng B2B (phần mềm/dịch vụ là lợi thế lớn)","Kỹ năng giao tiếp, thuyết trình, đàm phán tốt","Chịu được áp lực KPI doanh số","Có xe máy, sẵn sàng gặp khách hàng ngoài văn phòng","Tốt nghiệp ĐH bất kỳ chuyên ngành"],
   "benefits":["Lương cứng + hoa hồng (thu nhập 20–50tr+/tháng nếu đạt KPI)","Đào tạo bán hàng và kiến thức ERP bài bản","Cơ hội thăng tiến nhanh lên Team Lead / Trưởng phòng","Bảo hiểm đầy đủ, teambuilding hàng quý"]},

  {"id":"J015","slug":"tuyen-dung-chuyen-vien-phat-trien-thi-truong","title":"Chuyên viên Phát triển Thị trường","dept":"Phòng Kinh doanh","dept_slug":"kinh-doanh","type":"Toàn thời gian","level":"Middle","location":"TP.HCM / Hà Nội","salary":"15 – 25 triệu + hoa hồng","openings":2,"deadline":"30/06/2026","status":"ACTIVE","hot":False,
   "excerpt":"Mở rộng thị trường cho OMEGA ERP tại các ngành mục tiêu và khu vực địa lý mới.",
   "duties":["Nghiên cứu và phân tích thị trường, xác định cơ hội tiềm năng","Xây dựng kế hoạch tiếp cận ngành và khu vực mới","Phát triển mạng lưới đối tác, đại lý","Phối hợp marketing tổ chức sự kiện, hội thảo ngành","Báo cáo phân tích thị trường hàng quý"],
   "requirements":["2+ năm kinh nghiệm phát triển thị trường B2B","Có mạng lưới quan hệ doanh nghiệp trong một ngành cụ thể là lợi thế","Kỹ năng phân tích, lập kế hoạch chiến lược","Thuyết trình tốt, làm việc độc lập và theo nhóm"],
   "benefits":["Lương + hoa hồng + phụ cấp di chuyển","Ngân sách phát triển thị trường","Cơ hội đi công tác trong và ngoài nước","Bảo hiểm sức khỏe cao cấp"]},

  {"id":"J016","slug":"tuyen-dung-chuyen-vien-digital-marketing","title":"Chuyên viên Digital Marketing","dept":"Phòng Kinh doanh","dept_slug":"kinh-doanh","type":"Toàn thời gian","level":"Middle","location":"TP.HCM","salary":"15 – 22 triệu","openings":1,"deadline":"30/06/2026","status":"ACTIVE","hot":True,
   "excerpt":"Triển khai chiến lược marketing số cho OMEGA ERP – tăng nhận diện thương hiệu và tạo lead chất lượng.",
   "duties":["Lập kế hoạch và triển khai chiến dịch Google Ads, Meta Ads","Quản lý fanpage Facebook, LinkedIn, YouTube OMEGA","Phân tích dữ liệu GA4, tối ưu conversion rate","Phối hợp content team tạo nội dung marketing","Email marketing, nurturing lead theo phễu"],
   "requirements":["2+ năm kinh nghiệm Digital Marketing B2B","Thành thạo Google Ads, Meta Ads, Google Analytics 4","Kinh nghiệm marketing phần mềm / SaaS là lợi thế lớn","Kỹ năng phân tích số liệu, tư duy data-driven","Tiếng Anh đọc hiểu marketing tốt"],
   "benefits":["Ngân sách quảng cáo lớn để học hỏi và thử nghiệm","Môi trường sáng tạo, ít báo cáo thủ công","Review lương 2 lần/năm","Bảo hiểm sức khỏe, du lịch hàng năm"]},

  {"id":"J017","slug":"tuyen-dung-chuyen-vien-seo-content","title":"Chuyên viên SEO Content","dept":"Phòng Kinh doanh","dept_slug":"kinh-doanh","type":"Toàn thời gian","level":"Junior – Middle","location":"TP.HCM","salary":"12 – 18 triệu","openings":2,"deadline":"30/06/2026","status":"ACTIVE","hot":False,
   "excerpt":"Tạo nội dung SEO chất lượng cao cho omega.com.vn – tăng organic traffic từ doanh nghiệp quan tâm đến ERP.",
   "duties":["Nghiên cứu từ khóa, xây dựng kế hoạch nội dung hàng tháng","Viết bài SEO về ERP, kế toán, quản trị doanh nghiệp","Tối ưu on-page SEO, internal linking","Theo dõi ranking, phân tích traffic và cải thiện","Phối hợp thiết kế tạo infographic, ảnh minh họa"],
   "requirements":["1+ năm kinh nghiệm SEO Content","Kỹ năng viết tiếng Việt tốt, diễn đạt rõ ràng","Hiểu biết cơ bản về kế toán, quản trị doanh nghiệp","Biết sử dụng Ahrefs/SEMrush, Google Search Console","Kiên nhẫn, bám sát KPI traffic"],
   "benefits":["Môi trường học SEO thực chiến với domain uy tín","Không áp lực bán hàng, tập trung chất lượng nội dung","Đào tạo kiến thức ERP để viết chuyên sâu","Bảo hiểm, thưởng khi đạt KPI"]},

  {"id":"J018","slug":"tuyen-dung-chuyen-vien-pre-sales","title":"Chuyên viên Pre-Sales ERP","dept":"Phòng Kinh doanh","dept_slug":"kinh-doanh","type":"Toàn thời gian","level":"Senior","location":"TP.HCM","salary":"22 – 35 triệu","openings":2,"deadline":"30/06/2026","status":"ACTIVE","hot":True,
   "excerpt":"Demo sản phẩm, tư vấn giải pháp và hỗ trợ đội kinh doanh chốt deal ERP cho doanh nghiệp.",
   "duties":["Chuẩn bị và thực hiện demo ERP cho khách hàng tiềm năng","Phân tích yêu cầu sơ bộ, đề xuất giải pháp phù hợp","Viết đề xuất kỹ thuật, SOW, báo giá","Hỗ trợ trả lời RFP/RFQ từ doanh nghiệp lớn","Đào tạo kỹ năng demo cho đội kinh doanh"],
   "requirements":["3+ năm kinh nghiệm triển khai ERP hoặc pre-sales phần mềm","Hiểu biết sâu ít nhất 2 phân hệ ERP","Kỹ năng trình bày, thuyết phục xuất sắc","Tiếng Anh giao tiếp tốt (có khách hàng FDI)","Nắm bắt nhanh yêu cầu nghiệp vụ đa ngành"],
   "benefits":["Lương cạnh tranh + bonus deal","Tiếp xúc C-level nhiều ngành khác nhau","Lộ trình lên Solution Architect hoặc Sales Director","Bảo hiểm sức khỏe cao cấp"]},

  {"id":"J019","slug":"tuyen-dung-chuyen-vien-ho-tro-ky-thuat","title":"Chuyên viên Hỗ trợ Kỹ thuật (Helpdesk ERP)","dept":"Phòng Hỗ trợ","dept_slug":"ho-tro","type":"Toàn thời gian","level":"Junior – Middle","location":"TP.HCM","salary":"12 – 18 triệu","openings":3,"deadline":"30/06/2026","status":"ACTIVE","hot":False,
   "excerpt":"Hỗ trợ kỹ thuật cho 1000+ doanh nghiệp đang sử dụng OMEGA ERP – xử lý ticket, debug, hướng dẫn vận hành.",
   "duties":["Tiếp nhận và xử lý yêu cầu hỗ trợ kỹ thuật từ khách hàng","Phân loại, ưu tiên và escalate ticket theo quy trình","Debug lỗi ứng dụng, hướng dẫn khắc phục","Cập nhật knowledge base, FAQ","Hỗ trợ qua điện thoại, email, Zalo, TeamViewer"],
   "requirements":["Tốt nghiệp CĐ/ĐH CNTT hoặc liên quan","Hiểu biết cơ bản về phần mềm kế toán / ERP","Kỹ năng giao tiếp điện thoại tốt, kiên nhẫn","Biết SQL cơ bản để kiểm tra dữ liệu là lợi thế","Tư duy logic, xử lý vấn đề tốt"],
   "benefits":["Làm việc giờ hành chính, không ca đêm","Học kiến thức ERP toàn diện từ thực tế","Môi trường team vui vẻ, chuyên nghiệp","Bảo hiểm đầy đủ, thưởng Tết"]},

  {"id":"J020","slug":"tuyen-dung-chuyen-vien-ho-tro-nghiep-vu","title":"Chuyên viên Hỗ trợ Nghiệp vụ","dept":"Phòng Hỗ trợ","dept_slug":"ho-tro","type":"Toàn thời gian","level":"Junior – Middle","location":"TP.HCM","salary":"12 – 18 triệu","openings":2,"deadline":"30/06/2026","status":"ACTIVE","hot":False,
   "excerpt":"Hỗ trợ khách hàng về nghiệp vụ kế toán, nhân sự, sản xuất trong quá trình vận hành OMEGA ERP.",
   "duties":["Tư vấn nghiệp vụ kế toán, thuế, nhân sự qua hệ thống ERP","Hướng dẫn xử lý tình huống nghiệp vụ phát sinh","Cập nhật quy định pháp luật vào tài liệu hướng dẫn","Phối hợp team triển khai xử lý yêu cầu nâng cấp","Tổng hợp phản hồi khách hàng để cải tiến sản phẩm"],
   "requirements":["Tốt nghiệp ĐH Kế toán/Kinh tế hoặc liên quan","Hiểu TT133 hoặc TT200, luật thuế, BHXH","Kỹ năng giao tiếp, viết hướng dẫn rõ ràng","Kiên nhẫn, tận tâm với khách hàng","Kinh nghiệm làm kế toán thực tế là lợi thế lớn"],
   "benefits":["Học nghiệp vụ từ hàng trăm khách hàng đa ngành","Không áp lực doanh số","Môi trường chuyên nghiệp, đội nhóm hỗ trợ tốt","Bảo hiểm sức khỏe, thưởng Tết"]},

  {"id":"J021","slug":"tuyen-dung-chuyen-vien-cham-soc-khach-hang","title":"Chuyên viên Chăm sóc Khách hàng","dept":"Phòng Hỗ trợ","dept_slug":"ho-tro","type":"Toàn thời gian","level":"Junior","location":"TP.HCM","salary":"10 – 15 triệu","openings":2,"deadline":"30/06/2026","status":"ACTIVE","hot":False,
   "excerpt":"Chăm sóc và duy trì mối quan hệ khách hàng đang sử dụng OMEGA ERP – tăng retention và upsell dịch vụ.",
   "duties":["Chủ động gọi điện, email chăm sóc khách hàng định kỳ","Thu thập phản hồi, đánh giá mức độ hài lòng","Phối hợp xử lý khiếu nại, đảm bảo trải nghiệm tốt","Tư vấn gia hạn bảo trì, nâng cấp phần mềm","Cập nhật thông tin khách hàng vào CRM"],
   "requirements":["Tốt nghiệp ĐH bất kỳ ngành","Kỹ năng giao tiếp điện thoại và email tốt","Thái độ tích cực, lấy khách hàng làm trung tâm","Chịu được áp lực và thích nghi nhanh","Biết CRM phần mềm là lợi thế"],
   "benefits":["Môi trường thân thiện, teamwork tốt","Đào tạo kỹ năng CSKH chuyên nghiệp","Cơ hội phát triển lên senior CSKH hoặc kinh doanh","Bảo hiểm, thưởng chỉ tiêu"]},

  {"id":"J022","slug":"tuyen-dung-quan-ly-du-an-erp","title":"Quản lý Dự án ERP (Project Manager)","dept":"Phòng Quản lý","dept_slug":"quan-ly","type":"Toàn thời gian","level":"Manager","location":"TP.HCM","salary":"28 – 45 triệu","openings":2,"deadline":"30/06/2026","status":"ACTIVE","hot":True,
   "excerpt":"Quản lý end-to-end dự án triển khai ERP cho doanh nghiệp – từ kick-off đến go-live và bàn giao.",
   "duties":["Lập kế hoạch, theo dõi tiến độ và quản lý ngân sách dự án","Điều phối nguồn lực nội bộ và bên khách hàng","Quản lý rủi ro và xử lý thay đổi phạm vi dự án","Báo cáo tiến độ cho ban giám đốc và C-level khách hàng","Đảm bảo chất lượng và sự hài lòng của khách hàng"],
   "requirements":["4+ năm kinh nghiệm quản lý dự án phần mềm, ưu tiên ERP","Chứng chỉ PMP / PRINCE2 là bắt buộc (hoặc cam kết thi 6 tháng)","Hiểu biết sâu về triển khai ERP ở ít nhất 1 ngành","Kỹ năng lãnh đạo, đàm phán, xử lý xung đột","Tiếng Anh giao tiếp tốt"],
   "benefits":["Lương + bonus hoàn thành dự án","Ngân sách đào tạo và chứng chỉ","Xe công tác, điện thoại công ty","Bảo hiểm sức khỏe cao cấp"]},

  {"id":"J023","slug":"tuyen-dung-truong-nhom-phat-trien","title":"Trưởng nhóm Phát triển (Dev Team Lead)","dept":"Phòng Quản lý","dept_slug":"quan-ly","type":"Toàn thời gian","level":"Lead","location":"TP.HCM","salary":"30 – 50 triệu","openings":1,"deadline":"30/06/2026","status":"ACTIVE","hot":True,
   "excerpt":"Dẫn dắt team kỹ thuật phát triển sản phẩm OMEGA ERP – technical leadership, kiến trúc hệ thống, chất lượng code.",
   "duties":["Dẫn dắt team 8–15 kỹ sư (backend/frontend/mobile/QA)","Thiết kế kiến trúc, phê duyệt technical decision","Code review, mentoring developer","Lập kế hoạch sprint, phối hợp PM và BA","Nghiên cứu công nghệ mới, định hướng tech stack"],
   "requirements":["5+ năm kinh nghiệm lập trình, 2+ năm tech lead","Thành thạo .NET/Node.js và SQL Server","Hiểu DDD, clean architecture, microservices","Kinh nghiệm Agile/Scrum, Jira","Kỹ năng lãnh đạo, coaching team"],
   "benefits":["Lương top-market + profit sharing","Toàn quyền về tech stack và quyết định kỹ thuật","Ngân sách hiring, tool, cloud","Bảo hiểm sức khỏe cao cấp cho gia đình"]},

  {"id":"J024","slug":"tuyen-dung-truong-phong-kinh-doanh","title":"Trưởng phòng Kinh doanh","dept":"Phòng Quản lý","dept_slug":"quan-ly","type":"Toàn thời gian","level":"Manager","location":"TP.HCM","salary":"30 – 50 triệu + hoa hồng nhóm","openings":1,"deadline":"30/06/2026","status":"ACTIVE","hot":False,
   "excerpt":"Lãnh đạo phòng kinh doanh OMEGA – chiến lược bán hàng, phát triển đội nhóm, đạt KPI doanh thu.",
   "duties":["Xây dựng chiến lược kinh doanh B2B phần mềm ERP","Quản lý và phát triển đội ngũ 10–15 chuyên viên kinh doanh","Thiết lập và theo dõi KPI doanh thu, pipeline","Trực tiếp tham gia deal lớn, đàm phán hợp đồng","Phối hợp marketing, pre-sales, triển khai"],
   "requirements":["5+ năm kinh nghiệm kinh doanh B2B, 2+ năm quản lý team","Kinh nghiệm bán phần mềm / SaaS / ERP","Kỹ năng lãnh đạo, xây dựng đội nhóm","Tư duy chiến lược và phân tích dữ liệu bán hàng","Mạng lưới quan hệ doanh nghiệp rộng"],
   "benefits":["Lương cứng + hoa hồng cá nhân + nhóm (thu nhập không giới hạn)","Xe công tác, điện thoại, ngân sách tiếp khách","ESOP theo lộ trình","Bảo hiểm sức khỏe cao cấp, du lịch nước ngoài"]},

  {"id":"J025","slug":"tuyen-dung-truong-phong-ky-thuat","title":"Trưởng phòng Kỹ thuật (CTO / VP Engineering)","dept":"Phòng Quản lý","dept_slug":"quan-ly","type":"Toàn thời gian","level":"Director","location":"TP.HCM","salary":"40 – 65 triệu","openings":1,"deadline":"30/06/2026","status":"ACTIVE","hot":False,
   "excerpt":"Định hướng công nghệ và lãnh đạo toàn bộ phòng kỹ thuật OMEGA – sản phẩm ERP phục vụ 1000+ doanh nghiệp.",
   "duties":["Định hướng chiến lược công nghệ và roadmap sản phẩm dài hạn","Quản lý 20–30 kỹ sư (backend, frontend, mobile, QA, DevOps)","Đảm bảo chất lượng, bảo mật và hiệu năng hệ thống","Phối hợp CEO và C-level về đầu tư công nghệ","Xây dựng văn hóa kỹ thuật và quy trình engineering"],
   "requirements":["8+ năm kinh nghiệm kỹ thuật phần mềm, 3+ năm Tech Director/VP Eng","Kinh nghiệm phần mềm doanh nghiệp quy mô lớn","Tầm nhìn chiến lược công nghệ 3–5 năm","Kỹ năng lãnh đạo, thu hút và giữ chân nhân tài kỹ thuật","Tiếng Anh thành thạo"],
   "benefits":["Lương top-market + equity","Toàn quyền quyết định công nghệ và hiring","Ngân sách R&D riêng","Bảo hiểm cao cấp, cổ phần công ty"]},

  {"id":"J026","slug":"tuyen-dung-ke-toan-tong-hop","title":"Kế toán Tổng hợp","dept":"Phòng Hành chính","dept_slug":"hanh-chinh","type":"Toàn thời gian","level":"Junior – Middle","location":"TP.HCM","salary":"12 – 18 triệu","openings":1,"deadline":"30/06/2026","status":"ACTIVE","hot":False,
   "excerpt":"Đảm nhận công tác kế toán nội bộ của Công ty TNHH Công nghệ và Giải pháp Omega.",
   "duties":["Thực hiện nghiệp vụ kế toán tổng hợp, định khoản chứng từ","Lập báo cáo tài chính định kỳ (tháng/quý/năm)","Kê khai và quyết toán thuế (GTGT, TNCN, TNDN)","Theo dõi công nợ phải thu, phải trả","Phối hợp kiểm toán nội bộ và bên ngoài"],
   "requirements":["Tốt nghiệp ĐH Kế toán / Kiểm toán / Tài chính","1+ năm kinh nghiệm kế toán tổng hợp","Hiểu TT200, luật thuế hiện hành","Thành thạo Excel; biết OMEGA ERP hoặc MISA là lợi thế lớn","Tỉ mỉ, cẩn thận, bảo mật thông tin tốt"],
   "benefits":["Dùng OMEGA ERP thực tế, hiểu sản phẩm mình hỗ trợ","Môi trường công ty công nghệ trẻ, chuyên nghiệp","Bảo hiểm đầy đủ, thưởng Tết hàng năm","Review lương theo năng lực"]},

  {"id":"J027","slug":"tuyen-dung-nhan-vien-hanh-chinh-nhan-su","title":"Nhân viên Hành chính – Nhân sự","dept":"Phòng Hành chính","dept_slug":"hanh-chinh","type":"Toàn thời gian","level":"Junior","location":"TP.HCM","salary":"10 – 14 triệu","openings":1,"deadline":"30/06/2026","status":"ACTIVE","hot":False,
   "excerpt":"Hỗ trợ công tác hành chính tổng hợp và nhân sự tại Công ty TNHH Công nghệ và Giải pháp Omega.",
   "duties":["Thực hiện công việc hành chính: văn thư, lưu trữ, mua sắm VP","Hỗ trợ tuyển dụng: đăng tin, sàng lọc hồ sơ, sắp xếp phỏng vấn","Theo dõi chấm công, nghỉ phép, làm thêm giờ","Thực hiện thủ tục BHXH, BHYT cho nhân viên","Tổ chức sự kiện nội bộ, sinh nhật, teambuilding"],
   "requirements":["Thành thạo Word, Excel, email công việc","Tháo vát, năng động, thân thiện","Có kinh nghiệm hành chính / nhân sự là lợi thế","Sống tại TP.HCM","Tốt nghiệp ĐH bất kỳ ngành"],
   "benefits":["Môi trường trẻ, vui vẻ, teamwork tốt","Học hỏi toàn bộ quy trình HR trong công ty công nghệ","Bảo hiểm đầy đủ, thưởng Tết","Giờ làm việc linh hoạt"]},

  {"id":"J028","slug":"tuyen-dung-chuyen-vien-tuyen-dung-noi-bo","title":"Chuyên viên Tuyển dụng Nội bộ","dept":"Phòng Hành chính","dept_slug":"hanh-chinh","type":"Toàn thời gian","level":"Middle","location":"TP.HCM","salary":"14 – 20 triệu","openings":1,"deadline":"30/06/2026","status":"ACTIVE","hot":False,
   "excerpt":"Chịu trách nhiệm tuyển dụng nhân sự chất lượng cao cho Omega – IT, triển khai, kinh doanh và hành chính.",
   "duties":["Lập kế hoạch tuyển dụng theo nhu cầu các phòng ban","Đăng tin, tìm kiếm ứng viên qua LinkedIn, TopCV, JobStreet","Sàng lọc hồ sơ, phỏng vấn sơ bộ, tư vấn ứng viên","Phối hợp quản lý phỏng vấn chuyên sâu","Quản lý quy trình onboarding nhân viên mới"],
   "requirements":["2+ năm kinh nghiệm tuyển dụng, ưu tiên tuyển IT / tech","Có mạng lưới ứng viên CNTT, ERP là lợi thế lớn","Kỹ năng headhunting, khai thác LinkedIn Recruiter","Giao tiếp tốt, tạo thiện cảm với ứng viên","Sử dụng ATS/CRM tuyển dụng thành thạo"],
   "benefits":["Bonus tuyển dụng thành công","Ngân sách job posting và headhunting","Môi trường HR chuyên nghiệp, đào tạo liên tục","Bảo hiểm sức khỏe, du lịch hàng năm"]},

  {"id":"J029","slug":"tuyen-dung-chuyen-vien-thiet-ke-ui-ux","title":"Chuyên viên Thiết kế UI/UX","dept":"Phòng Thiết kế","dept_slug":"thiet-ke","type":"Toàn thời gian","level":"Middle","location":"TP.HCM","salary":"18 – 28 triệu","openings":1,"deadline":"30/06/2026","status":"ACTIVE","hot":True,
   "excerpt":"Thiết kế giao diện người dùng cho OMEGA ERP và ứng dụng mobile – UX thông minh, UI sạch đẹp.",
   "duties":["Nghiên cứu UX, phân tích hành vi người dùng ERP","Thiết kế wireframe, prototype bằng Figma","Xây dựng design system và component library","Phối hợp developer đảm bảo UI triển khai đúng thiết kế","Thiết kế UI cho cả web app và mobile app"],
   "requirements":["2+ năm kinh nghiệm UI/UX Design","Thành thạo Figma, hiểu Design System","Portfolio thực tế có thể xem được (web app / enterprise app)","Kinh nghiệm ERP / phần mềm doanh nghiệp là lợi thế lớn","Hiểu HTML/CSS cơ bản để phối hợp developer"],
   "benefits":["Làm việc trên sản phẩm 1000+ doanh nghiệp dùng thực","Ngân sách tool design (Figma, Maze, Hotjar)","Môi trường sáng tạo, ý kiến thiết kế được trân trọng","Bảo hiểm sức khỏe, review lương 2 lần/năm"]},

  {"id":"J030","slug":"tuyen-dung-chuyen-vien-thiet-ke-do-hoa","title":"Chuyên viên Thiết kế Đồ họa","dept":"Phòng Thiết kế","dept_slug":"thiet-ke","type":"Toàn thời gian","level":"Junior – Middle","location":"TP.HCM","salary":"12 – 20 triệu","openings":1,"deadline":"30/06/2026","status":"ACTIVE","hot":False,
   "excerpt":"Thiết kế ấn phẩm truyền thông, marketing và thương hiệu cho OMEGA – từ digital đến print.",
   "duties":["Thiết kế ấn phẩm marketing: banner, brochure, social media post","Thiết kế nội dung website, email marketing, landing page","Tạo infographic, icon, illustration cho tài liệu ERP","Hỗ trợ dựng video ngắn, motion graphic","Đảm bảo nhất quán nhận diện thương hiệu OMEGA"],
   "requirements":["1+ năm kinh nghiệm thiết kế đồ họa","Thành thạo Adobe Illustrator, Photoshop; After Effects là lợi thế","Portfolio đa dạng (digital + print)","Mắt thẩm mỹ tốt, nắm xu hướng thiết kế","Làm việc theo deadline, chịu được feedback nhiều vòng"],
   "benefits":["Môi trường sáng tạo, không ép template cứng nhắc","Ngân sách Adobe CC, Canva Pro","Cơ hội làm branding cho thương hiệu ERP uy tín","Bảo hiểm, thưởng Tết"]},
]

DEPTS = [
  ("ky-thuat","Phòng Kỹ thuật","fa-code"),
  ("trien-khai","Phòng Triển khai","fa-rocket"),
  ("kinh-doanh","Phòng Kinh doanh","fa-handshake"),
  ("ho-tro","Phòng Hỗ trợ","fa-headset"),
  ("quan-ly","Phòng Quản lý","fa-sitemap"),
  ("hanh-chinh","Phòng Hành chính","fa-building"),
  ("thiet-ke","Phòng Thiết kế","fa-palette"),
]

# ─── COMMON HTML BLOCKS ───────────────────────────────────────────────────────
ANALYTICS = """  <!-- GA4 -->\n  <script async src="https://www.googletagmanager.com/gtag/js?id=G-W36R80L8Y2"></script>\n  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-W36R80L8Y2');</script>\n  <!-- Clarity -->\n  <script>(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","w5st3jx7zo");</script>"""

PRELOADER_CSS = """<style>.preloader{position:fixed;inset:0;z-index:99999;background:#0d5c38;display:flex;align-items:center;justify-content:center;transition:opacity .6s ease,visibility .6s ease;}.preloader.hide{opacity:0;visibility:hidden;pointer-events:none;}.preloader-inner{display:flex;flex-direction:column;align-items:center;gap:16px;}.preloader-logo{width:120px;animation:pulse-logo 2s ease-in-out infinite;}@keyframes pulse-logo{0%,100%{opacity:1;transform:scale(1);}50%{opacity:.7;transform:scale(.95);}}</style>"""

CSS_JOB = """    .job-meta-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px;margin:20px 0;}
    .jm-item{background:#f8fbf8;border-radius:10px;padding:12px 16px;border:1px solid #e0ede0;}
    .jm-label{font-size:11px;text-transform:uppercase;letter-spacing:.6px;color:#888;font-weight:700;margin-bottom:4px;}
    .jm-value{font-size:14px;font-weight:600;color:#0d1b2a;}
    .job-section h2{font-size:18px;font-weight:700;color:#0d1b2a;padding-left:12px;border-left:4px solid #00A651;margin:28px 0 14px;}
    .job-section ul{padding-left:20px;}.job-section li{margin-bottom:6px;font-size:15px;line-height:1.7;}
    .apply-sidebar{position:sticky;top:100px;}.apply-card{background:#fff;border-radius:14px;box-shadow:0 4px 20px rgba(0,166,81,.12);padding:24px;border:1px solid #e0f0e8;}
    .salary-big{font-size:22px;font-weight:800;color:#00A651;margin:8px 0;}
    .hero-hiring{width:100%;border-radius:16px;overflow:hidden;margin-bottom:32px;background:#0d5c38;}
    .hero-hiring img{width:100%;height:auto;display:block;}
    body{overflow-x:clip!important;}"""


def _navbar():
    return """  <header class="main-header">
    <div class="header-sticky">
      <nav class="navbar navbar-expand-lg">
        <div class="container-fluid px-4">
          <a class="navbar-brand" href="../index.html"><img src="../assets/images/omega-5A-rect-trans-name.png" alt="Omega ERP Logo" class="logo-default"><img src="../assets/images/omega-5A-rect-trans-name.png" alt="Omega ERP Logo" class="logo-sticky" style="display:none"></a>
          <div class="collapse navbar-collapse main-menu" id="navbarNav">
            <div class="nav-menu-wrapper mx-auto">
              <ul class="navbar-nav" id="menu">
                <li class="nav-item submenu"><a class="nav-link" href="../ve-omega.html">Về Omega</a><ul><li><a class="nav-link" href="../ve-omega.html#dinh-vi">Định vị &amp; Năng lực</a></li><li><a class="nav-link" href="../ve-omega.html#tam-nhin">Tầm nhìn &amp; Sứ mệnh</a></li><li><a class="nav-link" href="../ve-omega.html#gia-tri">Giá trị cốt lõi</a></li><li><a class="nav-link" href="../ve-omega.html#doi-ngu">Đội ngũ nhân sự</a></li></ul></li>
                <li class="nav-item submenu"><a class="nav-link" href="../giai-phap.html">Giải pháp</a><ul><li><a class="nav-link" href="../giai-phap/giai-phap-nganh-nhua.html">Ngành nhựa</a></li><li><a class="nav-link" href="../giai-phap/giai-phap-nganh-go-noi-that.html">Ngành gỗ – Nội thất</a></li><li><a class="nav-link" href="../giai-phap/giai-phap-nganh-fb.html">Ngành F&amp;B</a></li><li><a class="nav-link" href="../giai-phap/giai-phap-nganh-fmcg.html">Ngành FMCG</a></li><li><a class="nav-link" href="../giai-phap/giai-phap-nganh-thuy-san.html">Thủy – hải sản</a></li><li><a class="nav-link" href="../giai-phap/giai-phap-nganh-y-te.html">Thiết bị y tế</a></li><li><a class="nav-link" href="../giai-phap/giai-phap-nganh-thoi-trang.html">Ngành thời trang</a></li><li><a class="nav-link" href="../giai-phap/giai-phap-nganh-phan-phoi.html">Phân phối – Bán sỉ</a></li></ul></li>
                <li class="nav-item"><a class="nav-link" href="../san-pham.html">Sản phẩm</a></li>
                <li class="nav-item"><a class="nav-link" href="../dich-vu.html">Dịch vụ</a></li>
                <li class="nav-item"><a class="nav-link" href="../khach-hang.html">Khách hàng</a></li>
                <li class="nav-item submenu"><a class="nav-link active" href="../tin-tuc.html">Tin tức</a><ul><li><a class="nav-link" href="../tin-tuc.html?cat=chuyen-doi-so#chuyen-doi-so">Chuyển đổi số</a></li><li><a class="nav-link" href="../tin-tuc.html?cat=erp-quan-tri#erp-quan-tri">ERP – Quản trị</a></li><li><a class="nav-link" href="../tin-tuc.html?cat=ke-toan-tai-chinh#ke-toan-tai-chinh">Kế toán – Tài chính</a></li><li><a class="nav-link" href="../tin-tuc.html?cat=su-kien#su-kien">Sự kiện</a></li><li><a class="nav-link active" href="../tin-tuc.html?cat=tuyen-dung#tuyen-dung">Tuyển dụng</a></li></ul></li>
                <li class="nav-item"><a class="nav-link" href="../lien-he.html">Liên hệ</a></li>
              </ul>
            </div>
            <div class="header-btn ms-3"><a class="btn-default" href="../lien-he.html">Tư vấn miễn phí</a></div>
          </div>
          <div class="navbar-toggle" id="mobileToggle"><span></span><span></span><span></span></div>
        </div>
      </nav>
      <div class="responsive-menu container-fluid px-4"></div>
    </div>
  </header>"""


def _footer():
    return """  <footer class="main-footer">
    <div class="footer-top"><div class="container"><div class="row gy-4">
      <div class="col-lg-4"><div class="footer-brand"><img src="../assets/images/omega-4B-rect-trans-full.png" alt="Omega ERP" onerror="this.src='../assets/images/omega-5A-rect-trans-name.png'"></div><p class="footer-desc">Omega – Đồng hành cùng doanh nghiệp trên hành trình chuyển đổi số với các giải pháp ERP toàn diện, thực chất và hiệu quả.</p><div class="footer-social"><a href="https://zalo.me/908303609" target="_blank"><i class="fa-solid fa-comment-dots"></i></a><a href="https://www.facebook.com/PhanMemQuanTriDoanhNghiepOMEGAERP/"><i class="fa-brands fa-facebook-f"></i></a><a href="https://www.youtube.com/@omegaerp9461"><i class="fa-brands fa-youtube"></i></a></div></div>
      <div class="col-6 col-lg-2"><h4 class="footer-heading">Sản phẩm</h4><ul class="footer-links"><li><a href="../san-pham/software-omega-erp.html">OMEGA.ERP</a></li><li><a href="../san-pham/software-omega-gl.html">OMEGA.GL</a></li><li><a href="../san-pham/software-omega-hr.html">OMEGA.HR</a></li><li><a href="../san-pham/software-omega-mm.html">OMEGA.MM</a></li><li><a href="../san-pham/software-omega-crm.html">OMEGA.CRM</a></li><li><a href="../san-pham/software-omega-smb.html">GAMA.SMB</a></li></ul></div>
      <div class="col-6 col-lg-2"><h4 class="footer-heading">Giải pháp</h4><ul class="footer-links"><li><a href="../giai-phap/giai-phap-nganh-fb.html">Ngành F&amp;B</a></li><li><a href="../giai-phap/giai-phap-nganh-nhua.html">Ngành Nhựa</a></li><li><a href="../giai-phap/giai-phap-nganh-go-noi-that.html">Gỗ – Nội thất</a></li><li><a href="../giai-phap/giai-phap-nganh-fmcg.html">FMCG</a></li><li><a href="../giai-phap/giai-phap-nganh-thuy-san.html">Thủy – Hải sản</a></li><li><a href="../giai-phap/giai-phap-nganh-y-te.html">Thiết bị y tế</a></li></ul></div>
      <div class="col-6 col-lg-2"><h4 class="footer-heading">Dịch vụ</h4><ul class="footer-links"><li><a href="../dich-vu.html#tu-van">Tư vấn triển khai</a></li><li><a href="../dich-vu.html#dao-tao">Đào tạo &amp; Hỗ trợ</a></li><li><a href="../dich-vu.html#bao-tri">Bảo trì &amp; Nâng cấp</a></li><li><a href="../dich-vu.html#quy-trinh">Quy trình triển khai</a></li></ul></div>
      <div class="col-6 col-lg-2"><h4 class="footer-heading">Công ty</h4><ul class="footer-links"><li><a href="../ve-omega.html">Về Omega</a></li><li><a href="../khach-hang.html">Khách hàng</a></li><li><a href="../tin-tuc.html">Tin tức</a></li><li><a href="tuyen-dung-omega.html">Tuyển dụng</a></li><li><a href="../lien-he.html">Liên hệ</a></li></ul></div>
      <div class="col-12"><div class="footer-contact-item"><h3 style="color:#00A651;">CÔNG TY TNHH CÔNG NGHỆ &amp; GIẢI PHÁP OMEGA</h3></div><div class="footer-contact-item"><i class="fa-solid fa-city"></i><span style="color:rgba(255,255,255,0.6);">Lầu 6 - Tòa nhà Hà Sơn, số 277A Nguyễn Văn Đậu, TP.HCM</span></div><div class="footer-contact-row"><a href="tel:02835128448" class="fcr-item"><i class="fa-solid fa-phone"></i>028 3512 8448</a><span class="fcr-item"><i class="fa-solid fa-fax"></i>Fax: 028 3514 7280</span><a href="mailto:info@omega.com.vn" class="fcr-item"><i class="fa-solid fa-envelope"></i>info@omega.com.vn</a><a href="https://zalo.me/0908303609" class="fcr-item"><i class="fa-solid fa-mobile"></i>0908 303 609</a></div></div>
    </div></div></div>
    <div class="footer-bottom"><div class="container"><div class="footer-bottom-inner"><p class="footer-copy footer-copy-legal"><span class="footer-copy-lname">Công ty TNHH Công nghệ và Giải pháp Omega</span><span class="footer-copy-lyr">© 2009–<script>document.write(new Date().getFullYear())</script>. All rights reserved.</span></p><p class="footer-copy"><a href="../chinh-sach-bao-mat.html">Chính sách bảo mật</a></p></div></div></div>
  </footer>"""


def _scripts():
    return """  <script src="../assets/js/jquery-3.7.1.min.js"></script>
  <script src="../assets/js/bootstrap.min.js"></script>
  <script src="../assets/js/wow.min.js"></script>
  <script src="../assets/js/jquery.slicknav.js"></script>
  <script src="../assets/js/jquery.magnific-popup.min.js"></script>
  <script src="../assets/js/swiper-bundle.min.js"></script>
  <script src="../assets/js/omega.js"></script>"""


def _apply_modal():
    return """  <div class="modal fade" id="applyModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header" style="background:#0d5c38;color:#fff;">
          <h5 class="modal-title"><i class="fa-solid fa-paper-plane me-2"></i>Ứng tuyển: <span id="modal-job-title"></span></h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <div id="apply-msg" class="alert d-none mb-3"></div>
          <form id="apply-form" novalidate>
            <input type="hidden" id="af-job-id" name="job_id">
            <input type="hidden" id="af-job-title" name="job_title">
            <input type="text" name="website_omega" style="display:none!important;" tabindex="-1" autocomplete="off">
            <div class="row g-3">
              <div class="col-md-6"><label class="form-label fw-semibold">Họ và tên <span class="text-danger">*</span></label><input type="text" name="full_name" class="form-control" placeholder="Nguyễn Văn A" required maxlength="100"></div>
              <div class="col-md-6"><label class="form-label fw-semibold">Email <span class="text-danger">*</span></label><input type="email" name="email" class="form-control" placeholder="email@example.com" required maxlength="150"></div>
              <div class="col-md-6"><label class="form-label fw-semibold">Số điện thoại <span class="text-danger">*</span></label><input type="tel" name="phone" class="form-control" placeholder="0909 xxx xxx" required maxlength="20"></div>
              <div class="col-md-6"><label class="form-label fw-semibold">Link CV (Google Drive / LinkedIn)</label><input type="url" name="cv_link" class="form-control" placeholder="https://drive.google.com/..."></div>
              <div class="col-12"><label class="form-label fw-semibold">Hoặc dán nội dung CV / Giới thiệu bản thân</label><textarea name="cv_text" class="form-control" rows="5" placeholder="Tóm tắt kinh nghiệm, kỹ năng, thành tích của bạn..."></textarea></div>
            </div>
            <div class="mt-3 p-3 rounded" style="background:#f8fbf8;border:1px solid #d4edda;"><small class="text-muted"><i class="fa-solid fa-robot me-1" style="color:#00A651;"></i><strong>AI CV Scoring:</strong> Hệ thống tự đánh giá độ phù hợp CV và gửi phản hồi về email trong vòng 24 giờ.</small></div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Đóng</button>
          <button type="button" class="btn btn-success px-4" id="apply-submit-btn" onclick="submitApply()"><i class="fa-solid fa-paper-plane me-2"></i>Gửi hồ sơ</button>
        </div>
      </div>
    </div>
  </div>"""


APPLY_JS = """  <script>
  const GAS_URL = ''; // TODO: paste Apps Script deployment URL after deploying tuyen-dung.gs
  function openApply(jobId, jobTitle) {
    document.getElementById('af-job-id').value = jobId;
    document.getElementById('af-job-title').value = jobTitle;
    document.getElementById('modal-job-title').textContent = jobTitle;
    document.getElementById('apply-msg').className = 'alert d-none mb-3';
    document.getElementById('apply-form').reset();
    document.getElementById('af-job-id').value = jobId;
    document.getElementById('af-job-title').value = jobTitle;
    new bootstrap.Modal(document.getElementById('applyModal')).show();
  }
  async function submitApply() {
    const form = document.getElementById('apply-form');
    const msg  = document.getElementById('apply-msg');
    const btn  = document.getElementById('apply-submit-btn');
    const fd   = new FormData(form);
    const data = Object.fromEntries(fd.entries());
    if (!data.full_name || !data.email || !data.phone) {
      msg.className = 'alert alert-warning mb-3'; msg.textContent = 'Vui lòng điền đủ họ tên, email và số điện thoại.'; return;
    }
    if (!data.cv_link && !data.cv_text) {
      msg.className = 'alert alert-warning mb-3'; msg.textContent = 'Vui lòng cung cấp link CV hoặc nội dung giới thiệu bản thân.'; return;
    }
    if (!GAS_URL) {
      msg.className = 'alert alert-info mb-3'; msg.innerHTML = 'Hệ thống đang cập nhật. Vui lòng gửi CV về <strong>hr@omega.com.vn</strong> hoặc liên hệ 0908 303 609.'; return;
    }
    btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin me-2"></i>Đang gửi...';
    try {
      data.action = 'apply';
      const res  = await fetch(GAS_URL, {method:'POST', body:JSON.stringify(data), headers:{'Content-Type':'application/json'}});
      const json = await res.json();
      if (json.success) {
        msg.className = 'alert alert-success mb-3';
        msg.innerHTML = '<i class="fa-solid fa-check-circle me-2"></i>' + (json.message || 'Hồ sơ đã gửi thành công! Chúng tôi sẽ liên hệ bạn sớm.');
        form.reset();
      } else {
        msg.className = 'alert alert-danger mb-3'; msg.textContent = json.message || 'Có lỗi xảy ra. Vui lòng thử lại.';
      }
    } catch(e) {
      msg.className = 'alert alert-danger mb-3'; msg.textContent = 'Không kết nối được. Vui lòng gửi CV về hr@omega.com.vn.';
    }
    btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-paper-plane me-2"></i>Gửi hồ sơ';
  }
  async function loadJobStatus(jobId) {
    if (!GAS_URL) return;
    try {
      const res  = await fetch(GAS_URL + '?action=job&id=' + jobId);
      const data = await res.json();
      const job  = data.job || data;
      const badge = document.getElementById('job-status-badge');
      if (badge && job.status) {
        const map = {ACTIVE:{cls:'bg-success',l:'Đang tuyển'},HOT:{cls:'bg-danger',l:'Tuyển gấp'},CLOSED:{cls:'bg-secondary',l:'Đã đóng'}};
        const s = map[job.status] || map.ACTIVE;
        badge.className = 'badge rounded-pill ' + s.cls; badge.textContent = s.l;
      }
      const applyBtn = document.getElementById('main-apply-btn');
      if (applyBtn && job.status === 'CLOSED') {
        applyBtn.disabled = true; applyBtn.innerHTML = '<i class="fa-solid fa-lock me-2"></i>Vị trí đã đóng';
        applyBtn.className = 'btn btn-secondary btn-lg w-100';
      }
      const cntEl = document.getElementById('apply-count');
      if (cntEl && job.apply_count != null) cntEl.textContent = job.apply_count;
    } catch(e) {}
  }
  </script>"""


# ─── HELPERS ──────────────────────────────────────────────────────────────────
def _status_badge(j):
    if j['status'] == 'CLOSED':
        return '<span class="badge rounded-pill bg-secondary" id="job-status-badge">Đã đóng</span>'
    elif j['hot']:
        return '<span class="badge rounded-pill bg-danger" id="job-status-badge">Tuyển gấp</span>'
    else:
        return '<span class="badge rounded-pill bg-success" id="job-status-badge">Đang tuyển</span>'


def _ul(lst):
    return ''.join(f'<li>{x}</li>' for x in lst)


# ─── JOB PAGE ─────────────────────────────────────────────────────────────────
def job_page(j):
    jid   = j['id']
    title = j['title']
    slug  = j['slug']
    closed = j['status'] == 'CLOSED'
    ab_cls = 'btn-secondary disabled' if closed else 'btn-success'
    ab_lbl = 'Đã đóng tuyển dụng' if closed else 'Ứng tuyển ngay'
    ab_ico = 'fa-lock' if closed else 'fa-paper-plane'
    hot_badge = "<span class='badge rounded-pill ms-1' style='background:#fff3cd;color:#856404;border:1px solid #ffc107;'>🔥 HOT</span>" if j['hot'] and not closed else ''
    can_apply = '' if closed else f"onclick=\"openApply('{jid}','{title.replace(chr(39), chr(92)+chr(39))}')\""
    cta_apply = '' if closed else f"onclick=\"openApply('{jid}','{title.replace(chr(39), chr(92)+chr(39))}')\""

    return f"""<!DOCTYPE html>
<html lang="vi" prefix="og: https://ogp.me/ns#">
<head>
{ANALYTICS}
{PRELOADER_CSS}
  <meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>[Tuyển dụng] {title} – Omega | omega.com.vn</title>
  <meta name="description" content="{j['excerpt']}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="https://omega.com.vn/tin-tuc/{slug}.html">
  <meta property="og:type" content="article"><meta property="og:locale" content="vi_VN"><meta property="og:site_name" content="OMEGA ERP">
  <meta property="og:title" content="[Tuyển dụng] {title} – Omega">
  <meta property="og:description" content="{j['excerpt']}">
  <meta property="og:url" content="https://omega.com.vn/tin-tuc/{slug}.html">
  <meta property="og:image" content="https://omega.com.vn/tin-tuc/tuyen-dung/omega-we-are-hiring_W1024.webp">
  <link rel="icon" type="image/x-icon" href="../assets/images/favicon.ico">
  <link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../assets/css/bootstrap.min.css">
  <link rel="stylesheet" href="../assets/css/all.min.css">
  <link rel="stylesheet" href="../assets/css/animate.css">
  <link rel="stylesheet" href="../assets/css/swiper-bundle.min.css">
  <link rel="stylesheet" href="../assets/css/slicknav.min.css">
  <link rel="stylesheet" href="../assets/css/magnific-popup.css">
  <link rel="stylesheet" href="../assets/css/omega.css">
  <style>{CSS_JOB}</style>
</head>
<body>
  <div class="preloader"><div class="preloader-inner"><img src="../assets/images/omega-radar-sonar.svg" alt="Omega" class="preloader-logo"></div></div>
{_navbar()}
  <section class="page-header" style="padding:56px 0;"><div class="page-header-overlay"></div><div class="container"><nav aria-label="breadcrumb"><ol class="breadcrumb mb-0"><li class="breadcrumb-item"><a href="../index.html">Trang chủ</a></li><li class="breadcrumb-item"><a href="../tin-tuc.html">Tin tức</a></li><li class="breadcrumb-item"><a href="tuyen-dung-omega.html">Tuyển dụng</a></li><li class="breadcrumb-item active">{title}</li></ol></nav></div></section>

  <section class="section-gap" style="padding-top:40px;">
    <div class="container">
      <div class="row g-4 g-lg-5">
        <div class="col-lg-8">
          <div class="hero-hiring"><img src="tuyen-dung/omega-we-are-hiring_W1024.webp" alt="OMEGA We Are Hiring" loading="eager" onerror="this.parentNode.style.minHeight='100px'"></div>
          <div class="d-flex flex-wrap align-items-center gap-2 mb-3">
            <span class="article-category-badge" style="background:rgba(0,166,81,.1);color:#00A651;">Tuyển dụng</span>
            {_status_badge(j)}{hot_badge}
          </div>
          <h1 style="font-size:clamp(20px,3vw,30px);font-weight:800;color:#0d1b2a;margin-bottom:12px;">{title}</h1>
          <p style="font-size:15px;color:#555;line-height:1.8;margin-bottom:4px;">{j['excerpt']}</p>
          <div class="job-meta-grid">
            <div class="jm-item"><div class="jm-label"><i class="fa-solid fa-building me-1" style="color:#00A651;"></i>Phòng ban</div><div class="jm-value">{j['dept']}</div></div>
            <div class="jm-item"><div class="jm-label"><i class="fa-solid fa-briefcase me-1" style="color:#00A651;"></i>Loại hình</div><div class="jm-value">{j['type']}</div></div>
            <div class="jm-item"><div class="jm-label"><i class="fa-solid fa-chart-line me-1" style="color:#00A651;"></i>Cấp bậc</div><div class="jm-value">{j['level']}</div></div>
            <div class="jm-item"><div class="jm-label"><i class="fa-solid fa-location-dot me-1" style="color:#00A651;"></i>Địa điểm</div><div class="jm-value">{j['location']}</div></div>
            <div class="jm-item"><div class="jm-label"><i class="fa-solid fa-money-bill-wave me-1" style="color:#00A651;"></i>Mức lương</div><div class="jm-value">{j['salary']}</div></div>
            <div class="jm-item"><div class="jm-label"><i class="fa-solid fa-users me-1" style="color:#00A651;"></i>Số lượng</div><div class="jm-value">{j['openings']} người</div></div>
            <div class="jm-item"><div class="jm-label"><i class="fa-regular fa-calendar me-1" style="color:#00A651;"></i>Hạn nộp</div><div class="jm-value">{j['deadline']}</div></div>
            <div class="jm-item"><div class="jm-label"><i class="fa-solid fa-file-lines me-1" style="color:#00A651;"></i>Số hồ sơ đã nộp</div><div class="jm-value"><span id="apply-count">–</span></div></div>
          </div>
          <div class="job-section"><h2><i class="fa-solid fa-list-check me-2"></i>Mô tả công việc</h2><ul>{_ul(j['duties'])}</ul></div>
          <div class="job-section"><h2><i class="fa-solid fa-user-check me-2"></i>Yêu cầu ứng viên</h2><ul>{_ul(j['requirements'])}</ul></div>
          <div class="job-section"><h2><i class="fa-solid fa-gift me-2"></i>Quyền lợi</h2><ul>{_ul(j['benefits'])}</ul></div>
          <div class="job-section"><h2><i class="fa-solid fa-building-user me-2"></i>Về Omega</h2><p style="font-size:15px;line-height:1.8;color:#444;">Công ty TNHH Công nghệ và Giải pháp Omega là nhà cung cấp phần mềm ERP hàng đầu Việt Nam với <strong>16+ năm kinh nghiệm</strong> và <strong>1000+ doanh nghiệp</strong> tin dùng. Chúng tôi cam kết đồng hành cùng nhân viên phát triển sự nghiệp bền vững.</p></div>
          <div style="margin-top:24px;padding-top:20px;border-top:1px solid #eee;display:flex;align-items:center;gap:16px;flex-wrap:wrap;">
            <a href="tuyen-dung-omega.html" style="color:#00A651;font-weight:600;font-size:14px;"><i class="fa-solid fa-arrow-left me-2"></i>Xem tất cả vị trí</a>
            <button class="btn btn-success btn-sm px-4" {can_apply}><i class="fa-solid fa-paper-plane me-2"></i>Ứng tuyển ngay</button>
          </div>
        </div>
        <div class="col-lg-4">
          <div class="apply-sidebar">
            <div class="apply-card mb-4">
              <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:#888;margin-bottom:6px;">Mức lương</div>
              <div class="salary-big">{j['salary']}</div>
              <div style="font-size:13px;color:#666;margin-bottom:20px;">{j['type']} &nbsp;|&nbsp; {j['location'].split(' (')[0]}</div>
              <button class="btn {ab_cls} btn-lg w-100 mb-3" id="main-apply-btn" {"disabled" if closed else ""} {can_apply}><i class="fa-solid {ab_ico} me-2"></i>{ab_lbl}</button>
              <a href="../lien-he.html" class="btn btn-outline-success w-100 mb-3"><i class="fa-solid fa-phone me-2"></i>Liên hệ tư vấn</a>
              <hr>
              <div style="font-size:13px;color:#666;line-height:2;">
                <div><i class="fa-solid fa-calendar-check me-2" style="color:#00A651;width:18px;"></i>Hạn nộp: <strong>{j['deadline']}</strong></div>
                <div><i class="fa-solid fa-users me-2" style="color:#00A651;width:18px;"></i>Số lượng: <strong>{j['openings']} người</strong></div>
                <div><i class="fa-solid fa-chart-bar me-2" style="color:#00A651;width:18px;"></i>Cấp bậc: <strong>{j['level']}</strong></div>
                <div><i class="fa-solid fa-envelope me-2" style="color:#00A651;width:18px;"></i><strong>hr@omega.com.vn</strong></div>
              </div>
            </div>
            <div class="apply-card">
              <div style="font-size:13px;font-weight:700;color:#0d1b2a;margin-bottom:12px;"><i class="fa-solid fa-share-nodes me-2" style="color:#00A651;"></i>Chia sẻ tin tuyển dụng</div>
              <a href="https://www.facebook.com/sharer/sharer.php?u=https://omega.com.vn/tin-tuc/{slug}.html" target="_blank" class="btn btn-sm w-100 mb-2" style="background:#1877F2;color:#fff;"><i class="fa-brands fa-facebook-f me-2"></i>Facebook</a>
              <button class="btn btn-sm btn-outline-secondary w-100" onclick="navigator.clipboard.writeText(location.href);this.textContent='✓ Đã sao chép';setTimeout(()=>this.textContent='Sao chép link',2000)">Sao chép link</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="cta-section"><div class="container position-relative" style="z-index:1;"><div class="row align-items-center gy-4"><div class="col-lg-7"><div class="section-title mb-0"><h2 style="color:#fff;font-size:clamp(20px,3vw,34px);">Cùng nhau <strong>xây dựng</strong><br>tương lai với OMEGA?</h2><p style="color:rgba(255,255,255,0.85);">Gửi hồ sơ ngay và trở thành một phần của đội ngũ 16+ năm xây dựng ERP Việt.</p></div></div><div class="col-lg-5 text-lg-end"><button class="btn-white-omega me-3" {cta_apply}><i class="fa-solid fa-paper-plane"></i> Ứng tuyển ngay</button><a href="tuyen-dung-omega.html" class="btn-red-omega"><i class="fa-solid fa-briefcase"></i> Việc làm khác</a></div></div></div></section>

{_footer()}
{_apply_modal()}
{_scripts()}
{APPLY_JS}
  <script>document.addEventListener('DOMContentLoaded',function(){{loadJobStatus('{jid}');}});</script>
</body>
</html>"""


# ─── LISTING PAGE ─────────────────────────────────────────────────────────────
def listing_page(jobs, depts):
    total_active = sum(1 for j in jobs if j['status'] != 'CLOSED')
    dept_counts  = {}
    for j in jobs:
        dept_counts[j['dept_slug']] = dept_counts.get(j['dept_slug'], 0) + 1

    # Cards
    cards = ''
    for j in jobs:
        closed = j['status'] == 'CLOSED'
        if closed:
            badge = '<span class="badge bg-secondary rounded-pill ms-1">Đã đóng</span>'
        elif j['hot']:
            badge = '<span class="badge bg-danger rounded-pill ms-1">HOT</span>'
        else:
            badge = '<span class="badge bg-success rounded-pill ms-1">Mở</span>'
        safe_title = j['title'].replace("'", "\\'")
        apply_btn = f"<button class='btn btn-sm btn-success flex-fill' onclick=\"openApply('{j['id']}','{safe_title}')\">Ứng tuyển</button>" if not closed else "<button class='btn btn-sm btn-secondary flex-fill' disabled>Đã đóng</button>"
        cards += f"""        <div class="col" data-dept="{j['dept_slug']}" data-job-id="{j['id']}">
          <div class="td-card h-100 d-flex flex-column" style="background:#fff;border-radius:14px;border:1px solid #e0ede0;padding:20px;box-shadow:0 3px 14px rgba(0,0,0,.06);transition:transform .25s,box-shadow .25s;">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <span class="badge rounded-pill" style="background:rgba(0,166,81,.1);color:#00A651;font-size:11px;">{j['dept']}</span>
              <span id="td-badge-{j['id']}">{badge}</span>
            </div>
            <h3 style="font-size:15px;font-weight:700;color:#0d1b2a;line-height:1.5;flex:1;margin-bottom:10px;"><a href="{j['slug']}.html" style="color:inherit;text-decoration:none;">{j['title']}</a></h3>
            <div style="font-size:12px;color:#777;margin-bottom:10px;display:flex;flex-wrap:wrap;gap:8px;">
              <span><i class="fa-solid fa-location-dot me-1" style="color:#00A651;"></i>{j['location'].split(' (')[0]}</span>
              <span><i class="fa-solid fa-money-bill-wave me-1" style="color:#00A651;"></i>{j['salary']}</span>
            </div>
            <p style="font-size:13px;color:#666;line-height:1.6;margin-bottom:14px;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;">{j['excerpt']}</p>
            <div class="d-flex gap-2 mt-auto">
              <a href="{j['slug']}.html" class="btn btn-sm btn-outline-success flex-fill">Xem chi tiết</a>
              {apply_btn}
            </div>
          </div>
        </div>
"""

    # Filter tabs
    tabs = '<button class="filter-tab active" data-filter="all">Tất cả <span class="badge bg-success ms-1">' + str(total_active) + '</span></button>\n'
    for ds, dn, _di in depts:
        cnt = dept_counts.get(ds, 0)
        if cnt:
            tabs += f'        <button class="filter-tab" data-filter="{ds}">{dn} <span class="badge bg-secondary ms-1">{cnt}</span></button>\n'

    return f"""<!DOCTYPE html>
<html lang="vi" prefix="og: https://ogp.me/ns#">
<head>
{ANALYTICS}
{PRELOADER_CSS}
  <meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>Tuyển dụng OMEGA ERP 2026 – Cơ hội nghề nghiệp | omega.com.vn</title>
  <meta name="description" content="OMEGA ERP tuyển dụng {total_active} vị trí: Kỹ thuật, Triển khai ERP, Kinh doanh, Hỗ trợ, Thiết kế. Lương cạnh tranh, môi trường Agile, 16+ năm uy tín.">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="https://omega.com.vn/tin-tuc/tuyen-dung-omega.html">
  <meta property="og:type" content="website"><meta property="og:locale" content="vi_VN"><meta property="og:site_name" content="OMEGA ERP">
  <meta property="og:title" content="Tuyển dụng OMEGA ERP 2026 – {total_active} vị trí đang mở">
  <meta property="og:description" content="OMEGA tuyển nhân tài: Kỹ thuật, Triển khai ERP, Kinh doanh, UI/UX. Lương cạnh tranh, môi trường Agile.">
  <meta property="og:url" content="https://omega.com.vn/tin-tuc/tuyen-dung-omega.html">
  <meta property="og:image" content="https://omega.com.vn/tin-tuc/tuyen-dung/omega-we-are-hiring_W1024.webp">
  <link rel="icon" type="image/x-icon" href="../assets/images/favicon.ico">
  <link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../assets/css/bootstrap.min.css">
  <link rel="stylesheet" href="../assets/css/all.min.css">
  <link rel="stylesheet" href="../assets/css/animate.css">
  <link rel="stylesheet" href="../assets/css/swiper-bundle.min.css">
  <link rel="stylesheet" href="../assets/css/slicknav.min.css">
  <link rel="stylesheet" href="../assets/css/magnific-popup.css">
  <link rel="stylesheet" href="../assets/css/omega.css">
  <style>
    body{{overflow-x:clip!important;}}
    .hero-hiring{{width:100%;overflow:hidden;background:#0d5c38;}}
    .hero-hiring img{{width:100%;max-height:460px;object-fit:cover;display:block;}}
    .filter-tabs{{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:28px;}}
    .filter-tab{{padding:6px 16px;border-radius:50px;border:1.5px solid #e0ede0;background:#fff;font-size:13px;font-weight:600;cursor:pointer;transition:.2s;color:#444;}}
    .filter-tab:hover,.filter-tab.active{{background:#00A651;border-color:#00A651;color:#fff;}}
    .filter-tab.active .badge{{background:#fff!important;color:#00A651!important;}}
    .stat-box{{background:#fff;border-radius:12px;padding:20px;text-align:center;box-shadow:0 3px 14px rgba(0,0,0,.06);}}
    .stat-num{{font-size:32px;font-weight:800;color:#00A651;}}
    .stat-label{{font-size:13px;color:#666;margin-top:4px;}}
    .td-card:hover{{transform:translateY(-4px);box-shadow:0 8px 28px rgba(0,166,81,.14)!important;}}
  </style>
</head>
<body>
  <div class="preloader"><div class="preloader-inner"><img src="../assets/images/omega-radar-sonar.svg" alt="Omega" class="preloader-logo"></div></div>
{_navbar()}
  <div class="hero-hiring"><img src="tuyen-dung/omega-we-are-hiring_W1024.webp" alt="OMEGA We Are Hiring" loading="eager" onerror="this.parentNode.style.minHeight='200px';this.style.display='none'"></div>

  <section class="section-gap" style="padding-top:48px;">
    <div class="container">
      <div class="row g-3 mb-5">
        <div class="col-6 col-md-3"><div class="stat-box wow fadeInUp"><div class="stat-num">{total_active}+</div><div class="stat-label">Vị trí đang mở</div></div></div>
        <div class="col-6 col-md-3"><div class="stat-box wow fadeInUp" data-wow-delay=".08s"><div class="stat-num">16+</div><div class="stat-label">Năm kinh nghiệm</div></div></div>
        <div class="col-6 col-md-3"><div class="stat-box wow fadeInUp" data-wow-delay=".16s"><div class="stat-num">1000+</div><div class="stat-label">Doanh nghiệp dùng ERP</div></div></div>
        <div class="col-6 col-md-3"><div class="stat-box wow fadeInUp" data-wow-delay=".24s"><div class="stat-num">7</div><div class="stat-label">Phòng ban tuyển dụng</div></div></div>
      </div>
      <div class="section-title text-center mb-4 wow fadeInUp">
        <span class="section-label">Cơ hội nghề nghiệp</span>
        <h2>Gia nhập đội ngũ <span style="color:#00A651;">OMEGA</span></h2>
        <p class="mt-2" style="max-width:600px;margin:0 auto;color:#666;font-size:15px;">Tìm kiếm những người tài năng, nhiệt huyết cùng xây dựng nền tảng ERP Việt Nam vươn tầm.</p>
      </div>
      <div class="filter-tabs">
        {tabs}
      </div>
      <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
{cards}
      </div>
    </div>
  </section>

  <section class="cta-section" style="margin-top:60px;"><div class="container position-relative" style="z-index:1;"><div class="row align-items-center gy-4"><div class="col-lg-7 wow fadeInLeft"><div class="section-title mb-0"><h2 style="color:#fff;font-size:clamp(20px,3vw,34px);">Không thấy vị trí <strong>phù hợp?</strong></h2><p style="color:rgba(255,255,255,0.85);">Gửi CV và thư giới thiệu về <strong>hr@omega.com.vn</strong> – chúng tôi sẽ liên hệ khi có vị trí phù hợp.</p></div></div><div class="col-lg-5 text-lg-end wow fadeInRight"><a href="mailto:hr@omega.com.vn" class="btn-white-omega me-3"><i class="fa-solid fa-envelope"></i> Gửi CV tự do</a><a href="../lien-he.html" class="btn-red-omega"><i class="fa-solid fa-phone"></i> Liên hệ HR</a></div></div></div></section>

{_footer()}
{_apply_modal()}
{_scripts()}
{APPLY_JS}
  <script>
  document.querySelectorAll('.filter-tab').forEach(btn => {{
    btn.addEventListener('click', function() {{
      document.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      const f = this.dataset.filter;
      document.querySelectorAll('.col[data-dept]').forEach(col => {{
        col.style.display = (f === 'all' || col.dataset.dept === f) ? '' : 'none';
      }});
    }});
  }});
  async function loadAllStatus() {{
    if (!GAS_URL) return;
    try {{
      const res  = await fetch(GAS_URL + '?action=jobs');
      const data = await res.json();
      if (!data || !data.jobs) return;
      const map = {{}};
      data.jobs.forEach(j => {{ map[j.id] = j; }});
      document.querySelectorAll('[id^="td-badge-"]').forEach(el => {{
        const jid = el.id.replace('td-badge-', '');
        if (!map[jid]) return;
        const s = map[jid].status, hot = map[jid].hot;
        if (s === 'CLOSED') el.innerHTML = '<span class="badge bg-secondary rounded-pill ms-1">Đã đóng</span>';
        else if (hot) el.innerHTML = '<span class="badge bg-danger rounded-pill ms-1">HOT</span>';
        else el.innerHTML = '<span class="badge bg-success rounded-pill ms-1">Mở</span>';
      }});
    }} catch(e) {{}}
  }}
  document.addEventListener('DOMContentLoaded', loadAllStatus);
  </script>
</body>
</html>"""


# ─── MAIN ─────────────────────────────────────────────────────────────────────
def main():
    import json as J

    os.makedirs(JOBS_JSON_DIR, exist_ok=True)

    # 30 individual job pages
    for j in JOBS:
        path = os.path.join(TINTUC, j['slug'] + '.html')
        with open(path, 'w', encoding='utf-8') as f:
            f.write(job_page(j))
        print(f'  OK  {j["slug"]}.html')

    # Master listing page
    with open(os.path.join(TINTUC, 'tuyen-dung-omega.html'), 'w', encoding='utf-8') as f:
        f.write(listing_page(JOBS, DEPTS))
    print('  OK  tuyen-dung-omega.html')

    # jobs-data.json
    jobs_json = [{k: j[k] for k in ('id','slug','title','dept','dept_slug','type','level','location','salary','openings','deadline','status','hot','excerpt')} for j in JOBS]
    with open(os.path.join(JOBS_JSON_DIR, 'jobs-data.json'), 'w', encoding='utf-8') as f:
        J.dump(jobs_json, f, ensure_ascii=False, indent=2)
    print(f'  OK  tuyen-dung/jobs-data.json  ({len(jobs_json)} vị trí)')

    # Update news-data.json
    with open(NEWS_JSON, 'r', encoding='utf-8') as f:
        news = J.load(f)
    max_id = max(int(x['id']) for x in news)
    new_entries = [{
        "id": str(max_id + 1),
        "slug": "tuyen-dung-omega",
        "title": "Tuyển dụng OMEGA ERP 2026 – Cơ hội nghề nghiệp tại công ty ERP hàng đầu Việt Nam",
        "category": "tuyen-dung", "published_date": GEN_DATE, "author": "OMEGA HR", "read_time": "3 phút đọc",
        "excerpt": "OMEGA tuyển dụng 30 vị trí đang mở: Kỹ thuật, Triển khai ERP, Kinh doanh, Hỗ trợ và Thiết kế. Môi trường Agile, lương cạnh tranh.",
        "tags": "tuyển dụng, việc làm IT, ERP, Omega ERP",
        "seo_title": "Tuyển dụng OMEGA ERP 2026 – 30 vị trí đang mở",
        "seo_desc": "OMEGA ERP tuyển dụng: lập trình viên .NET/Vue.js, chuyên viên triển khai ERP, kinh doanh, UI/UX. Lương cạnh tranh, môi trường chuyên nghiệp.",
        "is_featured": True, "cover_image": "tin-tuc/tuyen-dung/omega-we-are-hiring_W1024.webp"
    }]
    for i, j in enumerate(JOBS):
        new_entries.append({
            "id": str(max_id + 2 + i), "slug": j['slug'],
            "title": f"[Tuyển dụng] {j['title']}", "category": "tuyen-dung",
            "published_date": GEN_DATE, "author": "OMEGA HR", "read_time": "2 phút đọc",
            "excerpt": j['excerpt'], "tags": f"tuyển dụng, {j['dept']}, Omega ERP",
            "seo_title": f"[Tuyển dụng] {j['title']} – OMEGA ERP", "seo_desc": j['excerpt'],
            "is_featured": False, "cover_image": "tin-tuc/tuyen-dung/omega-we-are-hiring_W1024.webp"
        })
    news.extend(new_entries)
    with open(NEWS_JSON, 'w', encoding='utf-8') as f:
        J.dump(news, f, ensure_ascii=False, indent=2)
    print(f'  OK  news-data.json  (+{len(new_entries)} entries, total {len(news)})')
    print(f'\nHoàn tất: 31 HTML + 1 JSON + news-data updated')


if __name__ == '__main__':
    main()
